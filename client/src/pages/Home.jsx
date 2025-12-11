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

// CSS for 3D effects (unchanged)
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

/**
 * HAU Blue Theme constants (only colors — thay đổi ở đây nếu muốn biến theme)
 * - giữ accent nhỏ (vàng/teal) cho điểm nhấn ở icon / star rating
 */
const PRIMARY = "#0859A6";         // HAU main blue
const PRIMARY_DARK = "#04345B";
const PRIMARY_LIGHT = "#4EA0FF";
const PAGE_BG_START = "#021A36";
const PAGE_BG_END = "#083A6C";
const CARD_BG = "linear-gradient(180deg, rgba(6,29,57,0.9), rgba(5,23,45,0.7))";
const PRIMARY_GRADIENT = `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY})`;
const SUBTLE_TEXT = "rgba(210,226,245,0.85)";
const GLOW_LIGHT = "rgba(78,160,255,0.18)";
const GLOW_SOFT = "rgba(8,89,166,0.22)";
const ACCENT_YELLOW = "#F6C85F"; // small accent (stars etc)
const SUCCESS = "#10B981";

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
      icon: <FaBrain className="w-8 h-8" style={{ color: ACCENT_YELLOW }} />,
      color: `from-${PRIMARY_LIGHT} to-${PRIMARY}`, // kept as placeholder string for tailwind classes in markup
    },
    {
      title: "Smart Analytics",
      description: "Track your progress with detailed performance metrics and personalized insights",
      icon: <FaChartLine className="w-8 h-8" style={{ color: PRIMARY_LIGHT }} />,
      color: `from-${PRIMARY_LIGHT} to-${PRIMARY}`,
    },
    {
      title: "Competitive Gameplay",
      description: "Challenge friends in real-time multiplayer quiz battles and climb the leaderboards",
      icon: <FaTrophy className="w-8 h-8" style={{ color: ACCENT_YELLOW }} />,
      color: `from-${PRIMARY_LIGHT} to-${PRIMARY}`,
    },
    {
      title: "Adaptive Learning",
      description: "Our AI-powered system adapts questions based on your knowledge level",
      icon: <FaRocket className="w-8 h-8" style={{ color: PRIMARY_LIGHT }} />,
      color: `from-${PRIMARY_LIGHT} to-${PRIMARY}`,
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
    <div style={{ minHeight: "100vh", position: "relative", overflowX: "hidden", background: `linear-gradient(135deg, ${PAGE_BG_START}, ${PAGE_BG_END})` }}>
      <style>{styles}</style>

      {/* Animated SVG background (use blue glow) */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" style={{ filter: 'blur(2px)' }}>
        <defs>
          <radialGradient id="g1" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor={PRIMARY_LIGHT} stopOpacity="0.45" />
            <stop offset="100%" stopColor={PRIMARY} stopOpacity="0" />
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
          <animate attributeName="cx" values="80%;20%;80%" dur="12s" repeatCount="indefinite" />
          <animate attributeName="r" values="300;350;300" dur="8s" repeatCount="indefinite" />
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
          <animate attributeName="cy" values="80%;20%;80%" dur="16s" repeatCount="indefinite" />
          <animate attributeName="r" values="200;250;200" dur="10s" repeatCount="indefinite" />
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
          <animate attributeName="cx" values="50%;70%;50%" dur="14s" repeatCount="indefinite" />
          <animate attributeName="cy" values="50%;30%;50%" dur="14s" repeatCount="indefinite" />
          <animate attributeName="r" values="150;200;150" dur="12s" repeatCount="indefinite" />
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
          <div className="absolute inset-0" style={{ background: "rgba(3,20,40,0.04)", backdropFilter: "blur(6px)" }}></div>
          <div className="container relative px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 min-h-14 text-5xl font-bold font-orbitron"
                  style={{ background: PRIMARY_GRADIENT, WebkitBackgroundClip: "text", color: "transparent" }}>
                Explore Popular Quizzes
              </h2>
              <p className="max-w-2xl mx-auto text-xl leading-relaxed font-orbitron" style={{ color: SUBTLE_TEXT }}>
                Discover and take quizzes created by our community. Test your knowledge and learn something new!
              </p>
            </motion.div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div style={{ width: 64, height: 64, borderWidth: 4, borderStyle: "solid", borderColor: PRIMARY_LIGHT, borderTopColor: "transparent", borderRadius: "999px" }} className="animate-spin" />
              </div>
            ) : publicQuizzes.length === 0 ? (
              <div className="py-12 text-center" style={{ background: CARD_BG, borderRadius: 18, padding: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.35)", border: `1px solid ${PRIMARY}22` }}>
                <p className="text-xl font-orbitron" style={{ color: SUBTLE_TEXT }}>
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
                className="inline-flex items-center px-8 py-4 font-medium rounded-xl hover:from-pink-400 hover:to-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-orbitron"
                style={{ background: PRIMARY_GRADIENT, color: "#001B2E" }}
              >
                <span>View All Quizzes</span>
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
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
          <div className="absolute inset-0" style={{ background: "rgba(3,20,40,0.04)", backdropFilter: "blur(6px)" }}></div>
          <div className="container relative px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-5xl font-bold font-orbitron" style={{ background: PRIMARY_GRADIENT, WebkitBackgroundClip: "text", color: "transparent" }}>
                Create Your Own Quiz
              </h2>
              <p className="max-w-2xl mx-auto text-xl leading-relaxed font-orbitron" style={{ color: SUBTLE_TEXT }}>
                Follow these simple steps to create engaging quizzes for your students or yourself
              </p>
            </motion.div>
            <div className="p-8" style={{ background: CARD_BG, borderRadius: 20, boxShadow: "0 20px 40px rgba(0,0,0,0.35)", border: `1px solid ${PRIMARY}22` }}>
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
          <div className="absolute inset-0" style={{ background: "rgba(3,20,40,0.04)", backdropFilter: "blur(6px)" }}></div>
          <div className="container relative px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-5xl font-bold font-orbitron" style={{ background: PRIMARY_GRADIENT, WebkitBackgroundClip: "text", color: "transparent" }}>
                Interactive Quiz Experience
              </h2>
              <p className="max-w-2xl mx-auto text-xl leading-relaxed font-orbitron" style={{ color: SUBTLE_TEXT }}>
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
                  className="preserve-3d shadow-2xl rounded-3xl overflow-hidden w-full h-full cursor-pointer"
                  style={{ background: CARD_BG, border: `1px solid ${PRIMARY}22`, backdropFilter: "blur(6px)" }}
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
                        <div style={{
                          width: 96,
                          height: 96,
                          borderRadius: "999px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 18,
                          boxShadow: `0 8px 30px ${GLOW_SOFT}`,
                          background: PRIMARY_GRADIENT
                        }}>
                          {features[activeCard].icon}
                        </div>

                        <h3 className="text-3xl font-bold font-orbitron mb-4" style={{ background: PRIMARY_GRADIENT, WebkitBackgroundClip: "text", color: "transparent" }}>
                          {features[activeCard].title}
                        </h3>
                        <p className="font-orbitron" style={{ color: SUBTLE_TEXT, maxWidth: 520 }}>
                          {features[activeCard].description}
                        </p>
                      </motion.div>
                    </AnimatePresence>

                    <div className="absolute bottom-8 flex space-x-2">
                      {features.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveCard(index)}
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 999,
                            background: activeCard === index ? PRIMARY_LIGHT : `${PRIMARY_LIGHT}33`,
                            border: "none",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Decorative elements */}
                <div style={{ position: "absolute", left: -32, top: -32, width: 64, height: 64, borderRadius: 999, filter: "blur(18px)", background: GLOW_LIGHT, opacity: 0.75 }} />
                <div style={{ position: "absolute", right: -32, bottom: -32, width: 64, height: 64, borderRadius: 999, filter: "blur(18px)", background: GLOW_SOFT, opacity: 0.6 }} />
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
                    className={`p-6 rounded-2xl transition-all duration-300 cursor-pointer`}
                    onClick={() => setActiveCard(index)}
                    style={{
                      background: activeCard === index ? CARD_BG : "transparent",
                      border: `1px solid ${PRIMARY}22`,
                      boxShadow: activeCard === index ? `0 12px 30px ${GLOW_SOFT}` : "none",
                    }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="mt-1">{feature.icon}</div>
                      <div>
                        <h4 className="text-xl font-bold font-orbitron mb-2" style={{ background: PRIMARY_GRADIENT, WebkitBackgroundClip: "text", color: "transparent" }}>
                          {feature.title}
                        </h4>
                        <p className="font-orbitron" style={{ color: SUBTLE_TEXT }}>
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
                    className="inline-flex items-center px-8 py-4 font-medium rounded-xl transition-all duration-300 shadow-lg transform hover:-translate-y-0.5 font-orbitron"
                    style={{ background: PRIMARY_GRADIENT, color: "#001B2E" }}
                  >
                    <span>{isLoggedIn ? "Start Creating" : "Join Now"}</span>
                    <FaRocket className="ml-2 w-5 h-5" style={{ color: PRIMARY_DARK }} />
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
          <div className="absolute inset-0" style={{ background: "rgba(3,20,40,0.04)", backdropFilter: "blur(6px)" }}></div>
          <div className="container relative px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-5xl font-bold font-orbitron" style={{ background: PRIMARY_GRADIENT, WebkitBackgroundClip: "text", color: "transparent" }}>
                Earn Prestigious Achievements
              </h2>
              <p className="max-w-2xl mx-auto text-xl leading-relaxed font-orbitron" style={{ color: SUBTLE_TEXT }}>
                Showcase your knowledge and skills with our unique achievement system
              </p>
            </motion.div>

            <div className="relative min-h-[500px]">
              {/* 3D Achievement Badges (colors adjusted) */}
              <div className="relative w-full h-[500px]">
                <motion.div
                  className="absolute left-[10%] top-[20%] w-32 h-32"
                  animate={{ y: [0, -20, 0], rotateY: [0, 360], rotateZ: [5, -5, 5] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="preserve-3d w-full h-full">
                    <div className="absolute inset-0 backface-hidden w-full h-full rounded-full" style={{ background: PRIMARY_GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 12px 30px ${GLOW_SOFT}` }}>
                      <FaAward className="w-16 h-16 text-white" />
                    </div>
                    <div className="absolute inset-0 rotate-y-180 w-full h-full rounded-full" style={{ background: PRIMARY_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 12px 30px ${GLOW_SOFT}` }}>
                      <span className="text-white font-orbitron font-bold text-xl left-6 relative">Quiz Master</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute right-[15%] top-[60%] w-36 h-36"
                  animate={{ y: [0, 20, 0], rotateY: [0, -360], rotateZ: [-5, 5, -5] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <div className="preserve-3d w-full h-full">
                    <div className="absolute inset-0 backface-hidden w-full h-full rounded-full" style={{ background: PRIMARY_GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 12px 30px ${GLOW_SOFT}` }}>
                      <FaMedal className="w-20 h-20 text-white" />
                    </div>
                    <div className="absolute inset-0 rotate-y-180 w-full h-full rounded-full" style={{ background: PRIMARY_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 12px 30px ${GLOW_SOFT}` }}>
                      <span className="text-white font-orbitron font-bold text-xl">Champion</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute left-[40%] top-[40%] w-40 h-40"
                  animate={{ y: [0, 15, 0], rotateY: [0, 360], rotateZ: [0, 10, 0] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                >
                  <div className="preserve-3d w-full h-full">
                    <div className="absolute inset-0 backface-hidden w-full h-full rounded-full" style={{ background: PRIMARY_GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 12px 30px ${GLOW_SOFT}` }}>
                      <FaTrophy className="w-24 h-24 text-white" />
                    </div>
                    <div className="absolute inset-0 rotate-y-180 w-full h-full rounded-full" style={{ background: PRIMARY_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 12px 30px ${GLOW_SOFT}` }}>
                      <span className="text-white font-orbitron font-bold text-2xl">LEGEND</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute right-[30%] top-[10%] w-28 h-28"
                  animate={{ y: [0, -15, 0], rotateY: [0, -360], rotateZ: [-10, 0, -10] }}
                  transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                >
                  <div className="preserve-3d w-full h-full">
                    <div className="absolute inset-0 backface-hidden w-full h-full rounded-full" style={{ background: PRIMARY_GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 12px 30px ${GLOW_SOFT}` }}>
                      <FaGraduationCap className="w-14 h-14 text-white" />
                    </div>
                    <div className="absolute inset-0 rotate-y-180 w-full h-full rounded-full" style={{ background: PRIMARY_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 12px 30px ${GLOW_SOFT}` }}>
                      <span className="text-white font-orbitron font-bold text-md">Expert</span>
                    </div>
                  </div>
                </motion.div>

                {/* Center feature badge */}
                <div className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 z-20">
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1, delay: 0.5 }} className="w-64 h-64">
                    <div className="w-full h-full preserve-3d">
                      <motion.div animate={{ rotateY: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full p-1" style={{ background: PRIMARY_GRADIENT, boxShadow: `0 0 30px ${GLOW_SOFT}` }}>
                        <div style={{ width: "100%", height: "100%", borderRadius: 999, background: CARD_BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div className="text-center">
                            <FaStar className="w-20 h-20" style={{ color: ACCENT_YELLOW }} />
                            <h3 className="text-2xl font-bold font-orbitron" style={{ background: PRIMARY_GRADIENT, WebkitBackgroundClip: 'text', color: 'transparent' }}>Ultimate Quizzer</h3>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>

                {/* Glowing effects (blue) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full" style={{ background: GLOW_SOFT, filter: "blur(40px)", opacity: 0.12 }}></div>
                <div className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full" style={{ background: GLOW_LIGHT, filter: "blur(30px)", opacity: 0.08 }}></div>
                <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full" style={{ background: PRIMARY_LIGHT, filter: "blur(30px)", opacity: 0.08 }}></div>

                {/* Bottom info */}
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1, delay: 0.7 }} className="absolute left-0 right-0 bottom-0 text-center">
                  <p className="text-xl font-orbitron max-w-lg mx-auto" style={{ color: SUBTLE_TEXT }}>
                    Complete quizzes, challenge friends, and rise through the ranks to unlock these prestigious achievements
                  </p>
                  <Link to="/achievements" className="inline-flex items-center mt-6 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg transform hover:-translate-y-0.5 font-orbitron" style={{ background: PRIMARY_GRADIENT, color: "#001B2E" }}>
                    <span>View All Achievements</span>
                    <FaStar className="ml-2 w-4 h-4" style={{ color: PRIMARY_DARK }} />
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 3D Testimonials Section (colors adjusted) */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative py-24 overflow-hidden"
        >
          <div className="absolute inset-0" style={{ background: "rgba(3,20,40,0.04)", backdropFilter: "blur(6px)" }}></div>
          <div className="container relative px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className=" text-center"
            >
              <h2 className="mb-4 text-5xl font-bold font-orbitron" style={{ background: PRIMARY_GRADIENT, WebkitBackgroundClip: "text", color: "transparent" }}>
                What Our Users Say
              </h2>
              <p className="max-w-2xl mx-auto text-xl leading-relaxed font-orbitron" style={{ color: SUBTLE_TEXT }}>
                Hear from our community of quiz enthusiasts
              </p>
            </motion.div>

            <div className="relative h-[750px] overflow-hidden">
              {/* Central glow */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full" style={{ background: PRIMARY_LIGHT, filter: "blur(80px)", opacity: 0.06 }}></div>

              {/* Testimonial Cards (colors adjusted) */}
              <motion.div
                className="absolute left-[10%] top-[20%] w-80"
                initial={{ opacity: 0, x: -100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, delay: 0.3 }}
                whileHover={{ scale: 1.05, rotate: 2 }}
              >
                <div className="p-6 rounded-3xl preserve-3d" style={{ background: CARD_BG, border: `1px solid ${PRIMARY}22`, boxShadow: `0 20px 40px rgba(0,0,0,0.35)` }}>
                  <div style={{ marginBottom: 16, color: ACCENT_YELLOW, fontSize: 20 }}>★★★★★</div>
                  <p className="font-orbitron mb-6" style={{ color: SUBTLE_TEXT }}>
                    "This quiz platform completely transformed how I study. The interactive features and achievements keep me motivated. I've improved my test scores by 30%!"
                  </p>
                  <div className="flex items-center">
                    <div style={{ width: 48, height: 48, borderRadius: 999, background: PRIMARY_GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', color: "#001B2E", fontWeight: 700 }}>
                      S
                    </div>
                    <div style={{ marginLeft: 12 }}>
                      <h4 style={{ background: PRIMARY_GRADIENT, WebkitBackgroundClip: "text", color: "transparent", fontWeight: 800 }} className="font-orbitron">Sarah Johnson</h4>
                      <p style={{ color: SUBTLE_TEXT }} className="font-orbitron text-sm">Biology Student</p>
                    </div>
                  </div>
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
                <div className="p-6 rounded-3xl preserve-3d" style={{ background: CARD_BG, border: `1px solid ${PRIMARY}22`, boxShadow: `0 20px 40px rgba(0,0,0,0.35)` }}>
                  <div style={{ marginBottom: 16, color: ACCENT_YELLOW, fontSize: 20 }}>★★★★★</div>
                  <p className="font-orbitron mb-6" style={{ color: SUBTLE_TEXT }}>
                    "The 3D interface makes learning so engaging! I've created over 50 quizzes for my classroom, and my students are more engaged than ever."
                  </p>
                  <div className="flex items-center">
                    <div style={{ width: 48, height: 48, borderRadius: 999, background: PRIMARY_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', color: "#001B2E", fontWeight: 700 }}>
                      M
                    </div>
                    <div style={{ marginLeft: 12 }}>
                      <h4 style={{ background: PRIMARY_GRADIENT, WebkitBackgroundClip: "text", color: "transparent", fontWeight: 800 }} className="font-orbitron">Michael Rodriguez</h4>
                      <p style={{ color: SUBTLE_TEXT }} className="font-orbitron text-sm">High School Teacher</p>
                    </div>
                  </div>
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
                <div className="p-6 rounded-3xl preserve-3d" style={{ background: CARD_BG, border: `1px solid ${PRIMARY}22`, boxShadow: `0 20px 40px rgba(0,0,0,0.35)` }}>
                  <div style={{ marginBottom: 16, color: ACCENT_YELLOW, fontSize: 20 }}>★★★★★</div>
                  <p className="font-orbitron mb-6" style={{ color: SUBTLE_TEXT }}>
                    "I'm addicted to the achievements system! The way badges float in 3D space is so satisfying. I've learned so much while having fun."
                  </p>
                  <div className="flex items-center">
                    <div style={{ width: 48, height: 48, borderRadius: 999, background: PRIMARY_GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', color: "#001B2E", fontWeight: 700 }}>
                      A
                    </div>
                    <div style={{ marginLeft: 12 }}>
                      <h4 style={{ background: PRIMARY_GRADIENT, WebkitBackgroundClip: "text", color: "transparent", fontWeight: 800 }} className="font-orbitron">Alex Thompson</h4>
                      <p style={{ color: SUBTLE_TEXT }} className="font-orbitron text-sm">Software Engineer</p>
                    </div>
                  </div>
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
                <div className="p-6 rounded-3xl preserve-3d" style={{ background: CARD_BG, border: `1px solid ${PRIMARY}22`, boxShadow: `0 20px 40px rgba(0,0,0,0.35)` }}>
                  <div style={{ marginBottom: 16, color: ACCENT_YELLOW, fontSize: 20 }}>★★★★★</div>
                  <p className="font-orbitron mb-6" style={{ color: SUBTLE_TEXT }}>
                    "The multiplayer quiz battles are incredible! I've made so many friends competing globally. The 3D effects make everything feel premium."
                  </p>
                  <div className="flex items-center">
                    <div style={{ width: 48, height: 48, borderRadius: 999, background: PRIMARY_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', color: "#001B2E", fontWeight: 700 }}>
                      E
                    </div>
                    <div style={{ marginLeft: 12 }}>
                      <h4 style={{ background: PRIMARY_GRADIENT, WebkitBackgroundClip: "text", color: "transparent", fontWeight: 800 }} className="font-orbitron">Emily Chen</h4>
                      <p style={{ color: SUBTLE_TEXT }} className="font-orbitron text-sm">Marketing Specialist</p>
                    </div>
                  </div>
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
                  className="preserve-3d p-8 rounded-3xl"
                  style={{ background: CARD_BG, border: `1px solid ${PRIMARY}22`, boxShadow: `0 20px 40px rgba(0,0,0,0.35)` }}
                >
                  <div style={{ marginBottom: 16, color: ACCENT_YELLOW, fontSize: 20, display: 'flex', justifyContent: 'center' }}>★★★★★</div>
                  <p className="font-orbitron mb-6 text-center text-lg" style={{ color: SUBTLE_TEXT }}>
                    "This is the future of educational technology. The 3D quiz environment is unlike anything I've seen before. My entire university department now uses it for assessments!"
                  </p>
                  <div className="flex items-center justify-center">
                    <div style={{ width: 64, height: 64, borderRadius: 999, background: PRIMARY_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', color: "#001B2E", fontWeight: 700, border: '2px solid rgba(255,255,255,0.04)' }}>
                      J
                    </div>
                    <div style={{ marginLeft: 12 }}>
                      <h4 style={{ background: PRIMARY_GRADIENT, WebkitBackgroundClip: "text", color: "transparent", fontWeight: 800 }} className="font-orbitron text-xl">Dr. James Wilson</h4>
                      <p style={{ color: SUBTLE_TEXT }} className="font-orbitron text-sm">University Professor</p>
                    </div>
                  </div>

                  {/* subtle 3D background */}
                  <div style={{ position: "absolute", inset: 0, borderRadius: 24, background: CARD_BG, filter: "blur(6px)", transform: "translateZ(-10px)", zIndex: -1 }} />
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
          <div className="absolute inset-0" style={{ background: "rgba(3,20,40,0.04)", backdropFilter: "blur(6px)" }}></div>
          <div className="container relative px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-5xl font-bold font-orbitron" style={{ background: PRIMARY_GRADIENT, WebkitBackgroundClip: "text", color: "transparent" }}>
                Quiz Platform Statistics
              </h2>
              <p className="max-w-2xl mx-auto text-xl leading-relaxed font-orbitron" style={{ color: SUBTLE_TEXT }}>
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
                    <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl p-6" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: CARD_BG, border: `1px solid ${PRIMARY}22`, boxShadow: GLOW_SOFT }}>
                      <FaGamepad className="w-16 h-16" style={{ color: PRIMARY_LIGHT }} />
                      <h3 className="text-2xl font-bold font-orbitron mb-2" style={{ background: PRIMARY_GRADIENT, WebkitBackgroundClip: "text", color: "transparent" }}>10,000+</h3>
                      <p style={{ color: SUBTLE_TEXT }} className="font-orbitron text-center">Quizzes Created</p>
                    </div>

                    {/* Back Face */}
                    <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl p-6" style={{ transform: "rotateY(180deg) translateZ(-32px)", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: CARD_BG, border: `1px solid ${PRIMARY}22`, boxShadow: GLOW_SOFT }}>
                      <FaUsers className="w-16 h-16" style={{ color: PRIMARY_LIGHT }} />
                      <h3 className="text-2xl font-bold font-orbitron mb-2" style={{ background: PRIMARY_GRADIENT, WebkitBackgroundClip: "text", color: "transparent" }}>50,000+</h3>
                      <p style={{ color: SUBTLE_TEXT }} className="font-orbitron text-center">Active Users</p>
                    </div>

                    {/* Right Face */}
                    <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl p-6" style={{ transform: "translateX(32px) rotateY(90deg)", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: CARD_BG, border: `1px solid ${PRIMARY}22`, boxShadow: GLOW_SOFT }}>
                      <FaTrophy className="w-16 h-16" style={{ color: ACCENT_YELLOW }} />
                      <h3 className="text-2xl font-bold font-orbitron mb-2" style={{ background: PRIMARY_GRADIENT, WebkitBackgroundClip: "text", color: "transparent" }}>500,000+</h3>
                      <p style={{ color: SUBTLE_TEXT }} className="font-orbitron text-center">Quiz Submissions</p>
                    </div>

                    {/* Left Face */}
                    <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl p-6" style={{ transform: "translateX(-32px) rotateY(-90deg)", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: CARD_BG, border: `1px solid ${PRIMARY}22`, boxShadow: GLOW_SOFT }}>
                      <FaRocket className="w-16 h-16" style={{ color: PRIMARY_LIGHT }} />
                      <h3 className="text-2xl font-bold font-orbitron mb-2" style={{ background: PRIMARY_GRADIENT, WebkitBackgroundClip: "text", color: "transparent" }}>95%</h3>
                      <p style={{ color: SUBTLE_TEXT }} className="font-orbitron text-center">User Satisfaction</p>
                    </div>

                    {/* Top Face */}
                    <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl p-6" style={{ transform: "translateY(-32px) rotateX(90deg)", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: CARD_BG, border: `1px solid ${PRIMARY}22`, boxShadow: GLOW_SOFT }}>
                      <FaLightbulb className="w-16 h-16" style={{ color: ACCENT_YELLOW }} />
                      <h3 className="text-2xl font-bold font-orbitron mb-2" style={{ background: PRIMARY_GRADIENT, WebkitBackgroundClip: "text", color: "transparent" }}>100,000+</h3>
                      <p style={{ color: SUBTLE_TEXT }} className="font-orbitron text-center">Questions Answered</p>
                    </div>

                    {/* Bottom Face */}
                    <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl p-6" style={{ transform: "translateY(32px) rotateX(-90deg)", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: CARD_BG, border: `1px solid ${PRIMARY}22`, boxShadow: GLOW_SOFT }}>
                      <FaChartLine className="w-16 h-16" style={{ color: PRIMARY_LIGHT }} />
                      <h3 className="text-2xl font-bold font-orbitron mb-2" style={{ background: PRIMARY_GRADIENT, WebkitBackgroundClip: "text", color: "transparent" }}>30%</h3>
                      <p style={{ color: SUBTLE_TEXT }} className="font-orbitron text-center">Monthly Growth</p>
                    </div>
                  </motion.div>
                </div>

                {/* Glowing effects */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-72 h-72 rounded-full" style={{ background: GLOW_SOFT, filter: "blur(40px)", opacity: 0.08 }}></div>
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
                    { label: "Quizzes Taken", value: "5M+", icon: <FaGamepad className="w-8 h-8" style={{ color: ACCENT_YELLOW }} /> },
                    { label: "Correct Answers", value: "75M+", icon: <FaCheck className="w-8 h-8" style={{ color: SUCCESS }} /> },
                    { label: "Daily Users", value: "25K+", icon: <FaUsers className="w-8 h-8" style={{ color: PRIMARY_LIGHT }} /> },
                    { label: "Countries", value: "120+", icon: <FaGraduationCap className="w-8 h-8" style={{ color: PRIMARY_LIGHT }} /> }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05, y: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="p-6 rounded-3xl"
                      style={{ background: CARD_BG, border: `1px solid ${PRIMARY}22`, boxShadow: `0 20px 40px rgba(0,0,0,0.35)` }}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-3 transform group-hover:scale-110 transition-transform duration-300">
                          {stat.icon}
                        </div>
                        <h3 className="text-4xl font-bold font-orbitron mb-1" style={{ background: PRIMARY_GRADIENT, WebkitBackgroundClip: "text", color: "transparent" }}>
                          {stat.value}
                        </h3>
                        <p style={{ color: SUBTLE_TEXT }} className="font-orbitron">{stat.label}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-6 rounded-3xl"
                  style={{ background: CARD_BG, border: `1px solid ${PRIMARY}22`, boxShadow: `0 20px 40px rgba(0,0,0,0.35)` }}
                >
                  <div className="flex flex-col items-center text-center">
                    <h3 className="text-2xl font-bold font-orbitron mb-4" style={{ background: PRIMARY_GRADIENT, WebkitBackgroundClip: "text", color: "transparent" }}>
                      Join Our Growing Community
                    </h3>
                    <p style={{ color: SUBTLE_TEXT }} className="font-orbitron mb-6">
                      Be part of one of the fastest growing quiz platforms. Create, share, and compete!
                    </p>
                    <Link
                      to={isLoggedIn ? "/dashboard" : "/register"}
                      className="inline-flex items-center px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg transform hover:-translate-y-0.5 font-orbitron"
                      style={{ background: PRIMARY_GRADIENT, color: "#001B2E" }}
                    >
                      <span>{isLoggedIn ? "Go to Dashboard" : "Sign Up Now"}</span>
                      <svg
                        className="w-5 h-5 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
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
