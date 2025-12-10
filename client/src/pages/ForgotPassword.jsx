import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';
import { requestPasswordReset } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/CreateRoom.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call API to send reset password email
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="create-room-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg className="animated-bg-svg" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, filter: 'blur(2px)' }}>
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
        <div className="create-room-card" style={{ zIndex: 1, position: 'relative', maxWidth: 540, padding: '2.5rem 2.5rem', margin: '0 auto', marginTop: '-5%', textAlign: 'center' }}>
          <svg xmlns="http://www.w3.org/2000/svg" style={{ height: 64, width: 64, margin: '0 auto 24px', color: '#10B981' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
          </svg>
          <h2 className="create-room-title" style={{ fontSize: '2rem', marginBottom: 16 }}>Check Your Email</h2>
          <p style={{ color: '#e0e7ff', marginBottom: 16 }}>
            We've sent password reset instructions to:
            <br />
            <strong style={{ color: '#ffe259' }}>{email}</strong>
            <br />
            <small style={{ color: '#bdb4e6', marginTop: '0.5rem', display: 'block' }}>
              Please check your spam folder if you don't see it in your inbox
            </small>
          </p>
          <Link to="/login" className="copy-button" style={{ marginTop: 16 }}>Return to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="create-room-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg className="animated-bg-svg" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, filter: 'blur(2px)' }}>
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
      <div className="create-room-card" style={{ zIndex: 1, position: 'relative', maxWidth: 540, padding: '2.5rem 2.5rem', margin: '0 auto', marginTop: '-5%' }}>
        <div className="text-center mb-8">
          <h1 className="create-room-title" style={{ fontSize: '2.2rem' }}>
            <FaEnvelope className="create-room-animated-icon" />
            Reset Password
          </h1>
          <p className="create-room-subtitle">Enter your email address and we'll send you instructions to reset your password</p>
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
            <label className="form-label" htmlFor="email" style={{ color: '#ffe259' }}>Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              autoFocus
              autoComplete="email"
              style={{ color: '#000000', backgroundColor: '#ffffff' }}
            />
          </div>

          <button
            type="submit"
            className="create-button"
            disabled={loading || !email.trim()}
            style={{ width: '100%', marginTop: 16 }}
          >
            {loading ? (
              <div className="loading-spinner" style={{ height: 24, width: 24 }}></div>
            ) : (
              'Send Reset Instructions'
            )}
          </button>
        </form>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <p style={{ color: '#e0e7ff' }}>
            Remember your password?{' '}
            <Link to="/login" className="auth-link" style={{ color: '#f472b6', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
