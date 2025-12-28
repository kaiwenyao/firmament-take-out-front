import axios from "axios";

// 1. 创建 axios 实例
const instance = axios.create({
  // 这里通常写 '/api'，然后通过 Vite 的代理转发到后台端口
  baseURL: "/api", 
  timeout: 5000, // 超时时间 5 秒
});

// 2. 请求拦截器 (Request Interceptor)
instance.interceptors.request.use(
  (config) => {
    // 假设 Token 存在 localStorage 中 (后面做登录功能时会存)
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
      // 如果 code 不为 1，代表业务错误（比如“用户名已存在”）
      console.error(res.msg || "网络异常"); // 以后这里可以换成 Toast 提示
      return Promise.reject(res.msg || "Error");
    }
  },
  (error) => {
    // 处理 HTTP 状态码错误 (401, 404, 500)
    if (error.response?.status === 401) {
      // Token 过期，跳转登录页
      console.log("登录过期");
      // window.location.href = '/login';
    }
    console.error(error.message);
    return Promise.reject(error);
  }
);

export default instance;