const prisma = require('../lib/prisma');
const { sendPushNotification, sendMulticastNotification } = require('../lib/firebase');

/**
 * Get all users (admin only)
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function getUsers(req, res, next) {
  try {
    const { skip = 0, take = 20, role, subscriptionStatus } = req.query;

    const where = {};
    if (role) where.role = role;
    if (subscriptionStatus) where.subscriptionStatus = subscriptionStatus;

    const users = await prisma.user.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(take),
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        subscriptionStatus: true,
        trialStartDate: true,
        createdAt: true,
        _count: { select: { workoutLogs: true, badges: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.user.count({ where });

    res.json({
      users,
      pagination: { skip: parseInt(skip), take: parseInt(take), total },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get analytics data
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function getAnalytics(req, res, next) {
  try {
    const { timeframe = '30' } = req.query;
    const days = parseInt(timeframe);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // User stats
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.userWorkoutLog.findMany({
      distinct: ['userId'],
      where: { dateCompleted: { gte: startDate } },
    });

    const activeSubscriptions = await prisma.user.count({
      where: { subscriptionStatus: 'ACTIVE' },
    });

    const trialUsers = await prisma.user.count({
      where: { subscriptionStatus: 'TRIAL' },
    });

    // Workout stats
    const totalWorkouts = await prisma.userWorkoutLog.count({
      where: { dateCompleted: { gte: startDate } },
    });

    const totalDuration = await prisma.userWorkoutLog.aggregate({
      where: { dateCompleted: { gte: startDate } },
      _sum: { duration: true },
    });

    // Most popular workouts
    const popularWorkouts = await prisma.userWorkoutLog.groupBy({
      by: ['workoutId'],
      where: { dateCompleted: { gte: startDate }, workoutId: { not: null } },
      _count: true,
      orderBy: { _count: 'desc' },
      take: 10,
    });

    const workoutIds = popularWorkouts.map(p => p.workoutId);
    const workouts = await prisma.workout.findMany({
      where: { id: { in: workoutIds } },
    });

    const workoutMap = Object.fromEntries(workouts.map(w => [w.id, w]));

    const topWorkouts = popularWorkouts.map(pw => ({
      workout: workoutMap[pw.workoutId],
      count: pw._count,
    }));

    // Group stats
    const totalGroups = await prisma.group.count();
    const totalGroupMembers = await prisma.groupMember.count();

    // Challenge stats
    const activeChallenges = await prisma.challenge.count({
      where: { endDate: { gte: new Date() } },
    });

    const completedChallenges = await prisma.challenge.count({
      where: { endDate: { lt: new Date() } },
    });

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers.length,
        activeSubscriptions,
        trialUsers,
      },
      workouts: {
        total: totalWorkouts,
        totalDuration: totalDuration._sum.duration || 0,
        topWorkouts,
      },
      groups: {
        total: totalGroups,
        totalMembers: totalGroupMembers,
      },
      challenges: {
        active: activeChallenges,
        completed: completedChallenges,
      },
      timeframe: `${days}d`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Send notification to users
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function sendNotification(req, res, next) {
  try {
    const { userIds, title, body, data } = req.body;

    if (!userIds || userIds.length === 0) {
      return res.status(400).json({ error: 'User IDs required' });
    }

    // Get FCM tokens for users
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, fcmToken: true },
    });

    const fcmTokens = users
      .filter(u => u.fcmToken)
      .map(u => u.fcmToken);

    if (fcmTokens.length === 0) {
      return res.status(400).json({ error: 'No valid FCM tokens found' });
    }

    // Send notification
    const result = await sendMulticastNotification(fcmTokens, title, body, data || {});

    res.json({
      message: 'Notification sent',
      result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get subscription details
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function getSubscriptions(req, res, next) {
  try {
    const { skip = 0, take = 20, status } = req.query;

    const where = {};
    if (status) where.subscriptionStatus = status;

    const subscriptions = await prisma.user.findMany({
      where: {
        ...where,
        stripeSubscriptionId: { not: null },
      },
      skip: parseInt(skip),
      take: parseInt(take),
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionStatus: true,
        stripeSubscriptionId: true,
        stripeCustomerId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.user.count({
      where: {
        ...where,
        stripeSubscriptionId: { not: null },
      },
    });

    res.json({
      subscriptions,
      pagination: { skip: parseInt(skip), take: parseInt(take), total },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user role
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function updateUserRole(req, res, next) {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers,
  getAnalytics,
  sendNotification,
  getSubscriptions,
  updateUserRole,
};
