import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserAchievements } from '../services/api';
import socketService from '../services/socketService';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { FiArrowLeft } from 'react-icons/fi';
import { motion, AnimatePresence } from "framer-motion";
import {
    FaGamepad,
    FaStar,
    FaTrophy,
    FaUsers,
    FaSignOutAlt,
    FaUser,
    FaUserFriends,
    FaMedal,
    FaUserCog,
    FaAward,
    FaCrown,
} from "react-icons/fa";
import "../styles/Dashboard.css";

const Achievements = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [checking, setChecking] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Always get the latest user from localStorage
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    useEffect(() => {
        // Set up socket listener for new achievements
        socketService.on('achievements-unlocked', (data) => {
            // Ensure data and achievements array exist
            if (data && Array.isArray(data.achievements)) {
                // Show toast notification for each new achievement
                data.achievements.forEach(achievement => {
                    if (achievement && achievement.name) {
                        toast.success(
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{achievement.icon}</span>
                                <div>
                                    <p className="font-semibold">{achievement.name}</p>
                                    <p className="text-sm">{achievement.description}</p>
                                </div>
                            </div>,
                            {
                                duration: 5000,
                                position: 'bottom-right'
                            }
                        );
                    }
                });

                // Refresh achievements list
                fetchAchievements();
            }
        });

        return () => {
            // Clean up socket listener
            socketService.off('achievements-unlocked');
        };
    }, []);

    const fetchAchievements = async () => {
        try {
            setLoading(true);
            const response = await getUserAchievements();

            // Always treat the response as successful even if it's not
            // Just use empty data if there's an error
            const achievementsData = response.success && Array.isArray(response.data) ? response.data : [];

            // Extra validation to ensure we only work with valid data
            const validAchievements = achievementsData.filter(
                item => item && typeof item === 'object' && item._id
            );

            setAchievements(validAchievements);

            if (!response.success) {
                console.warn('Achievement data issue:', response.message);
            } else {
                setError(null);
            }
        } catch (error) {
            console.error('Error fetching achievements:', error);
            setError('Unable to load achievements. Please try again later.');
            // Don't show toast on first load
            if (!loading) {
                toast.error('Unable to load achievements');
            }
            // Set empty array on error instead of leaving previous state
            setAchievements([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckAchievements = async () => {
        setChecking(true);
        try {
            // Use socket to check achievements
            socketService.checkAchievements();
            toast.success('Checking achievements...');
        } catch (error) {
            console.error('Error checking achievements:', error);
            toast.error('Unable to check achievements');
        } finally {
            setChecking(false);
        }
    };

    useEffect(() => {
        fetchAchievements();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center w-screen min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
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
            </div>
        );
    }

    // Group achievements by unlocked status (ensure valid objects only)
    const validAchievements = achievements.filter(a => a && typeof a === 'object');
    const unlockedAchievements = validAchievements.filter(a => a.unlocked);
    const lockedAchievements = validAchievements.filter(a => !a.unlocked);

    // Handle the case where there are no achievements at all
    if (validAchievements.length === 0 && !loading && !error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 text-center border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40"
                >
                    <p className="mb-4 text-xl text-pink-200 font-orbitron">No achievements available yet.</p>
                    <button
                        onClick={handleCheckAchievements}
                        className="px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
                    >
                        Check Achievements
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="relative w-screen min-h-screen overflow-x-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
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

            <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div className="flex items-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="mr-4 px-4 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30"
                            onClick={() => navigate('/dashboard')}
                            aria-label="Back to dashboard"
                        >
                            <FiArrowLeft className="w-6 h-6" />
                        </motion.button>

                        <h1 className="flex items-center gap-3 text-4xl font-extrabold text-transparent md:text-5xl font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 drop-shadow-lg">
                            <FaMedal className="inline-block text-yellow-300 animate-bounce" />
                            Achievements
                            <FaStar className="inline-block text-pink-300 animate-spin-slow" />
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCheckAchievements}
                            disabled={checking}
                            className={`px-6 py-3 text-white transition-all duration-300 transform border-2 shadow-lg font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-2xl hover:from-pink-400 hover:to-yellow-400 hover:scale-105 active:scale-95 border-white/30 ${checking ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            {checking ? 'Checking...' : 'Check Achievements'}
                        </motion.button>

                        {/* User Dropdown Menu */}
                        <div className="relative user-info" ref={dropdownRef}>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-3 cursor-pointer avatar-container"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <img
                                    src={user?.profilePicture || "/images/df_avatar.png"}
                                    alt="User Avatar"
                                    className="w-12 h-12 border-2 rounded-full shadow-lg border-pink-400/40"
                                />
                                <span className="text-white username font-orbitron">
                                    {user?.username}
                                </span>
                            </motion.div>

                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 z-20 w-64 mt-2 overflow-hidden border-2 shadow-2xl top-16 bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-2xl border-pink-400/40"
                                    >
                                        <div className="flex items-center gap-3 p-4 border-b dropdown-header border-pink-400/40">
                                            <img
                                                src={user?.profilePicture || "/images/df_avatar.png"}
                                                alt="User Avatar"
                                                className="w-12 h-12 border-2 rounded-full border-pink-400/40"
                                            />
                                            <div className="dropdown-header-info">
                                                <div className="text-pink-200 dropdown-header-name font-orbitron">
                                                    {user?.displayName || user?.username}
                                                </div>
                                                <div className="text-sm dropdown-header-email font-orbitron text-pink-300/80">
                                                    {user?.email || "user@example.com"}
                                                </div>
                                            </div>
                                        </div>

                                        <Link
                                            to="/profile"
                                            className="flex items-center gap-3 px-4 py-3 dropdown-item hover:bg-black/20"
                                        >
                                            <div className="dropdown-item-icon">
                                                <FaUser className="w-5 h-5 text-yellow-400" />
                                            </div>
                                            <span className="text-pink-200 dropdown-item-text font-orbitron">
                                                Profile
                                            </span>
                                        </Link>

                                        <Link
                                            to="/dashboard"
                                            className="flex items-center gap-3 px-4 py-3 dropdown-item hover:bg-black/20"
                                        >
                                            <div className="dropdown-item-icon">
                                                <FaGamepad className="w-5 h-5 text-yellow-400" />
                                            </div>
                                            <span className="text-pink-200 dropdown-item-text font-orbitron">
                                                Dashboard
                                            </span>
                                        </Link>

                                        <Link
                                            to="/friends"
                                            className="flex items-center gap-3 px-4 py-3 dropdown-item hover:bg-black/20"
                                        >
                                            <div className="dropdown-item-icon">
                                                <FaUserFriends className="w-5 h-5 text-yellow-400" />
                                            </div>
                                            <span className="text-pink-200 dropdown-item-text font-orbitron">
                                                Friends
                                            </span>
                                        </Link>

                                        {/* Admin link - only shown for admin users */}
                                        {user?.accountType === 'admin' && (
                                            <Link
                                                to="/admin"
                                                className="flex items-center gap-3 px-4 py-3 dropdown-item hover:bg-black/20"
                                            >
                                                <div className="dropdown-item-icon">
                                                    <FaUserCog className="w-5 h-5 text-yellow-400" />
                                                </div>
                                                <span className="text-pink-200 dropdown-item-text font-orbitron">
                                                    Admin Panel
                                                </span>
                                            </Link>
                                        )}

                                        <div className="border-t dropdown-divider border-pink-400/40"></div>

                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full gap-3 px-4 py-3 text-left dropdown-item hover:bg-black/20"
                                        >
                                            <div className="dropdown-item-icon">
                                                <FaSignOutAlt className="w-5 h-5 text-yellow-400" />
                                            </div>
                                            <span className="text-pink-200 dropdown-item-text font-orbitron">
                                                Logout
                                            </span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>

                {/* Progress Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="p-8 mb-12 border-4 shadow-2xl bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl border-pink-400/40"
                >
                    <h2 className="mb-4 text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">Progress Overview</h2>
                    <div className="flex items-center gap-6">
                        <div className="flex-1">
                            <div className="h-6 rounded-full overflow-hidden bg-black/30">
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${(unlockedAchievements.length / achievements.length) * 100}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="h-6 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-full"
                                />
                            </div>
                        </div>
                        <span className="text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                            {unlockedAchievements.length}/{achievements.length}
                        </span>
                    </div>
                </motion.div>

                {/* Unlocked Achievements */}
                {unlockedAchievements.length > 0 && (
                    <div className="mb-16">
                        <h2 className="mb-8 text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 flex items-center gap-2">
                            <FaCrown className="text-yellow-300" />
                            Unlocked
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {unlockedAchievements.map((achievement, index) => (
                                <motion.div
                                    key={achievement._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="p-6 border-4 shadow-2xl bg-gradient-to-r from-yellow-500/40 to-pink-500/40 backdrop-blur-xl rounded-3xl border-yellow-400/40 relative overflow-hidden"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="text-5xl drop-shadow-lg">{achievement.icon}</span>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r from-yellow-400 to-pink-500 shadow-lg">
                                            Unlocked
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{achievement.name}</h3>
                                    <p className="mb-4 text-pink-100">{achievement.description}</p>
                                    <p className="text-sm text-pink-200">Achieved on: <span className="font-semibold">{new Date(achievement.unlockedAt).toLocaleDateString()}</span></p>
                                    <div className="absolute right-0 top-0 opacity-10 text-8xl pointer-events-none select-none">🏆</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Locked Achievements */}
                {lockedAchievements.length > 0 && (
                    <div>
                        <h2 className="mb-8 text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-gray-400 via-gray-500 to-gray-300 flex items-center gap-2">
                            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-1.414 1.414A9 9 0 105.636 18.364l1.414-1.414" /></svg>
                            Locked
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {lockedAchievements.map((achievement, index) => (
                                <motion.div
                                    key={achievement._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="p-6 border-4 shadow-2xl bg-gradient-to-br from-indigo-800/30 via-purple-800/30 to-pink-800/30 backdrop-blur-xl rounded-3xl border-gray-400/20 relative overflow-hidden"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="text-5xl opacity-40">{achievement.icon}</span>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold text-white/70 bg-gray-700/50 shadow-lg">
                                            Locked
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-300 mb-2">{achievement.name}</h3>
                                    <p className="mb-4 text-gray-400">{achievement.description}</p>
                                    <div className="h-2 rounded-full mt-4 bg-black/30">
                                        <div className="h-2 bg-gray-500/30 rounded-full" style={{ width: '0%' }} />
                                    </div>
                                    <p className="text-xs mt-2 text-gray-400">Not unlocked yet</p>
                                    <div className="absolute right-0 top-0 opacity-10 text-8xl pointer-events-none select-none">🔒</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Achievements;