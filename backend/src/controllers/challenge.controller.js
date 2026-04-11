const prisma = require('../lib/prisma');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all challenges
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function getChallenges(req, res, next) {
  try {
    const { skip = 0, take = 20, status = 'active' } = req.query;

    const where = {};
    if (status === 'active') {
      where.endDate = { gte: new Date() };
    } else if (status === 'completed') {
      where.endDate = { lt: new Date() };
    }

    const challenges = await prisma.challenge.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(take),
      include: {
        createdBy: { select: { id: true, name: true } },
        workout: true,
        _count: { select: { leaderboards: true } },
      },
      orderBy: { startDate: 'desc' },
    });

    const total = await prisma.challenge.count({ where });

    res.json({
      challenges,
      pagination: { skip: parseInt(skip), take: parseInt(take), total },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get challenge by ID
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function getChallengeById(req, res, next) {
  try {
    const { id } = req.params;

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        workout: {
          include: {
            exercises: { include: { exercise: true } },
          },
        },
        leaderboards: {
          orderBy: { score: 'desc' },
          take: 10,
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    res.json(challenge);
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new challenge
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function createChallenge(req, res, next) {
  try {
    const { name, description, workoutId, startDate, endDate } = req.body;

    const challenge = await prisma.challenge.create({
      data: {
        id: uuidv4(),
        name,
        description,
        workoutId: workoutId || undefined,
        createdById: req.userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        workout: true,
      },
    });

    res.status(201).json(challenge);
  } catch (error) {
    next(error);
  }
}

/**
 * Attempt a challenge (submit score)
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next
 */
async function attemptChallenge(req, res, next) {
  try {
    const { challengeId } = req.params;
    const { score } = req.body;

    // Verify challenge exists and is active
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    if (challenge.endDate < new Date()) {
      return res.status(410).json({ error: 'Challenge has ended' });
    }

    // Check if user already has an entry for this challenge
    const existing = await prisma.leaderboard.findFirst({
      where: {
        userId: req.userId,
        challengeId,
      },
    });

    let entry;
    if (existing) {
      // Update existing entry
      entry = await prisma.leaderboard.update({
        where: { id: existing.id },
        data: { score },
      });
    } else {
      // Create new entry
      entry = await prisma.leaderboard.create({
        data: {
          id: uuidv4(),
          userId: req.userId,
          challengeId,
          score,
        },
      });
    }

    res.json({
      message: 'Challenge attempt recorded',
      entry,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getChallenges,
  getChallengeById,
  createChallenge,
  attemptChallenge,
};
