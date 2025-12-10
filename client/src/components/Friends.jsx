import { useState, useEffect, useRef } from "react";
import chatService from "../services/chatService";
import { useNavigate, Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import {
  FaGamepad,
  FaStar,
  FaTrophy,
  FaUsers,
  FaSignOutAlt,
  FaUser,
  FaUserFriends,
  FaMedal,
  FaUserCog,
  FaComment,
  FaSearch,
  FaUserPlus,
  FaBell,
} from "react-icons/fa";
import "../styles/Dashboard.css";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = "http://localhost:5000/api";

function Friends({ user }) {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("friends");
  const searchTimeout = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const selectedFriendRef = useRef(selectedFriend);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const typingTimeoutRef = useRef(null);

  // Lấy danh sách bạn bè
  useEffect(() => {
    if (!user?.token) return;
    axios.get(`${API_URL}/friends`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(res => setFriends(res.data))
      .catch(() => setFriends([]));
  }, [user?.token]);

  // Lấy danh sách lời mời kết bạn
  useEffect(() => {
    if (!user?.token) return;
    axios.get(`${API_URL}/friends/requests`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(res => setFriendRequests(res.data))
      .catch(() => setFriendRequests([]));
  }, [user?.token]);

  // Tìm kiếm bạn bè
  useEffect(() => {
    if (!searchTerm || activeTab !== "search" || !user?.token) {
      setSearchResults([]);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/users/search?query=${encodeURIComponent(searchTerm)}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSearchResults(res.data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(searchTimeout.current);
  }, [searchTerm, activeTab, user?.token]);

  // Khi chọn bạn bè, load lịch sử chat
  useEffect(() => {
    if (!selectedFriend || !user?.token) {
      setChatMessages([]);
      return;
    }
    const fetchChat = async () => {
      try {
        setLoading(true);
        const messages = await chatService.getChatHistory(selectedFriend._id);
        setChatMessages(messages);
      } catch {
        setChatMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChat();
  }, [selectedFriend, user?.token]);

  // Lắng nghe tin nhắn mới real-time (chỉ 1 lần duy nhất)
  useEffect(() => {
    selectedFriendRef.current = selectedFriend;
  }, [selectedFriend]);

  useEffect(() => {
    const handleNewMessage = (msg) => {
      console.log("Received new message:", msg);

      const friend = selectedFriendRef.current;
      if (!friend) return;

      // Chuẩn hóa ID người gửi để đảm bảo đúng dạng chuỗi
      const senderId = typeof msg.sender === 'object' && msg.sender !== null
        ? msg.sender._id || msg.sender.id || msg.sender.toString()
        : String(msg.sender);

      const userId = String(user._id);
      const friendId = String(friend._id);

      // Ghi log để debug
      console.log("SenderId:", senderId);
      console.log("UserId:", userId);
      console.log("FriendId:", friendId);

      const isFromSelectedFriend = senderId === friendId;
      const isFromMe = senderId === userId;

      // Nếu là tin nhắn giữa người dùng và người bạn đang chat
      if (isFromSelectedFriend || isFromMe) {
        setChatMessages(prev => {
          // Check if message already exists to avoid duplicates
          const messageExists = prev.some(m => {
            // Chuẩn hóa ID để kiểm tra trùng lặp
            const mSenderId = typeof m.sender === 'object' && m.sender !== null
              ? m.sender._id || m.sender.id || m.sender.toString()
              : String(m.sender);

            return (
              m._id === msg._id ||
              (m.content === msg.content &&
                mSenderId === senderId &&
                Math.abs(new Date(m.createdAt) - new Date(msg.createdAt)) < 5000)
            );
          });

          if (messageExists) return prev;
          return [...prev, { ...msg, sender: senderId }];
        });

        // Ensure scroll to bottom after message is added
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    };

    // Set up socket listeners for real-time communication
    chatService.onNewMessage(handleNewMessage);

    return () => {
      // Clean up listeners
      chatService.offNewMessage(handleNewMessage);
    };
  }, [user?._id]);

  // Auto scroll chat on messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Lắng nghe trạng thái đang nhập
  useEffect(() => {
    const handleTyping = (data) => {
      if (data.senderId === selectedFriend?._id) {
        setTypingUsers(prev => new Set([...prev, selectedFriend._id]));
        // Tự động xóa trạng thái sau 3 giây
        setTimeout(() => {
          setTypingUsers(prev => {
            const newSet = new Set([...prev]);
            newSet.delete(selectedFriend._id);
            return newSet;
          });
        }, 3000);
      }
    };

    const handleStopTyping = (data) => {
      if (data.senderId === selectedFriend?._id) {
        setTypingUsers(prev => {
          const newSet = new Set([...prev]);
          newSet.delete(selectedFriend._id);
          return newSet;
        });
      }
    };

    chatService.onTyping(handleTyping);
    chatService.onStopTyping(handleStopTyping);

    return () => {
      chatService.onTyping(() => { });
      chatService.onStopTyping(() => { });
    };
  }, [selectedFriend]);

  // Xử lý trạng thái đang nhập
  const handleTyping = () => {
    if (!selectedFriend) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    chatService.sendTypingStatus(selectedFriend._id);

    // Gửi thông báo dừng nhập sau 1 giây không gõ
    typingTimeoutRef.current = setTimeout(() => {
      chatService.sendStopTypingStatus(selectedFriend._id);
    }, 1000);
  };

  // Gửi tin nhắn
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedFriend || !newMessage.trim() || !user) return;
    const messageContent = newMessage.trim();
    setNewMessage("");

    // Gửi thông báo dừng nhập
    chatService.sendStopTypingStatus(selectedFriend._id);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Add a temporary local message for immediate feedback
    const tempMsg = {
      _id: `temp-${Date.now()}`,
      content: messageContent,
      sender: String(user._id),  // Đảm bảo ID người gửi luôn ở dạng string
      createdAt: new Date().toISOString(),
      isTemp: true
    };

    setChatMessages(prev => [...prev, tempMsg]);

    try {
      await chatService.sendPrivateMessage(selectedFriend._id, messageContent);
      // Real message will be added via socket event
    } catch (error) {
      console.error("Send message failed:", error);
      // Keep the temp message but mark as failed
      setChatMessages(prev =>
        prev.map(m => m._id === tempMsg._id ? { ...m, failed: true } : m)
      );
      toast.error("Không thể gửi tin nhắn!");
    }
  };

  // Chọn bạn để chat
  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
    setChatMessages([]);
  };

  // Toggle dropdown menu
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Gửi lời mời kết bạn
  const handleAddFriend = async (friendId) => {
    try {
      setSearchResults(prev => prev.map(u => u._id === friendId ? { ...u, requestSent: true } : u));
      await axios.post(`${API_URL}/friends/request/${friendId}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      toast.success("Đã gửi lời mời kết bạn!");
    } catch {
      setSearchResults(prev => prev.map(u => u._id === friendId ? { ...u, requestSent: false } : u));
      toast.error("Không thể gửi lời mời!");
    }
  };

  // Chấp nhận lời mời kết bạn
  const handleAccept = async (requestId) => {
    try {
      await axios.put(`${API_URL}/friends/request/${requestId}`,
        { accept: true },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setFriendRequests(prev => prev.filter(r => r._id !== requestId));
      toast.success("Đã chấp nhận lời mời!");
    } catch {
      toast.error("Không thể chấp nhận lời mời!");
    }
  };

  // Từ chối lời mời kết bạn
  const handleReject = async (requestId) => {
    try {
      await axios.put(`${API_URL}/friends/request/${requestId}`,
        { accept: false },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setFriendRequests(prev => prev.filter(r => r._id !== requestId));
      toast.success("Đã từ chối lời mời!");
    } catch {
      toast.error("Không thể từ chối lời mời!");
    }
  };

  // Lọc bạn bè theo searchTerm (ưu tiên displayName, fallback sang username)
  const filteredFriends = friends.filter(friend => {
    const name = friend.displayName || friend.username || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Render UI (phần chat)
  return (
    <div className="relative w-screen min-h-screen overflow-x-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Animated SVG background */}
      <svg
        className="absolute top-0 left-0 z-0 w-full h-full pointer-events-none"
        style={{ filter: "blur(2px)" }}
      >
        <defs>
          <radialGradient id="g1" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#f472b6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="80%" cy="20%" r="300" fill="url(#g1)">
          <animate
            attributeName="cx"
            values="80%;20%;80%"
            dur="12s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="20%" cy="80%" r="200" fill="url(#g1)">
          <animate
            attributeName="cy"
            values="80%;20%;80%"
            dur="16s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              className="mr-4 px-4 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
              onClick={() => navigate('/dashboard')}
              aria-label="Back to dashboard"
            >
              <FiArrowLeft className="w-6 h-6" />
            </button>

            <h1 className="flex items-center gap-3 text-4xl font-extrabold text-transparent md:text-5xl font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 drop-shadow-lg">
              <FaUserFriends className="inline-block text-yellow-300 animate-bounce" />
              Friends
              <FaStar className="inline-block text-pink-300 animate-spin-slow" />
            </h1>
          </div>

          <div className="relative user-info" ref={dropdownRef}>
            <div
              className="flex items-center gap-3 cursor-pointer avatar-container transition-all hover:scale-105"
              onClick={toggleDropdown}
            >
              <img
                src={user?.profilePicture || "/images/df_avatar.png"}
                alt="User Avatar"
                className="w-12 h-12 border-2 rounded-full shadow-lg border-pink-400/40"
              />
              <span className="text-white username font-orbitron">
                {user?.username || "User"}
              </span>
            </div>

            {dropdownOpen && (
              <div
                className="absolute right-0 z-20 w-64 mt-2 overflow-hidden border-2 shadow-2xl top-16 bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-2xl border-pink-400/40"
              >
                {/* Dropdown content */}
                <div className="flex items-center gap-3 p-4 border-b dropdown-header border-pink-400/40">
                  <img
                    src={user?.profilePicture || "/images/df_avatar.png"}
                    alt="User Avatar"
                    className="w-12 h-12 border-2 rounded-full border-pink-400/40"
                  />
                  <div className="dropdown-header-info">
                    <div className="text-pink-200 dropdown-header-name font-orbitron">
                      {user?.username || "User"}
                    </div>
                    <div className="text-sm dropdown-header-email font-orbitron text-pink-300/80">
                      {user?.email || "user@example.com"}
                    </div>
                  </div>
                </div>

                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 dropdown-item hover:bg-black/20"
                >
                  <div className="dropdown-item-icon">
                    <FaUser className="w-5 h-5 text-yellow-400" />
                  </div>
                  <span className="text-pink-200 dropdown-item-text font-orbitron">
                    Profile
                  </span>
                </Link>

                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 px-4 py-3 dropdown-item hover:bg-black/20"
                >
                  <div className="dropdown-item-icon">
                    <FaGamepad className="w-5 h-5 text-yellow-400" />
                  </div>
                  <span className="text-pink-200 dropdown-item-text font-orbitron">
                    Dashboard
                  </span>
                </Link>

                <Link
                  to="/achievements"
                  className="flex items-center gap-3 px-4 py-3 dropdown-item hover:bg-black/20"
                >
                  <div className="dropdown-item-icon">
                    <FaMedal className="w-5 h-5 text-yellow-400" />
                  </div>
                  <span className="text-pink-200 dropdown-item-text font-orbitron">
                    Achievements
                  </span>
                </Link>

                {/* Admin link - only shown for admin users */}
                {user?.accountType === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 px-4 py-3 dropdown-item hover:bg-black/20"
                  >
                    <div className="dropdown-item-icon">
                      <FaUserCog className="w-5 h-5 text-yellow-400" />
                    </div>
                    <span className="text-pink-200 dropdown-item-text font-orbitron">
                      Admin Panel
                    </span>
                  </Link>
                )}

                <div className="border-t dropdown-divider border-pink-400/40"></div>

                <button
                  onClick={handleLogout}
                  className="flex items-center w-full gap-3 px-4 py-3 text-left dropdown-item hover:bg-black/20"
                >
                  <div className="dropdown-item-icon">
                    <FaSignOutAlt className="w-5 h-5 text-yellow-400" />
                  </div>
                  <span className="text-pink-200 dropdown-item-text font-orbitron">
                    Logout
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div
          className="p-2 mb-6 border-2 shadow-xl tab-container bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-2xl border-pink-400/40"
        >
          <button
            className={`tab-button ${activeTab === "friends" ? "active" : ""}`}
            onClick={() => setActiveTab("friends")}
          >
            <FaUserFriends className="w-5 h-5" />
            Friends List
          </button>

          <button
            className={`tab-button ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            <FaBell className="w-5 h-5" />
            Friend Request
            {friendRequests.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {friendRequests.length}
              </span>
            )}
          </button>

          <button
            className={`tab-button ${activeTab === "search" ? "active" : ""}`}
            onClick={() => setActiveTab("search")}
          >
            <FaSearch className="w-5 h-5" />
            Search
          </button>
        </div>

        {/* Tab content */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Friends/Requests/Search List */}
          <div className="w-full md:w-1/3">
            {activeTab === "friends" && (
              <div>
                <input
                  type="text"
                  className="w-full px-4 py-2 mb-4 text-white bg-indigo-900 border-2 rounded-xl border-pink-400/40 focus:outline-none focus:ring-2 focus:ring-pink-400/60 font-orbitron"
                  placeholder="Search friends..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <ul className="space-y-2">
                  {filteredFriends.length === 0 && (
                    <li className="text-pink-200 font-orbitron">Không có bạn bè nào.</li>
                  )}
                  {filteredFriends.map(friend => (
                    <li
                      key={friend._id}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-pink-400/10 transition-all ${selectedFriend?._id === friend._id ? 'bg-pink-400/20' : ''}`}
                      onClick={() => handleSelectFriend(friend)}
                    >
                      <img
                        src={friend.profilePicture || "/images/df_avatar.png"}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full border-2 border-pink-400/40"
                      />
                      <span className="text-white font-orbitron">{friend.displayName || friend.username}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {activeTab === "requests" && (
              <div>
                <ul className="space-y-2">
                  {friendRequests.length === 0 && (
                    <li className="text-pink-200 font-orbitron">You have no friend requests.</li>
                  )}
                  {friendRequests.map(req => (
                    <li key={req._id} className="flex items-center gap-3 p-3 rounded-xl bg-pink-400/10">
                      <img
                        src={req.sender?.profilePicture || "/images/df_avatar.png"}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full border-2 border-pink-400/40"
                      />
                      <span className="text-white font-orbitron">{req.sender?.displayName || req.sender?.username}</span>
                      <button
                        className="ml-auto px-3 py-1 bg-green-500 text-white rounded-xl font-orbitron hover:bg-green-600"
                        onClick={() => handleAccept(req._id)}
                      >Chấp nhận</button>
                      <button
                        className="ml-2 px-3 py-1 bg-red-500 text-white rounded-xl font-orbitron hover:bg-red-600"
                        onClick={() => handleReject(req._id)}
                      >Từ chối</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {activeTab === "search" && (
              <div>
                <input
                  type="text"
                  className="w-full px-4 py-2 mb-4 text-white bg-indigo-900 border-2 rounded-xl border-pink-400/40 focus:outline-none focus:ring-2 focus:ring-pink-400/60 font-orbitron"
                  placeholder="Search by username..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                {loading && <div className="text-pink-200 font-orbitron">Đang tìm kiếm...</div>}
                <ul className="space-y-2">
                  {searchResults.length === 0 && !loading && (
                    <li className="text-pink-200 font-orbitron">User not found.</li>
                  )}
                  {searchResults.map(u => (
                    <li key={u._id} className="flex items-center gap-3 p-3 rounded-xl bg-pink-400/10">
                      <img
                        src={u.profilePicture || "/images/df_avatar.png"}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full border-2 border-pink-400/40"
                      />
                      <span className="text-white font-orbitron">{u.displayName || u.username}</span>
                      <button
                        className="ml-auto px-3 py-1 bg-blue-500 text-white rounded-xl font-orbitron hover:bg-blue-600 disabled:opacity-50"
                        onClick={() => handleAddFriend(u._id)}
                        disabled={u.requestSent}
                      >{u.requestSent ? 'Đã gửi' : 'Kết bạn'}</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right: Chat Window */}
          <div className="w-full md:w-2/3">
            {selectedFriend ? (
              <div className="flex flex-col h-[70vh] bg-gradient-to-br from-indigo-800/80 via-purple-800/80 to-pink-800/80 rounded-2xl border-2 border-pink-400/40 shadow-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={selectedFriend.profilePicture || "/images/df_avatar.png"}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full border-2 border-pink-400/40"
                  />
                  <span className="text-white text-lg font-orbitron font-bold">{selectedFriend.displayName || selectedFriend.username}</span>
                </div>
                <div className="flex-1 overflow-y-auto mb-4 pr-2 messages-container">
                  <ul className="space-y-2">
                    {chatMessages.length === 0 && (
                      <li className="text-pink-200 font-orbitron">Chưa có tin nhắn nào.</li>
                    )}
                    {chatMessages.map((msg, index) => {
                      // Chuẩn hóa ID người gửi sang dạng string để so sánh
                      const senderId = typeof msg.sender === 'object' && msg.sender !== null
                        ? msg.sender._id || msg.sender.id || msg.sender.toString()
                        : String(msg.sender);

                      const isMe = senderId === String(user._id);

                      return (
                        <li
                          key={msg._id || `${senderId}-${msg.createdAt}-${index}`}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}
                        >
                          <div className={`max-w-xs px-4 py-2 rounded-2xl shadow font-orbitron 
                            ${isMe
                              ? 'bg-pink-500 text-white rounded-br-none'
                              : 'bg-indigo-500 text-white rounded-bl-none'}
                            ${msg.failed ? 'opacity-60' : ''}`}
                          >
                            <span>{msg.content}</span>
                            <div className="text-xs text-pink-100/80 mt-1 text-right flex items-center justify-end">
                              {msg.failed && <span className="mr-1 text-red-200">⚠️</span>}
                              {msg.isTemp ? "Đang gửi..." : new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </ul>
                </div>

                {/* Typing indicator */}
                {typingUsers.size > 0 && (
                  <div className="px-4 py-2 text-sm text-pink-300/80 font-orbitron animate-pulse">
                    {selectedFriend?.displayName || selectedFriend?.username} đang nhập...
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 text-white bg-indigo-900 border-2 rounded-xl border-pink-400/40 focus:outline-none focus:ring-2 focus:ring-pink-400/60 font-orbitron"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={handleTyping}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 text-white bg-pink-500 rounded-xl font-orbitron hover:bg-pink-600 disabled:opacity-50"
                    disabled={!newMessage.trim()}
                  >Send</button>
                </form>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-pink-200 font-orbitron text-xl">
                Select a friend to start chatting!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Friends;
