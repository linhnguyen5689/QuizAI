import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoomByCode, getRoomParticipants, submitAnswer } from '../services/api';
import socketService from '../services/socketService';
import toast from 'react-hot-toast';
import RoomChat from '../components/RoomChat';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import {
  FaGamepad,
  FaStar,
  FaTrophy,
  FaCertificate,
  FaRegCheckCircle,
  FaRegTimesCircle,
  FaRedo,
  FaSpinner,
  FaExclamationTriangle,
  FaFacebook
} from 'react-icons/fa';

// Helper functions (only keeping those that are used)
const getUserId = (user) => {
  if (!user) return null;

  // Check if user is already a string ID
  if (typeof user === 'string') return user;

  // Check if user is an object with _id
  if (typeof user === 'object' && user._id) {
    // Handle if _id is an object with toString method (ObjectId)
    if (typeof user._id === 'object' && user._id.toString) {
      return user._id.toString();
    }
    return user._id;
  }

  // If it's some other object representation, try to find an ID
  if (typeof user === 'object') {
    const possibleIds = ['id', 'userId', 'hostId'];
    for (const idField of possibleIds) {
      if (user[idField]) {
        // Handle if the field is an object with toString method
        if (typeof user[idField] === 'object' && user[idField].toString) {
          return user[idField].toString();
        }
        return user[idField];
      }
    }
  }

  // Return null if no ID found
  return null;
};

const getUserName = (user) => {
  if (!user) return 'Unknown';
  if (typeof user === 'object') {
    return user.displayName || user.username || 'Unknown';
  }
  return user.toString();
};

const getUserInitial = (user) => {
  if (!user) return '?';
  if (typeof user === 'object' && user.username) {
    return user.username.charAt(0).toUpperCase();
  }
  if (typeof user === 'object' && user.displayName) {
    return user.displayName.charAt(0).toUpperCase();
  }
  if (typeof user === 'string') {
    return user.charAt(0).toUpperCase();
  }
  return '?';
};

// Theme colors (HAU Blue)
const PRIMARY = '#1E74D7';
const PRIMARY_DARK = '#003A70';
const PRIMARY_LIGHT = '#4BA3FF';
const BG_LIGHT = '#F5F7FA';
const MUTED_TEXT = '#DDEAF6'; // subtle light text used in place of previous pinks
const CARD_OVERLAY = 'rgba(255,255,255,0.03)';
const BORDER_FAINT = 'rgba(30,116,215,0.25)';
const ACCENT = PRIMARY_LIGHT;

