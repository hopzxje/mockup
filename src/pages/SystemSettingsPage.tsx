import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { storageService } from "../services/storage";
import { SystemSettings } from "../types";
import {
  Sliders,
  Save,
  QrCode,
  Bell,
  ShieldAlert,
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";

export const SystemSettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<SystemSettings>(() => storageService.getSystemSettings());
  const [notice, setNotice] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [activeTab, setActiveTab] = useState<"GENERAL" | "SEPAY" | "ZALO" | "SECURITY" | "DATA">("GENERAL");

  const showNotification = (msg: string, error = false) => {
    setNotice(msg);
    setIsError(error);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    storageService.updateSystemSettings(settings, currentUser);
    showNotification("Đã lưu cấu hình thông tin hệ thống thành công!");
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    storageService.updateSystemSettings(settings, currentUser);
    showNotification("Đã lưu cấu hình cổng thanh toán VietQR SePay!");
  };

  const handleSaveZalo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    storageService.updateSystemSettings(settings, currentUser);
    showNotification("Đã lưu cấu hình cổng Zalo ZNS!");
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    storageService.updateSystemSettings(settings, currentUser);
    showNotification("Đã cập nhật chính sách an ninh & phiên làm việc!");
  };

  // BACKUP DATA TO JSON
  const handleBackupData = () => {
    const jsonStr = storageService.backupData();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stayhub-system-backup-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification("Đã tải về tệp sao lưu dữ liệu hệ thống (.json)!");
  };

  // RESTORE DATA FROM JSON
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const ok = storageService.restoreData(content, currentUser);
        if (ok) {
          showNotification("Khôi phục toàn bộ cơ sở dữ liệu thành công! Đang tải lại...");
          setTimeout(() => window.location.reload(), 1500);
        } else {
          showNotification("Tệp sao lưu không đúng định dạng!", true);
        }
      } catch (err: any) {
        showNotification("Lỗi khi đọc tệp dữ liệu: " + err.message, true);
      }
    };
    reader.readAsText(file);
  };

  // RESET INITIAL DATA
  const handleResetData = () => {
    if (
      window.confirm(
        "CẢNH BÁO NGUY HIỂM: Bạn có chắc chắn muốn khôi phục toàn bộ cơ sở dữ liệu về trạng thái mẫu ban đầu? Tất cả dữ liệu tùy biến sẽ bị xóa."
      )
    ) {
      storageService.resetAllData();
      showNotification("Đã khôi phục dữ liệu ban đầu! Đang tải lại...");
      setTimeout(() => window.location.reload(), 1200);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Cấu hình Hệ thống</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Cài đặt thương hiệu, cổng thanh toán VietQR SePay, Zalo ZNS, an ninh hệ thống và sao lưu dữ liệu chuỗi
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab("GENERAL")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === "GENERAL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Chung & Thương hiệu
          </button>
          <button
            onClick={() => setActiveTab("SEPAY")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === "SEPAY" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Cổng SePay
          </button>
          <button
            onClick={() => setActiveTab("ZALO")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === "ZALO" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Zalo ZNS
          </button>
          <button
            onClick={() => setActiveTab("SECURITY")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === "SECURITY" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            An ninh & Phiên
          </button>
          <button
            onClick={() => setActiveTab("DATA")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === "DATA" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sao lưu & Dữ liệu
          </button>
        </div>
      </div>

      {notice && (
        <div
          className={`px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in ${
            isError ? "bg-rose-50 border border-rose-200 text-rose-800" : "bg-emerald-50 border border-emerald-200 text-emerald-800"
          }`}
        >
          {isError ? <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          <span>{notice}</span>
        </div>
      )}

      {/* TAB 1: THÔNG TIN CHUNG & THƯƠNG HIỆU */}
      {activeTab === "GENERAL" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-1">Cấu hình Thương hiệu & Thông tin Liên hệ</h3>
          <p className="text-xs text-slate-500 mb-5">
            Thông tin này hiển thị trên hóa đơn, thông báo Zalo, hợp đồng thuê và cổng dịch vụ cư dân
          </p>

          <form onSubmit={handleSaveGeneral} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Tên Thương hiệu Chuỗi:</label>
              <input
                type="text"
                value={settings.brandName}
                onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Khẩu hiệu / Slogan:</label>
              <input
                type="text"
                value={settings.slogan}
                onChange={(e) => setSettings({ ...settings, slogan: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Tên Công ty / Pháp nhân quản lý:</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Hotline CSKH:</label>
              <input
                type="text"
                value={settings.hotline}
                onChange={(e) => setSettings({ ...settings, hotline: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email Hỗ trợ:</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Địa chỉ Trụ sở chính:</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Đơn vị Tiền tệ:</label>
              <input
                type="text"
                disabled
                value={settings.currency}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Múi giờ Hệ thống:</label>
              <input
                type="text"
                disabled
                value={settings.timezone}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2 pt-3 flex justify-end">
              <button
                type="submit"
                className="bg-[#0F766E] hover:bg-[#115E59] text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Cấu hình Chung</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: CỔNG THANH TOÁN SEPAY */}
      {activeTab === "SEPAY" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Tích hợp Cổng Thanh toán VietQR SePay</h3>
              <p className="text-xs text-slate-500">
                Tự động đối soát và gạch nợ hóa đơn tiền phòng/điện nước sau 2 giây qua Webhook
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-emerald-700">Đang hoạt động</span>
            </div>
          </div>

          <form onSubmit={handleSavePayment} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Số Tài khoản Nhận tiền Chuỗi:</label>
                <input
                  type="text"
                  value={settings.sepayAccountNumber}
                  onChange={(e) => setSettings({ ...settings, sepayAccountNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Ngân hàng Thụ hưởng:</label>
                <input
                  type="text"
                  value={settings.sepayBankBrand}
                  onChange={(e) => setSettings({ ...settings, sepayBankBrand: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">SePay API Key (Production):</label>
                <input
                  type="password"
                  value={settings.sepayApiKey}
                  onChange={(e) => setSettings({ ...settings, sepayApiKey: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Webhook Secret Token:</label>
                <input
                  type="password"
                  value={settings.sepayWebhookSecret}
                  onChange={(e) => setSettings({ ...settings, sepayWebhookSecret: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
                  required
                />
              </div>
            </div>

            <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-200/80">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.sepayAutoReconcile}
                  onChange={(e) => setSettings({ ...settings, sepayAutoReconcile: e.target.checked })}
                  className="rounded text-teal-700 focus:ring-teal-600"
                />
                <span className="font-bold text-slate-900">
                  Bật cơ chế Tự động Gạch nợ (Auto-Reconcile):
                </span>
              </label>
              <p className="text-[11px] text-slate-600 mt-1 pl-6">
                Khi SePay gửi Webhook về hệ thống với cú pháp khớp mã hóa đơn (VD: STAYHUB IV-2026-0301), hệ thống sẽ tự động cập nhật trạng thái "Đã thanh toán" và gửi biên nhận tới cư dân.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-[#0F766E] hover:bg-[#115E59] text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Cấu hình SePay</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: ZALO ZNS */}
      {activeTab === "ZALO" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Tích hợp Cổng Zalo Official Account & ZNS</h3>
              <p className="text-xs text-slate-500">
                Gửi thông báo nộp tiền, cảnh báo quá hạn và cập nhật sửa chữa trực tiếp tới tài khoản Zalo của cư dân
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-blue-700">Zalo OA Đã kết nối</span>
            </div>
          </div>

          <form onSubmit={handleSaveZalo} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Zalo OA ID:</label>
                <input
                  type="text"
                  value={settings.zaloOaId}
                  onChange={(e) => setSettings({ ...settings, zaloOaId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Zalo App ID:</label>
                <input
                  type="text"
                  value={settings.zaloAppId}
                  onChange={(e) => setSettings({ ...settings, zaloAppId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Secret Key:</label>
                <input
                  type="password"
                  value={settings.zaloSecretKey}
                  onChange={(e) => setSettings({ ...settings, zaloSecretKey: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.zaloAutoNotifyInvoice}
                  onChange={(e) => setSettings({ ...settings, zaloAutoNotifyInvoice: e.target.checked })}
                  className="rounded text-teal-700 focus:ring-teal-600"
                />
                <span className="font-semibold text-slate-800">
                  Tự động gửi thông báo ZNS khi Quản lý xuất hóa đơn tiền phòng & điện nước
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.zaloAutoNotifyMaintenance}
                  onChange={(e) => setSettings({ ...settings, zaloAutoNotifyMaintenance: e.target.checked })}
                  className="rounded text-teal-700 focus:ring-teal-600"
                />
                <span className="font-semibold text-slate-800">
                  Tự động gửi tin nhắn Zalo khi kỹ thuật viên hoàn thành yêu cầu sửa chữa
                </span>
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-[#0F766E] hover:bg-[#115E59] text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Cấu hình Zalo ZNS</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: AN NINH & PHIÊN LÀM VIỆC */}
      {activeTab === "SECURITY" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-1">Chính sách An toàn & Phiên làm việc</h3>
          <p className="text-xs text-slate-500 mb-5">
            Quy định thời gian hết hạn phiên đăng nhập, số lần thử sai và chính sách lưu vết nhật ký
          </p>

          <form onSubmit={handleSaveSecurity} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Thời hạn Phiên làm việc (phút):</label>
                <input
                  type="number"
                  min={15}
                  max={480}
                  value={settings.sessionTimeoutMinutes}
                  onChange={(e) => setSettings({ ...settings, sessionTimeoutMinutes: parseInt(e.target.value) || 60 })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Tự động đăng xuất khi không hoạt động</span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Giới hạn Đăng nhập sai:</label>
                <input
                  type="number"
                  min={3}
                  max={10}
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) || 5 })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Khóa tạm thời tài khoản sau số lần thử sai</span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Thời gian Lưu trữ Nhật ký Audit (ngày):</label>
                <input
                  type="number"
                  min={30}
                  max={730}
                  value={settings.auditLogRetentionDays}
                  onChange={(e) => setSettings({ ...settings, auditLogRetentionDays: parseInt(e.target.value) || 365 })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Lưu vết phục vụ thanh tra & đối soát</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="font-bold text-slate-900">
                  Bật Chế độ Bảo trì Hệ thống Toàn diện (Maintenance Mode)
                </span>
              </label>
              <p className="text-[11px] text-slate-500 mt-1 pl-6">
                Khi bật, chỉ có tài khoản ADMIN mới có thể đăng nhập. Các vai trò Quản lý, Nhân viên và Cư dân sẽ thấy thông báo bảo trì nâng cấp.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-[#0F766E] hover:bg-[#115E59] text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Chính sách An ninh</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: SAO LƯU & QUẢN TRỊ DỮ LIỆU */}
      {activeTab === "DATA" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-1">Quản lý Sao lưu & Phục hồi Cơ sở Dữ liệu</h3>
            <p className="text-xs text-slate-500 mb-5">
              Xuất tệp dự phòng toàn bộ thực thể (tài khoản, cơ sở, hợp đồng, chỉ số điện nước, giao dịch SePay) và phục hồi khi cần
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* BACKUP */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
                    <Download className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">Sao lưu Toàn bộ Dữ liệu</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Xuất toàn bộ cơ sở dữ liệu chuỗi ra tệp định dạng JSON chuẩn. Có thể lưu trữ an toàn ngoại tuyến.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleBackupData}
                  className="mt-4 w-full bg-[#0F766E] hover:bg-[#115E59] text-white py-2 rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải tệp Sao lưu (.json)</span>
                </button>
              </div>

              {/* RESTORE */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                    <Upload className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">Phục hồi từ Tệp Sao lưu</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Chọn tệp sao lưu JSON đã lưu từ trước để nạp lại toàn bộ dữ liệu vào hệ thống StayHub.
                  </p>
                </div>
                <label className="mt-4 w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer text-center">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Chọn tệp JSON để phục hồi</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleRestoreFile}
                    className="hidden"
                  />
                </label>
              </div>

              {/* RESET TO DEMO */}
              <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-rose-950">Khôi phục Dữ liệu Mẫu Ban đầu</h4>
                  <p className="text-[11px] text-rose-700 mt-1">
                    Đặt lại toàn bộ hệ thống về 3 cơ sở tiêu chuẩn (Central Park, Riverview, Landmark) và các tài khoản demo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetData}
                  className="mt-4 w-full bg-rose-700 hover:bg-rose-800 text-white py-2 rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Khôi phục Dữ liệu Ban đầu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
