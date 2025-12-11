import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getRoomByCode, getRoomParticipants, startRoom, endRoom, checkIsHost } from '../services/api';
import RoomChat from '../components/RoomChat';
import socketService from '../services/socketService';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaGamepad, FaStar, FaUsers, FaDoorOpen, FaSignOutAlt, FaUser, FaUserFriends, FaMedal, FaUserCog, FaCrown, FaTrophy } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// THEME COLORS
const PRIMARY = '#1E74D7'; // main blue
const PRIMARY_DARK = '#003A70';
const PRIMARY_LIGHT = '#4BA3FF';
const MUTED_TEXT = '#DDEAF6';
const ACCENT_YELLOW = '#FBBF24';
const SUCCESS = '#059669';
const DANGER = '#D32F2F';
const BG_CARD = 'rgba(255,255,255,0.03)';

// Helper functions to safely extract user information
const getUserId = (user) => {
  if (!user) return null;
  if (typeof user === 'string') return user;
  if (typeof user === 'object' && user._id) {
    if (typeof user._id === 'object' && user._id.toString) {
      return user._id.toString();
    }
    return user._id;
  }
  if (typeof user === 'object') {
    const possibleIds = ['id', 'userId', 'hostId'];
    for (const idField of possibleIds) {
      if (user[idField]) {
        if (typeof user[idField] === 'object' && user[idField].toString) {
          return user[idField].toString();
        }
        return user[idField];
      }
    }
  }
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

const getHostDetails = (hostId, participants) => {
  if (!hostId || !participants || !Array.isArray(participants)) return null;
  const hostParticipant = participants.find(p =>
    p.userId && getUserId(p.userId) === hostId
  );
  if (hostParticipant && hostParticipant.userId) {
    return hostParticipant.userId;
  }
  return hostId;
};

function Room({ user: propUser }) {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(propUser || null);
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

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

  const fetchRoomData = async () => {
    try {
      setLoading(true);
      setError('');

      const actualCode = code || location.pathname.split('/').pop();
      console.log('Using room code:', actualCode);

      if (!actualCode || actualCode === 'undefined') {
        console.error('Invalid room code:', actualCode);
        setError('Invalid room code. Please try again.');
        setTimeout(() => navigate('/dashboard'), 2000);
        return;
      }

      const roomResponse = await getRoomByCode(actualCode);
      if (!roomResponse.success) {
        throw new Error(roomResponse.message || 'Failed to load room');
      }

      setRoom(roomResponse.data);

      if (roomResponse.data && roomResponse.data.quizId) {
        setQuiz(roomResponse.data.quizId);
      } else {
        console.error('Quiz data missing in room response');
        setQuiz(null);
      }

      await determineHostStatus(actualCode, roomResponse.data);

      const participantsResponse = await getRoomParticipants(actualCode);
      if (participantsResponse.success) {
        setParticipants(participantsResponse.data);
      }

      try {
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

  const determineHostStatus = async (roomCode, roomData) => {
    try {
      if (roomData.isCreator === true) {
        setIsHost(true);
        return;
      }

      const hostId = getUserId(roomData.hostId);
      let userIsHost = false;

      if (hostId && user) {
        const hostIdStr = String(hostId);
        const userIdStr = String(user._id);

        if (hostId === user._id) {
          userIsHost = true;
        } else if (hostIdStr === userIdStr) {
          userIsHost = true;
        } else if (user._id && user._id.toString && hostId === user._id.toString()) {
          userIsHost = true;
        } else if (typeof user._id === 'object' && user._id && user._id._id &&
          (hostId === user._id._id || hostId === String(user._id._id))) {
          userIsHost = true;
        } else if (hostIdStr.toLowerCase() === userIdStr.toLowerCase()) {
          userIsHost = true;
        }
      }

      if (!userIsHost) {
        const hostCheckResponse = await checkIsHost(roomCode);
        if (hostCheckResponse.success && hostCheckResponse.isHost) {
          userIsHost = true;
        }
      }

      setIsHost(userIsHost);
    } catch (error) {
      console.error('Error determining host status:', error);
    }
  };

  useEffect(() => {
    const actualCode = code || location.pathname.split('/').pop();
    if (!actualCode || actualCode === 'undefined') {
      setError('Invalid room code. Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 2000);
      return;
    }

    fetchRoomData();

    socketService.on('onConnect', () => {
      setSocketConnected(true);
      socketService.joinRoom(actualCode).catch(err => console.error('Error joining room:', err));
    });

    socketService.on('onDisconnect', () => {
      setSocketConnected(false);
      toast.error('Connection lost. Trying to reconnect...');
    });

    socketService.on('onUserJoined', (data) => {
      toast.success(`${data.username} joined the room!`);
      getRoomParticipants(actualCode).then(response => {
        if (response.success) {
          setParticipants(response.data);
        }
      });
    });

    socketService.on('onUserLeft', (data) => {
      toast.info(`${data.username} left the room`);
      getRoomParticipants(actualCode).then(response => {
        if (response.success) {
          setParticipants(response.data);
        }
      });
    });

    socketService.on('onRoomData', (data) => {
      setRoom(data.room);
      setParticipants(data.participants);
      if (data.room && data.room.hostId && user?._id) {
        const hostId = getUserId(data.room.hostId);
        setIsHost(hostId === user._id);
      }
    });

    socketService.on('onGameStarted', (data) => {
      toast.success('Game started!');
      navigate(`/quiz-game/${code}`);
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

    socketService.on('onUserAnswered', (data) => {
      toast.info(`${data.username} answered the question!`);
    });

    socketService.on('onAnswerProcessed', (data) => {
      if (data.success) {
        toast.success('Answer submitted!');
      }
    });

    socketService.on('onGameProgress', (data) => {
      if (data && Array.isArray(data.participants)) {
        setParticipants(data.participants);
      }
    });

    socketService.on('onGameEnded', (data) => {
      toast.success('Game ended!');
      if (data && data.room) {
        setRoom(data.room);
      }
      if (data && Array.isArray(data.participants)) {
        setParticipants(data.participants);
      }
    });

    return () => {
      Object.keys(socketService.callbacks).forEach(event => {
        socketService.on(event, () => { });
      });
    };
  }, [code, location.pathname, navigate, user]);

  const handleStartGame = async () => {
    try {
      setError('');
      const actualCode = code || location.pathname.split('/').pop();
      toast.loading('Starting game...');
      const response = await startRoom(actualCode);
      toast.dismiss();

      if (response.success) {
        toast.success('Game started!');
        setRoom({ ...response.data, status: 'in_progress' });
        if (socketConnected) {
          socketService.startGame(actualCode);
        }
        setTimeout(() => {
          navigate(`/quiz-game/${actualCode}`);
        }, 500);
      } else {
        setError(response.message || 'Failed to start game');
        toast.error('Failed to start game: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      setError('Error starting game');
      toast.error('Error starting game');
    }
  };

  const handleEndGame = async () => {
    try {
      setError('');
      const actualCode = code || location.pathname.split('/').pop();
      if (socketConnected) {
        socketService.endGame(actualCode);
      }
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY})` }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', border: `6px solid ${PRIMARY}66`, borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY})` }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{
          padding: 32,
          textAlign: 'center',
          borderRadius: 24,
          background: BG_CARD,
          border: `1px solid ${PRIMARY}33`,
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
        }}>
          <p style={{ marginBottom: 16, fontSize: 18, color: MUTED_TEXT }}>{error}</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/dashboard')} style={{
            padding: '12px 20px',
            color: '#fff',
            borderRadius: 18,
            background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
            border: 'none',
            cursor: 'pointer'
          }}>
            Back to Dashboard
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (!room) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY})` }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{
          padding: 32,
          textAlign: 'center',
          borderRadius: 24,
          background: BG_CARD,
          border: `1px solid ${PRIMARY}33`,
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
        }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Room Not Found</h1>
          <p style={{ color: MUTED_TEXT, marginBottom: 16 }}>The room you're looking for doesn't exist or has expired.</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/dashboard')} style={{
            padding: '12px 20px',
            color: '#fff',
            borderRadius: 18,
            background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
            border: 'none',
            cursor: 'pointer'
          }}>
            Back to Dashboard
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // WAITING room
  if (room.status === 'waiting') {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden', background: `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY})` }}>
        {/* Animated SVG background (kept) */}
        <svg className="absolute top-0 left-0 z-0 w-full h-full pointer-events-none" style={{ filter: "blur(2px)" }}>
          <defs>
            <radialGradient id="g1" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor={PRIMARY_LIGHT} stopOpacity="0.45" />
              <stop offset="100%" stopColor={PRIMARY} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="80%" cy="20%" r="300" fill="url(#g1)">
            <animate attributeName="cx" values="80%;20%;80%" dur="12s" repeatCount="indefinite" />
          </circle>
          <circle cx="20%" cy="80%" r="200" fill="url(#g1)">
            <animate attributeName="cy" values="80%;20%;80%" dur="16s" repeatCount="indefinite" />
          </circle>
        </svg>

        <div style={{ position: 'relative', zIndex: 10, padding: '32px' }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link to="/dashboard" style={{ display: 'flex', gap: 8, alignItems: 'center', color: MUTED_TEXT, textDecoration: 'none' }}>
                <FaArrowLeft />
                <span style={{ fontFamily: 'Orbitron, sans-serif' }}>Back to Dashboard</span>
              </Link>
            </div>

            <h1 style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 36, fontWeight: 800, fontFamily: 'Orbitron, sans-serif', background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 6px 18px rgba(0,0,0,0.12)' }}>
              <FaGamepad style={{ color: ACCENT_YELLOW }} />
              Room: {code}
              <FaStar style={{ color: PRIMARY_LIGHT, animation: 'spin 6s linear infinite' }} />
            </h1>

            <div />
          </motion.div>

          {!socketConnected && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 16, marginBottom: 24, borderRadius: 20, background: BG_CARD, border: `1px solid ${PRIMARY}33` }}>
              <p style={{ color: MUTED_TEXT, marginBottom: 12 }}>Socket connection not established. Some real-time features may be limited.</p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => socketService.init(user).then(() => setSocketConnected(true))} style={{
                padding: '10px 16px',
                color: '#fff',
                borderRadius: 14,
                background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                border: 'none',
                cursor: 'pointer'
              }}>
                Reconnect
              </motion.button>
            </motion.div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} style={{ padding: 24, borderRadius: 20, background: BG_CARD, border: `1px solid ${PRIMARY}33` }}>
                {isHost && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ marginBottom: 20, padding: 16, borderRadius: 14, background: 'linear-gradient(90deg, rgba(0,0,0,0.14), rgba(0,0,0,0.06))', border: `1px solid ${PRIMARY}22` }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <FaCrown style={{ color: ACCENT_YELLOW, width: 28, height: 28 }} />
                      <div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                          You are the Quiz Host
                        </h2>
                        <p style={{ color: MUTED_TEXT }}>You have control over when the game starts and ends</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {room && (
                  <div style={{ marginBottom: 20 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: MUTED_TEXT }}>
                      <span style={{ marginRight: 8 }}>Host:</span>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '6px 12px',
                        borderRadius: 14,
                        background: isHost ? `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})` : 'rgba(0,0,0,0.12)',
                        color: isHost ? '#fff' : MUTED_TEXT
                      }}>
                        <span style={{ fontWeight: 700 }}>{getUserName(getHostDetails(room.hostId, participants))}</span>
                        {isHost && <span style={{ marginLeft: 8, background: '#fff', color: PRIMARY, padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>YOU</span>}
                      </div>
                    </h2>
                    <p style={{ color: MUTED_TEXT }}>Quiz: {quiz?.title || 'Loading...'}</p>
                  </div>
                )}

                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: MUTED_TEXT }}>Participants ({participants.length})</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
                    {participants.map((participant) => (
                      <motion.div key={participant._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: 12, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, background: BG_CARD, border: `1px solid ${PRIMARY}22` }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`, color: '#fff', fontWeight: 800 }}>
                          {getUserInitial(participant.userId)}
                        </div>
                        <span style={{ color: MUTED_TEXT, fontFamily: 'Orbitron, sans-serif' }}>{getUserName(participant.userId)}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: MUTED_TEXT, fontSize: 18, marginBottom: 16 }}>Waiting for the game to start...</p>

                  {isHost && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'inline-block', padding: 20, borderRadius: 16, background: BG_CARD, border: `1px solid ${PRIMARY}22` }}>
                      <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Host Controls</h3>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleStartGame} disabled={!room || participants.length < 1} style={{
                        padding: '14px 20px',
                        color: '#fff',
                        borderRadius: 14,
                        background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                        border: 'none',
                        cursor: (!room || participants.length < 1) ? 'not-allowed' : 'pointer',
                        opacity: (!room || participants.length < 1) ? 0.6 : 1
                      }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                          <FaGamepad />
                          <span style={{ fontWeight: 700 }}>START GAME</span>
                        </div>
                      </motion.button>

                      {participants.length < 1 && <p style={{ marginTop: 10, color: ACCENT_YELLOW }}>Need at least one participant to start</p>}
                    </motion.div>
                  )}

                  {!isHost && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'inline-block', padding: 16, borderRadius: 12, background: BG_CARD, border: `1px solid ${PRIMARY}22` }}>
                      <p style={{ color: MUTED_TEXT }}>Only the host can start the game. Please wait...</p>
                    </motion.div>
                  )}

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} style={{ marginTop: 24, padding: 16, borderRadius: 12, background: BG_CARD, border: `1px solid ${PRIMARY}22` }}>
                    <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>How to Play</h3>
                    <div style={{ color: MUTED_TEXT, lineHeight: 1.6 }}>
                      <p>1. Wait for the host to start the game</p>
                      <p>2. The game will begin automatically once started</p>
                      <p>3. Answer questions to earn points</p>
                    </div>

                    {room?.status === 'in_progress' && (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ marginTop: 12, padding: 12, borderRadius: 10, background: 'rgba(5,150,105,0.06)', border: `1px solid ${SUCCESS}33` }}>
                        <p style={{ color: SUCCESS, fontWeight: 700 }}>Game in progress!</p>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </div>

            <div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }} style={{ height: '100%' }}>
                <RoomChat roomCode={code} roomId={room?._id} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // IN_PROGRESS
  if (room.status === 'in_progress') {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden', background: `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY})` }}>
        <svg className="absolute top-0 left-0 z-0 w-full h-full pointer-events-none" style={{ filter: "blur(2px)" }}>
          <defs>
            <radialGradient id="g1" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor={PRIMARY_LIGHT} stopOpacity="0.45" />
              <stop offset="100%" stopColor={PRIMARY} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="80%" cy="20%" r="300" fill="url(#g1)">
            <animate attributeName="cx" values="80%;20%;80%" dur="12s" repeatCount="indefinite" />
          </circle>
          <circle cx="20%" cy="80%" r="200" fill="url(#g1)">
            <animate attributeName="cy" values="80%;20%;80%" dur="16s" repeatCount="indefinite" />
          </circle>
        </svg>

        <div style={{ position: 'relative', zIndex: 10, padding: '32px' }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Link to="/dashboard" style={{ display: 'flex', gap: 8, alignItems: 'center', color: MUTED_TEXT, textDecoration: 'none' }}>
                <FaArrowLeft />
                <span className="font-orbitron">Back to Dashboard</span>
              </Link>
            </div>

            <h1 style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 36, fontWeight: 800, fontFamily: 'Orbitron, sans-serif', background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              <FaGamepad style={{ color: ACCENT_YELLOW }} />
              Room: {code}
              <FaStar style={{ color: PRIMARY_LIGHT, animation: 'spin 6s linear infinite' }} />
            </h1>
            <div />
          </motion.div>

          {!socketConnected && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 16, marginBottom: 24, borderRadius: 20, background: BG_CARD, border: `1px solid ${PRIMARY}33` }}>
              <p style={{ color: MUTED_TEXT, marginBottom: 12 }}>Socket connection not established. Some real-time features may be limited.</p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => socketService.init(user).then(() => setSocketConnected(true))} style={{
                padding: '10px 16px',
                color: '#fff',
                borderRadius: 14,
                background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                border: 'none',
                cursor: 'pointer'
              }}>
                Reconnect
              </motion.button>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24, padding: 16, borderRadius: 16, background: 'linear-gradient(90deg, rgba(5,150,105,0.06), rgba(16,185,129,0.04))', border: `1px solid ${SUCCESS}33` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Quiz Game in Progress!
                </h2>
                <p style={{ color: MUTED_TEXT }}>Answer the questions below to earn points</p>
              </div>
              {isHost && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleEndGame} style={{
                  padding: '10px 14px',
                  color: '#fff',
                  borderRadius: 12,
                  background: `linear-gradient(90deg, ${DANGER}, ${DANGER})`,
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  End Game
                </motion.button>
              )}
            </div>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} style={{ padding: 24, borderRadius: 16, background: BG_CARD, border: `1px solid ${PRIMARY}33` }}>
                {isHost && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ marginBottom: 16, padding: 12, borderRadius: 12, background: BG_CARD, border: `1px solid ${PRIMARY}22` }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <FaCrown style={{ color: ACCENT_YELLOW, width: 28, height: 28 }} />
                      <div>
                        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                          You are the Quiz Host
                        </h2>
                        <p style={{ color: MUTED_TEXT }}>You have control over when the game starts and ends</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {room && (
                  <div style={{ marginBottom: 16 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: MUTED_TEXT }}>
                      <span style={{ marginRight: 8 }}>Host:</span>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '6px 12px',
                        borderRadius: 14,
                        background: isHost ? `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})` : 'rgba(0,0,0,0.12)',
                        color: isHost ? '#fff' : MUTED_TEXT
                      }}>
                        <span style={{ fontWeight: 700 }}>{getUserName(getHostDetails(room.hostId, participants))}</span>
                        {isHost && <span style={{ marginLeft: 8, background: '#fff', color: PRIMARY, padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>YOU</span>}
                      </div>
                    </h2>
                    <p style={{ color: MUTED_TEXT }}>Quiz: {quiz?.title || 'Loading...'}</p>
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: MUTED_TEXT }}>Participants ({participants.length})</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
                    {participants.map((participant) => (
                      <motion.div key={participant._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: 12, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, background: BG_CARD, border: `1px solid ${PRIMARY}22` }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`, color: '#fff', fontWeight: 800 }}>
                          {getUserInitial(participant.userId)}
                        </div>
                        <div>
                          <span style={{ color: MUTED_TEXT, fontFamily: 'Orbitron, sans-serif' }}>{getUserName(participant.userId)}</span>
                          {participant.score > 0 && <div style={{ marginTop: 4, color: SUCCESS, fontWeight: 700 }}>{participant.score} pts</div>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Game in Progress!
                  </h2>
                  <p style={{ color: MUTED_TEXT, marginBottom: 16 }}>The game has been started by the host.</p>

                  <div style={{ maxWidth: 560, margin: '0 auto 16px' }}>
                    <div style={{ padding: 16, borderRadius: 12, background: BG_CARD, border: `1px solid ${PRIMARY}22`, marginBottom: 12 }}>
                      <p style={{ color: MUTED_TEXT }}>Click the button below to join the quiz and answer questions!</p>
                    </div>

                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(`/quiz-game/${code}`)} style={{
                      padding: '14px 20px',
                      color: '#fff',
                      borderRadius: 14,
                      background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                      border: 'none',
                      cursor: 'pointer'
                    }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                        <FaGamepad />
                        <span style={{ fontWeight: 700 }}>Play Game</span>
                      </div>
                    </motion.button>
                  </div>

                  {isHost && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${PRIMARY}22` }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Host Controls
                      </h3>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleEndGame} style={{
                        padding: '12px 18px',
                        color: '#fff',
                        borderRadius: 12,
                        background: `${DANGER}`,
                        border: 'none',
                        cursor: 'pointer'
                      }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                          <FaSignOutAlt />
                          <span style={{ fontWeight: 700 }}>END GAME</span>
                        </div>
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>

            <div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
                <RoomChat roomCode={code} roomId={room?._id} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // COMPLETED
  if (room.status === 'completed') {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden', background: `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY})` }}>
        <svg className="absolute top-0 left-0 z-0 w-full h-full pointer-events-none" style={{ filter: "blur(2px)" }}>
          <defs>
            <radialGradient id="g1" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor={PRIMARY_LIGHT} stopOpacity="0.45" />
              <stop offset="100%" stopColor={PRIMARY} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="80%" cy="20%" r="300" fill="url(#g1)">
            <animate attributeName="cx" values="80%;20%;80%" dur="12s" repeatCount="indefinite" />
          </circle>
          <circle cx="20%" cy="80%" r="200" fill="url(#g1)">
            <animate attributeName="cy" values="80%;20%;80%" dur="16s" repeatCount="indefinite" />
          </circle>
        </svg>

        <div style={{ position: 'relative', zIndex: 10, padding: '32px' }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Link to="/dashboard" style={{ display: 'flex', gap: 8, alignItems: 'center', color: MUTED_TEXT, textDecoration: 'none' }}>
                <FaArrowLeft />
                <span className="font-orbitron">Back to Dashboard</span>
              </Link>
            </div>

            <h1 style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 36, fontWeight: 800, fontFamily: 'Orbitron, sans-serif', background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              <FaTrophy style={{ color: ACCENT_YELLOW }} />
              Quiz Results
              <FaStar style={{ color: PRIMARY_LIGHT, animation: 'spin 6s linear infinite' }} />
            </h1>

            <div />
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} style={{ padding: 24, borderRadius: 16, background: BG_CARD, border: `1px solid ${PRIMARY}33` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Quiz Results
                  </h2>
                  <div style={{ padding: '6px 12px', borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: `1px solid ${SUCCESS}33`, color: SUCCESS }}>
                    Game Completed
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, textAlign: 'center', margin: 0, background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Final Leaderboard
                  </h2>
                  <p style={{ color: MUTED_TEXT, textAlign: 'center', marginTop: 8 }}>Quiz: {quiz?.title || 'Loading...'}</p>
                </div>

                {participants && Array.isArray(participants) && participants.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%', maxWidth: 960, marginBottom: 16 }}>
                      {participants.sort((a, b) => b.score - a.score).slice(0, 3).map((participant, index) => {
                        const heights = [112, 144, 80];
                        const bgColors = ['#bdbdbd', '#fbbf24', '#fb923c'];
                        const positions = [2, 1, 3];
                        const marginTop = [32, 0, 64];

                        return (
                          <motion.div key={participant._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.2 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 8px' }}>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG_CARD, border: `2px solid ${PRIMARY}33` }}>
                              <span style={{ fontSize: 20, fontWeight: 800, color: MUTED_TEXT }}>{getUserInitial(participant.userId)}</span>
                            </div>
                            <p style={{ textAlign: 'center', fontWeight: 700, marginBottom: 8, color: MUTED_TEXT, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{getUserName(participant.userId)}</p>
                            <p style={{ fontSize: 18, fontWeight: 800, color: ACCENT_YELLOW }}>{participant.score} pts</p>
                            <div style={{ width: 96, height: heights[index], marginTop: marginTop[index], borderTopLeftRadius: 12, borderTopRightRadius: 12, background: bgColors[index], display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}>
                              <span style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{positions[index]}</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    <div style={{ width: '100%', maxWidth: 960, borderRadius: 12, overflow: 'hidden', border: `1px solid ${PRIMARY}22`, background: BG_CARD }}>
                      <div style={{ padding: 12, background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})` }}>
                        <h3 style={{ margin: 0, color: '#fff', fontWeight: 800 }}>Complete Rankings</h3>
                      </div>
                      <div>
                        {participants.sort((a, b) => b.score - a.score).map((participant, index) => (
                          <motion.div key={participant._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottom: `1px solid ${PRIMARY}12`, background: getUserId(participant.userId) === user._id ? 'rgba(23, 125, 255, 0.06)' : 'transparent' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12,
                                background: index === 0 ? 'linear-gradient(90deg,#fbbf24,#f59e0b)' : index === 1 ? '#bdbdbd' : index === 2 ? '#fb923c' : `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                                color: index < 3 ? '#111' : '#fff',
                                fontWeight: 800
                              }}>
                                {index + 1}
                              </div>
                              <div>
                                <p style={{ margin: 0, color: MUTED_TEXT, fontWeight: 700 }}>{getUserName(participant.userId)} {getUserId(participant.userId) === user._id && <span style={{ marginLeft: 8, padding: '2px 8px', background: PRIMARY, color: '#fff', borderRadius: 12, fontSize: 12 }}>YOU</span>}</p>
                              </div>
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: ACCENT_YELLOW }}>
                              {participant.score} <span style={{ color: MUTED_TEXT, fontSize: 12, marginLeft: 8 }}>pts</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: 24 }}>
                    <p style={{ color: MUTED_TEXT }}>No results available</p>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16 }}>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/dashboard')} style={{
                    padding: '12px 18px',
                    color: '#fff',
                    borderRadius: 12,
                    background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                    border: 'none',
                    cursor: 'pointer'
                  }}>
                    Back to Dashboard
                  </motion.button>

                  {isHost && (
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/create-room')} style={{
                      padding: '12px 18px',
                      color: MUTED_TEXT,
                      borderRadius: 12,
                      background: BG_CARD,
                      border: `1px solid ${PRIMARY}22`,
                      cursor: 'pointer'
                    }}>
                      Create New Room
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </div>

            <div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
                <RoomChat roomCode={code} roomId={room?._id} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT / FALLBACK
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY})` }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 32, textAlign: 'center', borderRadius: 20, background: BG_CARD, border: `1px solid ${PRIMARY}33` }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Room: {room?.code || '—'}</h1>
        <p style={{ color: MUTED_TEXT, marginBottom: 16 }}>Status: {room?.status || '—'}</p>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/dashboard')} style={{
          padding: '12px 18px',
          color: '#fff',
          borderRadius: 12,
          background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
          border: 'none',
          cursor: 'pointer'
        }}>
          Back to Dashboard
        </motion.button>
      </motion.div>
    </div>
  );
}

export default Room;
