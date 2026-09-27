import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { storageService } from "../../services/storage";
import { Shield, UserCheck, Wrench, Home, RotateCcw, Database, LogIn } from "lucide-react";
import { UserRole } from "../../types";

export const DemoRoleBar: React.FC = () => {
  const { currentRole, currentUser, switchDemoRole, demoUsers } = useAuth();

  const handleResetData = () => {
    if (window.confirm("Bạn có chắc muốn đặt lại toàn bộ dữ liệu demo về trạng thái ban đầu?")) {
      storageService.resetAllData();
      window.location.reload();
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="w-4 h-4 text-teal-400" />;
      case "MANAGER":
        return <UserCheck className="w-4 h-4 text-teal-400" />;
      case "STAFF":
        return <Wrench className="w-4 h-4 text-blue-400" />;
      case "RESIDENT":
        return <Home className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="no-print bg-slate-900 text-slate-200 px-4 py-2 border-b border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3 shadow-inner">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold uppercase tracking-wider text-[10px] border border-amber-500/30">
          <Database className="w-3 h-3" />
          <span>Dữ liệu demo (Mock Adapter)</span>
        </div>
        <span className="text-slate-400 hidden sm:inline">|</span>
        <span className="text-slate-300 hidden sm:inline">
          Đang đăng nhập: <strong className="text-white">{currentUser?.fullName}</strong> ({currentRole})
        </span>
      </div>

      <div className="flex items-center flex-wrap gap-1.5">
        <span className="text-slate-400 mr-1 hidden md:inline">Chuyển vai trò thử nghiệm:</span>
        <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
          {demoUsers.map((d) => {
            const isActive = currentRole === d.role;
            return (
              <button
                key={d.role}
                onClick={() => switchDemoRole(d.role)}
                title={d.desc}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#0F766E] text-white shadow-sm font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                }`}
              >
                {getRoleIcon(d.role)}
                <span>{d.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleResetData}
          title="Khôi phục lại dữ liệu mẫu 3 cơ sở ban đầu"
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors ml-2"
        >
          <RotateCcw className="w-3 h-3 text-slate-400" />
          <span className="hidden sm:inline">Đặt lại Demo</span>
        </button>

        <Link
          to="/login"
          title="Đến trang đăng nhập / đổi tài khoản"
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors ml-1"
        >
          <LogIn className="w-3 h-3" />
          <span className="hidden sm:inline">Đổi tài khoản</span>
        </Link>
      </div>
    </div>
  );
};
