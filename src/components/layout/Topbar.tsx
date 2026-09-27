import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useBuilding } from "../../context/BuildingContext";
import { storageService } from "../../services/storage";
import {
  Building2,
  Bell,
  LogOut,
  User as UserIcon,
  Shield,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  LogIn,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const Topbar: React.FC = () => {
  const { currentUser, currentRole, logout } = useAuth();
  const { selectedBuildingId, setSelectedBuildingId, userAccessibleBuildings } = useBuilding();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const notifications = storageService.getNotifications(currentUser || undefined).slice(0, 5);
  const unreadCount = notifications.filter(
    (n) => currentUser && !n.readByUserIds.includes(currentUser.id)
  ).length;

  const getRoleBadge = () => {
    switch (currentRole) {
      case "ADMIN":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">Admin</span>;
      case "MANAGER":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">Quản lý</span>;
      case "STAFF":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Nhân viên</span>;
      case "RESIDENT":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Cư dân</span>;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Building scope selector */}
      <div className="flex items-center gap-3">
        {currentRole === "ADMIN" || currentRole === "MANAGER" ? (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#0F766E]" />
            <span className="text-xs font-medium text-[#64748B] hidden md:inline">Cơ sở:</span>
            <select
              value={selectedBuildingId}
              onChange={(e) => setSelectedBuildingId(e.target.value)}
              className="text-xs font-semibold text-[#0F172A] bg-teal-50/50 border border-teal-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer min-w-[240px] md:min-w-[320px]"
            >
              {userAccessibleBuildings.map((b) => {
                const displayName = b.name.startsWith("Tòa nhà")
                  ? b.name
                  : `Tòa nhà ${b.name}`;
                return (
                  <option key={b.id} value={b.id}>
                    {displayName} ({b.code})
                  </option>
                );
              })}
            </select>
          </div>
        ) : currentRole === "RESIDENT" ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-[#0F766E] text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Căn hộ 101 • Tòa nhà StayHub Central - Quận 1 (SH-CENTRAL)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#0F766E]" />
            <span className="text-xs font-medium text-[#64748B] hidden md:inline">Cơ sở:</span>
            <select
              value={selectedBuildingId}
              onChange={(e) => setSelectedBuildingId(e.target.value)}
              className="text-xs font-semibold text-[#0F172A] bg-slate-50 border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer min-w-[240px] md:min-w-[320px]"
            >
              {userAccessibleBuildings.map((b) => {
                const displayName = b.name.startsWith("Tòa nhà")
                  ? b.name
                  : `Tòa nhà ${b.name}`;
                return (
                  <option key={b.id} value={b.id}>
                    {displayName} ({b.code})
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Switch / Login link */}
        <Link
          to="/login"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-[#0F766E] hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
          title="Đổi tài khoản"
        >
          <LogIn className="w-4 h-4 text-[#0F766E]" />
          <span className="hidden md:inline">Đổi tài khoản</span>
        </Link>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-lg relative transition-colors"
            title="Thông báo hệ thống"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-3 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="font-semibold text-xs text-slate-900">Thông báo mới ({notifications.length})</span>
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] text-[#0F766E] hover:underline font-medium"
                >
                  Xem tất cả
                </Link>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Không có thông báo mới</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-teal-50/50 transition-colors text-xs border border-slate-100"
                    >
                      <p className="font-medium text-slate-800 line-clamp-1">{n.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {currentUser?.fullName.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-[#0F172A] leading-tight">
                {currentUser?.fullName}
              </div>
              <div className="text-[11px] text-[#64748B] flex items-center gap-1.5">
                {getRoleBadge()}
              </div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-1.5 z-50">
              <div className="px-3 py-2 border-b border-slate-100 text-xs">
                <p className="font-semibold text-slate-900">{currentUser?.fullName}</p>
                <p className="text-slate-500 text-[11px] truncate">{currentUser?.email}</p>
                <p className="text-slate-400 text-[11px] mt-0.5">SĐT: {currentUser?.phoneNumber}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>Hồ sơ & Đổi mật khẩu</span>
              </Link>

              <Link
                to="/login"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-500" />
                <span>Đổi tài khoản đăng nhập</span>
              </Link>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                  navigate("/login");
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg text-left transition-colors border-t border-slate-100 mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
