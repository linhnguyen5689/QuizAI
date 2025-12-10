import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { verifyEmail } from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationTriangle, FaEnvelope, FaArrowRight, FaInfoCircle, FaUnlock } from 'react-icons/fa';

const VerifyEmail = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRetry, setShowRetry] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyUserEmail = async () => {
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get('token');

      if (!token) {
        setError('Invalid verification link. Please check your email and use the complete verification link.');
        setLoading(false);
        return;
      }

      try {
        const response = await verifyEmail(token);

        if (response?.success) {
          if (response?.alreadyVerified) {
            toast.success('Your email is already verified!');
          } else {
            toast.success('Email verification successful!');
          }
        } else {
          throw new Error(response?.message || 'Verification failed. Please try again.');
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Email verification failed. Please check your verification link and try again.';

        setError(errorMessage);
        toast.error(errorMessage);

        // If token expired, add a retry button
        if (errorMessage.includes('expired')) {
          setShowRetry(true);
        }
      } finally {
        setLoading(false);
      }
    };

    verifyUserEmail();
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="relative w-screen min-h-screen overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
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

        <div className="relative z-10 flex items-center justify-center h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 text-center border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40 max-w-md w-full"
          >
            <div className="mb-6">
              <motion.div
                animate={{
                  rotateY: [0, 360],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  transformStyle: "preserve-3d",
                }}
                className="mx-auto w-20 h-20 mb-4"
              >
                <div className="absolute inset-0 flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]">
                  <FaEnvelope className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text font-orbitron">
                Verifying Your Email
              </h2>
            </div>

            <div className="mb-6">
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2 }}
                  className="h-full bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-full"
                />
              </div>
            </div>

            <p className="text-pink-200 font-orbitron">
              Please wait while we verify your email address...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-screen min-h-screen overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
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

        <div className="relative z-10 flex items-center justify-center h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 text-center border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40 max-w-md w-full mx-4"
          >
            <div className="mb-6">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.1, 0.9, 1] }}
                transition={{ duration: 0.6 }}
                className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-rose-500/20 border-2 border-rose-500/40 mb-4"
              >
                <FaExclamationTriangle className="w-10 h-10 text-rose-500" />
              </motion.div>
              <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text font-orbitron mb-2">
                Verification Failed
              </h2>
              <p className="text-pink-200 font-orbitron mb-6">{error}</p>
            </div>

            <div className="space-y-3">
              {showRetry ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center w-full gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white font-medium rounded-xl hover:from-pink-400 hover:to-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl font-orbitron"
                  >
                    Register Again
                    <FaArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center w-full gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white font-medium rounded-xl hover:from-pink-400 hover:to-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl font-orbitron"
                  >
                    Go to Login
                    <FaArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              )}

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/help/verify-email"
                  className="inline-flex items-center justify-center w-full gap-2 px-6 py-3 text-pink-200 font-medium rounded-xl border border-pink-400/30 hover:bg-pink-400/10 transition-all duration-300 font-orbitron mt-2"
                >
                  <FaInfoCircle className="w-4 h-4" />
                  Need Help?
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen min-h-screen overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
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

      <div className="relative z-10 flex items-center justify-center h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 text-center border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40 max-w-md w-full mx-4"
        >
          <div className="mb-6">
            <motion.div
              animate={{
                y: [0, -10, 0],
                boxShadow: [
                  "0 0 15px rgba(236,72,153,0.3)",
                  "0 0 30px rgba(236,72,153,0.5)",
                  "0 0 15px rgba(236,72,153,0.3)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 mb-4"
            >
              <FaCheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text font-orbitron mb-2">
              Email Verified Successfully!
            </h2>
          </div>

          <div className="space-y-4">
            <p className="text-pink-200 font-orbitron mb-4">
              Your account is now active and ready to use. You can create and take quizzes, track your progress, and more!
            </p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-xl bg-gradient-to-br from-indigo-900/60 to-purple-900/60 border border-pink-400/30"
            >
              <p className="text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text font-orbitron font-bold mb-2">
                What's next?
              </p>
              <ul className="space-y-2 text-left">
                <li className="flex items-center text-pink-200 font-orbitron">
                  <div className="w-5 h-5 mr-2 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 flex items-center justify-center">
                    <FaCheckCircle className="w-3 h-3 text-white" />
                  </div>
                  Log in to your account
                </li>
                <li className="flex items-center text-pink-200 font-orbitron">
                  <div className="w-5 h-5 mr-2 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 flex items-center justify-center">
                    <FaCheckCircle className="w-3 h-3 text-white" />
                  </div>
                  Complete your profile
                </li>
                <li className="flex items-center text-pink-200 font-orbitron">
                  <div className="w-5 h-5 mr-2 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 flex items-center justify-center">
                    <FaCheckCircle className="w-3 h-3 text-white" />
                  </div>
                  Start exploring quizzes
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white font-medium rounded-xl hover:from-pink-400 hover:to-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl font-orbitron"
              >
                <FaUnlock className="w-5 h-5" />
                Login Now
                <FaArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyEmail;