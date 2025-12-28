import { Navigate, Outlet } from "react-router-dom";

/**
 * 路由守卫组件
 * 检查用户是否已登录，未登录则跳转到登录页
 */
export default function ProtectedLayout() {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
}