function QuizGame({ user: propUser }) {
  const { code } = useParams();
  const navigate = useNavigate();

  // Use the user from props or fallback to localStorage
  const [user, setUser] = useState(propUser || null);
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [timer, setTimer] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [gameStatus, setGameStatus] = useState('waiting'); // waiting, in_progress, completed

  // Move console.log into useEffect so it only runs once on mount
  useEffect(() => {
    // Component initialized
  }, []);

  // Try to get user from localStorage if not provided via props
  useEffect(() => {
    if (!user) {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Error getting user from localStorage:', error);
      }
    }
  }, [user]);

  // Fetch initial room and participants data
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        setError('');

        if (!code) {
          setError('Room code is required');
          return;
        }

        const roomResponse = await getRoomByCode(code);
        if (!roomResponse.success) {
          throw new Error(roomResponse.message || 'Failed to load room');
        }

        setRoom(roomResponse.data);
        setGameStatus(roomResponse.data.status || 'waiting');

        // Make sure quizId exists and set it safely
        if (roomResponse.data && roomResponse.data.quizId) {
          setQuiz(roomResponse.data.quizId);
        } else {
          setQuiz(null);
        }

        // Check if user is host (not needed for this component)
        const participantsResponse = await getRoomParticipants(code);
        if (participantsResponse.success) {
          setParticipants(participantsResponse.data);
        }

        // Connect to socket
        try {
          await socketService.init(user);
          setSocketConnected(true);
          await socketService.joinRoom(code);
        } catch (socketError) {
          console.error('Socket connection error:', socketError);
          toast.error('Could not connect to real-time updates. Functionality will be limited.');
        }
      } catch (error) {
        setError('Error loading room data: ' + (error.message || 'Unknown error'));
        console.error('Error fetching room data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRoomData();
    }
  }, [code, user]);

  // Setup socket event listeners
  useEffect(() => {
    if (!socketConnected) return;

    // When a user joins the room
    socketService.on('onUserJoined', (data) => {
      if (data && data.user) {
        setParticipants(prev => {
          // Check if user already exists
          const exists = prev.some(p => getUserId(p.userId) === getUserId(data.user));
          if (exists) return prev;
          return [...prev, { userId: data.user, score: 0 }];
        });
      }
    });

    // When a user leaves the room
    socketService.on('onUserLeft', (data) => {
      if (data && data.userId) {
        setParticipants(prev =>
          prev.filter(p => getUserId(p.userId) !== getUserId(data.userId))
        );
      }
    });

    // When game starts
    socketService.on('onGameStarted', (data) => {
      toast.success('Game started!');
      setGameStatus('in_progress');
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setAnswerSubmitted(false);

      if (data && data.room) {
        setRoom(data.room);
      }
      if (data && data.quiz) {
        setQuiz(data.quiz);
      }
      if (data && Array.isArray(data.participants)) {
        setParticipants(data.participants);
      }
    });

    // When a user answers a question
    socketService.on('onUserAnswered', (data) => {
      if (data && data.userId) {
        toast(`${getUserName(data.userId)} submitted an answer!`, {
          icon: '✅',
        });
      }
    });

    // When game progress updates
    socketService.on('onGameProgress', (data) => {
      // Update participant scores
      if (data && Array.isArray(data.participants)) {
        setParticipants(data.participants);
      }
    });

    // When game ends
    socketService.on('onGameEnded', (data) => {
      toast.success('Game ended!');
      setGameStatus('completed');

      // Update room status and display results
      if (data && data.room) {
        setRoom(data.room);
      }
      if (data && Array.isArray(data.participants)) {
        setParticipants(data.participants);
      }
    });

    // Clean up socket listeners when component unmounts
    return () => {
      Object.keys(socketService.callbacks).forEach(event => {
        socketService.on(event, () => { });
      });
    };
  }, [socketConnected, code]); // Only re-setup sockets when connection state or room code changes

  // Handle timer when game is in progress
  useEffect(() => {
    if (gameStatus === 'in_progress' && quiz?.questions) {
      // Clear any existing timer
      if (timer) {
        clearInterval(timer);
      }

      // Set default time limit if none provided
      const questionTimeLimit = quiz.timeLimit || 30;
      setRemaining(questionTimeLimit);

      // Use setTimeout instead of setInterval to reduce re-renders
      const updateTimer = (timeLeft) => {
        if (timeLeft <= 0) {
          // Auto-submit if time is up and answer not submitted
          if (!answerSubmitted && quiz.questions[currentQuestion]) {
            handleTimeOut();
          }
          return;
        }

        const timerId = setTimeout(() => {
          setRemaining(timeLeft - 1);
          updateTimer(timeLeft - 1);
        }, 1000);

        // Store the timeout ID
        setTimer(timerId);
      };

      // Start the timer
      updateTimer(questionTimeLimit);

      // Cleanup function
      return () => {
        if (timer) {
          clearTimeout(timer);
        }
      };
    }
  }, [gameStatus, currentQuestion, answerSubmitted, quiz]);

  // Add a function to handle time running out
  const handleTimeOut = () => {
    // Show notification
    toast.info('Time is up! Moving to next question...', {
      icon: '⏱️',
    });

    // Move to next question or end quiz
    setTimeout(() => {
      if (currentQuestion < (quiz?.questions?.length || 0) - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setAnswerSubmitted(false);
      } else {
        // End of quiz
        toast('Quiz completed! Viewing results...', {
          icon: '🎉',
        });
        setGameStatus('completed');
      }
    }, 1000);
  }

  // Modify the answer submission function to auto-proceed
  const handleSubmitAnswer = async (answerId) => {
    // Check if quiz and questions exist and in-progress
    if (!quiz || !quiz.questions || answerSubmitted || gameStatus !== 'in_progress') return;

    try {
      setError('');

      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }

      // Find the current question
      const question = quiz.questions[currentQuestion];
      if (!question) {
        console.error('Question not found at index:', currentQuestion);
        return;
      }

      setAnswerSubmitted(true);
      setSelectedAnswer(answerId);

      // Submit the answer via socket if connected
      if (socketConnected && answerId) {
        socketService.submitAnswer(code, question._id, answerId);
      }

      // Also call the API for backup
      if (answerId) {
        await submitAnswer(code, question._id, answerId);
      }

      toast.success('Answer submitted!');

      // Auto-proceed to next question after a brief delay
      setTimeout(() => {
        if (currentQuestion < (quiz?.questions?.length || 0) - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedAnswer(null);
          setAnswerSubmitted(false);
        } else {
          // End of quiz
          toast('Quiz completed! Viewing results...', {
            icon: '🎉',
          });
          setGameStatus('completed');
        }
      }, 1500); // 1.5 seconds delay
    } catch (error) {
      setError('Error submitting answer: ' + (error.message || 'Unknown error'));
      console.error('Error submitting answer:', error);
    }
  };

  // Back to room button handler
  const handleBackToRoom = () => {
    navigate(`/room/${code}`);
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center w-screen min-h-screen"
        style={{
          background: `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY}, ${PRIMARY_LIGHT})`
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 border-4 shadow-2xl rounded-3xl"
          style={{
            background: `linear-gradient(180deg, ${PRIMARY_DARK}CC, ${PRIMARY}CC)`,
            borderColor: `${PRIMARY}66`,
            backdropFilter: 'blur(8px)'
          }}
        >
          <div className="flex flex-col items-center justify-center">
            <div className="w-20 h-20 mb-4 relative">
              <div
                className="absolute top-0 left-0 w-full h-full rounded-full animate-spin"
                style={{
                  border: `4px solid ${PRIMARY}`,
                  borderTopColor: 'transparent',
                  boxSizing: 'border-box'
                }}
              />
              <FaGamepad className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8"
                          style={{ color: PRIMARY_LIGHT }} />
            </div>
            <p className="mt-4 text-xl" style={{ color: MUTED_TEXT, fontFamily: 'Orbitron, sans-serif' }}>Loading quiz game...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="relative w-screen min-h-screen overflow-x-hidden"
        style={{
          background: `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY}, ${PRIMARY_LIGHT})`
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
            <div style={{ color: PRIMARY_LIGHT, marginBottom: 12 }}>
              <FaExclamationTriangle className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-4" style={{
              fontFamily: 'Orbitron, sans-serif',
              background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Error Loading Game</h2>
            <p style={{ color: MUTED_TEXT, fontSize: '1rem', marginBottom: 16 }}>{error}</p>
            <div className="flex justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackToRoom}
                className="px-6 py-3 text-white transition-all duration-300 rounded-2xl"
                style={{
                  background: `linear-gradient(90deg, ${PRIMARY}, ${PRIMARY_DARK})`,
                  border: 'none'
                }}
              >
                <FiArrowLeft className="w-5 h-5 mr-2 inline-block" />
                Back to Room
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                className="px-6 py-3 text-white transition-all duration-300 rounded-2xl"
                style={{
                  background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                  border: 'none'
                }}
              >
                <FaRedo className="w-5 h-5 mr-2 inline-block" />
                Try Again
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!room || !quiz) {
    return (
      <div
        className="relative w-screen min-h-screen overflow-x-hidden"
        style={{
          background: `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY}, ${PRIMARY_LIGHT})`
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
            <h1 className="text-2xl font-bold mb-4" style={{
              fontFamily: 'Orbitron, sans-serif',
              background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Room or Quiz Not Found</h1>
            <p style={{ color: MUTED_TEXT, marginBottom: 16 }}>The quiz game you're looking for doesn't exist or has expired.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 text-white transition-all duration-300 rounded-2xl"
              style={{
                background: `linear-gradient(90deg, ${PRIMARY}, ${PRIMARY_DARK})`,
                border: 'none'
              }}
            >
              <FaGamepad className="w-5 h-5 mr-2 inline-block" />
              Back to Dashboard
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Game in progress display
  if (gameStatus === 'in_progress') {
    return (
      <div
        className="relative w-screen min-h-screen overflow-x-hidden"
        style={{
          background: `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY}, ${PRIMARY_LIGHT})`
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
                onClick={handleBackToRoom}
                aria-label="Back to room"
                style={{
                  background: `linear-gradient(90deg, ${PRIMARY}, ${PRIMARY_DARK})`,
                  borderColor: 'rgba(255,255,255,0.18)'
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
                <FaGamepad className="inline-block animate-bounce" style={{ color: PRIMARY_LIGHT }} />
                Quiz Game
              </h1>
            </div>
            <div style={{
              padding: '6px 12px',
              background: `linear-gradient(90deg, ${PRIMARY}, ${PRIMARY_DARK})`,
              borderRadius: 999,
              color: '#fff',
              fontFamily: 'Orbitron, sans-serif'
            }}>
              Room: {room.code}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main game area */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="p-8 border-4 shadow-2xl rounded-3xl mb-6"
                style={{
                  background: `linear-gradient(180deg, ${PRIMARY_DARK}E6, ${PRIMARY}CC)`,
                  borderColor: `${PRIMARY}66`,
                  backdropFilter: 'blur(8px)'
                }}
              >
                {quiz?.questions && quiz.questions[currentQuestion] ? (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold mb-0" style={{
                        fontFamily: 'Orbitron, sans-serif',
                        background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        Question {currentQuestion + 1} of {quiz.questions.length}
                      </h3>
                      {remaining > 0 && (
                        <div style={{
                          padding: '8px 14px',
                          background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                          borderRadius: 999,
                          color: '#fff',
                          fontFamily: 'Orbitron, sans-serif',
                          fontSize: '1rem',
                          boxShadow: '0 8px 20px rgba(30,116,215,0.15)'
                        }}>
                          {remaining}s
                        </div>
                      )}
                    </div>

                    <div className="mb-8 p-6 rounded-2xl shadow-lg"
                         style={{ background: `${PRIMARY_DARK}66`, border: `2px solid ${PRIMARY}33` }}>
                      <p style={{ color: MUTED_TEXT, fontSize: '1.125rem', fontFamily: 'Orbitron, sans-serif' }}>{quiz.questions[currentQuestion].content}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {quiz.questions[currentQuestion].options &&
                        Array.isArray(quiz.questions[currentQuestion].options) &&
                        quiz.questions[currentQuestion].options.map((option) => (
                          <motion.button
                            key={option._id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-5 rounded-2xl border-2 transition-all ${answerSubmitted ? 'cursor-not-allowed opacity-70' : ''}`}
                            onClick={() => !answerSubmitted && handleSubmitAnswer(option._id)}
                            disabled={answerSubmitted}
                            style={{
                              borderColor: selectedAnswer === option._id ? PRIMARY_LIGHT : `${PRIMARY}33`,
                              background: selectedAnswer === option._id ? `${PRIMARY}99` : `${PRIMARY_DARK}55`,
                              color: '#fff',
                              boxShadow: selectedAnswer === option._id ? `0 0 15px rgba(30,116,215,0.45)` : 'none',
                              fontFamily: 'Orbitron, sans-serif'
                            }}
                          >
                            <p className="text-lg">{option.label}</p>
                          </motion.button>
                        ))}
                    </div>

                    {answerSubmitted && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 text-center"
                      >
                        <p style={{ color: PRIMARY_LIGHT, fontWeight: 700, fontFamily: 'Orbitron, sans-serif' }}>
                          Answer submitted! Moving to next question...
                        </p>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p style={{ color: MUTED_TEXT, fontFamily: 'Orbitron, sans-serif' }}>
                      {currentQuestion >= (quiz?.questions?.length || 0)
                        ? "You've completed all questions! Waiting for results..."
                        : "Loading question..."}
                    </p>
                    {currentQuestion >= (quiz?.questions?.length || 0) && (
                      <div className="mt-4">
                        <FaSpinner className="w-12 h-12 animate-spin mx-auto" style={{ color: PRIMARY_LIGHT }} />
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Game Progress */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="p-6 border-4 shadow-2xl rounded-3xl"
                style={{
                  background: `linear-gradient(180deg, ${PRIMARY_DARK}E6, ${PRIMARY}CC)`,
                  borderColor: `${PRIMARY}66`,
                  backdropFilter: 'blur(8px)'
                }}
              >
                <h3 className="text-xl font-bold mb-4" style={{
                  fontFamily: 'Orbitron, sans-serif',
                  background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Game Progress
                </h3>
                <p style={{ color: MUTED_TEXT, marginBottom: 12 }}>Scores will be shown at the end of the quiz.</p>
                <div className="mt-2">
                  <div style={{ width: '100%', background: `${PRIMARY_DARK}66`, borderRadius: 999, height: 12, border: `1px solid ${PRIMARY}33` }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentQuestion / quiz?.questions?.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      style={{
                        background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                        height: '100%',
                        borderRadius: 999
                      }}
                    />
                  </div>
                  <p style={{ color: MUTED_TEXT, marginTop: 8, fontFamily: 'Orbitron, sans-serif' }}>
                    Question {currentQuestion + 1} of {quiz?.questions?.length || 0}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 mt-6">
                  {participants.map((participant, index) => (
                    <motion.div
                      key={participant._id || index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex flex-col items-center"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold`}
                        style={{
                          background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                          boxShadow: getUserId(participant.userId) === user?._id ? '0 0 0 4px rgba(30,116,215,0.12)' : 'none'
                        }}
                      >
                        {getUserInitial(participant.userId)}
                      </div>
                      <p style={{ color: MUTED_TEXT, marginTop: 6, fontSize: 12, fontFamily: 'Orbitron, sans-serif' }}>{getUserName(participant.userId)}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Chat sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-3xl overflow-hidden h-full"
                style={{
                  background: `linear-gradient(180deg, ${PRIMARY_DARK}E6, ${PRIMARY}CC)`,
                  border: `2px solid ${PRIMARY}66`,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <RoomChat roomCode={code} roomId={room?._id} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game completed display
  if (gameStatus === 'completed') {
    // Prepare share data
    const shareData = {
      title: `Kết quả Quiz: ${quiz?.title || 'Quiz Game'}`,
      description: `Tôi đã hoàn thành ${quiz?.title || 'Quiz Game'} với ${participants.find(p => getUserId(p.userId) === getUserId(user))?.score || 0} điểm!`,
      url: window.location.href
    };

    // Handle Facebook share
    const handleFacebookShare = () => {
      const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}&quote=${encodeURIComponent(shareData.description)}`;
      window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    return (
      <div
        className="relative w-screen min-h-screen overflow-x-hidden"
        style={{
          background: `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY}, ${PRIMARY_LIGHT})`
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
                onClick={handleBackToRoom}
                aria-label="Back to room"
                style={{
                  background: `linear-gradient(90deg, ${PRIMARY}, ${PRIMARY_DARK})`,
                  borderColor: 'rgba(255,255,255,0.18)'
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
                <FaTrophy className="inline-block animate-bounce" style={{ color: PRIMARY_LIGHT }} />
                Quiz Results
              </h1>
            </div>
            <div style={{
              padding: '6px 12px',
              background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
              borderRadius: 999,
              color: '#fff',
              fontFamily: 'Orbitron, sans-serif'
            }}>
              Completed
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main results area */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="p-8 border-4 shadow-2xl rounded-3xl mb-6"
                style={{
                  background: `linear-gradient(180deg, ${PRIMARY_DARK}E6, ${PRIMARY}CC)`,
                  borderColor: `${PRIMARY}66`,
                  backdropFilter: 'blur(8px)'
                }}
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2" style={{
                    fontFamily: 'Orbitron, sans-serif',
                    background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Final Leaderboard
                  </h2>
                  <p style={{ color: MUTED_TEXT }}>
                    Quiz: {quiz?.title || 'Loading...'}
                  </p>
                </div>

                {participants && Array.isArray(participants) && participants.length > 0 && (
                  <motion.div
                    className="flex flex-col items-center mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    {/* Top 3 Podium */}
                    <div className="flex items-end justify-center w-full max-w-xl mx-auto mb-10">
                      {participants.sort((a, b) => b.score - a.score).slice(0, 3).map((participant, index) => {
                        // Define heights and colors based on position (replace colorful podium with blue variants)
                        const heights = ["h-28", "h-36", "h-20"];
                        const bgGradients = [
                          `linear-gradient(to bottom, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                          `linear-gradient(to bottom, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                          `linear-gradient(to bottom, ${PRIMARY_LIGHT}, ${PRIMARY})`
                        ];
                        const positions = [2, 1, 3]; // Silver, Gold, Bronze (visual only)
                        const marginTop = ["mt-8", "mt-0", "mt-16"];
                        const shadows = [
                          "shadow-lg",
                          "shadow-[0_0_20px_rgba(30,116,215,0.6)]",
                          "shadow-lg"
                        ];

                        return (
                          <motion.div
                            key={participant._id || index}
                            className="flex flex-col items-center mx-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                          >
                            <div className="rounded-full w-16 h-16 mb-2 flex items-center justify-center"
                                 style={{
                                   background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                                   border: '4px solid rgba(255,255,255,0.2)',
                                   boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                                 }}>
                              <span className="text-2xl font-bold" style={{ color: '#fff', fontFamily: 'Orbitron, sans-serif' }}>{getUserInitial(participant.userId)}</span>
                            </div>
                            <p className="text-center font-semibold mb-2 w-24 truncate" style={{ color: MUTED_TEXT, fontFamily: 'Orbitron, sans-serif' }}>{getUserName(participant.userId)}</p>
                            <p className="text-lg font-bold" style={{
                              background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              fontFamily: 'Orbitron, sans-serif'
                            }}>{participant.score} pts</p>
                            <motion.div
                              className={`${heights[index]} w-24 ${marginTop[index]} rounded-t-lg flex items-start justify-center`}
                              initial={{ height: 0 }}
                              animate={{ height: parseInt(heights[index].replace('h-', '')) * 4 }}
                              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                              style={{
                                background: bgGradients[index],
                                borderTop: '2px solid rgba(255,255,255,0.2)'
                              }}
                            >
                              <span style={{
                                background: `linear-gradient(90deg, ${PRIMARY_DARK}, ${PRIMARY})`,
                                width: 40,
                                height: 40,
                                borderRadius: 999,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: 700,
                                border: '2px solid rgba(255,255,255,0.2)',
                                fontFamily: 'Orbitron, sans-serif'
                              }}>
                                {positions[index]}
                              </span>
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* All participants list */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
                      style={{ border: `2px solid ${PRIMARY}33` }}
                    >
                      <div style={{ background: `linear-gradient(90deg, ${PRIMARY}, ${PRIMARY_DARK})`, color: '#fff', padding: '12px 16px' }}>
                        <h3 style={{ fontWeight: 700, fontFamily: 'Orbitron, sans-serif' }}>Complete Rankings</h3>
                      </div>
                      <div style={{ borderTop: `1px solid ${PRIMARY}33` }}>
                        {participants.sort((a, b) => b.score - a.score).map((participant, index) => (
                          <motion.div
                            key={participant._id || index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.6 + index * 0.05 }}
                            style={{
                              padding: '12px 16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: getUserId(participant.userId) === user?._id ? `${PRIMARY_DARK}55` : 'transparent'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div style={{
                                width: 32,
                                height: 32,
                                borderRadius: 999,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12,
                                background: index === 0 ? `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})` : `linear-gradient(90deg, ${PRIMARY}, ${PRIMARY_DARK})`,
                                color: '#fff'
                              }}>
                                <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 12 }}>{index + 1}</span>
                              </div>
                              <div>
                                <p style={{ margin: 0, fontWeight: 600, color: MUTED_TEXT, fontFamily: 'Orbitron, sans-serif' }}>
                                  {getUserName(participant.userId)}
                                  {getUserId(participant.userId) === user?._id && (
                                    <span style={{ marginLeft: 8, fontSize: 12, background: PRIMARY_LIGHT, color: PRIMARY_DARK, padding: '2px 8px', borderRadius: 999, fontFamily: 'Orbitron, sans-serif' }}>YOU</span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div style={{
                              fontWeight: 700,
                              fontFamily: 'Orbitron, sans-serif',
                              background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent'
                            }}>
                              {participant.score}
                              <span style={{ fontSize: 12, color: MUTED_TEXT, marginLeft: 8 }}>pts</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {(!participants || !Array.isArray(participants) || participants.length === 0) && (
                  <div className="text-center py-10">
                    <p style={{ color: MUTED_TEXT }}>No results available</p>
                  </div>
                )}

                <div className="mt-8 flex justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 text-white transition-all duration-300 rounded-2xl"
                    style={{ background: `linear-gradient(90deg, ${PRIMARY}, ${PRIMARY_DARK})` }}
                  >
                    Back to Dashboard
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBackToRoom}
                    className="px-6 py-3 text-white transition-all duration-300 rounded-2xl"
                    style={{ background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})` }}
                  >
                    Back to Room
                  </motion.button>
                </div>

                {/* Add share buttons */}
                <div className="flex justify-center gap-4 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleFacebookShare}
                    className="inline-flex items-center px-6 py-3 text-white font-medium rounded-xl transition-all duration-300"
                    style={{
                      background: '#1877F2'
                    }}
                  >
                    <FaFacebook className="w-5 h-5 mr-2" />
                    Chia sẻ lên Facebook
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Chat sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-3xl overflow-hidden h-full"
                style={{
                  background: `linear-gradient(180deg, ${PRIMARY_DARK}E6, ${PRIMARY}CC)`,
                  border: `2px solid ${PRIMARY}66`,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <RoomChat roomCode={code} roomId={room?._id} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Waiting room display (fallback)
  return (
    <div
      className="relative w-screen min-h-screen overflow-x-hidden"
      style={{
        background: `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY}, ${PRIMARY_LIGHT})`
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
              onClick={handleBackToRoom}
              aria-label="Back to room"
              style={{
                background: `linear-gradient(90deg, ${PRIMARY}, ${PRIMARY_DARK})`,
                borderColor: 'rgba(255,255,255,0.18)'
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
              <FaGamepad className="inline-block animate-bounce" style={{ color: PRIMARY_LIGHT }} />
              Quiz Game: {room.code}
            </h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="p-8 border-4 shadow-2xl rounded-3xl mb-8 max-w-2xl mx-auto"
          style={{
            background: `linear-gradient(180deg, ${PRIMARY_DARK}CC, ${PRIMARY}CC)`,
            borderColor: `${PRIMARY}66`,
            backdropFilter: 'blur(8px)'
          }}
        >
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 mb-4"
                   style={{ background: `${PRIMARY_DARK}33`, borderColor: `${PRIMARY}66` }}>
                <FaSpinner className="w-12 h-12 animate-spin" style={{ color: PRIMARY_LIGHT }} />
              </div>
              <h2 style={{
                fontSize: 28,
                fontWeight: 800,
                marginBottom: 8,
                fontFamily: 'Orbitron, sans-serif',
                background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Waiting for Game to Start</h2>
              <p style={{ color: MUTED_TEXT }}>The game host hasn't started the game yet.</p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center mt-8">
              {participants.map((participant, index) => (
                <motion.div
                  key={participant._id || index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex flex-col items-center"
                >
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                    color: '#fff',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                  }}>
                    {getUserInitial(participant.userId)}
                  </div>
                  <p style={{ marginTop: 8, color: MUTED_TEXT, fontSize: 13 }}>{getUserName(participant.userId)}</p>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackToRoom}
              className="mt-8 inline-flex items-center px-6 py-3 text-white font-medium rounded-xl transition-all duration-300"
              style={{
                background: `linear-gradient(90deg, ${PRIMARY}, ${PRIMARY_DARK})`
              }}
            >
              <FiArrowLeft className="w-5 h-5 mr-2" />
              Back to Room
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default QuizGame;
