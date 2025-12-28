import { useEffect, useRef, useState, useCallback } from "react";

export enum WebSocketStatus {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2, // 补充了标准状态
  CLOSED = 3,
}

export interface WebSocketOptions {
  url?: string;
  sid: string;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: string) => void;
  /** 是否在组件挂载时自动连接，默认为 true */
  autoConnect?: boolean;
}

export function useWebSocket(options: WebSocketOptions) {
  const {
    url = "ws://localhost:8080",
    sid,
    onOpen,
    onClose,
    onError,
    onMessage,
    autoConnect = true, // 新增配置
  } = options;

  const [status, setStatus] = useState<WebSocketStatus>(WebSocketStatus.CLOSED);
  const ws = useRef<WebSocket | null>(null);

  // 保持回调最新
  const callbacksRef = useRef({ onOpen, onClose, onError, onMessage });
  useEffect(() => {
    callbacksRef.current = { onOpen, onClose, onError, onMessage };
  }, [onOpen, onClose, onError, onMessage]);

  // --- 核心功能：断开连接 ---
  const disconnect = useCallback(() => {
    if (ws.current) {
      try {
        // 避免重复关闭
        if (
          ws.current.readyState === WebSocket.OPEN ||
          ws.current.readyState === WebSocket.CONNECTING
        ) {
          ws.current.close(1000, "前端主动关闭");
        }
      } catch (error) {
        console.warn("[WebSocket] 断开连接时出错:", error);
      }
    }
    // 注意：不要在这里 setStatus，依赖 socket.onclose 回调来更新状态，保证单一数据源
  }, []);

  // --- 核心功能：建立连接 ---
  const connect = useCallback(() => {
    // 1. 基础校验
    if (!sid) return;

    // 2. 如果已有连接，先关闭，确保“重连”是彻底的
    if (ws.current) {
      // 如果当前是连接或打开状态，不重复创建，除非你想强制重连
      // 这里为了简单，如果已连接则直接返回，交给 reconnect 去处理强制重连
      if (
        ws.current.readyState === WebSocket.OPEN ||
        ws.current.readyState === WebSocket.CONNECTING
      ) {
        return;
      }
      // 或者是残留的 CLOSED 实例，清理掉
      ws.current = null;
    }

    const wsUrl = `${url}/ws/${sid}`;

    try {
      setStatus(WebSocketStatus.CONNECTING);
      const socket = new WebSocket(wsUrl);
      ws.current = socket; // 立即赋值

      socket.onopen = () => {
        // 双重校验：确保当前 socket 还是 ws.current (防止快速切换导致的竞态)
        if (ws.current === socket) {
          setStatus(WebSocketStatus.OPEN);
          callbacksRef.current.onOpen?.();
        }
      };

      socket.onmessage = (event) => {
        if (ws.current === socket) {
          callbacksRef.current.onMessage?.(event.data);
        }
      };

      socket.onclose = () => {
        if (ws.current === socket) {
          setStatus(WebSocketStatus.CLOSED);
          callbacksRef.current.onClose?.();
          ws.current = null; // 清理引用
        }
      };

      socket.onerror = (error) => {
        if (ws.current === socket) {
          // onerror 后通常紧接着 onclose，所以这里只回调不改状态，状态由 onclose 处理
          callbacksRef.current.onError?.(error);
        }
      };
    } catch (error) {
      console.error("[WebSocket] 创建连接失败:", error);
      setStatus(WebSocketStatus.CLOSED);
      ws.current = null;
    }
  }, [url, sid]); // 依赖项仅 url 和 sid

  // --- 核心功能：发送消息 ---
  const send = useCallback((message: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(message);
      return true;
    }
    console.warn("[WebSocket] 发送失败，连接未就绪");
    return false;
  }, []);

  // --- 核心功能：强制重连 ---
  // 先断开，再连接
  const reconnect = useCallback(() => {
    disconnect();
    // 由于 disconnect 是异步的（close 事件），为了确保断开后再连，
    // 这里做一个简单的延时，或者直接依赖 react 的 state 变化有点复杂。
    // 简单粗暴的做法是：
    setTimeout(() => {
      connect();
    }, 300);
  }, [disconnect, connect]);

  // --- 生命周期管理 ---
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let isMounted = true;

    if (autoConnect) {
      // 关键修改：使用 setTimeout 将连接操作推迟到下一个事件循环
      // 这样就避免了 "Synchronous setState" 报错
      timer = setTimeout(() => {
        if (isMounted) {
          connect();
        }
      }, 0);
    }

    // 组件卸载时的清理函数
    return () => {
      isMounted = false;
      if (timer !== undefined) {
        clearTimeout(timer); // 防止组件快速卸载时尝试连接
      }
      // 确保 disconnect 函数存在且 ws.current 存在时才调用
      try {
        if (ws.current) {
          disconnect();
        }
      } catch (error) {
        console.warn("[WebSocket] 清理时出错:", error);
      }
    };
  }, [connect, disconnect, autoConnect]);

  return {
    status,
    isConnected: status === WebSocketStatus.OPEN,
    send,
    disconnect,
    reconnect,
    connect, // 暴露 connect 以便手动触发
  };
}
