import { useState, useRef, useEffect, useCallback } from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { useWebSocket } from "./hooks/useWebSocket";
import { toast } from "sonner";

// ✅ 1. 关键修改：通过 import 引入资源，而不是写死字符串路径
// Vite 会自动处理这些文件的最终 hash 路径
import previewSound from "@/assets/audio/preview.mp3";
import reminderSound from "@/assets/audio/reminder.mp3";

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // 生成客户端ID
  const [sid] = useState<string>(() => {
    const STORAGE_KEY = "ws_client_id";
    let storedId = localStorage.getItem(STORAGE_KEY);
    if (!storedId) {
      storedId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem(STORAGE_KEY, storedId);
    }
    return storedId;
  });

  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const reminderAudioRef = useRef<HTMLAudioElement | null>(null);
  // 使用 ref 来追踪是否已初始化，避免 StrictMode 下的双重执行问题
  const isAudioInitialized = useRef(false);

  useEffect(() => {
    if (isAudioInitialized.current) return;

    // ✅ 2. 使用导入的变量创建 Audio 对象
    previewAudioRef.current = new Audio(previewSound);
    reminderAudioRef.current = new Audio(reminderSound);
    
    // 标记初始化完成
    isAudioInitialized.current = true;

    const previewAudio = previewAudioRef.current;
    const reminderAudio = reminderAudioRef.current;
    
    // 尝试解锁音频播放 (浏览器自动播放策略)
    const unlockAudio = () => {
      // 这里的逻辑稍微简化，只需要尝试播放并捕获错误即可
      // 实际上只要用户有过交互，后续的 playAudio 就能成功
      previewAudio.load();
      reminderAudio.load();
      
      // 移除监听器，只需触发一次
      ["click", "touchstart", "keydown"].forEach((event) => {
        document.removeEventListener(event, unlockAudio);
      });
    };

    // 监听用户交互
    ["click", "touchstart", "keydown"].forEach((event) => {
      document.addEventListener(event, unlockAudio);
    });

    return () => {
      ["click", "touchstart", "keydown"].forEach((event) => {
        document.removeEventListener(event, unlockAudio);
      });
    };
  }, []);

  // ✅ 3. 使用 useCallback 包裹，保证函数引用稳定
  const playAudio = useCallback(async (type: 'preview' | 'reminder') => {
    const audio = type === 'preview' ? previewAudioRef.current : reminderAudioRef.current;
    if (!audio) return;
    
    try {
      audio.currentTime = 0;
      await audio.play();
      console.log(`播放 ${type} 音频成功`);
    } catch (err) {
      console.error(`播放 ${type} 音频被浏览器拦截或失败:`, err);
      // 如果是因为没有交互导致的失败，这里提示用户点击
      toast.error("提示音播放失败，请点击页面任意位置以启用音频");
    }
  }, []);

  // ✅ 4. 回调函数也需要稳定，避免 useWebSocket 内部产生不必要的重连
  const handleMessage = useCallback((message: string) => {
      try {
        const data = JSON.parse(message);
        console.log("WebSocket收到消息:", data);
        
        if (data.type === 1) {
          toast.success("您有新的外卖订单，请及时处理"); // 使用 success 样式
          playAudio('preview');
        } else if (data.type === 2) {
          const content = "客户催单，请尽快处理!" + data.content;
          toast.warning(content); // 使用 warning 样式
          playAudio('reminder');
        }
      } catch (e) {
        console.error("JSON解析失败", e);
      }
  }, [playAudio]); // 依赖 playAudio

  // WebSocket 连接
  useWebSocket({
    sid,
    onMessage: handleMessage, // 传入稳定的函数
  });

  return (
    <>
      <div className="flex flex-col h-screen w-full bg-gray-50">
        <Header 
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isCollapsed={isSidebarCollapsed} />
          <main className="flex-1 p-8 overflow-auto bg-gray-100/50">
            <div className="bg-white p-6 rounded-lg shadow-sm min-h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      {/* 确保 Toaster 配置正确 */}
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;