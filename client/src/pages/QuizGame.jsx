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
      <div className="flex items-center justify-center w-screen min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40"
        >
          <div className="flex flex-col items-center justify-center">
            <div className="w-20 h-20 mb-4 relative">
              <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-pink-500 border-r-indigo-500 border-b-yellow-400 border-l-transparent animate-spin"></div>
              <div className="absolute top-2 left-2 right-2 bottom-2 rounded-full border-4 border-t-transparent border-r-pink-500 border-b-indigo-500 border-l-yellow-400 animate-spin-slow-reverse"></div>
              <FaGamepad className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-pink-300" />
            </div>
            <p className="mt-4 text-pink-200 text-xl font-orbitron">Loading quiz game...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
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

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 text-center border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40 max-w-md w-full"
          >
            <div className="text-pink-400 mb-6">
              <FaExclamationTriangle className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">Error Loading Game</h2>
            <p className="text-pink-200 text-lg mb-6 font-orbitron">{error}</p>
            <div className="flex justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackToRoom}
                className="px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
              >
                <FiArrowLeft className="w-5 h-5 mr-2 inline-block" />
                Back to Room
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                className="px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-2xl hover:from-purple-600 hover:to-indigo-600 hover:scale-105 active:scale-95 border-white/30"
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

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 text-center border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40 max-w-md w-full"
          >
            <h1 className="text-2xl font-bold mb-4 text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">Room or Quiz Not Found</h1>
            <p className="mb-6 text-pink-200 font-orbitron">The quiz game you're looking for doesn't exist or has expired.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
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
                onClick={handleBackToRoom}
                aria-label="Back to room"
              >
                <FiArrowLeft className="w-6 h-6" />
              </motion.button>

              <h1 className="flex items-center gap-3 text-4xl font-extrabold text-transparent md:text-5xl font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 drop-shadow-lg">
                <FaGamepad className="inline-block text-yellow-300 animate-bounce" />
                Quiz Game
              </h1>
            </div>
            <div className="px-4 py-1 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full text-white font-orbitron">
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
                className="p-8 border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40 mb-6"
              >
                {quiz?.questions && quiz.questions[currentQuestion] ? (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                        Question {currentQuestion + 1} of {quiz.questions.length}
                      </h3>
                      {remaining > 0 && (
                        <div className="px-4 py-2 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-full text-white font-orbitron text-xl shadow-lg">
                          {remaining}s
                        </div>
                      )}
                    </div>

                    <div className="mb-8 p-6 border-2 border-pink-400/40 rounded-2xl bg-indigo-900/50 shadow-lg">
                      <p className="text-xl text-pink-200 font-orbitron">{quiz.questions[currentQuestion].content}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {quiz.questions[currentQuestion].options &&
                        Array.isArray(quiz.questions[currentQuestion].options) &&
                        quiz.questions[currentQuestion].options.map((option) => (
                          <motion.button
                            key={option._id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-5 rounded-2xl border-2 transition-all font-orbitron ${selectedAnswer === option._id
                              ? 'border-yellow-400 bg-indigo-800/80 text-pink-200 shadow-[0_0_15px_rgba(234,179,8,0.5)]'
                              : 'border-pink-400/40 text-pink-200 hover:border-yellow-400/70 hover:shadow-[0_0_10px_rgba(234,179,8,0.3)]'
                              } ${answerSubmitted ? 'cursor-not-allowed opacity-70' : ''}`}
                            onClick={() => !answerSubmitted && handleSubmitAnswer(option._id)}
                            disabled={answerSubmitted}
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
                        <p className="text-yellow-400 font-bold font-orbitron">
                          Answer submitted! Moving to next question...
                        </p>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-lg text-pink-200 font-orbitron">
                      {currentQuestion >= (quiz?.questions?.length || 0)
                        ? "You've completed all questions! Waiting for results..."
                        : "Loading question..."}
                    </p>
                    {currentQuestion >= (quiz?.questions?.length || 0) && (
                      <div className="mt-4">
                        <FaSpinner className="w-12 h-12 text-pink-300 animate-spin mx-auto" />
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
                className="p-6 border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40"
              >
                <h3 className="text-xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 mb-4">
                  Game Progress
                </h3>
                <p className="text-pink-200 font-orbitron mb-4">Scores will be shown at the end of the quiz.</p>
                <div className="mt-2">
                  <div className="w-full bg-indigo-900/80 rounded-full h-3 border border-pink-400/30">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentQuestion / quiz?.questions?.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className="bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 h-full rounded-full"
                    />
                  </div>
                  <p className="text-sm text-pink-200 font-orbitron mt-2">
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
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-lg ${getUserId(participant.userId) === user?._id ? 'ring-2 ring-yellow-300 ring-offset-2 ring-offset-indigo-900' : ''
                        }`}>
                        {getUserInitial(participant.userId)}
                      </div>
                      <p className="mt-1 text-pink-200 text-xs font-orbitron">{getUserName(participant.userId)}</p>
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
                className="border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40 overflow-hidden h-full"
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
                onClick={handleBackToRoom}
                aria-label="Back to room"
              >
                <FiArrowLeft className="w-6 h-6" />
              </motion.button>

              <h1 className="flex items-center gap-3 text-4xl font-extrabold text-transparent md:text-5xl font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 drop-shadow-lg">
                <FaTrophy className="inline-block text-yellow-300 animate-bounce" />
                Quiz Results
              </h1>
            </div>
            <div className="px-4 py-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full text-white font-orbitron">
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
                className="p-8 border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40 mb-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 mb-2">
                    Final Leaderboard
                  </h2>
                  <p className="text-pink-200 font-orbitron">
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
                        // Define heights and colors based on position
                        const heights = ["h-28", "h-36", "h-20"];
                        const bgGradients = [
                          "bg-gradient-to-b from-gray-300 to-gray-400",
                          "bg-gradient-to-b from-yellow-300 to-yellow-500",
                          "bg-gradient-to-b from-orange-300 to-orange-500"
                        ];
                        const positions = [2, 1, 3]; // Silver, Gold, Bronze
                        const marginTop = ["mt-8", "mt-0", "mt-16"];
                        const shadows = [
                          "shadow-lg",
                          "shadow-[0_0_20px_rgba(234,179,8,0.6)]",
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
                            <div className="rounded-full w-16 h-16 mb-2 flex items-center justify-center bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 border-4 border-white shadow-lg">
                              <span className="text-2xl font-bold text-white font-orbitron">{getUserInitial(participant.userId)}</span>
                            </div>
                            <p className="text-center font-semibold mb-2 w-24 truncate text-pink-200 font-orbitron">{getUserName(participant.userId)}</p>
                            <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 font-orbitron">{participant.score} pts</p>
                            <motion.div
                              className={`${bgGradients[index]} ${heights[index]} w-24 ${marginTop[index]} rounded-t-lg flex items-start justify-center pt-2 ${shadows[index]} border-t-2 border-x-2 border-white/30`}
                              initial={{ height: 0 }}
                              animate={{ height: heights[index].replace('h-', '') * 4 }}
                              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                            >
                              <span className="bg-gradient-to-r from-indigo-800 to-purple-800 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white font-orbitron border-2 border-white/50">
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
                      className="w-full max-w-2xl border-2 border-pink-400/40 rounded-2xl overflow-hidden shadow-2xl"
                    >
                      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3">
                        <h3 className="font-bold font-orbitron">Complete Rankings</h3>
                      </div>
                      <div className="divide-y divide-pink-400/20">
                        {participants.sort((a, b) => b.score - a.score).map((participant, index) => (
                          <motion.div
                            key={participant._id || index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.6 + index * 0.05 }}
                            className={`px-4 py-3 flex items-center justify-between hover:bg-indigo-700/30 transition-colors ${getUserId(participant.userId) === user?._id ? 'bg-indigo-700/50' : ''
                              }`}
                          >
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 
                                ${index === 0 ? 'bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900' :
                                  index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900' :
                                    index === 2 ? 'bg-gradient-to-r from-orange-300 to-orange-500 text-orange-900' :
                                      'bg-gradient-to-r from-blue-400 to-indigo-500 text-white'
                                }`}>
                                <span className="font-orbitron text-sm">{index + 1}</span>
                              </div>
                              <div>
                                <p className="font-medium text-pink-200 font-orbitron">
                                  {getUserName(participant.userId)}
                                  {getUserId(participant.userId) === user?._id && (
                                    <span className="ml-2 text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-orbitron">YOU</span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="text-lg font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                              {participant.score}
                              <span className="text-sm text-pink-300 ml-1">pts</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {(!participants || !Array.isArray(participants) || participants.length === 0) && (
                  <div className="text-center py-10">
                    <p className="text-pink-200 font-orbitron">No results available</p>
                  </div>
                )}

                <div className="mt-8 flex justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
                  >
                    Back to Dashboard
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBackToRoom}
                    className="px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-2xl hover:from-purple-600 hover:to-indigo-600 hover:scale-105 active:scale-95 border-white/30"
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
                    className="inline-flex items-center px-6 py-3 bg-[#1877F2] text-white font-medium rounded-xl hover:bg-[#166FE5] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-orbitron"
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
                className="border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40 overflow-hidden h-full"
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
              onClick={handleBackToRoom}
              aria-label="Back to room"
            >
              <FiArrowLeft className="w-6 h-6" />
            </motion.button>

            <h1 className="flex items-center gap-3 text-4xl font-extrabold text-transparent md:text-5xl font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 drop-shadow-lg">
              <FaGamepad className="inline-block text-yellow-300 animate-bounce" />
              Quiz Game: {room.code}
            </h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="p-8 border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40 mb-8 max-w-2xl mx-auto"
        >
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-indigo-600/30 rounded-full border-4 border-indigo-400/50 mb-4">
                <FaSpinner className="w-12 h-12 text-pink-300 animate-spin" />
              </div>
              <h2 className="text-3xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 mb-2">Waiting for Game to Start</h2>
              <p className="text-pink-200 text-lg font-orbitron">The game host hasn't started the game yet.</p>
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
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                    {getUserInitial(participant.userId)}
                  </div>
                  <p className="mt-2 text-pink-200 text-sm">{getUserName(participant.userId)}</p>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackToRoom}
              className="mt-8 inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white font-medium rounded-xl hover:from-pink-400 hover:to-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-orbitron"
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