const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');

// Create a new room
router.post('/', protect, roomController.createRoom);

// Get user's active rooms
router.get('/user', protect, roomController.getUserRooms);

// Get a room by code
router.get('/:code', roomController.getRoomByCode);

// Check if current user is host
router.get('/:code/check-host', protect, roomController.checkIsHost);

// Join a room
router.post('/:code/join', protect, roomController.joinRoom);

// Start a room's quiz
router.post('/:code/start', protect, roomController.startRoom);

// End a room's quiz
router.post('/:code/end', protect, roomController.endRoom);

// Submit an answer in a room
router.post('/:code/answer', protect, roomController.submitAnswer);

// Get room participants
router.get('/:code/participants', roomController.getRoomParticipants);

module.exports = router; 