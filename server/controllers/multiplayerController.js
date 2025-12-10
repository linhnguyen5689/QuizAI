const multiplayerService = require('../services/multiplayerService');

class MultiplayerController {
  async createRoom(req, res) {
    try {
      const { quizId, settings } = req.body;
      const room = await multiplayerService.createRoom(req.user._id, quizId, settings);

      res.json({
        success: true,
        data: room
      });
    } catch (error) {
      console.error('Error creating multiplayer room:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create multiplayer room'
      });
    }
  }

  async joinRoom(req, res) {
    try {
      const { roomCode } = req.params;
      const room = await multiplayerService.joinRoom(roomCode, req.user._id);

      res.json({
        success: true,
        data: room
      });
    } catch (error) {
      console.error('Error joining multiplayer room:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to join multiplayer room'
      });
    }
  }

  async startGame(req, res) {
    try {
      const { roomCode } = req.params;
      const room = await multiplayerService.startGame(roomCode, req.user._id);

      res.json({
        success: true,
        data: room
      });
    } catch (error) {
      console.error('Error starting multiplayer game:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start multiplayer game'
      });
    }
  }

  async submitAnswer(req, res) {
    try {
      const { roomCode } = req.params;
      const { questionId, selectedAnswer } = req.body;

      const room = await multiplayerService.submitAnswer(
        roomCode,
        req.user._id,
        questionId,
        selectedAnswer
      );

      res.json({
        success: true,
        data: room
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit answer'
      });
    }
  }

  async finishGame(req, res) {
    try {
      const { roomCode } = req.params;
      const room = await multiplayerService.finishGame(roomCode, req.user._id);

      res.json({
        success: true,
        data: room
      });
    } catch (error) {
      console.error('Error finishing multiplayer game:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to finish multiplayer game'
      });
    }
  }

  async getRoomStatus(req, res) {
    try {
      const { roomCode } = req.params;
      const roomStatus = await multiplayerService.getRoomStatus(roomCode);

      res.json({
        success: true,
        data: roomStatus
      });
    } catch (error) {
      console.error('Error getting room status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get room status'
      });
    }
  }
}

module.exports = new MultiplayerController(); 