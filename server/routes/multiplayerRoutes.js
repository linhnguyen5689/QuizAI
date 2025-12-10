const express = require('express');
const router = express.Router();
const multiplayerController = require('../controllers/multiplayerController');
const { protect } = require('../middleware/authMiddleware');

router.post('/rooms', protect, multiplayerController.createRoom);
router.post('/rooms/:roomCode/join', protect, multiplayerController.joinRoom);
router.post('/rooms/:roomCode/start', protect, multiplayerController.startGame);
router.post('/rooms/:roomCode/answers', protect, multiplayerController.submitAnswer);
router.post('/rooms/:roomCode/finish', protect, multiplayerController.finishGame);

router.get('/rooms/:roomCode/status', protect, multiplayerController.getRoomStatus);

module.exports = router; 