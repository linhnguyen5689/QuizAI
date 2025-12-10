import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Settings,
    LogOut,
} from "lucide-react";

const AdminLayout = ({ children }) => {
    const location = useLocation();

    const menuItems = [
        {
            title: "Dashboard",
            icon: <LayoutDashboard className="h-5 w-5" />,
            path: "/admin",
        },
        {
            title: "Người dùng",
            icon: <Users className="h-5 w-5" />,
            path: "/admin/users",
        },
        {
            title: "Quizzes",
            icon: <BookOpen className="h-5 w-5" />,
            path: "/admin/quizzes",
        },
        {
            title: "Cài đặt",
            icon: <Settings className="h-5 w-5" />,
            path: "/admin/settings",
        },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-lg">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
                </div>
                <nav className="mt-6">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${location.pathname === item.path ? "bg-gray-100 border-r-4 border-blue-500" : ""
                                }`}
                        >
                            {item.icon}
                            <span className="mx-3">{item.title}</span>
                        </Link>
                    ))}
                </nav>
                <div className="absolute bottom-0 w-64 p-6">
                    <button className="flex items-center text-gray-700 hover:text-red-500">
                        <LogOut className="h-5 w-5" />
                        <span className="mx-3">Đăng xuất</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm">
                    <div className="px-6 py-4">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {menuItems.find((item) => item.path === location.pathname)?.title || "Dashboard"}
                        </h2>
                    </div>
                </header>
                <main>{children}</main>
            </div>
        </div>
    );
};

export default AdminLayout; 