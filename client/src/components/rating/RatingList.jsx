import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaUser, FaTrash } from 'react-icons/fa';
import PropTypes from 'prop-types';
import { getQuizRatings, deleteRating } from '../../services/api';
import toast from 'react-hot-toast';

const RatingList = ({ quizId, newRating, currentUserId }) => {
    const [ratings, setRatings] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [ratingsCount, setRatingsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRatings();
    }, [quizId, newRating]);

    const fetchRatings = async () => {
        try {
            setLoading(true);
            const response = await getQuizRatings(quizId);

            if (response.success) {
                setRatings(response.data.ratings);
                setAverageRating(response.data.averageRating);
                setRatingsCount(response.data.ratingsCount);
            } else {
                throw new Error('Không thể tải đánh giá');
            }
        } catch (error) {
            console.error('Error fetching ratings:', error);
            setError(error.message || 'Đã xảy ra lỗi khi tải đánh giá');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRating = async (ratingId) => {
        if (window.confirm('Bạn có chắc muốn xóa đánh giá này không?')) {
            try {
                await deleteRating(ratingId);
                toast.success('Đã xóa đánh giá thành công');
                fetchRatings(); // Refresh danh sách đánh giá
            } catch (error) {
                toast.error(error.response?.data?.message || 'Đã xảy ra lỗi khi xóa đánh giá');
            }
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4
            }
        }
    };

    if (loading) {
        return (
            <div className="p-6 backdrop-blur-lg bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 rounded-2xl border-2 border-pink-400/30 shadow-xl">
                <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text mb-4 font-orbitron">
                    Đánh giá từ người dùng
                </h3>
                <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 backdrop-blur-lg bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 rounded-2xl border-2 border-pink-400/30 shadow-xl">
                <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text mb-4 font-orbitron">
                    Đánh giá từ người dùng
                </h3>
                <p className="text-pink-200 font-orbitron">{error}</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 backdrop-blur-lg bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 rounded-2xl border-2 border-pink-400/30 shadow-xl"
        >
            <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text mb-4 font-orbitron">
                Đánh giá từ người dùng
            </h3>

            {/* Số sao trung bình */}
            <div className="flex items-center mb-6 bg-indigo-900/50 p-4 rounded-xl">
                <div className="flex items-center mr-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                            key={star}
                            size={24}
                            color={star <= Math.round(averageRating) ? "#ffc107" : "#e4e5e9"}
                            className="mr-1"
                        />
                    ))}
                </div>
                <div className="font-orbitron">
                    <span className="text-2xl font-bold text-white">{averageRating.toFixed(1)}</span>
                    <span className="text-pink-200 ml-2">({ratingsCount} đánh giá)</span>
                </div>
            </div>

            {/* Danh sách đánh giá */}
            {ratings.length === 0 ? (
                <p className="text-center text-pink-200 py-4 font-orbitron">Chưa có đánh giá nào cho quiz này</p>
            ) : (
                <motion.ul
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                >
                    {ratings.map((ratingItem) => (
                        <motion.li
                            key={ratingItem._id}
                            variants={itemVariants}
                            className="bg-indigo-900/40 rounded-xl p-4 border border-pink-400/20"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start">
                                    <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center mr-3">
                                        {ratingItem.userId.avatar ? (
                                            <img src={ratingItem.userId.avatar} alt="User" className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <FaUser />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white font-orbitron">
                                            {ratingItem.userId.fullName}
                                        </p>
                                        <p className="text-xs text-pink-200 mt-1 font-orbitron">
                                            {formatDate(ratingItem.createdAt)}
                                        </p>
                                        <div className="flex mt-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <FaStar
                                                    key={star}
                                                    size={16}
                                                    color={star <= ratingItem.rating ? "#ffc107" : "#e4e5e9"}
                                                    className="mr-1"
                                                />
                                            ))}
                                        </div>
                                        {ratingItem.comment && (
                                            <p className="mt-2 text-white">{ratingItem.comment}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Delete button for user's own ratings */}
                                {currentUserId && ratingItem.userId._id === currentUserId && (
                                    <button
                                        onClick={() => handleDeleteRating(ratingItem._id)}
                                        className="text-pink-300 hover:text-pink-100 transition-colors"
                                        title="Xóa đánh giá"
                                    >
                                        <FaTrash />
                                    </button>
                                )}
                            </div>
                        </motion.li>
                    ))}
                </motion.ul>
            )}
        </motion.div>
    );
};

RatingList.propTypes = {
    quizId: PropTypes.string.isRequired,
    newRating: PropTypes.object,
    currentUserId: PropTypes.string
};

export default RatingList; 