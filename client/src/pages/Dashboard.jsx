import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  deleteQuiz,
  getUserSubmissions,
  getPublicQuizzes,
  getUserQuizzes,
} from "../services/api";
import QuizCard from "../components/QuizCard";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import CreateQuizModal from "../components/CreateQuizModal";
import SearchBar from "../components/SearchBar";
import "../styles/Dashboard.css";
import PaginatedSubmissionsTable from "../components/PaginatedSubmissionsTable";
import CollapsibleSubmissionsTable from "../components/CollapsibleSubmissionsTable";
import Leaderboard from "../components/Leaderboard";
import {
  FaGamepad,
  FaStar,
  FaTrophy,
  FaUsers,
  FaDoorOpen,
  FaSignOutAlt,
  FaUser,
  FaUserFriends,
  FaMedal,
  FaUserCog,
  FaEdit,
} from "react-icons/fa";

const Dashboard = ({ user, logout }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [publicQuizzes, setPublicQuizzes] = useState([]);
  const [filteredPublicQuizzes, setFilteredPublicQuizzes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState("quizzes");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCreateQuizModalOpen, setIsCreateQuizModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get user's quizzes
        const quizzesResponse = await getUserQuizzes();
        if (!quizzesResponse.success) {
          throw new Error(quizzesResponse.message || "Failed to load quizzes");
        }
        setQuizzes(quizzesResponse.data || []);
        setFilteredQuizzes(quizzesResponse.data || []);

        // Get public quizzes
        const publicQuizzesResponse = await getPublicQuizzes();
        if (publicQuizzesResponse.success) {
          setPublicQuizzes(publicQuizzesResponse.data || []);
          setFilteredPublicQuizzes(publicQuizzesResponse.data || []);
        }

        // Get submissions
        const submissionsResponse = await getUserSubmissions();
        setSubmissions(submissionsResponse.data || []);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(
          error.message || "Failed to load dashboard data. Please try again."
        );
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDeleteQuiz = async (quizId) => {
    if (!quizId) {
      toast.error("Invalid quiz ID");
      return;
    }

    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        await deleteQuiz(quizId);

        // Update UI after successful deletion
        setQuizzes((prevQuizzes) =>
          prevQuizzes.filter((quiz) => quiz._id !== quizId)
        );

        // Also update filtered quizzes to ensure it disappears from search results immediately
        setFilteredQuizzes((prevFilteredQuizzes) =>
          prevFilteredQuizzes.filter((quiz) => quiz._id !== quizId)
        );

        // Show success message
        toast.success("Quiz deleted successfully");
      } catch (error) {
        console.error("Error deleting quiz:", error);

        // Extract error message from response
        const errorMessage = error.response?.data?.message || "Failed to delete quiz";
        toast.error(errorMessage);

        // If the error is about authorization, show a more specific message
        if (errorMessage.includes("Not authorized")) {
          toast.error("You don't have permission to delete this quiz");
        }
      }
    }
  };

  // Check if user is creator of a quiz
  const isCreator = (quiz) => {
    try {
      // If no user or quiz, return false
      if (!user || !quiz) {
        return false;
      }

      const userId = user._id;
      // Ensure userId is a string
      const userIdStr = typeof userId === 'string' ? userId : String(userId);

      // Process createdBy based on its structure
      if (!quiz.createdBy) {
        return false;
      }

      // Case 1: createdBy is a string
      if (typeof quiz.createdBy === 'string') {
        return quiz.createdBy === userIdStr;
      }

      // Case 2: createdBy is an object
      if (typeof quiz.createdBy === 'object' && quiz.createdBy !== null) {
        // Get ID from object
        let creatorId = quiz.createdBy._id;

        // If no _id, return false
        if (!creatorId) {
          return false;
        }

        // Ensure creatorId is a string
        const creatorIdStr = typeof creatorId === 'string' ? creatorId : String(creatorId);

        return creatorIdStr === userIdStr;
      }

      // Default to false
      return false;
    } catch (error) {
      console.error('Error in isCreator function:', error);
      return false;
    }
  };

  // Toggle dropdown menu
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get first letter of username for avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  // Log ra console để debug dữ liệu quiz
  console.log("Danh sách quizzes:", quizzes);
  const validQuizzes = Array.isArray(quizzes)
    ? quizzes.filter(
      (quiz) => typeof quiz._id === "string" && quiz._id.trim() !== ""
    )
    : [];
  const invalidQuizzes = Array.isArray(quizzes)
    ? quizzes.filter(
      (quiz) =>
        !quiz._id || typeof quiz._id !== "string" || quiz._id.trim() === ""
    )
    : [];
  if (invalidQuizzes.length > 0) {
    console.warn("Quiz bị thiếu _id:", invalidQuizzes);
  }

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredQuizzes(quizzes);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = quizzes.filter(quiz =>
      quiz.title.toLowerCase().includes(searchLower) ||
      quiz.description?.toLowerCase().includes(searchLower) ||
      quiz.category?.toLowerCase().includes(searchLower)
    );
    setFilteredQuizzes(filtered);
  };

  const handlePublicSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredPublicQuizzes(publicQuizzes);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = publicQuizzes.filter(quiz =>
      quiz.title.toLowerCase().includes(searchLower) ||
      quiz.description?.toLowerCase().includes(searchLower) ||
      quiz.category?.toLowerCase().includes(searchLower)
    );
    setFilteredPublicQuizzes(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-screen min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 text-center border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40"
        >
          <p className="mb-4 text-xl text-pink-200 font-orbitron">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="flex items-center gap-3 text-4xl font-extrabold text-transparent md:text-5xl font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 drop-shadow-lg">
            <FaGamepad className="inline-block text-yellow-300 animate-bounce" />
            Dashboard
            <FaStar className="inline-block text-pink-300 animate-spin-slow" />
          </h1>

          <div className="relative user-info" ref={dropdownRef}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 cursor-pointer avatar-container"
              onClick={toggleDropdown}
            >
              <img
                src={user?.profilePicture || "/images/df_avatar.png"}
                alt="User Avatar"
                className="w-12 h-12 border-2 rounded-full shadow-lg border-pink-400/40"
              />
              <span className="text-black username font-orbitron">
                {user?.username || "User"}
              </span>
            </motion.div>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 z-20 w-64 mt-2 overflow-hidden border-2 shadow-2xl top-16 bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-2xl border-pink-400/40"
                >
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
                    to="/friends"
                    className="flex items-center gap-3 px-4 py-3 dropdown-item hover:bg-black/20 "
                  >
                    <div className="dropdown-item-icon">
                      <FaUserFriends className="w-5 h-5 text-yellow-400" />
                    </div>
                    <span className="text-pink-200 dropdown-item-text font-orbitron ">
                      Friends
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

                  <Link
                    to="/achievements"
                    className="flex items-center gap-3 px-4 py-3 dropdown-item hover:bg-black/20"
                  >
                    <div className="dropdown-item-icon">
                      <FaMedal className="w-5 h-5 text-yellow-400" />
                    </div>
                    <span className="text-pink-200 dropdown-item-text font-orbitron ">
                      Achievements
                    </span>
                  </Link>

                  <div className="border-t dropdown-divider border-pink-400/40"></div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full gap-3 px-4 py-3 text-left dropdown-item hover:bg-black/20"
                  >
                    <div className="dropdown-item-icon">
                      <FaSignOutAlt className="w-5 h-5 text-yellow-400" />
                    </div>
                    <span className="text-pink-200 dropdown-item-text font-orbitron ">
                      Logout
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="p-2 mb-8 border-2 shadow-2xl tab-container bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-2xl border-pink-400/40"
        >
          <button
            className={`tab-button ${activeTab === "quizzes" ? "active" : ""}`}
            onClick={() => setActiveTab("quizzes")}
          >
            <FaGamepad className="w-5 h-5" />
            My Quizzes
          </button>
          <button
            className={`tab-button ${activeTab === "public" ? "active" : ""}`}
            onClick={() => setActiveTab("public")}
          >
            <FaUsers className="w-5 h-5" />
            Public Quizzes
          </button>
          <button
            className={`tab-button ${activeTab === "multiplayer" ? "active" : ""}`}
            onClick={() => setActiveTab("multiplayer")}
          >
            <FaUserFriends className="w-5 h-5" />
            Multiplayer Quizzes
          </button>
          <button
            className={`tab-button ${activeTab === "submissions" ? "active" : ""}`}
            onClick={() => setActiveTab("submissions")}
          >
            <FaTrophy className="w-5 h-5" />
            My Submissions
          </button>
          <button
            className={`tab-button ${activeTab === "leaderboard" ? "active" : ""}`}
            onClick={() => setActiveTab("leaderboard")}
          >
            <FaMedal className="w-5 h-5" />
            Leaderboard
          </button>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "quizzes" && (
            <motion.div
              key="quizzes"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                  My Quizzes
                </h2>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsCreateQuizModalOpen(true)}
                    className="px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
                  >
                    Create New Quiz
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/create-ai-quiz")}
                    className="px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-2xl hover:from-purple-600 hover:to-indigo-600 hover:scale-105 active:scale-95 border-white/30"
                  >
                    Generate Quiz with AI
                  </motion.button>
                </div>
              </div>

              {/* Add SearchBar */}
              <div className="mb-6">
                <SearchBar onSearch={handleSearch} placeholder="Search quiz by name" />
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-16 h-16 border-4 border-pink-400 rounded-full border-t-transparent animate-spin"></div>
                </div>
              ) : filteredQuizzes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12 bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-pink-400/40"
                >
                  <p className="text-xl text-pink-200 font-orbitron">
                    Không tìm thấy quiz nào phù hợp với tìm kiếm của bạn.
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredQuizzes.map((quiz, index) => {
                    const userIsCreator = true;
                    return (
                      <motion.div
                        key={quiz._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <QuizCard
                          quiz={quiz}
                          isCreator={userIsCreator}
                          onDelete={handleDeleteQuiz}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "public" && (
            <motion.div
              key="public"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="mb-6 text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                Public Quizzes
              </h2>

              {/* Add SearchBar */}
              <div className="mb-6">
                <SearchBar onSearch={handlePublicSearch} placeholder="Search Quiz by name..." />
              </div>

              {Array.isArray(filteredPublicQuizzes) && filteredPublicQuizzes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 text-center border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40"
                >
                  <p className="text-xl text-pink-200 font-orbitron">
                    Không tìm thấy quiz nào phù hợp với tìm kiếm của bạn.
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.isArray(filteredPublicQuizzes) &&
                    filteredPublicQuizzes.map((quiz, index) => {
                      return (
                        <QuizCard
                          key={quiz._id}
                          quiz={quiz}
                          isCreator={false}
                          showCreator={true}
                          onDelete={handleDeleteQuiz}
                        />
                      );
                    })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "submissions" && (
            <motion.div
              key="submissions"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="mb-6 text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                My Submissions
              </h2>
              <CollapsibleSubmissionsTable submissions={submissions} />
            </motion.div>
          )}

          {activeTab === "leaderboard" && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="mb-6 text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                Global Leaderboard
              </h2>
              <Leaderboard />
            </motion.div>
          )}

          {activeTab === "multiplayer" && (
            <motion.div
              key="multiplayer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="mb-6 text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                Multiplayer Quizzes
              </h2>
              <p className="mb-8 text-pink-200 font-orbitron">
                Challenge your friends or join public quiz rooms for a competitive
                experience.
              </p>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-6 border-2 multiplayer-card bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 backdrop-blur-xl rounded-2xl border-pink-400/40"
                >
                  <h3 className="mb-3 text-xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                    Create a Room
                  </h3>
                  <p className="mb-6 text-pink-200 font-orbitron">
                    Create a multiplayer room with one of your quizzes and invite
                    others to join.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (!Array.isArray(quizzes) || quizzes.length === 0) {
                        toast.error("You need to create a quiz first!");
                        setTimeout(() => navigate("/upload"), 1500);
                      } else {
                        navigate("/create-room");
                      }
                    }}
                    className="w-full px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
                  >
                    Create Room
                  </motion.button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-6 border-2 multiplayer-card bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 backdrop-blur-xl rounded-2xl border-pink-400/40"
                >
                  <h3 className="mb-3 text-xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                    Join a Room
                  </h3>
                  <p className="mb-6 text-pink-200 font-orbitron">
                    Join an existing quiz room using a room code from another
                    player.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/join-room")}
                    className="w-full px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
                  >
                    Join Room
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CreateQuizModal
        isOpen={isCreateQuizModalOpen}
        onClose={() => setIsCreateQuizModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
