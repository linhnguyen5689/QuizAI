import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getQuizById, deleteQuiz } from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import {
  FaGamepad,
  FaStar,
  FaTrophy,
  FaQuestionCircle,
  FaTrash,
  FaPlay,
  FaLock,
  FaUserAlt,
  FaListAlt,
  FaRegStar,
  FaComment
} from 'react-icons/fa';

// Import Rating components
import RatingForm from '../components/rating/RatingForm';
import RatingList from '../components/rating/RatingList';

const QuizDetails = ({ user }) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newRating, setNewRating] = useState(null);
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'ratings'
  const dropdownRef = useRef(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        console.log('Fetching quiz with ID from URL params:', id);

        if (!id || id === 'undefined') {
          console.error('Invalid quiz ID detected:', id);
          toast.error('Invalid quiz ID');
          navigate('/not-found');
          return;
        }

        const data = await getQuizById(id);
        console.log('Quiz data received:', data);
        setQuiz(data);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        toast.error(error.response?.data?.message || 'Failed to load quiz');
        if (error.response?.status === 404) {
          navigate('/not-found');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDeleteQuiz = async () => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await deleteQuiz(id);
        toast.success('Quiz deleted successfully');
        navigate('/dashboard');
      } catch (error) {
        console.error('Error deleting quiz:', error);
        toast.error('Failed to delete quiz');
      }
    }
  };

  const handleRatingSubmitted = (ratingData) => {
    setNewRating(ratingData);
  };

  const isOwner = user && quiz?.createdBy && user._id === quiz.createdBy.toString();

  if (loading) {
    return (
      <div className="flex items-center justify-center w-screen min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-pink-200 text-lg font-orbitron">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="relative w-screen min-h-screen overflow-x-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 text-center border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40 max-w-md w-full"
          >
            <p className="text-pink-200 text-lg mb-6 font-orbitron">Quiz not found or you don't have permission to view it.</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white font-medium rounded-xl hover:from-pink-400 hover:to-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-orbitron"
            >
              Go back to dashboard
            </Link>
          </motion.div>
        </div>
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
          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mr-4 px-4 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
              onClick={() => navigate('/dashboard')}
              aria-label="Back to dashboard"
            >
              <FiArrowLeft className="w-6 h-6" />
            </motion.button>

            <h1 className="flex items-center gap-3 text-4xl font-extrabold text-transparent md:text-5xl font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 drop-shadow-lg">
              <FaQuestionCircle className="inline-block text-yellow-300 animate-bounce" />
              Quiz Details
            </h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="p-8 border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40 mb-8"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-8">
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text text-transparent mb-3 font-orbitron"
              >
                {quiz.title}
              </motion.h1>
              {quiz.description && (
                <motion.p
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-pink-200 text-lg font-orbitron"
                >
                  {quiz.description}
                </motion.p>
              )}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-wrap gap-3 mt-4"
              >
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-indigo-900/70 text-pink-300 rounded-full">
                  <FaListAlt className="mr-1" />
                  {quiz.category}
                </span>
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-indigo-900/70 text-pink-300 rounded-full">
                  <FaQuestionCircle className="mr-1" />
                  {quiz.questions.length} Questions
                </span>
                {quiz.averageRating > 0 && (
                  <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-indigo-900/70 text-pink-300 rounded-full">
                    <FaStar className="mr-1 text-yellow-400" />
                    {quiz.averageRating.toFixed(1)} ({quiz.ratingsCount} Ratings)
                  </span>
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col gap-3 min-w-[200px]"
            >
              {isOwner && (
                <div className="flex justify-end">
                  <div className="relative inline-block text-left" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="text-pink-300 p-3 transition-colors duration-200 rounded-full hover:bg-indigo-900/50"
                      aria-label="Options"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -20 }}
                          transition={{ duration: 0.1 }}
                          className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-indigo-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                        >
                          <div className="py-1">
                            <button
                              onClick={handleDeleteQuiz}
                              className="flex w-full items-center px-4 py-2 text-sm text-pink-200 hover:bg-indigo-700 hover:text-white transition-colors duration-200"
                            >
                              <FaTrash className="mr-2" />
                              Delete Quiz
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full"
              >
                <Link
                  to={`/take-quiz/${quiz._id}`}
                  className="flex items-center justify-center w-full px-6 py-3 text-sm font-medium text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
                >
                  <FaPlay className="mr-2" />
                  Take Quiz Solo
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full"
              >
                <Link
                  to={`/create-room/${quiz._id}`}
                  className="flex items-center justify-center w-full px-6 py-3 text-sm font-medium text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-xl hover:from-blue-600 hover:to-indigo-600 hover:scale-105 active:scale-95 border-white/30"
                >
                  <FaGamepad className="mr-2" />
                  Play Multiplayer
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Tabs for Details and Ratings */}
          <div className="mb-8">
            <div className="flex border-b border-pink-400/30">
              <button
                className={`py-2 px-4 font-medium font-orbitron ${activeTab === 'details'
                    ? 'text-pink-300 border-b-2 border-pink-500'
                    : 'text-pink-200/70 hover:text-pink-200'
                  }`}
                onClick={() => setActiveTab('details')}
              >
                <FaListAlt className="inline-block mr-2" />
                Details
              </button>
              <button
                className={`py-2 px-4 font-medium font-orbitron ${activeTab === 'ratings'
                    ? 'text-pink-300 border-b-2 border-pink-500'
                    : 'text-pink-200/70 hover:text-pink-200'
                  }`}
                onClick={() => setActiveTab('ratings')}
              >
                <FaRegStar className="inline-block mr-2" />
                Ratings & Reviews
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'details' ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text mb-4 font-orbitron">
                      Quiz Questions
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {quiz.questions.map((question, index) => (
                        <div
                          key={index}
                          className="p-4 bg-indigo-900/50 rounded-xl border border-pink-400/20"
                        >
                          <p className="font-medium text-white mb-2 font-orbitron">
                            <span className="text-pink-300 mr-2">{index + 1}.</span>
                            {question.content.substring(0, 100)}
                            {question.content.length > 100 && "..."}
                          </p>
                          <p className="text-pink-200 text-sm">
                            <span className="text-pink-300 font-medium">Options:</span>{" "}
                            {question.options.length} options available
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text mb-4 font-orbitron">
                      Creator Information
                    </h3>
                    <div className="p-4 bg-indigo-900/50 rounded-xl border border-pink-400/20">
                      <div className="flex items-center">
                        <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center mr-4">
                          <FaUserAlt className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-white font-orbitron">
                            {isOwner ? "You" : "Anonymous User"}
                          </h4>
                          <p className="text-pink-200 text-sm font-orbitron">
                            Created on {new Date(quiz.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="ratings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {user ? (
                  <RatingForm
                    quizId={quiz._id}
                    onRatingSubmitted={handleRatingSubmitted}
                  />
                ) : (
                  <div className="p-6 backdrop-blur-lg bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 rounded-2xl border-2 border-pink-400/30 shadow-xl">
                    <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text mb-4 font-orbitron">
                      Đánh giá Quiz
                    </h3>
                    <p className="text-pink-200 mb-4 font-orbitron">
                      Bạn cần đăng nhập để đánh giá quiz này.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/login')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
                    >
                      <FaLock className="mr-2" />
                      Đăng nhập
                    </motion.button>
                  </div>
                )}

                <RatingList
                  quizId={quiz._id}
                  newRating={newRating}
                  currentUserId={user?._id}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizDetails;