import React, { useState, useEffect } from 'react';
import { getSubmissionById, getQuizById } from '../services/api';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import {
  FaGamepad,
  FaStar,
  FaTrophy,
  FaCertificate,
  FaRegCheckCircle,
  FaRegTimesCircle,
  FaRedo
} from 'react-icons/fa';

// Import Rating Modal
import RatingModal from '../components/rating/RatingModal';

const PRIMARY = '#1E74D7';
const PRIMARY_DARK = '#003A70';
const PRIMARY_LIGHT = '#4BA3FF';
const MUTED_TEXT = '#DDEAF6';
const SUCCESS = '#059669';
const DANGER = '#D32F2F';
const ACCENT_YELLOW = '#FBBF24';

const QuizResults = () => {
  const [result, setResult] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const { submissionId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await getSubmissionById(submissionId);
        if (!response.success) {
          throw new Error(response.message || 'Failed to load results');
        }
        setResult(response.data);

        // Fetch quiz details
        if (response.data.quizId) {
          const quizResponse = await getQuizById(response.data.quizId._id || response.data.quizId);
          setQuiz(quizResponse);

          // Show rating modal only for public quizzes after a delay
          if (quizResponse.isPublic) {
            setTimeout(() => {
              setShowRatingModal(true);
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error fetching result:', error);
        setError(error.response?.data?.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [submissionId]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center w-screen min-h-screen"
        style={{
          background: `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY})`
        }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-16 w-16 border-4 mx-auto"
            style={{ borderColor: PRIMARY, borderTopColor: 'transparent' }}
          />
          <p className="mt-4 text-lg" style={{ color: PRIMARY_LIGHT, fontFamily: 'Orbitron, sans-serif' }}>
            Loading results...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="relative w-screen min-h-screen overflow-x-hidden"
        style={{ background: `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY})` }}
      >
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
            <div style={{ color: DANGER, marginBottom: 12 }}>
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p style={{ color: MUTED_TEXT, fontSize: '1.125rem', marginBottom: 16 }}>{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-6 py-3 text-white rounded-xl transition-all duration-300"
              style={{
                background: `linear-gradient(90deg, ${PRIMARY}, ${PRIMARY_DARK})`,
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
              }}
            >
              <FiArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div
        className="relative w-screen min-h-screen overflow-x-hidden"
        style={{ background: `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY})` }}
      >
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
            <p style={{ color: MUTED_TEXT, fontSize: '1.125rem', marginBottom: 16 }}>No results found</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-6 py-3 text-white rounded-xl transition-all duration-300"
              style={{
                background: `linear-gradient(90deg, ${PRIMARY}, ${PRIMARY_DARK})`,
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
              }}
            >
              <FiArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Calculate percentage if not provided
  const percentageScore = result.percentageScore ??
    (result.correctAnswers && result.totalQuestions ?
      (result.correctAnswers / result.totalQuestions) * 100 : 0);

  // Modal để đánh giá quiz công khai sau khi hoàn thành
  const closeRatingModal = () => {
    setShowRatingModal(false);
  };

  return (
    <div
      className="relative w-screen min-h-screen overflow-x-hidden"
      style={{ background: `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY})` }}
    >
      {/* Animated SVG background */}
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

      <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mr-4 px-4 py-3 text-white transition-all duration-300 rounded-2xl"
              onClick={() => navigate('/dashboard')}
              aria-label="Back to dashboard"
              style={{ background: `linear-gradient(90deg, ${PRIMARY}, ${PRIMARY_DARK})`, border: 'none' }}
            >
              <FiArrowLeft className="w-6 h-6" />
            </motion.button>

            <h1 style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              fontSize: '2.25rem',
              fontWeight: 800,
              fontFamily: 'Orbitron, sans-serif',
              background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 6px 18px rgba(0,0,0,0.12)'
            }}>
              <FaTrophy style={{ color: ACCENT_YELLOW }} />
              Quiz Results
            </h1>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="p-8 border-4 shadow-2xl rounded-3xl mb-8"
          style={{
            background: `linear-gradient(180deg, ${PRIMARY_DARK}E6, ${PRIMARY}CC)`,
            borderColor: `${PRIMARY}66`,
            backdropFilter: 'blur(8px)'
          }}
        >
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="mb-8">
            <h1 style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              marginBottom: 8,
              fontFamily: 'Orbitron, sans-serif',
              background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {result.quizId?.title || quiz?.title || 'Quiz Results'}
            </h1>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', color: MUTED_TEXT, fontFamily: 'Orbitron, sans-serif' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FaCertificate style={{ color: PRIMARY_LIGHT }} />
                Attempt #{result.attemptNumber || 1}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(result.completedAt).toLocaleString()}
              </span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="flex flex-col md:flex-row text-center md:text-left">
            <div style={{ flex: 1, marginBottom: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mdAlignItems: 'start' }}>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: 800,
                  background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: 8,
                  fontFamily: 'Orbitron, sans-serif'
                }}>
                  {Math.round(percentageScore)}%
                </div>
                <div style={{ color: MUTED_TEXT, fontSize: '1.125rem', fontFamily: 'Orbitron, sans-serif' }}>Your Score</div>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: 8, gap: 8, color: MUTED_TEXT, fontFamily: 'Orbitron, sans-serif' }}>
                  <FaRegCheckCircle style={{ color: SUCCESS }} />
                  {result.correctAnswers} / {result.totalQuestions} correct
                </div>
              </div>
            </div>

            <div style={{ flex: 1, marginBottom: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {percentageScore >= 80 ? (
                  <FaTrophy style={{ color: ACCENT_YELLOW, fontSize: 48, marginBottom: 8 }} />
                ) : percentageScore >= 60 ? (
                  <FaStar style={{ color: PRIMARY_LIGHT, fontSize: 48, marginBottom: 8 }} />
                ) : (
                  <FaGamepad style={{ color: PRIMARY_LIGHT, fontSize: 48, marginBottom: 8 }} />
                )}
                <div style={{ color: MUTED_TEXT, fontSize: '1.125rem', fontFamily: 'Orbitron, sans-serif' }}>
                  {percentageScore >= 80 ? "Excellent!" : percentageScore >= 60 ? "Good Job!" : "Keep Practicing!"}
                </div>
                <div style={{ color: MUTED_TEXT, marginTop: 8, fontFamily: 'Orbitron, sans-serif' }}>
                  {Math.round(result.timeSpent)} minutes
                </div>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mdAlignItems: 'flex-end' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (quiz) {
                        navigate(`/take-quiz/${quiz._id}`);
                      } else if (result.quizId && result.quizId._id) {
                        navigate(`/take-quiz/${result.quizId._id}`);
                      } else if (result.quizId) {
                        navigate(`/take-quiz/${result.quizId}`);
                      }
                    }}
                    className="py-2 px-4 rounded-xl"
                    style={{
                      background: `linear-gradient(90deg, ${PRIMARY}, ${PRIMARY_DARK})`,
                      color: '#fff',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
                    }}
                  >
                    <FaRedo style={{ marginRight: 8 }} /> Retry
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowRatingModal(true)}
                    className="py-2 px-4 rounded-xl"
                    style={{
                      background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                      color: '#fff',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
                    }}
                  >
                    <FaStar style={{ marginRight: 8, color: ACCENT_YELLOW }} /> Rate
                  </motion.button>
                </div>

                {quiz && quiz.isPublic && (
                  <div style={{ color: MUTED_TEXT, fontSize: 14, textAlign: 'center' }}>
                    This is a public quiz.<br />
                    Your rating helps others discover it!
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Visualization of correct/incorrect answers */}
          {result.answers && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="mt-12">
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                marginBottom: 16,
                fontFamily: 'Orbitron, sans-serif',
                background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Question Summary
              </h2>

              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                {result.answers.map((answer, index) => (
                  <div
                    key={index}
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      backdropFilter: 'blur(6px)',
                      border: `1px solid ${answer.isCorrect ? `${SUCCESS}33` : `${DANGER}33`}`,
                      background: answer.isCorrect ? 'rgba(5,150,105,0.06)' : 'rgba(211,47,47,0.06)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: '#fff', fontFamily: 'Orbitron, sans-serif', fontWeight: 600 }}>Question {index + 1}</span>
                      {answer.isCorrect ? (
                        <FaRegCheckCircle style={{ color: SUCCESS }} />
                      ) : (
                        <FaRegTimesCircle style={{ color: DANGER }} />
                      )}
                    </div>
                    <div style={{ color: MUTED_TEXT, fontFamily: 'Orbitron, sans-serif' }}>
                      {answer.isCorrect ? "Correct" : "Incorrect"}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Rating Modal */}
      {quiz && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={closeRatingModal}
          quizId={quiz._id}
          quizTitle={quiz.title}
        />
      )}
    </div>
  );
};

export default QuizResults;
