import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useBuilding } from "../context/BuildingContext";
import { storageService } from "../services/storage";
import { formatDateVN, formatCurrencyVND } from "../lib/utils";
import { RentalContract, ContractStatus } from "../types";
import {
  FileText,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  RotateCw,
  AlertCircle,
  FileCheck,
  Eye,
  Calendar,
  DollarSign,
} from "lucide-react";

export const ContractsPage: React.FC = () => {
  const { currentUser, currentRole } = useAuth();
  const { selectedBuildingId } = useBuilding();

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<RentalContract | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewEndDate, setRenewEndDate] = useState("");
  const [renewRentPrice, setRenewRentPrice] = useState<number>(5500000);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [terminationReason, setTerminationReason] = useState("");
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [deductAmount, setDeductAmount] = useState<number>(0);

  let contracts = storageService.getContracts(selectedBuildingId);
  if (currentRole === "RESIDENT") {
    contracts = contracts.filter((c) => c.residentPhone === currentUser?.phoneNumber || c.residentId === currentUser?.residentId);
  }

  const filteredContracts = contracts.filter((c) => {
    if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
    if (
      searchQuery &&
      !c.contractCode.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.residentName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.apartmentCode.includes(searchQuery)
    ) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: ContractStatus) => {
    switch (status) {
      case "Đang hiệu lực":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Đang hiệu lực</span>;
      case "Chờ duyệt":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Chờ duyệt</span>;
      case "Đã duyệt":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">Đã duyệt</span>;
      case "Nháp":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">Bản nháp</span>;
      case "Hết hạn":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">Hết hạn</span>;
      case "Đã chấm dứt":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-200 text-slate-700 border border-slate-300">Đã chấm dứt</span>;
    }
  };

  const handleApprove = (ctr: RentalContract) => {
    if (!currentUser) return;
    if (window.confirm(`Xác nhận phê duyệt hợp đồng ${ctr.contractCode} cho phòng ${ctr.apartmentCode}?`)) {
      try {
        storageService.approveContract(ctr.id, currentUser);
        alert(`Đã phê duyệt hợp đồng ${ctr.contractCode}`);
        window.location.reload();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract || !currentUser) return;
    try {
      storageService.rejectContract(selectedContract.id, rejectionReason, currentUser);
      alert(`Đã từ chối hợp đồng ${selectedContract.contractCode}`);
      setShowRejectModal(false);
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRenew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract || !currentUser) return;
    try {
      const renewed = storageService.renewContract(selectedContract.id, renewEndDate, renewRentPrice, currentUser);
      alert(`Đã gia hạn hợp đồng thành công! Mã mới: ${renewed.contractCode}`);
      setShowRenewModal(false);
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleTerminate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract || !currentUser) return;
    try {
      storageService.terminateContract(selectedContract.id, terminationReason, refundAmount, deductAmount, currentUser);
      alert(`Đã thanh lý hợp đồng ${selectedContract.contractCode}`);
      setShowTerminateModal(false);
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Quản lý Hợp đồng Thuê Nhà</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Soạn thảo, phê duyệt, gia hạn, chống trùng thời gian và kiểm soát tiền cọc
          </p>
        </div>

        {currentRole !== "RESIDENT" && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#0F766E] hover:bg-[#115E59] text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Soạn Hợp đồng Mới</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo mã HĐ, tên người thuê, số phòng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-medium">Trạng thái:</span>
          {["ALL", "Đang hiệu lực", "Chờ duyệt", "Đã duyệt", "Nháp", "Đã chấm dứt"].map((st) => (
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

      {/* Contracts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                <th className="py-3 px-4">Mã Hợp đồng</th>
                <th className="py-3 px-4">Phòng thuê</th>
                <th className="py-3 px-4">Cư dân đại diện</th>
                <th className="py-3 px-4">Thời hạn thuê</th>
                <th className="py-3 px-4">Giá thuê / tháng</th>
                <th className="py-3 px-4">Tiền đặt cọc</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContracts.map((ctr) => (
                <tr key={ctr.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 font-mono">{ctr.contractCode}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      P.{ctr.apartmentCode}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{ctr.buildingName}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {ctr.residentName}
                    <span className="block text-[11px] text-slate-400 font-normal">{ctr.residentPhone}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    <div>{formatDateVN(ctr.startDate)} → {formatDateVN(ctr.endDate)}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 tabular-nums">
                    {formatCurrencyVND(ctr.rentPrice)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-teal-700 tabular-nums">
                    {formatCurrencyVND(ctr.depositAmount)}
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(ctr.status)}</td>
                  <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                    {/* Actions for Manager / Admin */}
                    {(currentRole === "ADMIN" || currentRole === "MANAGER") && ctr.status === "Chờ duyệt" && (
                      <>
                        <button
                          onClick={() => handleApprove(ctr)}
                          className="text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded text-xs font-semibold border border-teal-200"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => {
                            setSelectedContract(ctr);
                            setRejectionReason("");
                            setShowRejectModal(true);
                          }}
                          className="text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded text-xs font-semibold border border-rose-200"
                        >
                          Từ chối
                        </button>
                      </>
                    )}

                    {(currentRole === "ADMIN" || currentRole === "MANAGER") && ctr.status === "Đang hiệu lực" && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedContract(ctr);
                            setRenewRentPrice(ctr.rentPrice);
                            setRenewEndDate("");
                            setShowRenewModal(true);
                          }}
                          className="text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs font-semibold border border-blue-200"
                        >
                          Gia hạn
                        </button>
                        <button
                          onClick={() => {
                            setSelectedContract(ctr);
                            setTerminationReason("");
                            setRefundAmount(ctr.depositAmount);
                            setDeductAmount(0);
                            setShowTerminateModal(true);
                          }}
                          className="text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-xs font-semibold border border-slate-200"
                        >
                          Thanh lý
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => setSelectedContract(ctr)}
                      className="text-[#0F766E] hover:underline font-semibold text-xs ml-1"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedContract && !showRejectModal && !showRenewModal && !showTerminateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-bold text-base text-slate-900">{selectedContract.contractCode}</span>
                <span className="ml-2">{getStatusBadge(selectedContract.status)}</span>
              </div>
              <button
                onClick={() => setSelectedContract(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400">Cơ sở:</span>
                  <p className="font-semibold text-slate-900">{selectedContract.buildingName}</p>
                </div>
                <div>
                  <span className="text-slate-400">Phòng thuê:</span>
                  <p className="font-semibold text-teal-800">Phòng {selectedContract.apartmentCode}</p>
                </div>
                <div>
                  <span className="text-slate-400">Người thuê chính:</span>
                  <p className="font-semibold text-slate-900">{selectedContract.residentName}</p>
                </div>
                <div>
                  <span className="text-slate-400">Số điện thoại:</span>
                  <p className="font-semibold text-slate-900">{selectedContract.residentPhone}</p>
                </div>
                <div>
                  <span className="text-slate-400">Thời hạn:</span>
                  <p className="font-semibold text-slate-900">
                    {formatDateVN(selectedContract.startDate)} đến {formatDateVN(selectedContract.endDate)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Giá thuê / tháng:</span>
                  <p className="font-bold text-teal-800">{formatCurrencyVND(selectedContract.rentPrice)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Tiền cọc giữ chỗ:</span>
                  <p className="font-bold text-slate-900">{formatCurrencyVND(selectedContract.depositAmount)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Người soạn hợp đồng:</span>
                  <p className="font-medium text-slate-700">{selectedContract.createdBy}</p>
                </div>
              </div>

              {selectedContract.rejectionReason && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
                  <span className="font-bold block">Lý do từ chối trước đó:</span>
                  <p>{selectedContract.rejectionReason}</p>
                </div>
              )}

              {selectedContract.terminationReason && (
                <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 space-y-1">
                  <span className="font-bold block">Lý do chấm dứt / Thanh lý:</span>
                  <p>{selectedContract.terminationReason}</p>
                  <p>Tiền cọc hoàn trả: <strong>{formatCurrencyVND(selectedContract.depositRefunded)}</strong></p>
                </div>
              )}

              <div>
                <span className="text-slate-500 font-medium block mb-1">Điều khoản hợp đồng:</span>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed max-h-32 overflow-y-auto">
                  {selectedContract.terms}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedContract(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && selectedContract && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 mb-2">
              Từ chối phê duyệt Hợp đồng {selectedContract.contractCode}
            </h3>
            <form onSubmit={handleReject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Lý do từ chối (bắt buộc để nhân viên chỉnh sửa):
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Sai sót về giá cọc, thiếu thông tin CCCD..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Xác nhận Từ chối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENEW MODAL */}
      {showRenewModal && selectedContract && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 mb-2">
              Gia hạn Hợp đồng {selectedContract.contractCode}
            </h3>
            <form onSubmit={handleRenew} className="space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p>Khách thuê: <strong>{selectedContract.residentName}</strong></p>
                <p>Phòng: <strong>P.{selectedContract.apartmentCode}</strong></p>
                <p>Hạn cũ kết thúc: <strong>{formatDateVN(selectedContract.endDate)}</strong></p>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Ngày kết thúc mới:</label>
                <input
                  type="date"
                  value={renewEndDate}
                  onChange={(e) => setRenewEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Giá thuê áp dụng mới (₫/tháng):</label>
                <input
                  type="number"
                  step={100000}
                  value={renewRentPrice}
                  onChange={(e) => setRenewRentPrice(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-semibold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRenewModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Xác nhận Gia hạn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TERMINATE MODAL */}
      {showTerminateModal && selectedContract && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 mb-2">
              Thanh lý Hợp đồng {selectedContract.contractCode}
            </h3>
            <form onSubmit={handleTerminate} className="space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p>Tiền cọc ban đầu: <strong>{formatCurrencyVND(selectedContract.depositAmount)}</strong></p>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Số tiền cọc hoàn trả (₫):</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-semibold text-teal-800"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Số tiền khấu trừ đền bù (nếu có):</label>
                <input
                  type="number"
                  value={deductAmount}
                  onChange={(e) => setDeductAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-semibold text-rose-700"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Lý do chấm dứt:</label>
                <textarea
                  rows={2}
                  value={terminationReason}
                  onChange={(e) => setTerminationReason(e.target.value)}
                  placeholder="Khách hết hạn hợp đồng / Chuyển công tác..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTerminateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold shadow-xs"
                >
                  Hoàn tất Thanh lý
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE DRAFT CONTRACT MODAL */}
      {showCreateModal && (
        <CreateContractModal
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

const CreateContractModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const { buildings, selectedBuildingId } = useBuilding();

  const [buildingId, setBuildingId] = useState(selectedBuildingId !== "ALL" ? selectedBuildingId : buildings[0]?.id);
  const apartments = storageService.getApartments(buildingId);
  const residents = storageService.getResidents(buildingId);

  const [apartmentId, setApartmentId] = useState(apartments[0]?.id || "");
  const [residentId, setResidentId] = useState(residents[0]?.id || "");
  const [startDate, setStartDate] = useState("2026-10-01");
  const [endDate, setEndDate] = useState("2027-09-30");
  const [rentPrice, setRentPrice] = useState<number>(5500000);
  const [depositAmount, setDepositAmount] = useState<number>(11000000);
  const [terms, setTerms] = useState(
    "Thời hạn thuê 12 tháng. Đóng tiền phòng từ ngày 01 đến ngày 05 hằng tháng qua SePay QR. Giữ gìn an ninh trật tự và thiết bị phòng."
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (new Date(endDate) <= new Date(startDate)) {
      alert("Ngày kết thúc hợp đồng phải sau ngày bắt đầu.");
      return;
    }

    const apt = apartments.find((a) => a.id === apartmentId);
    const res = residents.find((r) => r.id === residentId);
    const bld = buildings.find((b) => b.id === buildingId);

    if (!apt || !res || !bld) {
      alert("Vui lòng chọn đủ thông tin cơ sở, phòng và người thuê");
      return;
    }

    try {
      storageService.createContract(
        {
          buildingId: bld.id,
          buildingName: bld.name,
          apartmentId: apt.id,
          apartmentCode: apt.roomCode,
          residentId: res.id,
          residentName: res.fullName,
          residentPhone: res.phoneNumber,
          residentNationalId: res.nationalId,
          coResidents: [],
          startDate,
          endDate,
          rentPrice,
          depositAmount,
          paymentCycleMonths: 1,
          terms,
          status: "Chờ duyệt",
          createdBy: `${currentUser.fullName} (${currentUser.role})`,
        },
        currentUser
      );

      alert(`Hợp đồng đã được tạo và gửi lên Quản lý phê duyệt!`);
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#0F766E]" />
            <h3 className="font-bold text-sm text-slate-900">Soạn thảo Hợp đồng Thuê Mới</h3>
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
            <div>
              <label className="block text-slate-700 font-medium mb-1">Cơ sở:</label>
              <select
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Phòng thuê:</label>
              <select
                value={apartmentId}
                onChange={(e) => setApartmentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white font-semibold"
              >
                {apartments.map((a) => (
                  <option key={a.id} value={a.id}>
                    P.{a.roomCode} ({a.status} - {formatCurrencyVND(a.referencePrice)})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-slate-700 font-medium mb-1">Cư dân thuê chính:</label>
              <select
                value={residentId}
                onChange={(e) => setResidentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white font-semibold"
              >
                {residents.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.fullName} ({r.phoneNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Ngày bắt đầu:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Ngày kết thúc:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Giá thuê thỏa thuận (₫/tháng):</label>
              <input
                type="number"
                step={100000}
                value={rentPrice}
                onChange={(e) => setRentPrice(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Tiền đặt cọc (₫):</label>
              <input
                type="number"
                step={100000}
                value={depositAmount}
                onChange={(e) => setDepositAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-semibold"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-slate-700 font-medium mb-1">Điều khoản hợp đồng:</label>
              <textarea
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
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
              Gửi Quản lý duyệt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
