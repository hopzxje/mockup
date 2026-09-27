import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useBuilding } from "../context/BuildingContext";
import { storageService } from "../services/storage";
import { maskCCCD, maskPhone, formatDateVN, formatCurrencyVND } from "../lib/utils";
import { Resident, CoResident } from "../types";
import {
  Users,
  Search,
  LogIn,
  LogOut,
  UserPlus,
  Shield,
  Phone,
  Mail,
  Home,
  AlertTriangle,
  CheckCircle2,
  FileText,
} from "lucide-react";

export const ResidentsPage: React.FC = () => {
  const { currentUser, currentRole } = useAuth();
  const { selectedBuildingId } = useBuilding();

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [handoverNotes, setHandoverNotes] = useState<string>("");

  const residents = storageService.getResidents(selectedBuildingId);

  const filteredResidents = residents.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (
      searchQuery &&
      !r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.phoneNumber.includes(searchQuery) &&
      !(r.currentApartmentCode && r.currentApartmentCode.includes(searchQuery))
    ) {
      return false;
    }
    return true;
  });

  const handleCheckIn = (res: Resident) => {
    if (!currentUser) return;
    if (window.confirm(`Xác nhận Check-in cho cư dân ${res.fullName} vào phòng ${res.currentApartmentCode}?`)) {
      try {
        storageService.checkInResident(res.id, currentUser);
        alert(`Check-in thành công cho cư dân ${res.fullName}!`);
        window.location.reload();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleOpenCheckOut = (res: Resident) => {
    setSelectedResident(res);
    setHandoverNotes("Bàn giao đầy đủ 6 tài sản nguyên vẹn, chìa khóa phòng và thẻ từ.");
    setShowCheckOutModal(true);
  };

  const handleConfirmCheckOut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResident || !currentUser) return;

    try {
      const result = storageService.checkOutResident(selectedResident.id, handoverNotes, currentUser);
      alert(result.message);
      setShowCheckOutModal(false);
      window.location.reload();
    } catch (err: any) {
      alert(`Không thể hoàn tất Check-out:\n${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Quản lý Hồ sơ Cư dân & Lưu trú</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Quản lý thông tin cư dân, người ở cùng, bảo mật CCCD và quy trình Check-in / Check-out
          </p>
        </div>

        {currentRole !== "RESIDENT" && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#0F766E] hover:bg-[#115E59] text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Thêm Hồ sơ Cư dân</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, SĐT, số phòng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-medium">Trạng thái:</span>
          {["ALL", "Đang thuê", "Chờ nhận phòng", "Đã chuyển đi"].map((st) => (
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

      {/* Residents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4">Phòng cư trú</th>
                <th className="py-3 px-4">Số CCCD (Bảo mật)</th>
                <th className="py-3 px-4">Số điện thoại</th>
                <th className="py-3 px-4">Người ở cùng</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Ngày nhận phòng</th>
                <th className="py-3 px-4 text-right">Quy trình</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResidents.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {res.fullName}
                    <span className="block text-[11px] text-slate-400 font-normal">{res.email}</span>
                  </td>
                  <td className="py-3 px-4">
                    {res.currentApartmentCode ? (
                      <div>
                        <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          P.{res.currentApartmentCode}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{res.currentBuildingName}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Chưa xếp phòng</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-700">
                    {maskCCCD(res.nationalId)}
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-medium">
                    {res.phoneNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {res.coResidents && res.coResidents.length > 0 ? (
                      <span className="font-medium text-slate-800">
                        {res.coResidents.length} người ({res.coResidents[0].fullName})
                      </span>
                    ) : (
                      <span className="text-slate-400">Ở 1 mình</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        res.status === "Đang thuê"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : res.status === "Chờ nhận phòng"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {res.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {formatDateVN(res.checkedInAt)}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {res.status === "Chờ nhận phòng" && (
                      <button
                        onClick={() => handleCheckIn(res)}
                        className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded text-xs font-semibold"
                      >
                        Check-in
                      </button>
                    )}
                    {res.status === "Đang thuê" && (
                      <button
                        onClick={() => handleOpenCheckOut(res)}
                        className="text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded text-xs font-semibold"
                      >
                        Check-out
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedResident(res)}
                      className="text-[#0F766E] hover:underline font-semibold"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CHECK-OUT CONFIRMATION MODAL */}
      {showCheckOutModal && selectedResident && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <LogOut className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Thủ tục Trả phòng (Check-out)
                </h3>
              </div>
              <button
                onClick={() => setShowCheckOutModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmCheckOut} className="mt-4 space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <p>Cư dân: <strong className="text-slate-900">{selectedResident.fullName}</strong></p>
                <p>Phòng trả: <strong className="text-teal-800">P.{selectedResident.currentApartmentCode} ({selectedResident.currentBuildingName})</strong></p>
                <p>CCCD: <span className="font-mono">{maskCCCD(selectedResident.nationalId)}</span></p>
              </div>

              {/* Debt check warning indicator */}
              {(() => {
                const pending = storageService.getInvoices({ residentId: selectedResident.id }).filter(
                  (i) => i.status !== "Đã thanh toán" && i.status !== "Đã hủy" && i.balanceRemaining > 0
                );
                const debt = pending.reduce((sum, i) => sum + i.balanceRemaining, 0);

                if (debt > 0) {
                  return (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>Cảnh báo nợ tồn đọng!</span>
                      </div>
                      <p>
                        Cư dân còn {pending.length} hóa đơn chưa thanh toán với tổng số tiền nợ{" "}
                        <strong>{formatCurrencyVND(debt)}</strong>. Hệ thống sẽ chặn hoàn tất check-out cho đến khi thanh toán xong.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Nghĩa vụ tài chính đã hoàn tất (Công nợ: 0 ₫). Đủ điều kiện trả phòng.</span>
                  </div>
                );
              })()}

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Biên bản bàn giao tài sản & ghi chú:
                </label>
                <textarea
                  rows={3}
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  placeholder="Kiểm kê tài sản bàn giao, chìa khóa..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCheckOutModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Xác nhận Hoàn tất Check-out
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE RESIDENT MODAL */}
      {showCreateModal && (
        <CreateResidentModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

const CreateResidentModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const { buildings } = useBuilding();

  const [fullName, setFullName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("1998-01-01");
  const [hometown, setHometown] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (nationalId.length !== 12) {
      alert("Số Căn cước công dân (CCCD) phải gồm đúng 12 chữ số theo quy định.");
      return;
    }

    try {
      storageService.createResident(
        {
          userId: `usr-res-${Date.now()}`,
          fullName,
          nationalId,
          phoneNumber,
          email,
          dateOfBirth,
          hometown,
          emergencyContactName,
          emergencyContactPhone,
          status: "Chờ nhận phòng",
          coResidents: [],
        },
        currentUser
      );

      alert(`Đã thêm thành công hồ sơ cư dân ${fullName}!`);
      onSuccess();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#0F766E]" />
            <h3 className="font-bold text-sm text-slate-900">Thêm Hồ sơ Cư dân Mới</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-slate-700 font-medium mb-1">Họ và tên cư dân:</label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Số CCCD (12 số):</label>
              <input
                type="text"
                maxLength={12}
                placeholder="079198001234"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Số điện thoại:</label>
              <input
                type="text"
                placeholder="0901234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Email liên lạc:</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Ngày sinh:</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-slate-700 font-medium mb-1">Quê quán / Thường trú:</label>
              <input
                type="text"
                placeholder="Đà Nẵng, Quảng Nam..."
                value={hometown}
                onChange={(e) => setHometown(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Người liên hệ khẩn cấp:</label>
              <input
                type="text"
                placeholder="Họ tên người thân"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">SĐT khẩn cấp:</label>
              <input
                type="text"
                placeholder="0912..."
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>
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
              Tạo Hồ sơ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
