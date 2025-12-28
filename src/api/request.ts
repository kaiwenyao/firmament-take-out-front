import axios from "axios";
import { toast } from "sonner";
import { getNavigate } from "@/utils/navigation";

// 1. 创建 axios 实例
const instance = axios.create({
  // 这里通常写 '/api'，然后通过 Vite 的代理转发到后台端口
  baseURL: "/api",
  timeout: 5000, // 超时时间 5 秒
});

// 标记是否正在处理 token 过期，防止重复跳转
let isHandlingTokenExpired = false;

/**
 * 清除本地存储的用户信息并跳转到登录页
 */
const handleTokenExpired = () => {
  // 如果正在处理，直接返回，防止重复跳转
  if (isHandlingTokenExpired) {
    return;
  }

  isHandlingTokenExpired = true;

  // 清除本地存储的 token 和用户信息
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  localStorage.removeItem("name");
  localStorage.removeItem("userId");

  // 延迟跳转，确保 toast 提示能够显示
  setTimeout(() => {
    // 核心区别：使用 navigate 进行无刷新跳转
    const navigate = getNavigate();
    if (navigate) {
      navigate('/login', { replace: true });
    } else {
      // 如果 navigate 未初始化，使用 window.location 作为后备方案
      window.location.href = '/login';
    }
    
    // 重置锁
    isHandlingTokenExpired = false;
  }, 1000);
};

// 2. 请求拦截器 (Request Interceptor)
instance.interceptors.request.use(
  (config) => {
    // Token 存在 localStorage 中
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.token = token; // 根据后端要求，可能是 'Authorization' 或 'token'
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. 响应拦截器 (Response Interceptor)
instance.interceptors.response.use(
  (response) => {
    const res = response.data;

    // 假设后端返回格式是：{ code: 1, msg: 'success', data: ... }
    // 如果 code === 1 代表成功
    if (res.code === 1) {
      return res.data; // 直接返回数据核心部分
    } else {
      // 如果 code 不为 1，代表业务错误（比如"用户名已存在"）
      const errorMsg:string = res.msg || "网络异常";
      console.error(errorMsg);
      return Promise.reject(new Error(errorMsg));
    }
  },
  (error) => {
    // 处理 HTTP 状态码错误
    if (error.response?.status === 401) {
      // 显示警告提示信息
      toast.warning("登录过期，现在跳转到登录页");
      // Token 过期或未授权
      handleTokenExpired();
      return Promise.reject(new Error("登录已过期，请重新登录"));
    }

    // 处理网络错误或其他错误
    const errorMessage =
      error.response?.data?.msg || error.message || "网络异常";
    console.error(errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

export default instance;
