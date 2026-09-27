import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheck,
  Building2,
  Zap,
  Users,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Check,
  Sparkles,
} from "lucide-react";
import { UserRole } from "../types";

export const LoginPage: React.FC = () => {
  const { currentUser, login, switchDemoRole, logout, demoUsers } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Vui lòng nhập địa chỉ email của bạn.");
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email.trim(), password);
      if (success) {
        // Redirect based on role
        navigate("/");
      } else {
        setErrorMessage("Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại hoặc chọn tài khoản mẫu bên dưới.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    switchDemoRole(role);
    navigate("/");
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return <ShieldCheck className="w-5 h-5 text-[#0F766E]" />;
      case "MANAGER":
        return <Building2 className="w-5 h-5 text-[#0F766E]" />;
      case "STAFF":
        return <Zap className="w-5 h-5 text-blue-600" />;
      case "RESIDENT":
        return <Users className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans">
      {/* Top Simple Bar */}
      <header className="bg-white border-b border-[#E2E8F0] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center text-white font-bold text-base shadow-xs">
            S
          </div>
          <span className="font-bold text-lg text-[#0F172A] tracking-tight">StayHub</span>
        </div>

        <div className="text-xs text-slate-500 font-medium hidden sm:block">
          Hệ thống Quản lý Không gian sống StayHub
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Brand Context & System Highlights (Desktop) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-[#0F766E] text-white p-8 rounded-2xl flex flex-col justify-between shadow-md">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-teal-200 bg-white/10 px-3 py-1 rounded-md backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cổng đăng nhập hệ thống</span>
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Quản lý Không gian sống hiện đại
                </h2>
                <p className="text-xs text-slate-200 mt-2 leading-relaxed">
                  Đăng nhập để quản lý chuỗi 3 cơ sở, ghi số điện nước, phê duyệt hợp đồng hoặc thanh toán hóa đơn căn hộ tức thì.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <Check className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                  <span>Phân quyền nghiêm ngặt 4 vai trò (Admin, Manager, Staff, Resident)</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <Check className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                  <span>Cổng thanh toán tự động VietQR SePay & thông báo Zalo</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <Check className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                  <span>Dữ liệu thời gian thực đồng bộ toàn chuỗi</span>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 text-[11px] text-slate-300">
              Cần hỗ trợ kỹ thuật? Liên hệ ban quản lý qua hotline <strong className="text-white">1900 8899</strong>
            </div>
          </div>

          {/* Right Column: Login Card & Quick Demo Roles */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 sm:p-8 space-y-6">
            {currentUser ? (
              /* Already logged in view */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0F766E] text-white flex items-center justify-center font-bold text-sm">
                      {currentUser.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs text-teal-800 font-medium">Hiện đang đăng nhập</div>
                      <div className="text-sm font-bold text-slate-900">{currentUser.fullName}</div>
                      <div className="text-xs text-slate-500">
                        Vai trò: <strong className="text-[#0F766E]">{currentUser.role}</strong> · {currentUser.email}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate("/")}
                    className="w-full py-2.5 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Vào Bảng điều khiển</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => logout()}
                    className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Đăng xuất tài khoản
                  </button>
                </div>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-slate-500 font-medium">Hoặc chuyển vai trò nhanh</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">Đăng nhập tài khoản</h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Nhập thông tin hoặc chọn nhanh tài khoản thử nghiệm bên dưới.
                </p>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleStandardLogin} className="space-y-3.5 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Địa chỉ Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@stayhub.vn hoặc thao.le@gmail.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span>Ghi nhớ đăng nhập</span>
                    </label>
                    <span className="text-[#0F766E] text-xs font-medium cursor-pointer hover:underline" onClick={() => alert("Mật khẩu thử nghiệm cho tất cả tài khoản mẫu là bất kỳ (hoặc để trống).")}>
                      Quên mật khẩu?
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    {isLoading ? (
                      <span>Đang kiểm tra thông tin...</span>
                    ) : (
                      <>
                        <span>Đăng nhập hệ thống</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-slate-500 font-medium">Hoặc đăng nhập 1 chạm theo vai trò</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick 1-Click Demo Login Grid */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-800">
                Tài khoản mẫu kiểm thử nhanh (1-Click Login):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {demoUsers.map((d) => (
                  <button
                    key={d.role}
                    type="button"
                    onClick={() => handleQuickDemoLogin(d.role)}
                    className="p-3 text-left bg-slate-50 hover:bg-teal-50/70 border border-slate-200 hover:border-teal-400 rounded-xl transition-all group flex items-start gap-2.5"
                  >
                    <div className="p-1.5 bg-white rounded-lg border border-slate-200 group-hover:border-teal-300 shrink-0">
                      {getRoleIcon(d.role)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-[#0F766E] transition-colors">
                          {d.label}
                        </span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                          {d.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{d.user.email}</p>
                      <p className="text-[10px] text-slate-400 truncate">{d.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        StayHub · Quản lý Không gian sống hiện đại · Hỗ trợ: 1900 8899
      </footer>
    </div>
  );
};
