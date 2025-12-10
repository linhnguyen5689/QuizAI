import { useState, useEffect, lazy, Suspense, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPencilAlt,
  FaCog,
  FaRocket,
  FaCheckCircle,
  FaArrowRight,
  FaQuestionCircle,
  FaRegClock,
  FaShare,
  FaChartLine,
  FaUsers,
  FaLaptop,
  FaMobileAlt,
  FaBrain,
  FaLayerGroup,
  FaPalette,
  FaShieldAlt,
} from "react-icons/fa";

// Lazy load all icons
const FeatureIcon = memo(({ icon }) => {
  return <>{icon}</>;
});

// Updated steps with quiz-specific content and more quiz features
const steps = [
  {
    id: "step1",
    title: "Design Your Quiz",
    subtitle: "Create & Customize",
    description:
      "Create engaging quizzes using our intuitive builder. Select from multiple question types including multiple choice, true/false, matching, and fill-in-the-blank. Add images, videos, and custom branding to make your quiz stand out.",
    image: "/images/step1.jpg",
    icon: <FaPencilAlt className="w-6 h-6" />,
    features: [
      "6+ question types",
      "Multimedia support",
      "Custom quiz themes",
      "Question bank storage",
    ],
  },
  {
    id: "step2",
    title: "Configure Settings",
    subtitle: "Fine-tune & Optimize",
    description:
      "Customize your quiz settings to match your needs. Set time limits, randomize questions, control result visibility, and determine how feedback is provided to participants.",
    image: "/images/step2.jpg",
    icon: <FaCog className="w-6 h-6" />,
    features: [
      "Flexible time limits",
      "Randomization options",
      "Custom scoring rules",
      "Certificate generation",
    ],
  },
  {
    id: "step3",
    title: "Launch & Share",
    subtitle: "Publish & Engage",
    description:
      "Share your quiz effortlessly through multiple channels. Generate a unique link, embed it on your website, or invite participants directly by email. Track responses in real-time.",
    image: "/images/step3z.jpg",
    icon: <FaRocket className="w-6 h-6" />,
    features: [
      "Instant publishing",
      "Multi-platform sharing",
      "Real-time analytics",
      "Detailed performance reports",
    ],
  },
];

// Reduce number of additional features to improve performance
const additionalFeatures = [
  {
    icon: <FaQuestionCircle className="w-5 h-5" />,
    title: "Diverse Question Types",
    description: "Support for multiple choice, true/false, matching, fill-in-the-blank, and more",
  },
  {
    icon: <FaRegClock className="w-5 h-5" />,
    title: "Time Controls",
    description: "Set quiz time limits or individual question timers",
  },
  {
    icon: <FaShare className="w-5 h-5" />,
    title: "Easy Sharing",
    description: "Share via link, embed code, QR code, or direct email invites",
  },
  {
    icon: <FaChartLine className="w-5 h-5" />,
    title: "Detailed Analytics",
    description: "Track completion rates, scores, and participant feedback",
  },
  {
    icon: <FaUsers className="w-5 h-5" />,
    title: "Multiplayer Mode",
    description: "Compete in real-time with friends or global participants",
  }
];

// Optimized animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Reduced from 0.2
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 }, // Reduced from 20
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3, // Reduced from 0.5
      ease: "easeOut",
    },
  },
};

// Use memo to prevent unnecessary re-renders
const FeatureItem = memo(({ feature, index, activeStep }) => {
  return (
    <motion.li
      key={index}
      initial={{ opacity: 0, x: -10 }} // Reduced from -20
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }} // Reduced delay multiplier
      className="flex items-center gap-3"
      whileHover={{ x: 3 }} // Reduced from 5
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
        <FaCheckCircle className="w-5 h-5 text-white" />
      </div>
      <span className="text-pink-200 font-orbitron">{feature}</span>
    </motion.li>
  );
});

