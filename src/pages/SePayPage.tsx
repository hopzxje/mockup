import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { storageService } from "../services/storage";
import { formatDateVN, formatDateTimeVN, formatCurrencyVND } from "../lib/utils";
import { SEPAY_CONFIG, SePayWebhookPayload } from "../services/integrations/sepay";
import { SePayTransaction, Invoice } from "../types";
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  Search,
  ExternalLink,
  Send,
  Database,
  FileText,
} from "lucide-react";

export const SePayPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"history" | "reconciliation">("history");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTxForReconcile, setSelectedTxForReconcile] = useState<SePayTransaction | null>(null);

  const transactions = storageService.getSePayTransactions();

  const filteredTxs = transactions.filter((tx) => {
    if (statusFilter !== "ALL" && tx.status !== statusFilter) return false;
    if (
      searchQuery &&
      !tx.gatewayTransactionId.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !tx.transferContent.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !tx.referenceCode.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const reconciliationList = transactions.filter(
    (tx) => tx.status === "Chờ đối soát" || tx.status === "Sai mã / Hóa đơn đóng" || tx.status === "Thanh toán thiếu" || tx.status === "Thanh toán thừa"
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Cổng Thanh toán Tự động SePay (VietQR)</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Xử lý thanh toán không dùng tiền mặt, đối soát tự động qua Webhook và kiểm soát rủi ro sai sót
          </p>
        </div>
      </div>

      {/* Gateway Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="font-bold text-sm text-slate-900">Cấu hình Tích hợp SePay Trực tuyến</h3>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Sẵn sàng kết nối
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <span className="text-slate-400 font-medium">Ngân hàng thụ hưởng:</span>
            <p className="font-bold text-slate-900 mt-1">{SEPAY_CONFIG.BANK_NAME}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <span className="text-slate-400 font-medium">Số tài khoản:</span>
            <p className="font-mono font-bold text-teal-800 mt-1 text-sm">{SEPAY_CONFIG.ACCOUNT_NUMBER}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <span className="text-slate-400 font-medium">Chủ tài khoản:</span>
            <p className="font-semibold text-slate-900 mt-1">{SEPAY_CONFIG.ACCOUNT_HOLDER}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <span className="text-slate-400 font-medium">Webhook Endpoint:</span>
            <p className="font-mono text-slate-700 mt-1 text-[11px] truncate">{SEPAY_CONFIG.WEBHOOK_ENDPOINT}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-4 text-xs font-medium">
        <button
          onClick={() => setActiveTab("history")}
          className={`py-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "history"
              ? "border-[#0F766E] text-[#0F766E] font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Lịch sử Giao dịch ({transactions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("reconciliation")}
          className={`py-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "reconciliation"
              ? "border-[#0F766E] text-[#0F766E] font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Danh sách Cần đối soát ({reconciliationList.length})</span>
        </button>
      </div>

      {/* TAB 1: HISTORY */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm mã GD, nội dung chuyển tiền..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium">Trạng thái:</span>
              {["ALL", "Đã khớp", "Thanh toán thiếu", "Thanh toán thừa", "Sai mã / Hóa đơn đóng"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === st
                      ? "bg-[#0F766E] text-white font-semibold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st === "ALL" ? "Tất cả" : st}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                    <th className="py-3 px-4">Mã GD SePay</th>
                    <th className="py-3 px-4">Thời gian nhận</th>
                    <th className="py-3 px-4">Nội dung chuyển khoản</th>
                    <th className="py-3 px-4 text-right">Số tiền nhận</th>
                    <th className="py-3 px-4">Hóa đơn đối chiếu</th>
                    <th className="py-3 px-4">Trạng thái đối soát</th>
                    <th className="py-3 px-4">Ghi chú đối chiếu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTxs.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{tx.gatewayTransactionId}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDateTimeVN(tx.transactionDate)}</td>
                      <td className="py-3 px-4 font-mono text-slate-800 max-w-xs">{tx.transferContent}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700 tabular-nums">
                        {formatCurrencyVND(tx.amount)}
                      </td>
                      <td className="py-3 px-4">
                        {tx.matchedInvoiceCode ? (
                          <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-mono">
                            {tx.matchedInvoiceCode}
                          </span>
                        ) : (
                          <span className="text-slate-400">---</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            tx.status === "Đã khớp"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : tx.status === "Thanh toán thiếu"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : tx.status === "Thanh toán thừa"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs text-[11px]">{tx.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RECONCILIATION QUEUE */}
      {activeTab === "reconciliation" && (
        <div className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <h4 className="font-bold flex items-center gap-1.5 text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Quy trình Đối soát Thủ công</span>
            </h4>
            <p>
              Các giao dịch chuyển thiếu, chuyển thừa hoặc nội dung không nhận diện được hóa đơn mở được gom tại đây để Quản lý cơ sở đối soát và gán bù trừ hóa đơn. Mọi thao tác đều được ghi vào Audit Log.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                  <th className="py-3 px-4">Mã GD</th>
                  <th className="py-3 px-4">Nội dung khách nhập</th>
                  <th className="py-3 px-4 text-right">Số tiền nhận</th>
                  <th className="py-3 px-4">Vấn đề cần xử lý</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reconciliationList.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{tx.gatewayTransactionId}</td>
                    <td className="py-3 px-4 font-mono text-slate-800">{tx.transferContent}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">{formatCurrencyVND(tx.amount)}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-rose-700">{tx.status}</span>
                      <p className="text-[11px] text-slate-500">{tx.notes}</p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedTxForReconcile(tx)}
                        className="text-[#0F766E] hover:underline font-semibold cursor-pointer"
                      >
                        Khớp thủ công
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MANUAL RECONCILIATION MODAL */}
      {selectedTxForReconcile && (
        <ManualReconcileModal
          transaction={selectedTxForReconcile}
          onClose={() => setSelectedTxForReconcile(null)}
          onSuccess={() => {
            setSelectedTxForReconcile(null);
            alert("Đã khớp thủ công và gạch nợ hóa đơn thành công!");
          }}
        />
      )}
    </div>
  );
};

/**
 * MANUAL RECONCILIATION MODAL COMPONENT
 */
const ManualReconcileModal: React.FC<{
  transaction: SePayTransaction;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ transaction, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Get all unpaid / partially paid invoices
  const invoices = storageService.getInvoices();
  const openInvoices = invoices.filter(
    (inv) => inv.status !== "Đã thanh toán" && inv.balanceRemaining > 0
  );

  // Filter invoices
  const filteredInvoices = openInvoices.filter((inv) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      inv.invoiceCode.toLowerCase().includes(term) ||
      inv.apartmentCode.toLowerCase().includes(term) ||
      inv.residentName.toLowerCase().includes(term) ||
      inv.buildingName.toLowerCase().includes(term)
    );
  });

  const selectedInvoice = openInvoices.find((i) => i.id === selectedInvoiceId);

  // Remaining balance after applying transaction amount
  const newBalance = selectedInvoice
    ? Math.max(0, selectedInvoice.balanceRemaining - transaction.amount)
    : 0;
  const isFullyPaid = selectedInvoice ? newBalance === 0 : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!selectedInvoiceId) {
      setErrorMsg("Vui lòng chọn một hóa đơn để khớp gạch nợ.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      storageService.reconcileTransactionManually(
        transaction.id,
        selectedInvoiceId,
        currentUser,
        notes.trim() || undefined
      );
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Có lỗi xảy ra khi khớp thủ công");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-teal-700" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Đối Soát & Khớp Thủ Công Giao Dịch
              </h3>
              <p className="text-[11px] text-slate-500">
                Gán số tiền từ giao dịch ngân hàng vào hóa đơn thực tế và gạch nợ tự động
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium shrink-0 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs overflow-y-auto pr-1 flex-1">
          {/* Transaction Info Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Giao dịch chuyển khoản SePay:
              </span>
              <span className="font-bold text-teal-700 text-sm font-mono tabular-nums">
                +{formatCurrencyVND(transaction.amount)}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-slate-700">
              <div>
                <span className="text-slate-500">Mã GD Gateway:</span>{" "}
                <strong className="font-mono text-slate-900">{transaction.gatewayTransactionId}</strong>
              </div>
              <div>
                <span className="text-slate-500">Ngân hàng:</span>{" "}
                <strong>{transaction.bankBrandName || "VietQR"}</strong>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500">Nội dung CK:</span>{" "}
                <strong className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-900">
                  {transaction.transferContent}
                </strong>
              </div>
              {transaction.notes && (
                <div className="sm:col-span-2 text-rose-600 text-[11px]">
                  <span>Nguyên nhân chưa khớp:</span> <em>{transaction.notes}</em>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Picker Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-700" />
                <span>Chọn Hóa đơn cần gạch nợ ({openInvoices.length} hóa đơn đang nợ):</span>
              </label>
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm phòng, tên khách..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white"
                />
              </div>
            </div>

            {filteredInvoices.length === 0 ? (
              <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Không tìm thấy hóa đơn chưa thanh toán nào phù hợp.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                {filteredInvoices.map((inv) => {
                  const isSelected = selectedInvoiceId === inv.id;
                  const isExactAmount = inv.balanceRemaining === transaction.amount;
                  return (
                    <div
                      key={inv.id}
                      onClick={() => setSelectedInvoiceId(inv.id)}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-teal-50 border-teal-500 shadow-xs"
                          : "bg-white border-slate-200 hover:border-teal-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="invoice-select"
                          checked={isSelected}
                          onChange={() => setSelectedInvoiceId(inv.id)}
                          className="text-teal-600 focus:ring-teal-500"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 font-mono">{inv.invoiceCode}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                              P.{inv.apartmentCode}
                            </span>
                            {isExactAmount && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Khớp số tiền 100%
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Khách: <strong className="text-slate-700">{inv.residentName}</strong> • {inv.buildingName} • Kỳ {inv.periodMonth}/{inv.periodYear}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-slate-900 font-mono">
                          {formatCurrencyVND(inv.balanceRemaining)}
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          Tổng: {formatCurrencyVND(inv.totalAmount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Calculation Preview when Invoice Selected */}
          {selectedInvoice && (
            <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 space-y-2">
              <div className="font-bold text-teal-900 flex items-center justify-between">
                <span>Dự kiến kết quả gạch nợ:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isFullyPaid ? "bg-emerald-200 text-emerald-900" : "bg-amber-200 text-amber-900"
                }`}>
                  Trạng thái sau khớp: {isFullyPaid ? "Đã thanh toán đủ" : "Thanh toán một phần"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                <div className="bg-white p-2 rounded-lg border border-teal-100">
                  <span className="text-slate-500 block text-[10px]">Nợ hiện tại</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {formatCurrencyVND(selectedInvoice.balanceRemaining)}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-teal-100">
                  <span className="text-slate-500 block text-[10px]">Tiền từ SePay</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    + {formatCurrencyVND(transaction.amount)}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-teal-100">
                  <span className="text-slate-500 block text-[10px]">Còn nợ sau khớp</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {formatCurrencyVND(newBalance)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Notes input */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Ghi chú đối soát (tùy chọn):
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Khách viết nhầm nội dung CK, đã xác minh biên lai qua Zalo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!selectedInvoiceId || isSubmitting}
              className={`px-4 py-2 rounded-lg font-semibold shadow-xs flex items-center gap-1.5 transition-colors ${
                selectedInvoiceId && !isSubmitting
                  ? "bg-[#0F766E] hover:bg-[#115E59] text-white cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Đang xử lý..." : "Xác nhận Khớp & Gạch Nợ"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
