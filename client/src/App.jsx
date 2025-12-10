import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  getUser,
  saveUser,
  isAuthenticated,
  removeUser,
} from "./utils/jwtUtils";
import { FaGamepad, FaQuestionCircle, FaTrophy, FaBrain, FaLightbulb } from "react-icons/fa";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UploadQuiz from "./pages/UploadQuiz";
import QuizDetails from "./pages/QuizDetails";
import TakeQuiz from "./pages/TakeQuiz";
import QuizResults from "./pages/QuizResults";
import NotFound from "./pages/NotFound";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import UserProfile from "./pages/UserProfile";
import CreateRoom from "./pages/CreateRoom";
import JoinRoom from "./pages/JoinRoom";
import Room from "./pages/Room";
import QuizGame from "./pages/QuizGame";
import Footer from "./components/Footer";
import { SidebarProvider } from "./components/ui/sidebar";
import Friends from "./components/Friends";
import CreateQuiz from "./pages/CreateQuiz";
import CreateAIQuiz from "./pages/CreateAIQuiz";
import EditQuiz from "./pages/EditQuiz";
import Achievements from "./pages/Achievements";
import Admin from "./pages/Admin";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location.pathname]);

  useEffect(() => {
    const authenticated = isAuthenticated();
    if (authenticated) {
      setUser(getUser());
    }
    // Set a 3-second delay before removing the loading state
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Login handler
  const login = (userData) => {
    setUser(userData);
    saveUser(userData);
  };

  // Logout handler
  const logout = () => {
    removeUser();
    localStorage.removeItem("token");
    setUser(null);
  };

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
          <motion.circle
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx="80%"
            cy="20%"
            r="300"
            fill="url(#g1)"
          >
            <animate
              attributeName="cx"
              values="80%;20%;80%"
              dur="12s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="r"
              values="300;350;300"
              dur="8s"
              repeatCount="indefinite"
            />
          </motion.circle>
          <motion.circle
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            cx="20%"
            cy="80%"
            r="200"
            fill="url(#g1)"
          >
            <animate
              attributeName="cy"
              values="80%;20%;80%"
              dur="16s"
              repeatCount="indefinite"
            />
          </motion.circle>
        </svg>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
          {/* 3D Quiz Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center mb-12"
          >
            <div className="relative">
              <motion.div
                animate={{
                  rotateY: [0, 360],
                  rotateZ: [0, 10, 0, -10, 0]
                }}
                transition={{
                  rotateY: { duration: 6, repeat: Infinity, ease: "linear" },
                  rotateZ: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{
                  transformStyle: "preserve-3d",
                  perspective: "1000px"
                }}
                className="ml-14 w-32 h-32 mb-6"
              >
                <div className="absolute inset-0 flex items-center justify-center w-32 h-32 rounded-xl bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 shadow-[0_0_30px_rgba(236,72,153,0.7)]">
                  <FaGamepad className="w-16 h-16 text-white" />
                </div>
              </motion.div>

              <h1 className="mt-6 text-5xl font-extrabold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text drop-shadow-lg font-orbitron">
                CTEWhiz
              </h1>
            </div>
          </motion.div>

          {/* 3D Rotating Quiz Elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative w-64 h-16 mb-10"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                className="absolute"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 shadow-lg">
                  <FaQuestionCircle className="w-6 h-6 text-white" />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                className="absolute -ml-24"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-pink-700 shadow-lg">
                  <FaBrain className="w-6 h-6 text-white" />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                className="absolute ml-24"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 shadow-lg">
                  <FaTrophy className="w-6 h-6 text-white" />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Loading Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="w-64 h-2 mb-4 overflow-hidden rounded-full bg-white/10"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500"
            />
          </motion.div>

          {/* Loading Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-lg font-medium text-pink-200 font-orbitron"
          >
            Loading Quiz Adventure...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50">
      {/* <Navbar /> */}
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Nếu đã đăng nhập rồi thì không cho vào /login nữa */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login login={login} user={user} />
            )
          }
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute user={user}>
              <Friends user={user} />
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <SidebarProvider>
                {/* Your main content here */}
                <Dashboard user={user} logout={logout} />
              </SidebarProvider>
            </ProtectedRoute>
          }
        />

        <Route
          path="/achievements"
          element={
            <ProtectedRoute user={user}>
              <Achievements />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user}>
              <UserProfile user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute user={user}>
              <UploadQuiz user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-room"
          element={
            <ProtectedRoute user={user}>
              <CreateRoom user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/join-room"
          element={
            <ProtectedRoute user={user}>
              <JoinRoom user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/room/:code"
          element={
            <ProtectedRoute user={user}>
              <Room user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quiz-game/:code"
          element={
            <ProtectedRoute user={user}>
              <QuizGame user={user} />
            </ProtectedRoute>
          }
        />

        <Route path="/quiz/:id" element={<QuizDetails user={user} />} />
        <Route path="/take-quiz/:quizId" element={<TakeQuiz user={user} />} />
        <Route
          path="/results/:submissionId"
          element={<QuizResults user={user} />}
        />

        <Route
          path="/create-quiz"
          element={<CreateQuiz />}
        />

        <Route
          path="/edit-quiz/:id"
          element={
            <ProtectedRoute user={user}>
              <EditQuiz />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-ai-quiz"
          element={
            <ProtectedRoute user={user}>
              <CreateAIQuiz />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user}>
              {user && user.accountType === 'admin' ? (
                <Admin user={user} />
              ) : (
                <Navigate to="/dashboard" />
              )}
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
