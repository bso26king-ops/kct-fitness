const express = require('express');
const router = express.Router();
const {
  createSubscription,
  cancelSubscription,
  getSubscriptionStatus,
  handleWebhook,
} = require('../controllers/subscription.controller');
const { authenticateToken } = require('../middleware/auth');

/**
 * POST /api/subscriptions/checkout
 * Create subscription checkout session
 * Auth: Required
 */
router.post('/checkout', authenticateToken, createSubscription);

/**
 * POST /api/subscriptions/cancel
 * Cancel subscription
 * Auth: Required
 */
router.post('/cancel', authenticateToken, cancelSubscription);

/**
 * GET /api/subscriptions/status
 * Get subscription status
 * Auth: Required
 */
router.get('/status', authenticateToken, getSubscriptionStatus);

/**
 * POST /api/subscriptions/webhook
 * Stripe webhook endpoint (no auth required)
 * Must be called with raw body
 */
router.post('/webhook', handleWebhook);

module.exports = router;
