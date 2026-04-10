const prisma = require('../lib/prisma');
const openai = require('../lib/openai');

/**
 * Get all workouts with pagination
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function getWorkouts(req, res, next) {
  try {
    const { skip = 0, take = 20, difficulty, isAIGenerated } = req.query;

    const where = {};
    if (difficulty) where.difficulty = difficulty;
    if (isAIGenerated !== undefined) where.isAIGenerated = isAIGenerated === 'true';

    const workouts = await prisma.workout.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(take),
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { order: 'asc' },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.workout.count({ where });

    res.json({
      workouts,
      pagination: {
        skip: parseInt(skip),
        take: parseInt(take),
        total,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get workout by ID
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function getWorkoutById(req, res, next) {
  try {
    const { id } = req.params;

    const workout = await prisma.workout.findUnique({
      where: { id },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { order: 'asc' },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    res.json(workout);
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new workout
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function createWorkout(req, res, next) {
  try {
    const { name, description, duration, difficulty, equipment, exercises } = req.body;

    const workout = await prisma.workout.create({
      data: {
        name,
        description,
        duration,
        difficulty,
        equipment: JSON.stringify(equipment || []),
        createdById: req.userId,
        isAIGenerated: false,
        exercises: {
          create: exercises.map((ex, idx) => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            restSeconds: ex.restSeconds,
            order: idx,
          })),
        },
      },
      include: {
        exercises: { include: { exercise: true } },
      },
    });

    res.status(201).json(workout);
  } catch (error) {
    next(error);
  }
}

/**
 * Update a workout
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function updateWorkout(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, duration, difficulty, equipment, exercises } = req.body;

    // Verify ownership
    const workout = await prisma.workout.findUnique({
      where: { id },
    });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    if (workout.createdById !== req.userId && req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to update this workout' });
    }

    // Delete old exercises
    await prisma.workoutExercise.deleteMany({
      where: { workoutId: id },
    });

    // Update workout
    const updated = await prisma.workout.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(duration && { duration }),
        ...(difficulty && { difficulty }),
        ...(equipment && { equipment: JSON.stringify(equipment) }),
        exercises: exercises
          ? {
              create: exercises.map((ex, idx) => ({
                exerciseId: ex.exerciseId,
                sets: ex.sets,
                reps: ex.reps,
                weight: ex.weight,
                restSeconds: ex.restSeconds,
                order: idx,
              })),
            }
          : undefined,
      },
      include: {
        exercises: { include: { exercise: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a workout
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function deleteWorkout(req, res, next) {
  try {
    const { id } = req.params;

    const workout = await prisma.workout.findUnique({
      where: { id },
    });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    if (workout.createdById !== req.userId && req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to delete this workout' });
    }

    await prisma.workout.delete({
      where: { id },
    });

    res.json({ message: 'Workout deleted' });
  } catch (error) {
    next(error);
  }
}

/**
 * Generate AI workout based on user preferences
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function generateWorkout(req, res, next) {
  try {
    const { focusMuscleGroups, equipment, duration, difficulty } = req.body;

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get exercises to avoid (from last 48 hours)
    const recentWorkouts = await prisma.userWorkoutLog.findMany({
      where: {
        userId: req.userId,
        dateCompleted: {
          gte: new Date(Date.now() - 48 * 60 * 60 * 1000),
        },
      },
      include: {
        exerciseLogs: {
          select: { exerciseId: true },
        },
      },
    });

    const recentExerciseIds = new Set(
      recentWorkouts.flatMap(w => w.exerciseLogs.map(el => el.exerciseId))
    );

    // Get all exercises matching criteria
    const exercises = await prisma.exercise.findMany({
      where: {
        muscleGroups: {
          contains: JSON.stringify(focusMuscleGroups[0]),
        },
        difficulty: difficulty || user.skillLevel,
      },
      take: 50,
    });

    // Filter out recently used exercises
    const availableExercises = exercises.filter(ex => !recentExerciseIds.has(ex.id));

    if (availableExercises.length === 0) {
      return res.status(400).json({ error: 'No exercises available for this selection' });
    }

    // Build prompt for OpenAI
    const exerciseList = availableExercises
      .slice(0, 15)
      .map(ex => `${ex.name} (${ex.muscleGroups})`)
      .join('\n');

    const prompt = `Create a ${duration}-minute workout focused on ${focusMuscleGroups.join(', ')} for a ${difficulty} level user.

Available exercises:
${exerciseList}

Respond with a JSON object:
{
  "name": "Workout Name",
  "description": "Brief description",
  "exercises": [
    {
      "name": "Exercise Name",
      "sets": 3,
      "reps": 10,
      "restSeconds": 60
    }
  ]
}

Only use exercises from the available list above.`;

    const message = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    let workoutData;
    try {
      workoutData = JSON.parse(message.choices[0].message.content);
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    // Map exercise names to IDs
    const exerciseMap = new Map(availableExercises.map(ex => [ex.name, ex.id]));
    const mappedExercises = [];

    for (const ex of workoutData.exercises) {
      const exerciseId = exerciseMap.get(ex.name);
      if (exerciseId) {
        mappedExercises.push({
          exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          restSeconds: ex.restSeconds,
        });
      }
    }

    // Create workout
    const workout = await prisma.workout.create({
      data: {
        name: workoutData.name,
        description: workoutData.description,
        duration,
        difficulty: difficulty || user.skillLevel,
        equipment: JSON.stringify(equipment || []),
        createdById: req.userId,
        isAIGenerated: true,
        exercises: {
          create: mappedExercises.map((ex, idx) => ({
            ...ex,
            order: idx,
          })),
        },
      },
      include: {
        exercises: { include: { exercise: true } },
      },
    });

    res.status(201).json(workout);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  generateWorkout,
};
