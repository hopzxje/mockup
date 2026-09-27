import React, { useState } from "react";
import { storageService } from "../services/storage";
import { formatDateTimeVN } from "../lib/utils";
import { AuditLog } from "../types";
import {
  ScrollText,
  Search,
  Shield,
  Activity,
  Server,
  QrCode,
  Bell,
  HardDrive,
  Download,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react";

export const AuditLogsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"LOGS" | "HEALTH">("LOGS");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const logs = storageService.getAuditLogs();
  const health = storageService.getSystemHealth();

  const filteredLogs = logs.filter((log) => {
    if (actionFilter !== "ALL" && log.action !== actionFilter) return false;
    if (roleFilter !== "ALL" && log.userRole !== roleFilter) return false;
    if (
      searchQuery &&
      !log.userName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !log.details.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !log.action.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !log.entityName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const exportLogsAsCSV = () => {
    const headers = ["Thời gian", "Người thực hiện", "Vai trò", "Hành động", "Thực thể", "Chi tiết", "IP"];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      `"${l.userName}"`,
      l.userRole,
      l.action,
      l.entityName,
      `"${l.details.replace(/"/g, '""')}"`,
      l.ipAddress,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stayhub-audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Giám sát Hệ thống & Nhật ký Audit</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Lưu vết thao tác hệ thống, theo dõi sức khỏe hạ tầng, kết nối SePay VietQR và cổng Zalo ZNS
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Tab selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab("LOGS")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "LOGS" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Nhật ký Hoạt động ({logs.length})
            </button>
            <button
              onClick={() => setActiveTab("HEALTH")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "HEALTH" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Sức khỏe Hệ thống</span>
            </button>
          </div>

          {activeTab === "LOGS" && (
            <button
              onClick={exportLogsAsCSV}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
              title="Xuất file CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xuất CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: NHẬT KÝ AUDIT LOGS */}
      {activeTab === "LOGS" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm theo người thực hiện, nội dung chi tiết, hành động..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Vai trò:</span>
                {["ALL", "ADMIN", "MANAGER", "STAFF"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                      roleFilter === r
                        ? "bg-[#0F766E] text-white font-semibold"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {r === "ALL" ? "Tất cả" : r}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                <span className="text-slate-400 font-medium">Mã hành động:</span>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-600"
                >
                  <option value="ALL">Tất cả hành động</option>
                  <option value="TAO_TAI_KHOAN">Tạo tài khoản</option>
                  <option value="CAP_NHAT_TAI_KHOAN">Cập nhật tài khoản</option>
                  <option value="KHOA_TAI_KHOAN">Khóa tài khoản</option>
                  <option value="MO_KHOA_TAI_KHOAN">Mở khóa tài khoản</option>
                  <option value="DAT_LAI_MAT_KHAU">Đặt lại mật khẩu</option>
                  <option value="CAP_NHAT_CAU_HINH">Cập nhật cấu hình</option>
                  <option value="GHI_NHAN_THANH_TOAN">Ghi nhận thanh toán</option>
                  <option value="PHAT_HANH_HOA_DON">Phát hành hóa đơn</option>
                  <option value="PHE_DUYET_HOP_DONG">Phê duyệt hợp đồng</option>
                  <option value="GHI_CHI_SO_DIEN_NUOC">Ghi chỉ số điện nước</option>
                </select>
              </div>
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/70">
                    <th className="py-3 px-4">Thời gian</th>
                    <th className="py-3 px-4">Người thực hiện</th>
                    <th className="py-3 px-4">Vai trò</th>
                    <th className="py-3 px-4">Mã hành động</th>
                    <th className="py-3 px-4">Thực thể</th>
                    <th className="py-3 px-4 min-w-[280px]">Chi tiết thao tác</th>
                    <th className="py-3 px-4">Địa chỉ IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Không tìm thấy sự kiện kiểm toán phù hợp
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-slate-600 font-mono whitespace-nowrap">
                          {formatDateTimeVN(log.timestamp)}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{log.userName}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              log.userRole === "ADMIN"
                                ? "bg-teal-100 text-teal-800 border border-teal-200"
                                : log.userRole === "MANAGER"
                                ? "bg-teal-100 text-teal-800"
                                : log.userRole === "STAFF"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {log.userRole}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-teal-800">{log.action}</td>
                        <td className="py-3 px-4 text-slate-700 font-medium">{log.entityName}</td>
                        <td className="py-3 px-4 text-slate-800 leading-relaxed">{log.details}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{log.ipAddress}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SỨC KHỎE HỆ THỐNG & HẠ TẦNG */}
      {activeTab === "HEALTH" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Core Status */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase">Hạ tầng Ứng dụng</span>
                <Server className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-700 mt-2 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Hoạt động Tốt</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Uptime: {health.uptime} • Máy chủ ổn định</p>
            </div>

            {/* SePay Health */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase">Cổng VietQR SePay</span>
                <QrCode className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>{health.sepayStatus.latencyMs} ms</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Webhook: {health.sepayStatus.webhookActive ? "Sẵn sàng" : "Ngắt"} • Đối soát tự động
              </p>
            </div>

            {/* Zalo Health */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase">Cổng Zalo ZNS</span>
                <Bell className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span>{health.zaloStatus.latencyMs} ms</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Hạn ngạch: {health.zaloStatus.quotaRemaining}</p>
            </div>

            {/* Database Storage */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase">Lưu trữ Dữ liệu</span>
                <HardDrive className="w-4 h-4 text-[#0F766E]" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                {health.storageUsedKb} <span className="text-sm font-normal text-slate-500">KB</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {health.totalAuditLogs} bản ghi audit • {health.totalInvoices} hóa đơn
              </p>
            </div>
          </div>

          {/* Infrastructure Details */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0F766E]" />
              <span>Chỉ số Giám sát An ninh & Vận hành Chuỗi</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Thời gian máy chủ:</span>
                  <span className="font-mono text-slate-800">{health.serverTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tài khoản Hoạt động:</span>
                  <span className="font-bold text-emerald-700">{health.activeUsers} tài khoản</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tài khoản Bị khóa:</span>
                  <span className="font-bold text-rose-600">{health.lockedUsers} tài khoản</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cơ sở kết nối:</span>
                  <span className="font-bold text-slate-800">{health.totalBuildings} cơ sở</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Trạng thái Cổng SePay VietQR:</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Trực tuyến (Live API)</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trạng thái Zalo Cloud API:</span>
                  <span className="font-semibold text-blue-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Trực tuyến (Official Account)</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bộ nhớ đệm trình duyệt (Cache):</span>
                  <span className="font-mono text-slate-800">Đồng bộ hai chiều với LocalStorage</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chính sách bảo mật:</span>
                  <span className="font-semibold text-[#0F766E]">RBAC Phân tầng 4 Vai trò</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
