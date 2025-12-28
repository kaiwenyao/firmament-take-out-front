import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BarChart3,
  ShoppingCart,
  Package,
  UtensilsCrossed,
  FolderTree,
  Users,
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
}

export default function Sidebar({ isCollapsed }: SidebarProps) {
  const menuItems = [
    { path: "/dashboard", label: "工作台", icon: LayoutDashboard },
    { path: "/statistics", label: "数据统计", icon: BarChart3 },
    { path: "/order", label: "订单管理", icon: ShoppingCart },
    { path: "/setmeal", label: "套餐管理", icon: Package },
    { path: "/dish", label: "菜品管理", icon: UtensilsCrossed },
    { path: "/category", label: "分类管理", icon: FolderTree },
    { path: "/employee", label: "员工管理", icon: Users },
  ];

  return (
    <aside
      className={`bg-[#333] text-white flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <nav className="flex flex-col gap-1 p-4 mt-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "text-[#ffc200]" : "text-gray-300 hover:text-white"
              }
            >
              {({ isActive }) => (
                <Button
                  variant="ghost"
                  className={`w-full ${
                    isCollapsed ? "justify-center px-0" : "justify-start"
                  } ${isActive ? "bg-white/10" : ""}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={`${isCollapsed ? "h-5 w-5" : "h-4 w-4 mr-2"}`}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </Button>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

