const express = require('express');
const router = express.Router();
const {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
  getAlternatives,
} = require('../controllers/exercise.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

/**
 * GET /api/exercises
 * Get all exercises with filters
 * Query: { skip, take, muscleGroup, difficulty, equipment }
 */
router.get('/', getExercises);

/**
 * GET /api/exercises/:id
 * Get exercise by ID
 * Params: { id }
 */
router.get('/:id', getExerciseById);

/**
 * POST /api/exercises
 * Create a new exercise (admin only)
 * Auth: Required (Admin)
 * Body: { name, description, muscleGroups, equipment, difficulty, videoUrl, alternatives, beginnerMod, advancedProg }
 */
router.post('/', authenticateToken, requireAdmin, createExercise);

/**
 * PUT /api/exercises/:id
 * Update an exercise (admin only)
 * Auth: Required (Admin)
 * Params: { id }
 * Body: { name, description, muscleGroups, equipment, difficulty, videoUrl, alternatives, beginnerMod, advancedProg }
 */
router.put('/:id', authenticateToken, requireAdmin, updateExercise);

/**
 * DELETE /api/exercises/:id
 * Delete an exercise (admin only)
 * Auth: Required (Admin)
 * Params: { id }
 */
router.delete('/:id', authenticateToken, requireAdmin, deleteExercise);

/**
 * GET /api/exercises/:id/alternatives
 * Get alternative exercises
 * Params: { id }
 */
router.get('/:id/alternatives', getAlternatives);

module.exports = router;
