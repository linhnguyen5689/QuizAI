const Friend = require('../models/Friend');

class FriendService {
  /**
   * Get all friends for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of friends
   */
  async getFriends(userId) {
    const friends = await Friend.find({
      $or: [
        { user1: userId, status: 'accepted' },
        { user2: userId, status: 'accepted' }
      ]
    }).populate('user1 user2', 'username email');

    return friends.map(friend => {
      const friendData = friend.user1._id.toString() === userId
        ? friend.user2
        : friend.user1;
      return {
        _id: friendData._id,
        username: friendData.username,
        email: friendData.email
      };
    });
  }

  /**
   * Get pending friend requests for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of friend requests
   */
  async getFriendRequests(userId) {
    const requests = await Friend.find({
      user2: userId,
      status: 'pending'
    }).populate('user1', 'username email');

    return requests.map(request => ({
      _id: request._id,
      userId: request.user1._id,
      username: request.user1.username,
      email: request.user1.email,
      createdAt: request.createdAt
    }));
  }

  /**
   * Send a friend request
   * @param {string} fromUserId - User sending the request
   * @param {string} toUserId - User receiving the request
   * @returns {Promise<Object>} Created friend request
   */
  async sendFriendRequest(fromUserId, toUserId) {
    // Check if friend request already exists
    const existingRequest = await Friend.findOne({
      $or: [
        { user1: fromUserId, user2: toUserId },
        { user1: toUserId, user2: fromUserId }
      ]
    });

    if (existingRequest) {
      throw new Error('Friend request already exists');
    }

    const friend = new Friend({
      user1: fromUserId,
      user2: toUserId,
      requestedBy: fromUserId
    });

    return await friend.save();
  }

  /**
   * Respond to a friend request
   * @param {string} requestId - Friend request ID
   * @param {string} userId - User responding to the request
   * @param {boolean} accept - Whether to accept or reject
   * @returns {Promise<Object>} Updated friend request
   */
  async respondToFriendRequest(requestId, userId, accept) {
    const request = await Friend.findOne({
      _id: requestId,
      user2: userId,
      status: 'pending'
    });

    if (!request) {
      throw new Error('Friend request not found');
    }

    request.status = accept ? 'accepted' : 'rejected';
    return await request.save();
  }

  /**
   * Remove a friend
   * @param {string} userId - User removing the friend
   * @param {string} friendId - Friend to remove
   * @returns {Promise<Object>} Result of removal
   */
  async removeFriend(userId, friendId) {
    return await Friend.findOneAndDelete({
      $or: [
        { user1: userId, user2: friendId },
        { user1: friendId, user2: userId }
      ],
      status: 'accepted'
    });
  }
}

module.exports = new FriendService(); 