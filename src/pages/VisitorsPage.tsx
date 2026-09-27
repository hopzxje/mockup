import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useBuilding } from "../context/BuildingContext";
import { storageService } from "../services/storage";
import { formatDateVN, formatCurrencyVND, maskCCCD, maskPhone } from "../lib/utils";
import { VisitorRegistration, VisitorStatus, TemporaryResidenceStatus, VisitorStayType } from "../types";
import { SEPAY_CONFIG } from "../services/integrations/sepay";
import {
  UserCheck,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Shield,
  Moon,
  Sun,
  FileText,
  CreditCard,
  QrCode,
  Printer,
  Copy,
  Check,
  AlertTriangle,
  Info,
  Building,
  User,
  Phone,
  FileCheck2,
} from "lucide-react";

export const VisitorsPage: React.FC = () => {
  const { currentUser, currentRole } = useAuth();
  const { selectedBuildingId } = useBuilding();

  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorRegistration | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<"Đã duyệt" | "Từ chối">("Đã duyệt");
  const [reviewNotes, setReviewNotes] = useState("");

  const [showResidenceModal, setShowResidenceModal] = useState(false);
  const [residenceVisitor, setResidenceVisitor] = useState<VisitorRegistration | null>(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentVisitor, setPaymentVisitor] = useState<VisitorRegistration | null>(null);

  let visitors = storageService.getVisitors({ buildingId: selectedBuildingId });
  if (currentRole === "RESIDENT") {
    visitors = visitors.filter(
      (v) => v.residentPhone === currentUser?.phoneNumber || v.residentId === currentUser?.residentId
    );
  }

  const filteredVisitors = visitors.filter((v) => {
    if (typeFilter === "DAY" && v.isOvernight) return false;
    if (typeFilter === "OVERNIGHT" && !v.isOvernight) return false;
    if (statusFilter !== "ALL" && v.status !== statusFilter) return false;
    if (
      searchQuery &&
      !v.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !v.apartmentCode.includes(searchQuery) &&
      !v.registrationCode.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(v.temporaryResidenceCode && v.temporaryResidenceCode.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: VisitorStatus) => {
    switch (status) {
      case "Chờ duyệt":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Chờ duyệt</span>;
      case "Đã duyệt":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Đã duyệt</span>;
      case "Từ chối":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">Từ chối</span>;
    }
  };

  const getResidenceStatusBadge = (status?: TemporaryResidenceStatus) => {
    switch (status) {
      case "DA_HOAN_TAT":
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit"><FileCheck2 className="w-3 h-3 text-emerald-600" /> Đã hoàn tất</span>;
      case "DA_NOP_HO_SO":
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1 w-fit"><Clock className="w-3 h-3 text-blue-600" /> Đã nộp CA</span>;
      case "CHUA_DANG_KY":
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 w-fit"><AlertTriangle className="w-3 h-3 text-amber-600" /> Chưa khai báo</span>;
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisitor || !currentUser) return;
    try {
      storageService.reviewVisitor(selectedVisitor.id, reviewStatus, reviewNotes, currentUser);
      alert(`Đã ${reviewStatus === "Đã duyệt" ? "phê duyệt" : "từ chối"} đăng ký khách thăm.`);
      setShowReviewModal(false);
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Quản lý Đăng ký Khách Thăm & Tạm Trú</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Cư dân khai báo khách đến thăm, quản lý lưu trú qua đêm, thu phí và hoàn tất thủ tục đăng ký tạm trú với Công an
          </p>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="bg-[#0F766E] hover:bg-[#115E59] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Đăng ký Khách Mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm tên khách, số CCCD, phòng, mã tạm trú..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Stay Type filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setTypeFilter("ALL")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                typeFilter === "ALL" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setTypeFilter("DAY")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                typeFilter === "DAY" ? "bg-white text-teal-800 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sun className="w-3 h-3 text-amber-500" />
              Trong ngày
            </button>
            <button
              onClick={() => setTypeFilter("OVERNIGHT")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                typeFilter === "OVERNIGHT" ? "bg-white text-indigo-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Moon className="w-3 h-3 text-indigo-600" />
              🌙 Qua đêm / Đăng ký tạm trú
            </button>
          </div>

          <span className="text-slate-300">|</span>

          {/* Status filter */}
          {["ALL", "Chờ duyệt", "Đã duyệt", "Từ chối"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === st
                  ? "bg-[#0F766E] text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st === "ALL" ? "Tất cả trạng thái" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-bold bg-slate-50/70">
                <th className="py-3 px-4">Mã ĐK</th>
                <th className="py-3 px-4">Khách đến thăm</th>
                <th className="py-3 px-4">CCCD / Định danh</th>
                <th className="py-3 px-4">Phòng & Cư dân</th>
                <th className="py-3 px-4">Hình thức lưu trú</th>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Phí lưu trú</th>
                <th className="py-3 px-4">Đăng ký tạm trú</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Không tìm thấy bản ghi đăng ký khách thăm nào.
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((vis) => (
                  <tr key={vis.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{vis.registrationCode}</td>
                    
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{vis.visitorName}</p>
                      <span className="text-[11px] text-slate-400 font-normal">{maskPhone(vis.visitorPhone)}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                        {maskCCCD(vis.visitorIdNumber)}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        P.{vis.apartmentCode}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{vis.residentName}</p>
                    </td>

                    <td className="py-3 px-4">
                      {vis.isOvernight ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Moon className="w-3 h-3 text-indigo-600" />
                          Qua đêm ({vis.stayNights || 1} đêm)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <Sun className="w-3 h-3 text-amber-500" />
                          Trong ngày
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <p className="text-slate-800 font-semibold">{formatDateVN(vis.visitDate)}</p>
                      {vis.isOvernight && vis.leaveDate ? (
                        <p className="text-[11px] text-indigo-700 font-medium">Đến: {formatDateVN(vis.leaveDate)}</p>
                      ) : (
                        <p className="text-[11px] text-slate-400 font-mono">{vis.expectedArrival} - {vis.expectedDeparture}</p>
                      )}
                    </td>

                    {/* Phí lưu trú */}
                    <td className="py-3 px-4">
                      {vis.isOvernight && vis.overnightFee ? (
                        <div>
                          <p className="font-bold text-slate-900 tabular-nums">{formatCurrencyVND(vis.overnightFee)}</p>
                          {vis.feePaymentStatus === "Đã thanh toán" ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              ✓ Đã thu
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setPaymentVisitor(vis);
                                setShowPaymentModal(true);
                              }}
                              className="text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-1.5 py-0.2 rounded border border-rose-200 cursor-pointer"
                            >
                              Chưa thu • Nộp ngay
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Miễn phí</span>
                      )}
                    </td>

                    {/* Đăng ký tạm trú */}
                    <td className="py-3 px-4">
                      {vis.isOvernight ? (
                        <div className="space-y-1">
                          {getResidenceStatusBadge(vis.temporaryResidenceStatus)}
                          {vis.temporaryResidenceCode && (
                            <span className="block font-mono text-[10px] text-slate-500 truncate max-w-[130px]" title={vis.temporaryResidenceCode}>
                              {vis.temporaryResidenceCode}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Không áp dụng</span>
                      )}
                    </td>

                    <td className="py-3 px-4">{getStatusBadge(vis.status)}</td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {vis.isOvernight && (
                          <button
                            onClick={() => {
                              setResidenceVisitor(vis);
                              setShowResidenceModal(true);
                            }}
                            className="text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded text-xs font-semibold border border-indigo-200 flex items-center gap-1 cursor-pointer"
                            title="Xem và thực hiện đăng ký tạm trú"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Hồ sơ tạm trú</span>
                          </button>
                        )}

                        {currentRole !== "RESIDENT" && vis.status === "Chờ duyệt" && (
                          <button
                            onClick={() => {
                              setSelectedVisitor(vis);
                              setReviewStatus("Đã duyệt");
                              setReviewNotes("Đã đối chiếu thông tin cá nhân và cấp phép ra vào");
                              setShowReviewModal(true);
                            }}
                            className="text-teal-700 bg-teal-50 hover:bg-teal-100 px-2 py-1 rounded text-xs font-semibold border border-teal-200 cursor-pointer"
                          >
                            Xét duyệt
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REVIEW MODAL */}
      {showReviewModal && selectedVisitor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 mb-3 pb-2 border-b border-slate-100">
              Xét duyệt Đăng ký Khách thăm {selectedVisitor.registrationCode}
            </h3>
            <form onSubmit={handleReviewSubmit} className="space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <p>Khách: <strong>{selectedVisitor.visitorName}</strong> (CCCD: {maskCCCD(selectedVisitor.visitorIdNumber)})</p>
                <p>Thăm phòng: <strong className="text-teal-800">P.{selectedVisitor.apartmentCode}</strong> ({selectedVisitor.residentName})</p>
                <p>Thời gian: <strong>{formatDateVN(selectedVisitor.visitDate)} ({selectedVisitor.expectedArrival} - {selectedVisitor.expectedDeparture})</strong></p>
                {selectedVisitor.isOvernight && (
                  <p className="text-indigo-700 font-bold">
                    🌙 Lưu trú qua đêm: {selectedVisitor.stayNights || 1} đêm (Phí: {formatCurrencyVND(selectedVisitor.overnightFee || 0)} - {selectedVisitor.feePaymentStatus})
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Quyết định xét duyệt:</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewStatus("Đã duyệt")}
                    className={`flex-1 py-2 rounded-lg font-semibold border transition-colors cursor-pointer ${
                      reviewStatus === "Đã duyệt"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    Chấp thuận (Duyệt)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatus("Từ chối")}
                    className={`flex-1 py-2 rounded-lg font-semibold border transition-colors cursor-pointer ${
                      reviewStatus === "Từ chối"
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    Từ chối
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Ghi chú lý do / Hướng dẫn ra vào:</label>
                <textarea
                  rows={2}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Ghi nhận kiểm tra bảo vệ..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Lưu kết quả
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEMPORARY RESIDENCE MODAL (HỒ SƠ TẠM TRÚ & MẪU CT01) */}
      {showResidenceModal && residenceVisitor && (
        <TemporaryResidenceModal
          visitor={residenceVisitor}
          onClose={() => setShowResidenceModal(false)}
          onSuccess={() => {
            setShowResidenceModal(false);
            window.location.reload();
          }}
        />
      )}

      {/* SEPAY PAYMENT MODAL FOR OVERNIGHT STAY FEE */}
      {showPaymentModal && paymentVisitor && (
        <VisitorPaymentModal
          visitor={paymentVisitor}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            window.location.reload();
          }}
        />
      )}

      {/* REGISTER VISITOR MODAL */}
      {showRegisterModal && (
        <RegisterVisitorModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={(newVis) => {
            setShowRegisterModal(false);
            if (newVis.isOvernight && newVis.paymentMethod === "SEPAY_QR" && newVis.feePaymentStatus !== "Đã thanh toán") {
              setPaymentVisitor(newVis);
              setShowPaymentModal(true);
            } else {
              window.location.reload();
            }
          }}
        />
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* REGISTER VISITOR MODAL WITH OVERNIGHT STAY, TEMPORARY RESIDENCE & FEE      */
/* -------------------------------------------------------------------------- */
const RegisterVisitorModal: React.FC<{
  onClose: () => void;
  onSuccess: (createdVis: VisitorRegistration) => void;
}> = ({ onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const { selectedBuildingId } = useBuilding();

  const apartments = storageService.getApartments(selectedBuildingId);
  const [apartmentId, setApartmentId] = useState(apartments[0]?.id || "");

  // Stay duration type
  const [stayType, setStayType] = useState<VisitorStayType>("DAY");
  const isOvernight = stayType === "OVERNIGHT";

  // Basic visitor info
  const [visitorName, setVisitorName] = useState("");
  const [visitorIdNumber, setVisitorIdNumber] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [visitDate, setVisitDate] = useState("2026-09-27");
  const [leaveDate, setLeaveDate] = useState("2026-09-28");
  const [expectedArrival, setExpectedArrival] = useState("09:00");
  const [expectedDeparture, setExpectedDeparture] = useState("18:00");
  const [purpose, setPurpose] = useState("Bạn đến trao đổi công việc / Người thân đến thăm");

  // Detailed temporary residence fields (when staying overnight)
  const [visitorDob, setVisitorDob] = useState("1998-05-15");
  const [visitorGender, setVisitorGender] = useState<"Nam" | "Nữ" | "Khác">("Nam");
  const [visitorNationality, setVisitorNationality] = useState("Việt Nam");
  const [visitorIdIssueDate, setVisitorIdIssueDate] = useState("2022-04-10");
  const [visitorIdIssuePlace, setVisitorIdIssuePlace] = useState("Cục Cảnh sát QLHC về TTXH");
  const [visitorPermanentAddress, setVisitorPermanentAddress] = useState("");
  const [relationshipWithResident, setRelationshipWithResident] = useState("Người thân trong gia đình");

  // Fee calculation (50.000 VND / night)
  const calcNights = () => {
    if (!isOvernight) return 0;
    const d1 = new Date(visitDate).getTime();
    const d2 = new Date(leaveDate).getTime();
    if (isNaN(d1) || isNaN(d2)) return 1;
    const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  };

  const stayNights = calcNights();
  const NIGHTLY_FEE = 50000;
  const calculatedFee = isOvernight ? stayNights * NIGHTLY_FEE : 0;

  const [paymentMethod, setPaymentMethod] = useState<"SEPAY_QR" | "INCLUDE_IN_INVOICE">("SEPAY_QR");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const apt = apartments.find((a) => a.id === apartmentId);
    if (!apt) return;

    if (isOvernight && !visitorPermanentAddress.trim()) {
      alert("Vui lòng nhập địa chỉ thường trú của khách để phục vụ khai báo tạm trú theo luật cư trú!");
      return;
    }

    try {
      const newVis = storageService.createVisitor(
        {
          buildingId: apt.buildingId,
          buildingName: apt.buildingName,
          apartmentId: apt.id,
          apartmentCode: apt.roomCode,
          residentId: currentUser.residentId || "res-self",
          residentName: currentUser.fullName,
          residentPhone: currentUser.phoneNumber,
          visitorName,
          visitorIdNumber,
          visitorPhone,
          visitDate,
          expectedArrival,
          expectedDeparture,
          purpose,
          stayType,
          isOvernight,
          leaveDate: isOvernight ? leaveDate : undefined,
          stayNights: isOvernight ? stayNights : undefined,
          visitorDob: isOvernight ? visitorDob : undefined,
          visitorGender: isOvernight ? visitorGender : undefined,
          visitorNationality: isOvernight ? visitorNationality : undefined,
          visitorIdIssueDate: isOvernight ? visitorIdIssueDate : undefined,
          visitorIdIssuePlace: isOvernight ? visitorIdIssuePlace : undefined,
          visitorPermanentAddress: isOvernight ? visitorPermanentAddress.trim() : undefined,
          relationshipWithResident: isOvernight ? relationshipWithResident : undefined,
          overnightFee: calculatedFee,
          feePaymentStatus: isOvernight ? "Chưa thanh toán" : undefined,
          paymentMethod: isOvernight ? paymentMethod : undefined,
          temporaryResidenceStatus: isOvernight ? "CHUA_DANG_KY" : undefined,
        },
        currentUser
      );

      onSuccess(newVis);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#0F766E]" />
            <div>
              <h3 className="font-bold text-base text-slate-900">Đăng ký Khách Đến Thăm Căn Hộ</h3>
              <p className="text-[11px] text-slate-500">Khai báo thông tin khách ghé thăm hoặc lưu trú qua đêm</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs overflow-y-auto pr-1 flex-1">
          {/* LỰA CHỌN LOẠI THỜI GIAN LƯU TRÚ */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-slate-800 font-bold text-xs">
              Thời gian lưu trú của khách <span className="text-rose-600">*</span>:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                  !isOvernight
                    ? "bg-white border-teal-600 ring-2 ring-teal-600/20 shadow-xs"
                    : "bg-white/60 border-slate-200 hover:bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="stayType"
                  value="DAY"
                  checked={!isOvernight}
                  onChange={() => setStayType("DAY")}
                  className="mt-0.5 text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-500" />
                    Ghé thăm trong ngày
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Rời đi trước 22:00, không ở lại qua đêm (Miễn phí).</p>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                  isOvernight
                    ? "bg-indigo-50/50 border-indigo-600 ring-2 ring-indigo-600/20 shadow-xs"
                    : "bg-white/60 border-slate-200 hover:bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="stayType"
                  value="OVERNIGHT"
                  checked={isOvernight}
                  onChange={() => setStayType("OVERNIGHT")}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="font-bold text-indigo-900 flex items-center gap-1.5">
                    <Moon className="w-4 h-4 text-indigo-600" />
                    Ở lại qua đêm / Trên 1 ngày
                  </p>
                  <p className="text-[11px] text-indigo-700 mt-0.5">
                    Khai báo tạm trú theo luật cư trú & có thu phí lưu trú ({formatCurrencyVND(NIGHTLY_FEE)}/đêm).
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* CHỌN PHÒNG */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Căn hộ đón tiếp khách:</label>
            <select
              value={apartmentId}
              onChange={(e) => setApartmentId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-bold text-slate-800"
            >
              {apartments.map((a) => (
                <option key={a.id} value={a.id}>
                  Phòng {a.roomCode} - {a.buildingName}
                </option>
              ))}
            </select>
          </div>

          {/* THỜI GIAN LƯU TRÚ CỤ THỂ */}
          {isOvernight ? (
            <div className="p-3.5 bg-indigo-50/40 rounded-xl border border-indigo-200 space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-indigo-950">Thời gian lưu trú qua đêm:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Ngày bắt đầu đến:</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-600 bg-white font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Ngày kết thúc rời đi:</label>
                  <input
                    type="date"
                    value={leaveDate}
                    onChange={(e) => setLeaveDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-600 bg-white font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Số đêm lưu trú:</label>
                  <div className="px-3 py-2 bg-indigo-100/70 border border-indigo-200 rounded-lg font-bold text-indigo-900 text-sm">
                    {stayNights} đêm
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Ngày đến thăm:</label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-600 bg-white font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Giờ đến dự kiến:</label>
                <input
                  type="time"
                  value={expectedArrival}
                  onChange={(e) => setExpectedArrival(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Giờ rời dự kiến:</label>
                <input
                  type="time"
                  value={expectedDeparture}
                  onChange={(e) => setExpectedDeparture(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  required
                />
              </div>
            </div>
          )}

          {/* FORM THÔNG TIN NGƯỜI KHÁCH THĂM (ĐẶC BIỆT KHI QUA ĐÊM ĐỂ ĐĂNG KÝ TẠM TRÚ) */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <User className="w-4 h-4 text-teal-700" />
                Thông tin người khách đến thăm
              </span>
              {isOvernight && (
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Phục vụ khai báo tạm trú
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-medium mb-1">
                  Họ và tên khách thăm <span className="text-rose-600">*</span>:
                </label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Văn Anh"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-600 font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Số điện thoại <span className="text-rose-600">*</span>:
                </label>
                <input
                  type="tel"
                  placeholder="09..."
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Số CCCD / Hộ chiếu <span className="text-rose-600">*</span>:
                </label>
                <input
                  type="text"
                  placeholder="12 số CCCD"
                  value={visitorIdNumber}
                  onChange={(e) => setVisitorIdNumber(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-600 font-mono font-bold"
                  required
                />
              </div>

              {/* Các trường mở rộng khi khách ở qua đêm để đăng ký tạm trú */}
              {isOvernight && (
                <>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Ngày sinh:</label>
                    <input
                      type="date"
                      value={visitorDob}
                      onChange={(e) => setVisitorDob(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Giới tính:</label>
                    <select
                      value={visitorGender}
                      onChange={(e) => setVisitorGender(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Ngày cấp CCCD:</label>
                    <input
                      type="date"
                      value={visitorIdIssueDate}
                      onChange={(e) => setVisitorIdIssueDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-medium mb-1">Nơi cấp CCCD:</label>
                    <input
                      type="text"
                      value={visitorIdIssuePlace}
                      onChange={(e) => setVisitorIdIssuePlace(e.target.value)}
                      placeholder="VD: Cục Cảnh sát QLHC về TTXH"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-slate-700 font-bold mb-1 text-slate-900">
                      Nơi thường trú (Theo CCCD) <span className="text-rose-600">*</span>:
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Thôn 2, Xã Quảng Minh, Huyện Hải Hà, Tỉnh Quảng Ninh..."
                      value={visitorPermanentAddress}
                      onChange={(e) => setVisitorPermanentAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-white font-medium"
                      required={isOvernight}
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      * Cần ghi rõ theo sổ hộ khẩu/CCCD để nộp tờ khai đăng ký tạm trú lên cơ quan Công an.
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Quan hệ với cư dân:</label>
                    <select
                      value={relationshipWithResident}
                      onChange={(e) => setRelationshipWithResident(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="Người thân trong gia đình">Người thân trong gia đình</option>
                      <option value="Bạn bè">Bạn bè</option>
                      <option value="Đồng nghiệp">Đồng nghiệp</option>
                      <option value="Đối tác công tác">Đối tác công tác</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </>
              )}

              <div className={isOvernight ? "sm:col-span-2" : "sm:col-span-3"}>
                <label className="block text-slate-700 font-medium mb-1">Lý do / Mục đích đến thăm:</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="VD: Thăm người thân, du lịch, công tác..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-600"
                  required
                />
              </div>
            </div>
          </div>

          {/* KHỐI THU PHÍ LƯU TRÚ QUA ĐÊM & ĐĂNG KÝ TẠM TRÚ */}
          {isOvernight && (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#0F766E]" />
                  <span className="font-bold text-teal-950">Phí lưu trú qua đêm & Thủ tục tạm trú:</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-teal-700 font-medium">{stayNights} đêm x {formatCurrencyVND(NIGHTLY_FEE)} = </span>
                  <span className="text-base font-black text-[#0F766E] ml-1">{formatCurrencyVND(calculatedFee)}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Hình thức thanh toán phí:</label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                      paymentMethod === "SEPAY_QR"
                        ? "bg-white border-teal-600 ring-1 ring-teal-600"
                        : "bg-white/60 border-slate-200 hover:bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="SEPAY_QR"
                      checked={paymentMethod === "SEPAY_QR"}
                      onChange={() => setPaymentMethod("SEPAY_QR")}
                      className="text-teal-600"
                    />
                    <div>
                      <p className="font-bold text-slate-900 flex items-center gap-1">
                        <QrCode className="w-3.5 h-3.5 text-teal-700" />
                        Quét mã VietQR SePay
                      </p>
                      <p className="text-[10px] text-slate-500">Mở QR thanh toán ngay sau khi đăng ký</p>
                    </div>
                  </label>

                  <label
                    className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                      paymentMethod === "INCLUDE_IN_INVOICE"
                        ? "bg-white border-teal-600 ring-1 ring-teal-600"
                        : "bg-white/60 border-slate-200 hover:bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="INCLUDE_IN_INVOICE"
                      checked={paymentMethod === "INCLUDE_IN_INVOICE"}
                      onChange={() => setPaymentMethod("INCLUDE_IN_INVOICE")}
                      className="text-teal-600"
                    />
                    <div>
                      <p className="font-bold text-slate-900 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-slate-700" />
                        Cộng vào Hóa đơn kỳ tới
                      </p>
                      <p className="text-[10px] text-slate-500">Thanh toán cùng tiền phòng tháng sau</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
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
              className="px-5 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>
                {isOvernight
                  ? `Đăng ký & Nộp hồ sơ tạm trú (${formatCurrencyVND(calculatedFee)})`
                  : "Gửi Đăng Ký Khách"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* TEMPORARY RESIDENCE MODAL (XEM HỒ SƠ & PHIẾU KHAI BÁO TẠM TRÚ CT01)       */
/* -------------------------------------------------------------------------- */
const TemporaryResidenceModal: React.FC<{
  visitor: VisitorRegistration;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ visitor, onClose, onSuccess }) => {
  const { currentUser, currentRole } = useAuth();
  const [resStatus, setResStatus] = useState<TemporaryResidenceStatus>(
    visitor.temporaryResidenceStatus || "CHUA_DANG_KY"
  );
  const [resCode, setResCode] = useState(visitor.temporaryResidenceCode || "");
  const [resNotes, setResNotes] = useState(visitor.temporaryResidenceNotes || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = () => {
    if (!currentUser) return;
    setIsUpdating(true);
    try {
      storageService.updateTemporaryResidence(
        visitor.id,
        {
          temporaryResidenceStatus: resStatus,
          temporaryResidenceCode: resCode.trim(),
          temporaryResidenceNotes: resNotes.trim(),
        },
        currentUser
      );
      alert("Đã cập nhật trạng thái hồ sơ đăng ký tạm trú!");
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-700" />
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Hồ sơ Đăng ký Tạm trú Khách thăm - {visitor.registrationCode}
              </h3>
              <p className="text-[11px] text-slate-500">Dành cho Cư dân & Ban Quản lý khai báo với Công an địa phương</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Sheet */}
        <div className="mt-4 space-y-4 text-xs overflow-y-auto pr-1 flex-1">
          {/* Printable Document Box */}
          <div className="p-5 bg-white border border-slate-300 rounded-xl space-y-3 font-sans shadow-2xs">
            <div className="text-center pb-3 border-b border-slate-200">
              <p className="font-bold text-[11px] text-slate-500 uppercase tracking-wider">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="text-[10px] text-slate-400 font-semibold">Độc lập - Tự do - Hạnh phúc</p>
              <h4 className="font-black text-sm text-slate-900 uppercase mt-2">
                PHIẾU KHAI BÁO THÔNG TIN LƯU TRÚ / TẠM TRÚ
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Cơ sở: <strong>{visitor.buildingName}</strong> - Phòng: <strong>P.{visitor.apartmentCode}</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 py-1">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">1. Người đăng ký / Cư dân bảo lãnh</p>
                <p className="font-bold text-slate-900 mt-0.5">{visitor.residentName}</p>
                <p className="text-slate-600">SĐT: {visitor.residentPhone}</p>
                <p className="text-slate-600">Phòng: P.{visitor.apartmentCode}</p>
              </div>

              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">2. Thời hạn lưu trú tạm trú</p>
                <p className="font-bold text-indigo-900 mt-0.5">
                  Từ ngày: {formatDateVN(visitor.visitDate)}
                </p>
                <p className="font-bold text-indigo-900">
                  Đến ngày: {visitor.leaveDate ? formatDateVN(visitor.leaveDate) : "---"} ({visitor.stayNights || 1} đêm)
                </p>
                <p className="text-slate-600">Mục đích: {visitor.purpose}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <p className="text-slate-400 text-[10px] uppercase font-bold mb-1.5">3. Thông tin chi tiết của người tạm trú (Khách thăm)</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p><span className="text-slate-500">Họ và tên:</span> <strong className="text-slate-900">{visitor.visitorName}</strong></p>
                <p><span className="text-slate-500">Giới tính:</span> <strong>{visitor.visitorGender || "Nam"}</strong></p>
                <p><span className="text-slate-500">Ngày sinh:</span> <strong>{visitor.visitorDob ? formatDateVN(visitor.visitorDob) : "Chưa có"}</strong></p>
                <p><span className="text-slate-500">Quốc tịch:</span> <strong>{visitor.visitorNationality || "Việt Nam"}</strong></p>
                <p><span className="text-slate-500">Số CCCD / ĐDCN:</span> <strong className="font-mono text-teal-800">{visitor.visitorIdNumber}</strong></p>
                <p><span className="text-slate-500">Số điện thoại:</span> <strong>{visitor.visitorPhone}</strong></p>
                <p><span className="text-slate-500">Ngày cấp:</span> <strong>{visitor.visitorIdIssueDate ? formatDateVN(visitor.visitorIdIssueDate) : "---"}</strong></p>
                <p><span className="text-slate-500">Nơi cấp:</span> <strong>{visitor.visitorIdIssuePlace || "Cục Cảnh sát QLHC về TTXH"}</strong></p>
                <p className="col-span-2">
                  <span className="text-slate-500">Nơi thường trú:</span>{" "}
                  <strong className="text-slate-900">{visitor.visitorPermanentAddress || "Chưa cập nhật"}</strong>
                </p>
                <p className="col-span-2">
                  <span className="text-slate-500">Quan hệ với chủ phòng:</span>{" "}
                  <strong>{visitor.relationshipWithResident || "Người thân / Bạn bè"}</strong>
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
              <div>
                <p className="text-slate-500">Phí lưu trú: <strong className="text-slate-900">{formatCurrencyVND(visitor.overnightFee || 0)}</strong></p>
                <p className="text-slate-500">Tình trạng phí: <strong className={visitor.feePaymentStatus === "Đã thanh toán" ? "text-emerald-700" : "text-rose-700"}>{visitor.feePaymentStatus || "Chưa thanh toán"}</strong></p>
              </div>
              <button
                type="button"
                onClick={handlePrint}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 border border-slate-300 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Phiếu Khai Báo</span>
              </button>
            </div>
          </div>

          {/* QUẢN LÝ TIẾN ĐỘ ĐĂNG KÝ VỚI CÔNG AN */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-700" />
              <span className="font-bold text-slate-900">Cập nhật Trạng thái Đăng ký Tạm trú (DVC / Công an phường):</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Trạng thái hồ sơ:</label>
                <select
                  value={resStatus}
                  onChange={(e) => setResStatus(e.target.value as TemporaryResidenceStatus)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-bold"
                >
                  <option value="CHUA_DANG_KY">⚠️ Chưa khai báo tạm trú</option>
                  <option value="DA_NOP_HO_SO">⏳ Đã nộp hồ sơ Công an (Chờ xác nhận)</option>
                  <option value="DA_HOAN_TAT">✅ Đã hoàn tất đăng ký tạm trú</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Mã hồ sơ / Mã xác nhận CA:</label>
                <input
                  type="text"
                  placeholder="VD: TT-2026-Q1-0988..."
                  value={resCode}
                  onChange={(e) => setResCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-medium mb-1">Ghi chú xác thực / Cơ quan tiếp nhận:</label>
                <input
                  type="text"
                  placeholder="VD: Đã nộp qua Cổng Dịch vụ công Bộ Công an, Công an Phường Bến Nghé Q1 tiếp nhận..."
                  value={resNotes}
                  onChange={(e) => setResNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleUpdate}
                disabled={isUpdating}
                className="bg-[#0F766E] hover:bg-[#115E59] text-white px-4 py-2 rounded-lg font-bold shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? "Đang lưu..." : "Lưu Cập Nhật Tạm Trú"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* SEPAY PAYMENT MODAL FOR OVERNIGHT STAY FEE                                 */
/* -------------------------------------------------------------------------- */
const VisitorPaymentModal: React.FC<{
  visitor: VisitorRegistration;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ visitor, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const amount = visitor.overnightFee || 50000;
  const transferContent = `VIS ${visitor.registrationCode} P${visitor.apartmentCode}`;
  const qrUrl = `https://qr.sepay.vn/img?acc=${SEPAY_CONFIG.ACCOUNT_NUMBER}&bank=${SEPAY_CONFIG.BANK_ID}&amount=${amount}&des=${encodeURIComponent(
    transferContent
  )}`;

  const handleCopyContent = () => {
    navigator.clipboard.writeText(transferContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPaid = () => {
    if (!currentUser) return;
    setIsProcessing(true);
    try {
      storageService.updateVisitorPayment(
        visitor.id,
        {
          feePaymentStatus: "Đã thanh toán",
          paymentMethod: "SEPAY_QR",
          transactionRef: `SEP-${Date.now().toString().slice(-6)}`,
        },
        currentUser
      );
      alert(`Đã ghi nhận thanh toán phí lưu trú qua đêm ${formatCurrencyVND(amount)} thành công!`);
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-teal-700" />
            <h3 className="font-bold text-sm text-slate-900">Thanh toán Phí Lưu Trú Qua Đêm</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3 text-xs text-left">
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[11px] text-teal-700">Khách: <strong>{visitor.visitorName}</strong> (P.{visitor.apartmentCode})</p>
              <p className="text-[11px] text-teal-700">Lưu trú: <strong>{visitor.stayNights || 1} đêm</strong></p>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-[#0F766E]">{formatCurrencyVND(amount)}</span>
            </div>
          </div>

          {/* QR Image */}
          <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-xs flex flex-col items-center">
            <img
              src={qrUrl}
              alt="SePay VietQR"
              className="w-48 h-48 object-contain rounded-lg border border-slate-100"
            />
            <p className="text-[10px] text-slate-400 mt-1">Quét mã bằng ứng dụng ngân hàng bất kỳ (VietQR)</p>
          </div>

          {/* Transfer Info */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">Ngân hàng:</span>
              <strong className="text-slate-900">{SEPAY_CONFIG.BANK_NAME}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Số tài khoản:</span>
              <strong className="font-mono text-teal-800 text-sm">{SEPAY_CONFIG.ACCOUNT_NUMBER}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Chủ tài khoản:</span>
              <strong className="text-slate-900">{SEPAY_CONFIG.ACCOUNT_HOLDER}</strong>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-200">
              <span className="text-slate-500">Nội dung CK:</span>
              <div className="flex items-center gap-1">
                <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {transferContent}
                </span>
                <button
                  type="button"
                  onClick={handleCopyContent}
                  className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                  title="Sao chép nội dung"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-xs font-semibold cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleConfirmPaid}
            disabled={isProcessing}
            className="flex-1 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? "Đang xử lý..." : "Xác nhận Đã Chuyển Khoản"}
          </button>
        </div>
      </div>
    </div>
  );
};
