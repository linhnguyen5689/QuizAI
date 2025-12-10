const chatService = require('../services/chatService');
const { validationResult } = require('express-validator');

class ChatController {
  //get all chats
  async getUserChats(req, res) {
    try {
      const chats = await chatService.getUserChats(req.user.id);
      return res.json(chats);
    } catch (error) {
      console.error('Error in getUserChats:', error);
      return res.status(500).json({ msg: 'Server error' });
    }
  }

  //get messages of a chat
  async getChatMessages(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { chatId } = req.params;
      const messages = await chatService.getChatMessages(chatId, req.user.id);
      return res.json(messages);
    } catch (error) {
      console.error('Error in getChatMessages:', error);
      if (error.message === 'Chat not found' || error.message === 'User not in chat') {
        return res.status(404).json({ msg: error.message });
      }
      return res.status(500).json({ msg: 'Server error' });
    }
  }

  // get messages of a room chat
  async getRoomMessages(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { roomId } = req.params;
      const messages = await chatService.getRoomMessages(roomId);
      return res.json(messages);
    } catch (error) {
      console.error('Error in getRoomMessages:', error);
      if (error.message === 'Room chat not found' || error.message === 'Invalid room chat') {
        return res.status(404).json({ msg: error.message });
      }
      return res.status(500).json({ msg: 'Server error' });
    }
  }

  //unread count of chats
  async getUnreadCount(req, res) {
    try {
      const count = await chatService.getUnreadCount(req.user.id);
      return res.json({ count });
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      return res.status(500).json({ msg: 'Server error' });
    }
  }

  //direct chat with a user
  async getOrCreateDirectChat(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { userId } = req.params;

      // Prevent creating chat with self
      if (userId === req.user.id) {
        return res.status(400).json({ msg: 'Cannot create chat with yourself' });
      }

      const chat = await chatService.getOrCreateDirectChat(req.user.id, userId);
      return res.json(chat);
    } catch (error) {
      console.error('Error in getOrCreateDirectChat:', error);
      if (error.message === 'User not found') {
        return res.status(404).json({ msg: error.message });
      }
      return res.status(500).json({ msg: 'Server error' });
    }
  }

  //room chat with a roomId
  async getOrCreateRoomChat(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { roomId } = req.params;
      const chat = await chatService.getOrCreateRoomChat(roomId);
      return res.json(chat);
    } catch (error) {
      console.error('Error in getOrCreateRoomChat:', error);
      if (error.message === 'Room not found') {
        return res.status(404).json({ msg: error.message });
      }
      return res.status(500).json({ msg: 'Server error' });
    }
  }

  //send a message to a chat
  async sendMessage(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { chatId } = req.params;
      const { content } = req.body;

      const message = await chatService.addMessage(chatId, req.user.id, content);
      return res.json(message);
    } catch (error) {
      console.error('Error in sendMessage:', error);
      if (error.message === 'Chat not found' || error.message === 'User not in chat') {
        return res.status(404).json({ msg: error.message });
      }
      return res.status(500).json({ msg: 'Server error' });
    }
  }

  //delete a message from a chat
  async deleteChat(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { chatId } = req.params;
      await chatService.deleteChat(chatId, req.user.id);
      return res.json({ msg: 'Chat deleted' });
    } catch (error) {
      console.error('Error in deleteChat:', error);
      if (error.message === 'Chat not found' || error.message === 'User not in chat') {
        return res.status(404).json({ msg: error.message });
      }
      return res.status(500).json({ msg: 'Server error' });
    }
  }
}

module.exports = new ChatController(); 