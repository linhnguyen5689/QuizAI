import socketService from './socketService';
import axios from 'axios';

const API_URL = "http://localhost:5000/api";

class FriendService {
  constructor() {
    this.callbacks = {
      onFriendRequestReceived: () => { },
      onFriendRequestResponse: () => { },
      onFriendOnlineStatus: () => { },
      onError: () => { }
    };
    this.listeners = [];
    this._setupSocketListeners();
  }

  _setupSocketListeners() {
    socketService.on('friend-request-received', (data) => {
      this.callbacks.onFriendRequestReceived(data);
    });

    socketService.on('friend-request-response', (data) => {
      this.callbacks.onFriendRequestResponse(data);
    });

    socketService.on('friend-online-status', (data) => {
      this.callbacks.onFriendOnlineStatus(data);
    });

    socketService.on('error', (data) => {
      if (this.callbacks.onError) {
        this.callbacks.onError(data);
      }
    });
  }

  /**
   * Get all friends for the current user
   * @returns {Promise} - Promise that resolves with friends data
   */
  async getFriends() {
    try {
      // Get user token
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(`${API_URL}/friends`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching friends:', error);
      throw error;
    }
  }

  /**
   * Get all pending friend requests for the current user
   * @returns {Promise} - Promise that resolves with friend requests data
   */
  async getFriendRequests() {
    try {
      // Get user token
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(`${API_URL}/friends/requests`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      throw error;
    }
  }

  /**
   * Send a friend request to another user
   * @param {string} friendId - ID of the user to send request to
   * @returns {Promise} - Promise that resolves when request is sent
   */
  async sendFriendRequest(friendId) {
    try {
      // Get user token
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        throw new Error('Authentication required');
      }

      // First send via API for persistence
      const response = await axios.post(`${API_URL}/friends/request/${friendId}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      // Then send via socket for real-time notification
      if (socketService.isConnected) {
        socketService.emit('send-friend-request', { friendId });
      }

      return response.data;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }

  /**
   * Respond to a friend request
   * @param {string} requestId - ID of the friend request
   * @param {boolean} accept - Whether to accept or reject the request
   * @returns {Promise} - Promise that resolves when response is sent
   */
  async respondToFriendRequest(requestId, accept) {
    try {
      // Get user token
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        throw new Error('Authentication required');
      }

      console.log(`Responding to friend request: ${requestId}, accept: ${accept}`);

      // First update via API
      const response = await axios.put(`${API_URL}/friends/request/${requestId}`,
        { accept },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      console.log(`Friend request response received:`, response.data);

      // Then notify via socket for real-time
      if (socketService.isConnected) {
        socketService.emit('respond-to-friend-request', { requestId, accept });
      }

      return response.data;
    } catch (error) {
      console.error('Error responding to friend request:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  }

  /**
   * Remove a friend
   * @param {string} friendId - ID of the friend to remove
   * @returns {Promise} - Promise that resolves when friend is removed
   */
  async removeFriend(friendId) {
    try {
      // Get user token
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        throw new Error('Authentication required');
      }

      const response = await axios.delete(`${API_URL}/friends/${friendId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      return response.data;
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  }

  /**
   * Search for users
   * @param {string} query - Search query
   * @returns {Promise} - Promise that resolves with search results
   */
  async searchUsers(query) {
    try {
      // Get user token
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(`${API_URL}/users/search?query=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  /**
   * Set callback for when a friend request is received
   * @param {Function} callback - Callback function
   */
  onFriendRequestReceived(callback) {
    this.callbacks.onFriendRequestReceived = callback;
    this.listeners.push({ event: 'friend-request-received', callback });
  }

  /**
   * Set callback for when a friend request response is received
   * @param {Function} callback - Callback function
   */
  onFriendRequestResponse(callback) {
    this.callbacks.onFriendRequestResponse = callback;
    this.listeners.push({ event: 'friend-request-response', callback });
  }

  /**
   * Set callback for when a friend's online status changes
   * @param {Function} callback - Callback function
   */
  onFriendOnlineStatus(callback) {
    this.callbacks.onFriendOnlineStatus = callback;
    this.listeners.push({ event: 'friend-online-status', callback });
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
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback to remove
   */
  off(event, callback) {
    this.listeners = this.listeners.filter(l =>
      !(l.event === event && l.callback === callback));
  }

  /**
   * Cleanup all listeners
   */
  cleanup() {
    this.listeners.forEach(l => {
      socketService.off(l.event, l.callback);
    });
    this.listeners = [];
  }
}

// Export singleton instance
const friendService = new FriendService();
export default friendService; 