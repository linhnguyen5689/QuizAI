import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaTrophy, FaFire, FaStar, FaUsers } from "react-icons/fa";
import { getPublicQuizzes } from "../../services/api";
import toast from "react-hot-toast";
import SearchBar from "../SearchBar";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function PublicQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch actual public quizzes from the API
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await getPublicQuizzes();

        // Format quizzes with required properties
        const formattedQuizzes = response.data.map(quiz => {
          let icon;

          // Assign icons based on category or rating
          if (quiz.averageRating >= 4.5) {
            icon = <FaTrophy className="w-5 h-5" />;
          } else if (quiz.ratingsCount >= 5) {
            icon = <FaFire className="w-5 h-5" />;
          } else {
            icon = <FaStar className="w-5 h-5" />;
          }

          // Format difficulty based on question count
          let difficulty = "Easy";
          const questionCount = quiz.questions?.length || 0;

          if (questionCount >= 15) {
            difficulty = "Hard";
          } else if (questionCount >= 8) {
            difficulty = "Medium";
          }

          // Return formatted quiz
          return {
            ...quiz,
            id: quiz._id,
            icon,
            difficulty,
            participants: quiz.ratingsCount || 0,
            rating: quiz.averageRating || 0
          };
        });

        setQuizzes(formattedQuizzes);
        setFilteredQuizzes(formattedQuizzes);
      } catch (error) {
        console.error("Error fetching public quizzes:", error);
        toast.error("Không thể tải danh sách quiz công khai");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  // Handle search
  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredQuizzes(quizzes);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = quizzes.filter(quiz =>
      quiz.title.toLowerCase().includes(searchLower) ||
      quiz.description?.toLowerCase().includes(searchLower) ||
      quiz.category?.toLowerCase().includes(searchLower)
    );
    setFilteredQuizzes(filtered);
  };

  // Function to render star ratings
  const renderStarRating = (rating) => {
    const starCount = 5;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center">
        {[...Array(starCount)].map((_, i) => {
          if (i < fullStars) {
            return <FaStar key={i} className="text-yellow-400 w-4 h-4" />;
          } else if (i === fullStars && hasHalfStar) {
            return (
              <div key={i} className="relative">
                <FaStar className="text-gray-300 w-4 h-4" />
                <div className="absolute inset-0 overflow-hidden w-1/2">
                  <FaStar className="text-yellow-400 w-4 h-4" />
                </div>
              </div>
            );
          } else {
            return <FaStar key={i} className="text-gray-300 w-4 h-4" />;
          }
        })}
      </div>
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="relative"
    >
      <div className="px-6 py-12 mx-auto max-w-7xl">
        <motion.div
          variants={itemVariants}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
            Quiz Nổi Bật
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Khám phá và thử thách bản thân với những quiz phổ biến nhất của chúng tôi
          </p>
        </motion.div>

        {/* Add SearchBar */}
        <SearchBar onSearch={handleSearch} placeholder="Search Quiz by name..." />

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="text-center py-12"
          >
            <p className="text-gray-600 text-lg">Không tìm thấy quiz nào phù hợp với tìm kiếm của bạn.</p>
          </motion.div>
        ) : (
          <div className="grid gap-8 mt-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredQuizzes.map((quiz) => (
              <motion.div
                key={quiz.id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group relative p-6 transition-all duration-300 bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl"
              >
                {/* Category Badge */}
                <div className="absolute top-4 right-4">
                  <span className="flex items-center px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full">
                    {quiz.icon}
                    <span className="ml-2">{quiz.category}</span>
                  </span>
                </div>

                {/* Content */}
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                    {quiz.title}
                  </h3>
                  <p className="mt-2 text-gray-600 line-clamp-2">
                    {quiz.description || "Thử sức với quiz này để kiểm tra kiến thức của bạn."}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {renderStarRating(quiz.rating)}
                      </div>
                      <span className="ml-1 font-medium text-indigo-600">{quiz.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaUsers className="text-indigo-500" />
                      <span className="font-medium text-indigo-600">{quiz.participants}</span>
                      <span>{quiz.participants === 1 ? 'người đánh giá' : 'người đánh giá'}</span>
                    </div>
                  </div>

                  {/* Difficulty Badge */}
                  <div className="mt-4">
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${quiz.difficulty === 'Hard'
                      ? 'text-red-600 bg-red-50'
                      : quiz.difficulty === 'Medium'
                        ? 'text-yellow-600 bg-yellow-50'
                        : 'text-green-600 bg-green-50'
                      }`}>
                      {quiz.difficulty === 'Hard'
                        ? 'Khó'
                        : quiz.difficulty === 'Medium'
                          ? 'Trung bình'
                          : 'Dễ'
                      }
                    </span>
                  </div>

                  {/* Action Button */}
                  <div className="mt-6">
                    <motion.a
                      href={`/quiz/${quiz.id}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white transition-all duration-300 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Làm Quiz
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* View All Button */}
        {filteredQuizzes.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="mt-12 text-center"
          >
            <motion.a
              href="/quizzes"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-6 py-3 text-sm font-medium text-white transition-all duration-300 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl"
            >
              Xem Tất Cả Quiz
            </motion.a>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
