import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { FaTimes, FaStar } from 'react-icons/fa';
import { addRating } from '../../services/api';
import toast from 'react-hot-toast';

const RatingModal = ({ isOpen, onClose, quizId, quizTitle }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Vui lòng chọn số sao đánh giá');
            return;
        }

        try {
            setIsSubmitting(true);
            await addRating(quizId, rating, comment);

            toast.success('Cảm ơn bạn đã đánh giá quiz!');
            setComment('');
            setRating(0);

            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đã xảy ra lỗi khi gửi đánh giá');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        onClose();
    };

    const backdrop = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const modal = {
        hidden: { opacity: 0, scale: 0.9, y: 50 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 300, damping: 25 }
        },
        exit: {
            opacity: 0,
            scale: 0.9,
            y: 50,
            transition: { duration: 0.2 }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={backdrop}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-900/80 backdrop-blur-sm p-4"
                >
                    <motion.div
                        variants={modal}
                        className="w-full max-w-md p-6 rounded-2xl bg-gradient-to-br from-indigo-800 via-purple-800 to-pink-800 shadow-2xl border-2 border-pink-400/30"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text font-orbitron">
                                Đánh giá Quiz
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-pink-300 hover:text-white transition-colors p-1"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <p className="text-pink-200 mb-6 font-orbitron">
                            Bạn đã hoàn thành "{quizTitle}". Hãy để lại đánh giá để giúp người khác biết về trải nghiệm của bạn!
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col space-y-4">
                                {/* Star Rating */}
                                <div className="mb-4">
                                    <p className="text-pink-200 mb-2 font-orbitron">Đánh giá của bạn:</p>
                                    <div className="flex justify-center space-x-3">
                                        {[...Array(5)].map((_, index) => {
                                            const ratingValue = index + 1;

                                            return (
                                                <label key={index} className="cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="rating"
                                                        className="hidden"
                                                        value={ratingValue}
                                                        onClick={() => setRating(ratingValue)}
                                                    />
                                                    <FaStar
                                                        className="transition-colors duration-200 hover:scale-125"
                                                        color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                                                        size={40}
                                                        onMouseEnter={() => setHover(ratingValue)}
                                                        onMouseLeave={() => setHover(0)}
                                                    />
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Comment */}
                                <div className="mb-6">
                                    <label htmlFor="comment" className="block text-pink-200 mb-2 font-orbitron">
                                        Nhận xét (không bắt buộc):
                                    </label>
                                    <textarea
                                        id="comment"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Chia sẻ cảm nhận của bạn về quiz này..."
                                        className="w-full p-3 bg-indigo-900/50 border border-pink-400/30 rounded-xl text-white placeholder-pink-300/50 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                                        rows="3"
                                    ></textarea>
                                </div>

                                {/* Buttons */}
                                <div className="flex space-x-3">
                                    <motion.button
                                        type="button"
                                        onClick={handleSkip}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex-1 py-3 px-4 border border-pink-400/30 rounded-xl text-pink-200 hover:bg-indigo-900/50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-300 font-orbitron"
                                    >
                                        Bỏ qua
                                    </motion.button>

                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        disabled={isSubmitting}
                                        className={`flex-1 py-3 px-4 rounded-xl text-white bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 hover:from-pink-400 hover:to-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-300 font-orbitron ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Đang gửi...
                                            </>
                                        ) : (
                                            'Gửi đánh giá'
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

RatingModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    quizId: PropTypes.string.isRequired,
    quizTitle: PropTypes.string.isRequired
};

export default RatingModal; 