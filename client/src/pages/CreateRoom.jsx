import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom, getPublicQuizzes, getUserQuizzes } from '../services/api';
import toast from 'react-hot-toast';
import { FaUsers, FaClock, FaEnvelope, FaCheck, FaGamepad } from 'react-icons/fa';
import '../styles/CreateRoom.css';

function CreateRoom({ user }) {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [timeLimit, setTimeLimit] = useState(60);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [inviteEmails, setInviteEmails] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [roomCreated, setRoomCreated] = useState(false);
  const [showMyQuizzes, setShowMyQuizzes] = useState(false);
  
  const navigate = useNavigate();

  // Fetch available quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        setError('');

        // Decide whether to show user's quizzes or public quizzes
        const response = showMyQuizzes
          ? await getUserQuizzes()
          : await getPublicQuizzes();

        if (response.success) {
          setQuizzes(response.data || []);
        } else {
          setError(response.message || 'Failed to load quizzes');
          setQuizzes([]);
        }
      } catch (error) {
        setError('Failed to load quizzes');
        console.error('Error fetching quizzes:', error);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [showMyQuizzes]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    
    if (!selectedQuiz) {
      setError('Please select a quiz');
      return;
    }

    try {
      setCreating(true);
      setError('');
      
      const inviteList = inviteEmails
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);
      
      const response = await createRoom(selectedQuiz, {
        maxParticipants,
        timeLimit,
        invites: inviteList,
        hostId: user._id
      });
      
      if (response.success) {
        toast.success('Room created successfully!');
        // Set room code for copying/sharing
        setRoomCode(response.data.code);
        setRoomCreated(true);
      } else {
        setError(response.message || 'Failed to create room');
      }
    } catch (error) {
      setError('Error creating room');
      console.error('Error creating room:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinCreatedRoom = () => {
    navigate(`/room/${roomCode}`);
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join-room?code=${roomCode}`;
    navigator.clipboard.writeText(inviteLink)
      .then(() => toast.success('Invite link copied to clipboard!'))
      .catch(() => toast.error('Failed to copy invite link'));
  };

  if (loading) {
    return (
      <div className="create-room-container">
        {/* Animated SVG background */}
        <svg className="animated-bg-svg" style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',zIndex:0,filter:'blur(2px)'}}>
          <defs>
            <radialGradient id="g1" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#f472b6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="80%" cy="20%" r="300" fill="url(#g1)">
            <animate attributeName="cx" values="80%;20%;80%" dur="12s" repeatCount="indefinite" />
          </circle>
          <circle cx="20%" cy="80%" r="200" fill="url(#g1)">
            <animate attributeName="cy" values="80%;20%;80%" dur="16s" repeatCount="indefinite" />
          </circle>
        </svg>
        <div className="loading-spinner" style={{zIndex:1,position:'relative'}}></div>
      </div>
    );
  }

  if (roomCreated) {
    return (
      <div className="create-room-container">
        {/* Animated SVG background */}
        <svg className="animated-bg-svg" style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',zIndex:0,filter:'blur(2px)'}}>
          <defs>
            <radialGradient id="g1" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#f472b6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="80%" cy="20%" r="300" fill="url(#g1)">
            <animate attributeName="cx" values="80%;20%;80%" dur="12s" repeatCount="indefinite" />
          </circle>
          <circle cx="20%" cy="80%" r="200" fill="url(#g1)">
            <animate attributeName="cy" values="80%;20%;80%" dur="16s" repeatCount="indefinite" />
          </circle>
        </svg>
        <div className="create-room-card" style={{zIndex:1,position:'relative'}}>
          <div className="success-message">
            <FaCheck className="w-5 h-5" />
            <span>Room created successfully!</span>
          </div>
          
          <div className="room-code-display">
            <h3 className="form-label">Room Code</h3>
            <div className="room-code">{roomCode}</div>
            <button onClick={copyInviteLink} className="copy-button">
              <FaEnvelope className="w-4 h-4" />
              Copy Invite Link
            </button>
          </div>

          <div className="button-group">
            <button onClick={handleJoinCreatedRoom} className="create-button">
              Join Room Now
            </button>
            <button onClick={() => navigate('/dashboard')} className="cancel-button">
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-room-container">
      {/* Animated SVG background */}
      <svg className="animated-bg-svg" style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',zIndex:0,filter:'blur(2px)'}}>
        <defs>
          <radialGradient id="g1" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#f472b6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="80%" cy="20%" r="300" fill="url(#g1)">
          <animate attributeName="cx" values="80%;20%;80%" dur="12s" repeatCount="indefinite" />
        </circle>
        <circle cx="20%" cy="80%" r="200" fill="url(#g1)">
          <animate attributeName="cy" values="80%;20%;80%" dur="16s" repeatCount="indefinite" />
        </circle>
      </svg>
      <div className="create-room-card" style={{zIndex:1,position:'relative'}}>
        <h1 className="create-room-title">
          <FaGamepad className="create-room-animated-icon" />
          Create a Room
        </h1>
        <p className="create-room-subtitle">Set up a multiplayer quiz session</p>

        {error && (
          <div className="error-message">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="quiz-selector">
          <button
            className={`quiz-selector-button ${!showMyQuizzes ? 'active' : ''}`}
            onClick={() => setShowMyQuizzes(false)}
          >
            Public Quizzes
          </button>
          <button
            className={`quiz-selector-button ${showMyQuizzes ? 'active' : ''}`}
            onClick={() => setShowMyQuizzes(true)}
          >
            My Quizzes
          </button>
        </div>

        <form onSubmit={handleCreateRoom}>
          <div className="form-group">
            <label className="form-label" htmlFor="quiz" style={{color: '#ffe259'}}>
              Select Quiz
            </label>
            <select
              id="quiz"
              className="form-select"
              value={selectedQuiz}
              onChange={(e) => setSelectedQuiz(e.target.value)}
              required
              style={{color: '#000000', backgroundColor: '#ffffff'}}
            >
              <option value="">-- Select a Quiz --</option>
              {quizzes.length === 0 ? (
                <option value="" disabled>
                  {showMyQuizzes ? 'You have not created any quizzes yet' : 'No public quizzes available'}
                </option>
              ) : (
                quizzes.map((quiz) => (
                  <option key={quiz._id} value={quiz._id} style={{backgroundColor: '#ffffff'}}>
                    {quiz.title} {quiz.category ? `(${quiz.category})` : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="maxParticipants" style={{color: '#ffe259'}}>
              <div className="flex items-center">
                <FaUsers className="w-4 h-4 mr-2" />
                Maximum Participants
              </div>
            </label>
            <input
              type="number"
              id="maxParticipants"
              className="form-input"
              min="2"
              max="50"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
              required
              style={{color: '#000000', backgroundColor: '#ffffff'}}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="timeLimit" style={{color: '#ffe259'}}>
              <div className="flex items-center">
                <FaClock className="w-4 h-4 mr-2" />
                Time Limit (seconds per question)
              </div>
            </label>
            <input
              type="number"
              id="timeLimit"
              className="form-input"
              min="10"
              max="300"
              value={timeLimit}
              onChange={(e) => setTimeLimit(parseInt(e.target.value))}
              required
              style={{color: '#000000', backgroundColor: '#ffffff'}}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="inviteEmails" style={{color: '#ffe259'}}>
              <div className="flex items-center">
                <FaEnvelope className="w-4 h-4 mr-2" />
                Invite Users (optional)
              </div>
            </label>
            <textarea
              id="inviteEmails"
              className="form-textarea"
              placeholder="Enter email addresses separated by commas"
              value={inviteEmails}
              onChange={(e) => setInviteEmails(e.target.value)}
              style={{color: '#000000', backgroundColor: '#ffffff'}}
            />
          </div>

          <div className="button-group">
            <button
              type="submit"
              disabled={creating}
              className="create-button"
            >
              {creating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                "Create Room"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRoom; 