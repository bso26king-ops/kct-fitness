const prisma = require('../lib/prisma');
const { v4: uuidv4 } = require('uuid');
const { sendPushNotification, sendMulticastNotification } = require('../lib/firebase');

/**
 * Get upcoming scheduled sessions
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function getSessions(req, res, next) {
  try {
    const { groupId, skip = 0, take = 20 } = req.query;

    const where = {
      scheduledTime: { gte: new Date() },
    };

    if (groupId) {
      where.groupId = groupId;
    }

    const sessions = await prisma.scheduledSession.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(take),
      include: {
        workout: { include: { exercises: { include: { exercise: true } } } },
        group: true,
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { scheduledTime: 'asc' },
    });

    const total = await prisma.scheduledSession.count({ where });

    res.json({
      sessions,
      pagination: { skip: parseInt(skip), take: parseInt(take), total },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a scheduled session
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function createSession(req, res, next) {
  try {
    const { workoutId, groupId, scheduledTime } = req.body;

    // Verify workout exists
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
    });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    // If group specified, verify user is admin
    if (groupId) {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
      });

      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      const membership = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId, userId: req.userId } },
      });

      if (!membership || membership.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Only group admins can schedule sessions' });
      }
    }

    const session = await prisma.scheduledSession.create({
      data: {
        id: uuidv4(),
        workoutId,
        groupId: groupId || undefined,
        scheduledTime: new Date(scheduledTime),
        createdById: req.userId,
      },
      include: {
        workout: { include: { exercises: { include: { exercise: true } } } },
        group: true,
        createdBy: { select: { id: true, name: true } },
      },
    });

    // Send notifications to group members
    if (groupId) {
      const members = await prisma.groupMember.findMany({
        where: { groupId },
        include: { user: true },
      });

      const fcmTokens = members
        .map(m => m.user.fcmToken)
        .filter(token => token !== null && token !== undefined);

      if (fcmTokens.length > 0) {
        await sendMulticastNotification(
          fcmTokens,
          'New Scheduled Session',
          `Join the ${workout.name} session on ${new Date(scheduledTime).toLocaleDateString()}`
        );
      }
    }

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
}

/**
 * Get leaderboard for a scheduled session
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function getSessionLeaderboard(req, res, next) {
  try {
    const { sessionId } = req.params;
    const { skip = 0, take = 20 } = req.query;

    // Verify session exists
    const session = await prisma.scheduledSession.findUnique({
      where: { id: sessionId },
      include: { workout: true },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Get logs for this workout from users who are members of the group (if group session)
    let where = { workoutId: session.workoutId };

    if (session.groupId) {
      const members = await prisma.groupMember.findMany({
        where: { groupId: session.groupId },
        select: { userId: true },
      });
      const memberIds = members.map(m => m.userId);
      where.userId = { in: memberIds };
    }

    const logs = await prisma.userWorkoutLog.findMany({
      where,
      orderBy: { dateCompleted: 'desc' },
      take: parseInt(take),
      skip: parseInt(skip),
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    const total = await prisma.userWorkoutLog.count({ where });

    res.json({
      session,
      logs,
      pagination: { skip: parseInt(skip), take: parseInt(take), total },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSessions,
  createSession,
  getSessionLeaderboard,
};
