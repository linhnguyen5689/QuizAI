import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { resetPassword } from '../services/api';
import toast from 'react-hot-toast';
import { FaKey } from 'react-icons/fa';
import '../styles/CreateRoom.css';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from URL on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get('token');
    
    if (!tokenParam) {
      toast.error('Missing reset token');
      navigate('/forgot-password');
      return;
    }
    
    setToken(tokenParam);
  }, [location, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);

    try {
      await resetPassword(token, formData.newPassword);
      setResetComplete(true);
      toast.success('Password reset successful. You can now log in with your new password.');
    } catch (error) {
      console.error('Password reset error:', error);
      const errorMsg = error.response?.data?.message || 'Password reset failed. The link may have expired.';
      toast.error(errorMsg);
      
      // If token is invalid or expired, redirect to forgot password
      if (errorMsg.includes('expired') || errorMsg.includes('invalid')) {
        setTimeout(() => navigate('/forgot-password'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (resetComplete) {
    return (
      <div className="create-room-container">
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
        <div className="create-room-card" style={{zIndex:1,position:'relative',maxWidth:540,padding:'2.5rem 2.5rem',margin:'48px auto',textAlign:'center'}}>
          <svg xmlns="http://www.w3.org/2000/svg" style={{height:64,width:64,margin:'0 auto 24px',color:'#10B981'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h2 className="create-room-title" style={{fontSize:'2rem',marginBottom:16}}>Password Reset Complete</h2>
          <p style={{color:'#e0e7ff',marginBottom:16}}>
            Your password has been reset successfully. You can now log in using your new password.
          </p>
          <Link to="/login" className="copy-button" style={{marginTop:16}}>Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="create-room-container">
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
      <div className="create-room-card" style={{zIndex:1,position:'relative',maxWidth:540,padding:'2.5rem 2.5rem',margin:'48px auto',background:'rgba(60, 20, 80, 0.92)',backdropFilter:'blur(10px)',borderRadius:'1.5rem',boxShadow:'0 0 40px 10px #f472b6, 0 0 80px 10px #6366f1',border:'2.5px solid #f472b6'}}>
        <div className="text-center mb-8">
          <h1 className="create-room-title" style={{fontSize:'2.2rem'}}>
            <FaKey className="create-room-animated-icon" />
            Reset Password
          </h1>
          <p className="create-room-subtitle">Enter your new password below</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="newPassword" className="form-label" style={{color: '#ffe259'}}>New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              minLength="6"
              className="form-input"
              placeholder="Enter new password"
              style={{color: '#000000'}}
            />
            <p style={{fontSize:'0.95em',color:'#bdb4e6',marginTop:4}}>At least 6 characters</p>
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label" style={{color: '#ffe259'}}>Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Confirm new password"
              style={{color: '#000000'}}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !token}
            className="create-button"
            style={{width:'100%',marginTop:16}}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          <div style={{marginTop:16,textAlign:'center',color:'#e0e7ff'}}>
            Remembered your password?{' '}
            <Link to="/login" className="auth-link" style={{color:'#f472b6',fontWeight:600}}>
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 