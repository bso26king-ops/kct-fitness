const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
} = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');

/**
 * POST /api/auth/register
 * Register a new user
 * Body: { name, email, password }
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Login user
 * Body: { email, password }
 */
router.post('/login', login);

/**
 * POST /api/auth/logout
 * Logout user
 * Body: { refreshToken }
 */
router.post('/logout', logout);

/**
 * POST /api/auth/refresh
 * Refresh access token
 * Body: { refreshToken }
 */
router.post('/refresh', refreshToken);

/**
 * POST /api/auth/forgot-password
 * Request password reset
 * Body: { email }
 */
router.post('/forgot-password', forgotPassword);

/**
 * POST /api/auth/reset-password
 * Reset password with token
 * Body: { token, newPassword }
 */
router.post('/reset-password', resetPassword);

/**
 * GET /api/auth/me
 * Get current user profile
 * Auth: Required
 */
router.get('/me', authenticateToken, getMe);

/**
 * PATCH /api/auth/profile
 * Update user profile
 * Auth: Required
 * Body: { name, skillLevel, equipment, workoutDuration, goals, fcmToken }
 */
router.patch('/profile', authenticateToken, updateProfile);

module.exports = router;
