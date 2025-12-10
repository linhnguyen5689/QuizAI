import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar } from 'react-icons/fa';
import PropTypes from 'prop-types';
import { addRating } from '../../services/api';
import toast from 'react-hot-toast';

const RatingForm = ({ quizId, onRatingSubmitted }) => {
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
            const response = await addRating(quizId, rating, comment);

            toast.success('Đánh giá của bạn đã được ghi nhận!');
            setComment('');
            setRating(0);

            if (onRatingSubmitted) {
                onRatingSubmitted(response.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đã xảy ra lỗi khi gửi đánh giá');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 backdrop-blur-lg bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 rounded-2xl border-2 border-pink-400/30 shadow-xl"
        >
            <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 bg-clip-text mb-4 font-orbitron">
                Đánh giá Quiz này
            </h3>

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col space-y-4">
                    {/* Star Rating */}
                    <div className="mb-4">
                        <p className="text-pink-200 mb-2 font-orbitron">Đánh giá của bạn:</p>
                        <div className="flex space-x-1">
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
                                            className="transition-colors duration-200 hover:scale-110"
                                            color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                                            size={32}
                                            onMouseEnter={() => setHover(ratingValue)}
                                            onMouseLeave={() => setHover(0)}
                                        />
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="mb-4">
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

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isSubmitting}
                        className={`inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-xl text-white bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 hover:from-pink-400 hover:to-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-300 font-orbitron ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            </form>
        </motion.div>
    );
};

RatingForm.propTypes = {
    quizId: PropTypes.string.isRequired,
    onRatingSubmitted: PropTypes.func
};

export default RatingForm; 