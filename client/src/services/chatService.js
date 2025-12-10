import socketService from './socketService';
import axios from 'axios';

const API_URL = "http://localhost:5000/api";

class ChatService {
  constructor() {
    this.callbacks = {
      onNewMessage: () => { },
      onTyping: () => { },
      onStopTyping: () => { },
      onNewRoomMessage: () => { },
      onError: () => { }
    };
    this.listeners = [];
    this._setupSocketListeners();
  }

  _setupSocketListeners() {
    if (socketService.socket) {
      socketService.socket.off('new-message');
      socketService.socket.off('new-room-message');
      socketService.socket.off('user-typing');
      socketService.socket.off('user-stop-typing');
      socketService.socket.off('error');

      socketService.socket.on('new-message', (data) => {
        console.log("Socket received message:", data);
        this.callbacks.onNewMessage(data);
      });

      socketService.socket.on('new-room-message', (data) => {
        console.log("Socket received room message:", data);
        this.callbacks.onNewRoomMessage(data);
      });

      socketService.socket.on('user-typing', (data) => {
        console.log("Socket received typing:", data);
        this.callbacks.onTyping(data);
      });

      socketService.socket.on('user-stop-typing', (data) => {
        console.log("Socket received stop typing:", data);
        this.callbacks.onStopTyping(data);
      });

      socketService.socket.on('error', (data) => {
        console.error("Socket error:", data);
        if (this.callbacks.onError) {
          this.callbacks.onError(data);
        }
      });
    } else {
      console.warn("Socket not initialized in chatService._setupSocketListeners");

      setTimeout(() => {
        if (socketService.socket) {
          this._setupSocketListeners();
        }
      }, 1000);
    }
  }

  /**
   * Get chat messages with another user
   * @param {string} userId - User ID to get messages with
   * @returns {Promise} - Promise that resolves with messages
   */
  async getChatHistory(userId) {
    try {
      // Get user token
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        throw new Error('Authentication required');
      }

      // First get or create the direct chat
      const chatResponse = await axios.get(`${API_URL}/chats/direct/${userId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!chatResponse.data || !chatResponse.data._id) {
        return [];
      }

      // Then get messages for this chat
      const messagesResponse = await axios.get(`${API_URL}/chats/${chatResponse.data._id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      // Chuẩn hóa người gửi về dạng chuỗi
      const messages = messagesResponse.data || [];
      return messages.map(msg => {
        const senderId = typeof msg.sender === 'object' && msg.sender !== null
          ? msg.sender._id || msg.sender.id || msg.sender.toString()
          : String(msg.sender);
        return { ...msg, sender: senderId };
      });
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }

  /**
   * Send a private message to another user
   * @param {string} receiverId - ID of the message recipient
   * @param {string} content - Message content
   * @returns {Promise} - Promise that resolves when message is sent
   */
  async sendPrivateMessage(receiverId, content) {
    try {
      // Get user token
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        throw new Error('Authentication required');
      }

      // First get or create the direct chat
      const chatResponse = await axios.get(`${API_URL}/chats/direct/${receiverId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!chatResponse.data || !chatResponse.data._id) {
        throw new Error('Could not create chat');
      }

      // Then send the message
      const response = await axios.post(`${API_URL}/chats/${chatResponse.data._id}/messages`,
        { content },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      // Then send via socket for real-time
      if (socketService.isConnected) {
        socketService.sendPrivateMessage(receiverId, content);
      }

      return response.data;
    } catch (error) {
      console.error('Error sending private message:', error);
      throw error;
    }
  }

  /**
   * Notify the other user that you are typing
   * @param {string} receiverId - ID of the user to notify
   */
  sendTypingStatus(receiverId) {
    if (socketService.isConnected) {
      socketService.sendTypingStatus(receiverId);
    }
  }

  /**
   * Notify the other user that you stopped typing
   * @param {string} receiverId - ID of the user to notify
   */
  sendStopTypingStatus(receiverId) {
    if (socketService.isConnected) {
      socketService.sendStopTypingStatus(receiverId);
    }
  }

  /**
   * Set callback for when a new message is received
   * @param {Function} callback - Callback function
   */
  onNewMessage(callback) {
    this.callbacks.onNewMessage = callback;
    if (socketService.socket) {
      socketService.socket.off('new-message');
      socketService.socket.on('new-message', (data) => {
        console.log("Socket received message (listener):", data);
        callback(data);
      });
    }
    this.listeners.push({ event: 'new-message', callback });
  }

  /**
   * Remove callback for new messages
   * @param {Function} callback - The callback to remove
   */
  offNewMessage(callback) {
    this.listeners = this.listeners.filter(l =>
      !(l.event === 'new-message' && l.callback === callback));
    if (socketService.socket) {
      socketService.socket.off('new-message');
    }
  }

  /**
   * Set callback for when a new room message is received
   * @param {Function} callback - Callback function
   */
  onNewRoomMessage(callback) {
    this.callbacks.onNewRoomMessage = callback;
    this.listeners.push({ event: 'new-room-message', callback });
  }

  /**
   * Remove callback for new room messages
   * @param {Function} callback - The callback to remove
   */
  offNewRoomMessage(callback) {
    this.listeners = this.listeners.filter(l =>
      !(l.event === 'new-room-message' && l.callback === callback));
  }

  /**
   * Set callback for when someone is typing
   * @param {Function} callback - Callback function
   */
  onTyping(callback) {
    this.callbacks.onTyping = callback;
    if (socketService.socket) {
      socketService.socket.off('user-typing');
      socketService.socket.on('user-typing', (data) => {
        console.log("Socket received typing (listener):", data);
        callback(data);
      });
    }
    this.listeners.push({ event: 'user-typing', callback });
  }

  /**
   * Set callback for when someone stops typing
   * @param {Function} callback - Callback function
   */
  onStopTyping(callback) {
    this.callbacks.onStopTyping = callback;
    if (socketService.socket) {
      socketService.socket.off('user-stop-typing');
      socketService.socket.on('user-stop-typing', (data) => {
        console.log("Socket received stop typing (listener):", data);
        callback(data);
      });
    }
    this.listeners.push({ event: 'user-stop-typing', callback });
  }

  /**
   * Set callback for errors
   * @param {Function} callback - Callback function
   */
  onError(callback) {
    this.callbacks.onError = callback;
    this.listeners.push({ event: 'error', callback });
  }

  /**
   * Send a message to a room chat
   * @param {string} roomCode - Room code to send message to
   * @param {string} content - Message content
   * @returns {Promise} - Promise that resolves when message is sent
   */
  async sendRoomMessage(roomCode, content) {
    try {
      // Get user token
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        throw new Error('Authentication required');
      }

      // Send via socket for real-time
      if (socketService.isConnected) {
        socketService.sendRoomMessage(roomCode, content);
      }

      return true;
    } catch (error) {
      console.error('Error sending room message:', error);
      throw error;
    }
  }

  /**
   * Cleanup all listeners
   */
  cleanup() {
    this.listeners.forEach(l => {
      if (socketService.socket) {
        socketService.socket.off(l.event);
      }
    });
    this.listeners = [];
  }
}

// Export singleton instance
const chatService = new ChatService();
export default chatService; 