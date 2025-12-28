import { 
  AlignJustify, // 对应截图中的收起图标
  Clock,        // 对应营业状态设置的图标
  LogOut, 
  KeyRound, 
  ChevronDown 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { employeeLogout } from "@/api/auth";
import { getShopStatus, setShopStatus } from "@/api/shop";
import { toast } from "sonner";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const navigate = useNavigate();
  const [shopStatus, setShopStatusState] = useState<number | null>(null); // null 表示未加载
  const [statusLoading, setStatusLoading] = useState(true); // 加载状态
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 获取店铺营业状态
  const fetchShopStatus = async () => {
    setStatusLoading(true);
    try {
      const status = await getShopStatus();
      setShopStatusState(status ?? 1); // 如果返回 null，默认为营业中
    } catch (error) {
      console.error("获取店铺营业状态失败:", error);
      // 失败时默认为营业中
      setShopStatusState(1);
    } finally {
      setStatusLoading(false);
    }
  };

  // 组件挂载时获取状态
  useEffect(() => {
    fetchShopStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await employeeLogout();
      toast.success("已退出登录");
      navigate("/login", { replace: true });
    } catch (error) {
      // 即使出错也清除本地数据并跳转
      toast.error("退出登录失败");
      navigate("/login", { replace: true });
    }
  };

  // 处理设置营业状态
  const handleSetStatus = async (status: number) => {
    setLoading(true);
    try {
      await setShopStatus(status);
      setShopStatusState(status);
      setStatusDialogOpen(false);
      toast.success(`已设置为${status === 1 ? "营业中" : "打烊中"}`);
    } catch (error) {
      console.error("设置店铺营业状态失败:", error);
      toast.error("设置营业状态失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 获取当前登录用户名
  const userName = localStorage.getItem("userName") || "管理员";

  return (
    <header className="h-16 w-full bg-[#ffc200] px-6 flex items-center justify-between text-[#333] shadow-md z-50 relative">
      {/* 左侧区域 */}
      <div className="flex items-center gap-4">
        {/* 1. Logo */}
        <div className="flex items-center gap-2 mr-4">
            {/* 这里的 src 换成你实际的 logo 图片路径 */}
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
               苍
            </div>
            <span className="text-xl font-bold tracking-wide text-[#333]">苍穹外卖</span>
        </div>

        {/* 2. 收起/展开 Sidebar 按钮 */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-black/10 text-[#333]"
          onClick={onToggleSidebar}
        >
          <AlignJustify className="h-6 w-6" />
        </Button>

        {/* 3. 营业状态 Badge */}
        {statusLoading ? (
          <Skeleton className="h-6 w-16 ml-4" />
        ) : shopStatus !== null ? (
          <div className={`flex items-center justify-center text-white text-sm font-medium px-3 py-1 rounded-sm shadow-sm ml-4 ${
            shopStatus === 1 ? "bg-red-600" : "bg-gray-500"
          }`}>
            {shopStatus === 1 ? "营业中" : "打烊中"}
          </div>
        ) : null}
      </div>

      {/* 右侧区域 */}
      <div className="flex items-center gap-8">
        {/* 1. 营业状态设置 */}
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setStatusDialogOpen(true)}
        >
          <Clock className="h-5 w-5" />
          <span className="text-sm font-medium">营业状态设置</span>
        </div>

        {/* 2. 管理员下拉菜单 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer outline-none">
              <span className="text-sm font-medium">{userName}</span>
              <ChevronDown className="h-4 w-4 opacity-70" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="cursor-pointer">
              <KeyRound className="mr-2 h-4 w-4" />
              <span>修改密码</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>退出登录</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 营业状态设置对话框 */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>设置营业状态</DialogTitle>
            <DialogDescription>
              请选择店铺的营业状态
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <Button
              variant={shopStatus === 1 ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => handleSetStatus(1)}
              disabled={loading || shopStatus === 1}
            >
              <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
              营业中
            </Button>
            <Button
              variant={shopStatus === 0 ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => handleSetStatus(0)}
              disabled={loading || shopStatus === 0}
            >
              <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
              打烊中
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
              disabled={loading}
            >
              取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}