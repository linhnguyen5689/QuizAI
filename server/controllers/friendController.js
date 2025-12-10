const { validationResult } = require('express-validator');
const friendService = require('../services/friendService');
const User = require('../models/User');
const Friend = require('../models/Friend');
const mongoose = require('mongoose');

class FriendController {
  /**
   * Get all friends for the authenticated user
   */
  async getFriends(req, res, next) {
    try {
      const myUserId = req.user._id;
      // Sử dụng schema mới: user1, user2
      const friends = await Friend.find({
        $or: [{ user1: myUserId }, { user2: myUserId }],
        status: 'accepted'
      });
      const friendIds = friends.map(f =>
        f.user1.toString() === myUserId.toString() ? f.user2 : f.user1
      );
      const users = await User.find({ _id: { $in: friendIds } }).select('-password');
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * Get all friend requests for the authenticated user
   */
  async getFriendRequests(req, res, next) {
    try {
      const myUserId = req.user._id;
      console.log(`Getting friend requests for user ID: ${myUserId}`);

      // Sử dụng schema mới: user2 là người nhận, user1 là người gửi
      const requests = await Friend.find({
        user2: myUserId,
        status: 'pending'
      }).populate('user1', 'username email');

      console.log(`Found ${requests.length} friend requests`);

      // Log chi tiết về từng yêu cầu
      for (let i = 0; i < requests.length; i++) {
        const req = requests[i];
        console.log(`Request ${i + 1}:`, {
          _id: req._id.toString(),
          user1: req.user1._id.toString(),
          user2: req.user2.toString(),
          username: req.user1.username,
          email: req.user1.email,
          status: req.status
        });
      }

      // Trả về đúng định dạng cho client
      const formattedRequests = requests.map(r => ({
        _id: r._id,
        userId: r.user1._id,
        username: r.user1.username,
        email: r.user1.email
      }));

      res.json(formattedRequests);
    } catch (err) {
      console.error('Error fetching friend requests:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * Send a friend request to another user
   */
  async sendFriendRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const myUserId = req.user._id;
      const friendId = req.params.userId;

      // Check if the user exists
      const friendUser = await User.findById(friendId);
      if (!friendUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if it's not trying to add self
      if (myUserId.toString() === friendId.toString()) {
        return res.status(400).json({ message: 'Cannot add yourself as a friend' });
      }

      // Kiểm tra trùng lặp với schema mới
      const exists = await Friend.findOne({
        $or: [
          { user1: myUserId, user2: friendId },
          { user1: friendId, user2: myUserId }
        ]
      });
      if (exists) return res.status(400).json({ message: 'Already requested or friends' });

      // Tạo mới với schema mới
      const requestDoc = new Friend({
        user1: myUserId,
        user2: friendId,
        requestedBy: myUserId,
        status: 'pending'
      });
      await requestDoc.save();
      res.json({ message: 'Request sent' });
    } catch (err) {
      console.error('Error sending friend request:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * Accept or reject a friend request
   */
  async respondToFriendRequest(req, res, next) {
    try {
      // Lấy thông tin người dùng và request
      const myUserId = req.user._id;
      const requestId = req.params.requestId;
      let accept = req.body.accept;

      // Log chi tiết input
      console.log('Request params and body:', {
        requestId,
        accept,
        acceptType: typeof accept,
        myUserId: myUserId.toString(),
        body: req.body
      });

      // Đảm bảo accept là boolean
      if (typeof accept === 'string') {
        accept = accept === 'true';
      }

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        console.log(`Invalid request ID format: ${requestId}`);
        return res.status(400).json({ message: 'Invalid request ID format' });
      }

      console.log(`Processing friend request: requestId=${requestId}, accept=${accept}, userId=${myUserId}`);

      // Tìm yêu cầu cụ thể với schema mới
      const requestDoc = await Friend.findOne({
        _id: requestId,
        user2: myUserId,
        status: 'pending'
      });

      if (!requestDoc) {
        console.log(`Request not found for ID: ${requestId}`);
        return res.status(404).json({ message: 'Request not found' });
      }

      console.log(`Found request to process:`, {
        id: requestDoc._id.toString(),
        user1: requestDoc.user1.toString(),
        user2: requestDoc.user2.toString(),
        status: requestDoc.status
      });

      // Xác nhận người dùng hiện tại có quyền xử lý yêu cầu này không
      if (requestDoc.user2.toString() !== myUserId.toString()) {
        console.log(`User ${myUserId} is not authorized to process request ${requestId} (intended for ${requestDoc.user2})`);
        return res.status(403).json({ message: 'Not authorized to process this request' });
      }

      if (accept) {
        requestDoc.status = 'accepted';
        const savedDoc = await requestDoc.save();
        console.log(`Request ${requestId} accepted. Result:`, savedDoc);
        res.json({ message: 'Friend request accepted' });
      } else {
        // Sử dụng findByIdAndDelete để từ chối
        const deleted = await Friend.findByIdAndDelete(requestId);
        console.log(`Request ${requestId} rejected. Delete result:`, deleted);
        res.json({ message: 'Friend request rejected' });
      }
    } catch (err) {
      console.error('Error responding to friend request:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }

  /**
   * Accept or reject a friend request (alternative implementation)
   * This should only be used if the regular method is not working properly
   */
  async respondToFriendRequestAlternative(req, res, next) {
    try {
      // Lấy thông tin người dùng và request
      const myUserId = req.user._id;
      const requestId = req.params.requestId;
      let accept = req.body.accept;

      // Log chi tiết input
      console.log('[Alt] Request params and body:', {
        requestId,
        accept,
        acceptType: typeof accept,
        myUserId: myUserId.toString(),
        body: req.body
      });

      // Đảm bảo accept là boolean
      if (typeof accept === 'string') {
        accept = accept === 'true';
      }

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        console.log(`[Alt] Invalid request ID format: ${requestId}`);
        return res.status(400).json({ message: 'Invalid request ID format' });
      }

      console.log(`[Alt] Processing friend request: ${requestId}, accept: ${accept}, userId: ${myUserId}`);

      // Kiểm tra yêu cầu tồn tại
      const existingRequest = await Friend.findById(requestId);

      if (!existingRequest) {
        console.log(`[Alt] No request found with ID ${requestId} in the database`);
        return res.status(404).json({ message: 'Friend request not found' });
      }

      console.log(`[Alt] Found request:`, {
        id: existingRequest._id.toString(),
        from: existingRequest.userId.toString(),
        to: existingRequest.friendId.toString(),
        status: existingRequest.status
      });

      // Approach 1: Use direct update/delete operations instead of working with document instances
      if (accept) {
        // Sử dụng updateOne có upsert: false để đảm bảo chỉ cập nhật, không tạo mới
        const updateResult = await Friend.updateOne(
          { _id: requestId },
          { $set: { status: 'accepted' } },
          { upsert: false }
        );

        console.log(`[Alt] Update result:`, updateResult);

        if (updateResult.modifiedCount === 0) {
          return res.status(404).json({ message: 'Request not updated' });
        }

        res.json({ message: 'Friend request accepted' });
      } else {
        // Sử dụng findByIdAndDelete thay vì deleteOne
        const deleteResult = await Friend.findByIdAndDelete(requestId);

        console.log(`[Alt] Delete result:`, deleteResult);

        if (!deleteResult) {
          return res.status(404).json({ message: 'Request not found or already deleted' });
        }

        res.json({ message: 'Friend request rejected' });
      }
    } catch (err) {
      console.error('[Alt] Error responding to friend request:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }

  /**
   * Remove a friend
   */
  async removeFriend(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { friendId } = req.params;

      await friendService.removeFriend(req.user.id, friendId);
      res.json({ msg: 'Friend removed successfully' });
    } catch (error) {
      if (error.message === 'Friend not found') {
        return res.status(404).json({ msg: error.message });
      }
      next(error);
    }
  }
}

module.exports = new FriendController(); 