import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinRoom } from "../services/api";
import { FaKey, FaArrowRight, FaGamepad } from "react-icons/fa";
import '../styles/CreateRoom.css';

function JoinRoom() {
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomCode) {
      setError("Please enter a room code");
      return;
    }
    try {
      setJoining(true);
      setError("");
      const response = await joinRoom(roomCode);
      if (response.success) {
        navigate(`/room/${roomCode}`);
      } else {
        setError(response.message || "Failed to join room");
      }
    } catch (error) {
      setError(
        "Error joining room. Room may not exist or is no longer available."
      );
      console.error("Error joining room:", error);
    } finally {
      setJoining(false);
    }
  };

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
      <div className="create-room-card" style={{zIndex:1,position:'relative',maxWidth:540,padding:'2.5rem 2.5rem',margin:'48px auto'}}>
        <div className="text-center mb-8">
          <h1 className="create-room-title" style={{fontSize:'2.2rem'}}>
            <FaGamepad className="create-room-animated-icon" />
            Join a Room
          </h1>
          <p className="create-room-subtitle">Enter the room code to join a multiplayer quiz session</p>
        </div>
        {error && (
          <div className="error-message">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="roomCode" style={{color: '#ffe259'}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <FaKey style={{color:'#f472b6',marginRight:6}} />
                Room Code
              </div>
            </label>
            <input
              type="text"
              id="roomCode"
              className="form-input"
              style={{textAlign:'center',fontWeight:'bold',letterSpacing:'0.15em',textTransform:'uppercase',color:'#000000',backgroundColor:'#ffffff'}}
              placeholder="ABCD12"
              maxLength="6"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              required
            />
            <p style={{marginTop:8,fontSize:'0.95em',color:'#bdb4e6',textAlign:'center'}}>Enter the 6-digit code provided by the room host</p>
          </div>
          <div className="button-group">
            <button
              type="submit"
              disabled={joining}
              className="create-button"
              style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              {joining ? (
                <div className="loading-spinner" style={{height:24,width:24}}></div>
              ) : (
                <>
                  <span>Join Room</span>
                  <FaArrowRight />
                </>
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
        <div style={{marginTop:32,textAlign:'center'}}>
          <h2 style={{fontSize:'1.1rem',fontWeight:600,marginBottom:12,background:'linear-gradient(90deg,#ffe259,#f472b6,#6366f1)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Want to create your own room?</h2>
          <button
            onClick={() => navigate("/create-room")}
            className="copy-button"
            style={{width:'100%',marginTop:0}}>
            Create a Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default JoinRoom;
