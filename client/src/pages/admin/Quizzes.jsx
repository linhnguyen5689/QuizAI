import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Plus } from "lucide-react";

const Quizzes = () => {
    const [searchQuery, setSearchQuery] = useState("");

    // Mock data - sẽ được thay thế bằng API call
    const quizzes = [
        {
            id: 1,
            title: "Kiểm tra kiến thức JavaScript",
            category: "Programming",
            difficulty: "Medium",
            questions: 20,
            status: "Published"
        },
        {
            id: 2,
            title: "HTML & CSS cơ bản",
            category: "Web Development",
            difficulty: "Easy",
            questions: 15,
            status: "Draft"
        },
        {
            id: 3,
            title: "React Hooks nâng cao",
            category: "React",
            difficulty: "Hard",
            questions: 25,
            status: "Published"
        },
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Quản lý Quiz</h1>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo Quiz mới
                </Button>
            </div>

            <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm quiz..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Tiêu đề</TableHead>
                            <TableHead>Danh mục</TableHead>
                            <TableHead>Độ khó</TableHead>
                            <TableHead>Số câu hỏi</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {quizzes.map((quiz) => (
                            <TableRow key={quiz.id}>
                                <TableCell>{quiz.id}</TableCell>
                                <TableCell>{quiz.title}</TableCell>
                                <TableCell>{quiz.category}</TableCell>
                                <TableCell>{quiz.difficulty}</TableCell>
                                <TableCell>{quiz.questions}</TableCell>
                                <TableCell>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs ${quiz.status === "Published"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                            }`}
                                    >
                                        {quiz.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Sửa</DropdownMenuItem>
                                            <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                                            <DropdownMenuItem>Xóa</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default Quizzes; 