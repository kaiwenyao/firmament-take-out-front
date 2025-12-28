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
import { Button } from "@/components/ui/button";
// 假设你有一个 Logo 图片，如果没有先用文字代替
// import logo from "@/assets/logo.png"; 

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
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
        <div className="flex items-center justify-center bg-red-600 text-white text-sm font-medium px-3 py-1 rounded-sm shadow-sm ml-4">
          营业中
        </div>
      </div>

      {/* 右侧区域 */}
      <div className="flex items-center gap-8">
        {/* 1. 营业状态设置 */}
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <Clock className="h-5 w-5" />
          <span className="text-sm font-medium">营业状态设置</span>
        </div>

        {/* 2. 管理员下拉菜单 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer outline-none">
              <span className="text-sm font-medium">管理员</span>
              <ChevronDown className="h-4 w-4 opacity-70" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="cursor-pointer">
              <KeyRound className="mr-2 h-4 w-4" />
              <span>修改密码</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>退出登录</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}