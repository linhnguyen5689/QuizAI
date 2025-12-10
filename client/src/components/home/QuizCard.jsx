import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaPlay, FaClock, FaUsers, FaEdit, FaTrash } from "react-icons/fa";

const QuizCard = ({ quiz, onDelete, isCreator = false }) => {
  const navigate = useNavigate();

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hover: {
      y: -5,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    tap: {
      scale: 0.95,
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true, margin: "-100px" }}
      className="relative overflow-hidden transition-all duration-300 bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-pink-400/40 group"
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-br from-yellow-400/10 via-pink-500/10 to-indigo-500/10 group-hover:opacity-100" />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <motion.h3
            className="text-xl font-semibold text-pink-200 transition-colors duration-300 group-hover:text-yellow-400 font-orbitron"
            whileHover={{ scale: 1.02 }}
          >
            {quiz.title}
          </motion.h3>
          <motion.span
            className="px-3 py-1 text-sm font-medium text-yellow-400 rounded-full bg-yellow-400/10 font-orbitron"
            whileHover={{ scale: 1.05 }}
          >
            {quiz.questions?.length || 0} questions
          </motion.span>
        </div>

        {/* Description */}
        <p className="mb-6 text-pink-200/80 transition-colors duration-300 line-clamp-2 group-hover:text-pink-200 font-orbitron">
          {quiz.description || "No description provided"}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-6 text-sm text-pink-200/60">
          <div className="flex items-center gap-1">
            <FaClock className="w-4 h-4" />
            <span>{quiz.timeLimit || "No time limit"}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaUsers className="w-4 h-4" />
            <span>{quiz.participants || 0} participants</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          {isCreator && (
            <div className="flex gap-2">
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/edit-quiz/${quiz._id}`);
                }}
                className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                title="Edit Quiz"
              >
                <FaEdit className="w-5 h-5" />
              </motion.button>
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onDelete) onDelete(quiz._id);
                }}
                className="p-2 text-pink-400 hover:text-pink-300 transition-colors"
                title="Delete Quiz"
              >
                <FaTrash className="w-5 h-5" />
              </motion.button>
            </div>
          )}
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className={isCreator ? "ml-auto" : ""}
          >
            <Link
              to={`/quiz/${quiz._id}`}
              className="inline-flex items-center px-6 py-3 text-sm font-medium text-white transition-all duration-300 shadow-lg rounded-xl bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 hover:from-pink-400 hover:to-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 hover:shadow-xl font-orbitron"
            >
              <FaPlay className="w-4 h-4 mr-2" />
              Take Quiz
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuizCard;
