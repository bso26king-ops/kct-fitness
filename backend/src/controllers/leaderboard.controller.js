const prisma = require('../lib/prisma');

/**
 * Get global leaderboard
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function getGlobalLeaderboard(req, res, next) {
  try {
    const { skip = 0, take = 20, timeframe = '7' } = req.query;
    const days = parseInt(timeframe);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const leaderboard = await prisma.leaderboard.groupBy({
      by: ['userId'],
      where: {
        dateLogged: { gte: startDate },
      },
      _sum: { score: true },
      orderBy: { _sum: { score: 'desc' } },
      skip: parseInt(skip),
      take: parseInt(take),
    });

    const userIds = leaderboard.map(l => l.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });

    const userMap = Object.fromEntries(users.map(u => [u.id, u]));

    const entries = leaderboard.map((entry, idx) => ({
      rank: idx + 1 + parseInt(skip),
      user: userMap[entry.userId],
      score: entry._sum.score,
      timeframe: `${days}d`,
    }));

    const total = await prisma.leaderboard.findMany({
      distinct: ['userId'],
      where: { dateLogged: { gte: startDate } },
    });

    res.json({
      entries,
      pagination: { skip: parseInt(skip), take: parseInt(take), total: total.length },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get leaderboard for a specific group
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function getGroupLeaderboard(req, res, next) {
  try {
    const { groupId } = req.params;
    const { skip = 0, take = 20 } = req.query;

    // Verify group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const leaderboard = await prisma.leaderboard.groupBy({
      by: ['userId'],
      where: { groupId },
      _sum: { score: true },
      orderBy: { _sum: { score: 'desc' } },
      skip: parseInt(skip),
      take: parseInt(take),
    });

    const userIds = leaderboard.map(l => l.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });

    const userMap = Object.fromEntries(users.map(u => [u.id, u]));

    const entries = leaderboard.map((entry, idx) => ({
      rank: idx + 1 + parseInt(skip),
      user: userMap[entry.userId],
      score: entry._sum.score,
      groupId,
    }));

    const total = await prisma.leaderboard.findMany({
      distinct: ['userId'],
      where: { groupId },
    });

    res.json({
      entries,
      group,
      pagination: { skip: parseInt(skip), take: parseInt(take), total: total.length },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get leaderboard for a specific workout
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function getWorkoutLeaderboard(req, res, next) {
  try {
    const { workoutId } = req.params;
    const { skip = 0, take = 20 } = req.query;

    // Verify workout exists
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
    });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    const leaderboard = await prisma.leaderboard.groupBy({
      by: ['userId'],
      where: { workoutId },
      _sum: { score: true },
      orderBy: { _sum: { score: 'desc' } },
      skip: parseInt(skip),
      take: parseInt(take),
    });

    const userIds = leaderboard.map(l => l.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });

    const userMap = Object.fromEntries(users.map(u => [u.id, u]));

    const entries = leaderboard.map((entry, idx) => ({
      rank: idx + 1 + parseInt(skip),
      user: userMap[entry.userId],
      score: entry._sum.score,
      workoutId,
    }));

    const total = await prisma.leaderboard.findMany({
      distinct: ['userId'],
      where: { workoutId },
    });

    res.json({
      entries,
      workout,
      pagination: { skip: parseInt(skip), take: parseInt(take), total: total.length },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get leaderboard for a specific challenge
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function getChallengeLeaderboard(req, res, next) {
  try {
    const { challengeId } = req.params;
    const { skip = 0, take = 20 } = req.query;

    // Verify challenge exists
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const leaderboard = await prisma.leaderboard.groupBy({
      by: ['userId'],
      where: { challengeId },
      _sum: { score: true },
      orderBy: { _sum: { score: 'desc' } },
      skip: parseInt(skip),
      take: parseInt(take),
    });

    const userIds = leaderboard.map(l => l.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });

    const userMap = Object.fromEntries(users.map(u => [u.id, u]));

    const entries = leaderboard.map((entry, idx) => ({
      rank: idx + 1 + parseInt(skip),
      user: userMap[entry.userId],
      score: entry._sum.score,
      challengeId,
    }));

    const total = await prisma.leaderboard.findMany({
      distinct: ['userId'],
      where: { challengeId },
    });

    res.json({
      entries,
      challenge,
      pagination: { skip: parseInt(skip), take: parseInt(take), total: total.length },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getGlobalLeaderboard,
  getGroupLeaderboard,
  getWorkoutLeaderboard,
  getChallengeLeaderboard,
};
