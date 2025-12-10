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
      <div className="flex items-center justify-center w-screen min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-pink-200 text-lg font-orbitron">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-screen min-h-screen overflow-x-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 text-center border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40 max-w-md w-full"
          >
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-pink-200 text-lg mb-6 font-orbitron">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white font-medium rounded-xl hover:from-pink-400 hover:to-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-orbitron"
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
      <div className="relative w-screen min-h-screen overflow-x-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 text-center border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40 max-w-md w-full"
          >
            <p className="text-pink-200 text-lg mb-6 font-orbitron">No results found</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white font-medium rounded-xl hover:from-pink-400 hover:to-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-orbitron"
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
              <FaTrophy className="inline-block text-yellow-300 animate-bounce" />
              Quiz Results
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text text-transparent mb-2 font-orbitron">
              {result.quizId?.title || quiz?.title || 'Quiz Results'}
            </h1>
            <div className="flex items-center text-pink-300 space-x-4 font-orbitron">
              <span className="flex items-center">
                <FaCertificate className="w-5 h-5 mr-2 text-pink-400" />
                Attempt #{result.attemptNumber || 1}
              </span>
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(result.completedAt).toLocaleString()}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col md:flex-row text-center md:text-left"
          >
            <div className="flex-1 mb-6 md:mb-0">
              <div className="flex flex-col items-center md:items-start">
                <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 mb-2 font-orbitron">
                  {Math.round(percentageScore)}%
                </div>
                <div className="text-pink-200 text-xl font-orbitron">Your Score</div>
                <div className="flex items-center mt-2 text-lg text-pink-200 font-orbitron">
                  <FaRegCheckCircle className="text-green-400 mr-2" />
                  {result.correctAnswers} / {result.totalQuestions} correct
                </div>
              </div>
            </div>
            <div className="flex-1 mb-6 md:mb-0">
              <div className="flex flex-col items-center">
                {percentageScore >= 80 ? (
                  <FaTrophy className="text-yellow-400 text-6xl mb-2 animate-pulse" />
                ) : percentageScore >= 60 ? (
                  <FaStar className="text-pink-400 text-6xl mb-2" />
                ) : (
                  <FaGamepad className="text-indigo-400 text-6xl mb-2" />
                )}
                <div className="text-xl text-pink-200 font-orbitron">
                  {percentageScore >= 80
                    ? "Excellent!"
                    : percentageScore >= 60
                      ? "Good Job!"
                      : "Keep Practicing!"}
                </div>
                <div className="text-pink-200 font-orbitron mt-2">
                  {Math.round(result.timeSpent)} minutes
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex flex-col items-center md:items-end">
                <div className="flex space-x-2 mb-4">
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
                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium text-white font-orbitron flex items-center transition-colors duration-300 shadow-lg"
                  >
                    <FaRedo className="mr-2" /> Retry
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowRatingModal(true)}
                    className="py-2 px-4 bg-pink-600 hover:bg-pink-700 rounded-xl font-medium text-white font-orbitron flex items-center transition-colors duration-300 shadow-lg"
                  >
                    <FaStar className="mr-2" /> Rate
                  </motion.button>
                </div>
                {quiz && quiz.isPublic && (
                  <div className="text-sm font-orbitron text-center md:text-right text-pink-200">
                    This is a public quiz.<br />
                    Your rating helps others discover it!
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Visualization of correct/incorrect answers */}
          {result.answers && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-12"
            >
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 mb-6 font-orbitron">
                Question Summary
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {result.answers.map((answer, index) => (
                  <div
                key={index}
                    className={`p-4 rounded-xl backdrop-blur-sm border ${answer.isCorrect
                        ? "bg-green-900/20 border-green-400/30"
                        : "bg-red-900/20 border-red-400/30"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-orbitron font-medium">Question {index + 1}</span>
                      {answer.isCorrect ? (
                        <FaRegCheckCircle className="text-green-400" />
                      ) : (
                        <FaRegTimesCircle className="text-red-400" />
                      )}
                  </div>
                    <div className="text-sm text-pink-200 font-orbitron">
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