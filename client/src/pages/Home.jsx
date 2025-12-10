import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPublicQuizzes } from "../services/api";
import Hero from "../components/home/Hero";
import { useAuth } from "../context/AuthContext";
import CreateQuizSteps from "@/components/home/CreateQuizSteps";
import FaqSection from "@/components/home/FaqSection";
import BlogList from "@/components/home/BlogList";
import QuizCard from "@/components/home/QuizCard";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import Footer from "@/components/Footer";
import { FaGamepad, FaStar, FaTrophy, FaUsers, FaBrain, FaLightbulb, FaRocket, FaChartLine, FaAward, FaMedal, FaGraduationCap, FaCheck } from "react-icons/fa";

// CSS for 3D effects
const styles = `
  .perspective-1000 {
    perspective: 1000px;
  }
  
  .preserve-3d {
    transform-style: preserve-3d;
  }
  
  .backface-hidden {
    backface-visibility: hidden;
  }
  
  .shadow-glow {
    box-shadow: 0 0 20px rgba(236, 72, 153, 0.5);
  }
  
  .rotate-y-180 {
    transform: rotateY(180deg);
  }
  
  .rotate-y-90 {
    transform: rotateY(90deg);
  }
  
  .rotate-y-neg-90 {
    transform: rotateY(-90deg);
  }
  
  .rotate-x-90 {
    transform: rotateX(90deg);
  }
  
  .rotate-x-neg-90 {
    transform: rotateX(-90deg);
  }
  
  .translate-z-32 {
    transform: translateZ(32px);
  }
  
  .translate-z-neg-32 {
    transform: translateZ(-32px);
  }
  
  .translate-x-32 {
    transform: translateX(32px);
  }
  
  .translate-x-neg-32 {
    transform: translateX(-32px);
  }
  
  .translate-y-32 {
    transform: translateY(32px);
  }
  
  .translate-y-neg-32 {
    transform: translateY(-32px);
  }
  
  .translate-z-neg-10 {
    transform: translateZ(-10px);
  }
  
  .transform-style-3d {
    transform-style: preserve-3d;
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  @keyframes spin-slow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  .animate-spin-slow {
    animation: spin-slow 8s linear infinite;
  }
  
  @keyframes spin-slow-reverse {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(-360deg);
    }
  }
  
  .animate-spin-slow-reverse {
    animation: spin-slow-reverse 8s linear infinite;
  }
`;