const FeatureCard = memo(({ feature, index, hoveredFeature, setHoveredFeature }) => {
  return (
    <motion.div
      key={index}
      className={`p-4 rounded-xl border transition-all duration-300 ${hoveredFeature === index
        ? "border-pink-400 bg-gradient-to-br from-indigo-800 to-purple-800 shadow-[0_0_10px_rgba(236,72,153,0.3)]"
        : "border-pink-400/20 bg-gradient-to-br from-indigo-900/60 to-purple-900/60"
        }`}
      onMouseEnter={() => setHoveredFeature(index)}
      onMouseLeave={() => setHoveredFeature(null)}
      whileHover={{ y: -3, scale: 1.01 }} // Reduced values
    >
      <div className="flex flex-col items-center text-center h-full">
        <div className={`mb-3 p-3 rounded-full ${hoveredFeature === index
          ? "bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white"
          : "bg-pink-400/10 text-pink-400"
          }`}>
          <FeatureIcon icon={feature.icon} />
        </div>
        <h4 className="mb-2 font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text font-orbitron">
          {feature.title}
        </h4>
        <p className="text-xs text-pink-200 font-orbitron leading-relaxed">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
});

function CreateQuizSteps() {
  const [activeStep, setActiveStep] = useState(0);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [shouldRenderAdditionalFeatures, setShouldRenderAdditionalFeatures] = useState(false);

  // Only render additional features when visible in viewport
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // If scrolled beyond 60% of page, render additional features
      if (scrollY > documentHeight * 0.6) {
        setShouldRenderAdditionalFeatures(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const nextStep = () => {
    setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
  };

  const prevStep = () => {
    setActiveStep((prev) => (prev > 0 ? prev - 1 : prev));
  };

  return (
    <div className="relative will-change-transform">
      {/* Reduced size of blur effects */}
      <div className="absolute -top-10 -left-10 w-20 h-20 bg-indigo-500 rounded-full blur-[40px] opacity-10"></div>
      <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-pink-500 rounded-full blur-[40px] opacity-10"></div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="relative"
      >
        {/* Progress Bar */}
        <div className="relative mb-12">
          <div className="absolute left-0 w-full h-1 -translate-y-1/2 bg-gray-700/50 rounded-full top-1/2">
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 will-change-transform"
              initial={{ width: "0%" }}
              animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }} // Reduced from 0.5
            />
          </div>
          <div className="relative flex justify-between">
            {steps.map((step, index) => (
              <motion.button
                key={step.id}
                onClick={() => setActiveStep(index)}
                className={`relative z-10 flex flex-col items-center gap-2 ${index <= activeStep ? "text-pink-400" : "text-gray-400"
                  }`}
                whileHover={{ scale: 1.03 }} // Reduced from 1.05
                whileTap={{ scale: 0.97 }} // Reduced from 0.95
              >
                <motion.div
                  className={`flex items-center justify-center w-14 h-14 rounded-full border-2 transition-colors ${index <= activeStep
                    ? "border-pink-500 bg-gradient-to-br from-indigo-900/90 to-purple-900/90"
                    : "border-gray-700 bg-gray-900/60"
                    }`}
                  whileHover={index > activeStep ? { borderColor: "rgba(236, 72, 153, 0.5)" } : {}}
                >
                  {index < activeStep ? (
                    <FaCheckCircle className="w-7 h-7 text-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500" />
                  ) : (
                    <div className={index === activeStep ? "text-pink-400" : "text-gray-400"}>
                      <FeatureIcon icon={step.icon} />
                    </div>
                  )}
                </motion.div>
                <span className="text-sm font-medium font-orbitron">{step.title}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 10 }} // Reduced from 20
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }} // Reduced from -20
            transition={{ duration: 0.2 }} // Reduced from 0.3
            className="relative overflow-hidden rounded-2xl border-4 border-pink-400/40 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Image Section - Simplified */}
              <div className="relative h-64 lg:h-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-pink-900/90" />
                <img
                  src={steps[activeStep].image}
                  alt={steps[activeStep].title}
                  className="object-cover w-full h-full opacity-60 mix-blend-overlay"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent" />

                {/* Simplified floating badges */}
                <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white font-orbitron text-sm font-bold shadow-lg">
                  Step {activeStep + 1} of {steps.length}
                </div>

                <div className="absolute bottom-6 left-6">
                  <span className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-orbitron text-sm font-bold shadow-lg">
                    {steps[activeStep].subtitle}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-8 bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-pink-900/90">
                <div className="mb-6">
                  <h3 className="mb-2 text-3xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text font-orbitron">
                    {steps[activeStep].title}
                  </h3>
                  <p className="text-lg font-medium text-pink-400 font-orbitron">
                    {steps[activeStep].subtitle}
                  </p>
                </div>

                <p className="mb-8 text-pink-200 font-orbitron">
                  {steps[activeStep].description}
                </p>

                <div className="mb-8">
                  <h4 className="mb-4 text-xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text font-orbitron">
                    Key Features:
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {steps[activeStep].features.map((feature, index) => (
                      <FeatureItem
                        key={index}
                        feature={feature}
                        index={index}
                        activeStep={activeStep}
                      />
                    ))}
                  </ul>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-pink-400/20">
                  <motion.button
                    onClick={prevStep}
                    disabled={activeStep === 0}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors font-orbitron ${activeStep === 0
                      ? "text-gray-500 cursor-not-allowed"
                      : "text-pink-400 hover:text-white hover:bg-pink-500/20"
                      }`}
                    whileHover={activeStep > 0 ? { scale: 1.03 } : {}} // Reduced from 1.05
                    whileTap={activeStep > 0 ? { scale: 0.97 } : {}} // Reduced from 0.95
                  >
                    <FaArrowRight className="w-4 h-4 rotate-180" />
                    Previous
                  </motion.button>

                  <motion.button
                    onClick={nextStep}
                    disabled={activeStep === steps.length - 1}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors font-orbitron ${activeStep === steps.length - 1
                      ? "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white hover:shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                      }`}
                    whileHover={activeStep < steps.length - 1 ? { scale: 1.03 } : {}} // Reduced from 1.05
                    whileTap={activeStep < steps.length - 1 ? { scale: 0.97 } : {}} // Reduced from 0.95
                  >
                    Next
                    <FaArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Additional Features Section - conditionally rendered */}
        {shouldRenderAdditionalFeatures && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 p-6 rounded-2xl border-2 border-pink-400/30 bg-gradient-to-br from-indigo-900/80 via-purple-900/80 to-pink-900/80 shadow-[0_0_15px_rgba(236,72,153,0.2)]"
          >
            <h3 className="mb-6 text-center text-2xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text font-orbitron">
              More Powerful Quiz Features
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {additionalFeatures.map((feature, index) => (
                <FeatureCard
                  key={index}
                  feature={feature}
                  index={index}
                  hoveredFeature={hoveredFeature}
                  setHoveredFeature={setHoveredFeature}
                />
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// Memoize the component to prevent unnecessary rerenders
export default memo(CreateQuizSteps);
