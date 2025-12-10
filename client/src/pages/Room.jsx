import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getRoomByCode, getRoomParticipants, startRoom, endRoom, checkIsHost } from '../services/api';
import RoomChat from '../components/RoomChat';
import socketService from '../services/socketService';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaGamepad, FaStar, FaUsers, FaDoorOpen, FaSignOutAlt, FaUser, FaUserFriends, FaMedal, FaUserCog, FaCrown, FaTrophy } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Helper functions to safely extract user information
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
  return '?';
};

// Get host details from participants array when hostId is just an ID
const getHostDetails = (hostId, participants) => {
  if (!hostId || !participants || !Array.isArray(participants)) return null;

  // First, try to find the host in participants array
  const hostParticipant = participants.find(p =>
    p.userId && getUserId(p.userId) === hostId
  );

  if (hostParticipant && hostParticipant.userId) {
    return hostParticipant.userId;
  }

  // If not found, just return the ID
  return hostId;
};

function Room({ user: propUser }) {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Use the user from props or fallback to localStorage
  const [user, setUser] = useState(propUser || null);
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

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
  const fetchRoomData = async () => {
    try {
      setLoading(true);
      setError('');

      // Extract room code from URL if needed
      const actualCode = code || location.pathname.split('/').pop();
      console.log('Using room code:', actualCode);

      // Check if code is undefined or invalid
      if (!actualCode || actualCode === 'undefined') {
        console.error('Invalid room code:', actualCode);
        setError('Invalid room code. Please try again.');
        // Redirect to dashboard after a short delay
        setTimeout(() => navigate('/dashboard'), 2000);
        return;
      }

      const roomResponse = await getRoomByCode(actualCode);
      if (!roomResponse.success) {
        throw new Error(roomResponse.message || 'Failed to load room');
      }

      setRoom(roomResponse.data);

      // Make sure quizId exists and set it safely
      if (roomResponse.data && roomResponse.data.quizId) {
        setQuiz(roomResponse.data.quizId);
      } else {
        console.error('Quiz data missing in room response');
        setQuiz(null);
      }

      // Try to determine host status
      await determineHostStatus(actualCode, roomResponse.data);

      const participantsResponse = await getRoomParticipants(actualCode);
      if (participantsResponse.success) {
        setParticipants(participantsResponse.data);
      }

      // Now that we have the room data, initialize and join the socket room
      try {
        // This will return a promise that resolves when connected
        await socketService.init(user);
        setSocketConnected(true);
        await socketService.joinRoom(actualCode);
      } catch (socketError) {
        console.error('Socket connection error:', socketError);
        toast.error('Could not connect to real-time updates. Functionality will be limited.');
      }
    } catch (error) {
      setError('Error loading room data');
      console.error('Error fetching room data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Separate function to determine host status with multiple fallbacks
  const determineHostStatus = async (roomCode, roomData) => {
    try {
      // First check: If this is a room the user just created, they are the host
      if (roomData.isCreator === true) {
        console.log('User is the creator of this room!');
        setIsHost(true);
        return;
      }

      const hostId = getUserId(roomData.hostId);
      console.log('Host ID (extracted):', hostId);
      console.log('User ID (from props):', user?._id);

      // Try multiple comparison formats for maximum compatibility
      let userIsHost = false;

      if (hostId && user) {
        // Convert both to strings for comparison
        const hostIdStr = String(hostId);
        const userIdStr = String(user._id);

        console.log('Host ID as string:', hostIdStr);
        console.log('User ID as string:', userIdStr);
        console.log('String comparison result:', hostIdStr === userIdStr);

        // Try direct comparison
        if (hostId === user._id) {
          console.log('Direct comparison matched');
          userIsHost = true;
        }
        // Try string comparison
        else if (hostIdStr === userIdStr) {
          console.log('String comparison matched');
          userIsHost = true;
        }
        // Try comparing toString values
        else if (user._id && user._id.toString && hostId === user._id.toString()) {
          console.log('toString comparison matched');
          userIsHost = true;
        }
        // Check if either is nested inside an object
        else if (typeof user._id === 'object' && user._id && user._id._id &&
          (hostId === user._id._id || hostId === String(user._id._id))) {
          console.log('Nested object comparison matched');
          userIsHost = true;
        }
        // LAST RESORT: Case-insensitive comparison
        else if (hostIdStr.toLowerCase() === userIdStr.toLowerCase()) {
          console.log('Case-insensitive comparison matched');
          userIsHost = true;
        }
      }

      // If all client-side comparisons fail, try the server API as last resort
      if (!userIsHost) {
        console.log('Client-side host checks failed, trying server API');
        const hostCheckResponse = await checkIsHost(roomCode);
        if (hostCheckResponse.success && hostCheckResponse.isHost) {
          console.log('Server confirms user is host!');
          userIsHost = true;
        }
      }

      console.log('Final host check result:', userIsHost);
      setIsHost(userIsHost);
    } catch (error) {
      console.error('Error determining host status:', error);
    }
  };

  useEffect(() => {
    // Extract room code from URL if needed
    const actualCode = code || location.pathname.split('/').pop();
    console.log('Room component initialized with code:', actualCode);

    // Check if code is undefined before fetching data
    if (!actualCode || actualCode === 'undefined') {
      console.error('Invalid room code in useEffect:', actualCode);
      setError('Invalid room code. Redirecting to dashboard...');
      // Redirect to dashboard after a short delay
      setTimeout(() => navigate('/dashboard'), 2000);
      return;
    }

    fetchRoomData();

    // Set up socket event listeners
    socketService.on('onConnect', () => {
      console.log('Socket connected, joining room:', actualCode);
      setSocketConnected(true);
      socketService.joinRoom(actualCode)
        .catch(err => console.error('Error joining room:', err));
    });

    socketService.on('onDisconnect', () => {
      setSocketConnected(false);
      toast.error('Connection lost. Trying to reconnect...');
    });

    socketService.on('onUserJoined', (data) => {
      toast.success(`${data.username} joined the room!`);
      // Refresh participants
      getRoomParticipants(actualCode).then(response => {
        if (response.success) {
          setParticipants(response.data);
        }
      });
    });

    socketService.on('onUserLeft', (data) => {
      toast.info(`${data.username} left the room`);
      // Refresh participants
      getRoomParticipants(actualCode).then(response => {
        if (response.success) {
          setParticipants(response.data);
        }
      });
    });

    socketService.on('onRoomData', (data) => {
      setRoom(data.room);
      setParticipants(data.participants);

      // Update host status if room data changes
      if (data.room && data.room.hostId && user?._id) {
        const hostId = getUserId(data.room.hostId);
        setIsHost(hostId === user._id);
      }
    });

    socketService.on('onGameStarted', (data) => {
      console.log('Game started event:', data);
      toast.success('Game started!');
      // Navigate to the game page
      navigate(`/quiz-game/${code}`);

      // Update room status and quiz data
      if (data && data.room) {
        setRoom(data.room);
      }
      if (data && data.quiz) {
        setQuiz(data.quiz);
      }
      // Update participant scores
      if (data && Array.isArray(data.participants)) {
        setParticipants(data.participants);
      }
    });

    socketService.on('onUserAnswered', (data) => {
      // Update UI to show someone answered (without revealing the answer)
      toast.info(`${data.username} answered the question!`);
    });

    socketService.on('onAnswerProcessed', (data) => {
      // Handle response for your own answer
      if (data.success) {
        toast.success('Answer submitted!');
      }
    });

    socketService.on('onGameProgress', (data) => {
      // Update participant scores
      if (data && Array.isArray(data.participants)) {
        setParticipants(data.participants);
      }
    });

    socketService.on('onGameEnded', (data) => {
      toast.success('Game ended!');
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
      // Reset all socket callbacks to empty functions
      Object.keys(socketService.callbacks).forEach(event => {
        socketService.on(event, () => { });
      });
    };
  }, [code, location.pathname, navigate, user]);

  // Start the game (host only)
  const handleStartGame = async () => {
    try {
      setError('');
      // Get the actual room code
      const actualCode = code || location.pathname.split('/').pop();

      console.log('Starting game with code:', actualCode);

      // First attempt a direct API call as it's most reliable
      toast.loading('Starting game...');

      const response = await startRoom(actualCode);
      console.log('Start room API response:', response);
      toast.dismiss();

      if (response.success) {
        toast.success('Game started!');
        setRoom({ ...response.data, status: 'in_progress' });

        // Now try socket notification if connected
        if (socketConnected) {
          socketService.startGame(actualCode);
        }

        // Navigate to the quiz game page - add a small delay to ensure state is updated
        setTimeout(() => {
          navigate(`/quiz-game/${actualCode}`);
        }, 500);
      } else {
        setError(response.message || 'Failed to start game');
        toast.error('Failed to start game: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      setError('Error starting game');
      console.error('Error starting game:', error);
      toast.error('Error starting game');
    }
  };

  // End the game (host only)
  const handleEndGame = async () => {
    try {
      setError('');
      // Get the actual room code
      const actualCode = code || location.pathname.split('/').pop();

      // Use socket to end the game if connected
      if (socketConnected) {
        socketService.endGame(actualCode);
      }

      // Also call the API for backup
      const response = await endRoom(actualCode);

      if (response.success) {
        setRoom(response.data.room);
        setParticipants(response.data.participants);
      } else {
        setError(response.message || 'Failed to end game');
      }
    } catch (error) {
      setError('Error ending game');
      console.error('Error ending game:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-screen min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="w-16 h-16 border-4 border-pink-400/40 border-t-transparent rounded-full animate-spin"></div>
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
          >
            Back to Dashboard
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 text-center border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40"
        >
          <h1 className="text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 mb-4">Room Not Found</h1>
          <p className="mb-4 text-pink-200 font-orbitron">The room you're looking for doesn't exist or has expired.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
          >
            Back to Dashboard
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Waiting room display
  if (room.status === 'waiting') {
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
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-pink-200 hover:text-white transition-all"
              >
                <FaArrowLeft />
                <span className="font-orbitron">Back to Dashboard</span>
              </Link>
            </div>
            <h1 className="flex items-center gap-3 text-4xl font-extrabold text-transparent md:text-5xl font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 drop-shadow-lg">
              <FaGamepad className="inline-block text-yellow-300 animate-bounce" />
              Room: {code}
              <FaStar className="inline-block text-pink-300 animate-spin-slow" />
            </h1>
            <div></div> {/* Empty div for flex justify-between */}
          </motion.div>

          {!socketConnected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 mb-8 border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40"
            >
              <p className="text-pink-200 font-orbitron mb-4">Socket connection not established. Some real-time features may be limited.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => socketService.init(user).then(() => setSocketConnected(true))}
                className="px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
              >
                Reconnect
              </motion.button>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main game area */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="p-8 border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40"
              >
                {isHost && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8 p-6 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 rounded-2xl border-2 border-pink-400/40"
                  >
                    <div className="flex items-center gap-4">
                      <FaCrown className="w-8 h-8 text-yellow-400" />
                      <div>
                        <h2 className="text-xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                          You are the Quiz Host
                        </h2>
                        <p className="text-pink-200 font-orbitron">You have control over when the game starts and ends</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {room && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center text-pink-200 font-orbitron">
                      <span className="mr-2">Host:</span>
                      <div className={`px-4 py-2 rounded-xl flex items-center ${isHost ? 'bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white' : 'bg-indigo-900/50 text-pink-200'}`}>
                        <span className="font-bold">{getUserName(getHostDetails(room.hostId, participants))}</span>
                        {isHost && (
                          <span className="ml-2 bg-white text-pink-500 px-2 py-0.5 rounded-full text-sm font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                    </h2>
                    <p className="text-pink-200 font-orbitron">
                      Quiz: {quiz?.title || 'Loading...'}
                    </p>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-pink-200 font-orbitron">
                    Participants ({participants.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {participants.map((participant) => (
                      <motion.div
                        key={participant._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 rounded-xl border-2 border-pink-400/40 flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white flex items-center justify-center font-bold">
                          {getUserInitial(participant.userId)}
                        </div>
                        <span className="text-pink-200 font-orbitron">{getUserName(participant.userId)}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-lg mb-6 text-pink-200 font-orbitron">Waiting for the game to start...</p>

                  {isHost && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-block p-8 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 rounded-2xl border-2 border-pink-400/40"
                    >
                      <h3 className="text-xl font-bold mb-6 text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                        Host Controls
                      </h3>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleStartGame}
                        disabled={!room || participants.length < 1}
                        className={`px-8 py-4 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30 ${(!room || participants.length < 1) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          <FaGamepad className="w-6 h-6" />
                          <span>START GAME</span>
                        </div>
                      </motion.button>

                      {participants.length < 1 && (
                        <p className="mt-4 text-yellow-400 font-orbitron">Need at least one participant to start</p>
                      )}
                    </motion.div>
                  )}

                  {!isHost && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-block p-6 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 rounded-2xl border-2 border-pink-400/40 animate-pulse"
                    >
                      <p className="text-pink-200 font-orbitron">
                        Only the host can start the game. Please wait...
                      </p>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mt-8 p-6 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 rounded-2xl border-2 border-pink-400/40"
                  >
                    <h3 className="font-bold text-lg text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 mb-4">
                      How to Play
                    </h3>
                    <div className="space-y-2 text-pink-200 font-orbitron">
                      <p>1. Wait for the host to start the game</p>
                      <p>2. The game will begin automatically once started</p>
                      <p>3. Answer questions to earn points</p>
                    </div>

                    {room?.status === 'in_progress' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-4 p-4 bg-gradient-to-r from-green-500/30 to-green-600/30 rounded-xl"
                      >
                        <p className="text-green-200 font-bold font-orbitron">Game in progress!</p>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Chat sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-full"
              >
                <RoomChat roomCode={code} roomId={room?._id} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game in progress display
  if (room.status === 'in_progress') {
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
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-pink-200 hover:text-white transition-all"
              >
                <FaArrowLeft />
                <span className="font-orbitron">Back to Dashboard</span>
              </Link>
            </div>
            <h1 className="flex items-center gap-3 text-4xl font-extrabold text-transparent md:text-5xl font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 drop-shadow-lg">
              <FaGamepad className="inline-block text-yellow-300 animate-bounce" />
              Room: {code}
              <FaStar className="inline-block text-pink-300 animate-spin-slow" />
            </h1>
            <div></div> {/* Empty div for flex justify-between */}
          </motion.div>

          {!socketConnected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 mb-8 border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40"
            >
              <p className="text-pink-200 font-orbitron mb-4">Socket connection not established. Some real-time features may be limited.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => socketService.init(user).then(() => setSocketConnected(true))}
                className="px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
              >
                Reconnect
              </motion.button>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 border-4 shadow-2xl bg-gradient-to-br from-green-900/50 via-green-800/50 to-green-700/50 backdrop-blur-xl rounded-3xl border-green-400/40"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                  Quiz Game in Progress!
                </h2>
                <p className="text-green-200 font-orbitron">Answer the questions below to earn points</p>
              </div>
              {isHost && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEndGame}
                  className="px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-2xl hover:from-red-600 hover:to-red-500 hover:scale-105 active:scale-95 border-white/30"
                >
                  End Game
                </motion.button>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main game area */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="p-8 border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40"
              >
                {isHost && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8 p-6 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 rounded-2xl border-2 border-pink-400/40"
                  >
                    <div className="flex items-center gap-4">
                      <FaCrown className="w-8 h-8 text-yellow-400" />
                      <div>
                        <h2 className="text-xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                          You are the Quiz Host
                        </h2>
                        <p className="text-pink-200 font-orbitron">You have control over when the game starts and ends</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {room && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center text-pink-200 font-orbitron">
                      <span className="mr-2">Host:</span>
                      <div className={`px-4 py-2 rounded-xl flex items-center ${isHost ? 'bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white' : 'bg-indigo-900/50 text-pink-200'}`}>
                        <span className="font-bold">{getUserName(getHostDetails(room.hostId, participants))}</span>
                        {isHost && (
                          <span className="ml-2 bg-white text-pink-500 px-2 py-0.5 rounded-full text-sm font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                    </h2>
                    <p className="text-pink-200 font-orbitron">
                      Quiz: {quiz?.title || 'Loading...'}
                    </p>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-pink-200 font-orbitron">
                    Participants ({participants.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {participants.map((participant) => (
                      <motion.div
                        key={participant._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 rounded-xl border-2 border-pink-400/40 flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white flex items-center justify-center font-bold">
                          {getUserInitial(participant.userId)}
                        </div>
                        <div>
                          <span className="text-pink-200 font-orbitron">{getUserName(participant.userId)}</span>
                          {participant.score > 0 && (
                            <span className="ml-2 text-green-400 font-bold">{participant.score} pts</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="text-center py-8">
                  <h2 className="text-2xl font-bold mb-6 text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                    Game in Progress!
                  </h2>
                  <p className="text-lg mb-8 text-pink-200 font-orbitron">
                    The game has been started by the host.
                  </p>

                  <div className="mb-8 max-w-md mx-auto">
                    <div className="p-6 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 rounded-2xl border-2 border-pink-400/40 mb-6">
                      <p className="text-pink-200 font-orbitron">Click the button below to join the quiz and answer questions!</p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/quiz-game/${code}`)}
                      className="px-8 py-4 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30 animate-pulse"
                    >
                      <div className="flex items-center gap-2">
                        <FaGamepad className="w-6 h-6" />
                        <span>Play Game</span>
                      </div>
                    </motion.button>
                  </div>

                  {isHost && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 p-6 border-t-2 border-pink-400/40"
                    >
                      <h3 className="text-xl font-bold mb-6 text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                        Host Controls
                      </h3>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleEndGame}
                        className="px-8 py-4 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-2xl hover:from-red-600 hover:to-red-500 hover:scale-105 active:scale-95 border-white/30"
                      >
                        <div className="flex items-center gap-2">
                          <FaSignOutAlt className="w-6 h-6" />
                          <span>END GAME</span>
                        </div>
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Chat sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-full"
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
  if (room.status === 'completed') {
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
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-pink-200 hover:text-white transition-all"
              >
                <FaArrowLeft />
                <span className="font-orbitron">Back to Dashboard</span>
              </Link>
            </div>
            <h1 className="flex items-center gap-3 text-4xl font-extrabold text-transparent md:text-5xl font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 drop-shadow-lg">
              <FaTrophy className="inline-block text-yellow-300 animate-bounce" />
              Quiz Results
              <FaStar className="inline-block text-pink-300 animate-spin-slow" />
            </h1>
            <div></div> {/* Empty div for flex justify-between */}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main game area */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="p-8 border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                    Quiz Results
                  </h2>
                  <div className="px-4 py-2 bg-gradient-to-r from-green-500/30 to-green-600/30 rounded-xl text-green-200 font-orbitron">
                    Game Completed
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-2 text-center text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                    Final Leaderboard
                  </h2>
                  <p className="text-pink-200 text-center mb-8 font-orbitron">
                    Quiz: {quiz?.title || 'Loading...'}
                  </p>

                  {participants && Array.isArray(participants) && participants.length > 0 && (
                    <div className="flex flex-col items-center mb-8">
                      {/* Top 3 Podium */}
                      <div className="flex items-end justify-center w-full max-w-xl mx-auto mb-8">
                        {participants.sort((a, b) => b.score - a.score).slice(0, 3).map((participant, index) => {
                          const heights = ["h-28", "h-36", "h-20"];
                          const bgColors = ["bg-gradient-to-b from-gray-400 to-gray-500", "bg-gradient-to-b from-yellow-400 to-yellow-500", "bg-gradient-to-b from-orange-400 to-orange-500"];
                          const positions = [2, 1, 3];
                          const marginTop = ["mt-8", "mt-0", "mt-16"];

                          return (
                            <motion.div
                              key={participant._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: index * 0.2 }}
                              className="flex flex-col items-center mx-2"
                            >
                              <div className="rounded-full w-16 h-16 mb-2 flex items-center justify-center bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 border-4 border-pink-400/40 shadow-lg">
                                <span className="text-2xl font-bold text-pink-200">{getUserInitial(participant.userId)}</span>
                              </div>
                              <p className="text-center font-semibold mb-2 w-24 truncate text-pink-200 font-orbitron">
                                {getUserName(participant.userId)}
                              </p>
                              <p className="text-lg font-bold text-yellow-400 font-orbitron">{participant.score} pts</p>
                              <div className={`${bgColors[index]} ${heights[index]} w-24 ${marginTop[index]} rounded-t-lg flex items-start justify-center pt-2 shadow-lg`}>
                                <span className="bg-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">
                                  {positions[index]}
                                </span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* All participants list */}
                      <div className="w-full max-w-2xl bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 rounded-xl overflow-hidden shadow-lg border-2 border-pink-400/40">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3">
                          <h3 className="font-bold text-white font-orbitron">Complete Rankings</h3>
                        </div>
                        <div className="divide-y divide-pink-400/20">
                          {participants.sort((a, b) => b.score - a.score).map((participant, index) => (
                            <motion.div
                              key={participant._id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              className={`px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors ${getUserId(participant.userId) === user._id ? 'bg-pink-500/20' : ''
                                }`}
                            >
                              <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-800' :
                                  index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-gray-700' :
                                    index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-orange-800' :
                                      'bg-gradient-to-r from-indigo-400 to-indigo-500 text-indigo-800'
                                  }`}>
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-medium text-pink-200 font-orbitron">
                                    {getUserName(participant.userId)}
                                    {getUserId(participant.userId) === user._id && (
                                      <span className="ml-2 text-xs bg-pink-500 text-white px-2 py-0.5 rounded-full">YOU</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="text-lg font-bold text-yellow-400 font-orbitron">
                                {participant.score}
                                <span className="text-sm text-pink-300/80 ml-1">pts</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {(!participants || !Array.isArray(participants) || participants.length === 0) && (
                    <div className="text-center py-10">
                      <p className="text-pink-200 font-orbitron">No results available</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
                  >
                    Back to Dashboard
                  </motion.button>

                  {isHost && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/create-room')}
                      className="px-6 py-3 text-pink-200 transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 rounded-2xl hover:from-pink-900/50 hover:to-indigo-900/50 hover:scale-105 active:scale-95 border-pink-400/40"
                    >
                      Create New Room
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Chat sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-full"
              >
                <RoomChat roomCode={code} roomId={room?._id} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default display if room status doesn't match any of the above
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 text-center border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40"
      >
        <h1 className="text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 mb-4">
          Room: {room.code}
        </h1>
        <p className="mb-4 text-pink-200 font-orbitron">Status: {room.status}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
        >
          Back to Dashboard
        </motion.button>
      </motion.div>
    </div>
  );
}

export default Room; 