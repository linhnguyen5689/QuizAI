const Room = require('../models/Room');
const Participant = require('../models/Participant');

/**
 * Setup room-related socket handlers
 * @param {Object} io - Socket.io instance
 * @param {Object} socket - Socket connection
 */
function setupRoomHandlers(io, socket) {
  // Join a room
  socket.on("join-room", async (roomCode) => {
    try {
      console.log(`User ${socket.userId} joining room ${roomCode}`);
      // Add socket to room
      socket.join(roomCode);

      // Find the room
      const room = await Room.findOne({ code: roomCode });
      if (room) {
        // Notify others in the room
        socket.to(roomCode).emit("user-joined", {
          userId: socket.userId,
          username: socket.username,
        });

        // Get participants
        const participants = await Participant.find({
          roomId: room._id,
        }).populate("userId", "username email");

        // Send room data to the user who joined
        socket.emit("room-data", {
          room,
          participants,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error("Error in join-room event:", error);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  // Handle typing indicators for room chat
  socket.on("typing-room-chat", (roomCode) => {
    socket.to(roomCode).emit("user-typing", {
      userId: socket.userId,
      username: socket.username,
    });
  });

  // Handle stop typing for room chat
  socket.on("stop-typing-room-chat", (roomCode) => {
    socket.to(roomCode).emit("user-stop-typing", {
      userId: socket.userId,
      username: socket.username,
    });
  });
  
  // Handle disconnection for room participants
  socket.on("disconnect", async () => {
    console.log(`User disconnected from rooms: ${socket.userId}`);
    try {
      // Find rooms where this user is a participant
      const participantRooms = await Participant.find({
        userId: socket.userId,
      });

      for (const participantRoom of participantRooms) {
        const room = await Room.findById(participantRoom.roomId);
        if (room && room.status === "waiting") {
          // Notify others if in waiting room
          io.to(room.code).emit("user-left", {
            userId: socket.userId,
            username: socket.username,
          });
        }
      }
    } catch (error) {
      console.error("Error handling room disconnect:", error);
    }
  });
}

module.exports = setupRoomHandlers; 