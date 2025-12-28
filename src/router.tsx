import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App"; // 你的主布局组件

// 引入页面组件
import Dashboard from "./pages/Dashboard";
import Statistics from "./pages/Statistics";
import Order from "./pages/Order";
import Setmeal from "./pages/Setmeal";
import Dish from "./pages/Dish";
import Category from "./pages/Category";
import Employee from "./pages/Employee";
import NotFound from "./pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // App 是布局容器（包含侧边栏/头部）
    errorElement: <NotFound />, // 全局错误处理
    children: [
      {
        // 当访问 "/" 时，自动重定向到 "/dashboard"
        index: true, 
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "statistics",
        element: <Statistics />,
      },
      {
        path: "order",
        element: <Order />,
      },
      {
        path: "setmeal", // 套餐
        element: <Setmeal />,
      },
      {
        path: "dish", // 菜品
        element: <Dish />,
      },
      {
        path: "category", // 分类
        element: <Category />,
      },
      {
        path: "employee", // 员工
        element: <Employee />,
      },
    ],
  },
  {
    // 捕获所有未定义的路由，显示 404 页面
    path: "*",
    element: <NotFound />,
  },
]);

export default router;