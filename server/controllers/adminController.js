const User = require('../models/User');
const Quiz = require('../models/Quiz');

// Lấy danh sách tất cả user
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-passwordHash');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error getting users' });
    }
};

// Xóa user theo id
const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
};

// Lấy tất cả quiz
const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find();
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: 'Error getting quizzes' });
    }
};

// Xóa quiz theo id
const deleteQuiz = async (req, res) => {
    try {
        await Quiz.findByIdAndDelete(req.params.id);
        res.json({ message: 'Quiz deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting quiz' });
    }
};

// Cập nhật quyền (accountType) cho user
const updateUserPermission = async (req, res) => {
    try {
        const { userId, accountType } = req.body;

        // Kiểm tra nếu accountType hợp lệ
        if (!['standard', 'admin'].includes(accountType)) {
            return res.status(400).json({ message: 'Invalid account type' });
        }

        // Không cho phép tự thay đổi quyền của chính mình
        if (userId === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot change your own permissions' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { accountType },
            { new: true }
        ).select('-passwordHash');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            user: updatedUser,
            message: `User ${updatedUser.username} updated to ${accountType} successfully`
        });
    } catch (error) {
        console.error('Error updating user permission:', error);
        res.status(500).json({ message: 'Error updating user permission' });
    }
};

// Thống kê số lượng user và quiz
const getStats = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const quizCount = await Quiz.countDocuments();
        res.json({ userCount, quizCount });
    } catch (error) {
        res.status(500).json({ message: 'Error getting stats' });
    }
};

module.exports = {
    getAllUsers,
    deleteUser,
    getAllQuizzes,
    deleteQuiz,
    updateUserPermission,
    getStats
};