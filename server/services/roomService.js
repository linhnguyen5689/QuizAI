const Room = require('../models/Room');
const Participant = require('../models/Participant');
const Quiz = require('../models/Quiz');
const { generateRoomCode } = require('../utils/helpers');

class RoomService {
  /**
   * Create a new multiplayer room
   */
  async createRoom(userId, quizId, options = {}) {
    try {
      // Verify quiz exists
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      // Generate unique room code
      const code = generateRoomCode();
      
      // Set expiration time (2 hours from now by default)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 2);

      // Create new room
      const room = await Room.create({
        code,
        hostId: userId,
        quizId,
        maxParticipants: options.maxParticipants || 10,
        timeLimit: options.timeLimit || 30,
        isPublic: options.isPublic !== undefined ? options.isPublic : true,
        expiresAt
      });

      // Add host as first participant
      await Participant.create({
        roomId: room._id,
        userId,
        status: 'ready'
      });

      // Return room with populated fields
      return await Room.findById(room._id).populate('hostId', 'username email profilePicture');
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  /**
   * Get room by code
   */
  async getRoomByCode(code) {
    try {
      const room = await Room.findOne({ code })
        .populate('hostId', 'username email profilePicture')
        .populate('quizId'); // Include all quiz data, not just title and description

      console.log('Room found:', code, 'Status:', room?.status);
      
      if (!room) {
        throw new Error('Room not found');
      }

      // Check if room is expired
      if (room.status !== 'expired' && new Date() > room.expiresAt) {
        room.status = 'expired';
        await room.save();
      }

      return room;
    } catch (error) {
      console.error('Error finding room:', error);
      throw error;
    }
  }

  /**
   * Join a room
   */
  async joinRoom(code, userId) {
    try {
      const room = await this.getRoomByCode(code);
      
      // Check if room is joinable
      if (room.status !== 'waiting') {
        throw new Error(`Cannot join room with status: ${room.status}`);
      }

      // Check if room is full
      const participants = await Participant.find({ roomId: room._id });
      if (participants.length >= room.maxParticipants) {
        throw new Error('Room is full');
      }

      // Check if user is already in the room
      const existingParticipant = participants.find(p => p.userId.toString() === userId.toString());
      if (existingParticipant) {
        return existingParticipant;
      }

      // Add user to participants
      const participant = await Participant.create({
        roomId: room._id,
        userId,
        status: 'joined'
      });

      return participant;
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  }

  /**
   * Start a room's quiz
   */
  async startRoom(code, userId) {
    try {
      const room = await this.getRoomByCode(code);
      
      // Verify user is host
      if (room.hostId._id.toString() !== userId.toString()) {
        throw new Error('Only host can start the room');
      }

      // Check participants
      const participants = await Participant.find({ roomId: room._id });
      if (participants.length < 1) {
        throw new Error('Need at least one participant to start');
      }

      // Update room status
      room.status = 'in_progress';
      room.startTime = new Date();
      await room.save();

      // Update all participants status
      await Participant.updateMany(
        { roomId: room._id },
        { status: 'playing' }
      );

      return room;
    } catch (error) {
      console.error('Error starting room:', error);
      throw error;
    }
  }

  /**
   * Submit an answer for a participant
   */
  async submitAnswer(code, userId, questionId, answerId) {
    try {
      const room = await this.getRoomByCode(code);
      
      // Check if room is in progress
      if (room.status !== 'in_progress') {
        throw new Error('Room is not in progress');
      }

      // Find participant
      const participant = await Participant.findOne({ 
        roomId: room._id,
        userId
      });
      
      if (!participant) {
        throw new Error('User not in room');
      }

      // Get quiz to verify answer
      const quiz = await Quiz.findById(room.quizId);
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      // Find the question
      const question = quiz.questions.id(questionId);
      if (!question) {
        throw new Error('Question not found');
      }

      // Find the correct answer
      const correctAnswer = question.options.find(opt => opt.isCorrect);
      const isCorrect = correctAnswer && correctAnswer._id.toString() === answerId;

      // Check if question already answered
      const existingAnswer = participant.answers.find(a => a.questionId.toString() === questionId);
      if (existingAnswer) {
        throw new Error('Question already answered');
      }

      // Add answer to participant's answers
      participant.answers.push({
        questionId,
        answerId,
        isCorrect,
        timeSpent: (new Date() - room.startTime) / 1000 // in seconds
      });

      // Update score
      if (isCorrect) {
        participant.score += 10;
      }

      await participant.save();

      return participant;
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  }

  /**
   * End a room and calculate results
   */
  async endRoom(code, userId) {
    try {
      const room = await this.getRoomByCode(code);
      
      // Verify user is host
      if (room.hostId._id.toString() !== userId.toString()) {
        throw new Error('Only host can end the room');
      }

      // Update room status
      room.status = 'completed';
      room.endTime = new Date();
      await room.save();

      // Get all participants
      const participants = await Participant.find({ roomId: room._id })
        .populate('userId', 'username email profilePicture');

      // Sort by score and update ranks
      participants.sort((a, b) => b.score - a.score);
      
      for (let i = 0; i < participants.length; i++) {
        participants[i].rank = i + 1;
        participants[i].status = 'completed';
        await participants[i].save();
      }

      return {
        room,
        participants
      };
    } catch (error) {
      console.error('Error ending room:', error);
      throw error;
    }
  }

  /**
   * Get room participants
   */
  async getRoomParticipants(code) {
    try {
      const room = await this.getRoomByCode(code);
      
      const participants = await Participant.find({ roomId: room._id })
        .populate('userId', 'username email profilePicture')
        .sort({ score: -1 });
      
      return participants;
    } catch (error) {
      console.error('Error getting room participants:', error);
      throw error;
    }
  }

  /**
   * Get user's active rooms
   */
  async getUserRooms(userId) {
    try {
      // Find all rooms where user is a participant
      const participations = await Participant.find({ userId });
      const roomIds = participations.map(p => p.roomId);
      
      // Get rooms that are not expired or completed
      const rooms = await Room.find({
        _id: { $in: roomIds },
        status: { $in: ['waiting', 'in_progress'] }
      })
      .populate('hostId', 'username email profilePicture')
      .populate('quizId', 'title description')
      .sort({ createdAt: -1 });
      
      return rooms;
    } catch (error) {
      console.error('Error getting user rooms:', error);
      throw error;
    }
  }
}

module.exports = new RoomService(); 