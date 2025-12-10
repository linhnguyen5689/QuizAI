const Multiplayer = require('../models/Multiplayer');
const Quiz = require('../models/Quiz');
const { generateRoomCode } = require('../utils/helpers');

class MultiplayerService {
  async createRoom(userId, quizId, settings = {}) {
    try {
      // Verify quiz exists
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      // Create new room
      const room = await Multiplayer.create({
        roomCode: generateRoomCode(),
        host: userId,
        quiz: quizId,
        settings: {
          maxParticipants: settings.maxParticipants || 4,
          timeLimit: settings.timeLimit || 30,
          randomizeQuestions: settings.randomizeQuestions ?? true,
          showResults: settings.showResults ?? true
        }
      });

      // Add host as first participant
      await this.joinRoom(room.roomCode, userId);

      return room;
    } catch (error) {
      console.error('Error creating multiplayer room:', error);
      throw error;
    }
  }

  async joinRoom(roomCode, userId) {
    try {
      const room = await Multiplayer.findOne({ roomCode });
      if (!room) {
        throw new Error('Room not found');
      }

      // Check if room is full
      if (room.participants.length >= room.settings.maxParticipants) {
        throw new Error('Room is full');
      }

      // Check if user is already in the room
      if (room.participants.some(p => p.user.toString() === userId)) {
        throw new Error('User already in room');
      }

      // Add user to participants
      room.participants.push({
        user: userId,
        joinedAt: new Date()
      });

      await room.save();

      return room;
    } catch (error) {
      console.error('Error joining multiplayer room:', error);
      throw error;
    }
  }

  async startGame(roomCode, userId) {
    try {
      const room = await Multiplayer.findOne({ roomCode });
      if (!room) {
        throw new Error('Room not found');
      }

      // Verify user is host
      if (room.host.toString() !== userId) {
        throw new Error('Only host can start the game');
      }

      // Check if minimum players are ready
      const readyPlayers = room.participants.filter(p => p.status === 'ready');
      if (readyPlayers.length < 2) {
        throw new Error('Need at least 2 players to start');
      }

      // Update room status
      room.status = 'starting';
      room.startTime = new Date();
      await room.save();

      // Start game after 5 seconds
      setTimeout(async () => {
        room.status = 'in_progress';
        await room.save();
      }, 5000);

      return room;
    } catch (error) {
      console.error('Error starting multiplayer game:', error);
      throw error;
    }
  }

  async submitAnswer(roomCode, userId, questionId, selectedAnswer) {
    try {
      const room = await Multiplayer.findOne({ roomCode });
      if (!room) {
        throw new Error('Room not found');
      }

      // Find participant
      const participant = room.participants.find(p => p.user.toString() === userId);
      if (!participant) {
        throw new Error('User not in room');
      }

      // Check if question already answered
      if (participant.answers.some(a => a.questionId.toString() === questionId)) {
        throw new Error('Question already answered');
      }

      // Get quiz to verify answer
      const quiz = await Quiz.findById(room.quiz);
      const question = quiz.questions.find(q => q._id.toString() === questionId);
      if (!question) {
        throw new Error('Question not found');
      }

      // Check if answer is correct
      const isCorrect = question.correctAnswer.toString() === selectedAnswer;

      // Add answer to participant's answers
      participant.answers.push({
        questionId,
        selectedAnswer,
        isCorrect,
        timeSpent: Date.now() - room.startTime
      });

      // Update score
      participant.score += isCorrect ? 10 : 0;

      await room.save();

      return room;
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  }

  async finishGame(roomCode, userId) {
    try {
      const room = await Multiplayer.findOne({ roomCode });
      if (!room) {
        throw new Error('Room not found');
      }

      // Verify user is host
      if (room.host.toString() !== userId) {
        throw new Error('Only host can finish the game');
      }

      // Calculate final results
      const results = room.participants
        .map(p => ({
          user: p.user,
          score: p.score,
          timeTaken: Date.now() - room.startTime
        }))
        .sort((a, b) => b.score - a.score)
        .map((result, index) => ({
          ...result,
          rank: index + 1
        }));

      // Update room status and results
      room.status = 'finished';
      room.endTime = new Date();
      room.results = results;
      await room.save();

      return room;
    } catch (error) {
      console.error('Error finishing multiplayer game:', error);
      throw error;
    }
  }

  async getRoomStatus(roomCode) {
    try {
      const room = await Multiplayer.findOne({ roomCode })
        .populate('participants.user', 'username')
        .populate('quiz', 'title category');

      if (!room) {
        throw new Error('Room not found');
      }

      return {
        roomCode: room.roomCode,
        status: room.status,
        host: room.host,
        participants: room.participants.map(p => ({
          user: p.user,
          status: p.status,
          score: p.score
        })),
        settings: room.settings,
        startTime: room.startTime,
        endTime: room.endTime,
        results: room.results
      };
    } catch (error) {
      console.error('Error getting room status:', error);
      throw error;
    }
  }
}

module.exports = new MultiplayerService(); 