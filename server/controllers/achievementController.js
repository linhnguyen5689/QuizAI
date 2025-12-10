const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const Submission = require('../models/Submission');
const Quiz = require('../models/Quiz');

// Initialize achievements if they don't exist
const initializeAchievements = async () => {
    const defaultAchievements = [
        {
            name: "Beginner",
            description: "Complete your first quiz",
            icon: "🎯",
            criteria: { type: "QUIZ_COUNT", value: 1 }
        },
        {
            name: "Quiz Master",
            description: "Complete 10 different quizzes",
            icon: "🏆",
            criteria: { type: "QUIZ_COUNT", value: 10 }
        },
        {
            name: "Perfect Scholar",
            description: "Get a perfect score in a quiz",
            icon: "⭐",
            criteria: { type: "PERFECT_SCORE", value: 100 }
        },
        {
            name: "Diligent Learner",
            description: "Complete 50 quiz attempts",
            icon: "📚",
            criteria: { type: "SUBMISSIONS_COUNT", value: 50 }
        },
        {
            name: "High Achiever",
            description: "Score above 90% in 5 consecutive quizzes",
            icon: "🌟",
            criteria: { type: "HIGH_SCORE", value: 90 }
        }
    ];

    for (const achievement of defaultAchievements) {
        await Achievement.findOneAndUpdate(
            { name: achievement.name },
            achievement,
            { upsert: true, new: true }
        );
    }
};

// Get achievements for a user
exports.getUserAchievements = async (req, res) => {
    try {
        await exports.checkAndUpdateAchievements(req.user._id);

        const userAchievements = await UserAchievement.find({ userId: req.user._id })
            .populate('achievementId')
            .sort('-unlockedAt');

        const allAchievements = await Achievement.find();

        const achievements = allAchievements.map(achievement => {
            const userAchievement = userAchievements.find(
                ua => ua.achievementId._id.toString() === achievement._id.toString()
            );

            return {
                ...achievement.toObject(),
                unlocked: !!userAchievement,
                unlockedAt: userAchievement ? userAchievement.unlockedAt : null
            };
        });

        res.json({
            success: true,
            data: achievements
        });
    } catch (error) {
        console.error('Error getting user achievements:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update achievement
exports.updateAchievement = async (req, res) => {
    try {
        const { id } = req.params;
        const achievement = await Achievement.findByIdAndUpdate(
            id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        if (!achievement) {
            return res.status(404).json({
                success: false,
                message: 'Achievement not found'
            });
        }

        res.json({
            success: true,
            data: achievement
        });
    } catch (error) {
        console.error('Error updating achievement:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Manual check for user achievements
exports.checkUserAchievements = async (req, res) => {
    try {
        await exports.checkAndUpdateAchievements(req.user._id);
        res.json({
            success: true,
            message: 'Achievements checked and updated successfully'
        });
    } catch (error) {
        console.error('Error checking achievements:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Check and update achievements for a user
exports.checkAndUpdateAchievements = async (userId) => {
    try {
        const achievements = await Achievement.find();
        const userStats = await getUserStats(userId);

        for (const achievement of achievements) {
            const hasAchievement = await UserAchievement.findOne({
                userId,
                achievementId: achievement._id
            });

            if (!hasAchievement) {
                const shouldUnlock = await checkAchievementCriteria(achievement, userStats);
                if (shouldUnlock) {
                    await UserAchievement.create({
                        userId,
                        achievementId: achievement._id
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error checking achievements:', error);
        throw error;
    }
};

// Get user statistics for achievement checking
const getUserStats = async (userId) => {
    const submissions = await Submission.find({ userId })
        .sort('-completedAt')
        .populate('quizId');

    // Filter out submissions with null quizId to avoid .toString() error
    const validSubmissions = submissions.filter(s => s.quizId);
    const uniqueQuizIds = new Set(validSubmissions.map(s => s.quizId.toString()));
    const recentSubmissions = submissions.slice(0, 5);

    // Calculate percentage scores for recent submissions
    const recentSubmissionsWithPercentage = recentSubmissions.map(submission => ({
        ...submission.toObject(),
        percentageScore: (submission.score / submission.totalQuestions) * 100
    }));

    return {
        quizCount: uniqueQuizIds.size,
        submissionsCount: submissions.length,
        hasRecentPerfectScore: submissions.some(s => (s.score / s.totalQuestions) * 100 === 100),
        recentAverageScore: recentSubmissionsWithPercentage.length > 0
            ? recentSubmissionsWithPercentage.reduce((sum, s) => sum + s.percentageScore, 0) / recentSubmissionsWithPercentage.length
            : 0
    };
};

// Check if a user meets the criteria for an achievement
const checkAchievementCriteria = async (achievement, userStats) => {
    switch (achievement.criteria.type) {
        case 'QUIZ_COUNT':
            return userStats.quizCount >= achievement.criteria.value;
        case 'PERFECT_SCORE':
            return userStats.hasRecentPerfectScore;
        case 'SUBMISSIONS_COUNT':
            return userStats.submissionsCount >= achievement.criteria.value;
        case 'HIGH_SCORE':
            return userStats.recentAverageScore >= achievement.criteria.value;
        default:
            return false;
    }
};

// Initialize achievements when server starts
initializeAchievements().catch(console.error);