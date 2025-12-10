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
      <div className="flex items-center justify-center w-screen min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40"
        >
          <div className="flex flex-col items-center justify-center">
            <div className="w-20 h-20 mb-4 relative">
              <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-pink-500 border-r-indigo-500 border-b-yellow-400 border-l-transparent animate-spin"></div>
              <div className="absolute top-2 left-2 right-2 bottom-2 rounded-full border-4 border-t-transparent border-r-pink-500 border-b-indigo-500 border-l-yellow-400 animate-spin-slow-reverse"></div>
              <FaGamepad className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-pink-300" />
            </div>
            <p className="mt-4 text-pink-200 text-xl font-orbitron">Loading quiz...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
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

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 text-center border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40 max-w-md w-full"
          >
            <div className="text-pink-400 mb-6">
              <FaExclamationTriangle className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">Error Loading Quiz</h2>
            <p className="text-pink-200 text-lg mb-6 font-orbitron">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
            >
              <FiArrowLeft className="w-5 h-5 mr-2 inline-block" />
              Back to Dashboard
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!quiz) {
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

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 text-center border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40 max-w-md w-full"
          >
            <h1 className="text-2xl font-bold mb-4 text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">Quiz Not Found</h1>
            <p className="mb-6 text-pink-200 font-orbitron">The quiz you're looking for doesn't exist or has expired.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
            >
              <FaGamepad className="w-5 h-5 mr-2 inline-block" />
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
          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mr-4 px-4 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
              onClick={() => navigate('/dashboard')}
              aria-label="Back to dashboard"
            >
              <FiArrowLeft className="w-6 h-6" />
            </motion.button>

            <h1 className="flex items-center gap-3 text-4xl font-extrabold text-transparent md:text-5xl font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 drop-shadow-lg">
              <FaQuestionCircle className="inline-block text-yellow-300 animate-bounce" />
              Take Quiz
            </h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="p-8 border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40 mb-8"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 mb-4">
              {quiz.title}
            </h2>
            <div className="flex items-center text-pink-200 font-orbitron">
              <FaStar className="w-5 h-5 mr-2 text-yellow-300" />
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </div>
            <div className="w-full bg-indigo-900/80 rounded-full h-3 mt-4 border border-pink-400/30">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 h-full rounded-full"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-8"
          >
            {/* Customized Question Card */}
            <div className="mb-8 p-6 border-2 border-pink-400/40 rounded-2xl bg-indigo-900/50 shadow-lg">
              <p className="text-xl text-pink-200 font-orbitron mb-8">{currentQuestion.content}</p>

              <div className="space-y-4">
                {currentQuestion.options && currentQuestion.options.map((option, optionIndex) => (
                  <motion.button
                    key={option._id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-5 rounded-2xl border-2 transition-all font-orbitron text-left ${selectedOptions[currentQuestionIndex] === optionIndex
                      ? 'border-yellow-400 bg-indigo-800/80 text-pink-200 shadow-[0_0_15px_rgba(234,179,8,0.5)]'
                      : 'border-pink-400/40 text-pink-200 hover:border-yellow-400/70 hover:shadow-[0_0_10px_rgba(234,179,8,0.3)]'
                      }`}
                    onClick={() => handleOptionSelect(optionIndex)}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 
                        ${selectedOptions[currentQuestionIndex] === optionIndex
                          ? 'bg-gradient-to-r from-yellow-400 to-pink-500'
                          : 'bg-indigo-700/50 border border-pink-400/40'
                        }`}
                      >
                        <span className="text-white font-bold">{String.fromCharCode(65 + optionIndex)}</span>
                      </div>
                      <span className="text-lg">{option.label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-between"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className={`px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-2xl hover:from-purple-600 hover:to-indigo-600 hover:scale-105 active:scale-95 border-white/30 ${currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              <FiArrowLeft className="w-5 h-5 mr-2 inline-block" />
              Previous
            </motion.button>

            {isLastQuestion ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="w-5 h-5 mr-2 inline-block animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaCheck className="w-5 h-5 mr-2 inline-block" />
                    Submit Quiz
                  </>
                )}
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextQuestion}
                className="px-8 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
              >
                Next
                <svg className="w-5 h-5 ml-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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