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
      <div className="create-room-container" style={{ background: 'linear-gradient(180deg, #013A6B 0%, #014F86 50%, #0166A8 100%)' }}>
        {/* Animated SVG background */}
        <svg className="animated-bg-svg" style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',zIndex:0,filter:'blur(2px)'}} aria-hidden>
          <defs>
            <radialGradient id="g1" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#66D9FF" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#013A6B" stopOpacity="0" />
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
      <div className="create-room-container" style={{ background: 'linear-gradient(180deg, #013A6B 0%, #014F86 50%, #0166A8 100%)' }}>
        {/* Animated SVG background */}
        <svg className="animated-bg-svg" style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',zIndex:0,filter:'blur(2px)'}} aria-hidden>
          <defs>
            <radialGradient id="g1" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#66D9FF" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#013A6B" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="80%" cy="20%" r="300" fill="url(#g1)">
            <animate attributeName="cx" values="80%;20%;80%" dur="12s" repeatCount="indefinite" />
          </circle>
          <circle cx="20%" cy="80%" r="200" fill="url(#g1)">
            <animate attributeName="cy" values="80%;20%;80%" dur="16s" repeatCount="indefinite" />
          </circle>
        </svg>
        <div className="create-room-card" style={{zIndex:1,position:'relative', background: 'linear-gradient(180deg, rgba(1,42,74,0.85), rgba(1,58,107,0.85))', border: '2px solid rgba(43,108,176,0.18)'}}>
          <div className="success-message" style={{ color: '#EAF6FF', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaCheck className="w-5 h-5" style={{ color: '#66D9FF' }} />
            <span>Room created successfully!</span>
          </div>
          
          <div className="room-code-display" style={{ marginTop: 16 }}>
            <h3 className="form-label" style={{ color: '#BEE6FF' }}>Room Code</h3>
            <div className="room-code" style={{ background: 'rgba(2,60,100,0.45)', color: '#EAF6FF', padding: '8px 12px', borderRadius: 8, display: 'inline-block' }}>{roomCode}</div>
            <button onClick={copyInviteLink} className="copy-button" style={{ marginLeft: 12, background: 'linear-gradient(90deg,#0077D6,#0096FF,#66D9FF)', color: '#002238', border: 'none', padding: '8px 10px', borderRadius: 8 }}>
              <FaEnvelope className="w-4 h-4" style={{ marginRight: 6, color: '#EAF6FF' }} />
              Copy Invite Link
            </button>
          </div>

          <div className="button-group" style={{ marginTop: 18 }}>
            <button onClick={handleJoinCreatedRoom} className="create-button" style={{ background: 'linear-gradient(90deg,#0077D6,#0096FF,#66D9FF)', color: '#002238', padding: '10px 14px', borderRadius: 10, border: 'none' }}>
              Join Room Now
            </button>
            <button onClick={() => navigate('/dashboard')} className="cancel-button" style={{ marginLeft: 12, background: 'transparent', color: '#CFEFFF', border: '1px solid rgba(43,108,176,0.18)', padding: '10px 14px', borderRadius: 10 }}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-room-container" style={{ background: 'linear-gradient(180deg, #013A6B 0%, #014F86 50%, #0166A8 100%)' }}>
      {/* Animated SVG background */}
      <svg className="animated-bg-svg" style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',zIndex:0,filter:'blur(2px)'}} aria-hidden>
        <defs>
          <radialGradient id="g1" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#66D9FF" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#013A6B" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="80%" cy="20%" r="300" fill="url(#g1)">
          <animate attributeName="cx" values="80%;20%;80%" dur="12s" repeatCount="indefinite" />
        </circle>
        <circle cx="20%" cy="80%" r="200" fill="url(#g1)">
          <animate attributeName="cy" values="80%;20%;80%" dur="16s" repeatCount="indefinite" />
        </circle>
      </svg>
      <div className="create-room-card" style={{zIndex:1,position:'relative', background: 'linear-gradient(180deg, rgba(1,42,74,0.85), rgba(1,58,107,0.85))', border: '2px solid rgba(43,108,176,0.18)', padding: 24 }}>
        <h1 className="create-room-title" style={{ color: '#EAF6FF', display: 'flex', alignItems: 'center', gap: 12 }}>
          <FaGamepad className="create-room-animated-icon" style={{ color: '#66D9FF' }} />
          Create a Room
        </h1>
        <p className="create-room-subtitle" style={{ color: '#CFEFFF', marginTop: 6 }}>Set up a multiplayer quiz session</p>

        {error && (
          <div className="error-message" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#FFD2D2' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#FFB6B6' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="quiz-selector" style={{ marginTop: 18, display: 'flex', gap: 8 }}>
          <button
            className={`quiz-selector-button ${!showMyQuizzes ? 'active' : ''}`}
            onClick={() => setShowMyQuizzes(false)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: !showMyQuizzes ? '2px solid rgba(255,255,255,0.06)' : '2px solid rgba(102,217,255,0.18)',
              background: !showMyQuizzes ? 'rgba(2,60,100,0.3)' : 'linear-gradient(90deg,#0077D6,#66D9FF)',
              color: !showMyQuizzes ? '#EAF6FF' : '#002238'
            }}
          >
            Public Quizzes
          </button>
          <button
            className={`quiz-selector-button ${showMyQuizzes ? 'active' : ''}`}
            onClick={() => setShowMyQuizzes(true)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: showMyQuizzes ? '2px solid rgba(102,217,255,0.18)' : '2px solid rgba(255,255,255,0.06)',
              background: showMyQuizzes ? 'linear-gradient(90deg,#0077D6,#66D9FF)' : 'rgba(2,60,100,0.3)',
              color: showMyQuizzes ? '#002238' : '#EAF6FF'
            }}
          >
            My Quizzes
          </button>
        </div>

        <form onSubmit={handleCreateRoom} style={{ marginTop: 18 }}>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label" htmlFor="quiz" style={{color: '#BEE6FF', display: 'block', marginBottom: 6}}>
              Select Quiz
            </label>
            <select
              id="quiz"
              className="form-select"
              value={selectedQuiz}
              onChange={(e) => setSelectedQuiz(e.target.value)}
              required
              style={{ color: '#002238', backgroundColor: '#EAF6FF', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(43,108,176,0.12)' }}
            >
              <option value="">-- Select a Quiz --</option>
              {quizzes.length === 0 ? (
                <option value="" disabled>
                  {showMyQuizzes ? 'You have not created any quizzes yet' : 'No public quizzes available'}
                </option>
              ) : (
                quizzes.map((quiz) => (
                  <option key={quiz._id} value={quiz._id} style={{backgroundColor: '#EAF6FF', color: '#002238'}}>
                    {quiz.title} {quiz.category ? `(${quiz.category})` : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label" htmlFor="maxParticipants" style={{color: '#BEE6FF', display: 'block', marginBottom: 6}}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FaUsers className="w-4 h-4" style={{ color: '#66D9FF' }} />
                <span style={{ color: '#EAF6FF' }}>Maximum Participants</span>
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
              style={{ color: '#002238', backgroundColor: '#EAF6FF', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(43,108,176,0.12)' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label" htmlFor="timeLimit" style={{color: '#BEE6FF', display: 'block', marginBottom: 6}}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FaClock className="w-4 h-4" style={{ color: '#66D9FF' }} />
                <span style={{ color: '#EAF6FF' }}>Time Limit (seconds per question)</span>
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
              style={{ color: '#002238', backgroundColor: '#EAF6FF', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(43,108,176,0.12)' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label" htmlFor="inviteEmails" style={{color: '#BEE6FF', display: 'block', marginBottom: 6}}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FaEnvelope className="w-4 h-4" style={{ color: '#66D9FF' }} />
                <span style={{ color: '#EAF6FF' }}>Invite Users (optional)</span>
              </div>
            </label>
            <textarea
              id="inviteEmails"
              className="form-textarea"
              placeholder="Enter email addresses separated by commas"
              value={inviteEmails}
              onChange={(e) => setInviteEmails(e.target.value)}
              style={{ color: '#002238', backgroundColor: '#EAF6FF', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(43,108,176,0.12)' }}
            />
          </div>

          <div className="button-group" style={{ marginTop: 12, display: 'flex', gap: 12 }}>
            <button
              type="submit"
              disabled={creating}
              className="create-button"
              style={{
                background: 'linear-gradient(90deg,#0077D6,#0096FF,#66D9FF)',
                color: '#002238',
                padding: '10px 16px',
                borderRadius: 10,
                border: 'none'
              }}
            >
              {creating ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="animate-spin" style={{ width: 18, height: 18, borderTop: '2px solid rgba(255,255,255,0.9)', borderRight: '2px solid transparent', borderRadius: '50%' }}></div>
                  <span>Creating...</span>
                </div>
              ) : (
                "Create Room"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="cancel-button"
              style={{
                background: 'transparent',
                color: '#CFEFFF',
                border: '1px solid rgba(43,108,176,0.18)',
                padding: '10px 16px',
                borderRadius: 10
              }}
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
