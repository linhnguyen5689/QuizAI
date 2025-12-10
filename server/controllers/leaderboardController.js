const User = require('../models/User');
const QuizSubmission = require('../models/QuizSubmission');

// Get leaderboard data based on timeframe and category
exports.getLeaderboard = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const { timeFrame = 'all', category = 'score' } = req.query;

        // Date filter based on timeframe
        let dateFilter = {};
        if (timeFrame !== 'all') {
            const now = new Date();
            const startDate = new Date();
            if (timeFrame === 'weekly') {
                startDate.setDate(now.getDate() - 7);
            } else if (timeFrame === 'monthly') {
                startDate.setMonth(now.getMonth() - 1);
            }
            dateFilter = { submittedAt: { $gte: startDate } };
        }

        // Get all users with their login streaks
        const allUsers = await User.find({}, 'username profilePicture loginStreak lastLoginDate').lean();

        // Get submissions based on date filter
        const submissions = await QuizSubmission.find(dateFilter)
            .populate('userId', 'username profilePicture')
            .lean();

        // Create a map of users with their stats
        const userMap = {};
        allUsers.forEach(user => {
            if (user._id) {
                userMap[user._id.toString()] = {
                    username: user.username,
                    profilePicture: user.profilePicture,
                    loginStreak: user.loginStreak || 0,
                    lastLoginDate: user.lastLoginDate,
                    score: 0,
                    quizzesTaken: 0,
                    totalScore: 0,
                    totalCorrect: 0,
                    totalQuestions: 0,
                    totalTime: 0
                };
            }
        });

        // Update stats from submissions
        submissions.forEach(sub => {
            if (!sub.userId || !sub.userId._id) return;

            const userId = sub.userId._id.toString();
            const userStats = userMap[userId];
            if (!userStats) return;

            userStats.score += (sub.score || 0);
            userStats.quizzesTaken += 1;
            userStats.totalScore += (sub.score || 0);
            userStats.totalCorrect += (sub.correctAnswers || 0);
            userStats.totalQuestions += (sub.totalQuestions || 0);
            userStats.totalTime += (sub.timeSpent || 0);
        });

        // Convert to array and calculate final stats
        let leaderboard = Object.entries(userMap).map(([userId, user]) => ({
            username: user.username,
            profilePicture: user.profilePicture,
            score: user.totalScore,
            quizzesTaken: user.quizzesTaken,
            loginStreak: user.loginStreak,
            accuracy: user.totalQuestions > 0
                ? Math.round((user.totalCorrect / user.totalQuestions) * 100) + '%'
                : '0%',
            totalTime: user.totalTime
        }));

        // Sort based on category
        switch (category) {
            case 'score':
                leaderboard.sort((a, b) => (b.score || 0) - (a.score || 0));
                break;
            case 'accuracy':
                leaderboard.sort((a, b) => {
                    const accA = parseInt(a.accuracy) || 0;
                    const accB = parseInt(b.accuracy) || 0;
                    return accB - accA;
                });
                break;
            case 'quizzes':
                leaderboard.sort((a, b) => (b.quizzesTaken || 0) - (a.quizzesTaken || 0));
                break;
            case 'streak':
                leaderboard.sort((a, b) => {
                    const streakDiff = (b.loginStreak || 0) - (a.loginStreak || 0);
                    return streakDiff !== 0 ? streakDiff : a.username.localeCompare(b.username);
                });
                break;
        }

        // Calculate overall stats
        const totalParticipants = allUsers.length;
        const totalQuizzesTaken = submissions.length;
        let totalCorrect = 0;
        let totalQuestions = 0;
        submissions.forEach(sub => {
            totalCorrect += (sub.correctAnswers || 0);
            totalQuestions += (sub.totalQuestions || 0);
        });

        const averageScore = totalQuestions > 0
            ? Math.round((totalCorrect / totalQuestions) * 100)
            : 0;

        // Apply pagination
        const totalUsers = leaderboard.length;
        const totalPages = Math.ceil(totalUsers / limit);
        const paginatedLeaderboard = leaderboard.slice(skip, skip + limit);

        res.json({
            success: true,
            data: {
                topScorers: paginatedLeaderboard,
                stats: {
                    totalParticipants,
                    totalQuizzesTaken,
                    averageScore,
                },
                pagination: {
                    page,
                    limit,
                    totalUsers,
                    totalPages
                }
            }
        });

    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leaderboard data'
        });
    }
};
