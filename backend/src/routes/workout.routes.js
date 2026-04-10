const express = require('express');
const router = express.Router();
const {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  generateWorkout,
} = require('../controllers/workout.controller');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/workouts
 * Get all workouts with pagination
 * Query: { skip, take, difficulty, isAIGenerated }
 */
router.get('/', getWorkouts);

/**
 * GET /api/workouts/:id
 * Get workout by ID
 * Params: { id }
 */
router.get('/:id', getWorkoutById);

/**
 * POST /api/workouts
 * Create a new workout
 * Auth: Required
 * Body: { name, description, duration, difficulty, equipment, exercises }
 */
router.post('/', authenticateToken, createWorkout);

/**
 * PUT /api/workouts/:id
 * Update a workout
 * Auth: Required
 * Params: { id }
 * Body: { name, description, duration, difficulty, equipment, exercises }
 */
router.put('/:id', authenticateToken, updateWorkout);

/**
 * DELETE /api/workouts/:id
 * Delete a workout
 * Auth: Required
 * Params: { id }
 */
router.delete('/:id', authenticateToken, deleteWorkout);

/**
 * POST /api/workouts/generate/ai
 * Generate AI workout
 * Auth: Required
 * Body: { focusMuscleGroups, equipment, duration, difficulty }
 */
router.post('/generate/ai', authenticateToken, generateWorkout);

module.exports = router;
