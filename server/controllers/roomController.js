const roomService = require('../services/roomService');

class RoomController {
  /**
   * Create a new multiplayer room
   */
  async createRoom(req, res) {
    try {
      const { quizId, maxParticipants, timeLimit, isPublic } = req.body;
      
      const room = await roomService.createRoom(req.user._id, quizId, {
        maxParticipants,
        timeLimit,
        isPublic
      });

      res.status(201).json({
        success: true,
        data: room
      });
    } catch (error) {
      console.error('Error creating room:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create room'
      });
    }
  }

  /**
   * Get room by code
   */
  async getRoomByCode(req, res) {
    try {
      const { code } = req.params;
      const room = await roomService.getRoomByCode(code);

      res.json({
        success: true,
        data: room
      });
    } catch (error) {
      console.error('Error getting room:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Room not found'
      });
    }
  }

  /**
   * Join a room
   */
  async joinRoom(req, res) {
    try {
      const { code } = req.params;
      const participant = await roomService.joinRoom(code, req.user._id);

      res.json({
        success: true,
        data: participant
      });
    } catch (error) {
      console.error('Error joining room:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to join room'
      });
    }
  }

  /**
   * Start a room
   */
  async startRoom(req, res) {
    try {
      const { code } = req.params;
      const room = await roomService.startRoom(code, req.user._id);

      res.json({
        success: true,
        data: room
      });
    } catch (error) {
      console.error('Error starting room:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to start room'
      });
    }
  }

  /**
   * Submit an answer
   */
  async submitAnswer(req, res) {
    try {
      const { code } = req.params;
      const { questionId, answerId } = req.body;
      
      const participant = await roomService.submitAnswer(code, req.user._id, questionId, answerId);

      res.json({
        success: true,
        data: participant
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to submit answer'
      });
    }
  }

  /**
   * End a room
   */
  async endRoom(req, res) {
    try {
      const { code } = req.params;
      const result = await roomService.endRoom(code, req.user._id);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error ending room:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to end room'
      });
    }
  }

  /**
   * Get room participants
   */
  async getRoomParticipants(req, res) {
    try {
      const { code } = req.params;
      const participants = await roomService.getRoomParticipants(code);

      res.json({
        success: true,
        data: participants
      });
    } catch (error) {
      console.error('Error getting participants:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Failed to get participants'
      });
    }
  }

  /**
   * Check if current user is the host of a room
   */
  async checkIsHost(req, res) {
    try {
      const { code } = req.params;
      const room = await roomService.getRoomByCode(code);
      
      // Extract IDs as strings for reliable comparison
      const hostId = room.hostId._id ? room.hostId._id.toString() : room.hostId.toString();
      const userId = req.user._id.toString();
      
      console.log('Check host comparison:', {
        hostId,
        userId,
        isMatch: hostId === userId
      });
      
      const isHost = hostId === userId;
      
      res.json({
        success: true,
        isHost
      });
    } catch (error) {
      console.error('Error checking host status:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Failed to check host status',
        isHost: false
      });
    }
  }

  /**
   * Get user's active rooms
   */
  async getUserRooms(req, res) {
    try {
      const rooms = await roomService.getUserRooms(req.user._id);

      res.json({
        success: true,
        data: rooms
      });
    } catch (error) {
      console.error('Error getting user rooms:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get rooms'
      });
    }
  }
}

module.exports = new RoomController(); 