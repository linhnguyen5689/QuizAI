import { Navigate } from "react-router-dom";

/**
 * Component bảo vệ route, chỉ cho phép truy cập nếu đã đăng nhập
 * @param {Object} props - children: component cần render nếu hợp lệ, user: thông tin người dùng
 */
const ProtectedRoute = ({ children, user }) => {
  if (!user) {
    // Nếu chưa đăng nhập thì điều hướng về trang login
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập thì hiển thị component con
  return children;
};

export default ProtectedRoute;
