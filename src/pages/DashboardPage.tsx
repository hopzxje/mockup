import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useBuilding } from "../context/BuildingContext";
import { storageService } from "../services/storage";
import { formatCurrencyVND, formatDateVN } from "../lib/utils";
import {
  Building2,
  Users,
  DoorOpen,
  Receipt,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  QrCode,
  Calendar,
  Shield,
  KeyRound,
  Sliders,
  HardDrive,
  Server,
  Activity,
  UserPlus,
  ScrollText,
  Plus,
  Bell,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import { generateSePayQR, SEPAY_CONFIG } from "../services/integrations/sepay";

export const DashboardPage: React.FC = () => {
  const { currentRole, currentUser } = useAuth();
  const { selectedBuildingId, buildings } = useBuilding();

  if (currentRole === "RESIDENT") {
    return <ResidentDashboard />;
  }

  if (currentRole === "STAFF") {
    return <StaffDashboard />;
  }

  if (currentRole === "ADMIN") {
    return <AdminSystemDashboard />;
  }

  return <AdminManagerDashboard role={currentRole} buildingId={selectedBuildingId} />;
};

/**
 * RESIDENT DASHBOARD VIEW (Desktop Web Portal)
 */
const ResidentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [showQRModal, setShowQRModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const resident =
    storageService.getResidentByUserId(currentUser?.id || "usr-res-1") ||
    storageService.getResidents()[0];
  const invoices = storageService.getInvoices({ residentId: resident?.id });
  const pendingInvoices = invoices.filter(
    (i) => i.status !== "Đã thanh toán" && i.status !== "Đã hủy" && i.balanceRemaining > 0
  );
  const latestUnpaid = pendingInvoices[0];

  const maintenanceList = storageService
    .getMaintenanceRequests({ residentId: resident?.id })
    .slice(0, 4);
  const notifications = storageService
    .getNotifications(currentUser || undefined)
    .slice(0, 4);

  const activeMaintenanceCount = maintenanceList.filter(
    (m) => m.status !== "Hoàn thành" && m.status !== "Hủy"
  ).length;

  const visitors = storageService.getVisitors().filter((v) => v.residentId === resident?.id);

  const qrInfo = latestUnpaid
    ? generateSePayQR({
        apartmentCode: resident.currentApartmentCode || "101",
        invoiceCode: latestUnpaid.invoiceCode,
        amount: latestUnpaid.balanceRemaining,
      })
    : null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 4 Primary Desktop KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Tiền nợ kỳ này */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Hóa đơn kỳ này
              </span>
              <Receipt className="w-4 h-4 text-[#0F766E]" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
              {latestUnpaid ? formatCurrencyVND(latestUnpaid.balanceRemaining) : "0 ₫"}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {latestUnpaid ? (
                <span className="text-rose-600 font-semibold">
                  Hạn nộp: {formatDateVN(latestUnpaid.dueDate)}
                </span>
              ) : (
                <span className="text-emerald-700 font-semibold">Đã thanh toán đủ</span>
              )}
            </p>
          </div>
          {latestUnpaid && (
            <button
              onClick={() => setShowQRModal(true)}
              className="mt-3 w-full bg-[#0F766E] hover:bg-[#115E59] text-white py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Quét VietQR</span>
            </button>
          )}
        </div>

        {/* KPI 2: Điện nước tiêu thụ */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Điện & Nước tháng này
              </span>
              <DoorOpen className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              142 <span className="text-sm font-normal text-slate-500">kWh</span> / 8 <span className="text-sm font-normal text-slate-500">m³</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Chốt chỉ số ngày 25 hàng tháng</p>
          </div>
          <Link
            to="/invoices"
            className="mt-3 text-xs text-[#0F766E] font-semibold hover:underline flex items-center gap-1"
          >
            <span>Xem chi tiết đồng hồ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* KPI 3: Yêu cầu sửa chữa */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Yêu cầu Sửa chữa
              </span>
              <Wrench className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
              {activeMaintenanceCount} <span className="text-sm font-normal text-slate-500">đang xử lý</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {maintenanceList.length} yêu cầu được ghi nhận
            </p>
          </div>
          <Link
            to="/maintenance"
            className="mt-3 text-xs text-[#0F766E] font-semibold hover:underline flex items-center gap-1"
          >
            <span>Theo dõi tiến độ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* KPI 4: Khách đến thăm */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Khách đến thăm
              </span>
              <Users className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
              {visitors.length} <span className="text-sm font-normal text-slate-500">lượt</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">An ninh sảnh kiểm soát 24/7</p>
          </div>
          <Link
            to="/visitors"
            className="mt-3 text-xs text-[#0F766E] font-semibold hover:underline flex items-center gap-1"
          >
            <span>Danh sách khách</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Current Invoice & Past Invoices (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Current Month Active Bill Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#0F766E]" />
                <h3 className="font-bold text-sm text-slate-900">Chi tiết Hóa đơn Kỳ này</h3>
              </div>
              {latestUnpaid ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase">
                  Chưa thanh toán
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                  Đã hoàn tất
                </span>
              )}
            </div>

            {latestUnpaid ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{latestUnpaid.invoiceCode}</h4>
                    <p className="text-xs text-slate-500">
                      Kỳ: Tháng {latestUnpaid.periodMonth}/{latestUnpaid.periodYear} • Hạn nộp:{" "}
                      <strong className="text-slate-800">{formatDateVN(latestUnpaid.dueDate)}</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Số tiền cần đóng:</span>
                    <span className="text-2xl font-bold text-[#0F766E] tabular-nums">
                      {formatCurrencyVND(latestUnpaid.balanceRemaining)}
                    </span>
                  </div>
                </div>

                {/* Breakdown items table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Khoản thu</th>
                        <th className="py-2 px-3 text-right">Số lượng</th>
                        <th className="py-2 px-3 text-right">Đơn giá</th>
                        <th className="py-2 px-3 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {latestUnpaid.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-medium text-slate-800">{item.description}</td>
                          <td className="py-2 px-3 text-right text-slate-500 font-mono">
                            {item.quantity}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-500 font-mono">
                            {formatCurrencyVND(item.unitPrice)}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">
                            {formatCurrencyVND(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Tự động gạch nợ sau 2 giây qua SePay Webhook</span>
                  </div>
                  <button
                    onClick={() => setShowQRModal(true)}
                    className="bg-[#0F766E] hover:bg-[#115E59] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Mở mã VietQR SePay để Thanh toán</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Không có dư nợ kỳ này</h4>
                <p className="text-xs text-slate-500">Cảm ơn bạn đã luôn hoàn tất tiền phòng đúng hạn!</p>
              </div>
            )}
          </div>

          {/* Past Invoices Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Lịch sử Hóa đơn các kỳ</h3>
              <Link to="/invoices" className="text-xs text-[#0F766E] font-semibold hover:underline flex items-center gap-1">
                <span>Xem tất cả hóa đơn</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold">
                    <th className="py-2.5 px-3">Mã Hóa đơn</th>
                    <th className="py-2.5 px-3">Kỳ tháng</th>
                    <th className="py-2.5 px-3 text-right">Tổng tiền</th>
                    <th className="py-2.5 px-3 text-right">Đã thanh toán</th>
                    <th className="py-2.5 px-3 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.slice(0, 4).map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{inv.invoiceCode}</td>
                      <td className="py-2.5 px-3 text-slate-600">Tháng {inv.periodMonth}/{inv.periodYear}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                        {formatCurrencyVND(inv.totalAmount)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-emerald-700 font-mono">
                        {formatCurrencyVND(inv.paidAmount)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inv.status === "Đã thanh toán"
                              ? "bg-emerald-100 text-emerald-800"
                              : inv.status === "Chưa thanh toán"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Maintenance, Notifications & Support (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Maintenance Requests */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#0F766E]" />
                <h3 className="font-bold text-sm text-slate-900">Yêu cầu Sửa chữa</h3>
              </div>
              <Link to="/maintenance" className="text-xs text-[#0F766E] font-semibold hover:underline flex items-center gap-1">
                <span>Tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {maintenanceList.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Chưa có sự cố nào được báo cáo</p>
            ) : (
              <div className="space-y-2.5">
                {maintenanceList.map((m) => (
                  <div key={m.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900">{m.title}</h4>
                      <p className="text-slate-500 mt-0.5 text-[11px]">
                        Gửi ngày {formatDateVN(m.createdAt)} • Mức ưu tiên: {m.priority}
                      </p>
                      {m.assignedStaffName && (
                        <p className="text-[11px] text-teal-800 font-medium mt-1">
                          Kỹ thuật viên phụ trách: {m.assignedStaffName}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        m.status === "Hoàn thành"
                          ? "bg-emerald-100 text-emerald-800"
                          : m.status === "Đang xử lý"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Link
              to="/maintenance"
              className="mt-2 w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Gửi Báo hỏng Mới</span>
            </Link>
          </div>

          {/* Building Announcements */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Thông báo từ Ban Quản lý</h3>
              </div>
              <Link to="/notifications" className="text-xs text-[#0F766E] font-semibold hover:underline flex items-center gap-1">
                <span>Tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <h4 className="font-bold text-slate-900">{n.title}</h4>
                  <p className="text-slate-600 mt-1 line-clamp-2 leading-relaxed text-[11px]">
                    {n.content}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{n.authorName} ({n.authorRole})</span>
                    <span>{formatDateVN(n.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 24/7 Support Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-teal-900 to-slate-900 text-white text-xs space-y-2 shadow-xs">
            <h4 className="font-bold text-sm flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-teal-400" />
              <span>Đường dây nóng Tòa nhà StayHub</span>
            </h4>
            <p className="text-teal-200 text-[11px] leading-relaxed">
              Cần trợ giúp khẩn cấp về an ninh, sự cố điện nước hoặc gửi chìa khóa:
            </p>
            <div className="pt-1 space-y-1 font-mono text-[11px]">
              <div>Trực ban Lễ tân & An ninh: <strong className="text-white">0901 234 567 (24/7)</strong></div>
              <div>Tổng đài Chăm sóc Khách hàng: <strong className="text-teal-300">1900 8899</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* SePay QR Code Modal */}
      {showQRModal && qrInfo && latestUnpaid && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-center">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#0F766E]" />
                <span className="font-bold text-sm text-slate-900">Thanh toán VietQR SePay</span>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="my-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <img
                src={qrInfo.qrImageUrl}
                alt="VietQR SePay"
                className="w-48 h-48 mx-auto rounded-lg shadow-xs bg-white p-1"
              />
              <p className="text-[11px] text-slate-500 mt-2">
                Quét mã trên app ngân hàng bất kỳ để tự động điền số tài khoản và cú pháp
              </p>
            </div>

            {/* Transfer Details with copy */}
            <div className="space-y-2 text-left text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Ngân hàng:</span>
                <span className="font-semibold text-slate-900">{qrInfo.bankName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Số tài khoản:</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                  <span>{qrInfo.accountNumber}</span>
                  <button
                    onClick={() => copyToClipboard(qrInfo.accountNumber)}
                    className="text-[10px] text-teal-700 bg-teal-50 px-1 py-0.5 rounded border border-teal-200 hover:bg-teal-100 cursor-pointer"
                  >
                    Chép
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Chủ tài khoản:</span>
                <span className="font-medium text-slate-900 text-[11px]">{qrInfo.accountHolder}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Số tiền:</span>
                <span className="font-bold text-[#0F766E] tabular-nums text-sm">
                  {formatCurrencyVND(qrInfo.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                <span className="text-slate-500">Nội dung CK:</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  <span>{qrInfo.transferContent}</span>
                  <button
                    onClick={() => copyToClipboard(qrInfo.transferContent)}
                    className="text-[10px] text-amber-800 bg-amber-100 px-1 py-0.5 rounded hover:bg-amber-200 cursor-pointer"
                  >
                    Chép
                  </button>
                </div>
              </div>
            </div>

            {copied && (
              <p className="text-[11px] text-emerald-600 font-semibold mt-2 animate-in fade-in">
                ✓ Đã sao chép vào bộ nhớ tạm!
              </p>
            )}

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-500 bg-slate-100 py-2 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Hệ thống tự động gạch nợ sau 2 giây khi chuyển khoản thành công</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * STAFF DASHBOARD VIEW
 */
const StaffDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { selectedBuildingId } = useBuilding();

  const maintenanceTasks = storageService
    .getMaintenanceRequests({ buildingId: selectedBuildingId })
    .filter((m) => m.assignedStaffId === currentUser?.id || m.status === "Mới");

  const unrecordedRooms = storageService
    .getApartments(selectedBuildingId)
    .filter((apt) => apt.status === "Đang thuê");

  const pendingVisitors = storageService
    .getVisitors({ buildingId: selectedBuildingId })
    .filter((v) => v.status === "Chờ duyệt");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Bàn làm việc Nhân viên Vận hành</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Nhân viên: <strong className="text-slate-800">{currentUser?.fullName}</strong> • Cơ sở phụ trách
          </p>
        </div>
        <Link
          to="/utilities"
          className="bg-[#0F766E] hover:bg-[#115E59] text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2"
        >
          <span>Ghi chỉ số Điện Nước</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Sửa chữa cần xử lý</span>
            <Wrench className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {maintenanceTasks.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Sự cố đang được phân công hoặc mới tạo</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Phòng cần chốt điện nước</span>
            <DoorOpen className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {unrecordedRooms.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Phòng đang có hợp đồng cư trú</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Khách thăm chờ duyệt</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {pendingVisitors.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Yêu cầu đăng ký từ cư dân</p>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Danh sách việc sửa chữa được giao</h3>
          <Link to="/maintenance" className="text-xs text-[#0F766E] font-medium hover:underline">
            Xem tất cả
          </Link>
        </div>

        {maintenanceTasks.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">Không có việc sửa chữa nào cần xử lý</p>
        ) : (
          <div className="space-y-3">
            {maintenanceTasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{task.requestCode}</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs font-semibold text-teal-800">
                      P.{task.apartmentCode} ({task.buildingName})
                    </span>
                  </div>
                  <h4 className="text-xs font-medium text-slate-800 mt-1">{task.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{task.description}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1.5">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      task.status === "Đang xử lý"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {task.status}
                  </span>
                  <Link
                    to="/maintenance"
                    className="text-xs font-semibold text-[#0F766E] hover:underline"
                  >
                    Cập nhật tiến độ →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * ADMIN & MANAGER DASHBOARD VIEW
 */
const AdminManagerDashboard: React.FC<{ role: string; buildingId: string }> = ({ role, buildingId }) => {
  const buildings = storageService.getBuildings();
  const apartments = storageService.getApartments(buildingId);
  const contracts = storageService.getContracts(buildingId);
  const invoices = storageService.getInvoices({ buildingId });
  const maintenance = storageService.getMaintenanceRequests({ buildingId });

  // Metrics computation from real application state
  const totalRooms = apartments.length;
  const occupiedRooms = apartments.filter((a) => a.status === "Đang thuê").length;
  const vacantRooms = apartments.filter((a) => a.status === "Trống").length;
  const reservedRooms = apartments.filter((a) => a.status === "Đã giữ chỗ").length;
  const maintenanceRooms = apartments.filter((a) => a.status === "Bảo trì").length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Invoiced & collected amounts
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalDebt = invoices.reduce((sum, inv) => sum + inv.balanceRemaining, 0);
  const overdueInvoices = invoices.filter((i) => i.isOverdue || (new Date(i.dueDate).getTime() < Date.now() && i.balanceRemaining > 0));

  const pendingContracts = contracts.filter((c) => c.status === "Chờ duyệt");
  const openMaintenance = maintenance.filter((m) => m.status !== "Hoàn thành" && m.status !== "Hủy");

  return (
    <div className="space-y-6">
      {/* Top Banner & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
            {role === "ADMIN" ? "Bảng Quản trị Toàn Chuỗi StayHub" : "Bảng Vận hành Cơ sở"}
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Dữ liệu tổng hợp theo thời gian thực từ 3 cơ sở • Múi giờ Asia/Ho_Chi_Minh
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/invoices"
            className="bg-[#0F766E] hover:bg-[#115E59] text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Xuất Hóa đơn Mới</span>
          </Link>
          <Link
            to="/contracts"
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3.5 py-2 rounded-lg text-xs font-medium shadow-xs flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Hợp đồng mới</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Occupancy */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tỷ lệ lấp đầy</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {occupancyRate}%
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Đang thuê: <strong className="text-slate-800">{occupiedRooms}</strong> / {totalRooms} phòng</span>
            <span>Trống: <strong className="text-emerald-700">{vacantRooms}</strong></span>
          </div>
        </div>

        {/* KPI 2: Revenue Collected */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tiền đã thu (Kỳ)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2 tabular-nums">
            {formatCurrencyVND(totalCollected)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tổng xuất hóa đơn: <span className="font-semibold text-slate-700">{formatCurrencyVND(totalInvoiced)}</span>
          </p>
        </div>

        {/* KPI 3: Accounts Receivable & Overdue */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Công nợ còn phải thu</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2 tabular-nums">
            {formatCurrencyVND(totalDebt)}
          </div>
          <p className="text-xs text-rose-700/80 mt-1">
            {overdueInvoices.length} hóa đơn đã quá hạn thanh toán
          </p>
        </div>

        {/* KPI 4: Pending Tasks & Maintenance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Công việc cần xử lý</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {pendingContracts.length + openMaintenance.length}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>HĐ chờ duyệt: <strong className="text-amber-800">{pendingContracts.length}</strong></span>
            <span>Sửa chữa: <strong className="text-blue-800">{openMaintenance.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Room Status Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rooms Breakdown of Current Building */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Tình trạng Phòng tại Cơ sở</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {apartments.length} phòng • {occupiedRooms} đang thuê • {vacantRooms} phòng trống • {reservedRooms} giữ chỗ
              </p>
            </div>
            <Link to="/contracts" className="text-xs text-[#0F766E] font-medium hover:underline">
              Quản lý hợp đồng
            </Link>
          </div>

          <div className="overflow-x-auto mt-3">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                  <th className="py-2.5 px-3">Phòng</th>
                  <th className="py-2.5 px-3 text-center">Tầng</th>
                  <th className="py-2.5 px-3 text-center">Diện tích</th>
                  <th className="py-2.5 px-3 text-right">Giá thuê</th>
                  <th className="py-2.5 px-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {apartments.slice(0, 7).map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900 font-mono">
                      P.{apt.roomCode}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-600 font-medium">Tầng {apt.floor}</td>
                    <td className="py-2.5 px-3 text-center text-slate-600">{apt.areaSqm} m²</td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-800 font-mono">
                      {formatCurrencyVND(apt.currentPrice)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          apt.status === "Đang thuê"
                            ? "bg-teal-100 text-teal-800"
                            : apt.status === "Trống"
                            ? "bg-emerald-100 text-emerald-800"
                            : apt.status === "Đã giữ chỗ"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Integration Status & Quick Gateway info */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Hạ tầng Tích hợp Hệ thống
            </h3>

            <div className="mt-4 space-y-3.5">
              {/* SePay */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-900">Cổng SePay VietQR</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                    Trực tuyến
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                  <p>Ngân hàng: <strong>{SEPAY_CONFIG.BANK_NAME}</strong></p>
                  <p>Số tài khoản: <strong className="font-mono">{SEPAY_CONFIG.ACCOUNT_NUMBER}</strong></p>
                  <p>Webhook: <code className="text-teal-800">{SEPAY_CONFIG.WEBHOOK_ENDPOINT}</code></p>
                </div>
              </div>

              {/* Zalo OA / ZNS */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span className="text-xs font-bold text-slate-900">Zalo ZNS Official</span>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">
                    Đã cấu hình
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                  <p>Tên OA: <strong>StayHub Living Support</strong></p>
                  <p>Trạng thái mẫu: <strong>4 Template đã duyệt</strong></p>
                  <p>Kênh: Gửi hóa đơn & nhắc thanh toán</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link
              to="/sepay"
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
            >
              <span>Kiểm tra Đối soát SePay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * ADMIN SYSTEM GOVERNANCE DASHBOARD
 * Exclusive to ADMIN role: Displays system overview, user governance, service health, and shortcuts to 4 core admin modules.
 */
const AdminSystemDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const users = storageService.getUsers();
  const buildings = storageService.getBuildings();
  const auditLogs = storageService.getAuditLogs().slice(0, 6);
  const health = storageService.getSystemHealth();

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const lockedUsers = users.filter((u) => !u.isActive).length;
  const adminUsers = users.filter((u) => u.role === "ADMIN").length;
  const managerUsers = users.filter((u) => u.role === "MANAGER").length;
  const staffUsers = users.filter((u) => u.role === "STAFF").length;
  const residentUsers = users.filter((u) => u.role === "RESIDENT").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
            Bảng Quản trị Hệ thống StayHub
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Dữ liệu tổng hợp theo thời gian thực từ toàn chuỗi 3 cơ sở • Múi giờ Asia/Ho_Chi_Minh
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/users"
            className="bg-[#0F766E] hover:bg-[#115E59] text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tạo Tài khoản</span>
          </Link>
          <Link
            to="/system-settings"
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3.5 py-2 rounded-lg text-xs font-medium shadow-xs flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Cấu hình</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards: System Health & Governance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Accounts */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Tài khoản Hệ thống</span>
            <Users className="w-4 h-4 text-[#0F766E]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">{totalUsers}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {adminUsers} Admin • {managerUsers} Quản lý • {staffUsers} NV • {residentUsers} Cư dân
          </p>
        </div>

        {/* Account Safety */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Tình trạng Tài khoản</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2 tabular-nums">
            {activeUsers} <span className="text-sm font-normal text-slate-500">Hoạt động</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {lockedUsers > 0 ? (
              <span className="text-rose-600 font-semibold">{lockedUsers} tài khoản đang bị khóa</span>
            ) : (
              <span className="text-emerald-600">100% tài khoản hoạt động bình thường</span>
            )}
          </p>
        </div>

        {/* Integration Status */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Cổng Tích hợp</span>
            <QrCode className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-teal-900 mt-2 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Trực tuyến</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            SePay: {health.sepayStatus.latencyMs}ms • Zalo: {health.zaloStatus.latencyMs}ms
          </p>
        </div>

        {/* Audit Log Count */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Nhật ký Audit Log</span>
            <ScrollText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {health.totalAuditLogs}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Lưu vết an ninh • Uptime: {health.uptime}
          </p>
        </div>
      </div>

      {/* 3 CORE ADMIN MODULE SHORTCUTS */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Chức năng Quản trị Hệ thống
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Module 1: Account Management */}
          <Link
            to="/users"
            className="group bg-white p-4 rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Quản trị Tài khoản</h4>
              <p className="text-xs text-slate-500 mt-1">
                Tạo mới, chỉnh sửa thông tin, đặt lại mật khẩu, khóa/mở khóa tài khoản người dùng các vai trò.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#0F766E]">
              <span>{totalUsers} Tài khoản</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 2: System Monitoring & Audit */}
          <Link
            to="/audit-logs"
            className="group bg-white p-4 rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <ScrollText className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Giám sát & Nhật ký Audit</h4>
              <p className="text-xs text-slate-500 mt-1">
                Kiểm tra toàn bộ vết thao tác thời gian thực, giám sát độ trễ API và an ninh toàn chuỗi.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#0F766E]">
              <span>{health.totalAuditLogs} Sự kiện ghi nhận</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 3: System Configuration */}
          <Link
            to="/system-settings"
            className="group bg-white p-4 rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Sliders className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Cấu hình Hệ thống</h4>
              <p className="text-xs text-slate-500 mt-1">
                Thiết lập tham số chuỗi StayHub, cấu hình SePay, Zalo ZNS, sao lưu & phục hồi dữ liệu JSON.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#0F766E]">
              <span>5 Nhóm Cấu hình</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* 2 Bottom Columns: Real-time Audit Feed & Facilities Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Audit Feed */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-[#0F766E]" />
              <h3 className="font-bold text-sm text-slate-900">Nhật ký Thao tác Gần đây</h3>
            </div>
            <Link to="/audit-logs" className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1">
              <span>Xem tất cả</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900">{log.userName}</strong>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
                      {log.userRole}
                    </span>
                    <span className="font-mono text-teal-800 font-bold text-[11px]">{log.action}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5 line-clamp-1">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono">
                  {formatDateVN(log.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Facilities Infrastructure */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0F766E]" />
              <h3 className="font-bold text-sm text-slate-900">Hạ tầng Cơ sở trong Chuỗi StayHub</h3>
            </div>
            <Link to="/users" className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1">
              <span>Phân bổ nhân sự</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {buildings.map((b) => (
              <div key={b.id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{b.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{b.address}</p>
                  <p className="text-[11px] text-teal-800 mt-1">
                    Quản lý cơ sở: <strong>{b.managerName}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 block">{b.totalRooms} phòng</span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                    Đang vận hành
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
