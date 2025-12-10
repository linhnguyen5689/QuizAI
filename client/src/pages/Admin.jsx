import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaEdit, FaUsersCog, FaBook, FaArrowLeft, FaGamepad, FaStar, FaUserShield } from "react-icons/fa";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import { getAllUsers, deleteUserById, getAllQuizzes, deleteQuizById, updateUserPermission } from "../services/api";

const Admin = ({ user }) => {
    const [users, setUsers] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [activeTab, setActiveTab] = useState("users");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeTab === "users") {
                    const response = await getAllUsers();
                    if (response.success) {
                        setUsers(response.data);
                    } else {
                        throw new Error(response.message || "Failed to load users");
                    }
                } else {
                    const response = await getAllQuizzes();
                    if (response.success) {
                        setQuizzes(response.data);
                    } else {
                        throw new Error(response.message || "Failed to load quizzes");
                    }
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching admin data:", error);
                setError(error.message || "An error occurred. Please try again.");
                setLoading(false);
            }
        };

        fetchData();
    }, [activeTab]);

    const handleDeleteUser = async (userId) => {
        if (userId === user._id) {
            toast.error("You cannot delete yourself!");
            return;
        }

        if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            try {
                const response = await deleteUserById(userId);
                if (response.success) {
                    setUsers(users.filter(u => u._id !== userId));
                    toast.success("User deleted successfully");
                } else {
                    throw new Error(response.message || "Failed to delete user");
                }
            } catch (error) {
                console.error("Error deleting user:", error);
                toast.error(error.message || "Failed to delete user");
            }
        }
    };

    const handleUpdatePermission = async (userId, currentAccountType) => {
        if (userId === user._id) {
            toast.error("You cannot change your own permissions!");
            return;
        }

        const newAccountType = currentAccountType === 'admin' ? 'standard' : 'admin';
        const confirmMessage = newAccountType === 'admin'
            ? "Are you sure you want to grant admin privileges to this user?"
            : "Are you sure you want to remove admin privileges from this user?";

        if (window.confirm(confirmMessage)) {
            try {
                const response = await updateUserPermission(userId, newAccountType);
                if (response.success) {
                    // Cập nhật danh sách người dùng trong state
                    setUsers(users.map(u =>
                        u._id === userId ? { ...u, accountType: newAccountType } : u
                    ));
                    toast.success(response.message || "User permissions updated successfully");
                } else {
                    throw new Error(response.message || "Failed to update user permissions");
                }
            } catch (error) {
                console.error("Error updating user permissions:", error);
                toast.error(error.message || "Failed to update user permissions");
            }
        }
    };

    const handleDeleteQuiz = async (quizId) => {
        if (window.confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
            try {
                const response = await deleteQuizById(quizId);
                if (response && response.success) {
                    setQuizzes(prevQuizzes => prevQuizzes.filter(q => q._id !== quizId));
                    toast.success(response.message || "Quiz deleted successfully");
                } else {
                    throw new Error(response.message || "Failed to delete quiz");
                }
            } catch (error) {
                console.error("Error deleting quiz:", error);
                toast.error(error.message || "Failed to delete quiz");
            }
        }
    };

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
                    <div className="flex items-center gap-2">
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-2 text-pink-200 hover:text-white transition-all"
                        >
                            <FaArrowLeft />
                            <span className="font-orbitron">Back to Dashboard</span>
                        </Link>
                    </div>
                    <h1 className="flex items-center gap-3 text-4xl font-extrabold text-transparent md:text-5xl font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 drop-shadow-lg">
                        <FaUsersCog className="inline-block text-yellow-300 animate-bounce" />
                        Admin Panel
                        <FaStar className="inline-block text-pink-300 animate-spin-slow" />
                    </h1>
                    <div></div> {/* Empty div for flex justify-between */}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="p-2 mb-8 border-2 shadow-2xl tab-container bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-2xl border-pink-400/40"
                >
                    <button
                        className={`tab-button ${activeTab === "users" ? "active" : ""}`}
                        onClick={() => setActiveTab("users")}
                    >
                        <FaUsersCog className="w-5 h-5" />
                        Users Management
                    </button>
                    <button
                        className={`tab-button ${activeTab === "quizzes" ? "active" : ""}`}
                        onClick={() => setActiveTab("quizzes")}
                    >
                        <FaBook className="w-5 h-5" />
                        Quiz Management
                    </button>
                </motion.div>

                <AnimatePresence mode="wait">
                    {activeTab === "users" ? (
                        <motion.div
                            key="users"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="mb-6 text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                                User Management
                            </h2>

                            <div className="overflow-x-auto border-4 rounded-xl border-pink-400/40 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                                <table className="w-full overflow-hidden bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl">
                                    <thead className="bg-black/20">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-pink-200 uppercase font-orbitron">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-pink-200 uppercase font-orbitron">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-pink-200 uppercase font-orbitron">
                                                Account Type
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-pink-200 uppercase font-orbitron">
                                                Registration Date
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-pink-200 uppercase font-orbitron">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-pink-400/20">
                                        {users.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-4 text-center text-pink-200 font-orbitron">
                                                    No users found
                                                </td>
                                            </tr>
                                        ) : (
                                            users.map((userData) => (
                                                <tr key={userData._id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 w-10 h-10">
                                                                <img
                                                                    className="object-cover w-10 h-10 rounded-full border-2 border-pink-400/40"
                                                                    src={userData.profilePicture || "/images/df_avatar.png"}
                                                                    alt={userData.username}
                                                                />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-pink-200 font-orbitron">
                                                                    {userData.username}
                                                                </div>
                                                                <div className="text-sm text-pink-300/80 font-orbitron">
                                                                    {userData.displayName || "No display name"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-pink-200 font-orbitron">
                                                        {userData.email}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-orbitron">
                                                        <span
                                                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                            ${userData.accountType === "admin"
                                                                    ? "bg-yellow-500/30 text-yellow-100"
                                                                    : "bg-green-500/30 text-green-100"}`}
                                                        >
                                                            {userData.accountType}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-pink-200 font-orbitron">
                                                        {new Date(userData.registrationDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleUpdatePermission(userData._id, userData.accountType)}
                                                                disabled={userData._id === user._id}
                                                                className={`p-2 rounded-full ${userData._id === user._id
                                                                    ? 'bg-gray-500/30 text-gray-400 cursor-not-allowed'
                                                                    : 'bg-indigo-500/30 text-indigo-300 hover:bg-indigo-600/50 hover:text-indigo-100'
                                                                    } transition-colors`}
                                                                title={userData.accountType === "admin" ? "Remove admin privileges" : "Grant admin privileges"}
                                                            >
                                                                <FaUserShield className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(userData._id)}
                                                                disabled={userData._id === user._id}
                                                                className={`p-2 rounded-full ${userData._id === user._id
                                                                    ? 'bg-gray-500/30 text-gray-400 cursor-not-allowed'
                                                                    : 'bg-red-500/30 text-red-300 hover:bg-red-600/50 hover:text-red-100'
                                                                    } transition-colors`}
                                                                title="Delete user"
                                                            >
                                                                <FaTrash className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="quizzes"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="mb-6 text-2xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500">
                                Quiz Management
                            </h2>

                            <div className="overflow-x-auto border-4 rounded-xl border-pink-400/40 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                                <table className="w-full overflow-hidden bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl">
                                    <thead className="bg-black/20">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-pink-200 uppercase font-orbitron">
                                                Title
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-pink-200 uppercase font-orbitron">
                                                Creator
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-pink-200 uppercase font-orbitron">
                                                Creation Date
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-pink-200 uppercase font-orbitron">
                                                Questions
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-pink-200 uppercase font-orbitron">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-pink-400/20">
                                        {quizzes.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-4 text-center text-pink-200 font-orbitron">
                                                    No quizzes found
                                                </td>
                                            </tr>
                                        ) : (
                                            quizzes.map((quizData) => (
                                                <tr key={quizData._id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-pink-200 font-orbitron">
                                                            {quizData.title}
                                                        </div>
                                                        <div className="text-sm text-pink-300/80 font-orbitron">
                                                            {quizData.description?.substring(0, 50)}
                                                            {quizData.description?.length > 50 ? "..." : ""}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-pink-200 font-orbitron">{quizData.createdBy?.username || "Unknown"}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-pink-200 whitespace-nowrap font-orbitron">
                                                        {new Date(quizData.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-pink-200 whitespace-nowrap font-orbitron">
                                                        {quizData.questions?.length || 0}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                        <div className="flex items-center space-x-3">
                                                            <motion.Link
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                to={`/quiz/${quizData._id}`}
                                                                className="text-indigo-400 hover:text-indigo-300 transition-colors"
                                                            >
                                                                <FaEdit />
                                                            </motion.Link>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleDeleteQuiz(quizData._id)}
                                                                className="text-red-400 hover:text-red-300 transition-colors"
                                                            >
                                                                <FaTrash />
                                                            </motion.button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Admin; 