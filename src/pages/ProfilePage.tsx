import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { formatDateVN } from "../lib/utils";
import { User, KeyRound, Shield, CheckCircle2, Phone, Mail } from "lucide-react";

export const ProfilePage: React.FC = () => {
  const { currentUser, currentRole, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(currentUser?.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ fullName, phoneNumber });
    setMsg({ type: "success", text: "Thông tin cá nhân đã được cập nhật thành công!" });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMsg({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự!" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg({ type: "error", text: "Mật khẩu xác nhận không khớp!" });
      return;
    }

    setMsg({ type: "success", text: "Đổi mật khẩu thành công! Hãy lưu lại mật khẩu mới." });
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">Hồ sơ Cá nhân & Bảo mật</h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Cập nhật thông tin liên hệ và đổi mật khẩu truy cập hệ thống StayHub
        </p>
      </div>

      {msg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            msg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {msg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <Shield className="w-4 h-4 text-rose-600" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100 mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-[#0F766E]" />
          <span>Thông tin Cá nhân</span>
        </h3>

        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Email đăng nhập:</label>
            <input
              type="email"
              value={currentUser?.email || ""}
              disabled
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 font-mono text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Vai trò hiện tại:</label>
            <input
              type="text"
              value={currentRole}
              disabled
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 font-bold text-teal-800 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Họ và tên hiển thị:</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Số điện thoại liên hệ:</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg font-semibold shadow-xs"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100 mb-4 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#0F766E]" />
          <span>Đổi Mật khẩu</span>
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Mật khẩu hiện tại:</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Mật khẩu mới:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Nhập lại mật khẩu mới:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-xs"
            >
              Cập nhật Mật khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
