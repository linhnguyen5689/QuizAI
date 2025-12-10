const express = require('express');
const { check } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');

const router = express.Router();

router.use(protect);

router.get('/', chatController.getUserChats);
router.get('/unread', chatController.getUnreadCount);

router.get('/direct/:userId', [
  check('userId', 'Valid user ID is required').isMongoId()
], chatController.getOrCreateDirectChat);

router.get('/room/:roomId', [
  check('roomId', 'Valid room ID is required').isMongoId()
], chatController.getOrCreateRoomChat);

router.get('/:chatId', [
  check('chatId', 'Valid chat ID is required').isMongoId()
], chatController.getChatMessages);

router.get('/room-messages/:roomId', [
  check('roomId', 'Valid room ID is required').isMongoId()
], chatController.getRoomMessages);

router.post('/:chatId/messages', [
  check('chatId', 'Valid chat ID is required').isMongoId(),
  check('content', 'Message content is required').notEmpty()
], chatController.sendMessage);

router.delete('/:chatId', [
  check('chatId', 'Valid chat ID is required').isMongoId()
], chatController.deleteChat);

module.exports = router;