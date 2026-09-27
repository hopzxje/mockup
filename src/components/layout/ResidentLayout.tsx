import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { DemoRoleBar } from "./DemoRoleBar";
import { useAuth } from "../../context/AuthContext";
import {
  Home,
  Receipt,
  Wrench,
  Bell,
  User as UserIcon,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { storageService } from "../../services/storage";

export const ResidentLayout: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  const notifications = storageService.getNotifications(currentUser || undefined);
  const unreadNotifs = notifications.filter(
    (n) => currentUser && !n.readByUserIds.includes(currentUser.id)
  ).length;

  const residentNav = [
    { title: "Trang chủ", path: "/", icon: Home },
    { title: "Hóa đơn", path: "/invoices", icon: Receipt },
    { title: "Sửa chữa", path: "/maintenance", icon: Wrench },
    { title: "Khách thăm", path: "/visitors", icon: UserCheck },
    { title: "Thông báo", path: "/notifications", icon: Bell, badge: unreadNotifs },
    { title: "Cá nhân", path: "/profile", icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Top Demo Bar */}
      <DemoRoleBar />

      {/* Resident Mobile-First Header */}
      <header className="bg-white border-b border-[#E2E8F0] px-4 py-3 sticky top-0 z-30 shadow-xs flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center text-white font-bold text-sm shadow-xs">
            S
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#0F172A] leading-tight">StayHub Cư Dân</h1>
            <p className="text-[11px] text-[#64748B] flex items-center gap-1">
              <span>P.101</span>
              <span>•</span>
              <span className="truncate max-w-[170px]">StayHub Central</span>
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2.5">
          <Link
            to="/login"
            title="Đổi tài khoản"
            className="text-[11px] text-[#0F766E] hover:underline font-medium px-2 py-1 bg-teal-50 rounded-md border border-teal-200"
          >
            Đổi tài khoản
          </Link>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-800 block leading-tight">
              {currentUser?.fullName}
            </span>
            <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-medium border border-teal-200">
              Khách thuê chính
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 max-w-xl mx-auto w-full px-4 pt-4">
        <Outlet />
      </main>

      {/* Bottom Navigation Bar (Resident Mobile-First) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] px-2 py-1.5 z-40 shadow-lg flex items-center justify-around max-w-xl mx-auto">
        {residentNav.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors relative min-w-[50px] ${
                isActive ? "text-[#0F766E] font-semibold" : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-[#0F766E]" : "text-[#64748B]"}`} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
