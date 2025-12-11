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
            <div className="flex items-center justify-center w-screen min-h-screen"
                 style={{ background: 'linear-gradient(180deg, #013A6B 0%, #014F86 50%, #0166A8 100%)' }}>
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen"
                 style={{ background: 'linear-gradient(180deg, #013A6B 0%, #014F86 50%, #0166A8 100%)' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 text-center border-4 shadow-2xl rounded-3xl"
                    style={{
                        background: 'linear-gradient(180deg, rgba(1,42,74,0.85), rgba(1,58,107,0.85))',
                        borderColor: 'rgba(43,108,176,0.28)'
                    }}
                >
                    <p className="mb-4 text-xl" style={{ color: '#EAF6FF', fontFamily: 'Orbitron, sans-serif' }}>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 text-white transition-all duration-300 transform border-2 rounded-2xl"
                        style={{ background: 'linear-gradient(90deg,#0077D6,#0096FF,#66D9FF)', borderColor: 'rgba(255,255,255,0.06)' }}
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
            <div className="flex items-center justify-center min-h-screen"
                 style={{ background: 'linear-gradient(180deg, #013A6B 0%, #014F86 50%, #0166A8 100%)' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 text-center border-4 shadow-2xl rounded-3xl"
                    style={{ background: 'linear-gradient(180deg, rgba(1,42,74,0.85), rgba(1,58,107,0.85))', borderColor: 'rgba(43,108,176,0.28)' }}
                >
                    <p className="mb-4 text-xl" style={{ color: '#EAF6FF', fontFamily: 'Orbitron, sans-serif' }}>No achievements available yet.</p>
                    <button
                        onClick={handleCheckAchievements}
                        className="px-6 py-3 text-white transition-all duration-300 transform border-2 rounded-2xl"
                        style={{ background: 'linear-gradient(90deg,#0077D6,#0096FF,#66D9FF)', borderColor: 'rgba(255,255,255,0.06)' }}
                    >
                        Check Achievements
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="relative w-screen min-h-screen overflow-x-hidden"
             style={{ background: 'linear-gradient(180deg, #013A6B 0%, #014F86 50%, #0166A8 100%)' }}>
            {/* Animated SVG background */}
            <svg
                className="absolute top-0 left-0 z-0 w-full h-full pointer-events-none"
                style={{ filter: "blur(2px)" }}
            >
                <defs>
                    <radialGradient id="g1" cx="50%" cy="50%" r="80%">
                        <stop offset="0%" stopColor="#66D9FF" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#013A6B" stopOpacity="0" />
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
                            className="mr-4 px-4 py-3 text-white transition-all duration-300 transform border-2 rounded-2xl"
                            style={{ background: 'linear-gradient(90deg,#0077D6,#0096FF,#66D9FF)', borderColor: 'rgba(255,255,255,0.06)' }}
                            onClick={() => navigate('/dashboard')}
                            aria-label="Back to dashboard"
                        >
                            <FiArrowLeft className="w-6 h-6" />
                        </motion.button>

                        <h1 className="flex items-center gap-3 text-4xl font-extrabold md:text-5xl"
                            style={{ color: 'transparent', backgroundImage: 'linear-gradient(90deg,#0077D6,#0096FF,#66D9FF)', WebkitBackgroundClip: 'text', fontFamily: 'Orbitron, sans-serif' }}>
                            <FaMedal className="inline-block" style={{ color: '#66D9FF' }} />
                            Achievements
                            <FaStar className="inline-block" style={{ color: '#A6E7FF' }} />
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCheckAchievements}
                            disabled={checking}
                            className="px-6 py-3 text-white transition-all duration-300 transform border-2 rounded-2xl"
                            style={{
                                background: 'linear-gradient(90deg,#0077D6,#0096FF,#66D9FF)',
                                borderColor: 'rgba(255,255,255,0.06)',
                                opacity: checking ? 0.6 : 1
                            }}
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
                                    className="w-12 h-12 border-2 rounded-full shadow-lg"
                                    style={{ borderColor: 'rgba(43,108,176,0.28)' }}
                                />
                                <span className="font-orbitron" style={{ color: '#EAF6FF' }}>
                                    {user?.username}
                                </span>
                            </motion.div>

                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 z-20 w-64 mt-2 overflow-hidden rounded-2xl"
                                        style={{ background: 'linear-gradient(180deg, rgba(1,42,74,0.9), rgba(1,58,107,0.9))', border: '2px solid rgba(43,108,176,0.28)' }}
                                    >
                                        <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(43,108,176,0.18)' }}>
                                            <img
                                                src={user?.profilePicture || "/images/df_avatar.png"}
                                                alt="User Avatar"
                                                className="w-12 h-12 border-2 rounded-full"
                                                style={{ borderColor: 'rgba(43,108,176,0.28)' }}
                                            />
                                            <div>
                                                <div style={{ color: '#EAF6FF', fontFamily: 'Orbitron, sans-serif' }}>
                                                    {user?.displayName || user?.username}
                                                </div>
                                                <div className="text-sm" style={{ color: '#CFEFFF', opacity: 0.9 }}>
                                                    {user?.email || "user@example.com"}
                                                </div>
                                            </div>
                                        </div>

                                        <Link
                                            to="/profile"
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-black/10"
                                        >
                                            <div>
                                                <FaUser className="w-5 h-5" style={{ color: '#66D9FF' }} />
                                            </div>
                                            <span style={{ color: '#EAF6FF' }}>
                                                Profile
                                            </span>
                                        </Link>

                                        <Link
                                            to="/dashboard"
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-black/10"
                                        >
                                            <div>
                                                <FaGamepad className="w-5 h-5" style={{ color: '#66D9FF' }} />
                                            </div>
                                            <span style={{ color: '#EAF6FF' }}>
                                                Dashboard
                                            </span>
                                        </Link>

                                        <Link
                                            to="/friends"
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-black/10"
                                        >
                                            <div>
                                                <FaUserFriends className="w-5 h-5" style={{ color: '#66D9FF' }} />
                                            </div>
                                            <span style={{ color: '#EAF6FF' }}>
                                                Friends
                                            </span>
                                        </Link>

                                        {/* Admin link - only shown for admin users */}
                                        {user?.accountType === 'admin' && (
                                            <Link
                                                to="/admin"
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-black/10"
                                            >
                                                <div>
                                                    <FaUserCog className="w-5 h-5" style={{ color: '#66D9FF' }} />
                                                </div>
                                                <span style={{ color: '#EAF6FF' }}>
                                                    Admin Panel
                                                </span>
                                            </Link>
                                        )}

                                        <div style={{ borderTop: '1px solid rgba(43,108,176,0.18)' }} />

                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full gap-3 px-4 py-3 text-left hover:bg-black/10"
                                        >
                                            <div>
                                                <FaSignOutAlt className="w-5 h-5" style={{ color: '#66D9FF' }} />
                                            </div>
                                            <span style={{ color: '#EAF6FF' }}>
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
                    className="p-8 mb-12 rounded-3xl"
                    style={{ background: 'linear-gradient(180deg, rgba(1,42,74,0.85), rgba(1,58,107,0.85))', border: '4px solid rgba(43,108,176,0.28)' }}
                >
                    <h2 className="mb-4 text-2xl font-bold" style={{ color: '#EAF6FF', fontFamily: 'Orbitron, sans-serif' }}>Progress Overview</h2>
                    <div className="flex items-center gap-6">
                        <div className="flex-1">
                            <div className="h-6 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.15)' }}>
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${(unlockedAchievements.length / (achievements.length || 1)) * 100}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    style={{ height: '100%', background: 'linear-gradient(90deg,#0077D6,#0096FF,#66D9FF)', borderRadius: '999px' }}
                                />
                            </div>
                        </div>
                        <span className="text-2xl font-bold" style={{ color: '#66D9FF', fontFamily: 'Orbitron, sans-serif' }}>
                            {unlockedAchievements.length}/{achievements.length}
                        </span>
                    </div>
                </motion.div>

                {/* Unlocked Achievements */}
                {unlockedAchievements.length > 0 && (
                    <div className="mb-16">
                        <h2 className="mb-8 text-2xl font-bold flex items-center gap-2" style={{ color: '#66D9FF', fontFamily: 'Orbitron, sans-serif' }}>
                            <FaCrown style={{ color: '#66D9FF' }} />
                            Unlocked
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {unlockedAchievements.map((achievement, index) => (
                                <motion.div
                                    key={achievement._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="p-6 rounded-3xl relative overflow-hidden"
                                    style={{
                                        background: 'linear-gradient(90deg, rgba(102,217,255,0.08), rgba(0,150,255,0.04))',
                                        border: '4px solid rgba(102,217,255,0.12)',
                                        boxShadow: '0 8px 30px rgba(2,60,100,0.35)'
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="text-5xl drop-shadow-lg" style={{ color: '#66D9FF' }}>{achievement.icon}</span>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold text-white"
                                              style={{ background: 'linear-gradient(90deg,#0077D6,#66D9FF)' }}>
                                            Unlocked
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2" style={{ color: '#EAF6FF' }}>{achievement.name}</h3>
                                    <p className="mb-4" style={{ color: '#CFEFFF' }}>{achievement.description}</p>
                                    <p className="text-sm" style={{ color: '#CFEFFF' }}>Achieved on: <span className="font-semibold" style={{ color: '#A6E7FF' }}>{achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString() : '-'}</span></p>
                                    <div style={{ position: 'absolute', right: 10, top: 10, opacity: 0.06, fontSize: 64, pointerEvents: 'none', userSelect: 'none' }}>🏆</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Locked Achievements */}
                {lockedAchievements.length > 0 && (
                    <div>
                        <h2 className="mb-8 text-2xl font-bold flex items-center gap-2" style={{ color: '#BFD6E9', fontFamily: 'Orbitron, sans-serif' }}>
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-1.414 1.414A9 9 0 105.636 18.364l1.414-1.414" /></svg>
                            Locked
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {lockedAchievements.map((achievement, index) => (
                                <motion.div
                                    key={achievement._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="p-6 rounded-3xl relative overflow-hidden"
                                    style={{
                                        background: 'linear-gradient(180deg, rgba(1,42,74,0.35), rgba(1,58,107,0.25))',
                                        border: '4px solid rgba(43,108,176,0.12)',
                                        boxShadow: '0 8px 30px rgba(0,0,0,0.25)'
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="text-5xl opacity-40">{achievement.icon}</span>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold" style={{ background: 'rgba(8,88,158,0.25)', color: '#EAF6FF' }}>
                                            Locked
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2" style={{ color: '#BFD6E9' }}>{achievement.name}</h3>
                                    <p className="mb-4" style={{ color: '#AFCFE6' }}>{achievement.description}</p>
                                    <div className="h-2 rounded-full mt-4" style={{ background: 'rgba(0,0,0,0.12)' }}>
                                        <div className="h-2 rounded-full" style={{ width: '0%', background: 'rgba(102,217,255,0.12)' }} />
                                    </div>
                                    <p className="text-xs mt-2" style={{ color: '#9FBEDC' }}>Not unlocked yet</p>
                                    <div style={{ position: 'absolute', right: 10, top: 10, opacity: 0.06, fontSize: 64, pointerEvents: 'none', userSelect: 'none' }}>🔒</div>
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
