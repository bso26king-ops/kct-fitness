const express = require('express');
const router = express.Router();
const {
  getGroups,
  createGroup,
  getGroupById,
  joinGroup,
  getGroupFeed,
  postGroupMessage,
} = require('../controllers/group.controller');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/groups
 * Get all groups
 * Query: { skip, take }
 */
router.get('/', getGroups);

/**
 * POST /api/groups
 * Create a new group
 * Auth: Required
 * Body: { name, description, location }
 */
router.post('/', authenticateToken, createGroup);

/**
 * GET /api/groups/:id
 * Get group by ID
 * Params: { id }
 */
router.get('/:id', getGroupById);

/**
 * POST /api/groups/:groupId/join
 * Join a group
 * Auth: Required
 * Params: { groupId }
 */
router.post('/:groupId/join', authenticateToken, joinGroup);

/**
 * GET /api/groups/:groupId/feed
 * Get group leaderboard/feed
 * Auth: Required
 * Params: { groupId }
 * Query: { skip, take }
 */
router.get('/:groupId/feed', authenticateToken, getGroupFeed);

/**
 * POST /api/groups/:groupId/messages
 * Post a message in group
 * Auth: Required
 * Params: { groupId }
 * Body: { message }
 */
router.post('/:groupId/messages', authenticateToken, postGroupMessage);

module.exports = router;
