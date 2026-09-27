import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useBuilding } from "../context/BuildingContext";
import { storageService } from "../services/storage";
import { formatDateVN, formatDateTimeVN, formatCurrencyVND } from "../lib/utils";
import { Fee, UtilityReading, FeeCalculationType } from "../types";
import {
  Zap,
  Droplets,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Calendar,
  Lock,
  Edit2,
  Layers,
} from "lucide-react";

export const UtilitiesPage: React.FC = () => {
  const { currentUser, currentRole } = useAuth();
  const { selectedBuildingId } = useBuilding();

  const [activeTab, setActiveTab] = useState<"readings" | "fees">("readings");
  const [selectedMonth, setSelectedMonth] = useState<number>(9);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [utilityTypeFilter, setUtilityTypeFilter] = useState<string>("ALL");

  // Modals
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);

  const fees = storageService.getFees(selectedBuildingId);
  const apartments = storageService.getApartments();
  const utilityReadings = storageService.getUtilityReadings({
    buildingId: selectedBuildingId,
    periodMonth: selectedMonth,
    periodYear: selectedYear,
  });

  const filteredReadings = utilityReadings.filter((u) => {
    if (utilityTypeFilter !== "ALL" && u.utilityType !== utilityTypeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Quản lý Biểu phí & Chỉ số Điện Nước</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Ghi nhận số điện, số nước từng kỳ, tự động tính sản lượng tiêu thụ và cấu hình biểu phí dịch vụ
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "readings" ? (
            <button
              onClick={() => setShowRecordModal(true)}
              className="bg-[#0F766E] hover:bg-[#115E59] text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Ghi Chỉ số Điện / Nước</span>
            </button>
          ) : (
            currentRole !== "STAFF" && (
              <button
                onClick={() => setShowFeeModal(true)}
                className="bg-[#0F766E] hover:bg-[#115E59] text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Biểu phí Mới</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-4 text-xs font-medium">
        <button
          onClick={() => setActiveTab("readings")}
          className={`py-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "readings"
              ? "border-[#0F766E] text-[#0F766E] font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Chỉ số Điện Nước Kỳ {selectedMonth}/{selectedYear}</span>
        </button>
        <button
          onClick={() => setActiveTab("fees")}
          className={`py-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "fees"
              ? "border-[#0F766E] text-[#0F766E] font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Biểu phí Dịch vụ ({fees.length})</span>
        </button>
      </div>

      {activeTab === "readings" ? (
        <div className="space-y-4">
          {/* Period Selector & Type Filter */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Calendar className="w-4 h-4 text-teal-700" />
                <span>Kỳ ghi chỉ số:</span>
              </div>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="text-xs font-semibold text-slate-900 border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50"
              >
                {[7, 8, 9, 10, 11, 12].map((m) => (
                  <option key={m} value={m}>Tháng {m < 10 ? "0" + m : m}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="text-xs font-semibold text-slate-900 border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium">Tiện ích:</span>
              {["ALL", "ELECTRICITY", "WATER"].map((t) => (
                <button
                  key={t}
                  onClick={() => setUtilityTypeFilter(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    utilityTypeFilter === t
                      ? "bg-[#0F766E] text-white font-semibold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {t === "ALL" ? "Tất cả" : t === "ELECTRICITY" ? "Điện (kWh)" : "Nước (m³)"}
                </button>
              ))}
            </div>
          </div>

          {/* Readings Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                    <th className="py-3 px-4">Phòng</th>
                    <th className="py-3 px-4">Loại tiện ích</th>
                    <th className="py-3 px-4">Mã Công tơ / Đồng hồ</th>
                    <th className="py-3 px-4 text-center">Chỉ số đầu</th>
                    <th className="py-3 px-4 text-center">Chỉ số cuối</th>
                    <th className="py-3 px-4 text-center">Tiêu thụ</th>
                    <th className="py-3 px-4 text-right">Đơn giá</th>
                    <th className="py-3 px-4 text-right">Thành tiền</th>
                    <th className="py-3 px-4">Người ghi nhận</th>
                    <th className="py-3 px-4 text-center">Hóa đơn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReadings.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-8 text-slate-400">
                        Chưa có dữ liệu chỉ số cho kỳ Tháng {selectedMonth}/{selectedYear}. Nhấn "Ghi Chỉ số" để nhập mới.
                      </td>
                    </tr>
                  ) : (
                    filteredReadings.map((u) => {
                      const apt = apartments.find((a) => a.id === u.apartmentId || a.roomCode === u.apartmentCode);
                      const meterCode = u.meterCode || (u.utilityType === "ELECTRICITY" ? apt?.electricityMeterCode : apt?.waterMeterCode) || (u.utilityType === "ELECTRICITY" ? `EM-${u.apartmentCode}` : `WM-${u.apartmentCode}`);
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                              P.{u.apartmentCode}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800">
                            {u.utilityType === "ELECTRICITY" ? "Điện (kWh)" : "Nước (m³)"}
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-800 text-xs">
                            {meterCode}
                          </td>
                          <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-600">
                            {u.previousIndex}
                          </td>
                          <td className="py-3 px-4 text-center font-mono tabular-nums font-bold text-slate-900">
                            {u.currentIndex}
                          </td>
                          <td className="py-3 px-4 text-center font-mono tabular-nums font-bold text-teal-800">
                            +{u.consumption}
                          </td>
                          <td className="py-3 px-4 text-right tabular-nums text-slate-600">
                            {formatCurrencyVND(u.unitPrice)}
                          </td>
                          <td className="py-3 px-4 text-right tabular-nums font-bold text-slate-900">
                            {formatCurrencyVND(u.totalAmount)}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {u.recordedBy}
                            <span className="block text-[10px] text-slate-400">{formatDateVN(u.recordedAt)}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {u.isInvoiced ? (
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Đã chốt
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                Chờ xuất
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* FEES TAB */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                  <th className="py-3 px-4">Tên khoản phí</th>
                  <th className="py-3 px-4">Mã biểu phí</th>
                  <th className="py-3 px-4">Cách tính</th>
                  <th className="py-3 px-4">Đơn giá niêm yết</th>
                  <th className="py-3 px-4">Đơn vị</th>
                  <th className="py-3 px-4">Ngày hiệu lực</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Mô tả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{fee.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{fee.code}</td>
                    <td className="py-3 px-4 text-slate-800">
                      {fee.calculationType === "PER_ROOM"
                        ? "Theo từng phòng"
                        : fee.calculationType === "PER_PERSON"
                        ? "Theo đầu người"
                        : "Theo số lượng tiêu thụ"}
                    </td>
                    <td className="py-3 px-4 font-bold text-teal-800 tabular-nums">
                      {formatCurrencyVND(fee.unitPrice)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{fee.unitName}</td>
                    <td className="py-3 px-4 text-slate-600">{formatDateVN(fee.effectiveDate)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Đang áp dụng
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{fee.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECORD UTILITY MODAL */}
      {showRecordModal && (
        <RecordUtilityModal
          onClose={() => setShowRecordModal(false)}
          onSuccess={() => {
            setShowRecordModal(false);
            window.location.reload();
          }}
        />
      )}

      {/* CREATE FEE MODAL */}
      {showFeeModal && (
        <CreateFeeModal
          onClose={() => setShowFeeModal(false)}
          onSuccess={() => {
            setShowFeeModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

const RecordUtilityModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const { selectedBuildingId } = useBuilding();

  const apartments = storageService.getApartments(selectedBuildingId);
  const [apartmentId, setApartmentId] = useState(apartments[0]?.id || "");
  const [utilityType, setUtilityType] = useState<"ELECTRICITY" | "WATER">("ELECTRICITY");
  const [periodMonth, setPeriodMonth] = useState<number>(9);
  const [periodYear, setPeriodYear] = useState<number>(2026);
  const [previousIndex, setPreviousIndex] = useState<number>(1000);
  const [currentIndex, setCurrentIndex] = useState<number>(1150);
  const [unitPrice, setUnitPrice] = useState<number>(3800);
  const [notes, setNotes] = useState<string>("");

  // Auto adjust default unit price & look up previous reading
  const handleTypeChange = (type: "ELECTRICITY" | "WATER") => {
    setUtilityType(type);
    if (type === "ELECTRICITY") {
      setUnitPrice(3800);
      setPreviousIndex(1000);
      setCurrentIndex(1180);
    } else {
      setUnitPrice(25000);
      setPreviousIndex(40);
      setCurrentIndex(48);
    }
  };

  const consumption = Math.max(0, currentIndex - previousIndex);
  const totalAmount = consumption * unitPrice;
  const selectedApt = apartments.find((a) => a.id === apartmentId);
  const currentMeterCode = utilityType === "ELECTRICITY" ? selectedApt?.electricityMeterCode : selectedApt?.waterMeterCode;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (currentIndex < previousIndex) {
      alert("Chỉ số mới không được nhỏ hơn chỉ số cũ.");
      return;
    }

    try {
      storageService.recordUtilityReading(
        {
          apartmentId,
          utilityType,
          periodMonth,
          periodYear,
          previousIndex,
          currentIndex,
          unitPrice,
          notes,
        },
        currentUser
      );

      alert(`Đã ghi thành công chỉ số ${utilityType === "ELECTRICITY" ? "Điện" : "Nước"} cho phòng!`);
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#0F766E]" />
            <h3 className="font-bold text-sm text-slate-900">Ghi Chỉ số Điện / Nước</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Chọn Phòng:</label>
            <select
              value={apartmentId}
              onChange={(e) => setApartmentId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white font-semibold"
            >
              {apartments.map((a) => (
                <option key={a.id} value={a.id}>
                  Phòng {a.roomCode} ({a.buildingName})
                </option>
              ))}
            </select>
          </div>

          {selectedApt && (
            <div className="p-2.5 rounded-lg bg-teal-50/70 border border-teal-200 text-teal-900 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium">
                {utilityType === "ELECTRICITY" ? (
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <Droplets className="w-3.5 h-3.5 text-blue-600" />
                )}
                <span>Mã {utilityType === "ELECTRICITY" ? "Công tơ điện" : "Đồng hồ nước"} của phòng:</span>
              </span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-teal-200">
                {currentMeterCode || "Chưa gắn"}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Loại dịch vụ:</label>
              <select
                value={utilityType}
                onChange={(e) => handleTypeChange(e.target.value as "ELECTRICITY" | "WATER")}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white font-semibold"
              >
                <option value="ELECTRICITY">Điện (3.800 ₫/kWh)</option>
                <option value="WATER">Nước (25.000 ₫/m³)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Kỳ chốt (Tháng/Năm):</label>
              <div className="flex gap-1">
                <select
                  value={periodMonth}
                  onChange={(e) => setPeriodMonth(parseInt(e.target.value))}
                  className="w-1/2 px-2 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  {[7, 8, 9, 10, 11, 12].map((m) => (
                    <option key={m} value={m}>T.{m}</option>
                  ))}
                </select>
                <select
                  value={periodYear}
                  onChange={(e) => setPeriodYear(parseInt(e.target.value))}
                  className="w-1/2 px-2 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value={2026}>2026</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Chỉ số cũ (Đầu kỳ):</label>
              <input
                type="number"
                min={0}
                value={previousIndex}
                onChange={(e) => setPreviousIndex(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Chỉ số mới (Cuối kỳ):</label>
              <input
                type="number"
                min={previousIndex}
                value={currentIndex}
                onChange={(e) => setCurrentIndex(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono font-bold"
                required
              />
            </div>
          </div>

          {/* Auto calculation box */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Tiêu thụ:</span>
              <span className="font-bold text-teal-800 font-mono">
                {consumption} {utilityType === "ELECTRICITY" ? "kWh" : "m³"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Đơn giá:</span>
              <span className="text-slate-700 font-mono">{formatCurrencyVND(unitPrice)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 font-bold">
              <span className="text-slate-800">Thành tiền dự kiến:</span>
              <span className="text-[#0F766E] text-sm tabular-nums">{formatCurrencyVND(totalAmount)}</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Ghi chú chỉ số (nếu có):</label>
            <input
              type="text"
              placeholder="Chụp ảnh công tơ lưu tại phòng bảo vệ..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg font-semibold shadow-xs"
            >
              Lưu chỉ số
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CreateFeeModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const { buildings, selectedBuildingId } = useBuilding();

  const [buildingId, setBuildingId] = useState(selectedBuildingId !== "ALL" ? selectedBuildingId : buildings[0]?.id);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [calculationType, setCalculationType] = useState<FeeCalculationType>("PER_ROOM");
  const [unitPrice, setUnitPrice] = useState<number>(150000);
  const [unitName, setUnitName] = useState("phòng/tháng");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      storageService.createOrUpdateFee(
        {
          buildingId,
          name,
          code: code || `FEE_${Date.now()}`,
          calculationType,
          unitPrice,
          unitName,
          description,
          isActive: true,
        },
        currentUser
      );

      alert(`Đã lưu biểu phí ${name}!`);
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <h3 className="font-bold text-sm text-slate-900 mb-3 pb-2 border-b border-slate-100">
          Thêm Khoản phí Dịch vụ Mới
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Cơ sở áp dụng:</label>
            <select
              value={buildingId}
              onChange={(e) => setBuildingId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Tên khoản phí:</label>
            <input
              type="text"
              placeholder="Vd: Phí gửi ô tô, Phí dọn phòng..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Cách tính:</label>
              <select
                value={calculationType}
                onChange={(e) => setCalculationType(e.target.value as FeeCalculationType)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="PER_ROOM">Theo từng phòng</option>
                <option value="PER_PERSON">Theo đầu người</option>
                <option value="PER_CONSUMPTION">Theo số lượng</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Đơn vị hiển thị:</label>
              <input
                type="text"
                placeholder="xe/tháng, phòng/tháng"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-slate-700 font-medium mb-1">Đơn giá (₫):</label>
              <input
                type="number"
                step={10000}
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-semibold"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-slate-700 font-medium mb-1">Mô tả chi tiết:</label>
              <input
                type="text"
                placeholder="Mô tả phạm vi áp dụng..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg font-semibold shadow-xs"
            >
              Lưu Biểu phí
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
