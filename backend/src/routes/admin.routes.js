const express = require('express');
const router = express.Router();
const {
  getUsers,
  getAnalytics,
  sendNotification,
  getSubscriptions,
  updateUserRole,
} = require('../controllers/admin.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

/**
 * GET /api/admin/users
 * Get all users (admin only)
 * Auth: Required (Admin)
 * Query: { skip, take, role, subscriptionStatus }
 */
router.get('/users', authenticateToken, requireAdmin, getUsers);

/**
 * GET /api/admin/analytics
 * Get analytics data (admin only)
 * Auth: Required (Admin)
 * Query: { timeframe }
 */
router.get('/analytics', authenticateToken, requireAdmin, getAnalytics);

/**
 * POST /api/admin/notifications
 * Send notification to users (admin only)
 * Auth: Required (Admin)
 * Body: { userIds, title, body, data }
 */
router.post('/notifications', authenticateToken, requireAdmin, sendNotification);

/**
 * GET /api/admin/subscriptions
 * Get subscription details (admin only)
 * Auth: Required (Admin)
 * Query: { skip, take, status }
 */
router.get('/subscriptions', authenticateToken, requireAdmin, getSubscriptions);

/**
 * PATCH /api/admin/users/:userId/role
 * Update user role (admin only)
 * Auth: Required (Admin)
 * Params: { userId }
 * Body: { role }
 */
router.patch('/users/:userId/role', authenticateToken, requireAdmin, updateUserRole);

module.exports = router;
