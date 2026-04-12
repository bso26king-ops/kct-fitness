const prisma = require('../lib/prisma');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all groups with pagination
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function getGroups(req, res, next) {
  try {
    const { skip = 0, take = 20 } = req.query;

    const groups = await prisma.group.findMany({
      skip: parseInt(skip),
      take: parseInt(take),
      include: {
        createdBy: { select: { id: true, name: true } },
        members: { select: { userId: true } },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.group.count();

    res.json({
      groups,
      pagination: { skip: parseInt(skip), take: parseInt(take), total },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new group
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function createGroup(req, res, next) {
  try {
    const { name, description, location } = req.body;

    const group = await prisma.group.create({
      data: {
        id: uuidv4(),
        name,
        description,
        location,
        createdById: req.userId,
        members: {
          create: {
            id: uuidv4(),
            userId: req.userId,
            role: 'ADMIN',
          },
        },
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        members: true,
      },
    });

    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
}

/**
 * Get group by ID
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function getGroupById(req, res, next) {
  try {
    const { id } = req.params;

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    next(error);
  }
}

/**
 * Join a group
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function joinGroup(req, res, next) {
  try {
    const { groupId } = req.params;

    // Check if already a member
    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: req.userId } },
    });

    if (existing) {
      return res.status(409).json({ error: 'Already a member of this group' });
    }

    const member = await prisma.groupMember.create({
      data: {
        id: uuidv4(),
        groupId,
        userId: req.userId,
        role: 'MEMBER',
      },
    });

    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
}

/**
 * Get group leaderboard/feed
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function getGroupFeed(req, res, next) {
  try {
    const { groupId } = req.params;
    const { skip = 0, take = 20 } = req.query;

    // Verify user is member
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: req.userId } },
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    // Get group members
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true },
    });

    const memberIds = members.map(m => m.userId);

    // Get leaderboard for this group
    const leaderboard = await prisma.leaderboard.groupBy({
      by: ['userId'],
      where: {
        groupId,
        userId: { in: memberIds },
      },
      _sum: { score: true },
      orderBy: { _sum: { score: 'desc' } },
      skip: parseInt(skip),
      take: parseInt(take),
    });

    // Get user details
    const userIds = leaderboard.map(l => l.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });

    const userMap = Object.fromEntries(users.map(u => [u.id, u]));

    const feed = leaderboard.map((entry, idx) => ({
      rank: idx + 1 + parseInt(skip),
      user: userMap[entry.userId],
      score: entry._sum.score,
    }));

    res.json(feed);
  } catch (error) {
    next(error);
  }
}

/**
 * Post a message in group (placeholder for message system)
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function postGroupMessage(req, res, next) {
  try {
    const { groupId } = req.params;
    const { message } = req.body;

    // Verify user is member
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: req.userId } },
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    // This is a placeholder. In production, implement a messages table
    res.json({
      message: 'Message posted',
      groupId,
      userId: req.userId,
      content: message,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getGroups,
  createGroup,
  getGroupById,
  joinGroup,
  getGroupFeed,
  postGroupMessage,
};
