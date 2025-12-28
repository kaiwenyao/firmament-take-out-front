import type { NavigateFunction } from "react-router-dom";

// 存储 navigate 函数的变量
let navigateInstance: NavigateFunction | null = null;

/**
 * 设置 navigate 函数实例
 * 应该在应用启动时从组件中调用
 */
export const setNavigate = (navigate: NavigateFunction) => {
  navigateInstance = navigate;
};

/**
 * 获取 navigate 函数实例
 * 可以在非组件环境中使用
 */
export const getNavigate = (): NavigateFunction | null => {
  return navigateInstance;
};

