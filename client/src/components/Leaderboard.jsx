import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCrown, FaMedal, FaTrophy, FaStar, FaChartLine, FaHourglassHalf, FaCheck, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getLeaderboard } from '../services/api';
import toast from 'react-hot-toast';

const Leaderboard = () => {
    const [leaderboardData, setLeaderboardData] = useState({
        topScorers: [],
        stats: {
            totalParticipants: 0,
            totalQuizzesTaken: 0,
            averageScore: 0,
        },
        pagination: {
            page: 1,
            limit: 20,
            totalUsers: 0,
            totalPages: 1
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [timeFrame, setTimeFrame] = useState('all'); // 'all', 'weekly', 'monthly'
    const [category, setCategory] = useState('score'); // 'score', 'accuracy', 'quizzes', 'streak'
    const [currentPage, setCurrentPage] = useState(1);

    const handleTimeFrameChange = async (newTimeFrame) => {
        setTimeFrame(newTimeFrame);
        setCurrentPage(1); // Reset to first page when changing time frame
        toast.loading('Updating leaderboard...', { id: 'leaderboard-update' });
    };

    const handleCategoryChange = async (newCategory) => {
        setCategory(newCategory);
        setCurrentPage(1); // Reset to first page when changing category
        toast.loading('Updating leaderboard...', { id: 'leaderboard-update' });
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > leaderboardData.pagination.totalPages) return;
        setCurrentPage(newPage);
        toast.loading('Loading page...', { id: 'leaderboard-update' });
    };

    // Update toast when data changes
    useEffect(() => {
        if (!loading) {
            toast.success('Leaderboard updated!', { id: 'leaderboard-update' });
        }
    }, [loading]);

    // Fetch leaderboard data
    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getLeaderboard(timeFrame, category, currentPage, 20);
                if (response.success) {
                    setLeaderboardData(response.data);
                } else {
                    throw new Error(response.message || 'Failed to fetch leaderboard');
                }
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [timeFrame, category, currentPage]);

    // Format time duration
    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const getMedalColor = (index) => {
        switch (index) {
            case 0:
                return 'text-yellow-400'; // Gold
            case 1:
                return 'text-gray-400'; // Silver
            case 2:
                return 'text-amber-600'; // Bronze
            default:
                return 'text-pink-400'; // Default
        }
    };

    const getLeaderIcon = (index) => {
        switch (index) {
            case 0:
                return <FaCrown className="w-8 h-8 text-yellow-400" />;
            case 1:
                return <FaMedal className="w-7 h-7 text-gray-400" />;
            case 2:
                return <FaTrophy className="w-6 h-6 text-amber-600" />;
            default:
                return <FaStar className="w-5 h-5 text-pink-400" />;
        }
    };

    // Calculate the actual index based on pagination
    const getPlayerRank = (index) => {
        return (leaderboardData.pagination.page - 1) * leaderboardData.pagination.limit + index + 1;
    };

    // Generate pagination buttons
    const renderPagination = () => {
        const { page, totalPages } = leaderboardData.pagination;

        // Create array of page numbers to show
        let pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            // Show all pages if there are 5 or fewer
            pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
            // Always include first and last page
            pages.push(1);

            // Calculate start and end of the middle section
            let startPage = Math.max(2, page - 1);
            let endPage = Math.min(totalPages - 1, page + 1);

            // Adjust if we're near the beginning or end
            if (page <= 2) {
                endPage = 4;
            } else if (page >= totalPages - 1) {
                startPage = totalPages - 3;
            }

            // Add ellipsis if needed
            if (startPage > 2) {
                pages.push('...');
            }

            // Add middle pages
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            // Add ellipsis if needed
            if (endPage < totalPages - 1) {
                pages.push('...');
            }

            // Add last page if not already included
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }

        return (
            <div className="flex justify-center items-center mt-6 space-x-2">
                <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className={`p-2 rounded-lg ${page === 1 ? 'text-gray-500' : 'text-pink-200 hover:bg-white/10'}`}
                >
                    <FaChevronLeft />
                </button>

                {pages.map((pageNum, index) => (
                    <button
                        key={index}
                        onClick={() => typeof pageNum === 'number' ? handlePageChange(pageNum) : null}
                        className={`px-3 py-1 rounded-lg font-orbitron transition-all duration-300 ${pageNum === page
                            ? 'bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white'
                            : pageNum === '...'
                                ? 'text-pink-200'
                                : 'text-pink-200 hover:bg-white/10'
                            }`}
                    >
                        {pageNum}
                    </button>
                ))}

                <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className={`p-2 rounded-lg ${page === totalPages ? 'text-gray-500' : 'text-pink-200 hover:bg-white/10'}`}
                >
                    <FaChevronRight />
                </button>
            </div>
        );
    };

    return (
        <div className="p-6 space-y-8">
            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : error ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 text-center border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40"
                >
                    <p className="mb-4 text-xl text-pink-200 font-orbitron">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
                    >
                        Try Again
                    </button>
                </motion.div>
            ) : (
                <>
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 text-center border-4 shadow-lg bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-2xl border-pink-400/40"
                        >
                            <FaChartLine className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                            <h3 className="text-xl font-bold text-pink-200 font-orbitron">Total Players</h3>
                            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                                {leaderboardData.stats.totalParticipants}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-6 text-center border-4 shadow-lg bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-2xl border-pink-400/40"
                        >
                            <FaCheck className="w-8 h-8 mx-auto mb-2 text-green-400" />
                            <h3 className="text-xl font-bold text-pink-200 font-orbitron">Quizzes Completed</h3>
                            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                                {leaderboardData.stats.totalQuizzesTaken}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-6 text-center border-4 shadow-lg bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-2xl border-pink-400/40"
                        >
                            <FaTrophy className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                            <h3 className="text-xl font-bold text-pink-200 font-orbitron">Average Score</h3>
                            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                                {leaderboardData.stats.averageScore}%
                            </p>
                        </motion.div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 p-4 border-4 shadow-lg bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-2xl border-pink-400/40">
                        <div className="space-x-2">
                            <button
                                onClick={() => handleTimeFrameChange('all')}
                                className={`px-4 py-2 font-orbitron rounded-xl transition-all duration-300 ${timeFrame === 'all'
                                    ? 'bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white'
                                    : 'text-pink-200 hover:bg-white/10'
                                    }`}
                            >
                                All Time
                            </button>
                            <button
                                onClick={() => handleTimeFrameChange('monthly')}
                                className={`px-4 py-2 font-orbitron rounded-xl transition-all duration-300 ${timeFrame === 'monthly'
                                    ? 'bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white'
                                    : 'text-pink-200 hover:bg-white/10'
                                    }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => handleTimeFrameChange('weekly')}
                                className={`px-4 py-2 font-orbitron rounded-xl transition-all duration-300 ${timeFrame === 'weekly'
                                    ? 'bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white'
                                    : 'text-pink-200 hover:bg-white/10'
                                    }`}
                            >
                                Weekly
                            </button>
                        </div>

                        <div className="space-x-2">
                            <button
                                onClick={() => handleCategoryChange('score')}
                                className={`px-4 py-2 font-orbitron rounded-xl transition-all duration-300 ${category === 'score'
                                    ? 'bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white'
                                    : 'text-pink-200 hover:bg-white/10'
                                    }`}
                            >
                                Total Score
                            </button>
                            <button
                                onClick={() => handleCategoryChange('accuracy')}
                                className={`px-4 py-2 font-orbitron rounded-xl transition-all duration-300 ${category === 'accuracy'
                                    ? 'bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white'
                                    : 'text-pink-200 hover:bg-white/10'
                                    }`}
                            >
                                Accuracy
                            </button>
                            <button
                                onClick={() => handleCategoryChange('quizzes')}
                                className={`px-4 py-2 font-orbitron rounded-xl transition-all duration-300 ${category === 'quizzes'
                                    ? 'bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white'
                                    : 'text-pink-200 hover:bg-white/10'
                                    }`}
                            >
                                Quizzes Taken
                            </button>
                            <button
                                onClick={() => handleCategoryChange('streak')}
                                className={`px-4 py-2 font-orbitron rounded-xl transition-all duration-300 ${category === 'streak'
                                    ? 'bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 text-white'
                                    : 'text-pink-200 hover:bg-white/10'
                                    }`}
                            >
                                Login Streak
                            </button>
                        </div>
                    </div>

                    {/* Leaderboard Table */}
                    <div className="overflow-hidden border-4 shadow-lg bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-2xl border-pink-400/40">
                        <table className="w-full">
                            <thead>
                                <tr className="text-pink-200 border-b border-pink-400/40">
                                    <th className="p-4 text-left font-orbitron">Rank</th>
                                    <th className="p-4 text-left font-orbitron">Player</th>
                                    <th className="p-4 text-center font-orbitron">Total Score</th>
                                    <th className="p-4 text-center font-orbitron">Quizzes Taken</th>
                                    <th className="p-4 text-center font-orbitron">Login Streak</th>
                                    <th className="p-4 text-center font-orbitron">Accuracy</th>
                                    <th className="p-4 text-center font-orbitron">Total Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboardData.topScorers.map((player, index) => (
                                    <motion.tr
                                        key={player.username}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="border-b border-pink-400/20 hover:bg-white/5"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                {getPlayerRank(index) <= 3 ? getLeaderIcon(getPlayerRank(index) - 1) : null}
                                                <span className={`font-bold font-orbitron ${getPlayerRank(index) <= 3 ? getMedalColor(getPlayerRank(index) - 1) : 'text-pink-200'}`}>
                                                    #{getPlayerRank(index)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-bold text-pink-200 font-orbitron">{player.username}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="font-bold text-yellow-400 font-orbitron">{player.score}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="text-pink-200 font-orbitron">{player.quizzesTaken}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="text-green-400 font-orbitron">{player.loginStreak}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="text-blue-400 font-orbitron">{player.accuracy}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="text-pink-200 font-orbitron">{player.totalTime}</span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {renderPagination()}
                </>
            )}
        </div>
    );
};

export default Leaderboard;
