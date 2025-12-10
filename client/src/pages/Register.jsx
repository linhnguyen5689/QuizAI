import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserPlus } from 'react-icons/fa';
import { register } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/CreateRoom.css';

const Register = ({ user }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      setRegistered(true);
      toast.success('Registration successful! Please check your email to verify your account.');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="create-room-title" style={{fontSize:'2rem',marginBottom:16}}>Registration Successful!</h2>
          <p style={{color:'#e0e7ff',marginBottom:16}}>
            A verification link has been sent to <strong>{formData.email}</strong>.<br/>
            Please check your inbox or spam folder to activate your account.
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
      <div className="create-room-card" style={{zIndex:1,position:'relative',maxWidth:540,padding:'2.5rem 2.5rem',margin:'48px auto'}}>
        <div className="text-center mb-8">
          <h1 className="create-room-title" style={{fontSize:'2.2rem'}}>
            <FaUserPlus className="create-room-animated-icon" />
            Create Account
          </h1>
          <p className="create-room-subtitle">Join our quiz community</p>
        </div>
        {error && (
          <div className="error-message">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username" style={{color: '#ffe259'}}>Username</label>
            <input
              id="username"
              name="username"
              type="text"
              className="form-input"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
              style={{color: '#000000', backgroundColor: '#ffffff'}}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email" style={{color: '#ffe259'}}>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              style={{color: '#000000', backgroundColor: '#ffffff'}}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="displayName" style={{color: '#ffe259'}}>Display Name (optional)</label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              className="form-input"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="What should we call you?"
              style={{color: '#000000', backgroundColor: '#ffffff'}}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password" style={{color: '#ffe259'}}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
              style={{color: '#000000', backgroundColor: '#ffffff'}}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword" style={{color: '#ffe259'}}>Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              style={{color: '#000000', backgroundColor: '#ffffff'}}
            />
          </div>
          <button type="submit" className="create-button" disabled={loading} style={{width:'100%',marginTop:16}}>
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>
        <div style={{marginTop:32,textAlign:'center'}}>
          <p style={{color:'#e0e7ff',marginTop:8}}>
            Already have an account?{' '}
            <Link to="/login" className="auth-link" style={{color:'#f472b6',fontWeight:600}}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
