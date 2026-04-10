const express = require('express');
const router = express.Router();
const {
  getGlobalLeaderboard,
  getGroupLeaderboard,
  getWorkoutLeaderboard,
  getChallengeLeaderboard,
} = require('../controllers/leaderboard.controller');

/**
 * GET /api/leaderboards/global
 * Get global leaderboard
 * Query: { skip, take, timeframe }
 */
router.get('/global', getGlobalLeaderboard);

/**
 * GET /api/leaderboards/groups/:groupId
 * Get group leaderboard
 * Params: { groupId }
 * Query: { skip, take }
 */
router.get('/groups/:groupId', getGroupLeaderboard);

/**
 * GET /api/leaderboards/workouts/:workoutId
 * Get workout leaderboard
 * Params: { workoutId }
 * Query: { skip, take }
 */
router.get('/workouts/:workoutId', getWorkoutLeaderboard);

/**
 * GET /api/leaderboards/challenges/:challengeId
 * Get challenge leaderboard
 * Params: { challengeId }
 * Query: { skip, take }
 */
router.get('/challenges/:challengeId', getChallengeLeaderboard);

module.exports = router;
