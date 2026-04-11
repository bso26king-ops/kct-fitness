const prisma = require('../lib/prisma');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all exercises with filters
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function getExercises(req, res, next) {
  try {
    const { skip = 0, take = 20, muscleGroup, difficulty, equipment } = req.query;

    const where = {};
    if (muscleGroup) {
      where.muscleGroups = { contains: muscleGroup };
    }
    if (difficulty) where.difficulty = difficulty;
    if (equipment) {
      where.equipment = { contains: equipment };
    }

    const exercises = await prisma.exercise.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(take),
      orderBy: { name: 'asc' },
    });

    const total = await prisma.exercise.count({ where });

    res.json({
      exercises,
      pagination: { skip: parseInt(skip), take: parseInt(take), total },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get exercise by ID
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function getExerciseById(req, res, next) {
  try {
    const { id } = req.params;

    const exercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    res.json({
      ...exercise,
      muscleGroups: JSON.parse(exercise.muscleGroups || '[]'),
      equipment: JSON.parse(exercise.equipment || '[]'),
      alternatives: JSON.parse(exercise.alternatives || '[]'),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new exercise
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function createExercise(req, res, next) {
  try {
    const {
      name,
      description,
      muscleGroups,
      equipment,
      difficulty,
      videoUrl,
      alternatives,
      beginnerMod,
      advancedProg,
    } = req.body;

    const exercise = await prisma.exercise.create({
      data: {
        id: uuidv4(),
        name,
        description,
        muscleGroups: JSON.stringify(muscleGroups || []),
        equipment: JSON.stringify(equipment || []),
        difficulty,
        videoUrl,
        alternatives: JSON.stringify(alternatives || []),
        beginnerMod,
        advancedProg,
      },
    });

    res.status(201).json({
      ...exercise,
      muscleGroups: JSON.parse(exercise.muscleGroups || '[]'),
      equipment: JSON.parse(exercise.equipment || '[]'),
      alternatives: JSON.parse(exercise.alternatives || '[]'),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an exercise
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function updateExercise(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      muscleGroups,
      equipment,
      difficulty,
      videoUrl,
      alternatives,
      beginnerMod,
      advancedProg,
    } = req.body;

    const exercise = await prisma.exercise.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(muscleGroups && { muscleGroups: JSON.stringify(muscleGroups) }),
        ...(equipment && { equipment: JSON.stringify(equipment) }),
        ...(difficulty && { difficulty }),
        ...(videoUrl && { videoUrl }),
        ...(alternatives && { alternatives: JSON.stringify(alternatives) }),
        ...(beginnerMod && { beginnerMod }),
        ...(advancedProg && { advancedProg }),
      },
    });

    res.json({
      ...exercise,
      muscleGroups: JSON.parse(exercise.muscleGroups || '[]'),
      equipment: JSON.parse(exercise.equipment || '[]'),
      alternatives: JSON.parse(exercise.alternatives || '[]'),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete an exercise
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function deleteExercise(req, res, next) {
  try {
    const { id } = req.params;

    const exercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    await prisma.exercise.delete({
      where: { id },
    });

    res.json({ message: 'Exercise deleted' });
  } catch (error) {
    next(error);
  }
}

/**
 * Get alternative exercises for a given exercise
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function getAlternatives(req, res, next) {
  try {
    const { id } = req.params;

    const exercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    const alternatives = JSON.parse(exercise.alternatives || '[]');

    const alternativeExercises = await prisma.exercise.findMany({
      where: { id: { in: alternatives } },
    });

    res.json(alternativeExercises);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
  getAlternatives,
};
