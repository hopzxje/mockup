import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Zap,
  Receipt,
  QrCode,
  Wrench,
  UserCheck,
  Bell,
  BarChart3,
  ScrollText,
  ShieldAlert,
  Boxes,
  ShieldCheck,
  Sliders,
  ChevronRight,
  Shield,
  Activity,
  Home,
} from "lucide-react";
import { UserRole } from "../../types";

interface NavItem {
  title: string;
  path: string;
  icon: any;
  roles: UserRole[];
  badge?: string;
  adminTitle?: string;
}

export const Sidebar: React.FC = () => {
  const { currentRole } = useAuth();
  const location = useLocation();

  // Distinct navigation setup: Admin ONLY performs Account Mgmt, Roles & Permissions, System Monitoring/Audit, and System Configuration.
  const adminNavItems: NavItem[] = [
    {
      title: "Tổng quan Hệ thống",
      path: "/",
      icon: LayoutDashboard,
      roles: ["ADMIN"],
    },
    {
      title: "Quản trị Tài khoản",
      path: "/users",
      icon: Users,
      roles: ["ADMIN"],
    },
    {
      title: "Giám sát & Nhật ký",
      path: "/audit-logs",
      icon: ScrollText,
      roles: ["ADMIN"],
    },
    {
      title: "Cấu hình Hệ thống",
      path: "/system-settings",
      icon: Sliders,
      roles: ["ADMIN"],
    },
  ];

  const operationalNavItems: NavItem[] = [
    {
      title: currentRole === "MANAGER" ? "Tổng quan Vận hành" : "Tổng quan Công việc",
      path: "/",
      icon: LayoutDashboard,
      roles: ["MANAGER", "STAFF"],
    },
    {
      title: "Cơ sở & Phòng",
      path: "/buildings",
      icon: Building2,
      roles: ["MANAGER", "STAFF"],
    },
    {
      title: "Tài sản thiết bị",
      path: "/assets",
      icon: Boxes,
      roles: ["MANAGER", "STAFF"],
    },
    {
      title: "Cư dân & Lưu trú",
      path: "/residents",
      icon: Users,
      roles: ["MANAGER", "STAFF"],
    },
    {
      title: "Hợp đồng thuê",
      path: "/contracts",
      icon: FileText,
      roles: ["MANAGER", "STAFF"],
    },
    {
      title: "Phí & Điện nước",
      path: "/utilities",
      icon: Zap,
      roles: ["MANAGER", "STAFF"],
    },
    {
      title: "Hóa đơn & Thu phí",
      path: "/invoices",
      icon: Receipt,
      roles: ["MANAGER", "STAFF"],
    },
    {
      title: "Thanh toán SePay",
      path: "/sepay",
      icon: QrCode,
      roles: ["MANAGER"],
    },
    {
      title: "Quản lý Sửa chữa",
      path: "/maintenance",
      icon: Wrench,
      roles: ["MANAGER", "STAFF"],
    },
    {
      title: "Khách đến thăm",
      path: "/visitors",
      icon: UserCheck,
      roles: ["MANAGER", "STAFF"],
    },
    {
      title: "Thông báo & Zalo",
      path: "/notifications",
      icon: Bell,
      roles: ["MANAGER", "STAFF"],
    },
    {
      title: "Báo cáo & Thống kê",
      path: "/reports",
      icon: BarChart3,
      roles: ["MANAGER"],
    },
  ];

  const residentNavItems: NavItem[] = [
    {
      title: "Tổng quan Căn hộ",
      path: "/",
      icon: Home,
      roles: ["RESIDENT"],
    },
    {
      title: "Hóa đơn & Tiền phòng",
      path: "/invoices",
      icon: Receipt,
      roles: ["RESIDENT"],
    },
    {
      title: "Báo hỏng & Sửa chữa",
      path: "/maintenance",
      icon: Wrench,
      roles: ["RESIDENT"],
    },
    {
      title: "Đăng ký Khách thăm",
      path: "/visitors",
      icon: UserCheck,
      roles: ["RESIDENT"],
    },
    {
      title: "Thông báo từ BQL",
      path: "/notifications",
      icon: Bell,
      roles: ["RESIDENT"],
    },
    {
      title: "Hồ sơ & Hợp đồng",
      path: "/profile",
      icon: Users,
      roles: ["RESIDENT"],
    },
  ];

  let allowedItems = operationalNavItems;
  if (currentRole === "ADMIN") {
    allowedItems = adminNavItems;
  } else if (currentRole === "RESIDENT") {
    allowedItems = residentNavItems;
  }

  return (
    <aside className="w-64 bg-white border-r border-[#E2E8F0] flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-[#E2E8F0]">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            S
          </div>
          <div>
            <span className="font-bold text-base text-[#0F172A] tracking-tight">StayHub</span>
            <span className="text-[10px] block text-[#64748B] font-medium leading-none">
              {currentRole === "ADMIN"
                ? "Quản trị Hệ thống Chuỗi"
                : currentRole === "RESIDENT"
                ? "Cổng Tiện ích Cư dân"
                : "Quản lý Không gian sống"}
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {allowedItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-teal-50 text-[#0F766E] font-bold border border-teal-200/60 shadow-xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? "text-[#0F766E]" : "text-slate-400"
                }`}
              />
              <span className="flex-1 truncate">{item.title}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-3 border-t border-[#E2E8F0] space-y-1 bg-slate-50/50">
        {currentRole === "RESIDENT" && (
          <div className="px-3 py-1.5 mb-1 rounded-lg bg-teal-50 border border-teal-200/70 text-[11px] flex items-center justify-between text-[#0F766E]">
            <span className="font-semibold">Phòng 101 • Central Park</span>
            <span className="px-1.5 py-0.2 rounded bg-white text-teal-800 text-[10px] font-bold border border-teal-200">
              Đang thuê
            </span>
          </div>
        )}
        <Link
          to="/login"
          className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:text-[#0F766E] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
        >
          <span>Đổi vai trò / Đăng xuất</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>
        <div className="px-3 py-1 flex items-center justify-between text-[11px] text-slate-400">
          <span>Phiên bản v2.4 RBAC</span>
          <span className="font-mono text-[10px]">VietQR Live</span>
        </div>
      </div>
    </aside>
  );
};
