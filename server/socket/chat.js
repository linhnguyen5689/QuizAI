const Chat = require('../models/Chat');
const User = require('../models/User');

/**
 * Setup chat-related socket handlers
 * @param {Object} io - Socket.io instance
 * @param {Object} socket - Socket connection
 */
function setupChatHandlers(io, socket) {
  // Xử lý tin nhắn trực tiếp
  socket.on("private-message", async (data) => {
    try {
      const { to: receiverId, content, tempId } = data;
      const senderId = socket.userId;

      // Tìm hoặc tạo cuộc trò chuyện
      let chat = await Chat.findOne({
        type: 'direct',
        participants: { $all: [senderId, receiverId] }
      });

      if (!chat) {
        chat = new Chat({
          type: 'direct',
          participants: [senderId, receiverId],
          messages: []
        });
      }

      // Thêm tin nhắn mới
      const message = {
        sender: senderId,
        content,
        read: false
      };
      chat.messages.push(message);
      chat.lastMessage = new Date();
      await chat.save();

      // Lấy tin nhắn đã lưu với ID
      const savedMessage = chat.messages[chat.messages.length - 1];

      // Lấy thông tin người gửi
      const sender = await User.findById(senderId).select('username email profilePicture');

      const messageData = {
        _id: savedMessage._id,
        tempId, // Trả về tempId để client cập nhật tin nhắn tạm thời
        sender: senderId,
        senderName: sender.username,
        content: savedMessage.content,
        createdAt: savedMessage.createdAt,
        read: savedMessage.read
      };

      // Gửi cho người nhận
      io.to(receiverId).emit("private-message", {
        message: messageData,
        from: senderId
      });

      // Gửi xác nhận lại cho người gửi
      socket.emit("private-message", {
        message: messageData,
        from: senderId,
        to: receiverId
      });
    } catch (error) {
      console.error("Error in private-message event:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Xử lý tin nhắn phòng
  socket.on("room-message", async (data) => {
    try {
      const { roomCode, content, tempId } = data;
      const senderId = socket.userId;

      // Tìm chat phòng
      let chat = await Chat.findOne({
        type: 'room',
        roomId: roomCode
      });

      if (!chat) {
        chat = new Chat({
          type: 'room',
          roomId: roomCode,
          participants: [], // Có thể cập nhật danh sách tham gia nếu cần
          messages: []
        });
      }

      // Thêm tin nhắn mới
      const message = {
        sender: senderId,
        content,
        read: true // Tin nhắn phòng luôn được đánh dấu đã đọc
      };
      chat.messages.push(message);
      chat.lastMessage = new Date();
      await chat.save();

      // Lấy tin nhắn đã lưu
      const savedMessage = chat.messages[chat.messages.length - 1];

      // Lấy thông tin người gửi
      const sender = await User.findById(senderId).select('username email profilePicture');

      const messageData = {
        _id: savedMessage._id,
        tempId, // Trả về tempId
        sender: senderId,
        senderName: sender.username,
        content: savedMessage.content,
        createdAt: savedMessage.createdAt
      };

      // Phát tin nhắn cho tất cả trong phòng
      io.to(roomCode).emit("room-message", {
        message: messageData,
        roomCode
      });
    } catch (error) {
      console.error("Error in room-message event:", error);
      socket.emit("error", { message: "Failed to send room message" });
    }
  });

  // Xử lý typing indicators cho direct messages
  socket.on("typing", async (data) => {
    const { to: receiverId } = data;
    io.to(receiverId).emit("user-typing", {
      userId: socket.userId,
      username: socket.username
    });
  });

  // Xử lý stop typing cho direct messages
  socket.on("stop-typing", async (data) => {
    const { to: receiverId } = data;
    io.to(receiverId).emit("user-stop-typing", {
      userId: socket.userId,
      username: socket.username
    });
  });

  // Xử lý typing indicators cho room messages
  socket.on("typing-room-chat", (roomCode) => {
    socket.to(roomCode).emit("user-typing", {
      userId: socket.userId,
      username: socket.username,
      roomCode
    });
  });

  // Xử lý stop typing cho room messages
  socket.on("stop-typing-room-chat", (roomCode) => {
    socket.to(roomCode).emit("user-stop-typing", {
      userId: socket.userId,
      username: socket.username,
      roomCode
    });
  });
}

module.exports = setupChatHandlers; 