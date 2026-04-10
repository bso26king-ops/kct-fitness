const express = require('express');
const router = express.Router();
const {
  logWorkout,
  getUserProgress,
  uploadProgressPhoto,
  getProgressPhotos,
} = require('../controllers/progress.controller');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * POST /api/progress/log
 * Log a completed workout
 * Auth: Required
 * Body: { workoutId, duration, notes, exerciseLogs }
 */
router.post('/log', authenticateToken, logWorkout);

/**
 * GET /api/progress
 * Get user progress data
 * Auth: Required
 * Query: { timeframe }
 */
router.get('/', authenticateToken, getUserProgress);

/**
 * POST /api/progress/photos
 * Upload progress photo
 * Auth: Required
 * Multipart: file, body: { angle, weight, bodyFat }
 */
router.post('/photos', authenticateToken, upload.single('file'), uploadProgressPhoto);

/**
 * GET /api/progress/photos
 * Get user progress photos
 * Auth: Required
 * Query: { skip, take, angle }
 */
router.get('/photos', authenticateToken, getProgressPhotos);

module.exports = router;
