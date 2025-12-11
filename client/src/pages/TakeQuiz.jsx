import React, { useState, useEffect } from 'react';
import { getQuizById, submitQuizSubmission } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import QuestionCard from '../components/QuestionCard';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import {
  FaGamepad,
  FaStar,
  FaTrophy,
  FaQuestionCircle,
  FaCheck,
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa';

/**
 * Chú ý: Mình chỉ đổi màu (theme) — không thay đổi logic hay animation.
 * Theme: primary blue + light blue, muted text, accent yellow/green cho điểm nhấn.
 */

const PRIMARY = '#1E74D7';        // main blue
const PRIMARY_DARK = '#003A70';
const PRIMARY_LIGHT = '#4BA3FF';
const MUTED_TEXT = '#DDEAF6';
const ACCENT_YELLOW = '#FBBF24';
const SUCCESS = '#059669';
const DANGER = '#D32F2F';
const CARD_BG = 'rgba(255,255,255,0.03)';

const TakeQuiz = () => {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { quizId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      if (!quizId) {
        setError('Quiz ID is required');
        setLoading(false);
        return;
      }

      const response = await getQuizById(quizId);
      if (!response) {
        throw new Error('Failed to load quiz');
      }
      setQuiz(response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setError(error.message || 'Failed to load quiz. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY})`
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            textAlign: 'center',
            padding: 32,
            borderRadius: 24,
            background: CARD_BG,
            border: `1px solid ${PRIMARY}33`,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 80, height: 80, marginBottom: 12, position: 'relative' }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '6px solid',
                borderTopColor: `${ACCENT_YELLOW}`,
                borderRightColor: `${PRIMARY}`,
                borderBottomColor: `${PRIMARY_LIGHT}`,
                borderLeftColor: 'transparent',
                animation: 'spin 1s linear infinite'
              }} />
              <div style={{
                position: 'absolute',
                inset: 8,
                borderRadius: '50%',
                border: '6px solid',
                borderTopColor: 'transparent',
                borderRightColor: `${ACCENT_YELLOW}`,
                borderBottomColor: `${PRIMARY}`,
                borderLeftColor: `${PRIMARY_LIGHT}`,
                animation: 'spin 2.4s linear reverse'
              }} />
              <FaGamepad style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', color: '#FCE8D5' }} />
            </div>
            <p style={{ marginTop: 8, color: MUTED_TEXT, fontSize: 18 }}>Loading quiz...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        position: 'relative',
        background: `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY})`
      }}>
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', filter: 'blur(2px)', zIndex: 0 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="g1" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor={PRIMARY_LIGHT} stopOpacity="0.45" />
              <stop offset="100%" stopColor={PRIMARY} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="80%" cy="20%" r="300" fill="url(#g1)"></circle>
          <circle cx="20%" cy="80%" r="200" fill="url(#g1)"></circle>
        </svg>

        <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{
            padding: 32,
            maxWidth: 520,
            width: '100%',
            textAlign: 'center',
            borderRadius: 20,
            background: CARD_BG,
            border: `1px solid ${PRIMARY}33`,
            boxShadow: '0 20px 40px rgba(0,0,0,0.35)'
          }}>
            <div style={{ color: ACCENT_YELLOW, marginBottom: 12 }}>
              <FaExclamationTriangle style={{ fontSize: 40 }} />
            </div>
            <h2 style={{ fontSize: 22, marginBottom: 12, background: `linear-gradient(90deg, ${ACCENT_YELLOW}, ${PRIMARY_LIGHT})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Error Loading Quiz</h2>
            <p style={{ color: MUTED_TEXT, fontSize: 16, marginBottom: 20 }}>{error}</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/dashboard')} style={{
              padding: '10px 16px',
              color: '#fff',
              borderRadius: 12,
              background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
              border: 'none',
              cursor: 'pointer'
            }}>
              <FiArrowLeft style={{ marginRight: 8 }} />
              Back to Dashboard
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div style={{
        minHeight: '100vh',
        position: 'relative',
        background: `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY})`
      }}>
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', filter: 'blur(2px)', zIndex: 0 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="g1" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor={PRIMARY_LIGHT} stopOpacity="0.45" />
              <stop offset="100%" stopColor={PRIMARY} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="80%" cy="20%" r="300" fill="url(#g1)"></circle>
          <circle cx="20%" cy="80%" r="200" fill="url(#g1)"></circle>
        </svg>

        <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{
            padding: 32,
            maxWidth: 520,
            width: '100%',
            textAlign: 'center',
            borderRadius: 20,
            background: CARD_BG,
            border: `1px solid ${PRIMARY}33`,
            boxShadow: '0 20px 40px rgba(0,0,0,0.35)'
          }}>
            <h1 style={{ fontSize: 22, marginBottom: 12, background: `linear-gradient(90deg, ${ACCENT_YELLOW}, ${PRIMARY_LIGHT})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Quiz Not Found</h1>
            <p style={{ color: MUTED_TEXT, marginBottom: 20 }}>The quiz you're looking for doesn't exist or has expired.</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/dashboard')} style={{
              padding: '10px 16px',
              color: '#fff',
              borderRadius: 12,
              background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
              border: 'none',
              cursor: 'pointer'
            }}>
              <FaGamepad style={{ marginRight: 8 }} />
              Back to Dashboard
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  const handleOptionSelect = (optionIndex) => {
    setSelectedOptions({
      ...selectedOptions,
      [currentQuestionIndex]: optionIndex
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedOptions).length < quiz.questions.length) {
      const unansweredCount = quiz.questions.length - Object.keys(selectedOptions).length;
      if (!window.confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`)) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const answers = quiz.questions.map((question, index) => {
        const selectedOptionIndex = selectedOptions[index];
        const selectedOption = selectedOptionIndex !== undefined ? question.options[selectedOptionIndex] : null;

        return {
          questionId: question._id,
          selectedAnswer: selectedOption ? selectedOption._id : null,
          selectedOptionText: selectedOption ? selectedOption.label : null,
          question: question.content
        };
      }).filter(answer => answer.selectedAnswer !== null);

      const result = await submitQuizSubmission(quizId, answers);

      if (result.submission && result.submission._id) {
        toast.success('Quiz submitted successfully!');
        navigate(`/results/${result.submission._id}`);
      } else {
        throw new Error('Invalid submission result');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error(error.response?.data?.message || 'An error occurred while submitting the quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const progressPercentage = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden', background: `linear-gradient(135deg, ${PRIMARY_DARK}, ${PRIMARY})` }}>
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', filter: 'blur(2px)', zIndex: 0 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="g1" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor={PRIMARY_LIGHT} stopOpacity="0.45" />
            <stop offset="100%" stopColor={PRIMARY} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="80%" cy="20%" r="300" fill="url(#g1)"></circle>
        <circle cx="20%" cy="80%" r="200" fill="url(#g1)"></circle>
      </svg>

      <div style={{ position: 'relative', zIndex: 10, padding: '32px' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/dashboard')} aria-label="Back to dashboard" style={{
              marginRight: 12,
              padding: '10px 12px',
              borderRadius: 12,
              color: '#fff',
              background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
              border: 'none',
              cursor: 'pointer'
            }}>
              <FiArrowLeft />
            </motion.button>

            <h1 style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 32, fontWeight: 800, background: `linear-gradient(90deg, ${ACCENT_YELLOW}, ${PRIMARY_LIGHT})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              <FaQuestionCircle style={{ color: ACCENT_YELLOW }} />
              Take Quiz
            </h1>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{
          padding: 24,
          borderRadius: 16,
          background: CARD_BG,
          border: `1px solid ${PRIMARY}33`,
          boxShadow: '0 16px 30px rgba(0,0,0,0.25)',
          marginBottom: 24
        }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, background: `linear-gradient(90deg, ${ACCENT_YELLOW}, ${PRIMARY_LIGHT})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{quiz.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', color: MUTED_TEXT, gap: 12 }}>
              <FaStar style={{ color: ACCENT_YELLOW }} />
              <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            </div>

            <div style={{ height: 10, width: '100%', background: 'rgba(0,0,0,0.08)', borderRadius: 999, marginTop: 12, overflow: 'hidden', border: `1px solid ${PRIMARY}12` }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} transition={{ duration: 0.5 }} style={{ height: '100%', background: `linear-gradient(90deg, ${ACCENT_YELLOW}, ${PRIMARY_LIGHT})` }} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} style={{ marginBottom: 20 }}>
            <div style={{ padding: 18, borderRadius: 14, background: 'rgba(0,0,0,0.06)', border: `1px solid ${PRIMARY}12` }}>
              <p style={{ fontSize: 18, color: MUTED_TEXT, marginBottom: 18 }}>{currentQuestion.content}</p>

              <div style={{ display: 'grid', gap: 12 }}>
                {currentQuestion.options && currentQuestion.options.map((option, optionIndex) => {
                  const selected = selectedOptions[currentQuestionIndex] === optionIndex;
                  return (
                    <motion.button
                      key={option._id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleOptionSelect(optionIndex)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: 16,
                        borderRadius: 12,
                        textAlign: 'left',
                        border: `2px solid ${selected ? ACCENT_YELLOW : 'rgba(255,255,255,0.08)'}`,
                        background: selected ? 'rgba(251,191,36,0.06)' : 'transparent',
                        color: MUTED_TEXT,
                        cursor: 'pointer',
                        boxShadow: selected ? `0 0 20px rgba(251,191,36,0.12)` : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: 999,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: selected ? `linear-gradient(90deg, ${ACCENT_YELLOW}, ${PRIMARY_LIGHT})` : `rgba(0,0,0,0.12)`,
                          color: selected ? '#111' : '#fff',
                          fontWeight: 800
                        }}>
                          {String.fromCharCode(65 + optionIndex)}
                        </div>
                        <div style={{ fontSize: 16 }}>{option.label}</div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0} style={{
              padding: '10px 14px',
              color: '#fff',
              borderRadius: 12,
              background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
              border: 'none',
              cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: currentQuestionIndex === 0 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <FiArrowLeft />
              Previous
            </motion.button>

            {isLastQuestion ? (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSubmit} disabled={isSubmitting} style={{
                padding: '10px 16px',
                color: '#111',
                borderRadius: 12,
                background: `linear-gradient(90deg, ${ACCENT_YELLOW}, ${PRIMARY_LIGHT})`,
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                {isSubmitting ? (
                  <>
                    <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaCheck />
                    Submit Quiz
                  </>
                )}
              </motion.button>
            ) : (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleNextQuestion} style={{
                padding: '10px 16px',
                color: '#fff',
                borderRadius: 12,
                background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                Next
                <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default TakeQuiz;
