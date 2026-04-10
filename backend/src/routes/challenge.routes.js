const express = require('express');
const router = express.Router();
const {
  getChallenges,
  getChallengeById,
  createChallenge,
  attemptChallenge,
} = require('../controllers/challenge.controller');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/challenges
 * Get all challenges
 * Query: { skip, take, status }
 */
router.get('/', getChallenges);

/**
 * GET /api/challenges/:id
 * Get challenge by ID
 * Params: { id }
 */
router.get('/:id', getChallengeById);

/**
 * POST /api/challenges
 * Create a new challenge
 * Auth: Required
 * Body: { name, description, workoutId, startDate, endDate }
 */
router.post('/', authenticateToken, createChallenge);

/**
 * POST /api/challenges/:challengeId/attempt
 * Attempt a challenge (submit score)
 * Auth: Required
 * Params: { challengeId }
 * Body: { score }
 */
router.post('/:challengeId/attempt', authenticateToken, attemptChallenge);

module.exports = router;
