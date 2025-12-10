import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { FaArrowRight, FaCheckCircle, FaUsers, FaBook } from "react-icons/fa";

const Hero = () => {
  const { isLoggedIn } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-pink-500/5 to-indigo-500/5"></div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400/10 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-400/10 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative inline-block"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-lg blur opacity-25"></div>
              <h1 className="relative text-5xl md:text-6xl lg:text-7xl font-bold mb-6 font-orbitron">
                <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
                  Create & Take
                </span>
                <br />
                <span className="text-pink-200">Engaging Quizzes</span>
              </h1>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-pink-200/80 mb-8 max-w-2xl mx-auto lg:mx-0 relative font-orbitron"
            >
              <span className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-yellow-400 rounded-full"></span>
              Transform your learning experience with AI-powered quiz creation and interactive assessments
              <span className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-indigo-500 rounded-full"></span>
            </motion.p>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
            >
              <div className="flex items-center gap-2 text-pink-200/80">
                <FaCheckCircle className="text-yellow-400" />
                <span className="font-orbitron">AI-Powered Quiz Creation</span>
              </div>
              <div className="flex items-center gap-2 text-pink-200/80">
                <FaCheckCircle className="text-yellow-400" />
                <span className="font-orbitron">Interactive Learning</span>
              </div>
              <div className="flex items-center gap-2 text-pink-200/80">
                <FaCheckCircle className="text-yellow-400" />
                <span className="font-orbitron">Real-time Analytics</span>
              </div>
              <div className="flex items-center gap-2 text-pink-200/80">
                <FaCheckCircle className="text-yellow-400" />
                <span className="font-orbitron">Customizable Templates</span>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              {isLoggedIn ? (
                <Link 
                  to="/dashboard"
                  className="group relative px-8 py-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white font-semibold rounded-lg shadow-lg hover:from-pink-400 hover:to-yellow-400 transition-all duration-300 transform hover:-translate-y-1 font-orbitron"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center gap-2">
                    Go to Dashboard
                    <FaArrowRight className="transform group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Link>
              ) : (
                <>
                  <Link 
                    to="/register"
                    className="group relative px-8 py-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white font-semibold rounded-lg shadow-lg hover:from-pink-400 hover:to-yellow-400 transition-all duration-300 transform hover:-translate-y-1 font-orbitron"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center gap-2">
                      Get Started
                      <FaArrowRight className="transform group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </Link>
                  <Link 
                    to="/login"
                    className="group relative px-8 py-4 bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 text-pink-200 font-semibold rounded-lg border-2 border-pink-400/40 hover:border-yellow-400 hover:text-yellow-400 transition-all duration-300 transform hover:-translate-y-1 font-orbitron"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-pink-500/10 to-indigo-500/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center gap-2">
                      Sign In
                      <FaArrowRight className="transform group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Image Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Main Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80"
                  alt="Students learning"
                  className="w-full h-[500px] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-pink-500/20 to-indigo-500/20"></div>
              </div>

              {/* Floating Elements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute -top-8 -right-8 bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 p-4 rounded-xl shadow-lg border-4 border-pink-400/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-400/10 rounded-lg flex items-center justify-center">
                    <FaUsers className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-pink-200 font-orbitron">1000+</p>
                    <p className="text-xs text-pink-200/60 font-orbitron">Active Users</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="absolute -bottom-8 -left-8 bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 p-4 rounded-xl shadow-lg border-4 border-pink-400/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-pink-400/10 rounded-lg flex items-center justify-center">
                    <FaBook className="w-6 h-6 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-pink-200 font-orbitron">500+</p>
                    <p className="text-xs text-pink-200/60 font-orbitron">Quizzes Created</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-indigo-900 to-transparent"></div>
    </section>
  );
};

export default Hero;
