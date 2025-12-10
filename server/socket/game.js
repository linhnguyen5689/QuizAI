const Room = require('../models/Room');
const Participant = require('../models/Participant');
const UserAchievement = require('../models/UserAchievement');
const { checkAndUpdateAchievements } = require('../controllers/achievementController');

/**
 * Setup game-related socket handlers
 * @param {Object} io - Socket.io instance
 * @param {Object} socket - Socket connection
 */
function setupGameHandlers(io, socket) {
  // Start the game
  socket.on("start-game", async (roomCode) => {
    try {
      console.log(`User ${socket.userId} starting game in room ${roomCode}`);
      
      // Get full room data with populated quiz and host details
      const room = await Room.findOne({ code: roomCode })
        .populate({
          path: 'quizId',
          select: 'title description questions timeLimit' // Include all quiz data
        })
        .populate('hostId', 'username email');
      
      if (!room) {
        console.log('Room not found:', roomCode);
        return socket.emit("error", { message: "Room not found" });
      }

      // Check if user is the host
      if (room.hostId._id.toString() !== socket.userId) {
        console.log('User is not host. Host:', room.hostId._id.toString(), 'User:', socket.userId);
        return socket.emit("error", {
          message: "Only host can start the game",
        });
      }

      // Check if room is already in progress
      if (room.status === 'in_progress') {
        console.log(`Room ${roomCode} is already in progress`);
        
        // Get participants
        const participants = await Participant.find({ roomId: room._id })
          .populate('userId', 'username email');
        
        // Still send the data to sync clients
        io.to(roomCode).emit("game-started", {
          room,
          quiz: room.quizId,
          participants,
          startTime: room.startTime,
        });
        return;
      }

      // Update room status to in_progress
      room.status = "in_progress";
      room.startTime = new Date();
      await room.save();

      // Get participants
      const participants = await Participant.find({ roomId: room._id })
        .populate('userId', 'username email');
      
      // Get quiz data
      const quiz = room.quizId;
      
      console.log('Sending game-started event with quiz data:', {
        hasQuiz: !!quiz,
        title: quiz?.title,
        questionCount: quiz?.questions?.length || 0
      });

      // Notify all clients in the room
      io.to(roomCode).emit("game-started", {
        room,
        quiz,
        participants,
        startTime: room.startTime,
      });
    } catch (error) {
      console.error("Error in start-game event:", error);
      socket.emit("error", { message: "Failed to start game: " + error.message });
    }
  });

  // Submit an answer
  socket.on("submit-answer", async (data) => {
    try {
      const { roomCode, questionId, answerId } = data;
      
      // Find the room
      const room = await Room.findOne({ code: roomCode });
      if (!room) {
        return socket.emit("error", { message: "Room not found" });
      }

      // Find the participant
      const participant = await Participant.findOne({
        roomId: room._id,
        userId: socket.userId,
      });

      if (!participant) {
        return socket.emit("error", { message: "Participant not found" });
      }

      // Process the answer (this would normally call your existing answer submission logic)
      // For now, we'll just acknowledge it and broadcast progress

      // Notify just the answering user
      socket.emit("answer-processed", {
        success: true,
        questionId,
        answerId,
      });

      // Notify everyone else that someone answered (without showing the answer)
      socket.to(roomCode).emit("user-answered", {
        userId: socket.userId,
        username: socket.username,
        questionId,
      });

      // Get updated participants to broadcast progress
      const participants = await Participant.find({
        roomId: room._id,
      }).populate("userId", "username email");

      // Broadcast progress to all clients in the room
      io.to(roomCode).emit("game-progress", {
        participants,
      });
    } catch (error) {
      console.error("Error in submit-answer event:", error);
      socket.emit("error", { message: "Failed to submit answer" });
    }
  });

  // End the game
  socket.on("end-game", async (roomCode) => {
    try {
      console.log(`User ${socket.userId} ending game in room ${roomCode}`);
      const room = await Room.findOne({ code: roomCode }).populate('quizId');
      if (!room) {
        console.log('End game: Room not found:', roomCode);
        return socket.emit("error", { message: "Room not found" });
      }

      // Check if user is the host
      if (room.hostId.toString() !== socket.userId) {
        console.log('End game: User is not host. Host:', room.hostId.toString(), 'User:', socket.userId);
        return socket.emit("error", {
          message: "Only host can end the game",
        });
      }

      console.log(`Ending game for room ${roomCode}. Current status: ${room.status}`);

      // Only end the game if it's in progress
      if (room.status !== 'in_progress') {
        console.log(`Cannot end game with status ${room.status}`);
        return socket.emit("error", { message: `Cannot end game with status ${room.status}` });
      }

      // Update room status to completed
      room.status = "completed";
      room.endTime = new Date();
      await room.save();

      console.log(`Room ${roomCode} status updated to completed`);

      // Get participants
      const participants = await Participant.find({
        roomId: room._id,
      }).populate("userId", "username email");

      console.log(`Found ${participants.length} participants for room ${roomCode}`);

      // Calculate ranks
      const sortedParticipants = [...participants].sort(
        (a, b) => b.score - a.score
      );
      for (let i = 0; i < sortedParticipants.length; i++) {
        sortedParticipants[i].rank = i + 1;
        await sortedParticipants[i].save();
      }

      console.log(`Emitting game-ended event for room ${roomCode}`);

      // Notify all clients in the room
      io.to(roomCode).emit("game-ended", {
        room,
        participants: sortedParticipants,
        endTime: room.endTime,
      });
    } catch (error) {
      console.error("Error in end-game event:", error);
      socket.emit("error", { message: "Failed to end game" });
    }
  });

  // Achievement notification
  socket.on("check-achievements", async () => {
    try {
      const previousAchievements = await UserAchievement.find({ userId: socket.userId });
      await checkAndUpdateAchievements(socket.userId);
      const currentAchievements = await UserAchievement.find({ userId: socket.userId })
        .populate('achievementId');

      // Find newly unlocked achievements
      const newAchievements = currentAchievements.filter(
        current => !previousAchievements.find(
          prev => prev.achievementId.toString() === current.achievementId._id.toString()
        )
      );

      // Notify user of new achievements
      if (newAchievements.length > 0) {
        socket.emit("achievements-unlocked", {
          achievements: newAchievements.map(ua => ({
            id: ua.achievementId._id,
            name: ua.achievementId.name,
            description: ua.achievementId.description,
            icon: ua.achievementId.icon
          }))
        });
      }
    } catch (error) {
      console.error("Error checking achievements:", error);
      socket.emit("error", { message: "Failed to check achievements" });
    }
  });
}

module.exports = setupGameHandlers; 