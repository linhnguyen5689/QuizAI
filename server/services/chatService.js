const Chat = require('../models/Chat');

class ChatService {
  // Get user chats returns a list of chats for a user
  async getUserChats(userId) {
    return await Chat.find({
      participants: userId
    })
      .populate('participants', 'username email')
      .sort('-lastMessage')
      .limit(50);
  }

  // Get chat messages for a specific chat
  async getChatMessages(chatId, userId) {
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    // Mark messages as read
    chat.messages = chat.messages.map(msg => {
      if (msg.sender.toString() !== userId) {
        msg.read = true;
      }
      return msg;
    });
    await chat.save();

    return chat.messages;
  }

  // Get messages for a specific room chat
  async getRoomMessages(roomId) {
    const chat = await Chat.findOne({
      roomId,
      type: 'room'
    }).populate('messages.sender', 'username');

    if (!chat) {
      throw new Error('Room chat not found');
    }

    return chat.messages;
  }

  // Get unread message count for a user
  async getUnreadCount(userId) {
    const chats = await Chat.find({
      participants: userId
    });

    return chats.reduce((count, chat) => {
      return count + chat.messages.filter(msg =>
        !msg.read && msg.sender.toString() !== userId
      ).length;
    }, 0);
  }

  // Create or get direct chat between two users
  async getOrCreateDirectChat(userId1, userId2) {
    let chat = await Chat.findOne({
      type: 'direct',
      participants: { $all: [userId1, userId2] }
    });

    if (!chat) {
      chat = new Chat({
        type: 'direct',
        participants: [userId1, userId2]
      });
      await chat.save();
    }

    return chat;
  }

  // Create or get room chat
  async getOrCreateRoomChat(roomId) {
    let chat = await Chat.findOne({
      type: 'room',
      roomId
    });

    if (!chat) {
      chat = new Chat({
        type: 'room',
        roomId,
        participants: []
      });
      await chat.save();
    }

    return chat;
  }

  // Add a message to a chat
  async addMessage(chatId, senderId, content) {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    chat.messages.push({
      sender: senderId,
      content
    });
    chat.lastMessage = new Date();
    return await chat.save();
  }

  //delete a chat
  async deleteChat(chatId, userId) {
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    // Remove user from participants
    chat.participants = chat.participants.filter(
      p => p.toString() !== userId
    );

    if (chat.participants.length === 0) {
      // If no participants left, delete the chat
      return await chat.remove();
    } else {
      return await chat.save();
    }
  }
}

module.exports = new ChatService(); 