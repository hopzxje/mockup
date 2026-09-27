import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useBuilding } from "../context/BuildingContext";
import { storageService } from "../services/storage";
import { formatDateVN, formatCurrencyVND } from "../lib/utils";
import { Invoice, InvoiceStatus } from "../types";
import { generateSePayQR, SEPAY_CONFIG } from "../services/integrations/sepay";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import {
  Receipt,
  Search,
  Plus,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Calendar,
  CreditCard,
  Building,
  Download,
  Loader2,
  FileText,
  PlusCircle,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";

export const InvoicesPage: React.FC = () => {
  const { currentUser, currentRole } = useAuth();
  const { selectedBuildingId } = useBuilding();

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [monthFilter, setMonthFilter] = useState<number>(0); // 0 = all

  // Modals
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const invoiceSheetRef = useRef<HTMLDivElement>(null);

  const generateDirectPDF = (inv: Invoice) => {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const fileName = `Hoa_Don_${inv.invoiceCode}_P${inv.apartmentCode}.pdf`;

    pdf.setFontSize(10);
    pdf.setTextColor(15, 118, 110);
    pdf.text("HE THONG CAN HO STAYHUB LIVING CHAIN", 105, 16, { align: "center" });

    pdf.setFontSize(8.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`${inv.buildingName || "StayHub"} - Hotline: 1900 8899 - Email: hotro@stayhub.vn`, 105, 21, { align: "center" });

    pdf.setFontSize(16);
    pdf.setTextColor(15, 23, 42);
    pdf.text("HOA DON TIEN PHONG & TIEN ICH", 105, 30, { align: "center" });

    pdf.setFontSize(9.5);
    pdf.setTextColor(71, 85, 105);
    pdf.text(`Ky: Thang ${inv.periodMonth}/${inv.periodYear}   |   So: ${inv.invoiceCode}   |   Phong: P.${inv.apartmentCode}`, 105, 36, { align: "center" });

    pdf.setDrawColor(15, 23, 42);
    pdf.setLineWidth(0.5);
    pdf.line(15, 41, 195, 41);

    // Resident info
    pdf.setFontSize(9.5);
    pdf.setTextColor(51, 65, 85);
    pdf.text(`Khach thue: ${inv.residentName}`, 15, 48);
    pdf.text(`So dien thoai: ${inv.residentPhone}`, 15, 54);
    pdf.text(`Phong luu tru: P.${inv.apartmentCode}`, 15, 60);

    pdf.text(`Ngay phat hanh: ${formatDateVN(inv.issueDate)}`, 195, 48, { align: "right" });
    pdf.text(`Han thanh toan: ${formatDateVN(inv.dueDate)}`, 195, 54, { align: "right" });
    pdf.text(`Trang thai: ${inv.status}`, 195, 60, { align: "right" });

    pdf.line(15, 65, 195, 65);

    // Items table header
    pdf.setFillColor(241, 245, 249);
    pdf.rect(15, 69, 180, 8, "F");
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(9);
    pdf.text("STT", 18, 74.5);
    pdf.text("Khoan muc chi phi", 32, 74.5);
    pdf.text("So luong", 120, 74.5, { align: "center" });
    pdf.text("Don gia (VND)", 155, 74.5, { align: "right" });
    pdf.text("Thanh tien (VND)", 192, 74.5, { align: "right" });

    let y = 83;
    inv.items.forEach((item, idx) => {
      pdf.setTextColor(71, 85, 105);
      pdf.text(`${idx + 1}`, 18, y);
      pdf.setTextColor(15, 23, 42);
      pdf.text(item.description, 32, y);
      pdf.text(`${item.quantity}`, 120, y, { align: "center" });
      pdf.text(formatCurrencyVND(item.unitPrice), 155, y, { align: "right" });
      pdf.text(formatCurrencyVND(item.amount), 192, y, { align: "right" });
      y += 7;
    });

    pdf.line(15, y + 2, 195, y + 2);
    y += 9;

    pdf.setFontSize(10);
    pdf.setTextColor(15, 23, 42);
    pdf.text("TONG CONG TIEN THANH TOAN:", 130, y, { align: "right" });
    pdf.text(formatCurrencyVND(inv.totalAmount), 192, y, { align: "right" });
    y += 6;

    pdf.setTextColor(16, 185, 129);
    pdf.text("So tien da thanh toan:", 130, y, { align: "right" });
    pdf.text(formatCurrencyVND(inv.paidAmount), 192, y, { align: "right" });
    y += 6;

    pdf.setTextColor(225, 29, 72);
    pdf.text("SO TIEN CON PHAI THU:", 130, y, { align: "right" });
    pdf.text(formatCurrencyVND(inv.balanceRemaining), 192, y, { align: "right" });
    y += 18;

    pdf.setTextColor(51, 65, 85);
    pdf.text("Nguoi lap hoa don", 50, y, { align: "center" });
    pdf.text("Nguoi nop tien / Cu dan", 160, y, { align: "center" });
    y += 16;
    pdf.setFontSize(10);
    pdf.setTextColor(15, 23, 42);
    pdf.text(inv.createdByName || "Nguyen Van Hung", 50, y, { align: "center" });
    pdf.text(inv.residentName, 160, y, { align: "center" });

    const blob = pdf.output("blob");
    const blobUrl = URL.createObjectURL(blob);
    setDownloadUrl(blobUrl);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  };

  const triggerPDFDownload = async (inv: Invoice) => {
    setIsExportingPDF(true);
    setExportSuccess(false);

    try {
      if (!invoiceSheetRef.current) {
        generateDirectPDF(inv);
        setExportSuccess(true);
        return;
      }

      const dataUrl = await toPng(invoiceSheetRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Image render failed"));
      });

      const imgWidth = 210; // A4 width mm
      const pageHeight = 297; // A4 height mm
      const imgHeight = (img.height * imgWidth) / img.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `Hoa_Don_${inv.invoiceCode}_P${inv.apartmentCode}.pdf`;
      const pdfBlob = pdf.output("blob");
      const blobUrl = URL.createObjectURL(pdfBlob);
      setDownloadUrl(blobUrl);
      setExportSuccess(true);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
    } catch (err) {
      console.error("Lỗi xuất PDF html-to-image, chuyển sang tạo PDF trực tiếp:", err);
      try {
        generateDirectPDF(inv);
        setExportSuccess(true);
      } catch (fallbackErr) {
        console.error("Lỗi fallback PDF:", fallbackErr);
      }
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleOpenExportModal = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setShowPrintModal(true);
    setExportSuccess(false);
  };

  let invoices = storageService.getInvoices({ buildingId: selectedBuildingId });
  if (currentRole === "RESIDENT") {
    invoices = invoices.filter(
      (i) => i.residentPhone === currentUser?.phoneNumber || i.residentId === currentUser?.residentId
    );
  }

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter !== "ALL" && inv.status !== statusFilter) return false;
    if (monthFilter !== 0 && inv.periodMonth !== monthFilter) return false;
    if (
      searchQuery &&
      !inv.invoiceCode.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !inv.residentName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !inv.apartmentCode.includes(searchQuery)
    ) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (inv: Invoice) => {
    if (inv.isOverdue || (new Date(inv.dueDate).getTime() < Date.now() && inv.balanceRemaining > 0)) {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-rose-600" /> Quá hạn
        </span>
      );
    }
    switch (inv.status) {
      case "Đã thanh toán":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Đã thanh toán</span>;
      case "Thanh toán một phần":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Đã trả 1 phần</span>;
      case "Chưa thanh toán":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Chưa thanh toán</span>;
      case "Nháp":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">Nháp</span>;
      case "Đã hủy":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-200 text-slate-600 border border-slate-300">Đã hủy</span>;
    }
  };

  const handleOpenQR = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setShowQRModal(true);
  };

  const handleOpenPrint = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setShowPrintModal(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrInfo = selectedInvoice
    ? generateSePayQR({
        apartmentCode: selectedInvoice.apartmentCode,
        invoiceCode: selectedInvoice.invoiceCode,
        amount: selectedInvoice.balanceRemaining,
      })
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Quản lý Hóa đơn & Thu phí</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Lập hóa đơn tiền phòng, tiền điện nước snapshot, in ấn chuyên nghiệp và thanh toán tự động qua SePay
          </p>
        </div>

        {currentRole !== "RESIDENT" && (
          <button
            onClick={() => setShowGenerateModal(true)}
            className="bg-[#0F766E] hover:bg-[#115E59] text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Lập Hóa đơn Mới</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo mã HĐ, tên cư dân, số phòng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Kỳ:</span>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(parseInt(e.target.value))}
              className="border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 font-semibold"
            >
              <option value={0}>Tất cả các kỳ</option>
              <option value={9}>Tháng 09/2026</option>
              <option value={8}>Tháng 08/2026</option>
              <option value={7}>Tháng 07/2026</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Trạng thái:</span>
            {["ALL", "Chưa thanh toán", "Thanh toán một phần", "Đã thanh toán"].map((st) => (
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
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                <th className="py-3 px-4">Mã Hóa đơn</th>
                <th className="py-3 px-4">Phòng</th>
                <th className="py-3 px-4">Người đại diện</th>
                <th className="py-3 px-4">Kỳ hóa đơn</th>
                <th className="py-3 px-4">Hạn thanh toán</th>
                <th className="py-3 px-4 text-right">Tổng tiền</th>
                <th className="py-3 px-4 text-right">Đã thanh toán</th>
                <th className="py-3 px-4 text-right">Còn nợ</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{inv.invoiceCode}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      P.{inv.apartmentCode}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-medium">{inv.residentName}</td>
                  <td className="py-3 px-4 text-slate-700">
                    Tháng {inv.periodMonth < 10 ? "0" + inv.periodMonth : inv.periodMonth}/{inv.periodYear}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{formatDateVN(inv.dueDate)}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">
                    {formatCurrencyVND(inv.totalAmount)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-700 tabular-nums">
                    {formatCurrencyVND(inv.paidAmount)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-rose-700 tabular-nums">
                    {formatCurrencyVND(inv.balanceRemaining)}
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(inv)}</td>
                  <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                    {inv.balanceRemaining > 0 && (
                      <button
                        onClick={() => handleOpenQR(inv)}
                        className="text-white bg-[#0F766E] hover:bg-[#115E59] px-2.5 py-1 rounded text-xs font-semibold shadow-2xs"
                      >
                        Quét QR
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenExportModal(inv)}
                      className="text-teal-800 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded text-xs font-semibold border border-teal-200 transition-colors cursor-pointer"
                      title="Xuất hóa đơn & Tải file PDF"
                    >
                      Xuất hoá đơn
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEPAY QR PAYMENT MODAL */}
      {showQRModal && qrInfo && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-center">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#0F766E]" />
                <span className="font-bold text-sm text-slate-900">
                  Thanh toán Hóa đơn {selectedInvoice.invoiceCode}
                </span>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="my-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <img
                src={qrInfo.qrImageUrl}
                alt="VietQR SePay"
                className="w-48 h-48 mx-auto rounded-lg shadow-xs bg-white p-1"
              />
              <p className="text-[11px] text-slate-500 mt-2">
                Mở ứng dụng Mobile Banking quét mã VietQR tự động khớp tiền
              </p>
            </div>

            {/* Bank details & copy */}
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
                    className="text-[10px] text-teal-700 bg-teal-50 px-1 py-0.5 rounded border border-teal-200 hover:bg-teal-100"
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
                <span className="text-slate-500">Số tiền cần đóng:</span>
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
                    className="text-[10px] text-amber-800 bg-amber-100 px-1 py-0.5 rounded hover:bg-amber-200"
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
              <span>Đang lắng nghe Webhook SePay theo thời gian thực...</span>
            </div>
          </div>
        </div>
      )}

      {/* PRINT INVOICE MODAL */}
      {showPrintModal && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            {/* Action Bar */}
            <div className="no-print flex items-center justify-between pb-4 mb-4 border-b border-slate-100 flex-wrap gap-2">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Xuất Hóa Đơn • {selectedInvoice.invoiceCode}
                </span>
                <span className="text-[11px] text-slate-400">
                  Xem trước và tải về file PDF hoặc in trực tiếp
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerPDFDownload(selectedInvoice)}
                  disabled={isExportingPDF}
                  className="bg-[#0F766E] hover:bg-[#115E59] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isExportingPDF ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{isExportingPDF ? "Đang tạo PDF..." : "Xuất File PDF (.pdf)"}</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>

            {exportSuccess && downloadUrl && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 animate-in fade-in flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">
                    Đã tạo file PDF thành công! Nếu tải xuống chưa tự động bắt đầu:
                  </span>
                </div>
                <a
                  href={downloadUrl}
                  download={`Hoa_Don_${selectedInvoice.invoiceCode}_P${selectedInvoice.apartmentCode}.pdf`}
                  className="font-bold text-teal-800 hover:text-teal-900 bg-white px-3 py-1 rounded-md border border-emerald-200 shadow-2xs"
                >
                  Bấm vào đây để tải ngay
                </a>
              </div>
            )}

            {/* PRINTABLE / EXPORTABLE INVOICE SHEET */}
            <div ref={invoiceSheetRef} className="p-8 bg-white text-slate-900 font-sans border border-slate-200 rounded-xl shadow-xs">
              {/* Centered Top Header */}
              <div className="text-center pb-5 border-b-2 border-slate-900">
                <p className="text-xs font-bold tracking-widest text-[#0F766E] uppercase">
                  HỆ THỐNG CĂN HỘ STAYHUB LIVING CHAIN
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedInvoice.buildingName} • Hotline: 1900 8899 • Email: hotro@stayhub.vn
                </p>

                {/* Main Prominent Centered Title */}
                <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase mt-3">
                  {selectedInvoice.title || "HÓA ĐƠN TIỀN PHÒNG & TIỆN ÍCH"}
                </h1>
                
                <div className="flex items-center justify-center gap-2.5 text-xs text-slate-600 mt-1.5 flex-wrap">
                  <span>Kỳ: <strong className="text-slate-800">Tháng {selectedInvoice.periodMonth}/{selectedInvoice.periodYear}</strong></span>
                  <span className="text-slate-300">•</span>
                  <span>Số HĐ: <strong className="font-mono text-teal-800">{selectedInvoice.invoiceCode}</strong></span>
                  <span className="text-slate-300">•</span>
                  <span>Phòng: <strong className="text-teal-800">P.{selectedInvoice.apartmentCode}</strong></span>
                </div>
              </div>

              {/* Resident & Room Details */}
              <div className="grid grid-cols-2 gap-6 py-4 text-xs border-b border-slate-200">
                <div className="space-y-1.5">
                  <p><span className="text-slate-500 inline-block w-24">Khách thuê:</span> <strong className="text-slate-900 text-sm">{selectedInvoice.residentName}</strong></p>
                  <p><span className="text-slate-500 inline-block w-24">Số điện thoại:</span> <span className="font-medium text-slate-800">{selectedInvoice.residentPhone}</span></p>
                  <p><span className="text-slate-500 inline-block w-24">Phòng:</span> <strong className="text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">Phòng {selectedInvoice.apartmentCode}</strong></p>
                </div>
                <div className="space-y-1.5 text-right">
                  <p><span className="text-slate-500">Ngày phát hành:</span> <strong className="text-slate-800">{formatDateVN(selectedInvoice.issueDate)}</strong></p>
                  <p><span className="text-slate-500">Hạn thanh toán:</span> <strong className="text-rose-700">{formatDateVN(selectedInvoice.dueDate)}</strong></p>
                  <p><span className="text-slate-500">Trạng thái:</span> <strong className="text-slate-900">{selectedInvoice.status}</strong></p>
                </div>
              </div>

              {/* Items Table */}
              <div className="py-4">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b-2 border-slate-200 font-bold text-slate-800 bg-slate-50/70">
                      <th className="py-2.5 px-3 text-center w-12">STT</th>
                      <th className="py-2.5 px-3">Khoản mục chi phí</th>
                      <th className="py-2.5 px-3 text-center w-36">Số lượng / Chỉ số</th>
                      <th className="py-2.5 px-3 text-right w-32">Đơn giá</th>
                      <th className="py-2.5 px-3 text-right w-36">Thành tiền (₫)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/40">
                        <td className="py-2.5 px-3 text-center text-slate-500">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{item.description}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">{formatCurrencyVND(item.unitPrice)}</td>
                        <td className="py-2.5 px-3 text-right font-bold tabular-nums text-slate-900">
                          {formatCurrencyVND(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total & Balances */}
              <div className="pt-4 border-t-2 border-slate-900 text-xs space-y-1.5 text-right">
                <div className="flex justify-between font-bold text-sm">
                  <span>TỔNG CỘNG TIỀN THANH TOÁN:</span>
                  <span className="text-slate-900 text-base">{formatCurrencyVND(selectedInvoice.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Số tiền đã thanh toán:</span>
                  <span>{formatCurrencyVND(selectedInvoice.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-rose-700 font-bold text-sm pt-1 border-t border-slate-200">
                  <span>SỐ TIỀN CÒN PHẢI THU:</span>
                  <span className="text-base">{formatCurrencyVND(selectedInvoice.balanceRemaining)}</span>
                </div>
              </div>

              {/* Footer notes & sign */}
              <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-2 text-xs text-center">
                <div>
                  <p className="font-bold text-slate-800">Người lập hóa đơn</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">(Ký, ghi rõ họ tên)</p>
                  <p className="mt-14 font-bold text-slate-900 text-sm">
                    {selectedInvoice.createdByName || currentUser?.fullName || "Nguyễn Văn Hùng"}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-slate-800">Người nộp tiền / Cư dân</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">(Ký, ghi rõ họ tên)</p>
                  <p className="mt-14 font-bold text-slate-900 text-sm">{selectedInvoice.residentName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GENERATE INVOICE MODAL */}
      {showGenerateModal && (
        <GenerateInvoiceModal
          onClose={() => setShowGenerateModal(false)}
          onSuccess={() => {
            setShowGenerateModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

interface FeeItemDraft {
  id: string;
  selected: boolean;
  itemType: "RENT" | "ELECTRICITY" | "WATER" | "SERVICE_FEE" | "OTHER";
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  isCustom?: boolean;
  detailSnapshot?: any;
}

const GenerateInvoiceModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const { selectedBuildingId } = useBuilding();

  const contracts = storageService
    .getContracts(selectedBuildingId)
    .filter((c) => c.status === "Đang hiệu lực");

  const [contractId, setContractId] = useState(contracts[0]?.id || "");
  const [invoiceTitle, setInvoiceTitle] = useState("HÓA ĐƠN TIỀN PHÒNG & TIỆN ÍCH");
  const [periodMonth, setPeriodMonth] = useState<number>(9);
  const [periodYear, setPeriodYear] = useState<number>(2026);
  const [dueDate, setDueDate] = useState("2026-10-05");
  const [notes, setNotes] = useState("Vui lòng thanh toán bằng hình thức quét mã QR SePay tự động.");

  const [feeItems, setFeeItems] = useState<FeeItemDraft[]>([]);

  // Build candidate fee items whenever contract or period changes
  React.useEffect(() => {
    const selectedContract = contracts.find((c) => c.id === contractId);
    if (!selectedContract) return;

    const apartments = storageService.getApartments(selectedBuildingId);
    const apt = apartments.find((a) => a.id === selectedContract.apartmentId);
    const readings = storageService.getUtilityReadings();
    const activeFees = storageService.getFees(selectedBuildingId).filter((f) => f.isActive);

    const items: FeeItemDraft[] = [];

    // 1. Rent
    items.push({
      id: "fee-rent",
      selected: true,
      itemType: "RENT",
      description: `Tiền thuê phòng P.${selectedContract.apartmentCode} (Tháng ${periodMonth < 10 ? "0" + periodMonth : periodMonth}/${periodYear})`,
      quantity: 1,
      unitPrice: selectedContract.rentPrice,
      amount: selectedContract.rentPrice,
    });

    // 2. Electricity
    const elecReading = apt
      ? readings.find(
          (u) =>
            u.apartmentId === apt.id &&
            u.utilityType === "ELECTRICITY" &&
            u.periodMonth === periodMonth &&
            u.periodYear === periodYear
        )
      : undefined;

    if (elecReading) {
      items.push({
        id: "fee-elec",
        selected: true,
        itemType: "ELECTRICITY",
        description: `Tiền điện (${elecReading.previousIndex} -> ${elecReading.currentIndex} = ${elecReading.consumption} kWh x ${formatCurrencyVND(elecReading.unitPrice)})`,
        quantity: elecReading.consumption,
        unitPrice: elecReading.unitPrice,
        amount: elecReading.totalAmount,
        detailSnapshot: {
          previousIndex: elecReading.previousIndex,
          currentIndex: elecReading.currentIndex,
          consumption: elecReading.consumption,
          unitPrice: elecReading.unitPrice,
        },
      });
    } else {
      // Default electricity item if not recorded yet
      items.push({
        id: "fee-elec-manual",
        selected: false,
        itemType: "ELECTRICITY",
        description: `Tiền điện Tháng ${periodMonth}/${periodYear} (Chưa chốt chỉ số)`,
        quantity: 1,
        unitPrice: 0,
        amount: 0,
      });
    }

    // 3. Water
    const waterReading = apt
      ? readings.find(
          (u) =>
            u.apartmentId === apt.id &&
            u.utilityType === "WATER" &&
            u.periodMonth === periodMonth &&
            u.periodYear === periodYear
        )
      : undefined;

    if (waterReading) {
      items.push({
        id: "fee-water",
        selected: true,
        itemType: "WATER",
        description: `Tiền nước (${waterReading.previousIndex} -> ${waterReading.currentIndex} = ${waterReading.consumption} m³ x ${formatCurrencyVND(waterReading.unitPrice)})`,
        quantity: waterReading.consumption,
        unitPrice: waterReading.unitPrice,
        amount: waterReading.totalAmount,
        detailSnapshot: {
          previousIndex: waterReading.previousIndex,
          currentIndex: waterReading.currentIndex,
          consumption: waterReading.consumption,
          unitPrice: waterReading.unitPrice,
        },
      });
    } else {
      // Default water item if not recorded yet
      items.push({
        id: "fee-water-manual",
        selected: false,
        itemType: "WATER",
        description: `Tiền nước Tháng ${periodMonth}/${periodYear} (Chưa chốt chỉ số)`,
        quantity: 1,
        unitPrice: 0,
        amount: 0,
      });
    }

    // 4. Active Building Service Fees
    activeFees.forEach((fee, idx) => {
      items.push({
        id: `fee-svc-${fee.id || idx}`,
        selected: true,
        itemType: "SERVICE_FEE",
        description: `${fee.name} (${fee.unitName})`,
        quantity: 1,
        unitPrice: fee.unitPrice,
        amount: fee.unitPrice,
      });
    });

    setFeeItems(items);
  }, [contractId, periodMonth, periodYear, selectedBuildingId]);

  // Handlers for fee items
  const toggleSelectFee = (id: string) => {
    setFeeItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const updateFeeQuantity = (id: string, qty: number) => {
    setFeeItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const validQty = Math.max(0, qty);
          return {
            ...item,
            quantity: validQty,
            amount: validQty * item.unitPrice,
          };
        }
        return item;
      })
    );
  };

  const updateFeeUnitPrice = (id: string, price: number) => {
    setFeeItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const validPrice = Math.max(0, price);
          return {
            ...item,
            unitPrice: validPrice,
            amount: item.quantity * validPrice,
          };
        }
        return item;
      })
    );
  };

  const updateFeeDescription = (id: string, desc: string) => {
    setFeeItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, description: desc } : item
      )
    );
  };

  const handleAddCustomFee = () => {
    const newItem: FeeItemDraft = {
      id: `fee-custom-${Date.now()}`,
      selected: true,
      itemType: "OTHER",
      description: "Phí dịch vụ phát sinh khác",
      quantity: 1,
      unitPrice: 100000,
      amount: 100000,
      isCustom: true,
    };
    setFeeItems((prev) => [...prev, newItem]);
  };

  const handleRemoveCustomFee = (id: string) => {
    setFeeItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSelectAll = (select: boolean) => {
    setFeeItems((prev) => prev.map((item) => ({ ...item, selected: select })));
  };

  // Calculations
  const selectedFees = feeItems.filter((i) => i.selected);
  const totalAmount = selectedFees.reduce((sum, item) => sum + item.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!invoiceTitle.trim()) {
      alert("Vui lòng nhập tên hóa đơn!");
      return;
    }

    if (selectedFees.length === 0) {
      alert("Vui lòng chọn ít nhất 1 khoản phí để đưa vào hóa đơn!");
      return;
    }

    try {
      const inv = storageService.createInvoice(
        {
          contractId,
          title: invoiceTitle.trim(),
          periodMonth,
          periodYear,
          dueDate,
          notes,
          selectedItems: selectedFees.map((sf) => ({
            itemType: sf.itemType,
            description: sf.description,
            quantity: sf.quantity,
            unitPrice: sf.unitPrice,
            amount: sf.amount,
            detailSnapshot: sf.detailSnapshot,
          })),
        },
        currentUser
      );

      alert(`Đã lập hóa đơn "${inv.title}" (${inv.invoiceCode}) thành công với ${selectedFees.length} khoản phí!`);
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-7 shadow-2xl border border-slate-200 my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#0F766E]" />
            <h3 className="font-bold text-base text-slate-900">Lập Hóa Đơn Mới</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs overflow-y-auto pr-1 flex-1">
          {/* 1. TÊN HÓA ĐƠN (BẮT BUỘC) */}
          <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200 space-y-1.5">
            <label className="block text-slate-800 font-bold text-xs">
              Tên hóa đơn <span className="text-rose-600">*</span>:
            </label>
            <input
              type="text"
              value={invoiceTitle}
              onChange={(e) => setInvoiceTitle(e.target.value)}
              placeholder="VD: HÓA ĐƠN TIỀN PHÒNG & TIỆN ÍCH"
              className="w-full px-3.5 py-2.5 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white font-bold text-slate-900 text-sm shadow-2xs"
              required
            />
          </div>

          {/* 2. CHỌN HỢP ĐỒNG & KỲ THANH TOÁN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <label className="block text-slate-700 font-semibold mb-1">Chọn Hợp đồng / Phòng:</label>
              <select
                value={contractId}
                onChange={(e) => setContractId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white font-semibold text-slate-800"
              >
                {contracts.map((c) => (
                  <option key={c.id} value={c.id}>
                    P.{c.apartmentCode} - {c.residentName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Kỳ thanh toán:</label>
              <div className="grid grid-cols-2 gap-1.5">
                <select
                  value={periodMonth}
                  onChange={(e) => setPeriodMonth(parseInt(e.target.value))}
                  className="w-full px-2 py-2 border border-slate-200 rounded-lg bg-white font-medium"
                >
                  {[7, 8, 9, 10, 11, 12].map((m) => (
                    <option key={m} value={m}>Tháng {m < 10 ? "0" + m : m}</option>
                  ))}
                </select>
                <select
                  value={periodYear}
                  onChange={(e) => setPeriodYear(parseInt(e.target.value))}
                  className="w-full px-2 py-2 border border-slate-200 rounded-lg bg-white font-medium"
                >
                  <option value={2026}>2026</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Hạn chót thanh toán:</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-semibold text-slate-800"
                required
              />
            </div>
          </div>

          {/* 3. CHỌN CÁC KHOẢN PHÍ ĐỂ THANH TOÁN */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="bg-slate-100/80 px-4 py-2.5 flex items-center justify-between border-b border-slate-200 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">
                  Chọn các khoản phí thanh toán:
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                  {selectedFees.length} / {feeItems.length} khoản
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectAll(true)}
                  className="text-teal-700 hover:underline font-semibold text-[11px] cursor-pointer"
                >
                  Chọn tất cả
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => handleSelectAll(false)}
                  className="text-slate-500 hover:underline font-medium text-[11px] cursor-pointer"
                >
                  Bỏ chọn hết
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={handleAddCustomFee}
                  className="bg-white hover:bg-slate-50 border border-slate-300 text-[#0F766E] px-3 py-1 rounded text-[11px] font-semibold flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Thêm khoản thu khác</span>
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto bg-white">
              {feeItems.map((fee) => (
                <div
                  key={fee.id}
                  className={`p-3.5 flex items-center gap-3 transition-colors ${
                    fee.selected ? "bg-teal-50/25" : "bg-slate-50/40 opacity-70"
                  }`}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={fee.selected}
                    onChange={() => toggleSelectFee(fee.id)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer shrink-0"
                  />

                  {/* Description */}
                  <div className="flex-1 min-w-0 pr-2">
                    {fee.isCustom ? (
                      <input
                        type="text"
                        value={fee.description}
                        onChange={(e) => updateFeeDescription(fee.id, e.target.value)}
                        placeholder="Tên khoản phí phát sinh..."
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium text-slate-800 text-xs focus:ring-1 focus:ring-teal-600 bg-white"
                      />
                    ) : (
                      <p className="font-semibold text-slate-900 text-xs truncate" title={fee.description}>
                        {fee.description}
                      </p>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      Loại: {fee.itemType === "RENT" ? "Tiền phòng" : fee.itemType === "ELECTRICITY" ? "Điện" : fee.itemType === "WATER" ? "Nước" : fee.itemType === "SERVICE_FEE" ? "Phí dịch vụ" : "Phát sinh"}
                    </span>
                  </div>

                  {/* Quantity & Unit price */}
                  {fee.isCustom ? (
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-20">
                        <span className="block text-[10px] text-slate-400">Số lượng</span>
                        <input
                          type="number"
                          min="1"
                          value={fee.quantity}
                          onChange={(e) => updateFeeQuantity(fee.id, parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-teal-300 rounded font-mono text-center font-bold text-slate-800 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                        />
                      </div>
                      <div className="w-32">
                        <span className="block text-[10px] text-slate-400 text-right">Đơn giá</span>
                        <input
                          type="number"
                          step="1000"
                          value={fee.unitPrice}
                          onChange={(e) => updateFeeUnitPrice(fee.id, parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-teal-300 rounded font-mono text-right font-medium text-slate-800 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-20 text-center">
                        <span className="block text-[10px] text-slate-400 mb-0.5">Số lượng</span>
                        <div className="px-2 py-1 bg-slate-100 border border-slate-200 rounded font-mono font-bold text-slate-800 text-xs">
                          {fee.quantity}
                        </div>
                      </div>
                      <div className="w-32 text-right">
                        <span className="block text-[10px] text-slate-400 mb-0.5">Đơn giá</span>
                        <div className="px-2 py-1 bg-slate-100 border border-slate-200 rounded font-mono font-semibold text-slate-800 text-xs text-right">
                          {formatCurrencyVND(fee.unitPrice)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Computed Amount */}
                  <div className="w-32 text-right shrink-0">
                    <span className="block text-[10px] text-slate-400">Thành tiền</span>
                    <span className="font-bold text-slate-900 tabular-nums text-xs">
                      {formatCurrencyVND(fee.amount)}
                    </span>
                  </div>

                  {/* Remove custom item */}
                  {fee.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomFee(fee.id)}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded shrink-0 cursor-pointer"
                      title="Xóa khoản phí này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 4. TỔNG TIỀN THANH TOÁN (MÀU XANH NHẠT) */}
          <div className="bg-teal-50 border border-teal-200 text-teal-950 p-4 rounded-xl flex items-center justify-between shadow-2xs flex-wrap gap-2">
            <div>
              <p className="text-[11px] font-medium text-teal-700">Tổng cộng thanh toán dự tính:</p>
              <p className="text-2xl font-black tabular-nums text-[#0F766E] mt-0.5">
                {formatCurrencyVND(totalAmount)}
              </p>
            </div>
            <div className="text-right text-xs text-teal-900">
              <p>Số khoản được chọn: <strong className="font-bold text-teal-950">{selectedFees.length}</strong> / {feeItems.length}</p>
              <p className="text-teal-700 mt-0.5">Tên: <strong className="text-teal-950 font-semibold">{invoiceTitle || "(Chưa có tên)"}</strong></p>
            </div>
          </div>

          {/* 5. GHI CHÚ */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Ghi chú hóa đơn:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              placeholder="VD: Vui lòng thanh toán bằng hình thức quét mã QR SePay tự động..."
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={selectedFees.length === 0 || !invoiceTitle.trim()}
              className="px-6 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg font-bold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              Phát hành Hóa đơn ({formatCurrencyVND(totalAmount)})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
