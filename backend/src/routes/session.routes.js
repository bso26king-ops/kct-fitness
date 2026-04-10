const express = require('express');
const router = express.Router();
const {
  getSessions,
  createSession,
  getSessionLeaderboard,
} = require('../controllers/session.controller');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/sessions
 * Get upcoming scheduled sessions
 * Query: { groupId, skip, take }
 */
router.get('/', getSessions);

/**
 * POST /api/sessions
 * Create a scheduled session
 * Auth: Required
 * Body: { workoutId, groupId, scheduledTime }
 */
router.post('/', authenticateToken, createSession);

/**
 * GET /api/sessions/:sessionId/leaderboard
 * Get leaderboard for a scheduled session
 * Params: { sessionId }
 * Query: { skip, take }
 */
router.get('/:sessionId/leaderboard', getSessionLeaderboard);

module.exports = router;
