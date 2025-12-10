import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';

const QuizCard = ({ quiz, onDelete, showCreator = false, isCreator }) => {
  const navigate = useNavigate();

  // Console log when component renders
  console.log('QuizCard rendering:', {
    title: quiz.title,
    id: quiz._id,
    createdBy: quiz.createdBy,
    showCreator,
    isCreator
  });

  // Helper function to get the creator's name
  const getCreatorName = () => {
    if (!quiz.createdBy) {
      console.log(`Quiz "${quiz.title}": No createdBy, returning Unknown`);
      return 'Unknown';
    }

    console.log(`Quiz "${quiz.title}": createdBy type=${typeof quiz.createdBy}, value=`, quiz.createdBy);

    // Trường hợp 1: createdBy là object
    if (typeof quiz.createdBy === 'object' && quiz.createdBy !== null) {
      // Trường hợp có displayName hoặc username
      if (quiz.createdBy.displayName || quiz.createdBy.username) {
        return quiz.createdBy.displayName || quiz.createdBy.username;
      }

      // Có thể là object với child objects khác
      if (quiz.createdBy.user && typeof quiz.createdBy.user === 'object') {
        return quiz.createdBy.user.displayName || quiz.createdBy.user.username || 'Unknown';
      }

      // Chỉ có _id
      return 'User ' + (quiz.createdBy._id ? quiz.createdBy._id.substring(0, 5) : 'Unknown');
    }

    // Trường hợp 2: createdBy là string (userId)
    if (typeof quiz.createdBy === 'string') {
      return 'User ' + quiz.createdBy.substring(0, 5);
    }

    // Mặc định là Unknown
    return 'Unknown';
  };

  return (
    <div className="relative quiz-card bg-gradient-to-br from-indigo-800/90 via-purple-800/90 to-pink-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-pink-400/40 hover:shadow-[0_0_40px_10px_rgba(236,72,153,0.7)] transition-all duration-500 group">
      <div className="p-6 h-full">
        {/* Header row with title and status badge */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-transparent font-orbitron bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 pr-2 flex-1 overflow-hidden text-ellipsis whitespace-nowrap" title={quiz.title}>
            {quiz.title}
          </h3>
          <div className="flex items-center flex-shrink-0">
            {/* Status badge - Public/Private */}
            <div className="mr-2">
              {quiz.isPublic ? (
                <span className="inline-block px-3 py-1 text-sm text-green-800 bg-green-100 rounded-full font-orbitron">
                  Public
                </span>
              ) : (
                <span className="inline-block px-3 py-1 text-sm text-blue-800 bg-blue-100 rounded-full font-orbitron">
                  Private
                </span>
              )}
            </div>

            {/* Edit and Delete buttons - Only shown when isCreator=true (My Quizzes tab) */}
            {isCreator && (
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/edit-quiz/${quiz._id}`)}
                  className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors rounded-full hover:bg-yellow-400/20 bg-black/30 border border-yellow-400/30"
                  title="Edit Quiz"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete && onDelete(quiz._id)}
                  className="p-2 text-pink-400 hover:text-pink-300 transition-colors rounded-full hover:bg-pink-400/20 bg-black/30 border border-pink-400/30"
                  title="Delete Quiz"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quiz description with ellipsis */}
        <p className="text-pink-200 mb-4 font-orbitron overflow-hidden text-ellipsis whitespace-nowrap" title={quiz.description}>
          {quiz.description || 'No description provided'}
        </p>

        <div className="text-pink-200 mb-4 font-orbitron">
          {quiz.questions ? `${quiz.questions.length} questions` : "Loading questions..."}
        </div>

        {showCreator && quiz.createdBy && (
          <div className="text-sm text-pink-200 mb-4 font-orbitron">
            Created by: {getCreatorName()}
          </div>
        )}

        <div className="flex justify-center mt-4">
          <Link
            to={`/quiz/${quiz._id}`}
            className="w-full px-6 py-2 text-center text-white transition-all duration-300 font-orbitron bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-xl hover:from-pink-400 hover:to-yellow-400"
          >
            Take Quiz
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuizCard;