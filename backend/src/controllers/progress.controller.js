const prisma = require('../lib/prisma');
const { uploadToCloudinary } = require('../lib/cloudinary');
const { checkAndAwardBadges } = require('../utils/badges');
const { v4: uuidv4 } = require('uuid');

/**
 * Log a completed workout
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function logWorkout(req, res, next) {
  try {
    const { workoutId, duration, notes, exerciseLogs } = req.body;

    // Create workout log
    const log = await prisma.userWorkoutLog.create({
      data: {
        id: uuidv4(),
        userId: req.userId,
        workoutId: workoutId || undefined,
        duration,
        notes,
        dateCompleted: new Date(),
        exerciseLogs: {
          create: exerciseLogs.map(el => ({
            exerciseId: el.exerciseId,
            setsCompleted: el.setsCompleted,
            repsCompleted: el.repsCompleted,
            weightUsed: el.weightUsed,
          })),
        },
      },
      include: {
        exerciseLogs: true,
        workout: true,
      },
    });

    // Check and award badges
    const newBadges = await checkAndAwardBadges(req.userId);

    // Update leaderboard
    const workoutScore = duration;
    await prisma.leaderboard.create({
      data: {
        userId: req.userId,
        workoutId: workoutId || undefined,
        score: workoutScore,
      },
    });

    res.status(201).json({
      log,
      newBadges,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get user progress data
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function getUserProgress(req, res, next) {
  try {
    const { timeframe = '30' } = req.query;
    const days = parseInt(timeframe);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get workout logs
    const logs = await prisma.userWorkoutLog.findMany({
      where: {
        userId: req.userId,
        dateCompleted: { gte: startDate },
      },
      include: { exerciseLogs: true },
      orderBy: { dateCompleted: 'desc' },
    });

    // Calculate stats
    const totalWorkouts = logs.length;
    const totalDuration = logs.reduce((sum, log) => sum + log.duration, 0);
    const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

    // Get badges
    const badges = await prisma.badge.findMany({
      where: { userId: req.userId },
    });

    // Get progress photos
    const photos = await prisma.progressPhoto.findMany({
      where: { userId: req.userId },
      orderBy: { dateUploaded: 'desc' },
    });

    // Get leaderboard position
    const leaderboardPosition = await prisma.leaderboard.groupBy({
      by: ['userId'],
      where: {
        dateLogged: { gte: startDate },
      },
      _sum: { score: true },
      orderBy: { _sum: { score: 'desc' } },
    });

    const userPosition = leaderboardPosition.findIndex(lb => lb.userId === req.userId) + 1;

    res.json({
      stats: {
        totalWorkouts,
        totalDuration,
        avgDuration,
        position: userPosition || 'unranked',
      },
      logs,
      badges,
      photos,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Upload progress photo
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function uploadProgressPhoto(req, res, next) {
  try {
    const { angle = 'FRONT', weight, bodyFat } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Photo required' });
    }

    // Upload to Cloudinary
    const photoUrl = await uploadToCloudinary(req.file.buffer, 'kct-fitness/progress-photos');

    // Save to database
    const photo = await prisma.progressPhoto.create({
      data: {
        id: uuidv4(),
        userId: req.userId,
        photoUrl,
        angle,
        weight: weight ? parseFloat(weight) : undefined,
        bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
      },
    });

    res.status(201).json(photo);
  } catch (error) {
    next(error);
  }
}

/**
 * Get user progress photos
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function getProgressPhotos(req, res, next) {
  try {
    const { skip = 0, take = 20, angle } = req.query;

    const photos = await prisma.progressPhoto.findMany({
      where: {
        userId: req.userId,
        ...(angle && { angle }),
      },
      skip: parseInt(skip),
      take: parseInt(take),
      orderBy: { dateUploaded: 'desc' },
    });

    const total = await prisma.progressPhoto.count({
      where: {
        userId: req.userId,
        ...(angle && { angle }),
      },
    });

    res.json({
      photos,
      pagination: { skip: parseInt(skip), take: parseInt(take), total },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  logWorkout,
  getUserProgress,
  uploadProgressPhoto,
  getProgressPhotos,
};
