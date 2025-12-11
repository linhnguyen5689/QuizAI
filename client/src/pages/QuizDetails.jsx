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

const PRIMARY = '#1E74D7';
const PRIMARY_DARK = '#003A70';
const PRIMARY_LIGHT = '#4BA3FF';
const BG_LIGHT = '#F5F7FA';
const MUTED_TEXT = '#DDEAF6'; // light muted text used in places of previous pink-200
const CARD_BG_OPACITY = 'rgba(255,255,255,0.03)'; // subtle overlay when needed
const BORDER_PRIMARY_FAINT = 'rgba(30,116,215,0.25)';
const INDIGO_OVERLAY = 'rgba(0,58,112,0.55)';

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
      <div
        className="flex items-center justify-center w-screen min-h-screen"
        style={{
          background: `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY}, ${PRIMARY_LIGHT})`
        }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 mx-auto"
               style={{
                 borderColor: PRIMARY,
                 borderTopColor: 'transparent'
               }}
          ></div>
          <p className="mt-4 text-lg" style={{ color: PRIMARY_LIGHT, fontFamily: 'Orbitron, sans-serif' }}>
            Loading quiz...
          </p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div
        className="relative w-screen min-h-screen overflow-x-hidden"
        style={{
          background: `linear-gradient(135deg, ${PRIMARY_DARK} 0%, ${PRIMARY} 50%, ${PRIMARY_LIGHT} 100%)`
        }}
      >
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 text-center border-4 shadow-2xl rounded-3xl max-w-md w-full"
            style={{
              background: `linear-gradient(180deg, ${PRIMARY_DARK}CC, ${PRIMARY}CC)`,
              borderColor: `${PRIMARY}66`,
              backdropFilter: 'blur(8px)'
            }}
          >
            <p style={{ color: MUTED_TEXT, fontSize: '1.125rem', fontFamily: 'Orbitron, sans-serif' }}>
              Quiz not found or you don't have permission to view it.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-6 py-3 text-white font-medium rounded-xl transition-all duration-300 shadow-lg"
              style={{
                marginTop: '1rem',
                background: `linear-gradient(90deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`,
                color: '#fff'
              }}
            >
              Go back to dashboard
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-screen min-h-screen overflow-x-hidden"
      style={{
        background: `linear-gradient(135deg, ${PRIMARY_DARK} 0%, ${PRIMARY} 50%, ${PRIMARY_LIGHT} 100%)`
      }}
    >
      {/* Animated SVG background */}
      <svg
        className="absolute top-0 left-0 z-0 w-full h-full pointer-events-none"
        style={{ filter: "blur(2px)" }}
      >
        <defs>
          <radialGradient id="g1" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor={PRIMARY_LIGHT} stopOpacity="0.45" />
            <stop offset="100%" stopColor={PRIMARY} stopOpacity="0" />
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
              className="mr-4 px-4 py-3 text-white transition-all duration-300 transform rounded-2xl border-2 shadow-lg"
              onClick={() => navigate('/dashboard')}
              aria-label="Back to dashboard"
              style={{
                background: `linear-gradient(90deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`,
                borderColor: 'rgba(255,255,255,0.25)'
              }}
            >
              <FiArrowLeft className="w-6 h-6" />
            </motion.button>

            <h1 className="flex items-center gap-3 text-4xl font-extrabold md:text-5xl"
                style={{
                  fontFamily: 'Orbitron, sans-serif',
                  background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 6px 18px rgba(0,0,0,0.12)'
                }}
            >
              <FaQuestionCircle className="inline-block animate-bounce" style={{ color: PRIMARY_LIGHT }} />
              Quiz Details
            </h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="p-8 border-4 shadow-2xl rounded-3xl mb-8"
          style={{
            background: `linear-gradient(180deg, ${PRIMARY_DARK}E6, ${PRIMARY}CC)`,
            borderColor: `${PRIMARY}66`,
            backdropFilter: 'blur(8px)'
          }}
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-8">
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl font-bold mb-3"
                style={{
                  fontFamily: 'Orbitron, sans-serif',
                  background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {quiz.title}
              </motion.h1>
              {quiz.description && (
                <motion.p
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  style={{ color: MUTED_TEXT, fontSize: '1.125rem', fontFamily: 'Orbitron, sans-serif' }}
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
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full"
                      style={{
                        background: `${PRIMARY_DARK}B3`,
                        color: PRIMARY_LIGHT
                      }}
                >
                  <FaListAlt className="mr-1" />
                  {quiz.category}
                </span>
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full"
                      style={{
                        background: `${PRIMARY_DARK}B3`,
                        color: PRIMARY_LIGHT
                      }}
                >
                  <FaQuestionCircle className="mr-1" />
                  {quiz.questions.length} Questions
                </span>
                {quiz.averageRating > 0 && (
                  <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full"
                        style={{
                          background: `${PRIMARY_DARK}B3`,
                          color: PRIMARY_LIGHT
                        }}
                  >
                    <FaStar className="mr-1" style={{ color: PRIMARY_LIGHT }} />
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
                      className="p-3 transition-colors duration-200 rounded-full"
                      aria-label="Options"
                      style={{ color: PRIMARY_LIGHT, background: `${PRIMARY_DARK}33` }}
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
                          className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl shadow-lg"
                          style={{
                            background: `${PRIMARY_DARK}EE`,
                            border: `1px solid ${PRIMARY}66`
                          }}
                        >
                          <div className="py-1">
                            <button
                              onClick={handleDeleteQuiz}
                              className="flex w-full items-center px-4 py-2 text-sm transition-colors duration-200"
                              style={{ color: MUTED_TEXT }}
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
                  className="flex items-center justify-center w-full px-6 py-3 text-sm font-medium transition-all duration-300 transform border-2 shadow-lg rounded-xl"
                  style={{
                    background: `linear-gradient(90deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`,
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.18)'
                  }}
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
                  className="flex items-center justify-center w-full px-6 py-3 text-sm font-medium transition-all duration-300 transform border-2 shadow-lg rounded-xl"
                  style={{
                    background: `linear-gradient(90deg, ${PRIMARY_DARK} 0%, ${PRIMARY} 50%, ${PRIMARY_LIGHT} 100%)`,
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.18)'
                  }}
                >
                  <FaGamepad className="mr-2" />
                  Play Multiplayer
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Tabs for Details and Ratings */}
          <div className="mb-8">
            <div className="flex" style={{ borderBottom: `1px solid ${PRIMARY}66` }}>
              <button
                className={`py-2 px-4 font-medium`}
                onClick={() => setActiveTab('details')}
                style={{
                  fontFamily: 'Orbitron, sans-serif',
                  color: activeTab === 'details' ? PRIMARY_LIGHT : MUTED_TEXT,
                  borderBottom: activeTab === 'details' ? `2px solid ${PRIMARY}` : '2px solid transparent',
                  background: 'transparent'
                }}
              >
                <FaListAlt className="inline-block mr-2" />
                Details
              </button>
              <button
                className={`py-2 px-4 font-medium`}
                onClick={() => setActiveTab('ratings')}
                style={{
                  fontFamily: 'Orbitron, sans-serif',
                  color: activeTab === 'ratings' ? PRIMARY_LIGHT : MUTED_TEXT,
                  borderBottom: activeTab === 'ratings' ? `2px solid ${PRIMARY}` : '2px solid transparent',
                  background: 'transparent'
                }}
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
                    <h3 className="text-xl font-bold mb-4"
                        style={{
                          fontFamily: 'Orbitron, sans-serif',
                          background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}
                    >
                      Quiz Questions
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {quiz.questions.map((question, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-xl border"
                          style={{
                            background: `${PRIMARY_DARK}66`,
                            borderColor: `${PRIMARY}33`
                          }}
                        >
                          <p className="font-medium mb-2" style={{ color: '#FFFFFF', fontFamily: 'Orbitron, sans-serif' }}>
                            <span style={{ color: PRIMARY_LIGHT, marginRight: 8 }}>{index + 1}.</span>
                            {question.content.substring(0, 100)}
                            {question.content.length > 100 && "..."}
                          </p>
                          <p style={{ color: MUTED_TEXT, fontSize: '0.875rem' }}>
                            <span style={{ color: PRIMARY_LIGHT, fontWeight: 600 }}>Options:</span>{" "}
                            {question.options.length} options available
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-4"
                        style={{
                          fontFamily: 'Orbitron, sans-serif',
                          background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}
                    >
                      Creator Information
                    </h3>
                    <div className="p-4 rounded-xl border"
                         style={{
                           background: `${PRIMARY_DARK}66`,
                           borderColor: `${PRIMARY}33`
                         }}
                    >
                      <div className="flex items-center">
                        <div style={{ background: PRIMARY, color: '#fff', width: 48, height: 48, borderRadius: '9999px' }} className="flex items-center justify-center mr-4">
                          <FaUserAlt style={{ width: 20, height: 20 }} />
                        </div>
                        <div>
                          <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontFamily: 'Orbitron, sans-serif' }}>
                            {isOwner ? "You" : "Anonymous User"}
                          </h4>
                          <p style={{ color: MUTED_TEXT, fontSize: '0.875rem', fontFamily: 'Orbitron, sans-serif' }}>
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
                  <div className="p-6 rounded-2xl border-2 shadow-xl"
                       style={{
                         background: `linear-gradient(180deg, ${PRIMARY_DARK}E6, ${PRIMARY}CC)`,
                         borderColor: `${PRIMARY}66`
                       }}
                  >
                    <h3 className="text-xl font-bold mb-4"
                        style={{
                          fontFamily: 'Orbitron, sans-serif',
                          background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}
                    >
                      Đánh giá Quiz
                    </h3>
                    <p style={{ color: MUTED_TEXT, marginBottom: '1rem', fontFamily: 'Orbitron, sans-serif' }}>
                      Bạn cần đăng nhập để đánh giá quiz này.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/login')}
                      className="inline-flex items-center px-4 py-2 border text-sm font-medium rounded-xl transition-colors duration-300"
                      style={{
                        background: PRIMARY,
                        color: '#fff',
                        borderColor: 'transparent'
                      }}
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
