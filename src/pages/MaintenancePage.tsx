import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useBuilding } from "../context/BuildingContext";
import { storageService } from "../services/storage";
import { formatDateVN, formatDateTimeVN } from "../lib/utils";
import {
  MaintenanceRequest,
  MaintenanceStatus,
  MaintenancePriority,
} from "../types";
import {
  Wrench,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  History,
  Image as ImageIcon,
  Boxes,
} from "lucide-react";

export const MaintenancePage: React.FC = () => {
  const { currentUser, currentRole } = useAuth();
  const { selectedBuildingId } = useBuilding();

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignedStaffId, setAssignedStaffId] = useState("");
  const [assignNotes, setAssignNotes] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [nextStatus, setNextStatus] = useState<MaintenanceStatus>("Đang xử lý");
  const [progressNotes, setProgressNotes] = useState("");

  let requests = storageService.getMaintenanceRequests({ buildingId: selectedBuildingId });
  if (currentRole === "RESIDENT") {
    requests = requests.filter(
      (r) => r.residentPhone === currentUser?.phoneNumber || r.residentId === currentUser?.residentId
    );
  } else if (currentRole === "STAFF") {
    // Show all for scope, highlight assigned
  }

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (priorityFilter !== "ALL" && r.priority !== priorityFilter) return false;
    if (
      searchQuery &&
      !r.requestCode.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.apartmentCode.includes(searchQuery)
    ) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case "Mới":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Mới tạo</span>;
      case "Đã phân công":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Đã phân công</span>;
      case "Đang xử lý":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">Đang xử lý</span>;
      case "Hoàn thành":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Hoàn thành</span>;
      case "Hủy":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-200 text-slate-700 border border-slate-300">Đã hủy</span>;
    }
  };

  const getPriorityBadge = (priority: MaintenancePriority) => {
    switch (priority) {
      case "URGENT":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white uppercase">Khẩn cấp</span>;
      case "HIGH":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Cao</span>;
      case "MEDIUM":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">Vừa</span>;
      case "LOW":
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">Thấp</span>;
    }
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !currentUser) return;
    try {
      storageService.assignMaintenanceStaff(selectedRequest.id, assignedStaffId, assignNotes, currentUser);
      alert(`Đã phân công xử lý cho nhân viên.`);
      setShowAssignModal(false);
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !currentUser) return;
    try {
      storageService.updateMaintenanceStatus(selectedRequest.id, nextStatus, progressNotes, currentUser);
      alert(`Đã cập nhật tiến độ yêu cầu ${selectedRequest.requestCode}`);
      setShowUpdateModal(false);
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Quản lý Sửa chữa & Bảo trì</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Tiếp nhận sự cố từ cư dân, gắn tài sản phòng, phân công kỹ thuật và theo dõi tiến độ từng mốc
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo mã sự cố, phòng, nội dung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-medium">Trạng thái:</span>
          {["ALL", "Mới", "Đã phân công", "Đang xử lý", "Hoàn thành"].map((st) => (
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

      {/* Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                <th className="py-3 px-4">Mã sự cố</th>
                <th className="py-3 px-4">Phòng</th>
                <th className="py-3 px-4">Tiêu đề yêu cầu</th>
                <th className="py-3 px-4">Tài sản liên quan</th>
                <th className="py-3 px-4">Mức ưu tiên</th>
                <th className="py-3 px-4">Người phụ trách</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Thời gian tạo</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{req.requestCode}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      P.{req.apartmentCode}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                    {req.title}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {req.assetName || <span className="text-slate-400">Thiết bị chung</span>}
                  </td>
                  <td className="py-3 px-4">{getPriorityBadge(req.priority)}</td>
                  <td className="py-3 px-4 text-slate-800 font-medium">
                    {req.assignedStaffName || <span className="text-amber-700 font-normal">Chưa phân công</span>}
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(req.status)}</td>
                  <td className="py-3 px-4 text-slate-600">{formatDateVN(req.createdAt)}</td>
                  <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                    {/* Manager assign button */}
                    {(currentRole === "ADMIN" || currentRole === "MANAGER") && (req.status === "Mới" || req.status === "Đã phân công") && (
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          setAssignedStaffId("");
                          setAssignNotes("");
                          setShowAssignModal(true);
                        }}
                        className="text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs font-semibold border border-blue-200"
                      >
                        Phân công
                      </button>
                    )}

                    {/* Staff update progress */}
                    {(currentRole === "ADMIN" || currentRole === "MANAGER" || currentRole === "STAFF") && req.status !== "Hoàn thành" && req.status !== "Hủy" && (
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          setNextStatus(req.status === "Đang xử lý" ? "Hoàn thành" : "Đang xử lý");
                          setProgressNotes("");
                          setShowUpdateModal(true);
                        }}
                        className="text-teal-700 bg-teal-50 hover:bg-teal-100 px-2 py-1 rounded text-xs font-semibold border border-teal-200"
                      >
                        Cập nhật
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedRequest(req)}
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

      {/* DETAIL & TIMELINE MODAL */}
      {selectedRequest && !showAssignModal && !showUpdateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-900">{selectedRequest.requestCode}</span>
                {getStatusBadge(selectedRequest.status)}
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <h3 className="font-bold text-sm text-slate-900">{selectedRequest.title}</h3>
                <p className="text-slate-600 leading-relaxed">{selectedRequest.description}</p>
                <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-slate-600">
                  <p>Phòng: <strong className="text-teal-800">P.{selectedRequest.apartmentCode} ({selectedRequest.buildingName})</strong></p>
                  <p>Người tạo: <strong>{selectedRequest.residentName} ({selectedRequest.residentPhone})</strong></p>
                  <p>Tài sản: <strong>{selectedRequest.assetName || "Không chỉ định"}</strong></p>
                  <p>Nhân viên: <strong>{selectedRequest.assignedStaffName || "Chưa có"}</strong></p>
                </div>
              </div>

              {selectedRequest.completionNotes && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                  <span className="font-bold block">Biên bản nghiệm thu hoàn tất:</span>
                  <p className="mt-0.5">{selectedRequest.completionNotes}</p>
                </div>
              )}

              {/* TIMELINE */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-teal-700" />
                  <span>Tiến độ xử lý sự cố (Timeline)</span>
                </h4>
                <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {selectedRequest.timeline.map((tml) => (
                    <div key={tml.id} className="relative">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#0F766E] border-2 border-white shadow-xs"></div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div className="flex justify-between font-semibold text-slate-900">
                          <span>{tml.action}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{formatDateTimeVN(tml.timestamp)}</span>
                        </div>
                        {tml.notes && <p className="text-slate-600 mt-1">{tml.notes}</p>}
                        <p className="text-[10px] text-slate-400 mt-1">Thực hiện: {tml.actorName} ({tml.actorRole})</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN MODAL */}
      {showAssignModal && selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 mb-3 pb-2 border-b border-slate-100">
              Phân công Nhân sự xử lý {selectedRequest.requestCode}
            </h3>
            <form onSubmit={handleAssign} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Chọn nhân viên kỹ thuật / vận hành:</label>
                <select
                  value={assignedStaffId}
                  onChange={(e) => setAssignedStaffId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold"
                  required
                >
                  <option value="">-- Chọn nhân viên phụ trách --</option>
                  {storageService
                    .getUsers()
                    .filter((u) => u.role === "STAFF")
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.phoneNumber})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Chỉ đạo / Thời hạn hoàn thành:</label>
                <textarea
                  rows={2}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="Kiểm tra trong vòng 24h, liên hệ trước với cư dân..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg font-semibold shadow-xs"
                >
                  Giao việc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {showUpdateModal && selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 mb-3 pb-2 border-b border-slate-100">
              Cập nhật Tiến độ Sửa chữa {selectedRequest.requestCode}
            </h3>
            <form onSubmit={handleUpdateStatus} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Trạng thái tiếp theo:</label>
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value as MaintenanceStatus)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold"
                >
                  <option value="Đang xử lý">Đang xử lý (Đang sửa/thay vật tư)</option>
                  <option value="Hoàn thành">Hoàn thành (Đã nghiệm thu xong)</option>
                  <option value="Hủy">Hủy yêu cầu (Không còn nhu cầu / Trùng)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  {nextStatus === "Hoàn thành" ? "Biên bản nghiệm thu & kết quả:" : "Ghi chú tiến độ:"}
                </label>
                <textarea
                  rows={3}
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  placeholder="Đã thay mới linh kiện, kiểm tra vận hành đạt chuẩn..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg font-semibold shadow-xs"
                >
                  Lưu tiến độ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE REQUEST MODAL */}
      {showCreateModal && (
        <CreateMaintenanceModal
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

const CreateMaintenanceModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const { selectedBuildingId } = useBuilding();

  const apartments = storageService.getApartments(selectedBuildingId);
  const [apartmentId, setApartmentId] = useState(apartments[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<MaintenancePriority>("MEDIUM");
  const [assetId, setAssetId] = useState("");

  const roomAssets = storageService.getAssets({ apartmentId });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      storageService.createMaintenanceRequest(
        {
          apartmentId,
          assetId: assetId || undefined,
          title,
          description,
          priority,
        },
        currentUser
      );

      alert("Yêu cầu sửa chữa đã được gửi tới Ban Quản lý!");
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
            <Wrench className="w-5 h-5 text-[#0F766E]" />
            <h3 className="font-bold text-sm text-slate-900">Báo hỏng & Yêu cầu Sửa chữa</h3>
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
            <label className="block text-slate-700 font-medium mb-1">Phòng cần sửa chữa:</label>
            <select
              value={apartmentId}
              onChange={(e) => setApartmentId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold"
            >
              {apartments.map((a) => (
                <option key={a.id} value={a.id}>
                  Phòng {a.roomCode} ({a.buildingName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Thiết bị hỏng hóc (nếu có):</label>
            <select
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="">-- Sự cố chung (Không thuộc thiết bị phòng) --</option>
              {roomAssets.map((ast) => (
                <option key={ast.id} value={ast.id}>
                  {ast.name} ({ast.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Tiêu đề sự cố:</label>
            <input
              type="text"
              placeholder="Vd: Điều hòa rỉ nước, Vòi sen gãy chốt..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Mức độ ưu tiên:</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as MaintenancePriority)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="LOW">Thấp (Có thể xử lý trong tuần)</option>
              <option value="MEDIUM">Vừa (Xử lý trong 24h-48h)</option>
              <option value="HIGH">Cao (Cần khắc phục trong ngày)</option>
              <option value="URGENT">Khẩn cấp (Rò rỉ điện/nước, nguy hiểm)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Mô tả hiện trạng chi tiết:</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả cụ thể triệu chứng sự cố..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
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
              Gửi yêu cầu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