const Home = () => {
  const { isLoggedIn } = useAuth();
  const [publicQuizzes, setPublicQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState(0);

  // For 3D card rotation effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);

  useEffect(() => {
    const fetchPublicQuizzes = async () => {
      try {
        const response = await getPublicQuizzes();
        if (response.success) {
          setPublicQuizzes(response.data);
        }
      } catch (error) {
        console.error("Error fetching public quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicQuizzes();
  }, []);

  const features = [
    {
      title: "Immersive Learning",
      description: "Experience education like never before with our interactive 3D quiz environment",
      icon: <FaBrain className="w-8 h-8 text-yellow-400" />,
      color: "from-yellow-400 to-amber-600",
    },
    {
      title: "Smart Analytics",
      description: "Track your progress with detailed performance metrics and personalized insights",
      icon: <FaChartLine className="w-8 h-8 text-green-400" />,
      color: "from-green-400 to-emerald-600",
    },
    {
      title: "Competitive Gameplay",
      description: "Challenge friends in real-time multiplayer quiz battles and climb the leaderboards",
      icon: <FaTrophy className="w-8 h-8 text-pink-400" />,
      color: "from-pink-400 to-rose-600",
    },
    {
      title: "Adaptive Learning",
      description: "Our AI-powered system adapts questions based on your knowledge level",
      icon: <FaRocket className="w-8 h-8 text-blue-400" />,
      color: "from-blue-400 to-indigo-600",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [features.length]);

  // Perspective values for 3D card
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-x-hidden">
      {/* Animated SVG background */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" style={{ filter: 'blur(2px)' }}>
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
          <animate
            attributeName="r"
            values="200;250;200"
            dur="10s"
            repeatCount="indefinite"
          />
        </motion.circle>
        <motion.circle
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
          cx="50%"
          cy="50%"
          r="150"
          fill="url(#g1)"
        >
          <animate
            attributeName="cx"
            values="50%;70%;50%"
            dur="14s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="cy"
            values="50%;30%;50%"
            dur="14s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="r"
            values="150;200;150"
            dur="12s"
            repeatCount="indefinite"
          />
        </motion.circle>
      </svg>

      <div className="relative z-10">
        <Hero />

        {/* Popular Quizzes Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative py-24 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 backdrop-blur-sm"></div>
          <div className="container relative px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 min-h-14 text-5xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text font-orbitron">
                Explore Popular Quizzes
              </h2>
              <p className="max-w-2xl mx-auto text-xl leading-relaxed text-pink-200 font-orbitron">
                Discover and take quizzes created by our community. Test your
                knowledge and learn something new!
              </p>
            </motion.div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-16 h-16 border-4 border-pink-400 rounded-full border-t-transparent animate-spin"></div>
              </div>
            ) : publicQuizzes.length === 0 ? (
              <div className="py-12 text-center bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-pink-400/40">
                <p className="text-xl text-pink-200 font-orbitron">
                  No quizzes available at the moment.
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
              >
                {publicQuizzes.slice(0, 6).map((quiz) => (
                  <QuizCard key={quiz._id} quiz={quiz} />
                ))}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
              className="mt-12 text-center"
            >
              <Link
                to="/dashboard"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white font-medium rounded-xl hover:from-pink-400 hover:to-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-orbitron"
              >
                <span>View All Quizzes</span>
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Create Quiz Steps Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative py-8 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 backdrop-blur-sm"></div>
          <div className="container relative px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-5xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text font-orbitron">
                Create Your Own Quiz
              </h2>
              <p className="max-w-2xl mx-auto text-xl leading-relaxed text-pink-200 font-orbitron">
                Follow these simple steps to create engaging quizzes for your
                students or yourself
              </p>
            </motion.div>
            <div className="p-8 bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-pink-400/40">
              <CreateQuizSteps />
            </div>
          </div>
        </motion.section>

        {/* 3D Features Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative py-24 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 backdrop-blur-sm"></div>
          <div className="container relative px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-5xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text font-orbitron">
                Interactive Quiz Experience
              </h2>
              <p className="max-w-2xl mx-auto text-xl leading-relaxed text-pink-200 font-orbitron">
                Explore our unique features designed to make learning fun and effective
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
              {/* 3D Card with interactive hover effect */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                className="perspective-1000 relative h-[500px] flex items-center justify-center"
              >
                <motion.div
                  style={{ rotateX, rotateY, z: 100 }}
                  whileHover={{ scale: 1.05 }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  className="preserve-3d shadow-2xl rounded-3xl overflow-hidden w-full h-full bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl border-4 border-pink-400/40 cursor-pointer"
                >
                  <div className="absolute inset-0 p-10 flex flex-col justify-center items-center text-center backface-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center"
                      >
                        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${features[activeCard].color} flex items-center justify-center mb-6 shadow-glow`}>
                          {features[activeCard].icon}
                        </div>
                        <h3 className="text-3xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text font-orbitron mb-4">
                          {features[activeCard].title}
                        </h3>
                        <p className="text-pink-200 text-lg font-orbitron max-w-sm">
                          {features[activeCard].description}
                        </p>
                      </motion.div>
                    </AnimatePresence>

                    <div className="absolute bottom-8 flex space-x-2">
                      {features.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveCard(index)}
                          className={`w-3 h-3 rounded-full ${activeCard === index
                            ? "bg-pink-500"
                            : "bg-pink-500/30"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Decorative elements */}
                <div className="absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full blur-2xl opacity-70"></div>
                <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-2xl opacity-70"></div>
              </motion.div>

              {/* Feature bullets */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
                className="space-y-8 self-center"
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 10 }}
                    className={`p-6 rounded-2xl bg-gradient-to-r ${activeCard === index
                      ? "from-indigo-800/90 to-pink-800/90 border-2 border-pink-400/60 shadow-glow"
                      : "from-indigo-900/60 to-purple-900/60 border border-pink-400/20"
                      } transition-all duration-300 cursor-pointer`}
                    onClick={() => setActiveCard(index)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="mt-1">{feature.icon}</div>
                      <div>
                        <h4 className="text-xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text font-orbitron mb-2">
                          {feature.title}
                        </h4>
                        <p className="text-pink-200 font-orbitron">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-8 text-center"
                >
                  <Link
                    to={isLoggedIn ? "/dashboard" : "/register"}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white font-medium rounded-xl hover:from-pink-400 hover:to-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-orbitron"
                  >
                    <span>{isLoggedIn ? "Start Creating" : "Join Now"}</span>
                    <FaRocket className="ml-2 w-5 h-5" />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* 3D Achievements Showcase */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative py-24 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 backdrop-blur-sm"></div>
          <div className="container relative px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-5xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text font-orbitron">
                Earn Prestigious Achievements
              </h2>
              <p className="max-w-2xl mx-auto text-xl leading-relaxed text-pink-200 font-orbitron">
                Showcase your knowledge and skills with our unique achievement system
              </p>
            </motion.div>

            <div className="relative min-h-[500px]">
              {/* 3D Achievement Badges */}
              <div className="relative w-full h-[500px]">
                {/* Floating Badges */}
                <motion.div
                  className="absolute left-[10%] top-[20%] w-32 h-32"
                  animate={{
                    y: [0, -20, 0],
                    rotateY: [0, 360],
                    rotateZ: [5, -5, 5]
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="preserve-3d w-full h-full">
                    <div className="absolute inset-0 backface-hidden w-full h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-600 flex items-center justify-center shadow-xl">
                      <FaAward className="w-16 h-16 text-white" />
                    </div>
                    <div className="absolute inset-0 rotate-y-180 w-full h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 flex items-center justify-center shadow-xl">
                      <span className="text-white font-orbitron font-bold text-xl left-6 relative">Quiz Master</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute right-[15%] top-[60%] w-36 h-36"
                  animate={{
                    y: [0, 20, 0],
                    rotateY: [0, -360],
                    rotateZ: [-5, 5, -5]
                  }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                >
                  <div className="preserve-3d w-full h-full">
                    <div className="absolute inset-0 backface-hidden w-full h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-center shadow-xl">
                      <FaMedal className="w-20 h-20 text-white" />
                    </div>
                    <div className="absolute inset-0 rotate-y-180 w-full h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-400 flex items-center justify-center shadow-xl">
                      <span className="text-white font-orbitron font-bold text-xl">Champion</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute left-[40%] top-[40%] w-40 h-40"
                  animate={{
                    y: [0, 15, 0],
                    rotateY: [0, 360],
                    rotateZ: [0, 10, 0]
                  }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                  }}
                >
                  <div className="preserve-3d w-full h-full">
                    <div className="absolute inset-0 backface-hidden w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                      <FaTrophy className="w-24 h-24 text-white" />
                    </div>
                    <div className="absolute inset-0 rotate-y-180 w-full h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-400 flex items-center justify-center shadow-xl">
                      <span className="text-white font-orbitron font-bold text-2xl">LEGEND</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute right-[30%] top-[10%] w-28 h-28"
                  animate={{
                    y: [0, -15, 0],
                    rotateY: [0, -360],
                    rotateZ: [-10, 0, -10]
                  }}
                  transition={{
                    duration: 9,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 3
                  }}
                >
                  <div className="preserve-3d w-full h-full">
                    <div className="absolute inset-0 backface-hidden w-full h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-600 flex items-center justify-center shadow-xl">
                      <FaGraduationCap className="w-14 h-14 text-white" />
                    </div>
                    <div className="absolute inset-0 rotate-y-180 w-full h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 flex items-center justify-center shadow-xl">
                      <span className="text-white font-orbitron font-bold text-md">Expert</span>
                    </div>
                  </div>
                </motion.div>

                {/* Center feature badge */}
                <div className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 z-20">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="w-64 h-64"
                  >
                    <div className="w-full h-full preserve-3d">
                      <motion.div
                        animate={{ rotateY: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 p-1 shadow-[0_0_30px_rgba(236,72,153,0.7)]"
                      >
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-800 via-purple-900 to-pink-900 flex items-center justify-center">
                          <div className="text-center">
                            <FaStar className="w-20 h-20 text-yellow-300 mb-3 mx-auto" />
                            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-indigo-300 font-orbitron">Ultimate Quizzer</h3>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>

                {/* Glowing effects */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-yellow-500 rounded-full blur-3xl opacity-20"></div>

                {/* Bottom info */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="absolute left-0 right-0 bottom-0 text-center"
                >
                  <p className="text-xl text-pink-200 font-orbitron max-w-lg mx-auto">
                    Complete quizzes, challenge friends, and rise through the ranks to unlock these prestigious achievements
                  </p>
                  <Link
                    to="/achievements"
                    className="inline-flex items-center mt-6 px-6 py-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white font-medium rounded-xl hover:from-pink-400 hover:to-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-orbitron"
                  >
                    <span>View All Achievements</span>
                    <FaStar className="ml-2 w-4 h-4" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 3D Testimonials Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative py-24 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 backdrop-blur-sm"></div>
          <div className="container relative px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className=" text-center"
            >
              <h2 className="mb-4 text-5xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text font-orbitron">
                What Our Users Say
              </h2>
              <p className="max-w-2xl mx-auto text-xl leading-relaxed text-pink-200 font-orbitron">
                Hear from our community of quiz enthusiasts
              </p>
            </motion.div>

            <div className="relative h-[750px] overflow-hidden">
              {/* Central glow */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600 rounded-full blur-[100px] opacity-20"></div>

              {/* Testimonial Cards */}
              <motion.div
                className="absolute left-[10%] top-[20%] w-80"
                initial={{ opacity: 0, x: -100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, delay: 0.3 }}
                whileHover={{ scale: 1.05, rotate: 2 }}
              >
                <div className="p-6 bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-2 border-pink-400/40 shadow-xl transform rotate-[-3deg] preserve-3d">
                  <div className="mb-4 text-yellow-300 text-2xl">★★★★★</div>
                  <p className="text-pink-200 font-orbitron mb-6">
                    "This quiz platform completely transformed how I study. The interactive features and achievements keep me motivated. I've improved my test scores by 30%!"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 flex items-center justify-center text-white font-bold font-orbitron text-lg">
                      S
                    </div>
                    <div className="ml-4">
                      <h4 className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 font-orbitron font-bold">
                        Sarah Johnson
                      </h4>
                      <p className="text-pink-200/70 text-sm font-orbitron">
                        Biology Student
                      </p>
                    </div>
                  </div>

                  {/* 3D Effect elements */}
                  <div className="absolute -right-3 -bottom-3 w-12 h-12 bg-yellow-400 rounded-full blur-xl opacity-40 -z-10"></div>
                </div>
              </motion.div>

              <motion.div
                className="absolute right-[10%] top-[15%] w-80"
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, delay: 0.5 }}
                whileHover={{ scale: 1.05, rotate: -2 }}
              >
                <div className="p-6 bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-2 border-pink-400/40 shadow-xl transform rotate-[5deg] preserve-3d">
                  <div className="mb-4 text-yellow-300 text-2xl">★★★★★</div>
                  <p className="text-pink-200 font-orbitron mb-6">
                    "The 3D interface makes learning so engaging! I've created over 50 quizzes for my classroom, and my students are more engaged than ever."
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold font-orbitron text-lg">
                      M
                    </div>
                    <div className="ml-4">
                      <h4 className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 font-orbitron font-bold">
                        Michael Rodriguez
                      </h4>
                      <p className="text-pink-200/70 text-sm font-orbitron">
                        High School Teacher
                      </p>
                    </div>
                  </div>

                  {/* 3D Effect elements */}
                  <div className="absolute -left-3 -bottom-3 w-12 h-12 bg-blue-500 rounded-full blur-xl opacity-40 -z-10"></div>
                </div>
              </motion.div>

              <motion.div
                className="absolute left-[20%] bottom-[15%] w-80"
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, delay: 0.7 }}
                whileHover={{ scale: 1.05, rotate: 2 }}
              >
                <div className="p-6 bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-2 border-pink-400/40 shadow-xl transform rotate-[-2deg] preserve-3d">
                  <div className="mb-4 text-yellow-300 text-2xl">★★★★★</div>
                  <p className="text-pink-200 font-orbitron mb-6">
                    "I'm addicted to the achievements system! The way badges float in 3D space is so satisfying. I've learned so much while having fun."
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold font-orbitron text-lg">
                      A
                    </div>
                    <div className="ml-4">
                      <h4 className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 font-orbitron font-bold">
                        Alex Thompson
                      </h4>
                      <p className="text-pink-200/70 text-sm font-orbitron">
                        Software Engineer
                      </p>
                    </div>
                  </div>

                  {/* 3D Effect elements */}
                  <div className="absolute -right-3 -top-3 w-12 h-12 bg-green-500 rounded-full blur-xl opacity-40 -z-10"></div>
                </div>
              </motion.div>

              <motion.div
                className="absolute right-[25%] bottom-[20%] w-80"
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, delay: 0.9 }}
                whileHover={{ scale: 1.05, rotate: -2 }}
              >
                <div className="p-6 bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-2 border-pink-400/40 shadow-xl transform rotate-[3deg] preserve-3d">
                  <div className="mb-4 text-yellow-300 text-2xl">★★★★★</div>
                  <p className="text-pink-200 font-orbitron mb-6">
                    "The multiplayer quiz battles are incredible! I've made so many friends competing globally. The 3D effects make everything feel premium."
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold font-orbitron text-lg">
                      E
                    </div>
                    <div className="ml-4">
                      <h4 className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 font-orbitron font-bold">
                        Emily Chen
                      </h4>
                      <p className="text-pink-200/70 text-sm font-orbitron">
                        Marketing Specialist
                      </p>
                    </div>
                  </div>

                  {/* 3D Effect elements */}
                  <div className="absolute -left-3 -top-3 w-12 h-12 bg-pink-500 rounded-full blur-xl opacity-40 -z-10"></div>
                </div>
              </motion.div>

              {/* Floating central testimonial with 3D perspective */}
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 perspective-1000"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.5, delay: 1.1 }}
              >
                <motion.div
                  animate={{
                    y: [0, -20, 0],
                    rotateX: [2, -2, 2],
                    rotateY: [2, -2, 2]
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="preserve-3d p-8 bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-4 border-pink-400/40 shadow-[0_0_30px_rgba(236,72,153,0.4)]"
                >
                  <div className="mb-4 text-yellow-300 text-2xl flex justify-center">★★★★★</div>
                  <p className="text-pink-200 font-orbitron mb-6 text-center text-lg">
                    "This is the future of educational technology. The 3D quiz environment is unlike anything I've seen before. My entire university department now uses it for assessments!"
                  </p>
                  <div className="flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold font-orbitron text-2xl border-2 border-white/30">
                      J
                    </div>
                    <div className="ml-4">
                      <h4 className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 font-orbitron font-bold text-xl">
                        Dr. James Wilson
                      </h4>
                      <p className="text-pink-200/70 text-sm font-orbitron">
                        University Professor
                      </p>
                    </div>
                  </div>

                  {/* 3D Effect elements */}
                  <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-indigo-600/20 to-pink-600/20 blur-sm transform translate-z-neg-10"></div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* 3D Statistics Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative py-24 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 backdrop-blur-sm"></div>
          <div className="container relative px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-5xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text font-orbitron">
                Quiz Platform Statistics
              </h2>
              <p className="max-w-2xl mx-auto text-xl leading-relaxed text-pink-200 font-orbitron">
                Join our growing community of quiz enthusiasts
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* 3D Rotating Cube */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                className="relative h-[500px] flex items-center justify-center"
              >
                <div className="preserve-3d perspective-1000 w-full h-full flex items-center justify-center">
                  <motion.div
                    animate={{
                      rotateX: [0, 360],
                      rotateY: [0, 360],
                      rotateZ: [0, 360]
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="preserve-3d w-64 h-64 relative"
                  >
                    {/* Front Face */}
                    <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-4 border-pink-400/40 p-6 shadow-glow transform-style-3d translate-z-32 flex flex-col items-center justify-center">
                      <FaGamepad className="w-16 h-16 text-pink-400 mb-4" />
                      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 font-orbitron mb-2">
                        10,000+
                      </h3>
                      <p className="text-pink-200 font-orbitron text-center">
                        Quizzes Created
                      </p>
                    </div>

                    {/* Back Face */}
                    <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-4 border-pink-400/40 p-6 shadow-glow transform-style-3d translate-z-neg-32 rotate-y-180 flex flex-col items-center justify-center">
                      <FaUsers className="w-16 h-16 text-blue-400 mb-4" />
                      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 font-orbitron mb-2">
                        50,000+
                      </h3>
                      <p className="text-pink-200 font-orbitron text-center">
                        Active Users
                      </p>
                    </div>

                    {/* Right Face */}
                    <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-4 border-pink-400/40 p-6 shadow-glow transform-style-3d translate-x-32 rotate-y-90 flex flex-col items-center justify-center">
                      <FaTrophy className="w-16 h-16 text-yellow-400 mb-4" />
                      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 font-orbitron mb-2">
                        500,000+
                      </h3>
                      <p className="text-pink-200 font-orbitron text-center">
                        Quiz Submissions
                      </p>
                    </div>

                    {/* Left Face */}
                    <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-4 border-pink-400/40 p-6 shadow-glow transform-style-3d translate-x-neg-32 rotate-y-neg-90 flex flex-col items-center justify-center">
                      <FaRocket className="w-16 h-16 text-green-400 mb-4" />
                      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 font-orbitron mb-2">
                        95%
                      </h3>
                      <p className="text-pink-200 font-orbitron text-center">
                        User Satisfaction
                      </p>
                    </div>

                    {/* Top Face */}
                    <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-4 border-pink-400/40 p-6 shadow-glow transform-style-3d translate-y-neg-32 rotate-x-90 flex flex-col items-center justify-center">
                      <FaLightbulb className="w-16 h-16 text-amber-400 mb-4" />
                      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 font-orbitron mb-2">
                        100,000+
                      </h3>
                      <p className="text-pink-200 font-orbitron text-center">
                        Questions Answered
                      </p>
                    </div>

                    {/* Bottom Face */}
                    <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-4 border-pink-400/40 p-6 shadow-glow transform-style-3d translate-y-32 rotate-x-neg-90 flex flex-col items-center justify-center">
                      <FaChartLine className="w-16 h-16 text-purple-400 mb-4" />
                      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 font-orbitron mb-2">
                        30%
                      </h3>
                      <p className="text-pink-200 font-orbitron text-center">
                        Monthly Growth
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Glowing effects */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-72 h-72 bg-pink-500 rounded-full blur-3xl opacity-10"></div>
                </div>
              </motion.div>

              {/* Statistics */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { label: "Quizzes Taken", value: "5M+", icon: <FaGamepad className="w-8 h-8 text-yellow-400" /> },
                    { label: "Correct Answers", value: "75M+", icon: <FaCheck className="w-8 h-8 text-green-400" /> },
                    { label: "Daily Users", value: "25K+", icon: <FaUsers className="w-8 h-8 text-blue-400" /> },
                    { label: "Countries", value: "120+", icon: <FaGraduationCap className="w-8 h-8 text-pink-400" /> }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05, y: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="p-6 bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-2 border-pink-400/40 shadow-xl group"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-3 transform group-hover:scale-110 transition-transform duration-300">
                          {stat.icon}
                        </div>
                        <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 font-orbitron mb-1">
                          {stat.value}
                        </h3>
                        <p className="text-pink-200 font-orbitron">{stat.label}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-6 bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-2 border-pink-400/40 shadow-xl"
                >
                  <div className="flex flex-col items-center text-center">
                    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 font-orbitron mb-4">
                      Join Our Growing Community
                    </h3>
                    <p className="text-pink-200 font-orbitron mb-6">
                      Be part of one of the fastest growing quiz platforms. Create, share, and compete!
                    </p>
                    <Link
                      to={isLoggedIn ? "/dashboard" : "/register"}
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white font-medium rounded-xl hover:from-pink-400 hover:to-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-orbitron"
                    >
                      <span>{isLoggedIn ? "Go to Dashboard" : "Sign Up Now"}</span>
                      <svg
                        className="w-5 h-5 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.section>

      </div>
      <Footer />
    </div>
  );
};

export default Home;
