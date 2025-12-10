import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaHome, FaSearch, FaArrowLeft } from 'react-icons/fa';

const NotFound = () => {
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

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="p-8 text-center border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40 max-w-lg w-full"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{
              scale: [0.8, 1.1, 0.9, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 0.8 }}
            className="relative mx-auto w-32 h-32 mb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-xl opacity-50 blur-xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{
                  y: [0, -5, 0, 5, 0],
                  rotate: [0, 5, 0, -5, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-9xl font-extrabold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text font-orbitron"
              >
                404
              </motion.div>
            </div>
          </motion.div>

          <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text font-orbitron mb-4">
            Page Not Found
          </h2>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-pink-200 mb-8 text-center font-orbitron">
              The page you are looking for might have been removed, had its name changed,
              or is temporarily unavailable.
            </p>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white font-medium rounded-xl hover:from-pink-400 hover:to-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl font-orbitron w-full"
              >
                <FaHome className="w-5 h-5" />
                Go to Homepage
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-pink-200 font-medium rounded-xl border border-pink-400/30 hover:bg-pink-400/10 transition-all duration-300 font-orbitron w-full"
              >
                <FaArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </Link>
            </motion.div>
          </div>

          {/* 3D floating elements */}
          <motion.div
            className="absolute -top-6 -right-6"
            animate={{
              y: [0, -10, 0],
              rotate: [0, 10, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <FaExclamationTriangle className="text-white w-8 h-8" />
            </div>
          </motion.div>

          <motion.div
            className="absolute -bottom-6 -left-6"
            animate={{
              y: [0, 10, 0],
              rotate: [0, -10, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          >
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
              <FaSearch className="text-white w-7 h-7" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound; 