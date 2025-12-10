import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

const ITEMS_PER_PAGE = 10;

const PaginatedSubmissionsTable = ({ submissions }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'completedAt', direction: 'desc' });

    // Group and filter submissions
    const groupedSubmissions = useMemo(() => {
        if (!Array.isArray(submissions)) return {};

        return submissions
            .filter(submission => {
                const quizTitle = submission?.quizId?.title?.toLowerCase() || '';
                const searchLower = searchTerm.toLowerCase();
                return quizTitle.includes(searchLower);
            })
            .reduce((acc, submission) => {
                if (!submission?.quizId?._id) return acc;

                const quizId = submission.quizId._id;
                if (!acc[quizId]) {
                    acc[quizId] = [];
                }
                acc[quizId].push(submission);
                return acc;
            }, {});
    }, [submissions, searchTerm]);

    // Sort quizzes
    const sortedQuizzes = useMemo(() => {
        return Object.entries(groupedSubmissions).sort((a, b) => {
            const [, submissionsA] = a;
            const [, submissionsB] = b;

            const getLatestDate = (submissions) => {
                return Math.max(...submissions.map(s => new Date(s.completedAt || 0)));
            };

            const dateA = getLatestDate(submissionsA);
            const dateB = getLatestDate(submissionsB);

            return sortConfig.direction === 'desc' ? dateB - dateA : dateA - dateB;
        });
    }, [groupedSubmissions, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(sortedQuizzes.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentQuizzes = sortedQuizzes.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Render pagination controls
    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 || // First page
                i === totalPages || // Last page
                (i >= currentPage - 2 && i <= currentPage + 2) // Pages around current
            ) {
                pages.push(
                    <button
                        key={i}
                        onClick={() => paginate(i)}
                        className={`px-3 py-1 mx-1 rounded ${currentPage === i
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                    >
                        {i}
                    </button>
                );
            } else if (
                (i === currentPage - 3 && currentPage > 4) ||
                (i === currentPage + 3 && currentPage < totalPages - 3)
            ) {
                pages.push(
                    <span key={i} className="px-2">
                        ...
                    </span>
                );
            }
        }
        return pages;
    };

    if (!Object.keys(groupedSubmissions).length) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">Không có bài nộp nào.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-lg shadow">
                <div className="flex-1 min-w-[200px]">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên quiz..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value={5}>5 mỗi trang</option>
                        <option value={10}>10 mỗi trang</option>
                        <option value={20}>20 mỗi trang</option>
                        <option value={50}>50 mỗi trang</option>
                    </select>
                    <button
                        onClick={() => setSortConfig(prev => ({
                            ...prev,
                            direction: prev.direction === 'desc' ? 'asc' : 'desc'
                        }))}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                        Sắp xếp: {sortConfig.direction === 'desc' ? '↓' : '↑'}
                    </button>
                </div>
            </div>

            {/* Quizzes */}
            <div className="space-y-6">
                {currentQuizzes.map(([quizId, quizSubmissions]) => {
                    quizSubmissions.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
                    const latestSubmission = quizSubmissions[0];
                    const scores = quizSubmissions.map(s => s.percentageScore || 0);
                    const highestScore = Math.max(...scores);
                    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

                    return (
                        <div key={quizId} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50 border-b">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">
                                        {latestSubmission.quizId?.title || 'Untitled Quiz'}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span>Số lần làm: {quizSubmissions.length}</span>
                                        <span>•</span>
                                        <span>Điểm cao nhất: {highestScore.toFixed(1)}%</span>
                                        <span>•</span>
                                        <span>Điểm trung bình: {averageScore.toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Lần thử
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Điểm số
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Thời gian hoàn thành
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Chi tiết
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {quizSubmissions.map((submission) => (
                                            <tr key={submission._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    #{submission.attemptNumber || '?'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {submission.correctAnswers || 0}/{submission.totalQuestions || 0}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {(submission.percentageScore || 0).toFixed(1)}%
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {submission.completedAt
                                                        ? new Date(submission.completedAt).toLocaleString()
                                                        : 'N/A'
                                                    }
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {submission._id && (
                                                        <Link
                                                            to={`/results/${submission._id}`}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Xem chi tiết
                                                        </Link>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="px-6 py-4 bg-gray-50 border-t">
                                <Link
                                    to={`/take-quiz/${quizId}`}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Làm lại bài này
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 py-4">
                    <button
                        onClick={() => paginate(1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                        ««
                    </button>
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                        «
                    </button>

                    {renderPagination()}

                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                        »
                    </button>
                    <button
                        onClick={() => paginate(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                        »»
                    </button>
                </div>
            )}
        </div>
    );
};

export default PaginatedSubmissionsTable;