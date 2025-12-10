import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrophy, FaHistory, FaChartLine } from "react-icons/fa";

const ITEMS_PER_PAGE = 5;

const CollapsibleSubmissionsTable = ({ submissions }) => {
  const [expandedQuizId, setExpandedQuizId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  if (!Array.isArray(submissions) || submissions.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-12 text-center rounded-2xl bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 backdrop-blur-xl border-2 border-pink-400/40"
      >
        <p className="text-xl font-orbitron text-pink-200">No submissions found.</p>
      </motion.div>
    );
  }

  const submissionsByQuiz = submissions.reduce((acc, submission) => {
    if (!submission?.quizId?._id) return acc;
    const quizId = submission.quizId._id;
    if (!acc[quizId]) acc[quizId] = [];
    acc[quizId].push(submission);
    return acc;
  }, {});

  const toggleExpand = (quizId) => {
    setExpandedQuizId(expandedQuizId === quizId ? null : quizId);
  };

  const quizEntries = Object.entries(submissionsByQuiz);
  const totalPages = Math.ceil(quizEntries.length / ITEMS_PER_PAGE);
  const currentQuizzes = quizEntries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page) => {
    setExpandedQuizId(null);
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Animated SVG background */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" style={{filter:'blur(2px)'}}>
        <defs>
          <radialGradient id="g1" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#f472b6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="80%" cy="20%" r="300" fill="url(#g1)">
          <animate attributeName="cx" values="80%;20%;80%" dur="12s" repeatCount="indefinite" />
        </circle>
        <circle cx="20%" cy="80%" r="200" fill="url(#g1)">
          <animate attributeName="cy" values="80%;20%;80%" dur="16s" repeatCount="indefinite" />
        </circle>
      </svg>

      {currentQuizzes.map(([quizId, quizSubmissions], index) => {
        quizSubmissions.sort(
          (a, b) => new Date(b.completedAt) - new Date(a.completedAt)
        );
        const latest = quizSubmissions[0];
        const highest = Math.max(
          ...quizSubmissions.map((s) => s.percentageScore || 0)
        );
        const isExpanded = expandedQuizId === quizId;

        return (
          <motion.div
            key={quizId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="overflow-hidden bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-pink-400/40 hover:shadow-[0_0_40px_10px_rgba(236,72,153,0.7)] transition-all duration-500"
          >
            <div
              className="px-8 py-6 transition-colors cursor-pointer hover:bg-black/20"
              onClick={() => toggleExpand(quizId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                      {latest.quizId?.title || "Untitled Quiz"}
                    </h3>
                    {isExpanded ? (
                      <ChevronUpIcon className="w-6 h-6 text-pink-300 animate-bounce" />
                    ) : (
                      <ChevronDownIcon className="w-6 h-6 text-pink-300 animate-pulse" />
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-6 mt-4">
                    <div className="flex items-center gap-2 text-pink-200">
                      <FaHistory className="w-5 h-5 text-yellow-400 animate-spin-slow" />
                      <span className="font-orbitron">Attempts: {quizSubmissions.length}</span>
                    </div>
                    <div className="flex items-center gap-2 text-pink-200">
                      <FaTrophy className="w-5 h-5 text-yellow-400 animate-bounce" />
                      <span className="font-orbitron">Highest: {highest.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-pink-200">
                      <FaChartLine className="w-5 h-5 text-yellow-400 animate-pulse" />
                      <span className="font-orbitron">
                        Last: {latest.completedAt ? new Date(latest.completedAt).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  to={`/take-quiz/${quizId}`}
                  className="inline-flex items-center px-6 py-3 ml-4 text-lg font-orbitron text-white bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg border-2 border-white/30"
                  onClick={(e) => e.stopPropagation()}
                >
                  Retake Quiz
                </Link>
              </div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden border-t border-pink-400/40"
                >
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-pink-400/40">
                      <thead className="bg-black/30">
                        <tr>
                          <th className="px-8 py-4 text-sm font-orbitron tracking-wider text-left text-pink-200 uppercase">
                            Attempt
                          </th>
                          <th className="px-8 py-4 text-sm font-orbitron tracking-wider text-left text-pink-200 uppercase">
                            Score
                          </th>
                          <th className="px-8 py-4 text-sm font-orbitron tracking-wider text-left text-pink-200 uppercase">
                            Completed At
                          </th>
                          <th className="px-8 py-4 text-sm font-orbitron tracking-wider text-right text-pink-200 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-pink-400/40">
                        {quizSubmissions.map((s, idx) => (
                          <motion.tr
                            key={s._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.1 }}
                            className="hover:bg-black/20"
                          >
                            <td className="px-8 py-4 text-sm font-orbitron text-pink-200 whitespace-nowrap">
                              #{s.attemptNumber || "?"}
                            </td>
                            <td className="px-8 py-4 whitespace-nowrap">
                              <div className="text-sm font-orbitron text-pink-200">
                                {s.correctAnswers || 0}/{s.totalQuestions || 0}
                              </div>
                              <div className="text-sm font-orbitron text-yellow-400">
                                {(s.percentageScore || 0).toFixed(1)}%
                              </div>
                            </td>
                            <td className="px-8 py-4 text-sm font-orbitron text-pink-200 whitespace-nowrap">
                              {s.completedAt
                                ? new Date(s.completedAt).toLocaleString()
                                : "N/A"}
                            </td>
                            <td className="px-8 py-4 text-sm font-medium text-right whitespace-nowrap">
                              {s._id && (
                                <Link
                                  to={`/results/${s._id}`}
                                  className="inline-flex items-center px-4 py-2 text-sm font-orbitron text-white bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl hover:from-pink-500 hover:to-indigo-500 transition-all duration-300"
                                >
                                  View Details
                                </Link>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {totalPages > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center py-6 space-x-2"
        >
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="px-4 py-2 font-orbitron bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-xl hover:from-pink-500 hover:to-indigo-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            «
          </button>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 font-orbitron bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-xl hover:from-pink-500 hover:to-indigo-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ‹
          </button>

          {getPageNumbers().map((n, i) => (
            <React.Fragment key={i}>
              {n === "..." ? (
                <span className="px-4 text-pink-200 font-orbitron">...</span>
              ) : (
                <button
                  onClick={() => goToPage(n)}
                  className={`px-4 py-2 font-orbitron rounded-xl transition-all duration-300 ${
                    currentPage === n
                      ? "bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white"
                      : "bg-gradient-to-r from-indigo-500 to-pink-500 text-white hover:from-pink-500 hover:to-indigo-500"
                  }`}
                >
                  {n}
                </button>
              )}
            </React.Fragment>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 font-orbitron bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-xl hover:from-pink-500 hover:to-indigo-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ›
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 font-orbitron bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-xl hover:from-pink-500 hover:to-indigo-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            »
          </button>

          <span className="ml-6 text-sm font-orbitron text-pink-200">
            Page {currentPage} of {totalPages}
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default CollapsibleSubmissionsTable;
