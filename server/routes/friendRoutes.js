const express = require('express');
const { check } = require('express-validator');
const friendController = require('../controllers/friendController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Get all friends
router.get('/', friendController.getFriends);

// Get friend requests
router.get('/requests', friendController.getFriendRequests);

// Send friend request
router.post(
  '/request/:userId',
  [check('userId', 'Valid user ID is required').isMongoId()],
  friendController.sendFriendRequest
);

// Respond to friend request
router.put(
  '/request/:requestId',
  [
    check('requestId', 'Valid request ID is required').isMongoId(),
    check('accept', 'Accept field is required and must be a boolean').isBoolean()
  ],
  friendController.respondToFriendRequest
);

// Alternative endpoint for responding to friend request if the main one fails
router.put(
  '/request-alt/:requestId',
  [
    check('requestId', 'Valid request ID is required').isMongoId(),
    check('accept', 'Accept field is required and must be a boolean').isBoolean()
  ],
  friendController.respondToFriendRequestAlternative
);

// Remove friend
router.delete(
  '/:friendId',
  [check('friendId', 'Valid friend ID is required').isMongoId()],
  friendController.removeFriend
);

module.exports = router;