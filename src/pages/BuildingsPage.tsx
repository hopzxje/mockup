import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useBuilding } from "../context/BuildingContext";
import { storageService } from "../services/storage";
import { formatCurrencyVND } from "../lib/utils";
import { Building, Apartment, ApartmentStatus } from "../types";
import {
  Building2,
  Plus,
  Layers,
  LayoutGrid,
  List,
  Search,
  CheckCircle,
  AlertCircle,
  Wrench,
  Users,
  Eye,
  SlidersHorizontal,
  Boxes,
  Trash2,
  AlertOctagon,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Zap,
  Droplets,
  DoorOpen,
} from "lucide-react";

export const BuildingsPage: React.FC = () => {
  const { currentRole, currentUser } = useAuth();
  const {
    selectedBuildingId,
    setSelectedBuildingId,
    buildings,
    refreshBuildings,
    userAccessibleBuildings,
  } = useBuilding();

  const [activeTab, setActiveTab] = useState<"rooms" | "overview" | "staff" | "residents">("rooms");
  const [viewMode, setViewMode] = useState<"map" | "table">("map");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [showCreateApartmentModal, setShowCreateApartmentModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showCreateBuildingModal, setShowCreateBuildingModal] = useState(false);
  const [showDeleteBuildingModal, setShowDeleteBuildingModal] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);

  // All accessible active buildings for this user
  const activeUserBuildings = buildings
    .filter((b) => b.isActive !== false)
    .filter((b) => {
      if (!currentUser) return false;
      if (currentUser.role === "ADMIN" || currentUser.role === "MANAGER") return true;
      return currentUser.assignedBuildingIds.includes(b.id) || b.managerId === currentUser.id;
    });

  // Active building
  const activeBuilding =
    buildings.find((b) => b.id === selectedBuildingId) ||
    activeUserBuildings[0] ||
    buildings[0];

  const apartments = storageService.getApartments(activeBuilding?.id);
  const assets = storageService.getAssets({ buildingId: activeBuilding?.id });

  // Filtered apartments
  const filteredApartments = apartments.filter((apt) => {
    if (statusFilter !== "ALL" && apt.status !== statusFilter) return false;
    if (searchQuery && !apt.roomCode.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Group apartments by floor for Map view
  const floors = Array.from(new Set(filteredApartments.map((a) => a.floor))).sort((a, b) => a - b);

  const getStatusBadge = (status: ApartmentStatus) => {
    switch (status) {
      case "Trống":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Trống</span>;
      case "Đang thuê":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-100 text-teal-800 border border-teal-200">Đang thuê</span>;
      case "Đã giữ chỗ":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">Đã giữ chỗ</span>;
      case "Bảo trì":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">Bảo trì</span>;
      case "Ngừng sử dụng":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">Ngừng dùng</span>;
    }
  };

  const handleStatusChange = (apt: Apartment, newStatus: ApartmentStatus) => {
    if (!currentUser) return;
    try {
      storageService.updateApartmentStatus(apt.id, newStatus, currentUser);
      refreshBuildings();
      setSelectedApartment(storageService.getApartmentById(apt.id) || null);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleRestoreBuilding = () => {
    if (!activeBuilding || !currentUser) return;
    if (window.confirm(`Bạn có chắc chắn muốn khôi phục cơ sở "${activeBuilding.name}" trở lại hoạt động?`)) {
      try {
        storageService.restoreBuilding(activeBuilding.id, currentUser);
        refreshBuildings();
        alert(`Đã khôi phục cơ sở ${activeBuilding.name} thành công.`);
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Building Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-bold text-[#0F172A]">{activeBuilding?.name}</h2>
            <span
              className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                activeBuilding?.isActive === false
                  ? "bg-rose-100 text-rose-800 border-rose-200"
                  : "bg-teal-100 text-teal-800 border border-teal-200"
              }`}
            >
              {activeBuilding?.code} {activeBuilding?.isActive === false ? "• ĐÃ XÓA MỀM" : ""}
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            {activeBuilding?.address} • Quản lý: <strong className="text-slate-800">{activeBuilding?.managerName}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {(currentRole === "ADMIN" || currentRole === "MANAGER") && (
            <button
              onClick={() => setShowCreateBuildingModal(true)}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Thêm Cơ sở Mới</span>
            </button>
          )}

          {(currentRole === "ADMIN" || currentRole === "MANAGER") && activeBuilding?.isActive !== false && (
            <button
              onClick={() => setShowCreateApartmentModal(true)}
              className="bg-[#0F766E] hover:bg-[#115E59] text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Phòng Mới</span>
            </button>
          )}

          {(currentRole === "ADMIN" || currentRole === "MANAGER") && (
            <button
              onClick={() => setShowBatchModal(true)}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Sinh Phòng Hàng Loạt</span>
            </button>
          )}

          {/* Delete Building Button (Only for active buildings) */}
          {(currentRole === "ADMIN" || currentRole === "MANAGER") && activeBuilding?.isActive !== false && (
            <button
              onClick={() => setShowDeleteBuildingModal(true)}
              className="bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Xóa mềm cơ sở (Yêu cầu tất cả các phòng phải ở trạng thái Trống)"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Xóa Cơ sở</span>
            </button>
          )}
        </div>
      </div>

      {/* Archived Building Banner */}
      {activeBuilding?.isActive === false && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-900 text-sm">
                Cơ sở này đã được XÓA MỀM (Lưu trữ / Ngừng hoạt động)
              </p>
              <p className="text-rose-700 mt-1">
                Thời gian xóa: <strong>{activeBuilding.deletedAt ? new Date(activeBuilding.deletedAt).toLocaleString("vi-VN") : "N/A"}</strong>
                {activeBuilding.deletedBy && <> • Người thực hiện: <strong>{activeBuilding.deletedBy}</strong></>}
                {activeBuilding.deleteReason && <> • Lý do: <em className="italic">"{activeBuilding.deleteReason}"</em></>}
              </p>
              <p className="text-rose-600 mt-0.5 text-[11px]">
                Toàn bộ dữ liệu phòng, hóa đơn và lịch sử vẫn được bảo lưu. Bạn có thể khôi phục bất cứ lúc nào.
              </p>
            </div>
          </div>

          {(currentRole === "ADMIN" || currentRole === "MANAGER") && (
            <button
              onClick={handleRestoreBuilding}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Khôi phục Cơ sở này</span>
            </button>
          )}
        </div>
      )}

      {/* Building Tabs */}
      <div className="border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab("rooms")}
            className={`py-3 px-1 border-b-2 transition-colors ${
              activeTab === "rooms"
                ? "border-[#0F766E] text-[#0F766E] font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Sơ đồ & Danh sách Phòng ({apartments.length})
          </button>
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-1 border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-[#0F766E] text-[#0F766E] font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Tổng quan Cơ sở
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`py-3 px-1 border-b-2 transition-colors ${
              activeTab === "staff"
                ? "border-[#0F766E] text-[#0F766E] font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Nhân sự phụ trách
          </button>
        </div>

        {/* View Mode Switcher (Grid Map vs Table) */}
        {activeTab === "rooms" && (
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode("map")}
              className={`p-1.5 rounded-md text-xs flex items-center gap-1 transition-colors ${
                viewMode === "map"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Xem theo Sơ đồ Tầng"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sơ đồ Tầng</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md text-xs flex items-center gap-1 transition-colors ${
                viewMode === "table"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Xem theo Bảng"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dạng Bảng</span>
            </button>
          </div>
        )}
      </div>

      {activeTab === "rooms" && (
        <>
          {/* Filters & Search */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm theo số phòng (vd: 101, 202)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-400 font-medium">Trạng thái:</span>
              {["ALL", "Trống", "Đang thuê", "Đã giữ chỗ", "Bảo trì"].map((st) => (
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

          {/* SƠ ĐỒ TẦNG (FLOOR MAP VIEW) */}
          {viewMode === "map" ? (
            <div className="space-y-6">
              {floors.map((floor) => {
                const floorApts = filteredApartments.filter((a) => a.floor === floor);
                return (
                  <div key={floor} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-teal-50 text-[#0F766E] font-bold text-xs flex items-center justify-center border border-teal-200">
                          {floor}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900">Tầng {floor}</h3>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {floorApts.length} phòng
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                      {floorApts.map((apt) => (
                        <div
                          key={apt.id}
                          onClick={() => setSelectedApartment(apt)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:shadow-md relative ${
                            apt.status === "Đang thuê"
                              ? "border-teal-200 bg-teal-50/20 hover:border-teal-400"
                              : apt.status === "Trống"
                              ? "border-emerald-200 bg-emerald-50/20 hover:border-emerald-400"
                              : apt.status === "Bảo trì"
                              ? "border-rose-200 bg-rose-50/20 hover:border-rose-400"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-base font-bold text-slate-900">
                              Phòng {apt.roomCode}
                            </span>
                            {getStatusBadge(apt.status)}
                          </div>

                          <div className="mt-2.5 text-xs text-slate-600 space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Diện tích:</span>
                              <span className="font-medium text-slate-800">{apt.areaSqm} m²</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Giá tham khảo:</span>
                              <span className="font-semibold text-slate-900 tabular-nums">
                                {formatCurrencyVND(apt.referencePrice)}
                              </span>
                            </div>
                            {apt.currentResidentName && (
                              <div className="flex justify-between pt-1 border-t border-slate-100">
                                <span className="text-slate-400">Khách thuê:</span>
                                <span className="font-medium text-teal-800 truncate max-w-[110px]">
                                  {apt.currentResidentName}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Meter codes badge */}
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                            <span className="flex items-center gap-1 text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 truncate max-w-[48%]" title={`Công tơ điện: ${apt.electricityMeterCode}`}>
                              <Zap className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="truncate">{apt.electricityMeterCode}</span>
                            </span>
                            <span className="flex items-center gap-1 text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 truncate max-w-[48%]" title={`Đồng hồ nước: ${apt.waterMeterCode}`}>
                              <Droplets className="w-3 h-3 text-blue-600 shrink-0" />
                              <span className="truncate">{apt.waterMeterCode}</span>
                            </span>
                          </div>

                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                            <span>{apt.assetCount || 6} tài sản</span>
                            <span className="text-[#0F766E] font-medium hover:underline flex items-center gap-0.5">
                              <Eye className="w-3 h-3" /> Chi tiết
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* DẠNG BẢNG (TABLE VIEW) */
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                      <th className="py-3 px-4">Mã phòng</th>
                      <th className="py-3 px-4">Tầng</th>
                      <th className="py-3 px-4">Diện tích</th>
                      <th className="py-3 px-4">Giá thuê niêm yết</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4">Khách đang thuê</th>
                      <th className="py-3 px-4">Công tơ Điện & Nước</th>
                      <th className="py-3 px-4">Tài sản phòng</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredApartments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">P.{apt.roomCode}</td>
                        <td className="py-3 px-4 text-slate-700">Tầng {apt.floor}</td>
                        <td className="py-3 px-4 text-slate-700">{apt.areaSqm} m²</td>
                        <td className="py-3 px-4 font-semibold text-slate-900 tabular-nums">
                          {formatCurrencyVND(apt.referencePrice)}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(apt.status)}</td>
                        <td className="py-3 px-4 text-slate-800 font-medium">
                          {apt.currentResidentName || <span className="text-slate-400">---</span>}
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-0.5 font-mono text-[11px] text-slate-800">
                            <div>Đ: {apt.electricityMeterCode}</div>
                            <div>N: {apt.waterMeterCode}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {apt.assetCount || 6} thiết bị chuẩn
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedApartment(apt)}
                            className="text-[#0F766E] hover:underline font-semibold"
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
          )}
        </>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
            Thông tin chi tiết Cơ sở {activeBuilding?.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-500">Mã cơ sở:</p>
              <p className="font-semibold text-slate-900 text-sm mt-0.5">{activeBuilding?.code}</p>
            </div>
            <div>
              <p className="text-slate-500">Địa chỉ cụ thể:</p>
              <p className="font-semibold text-slate-900 text-sm mt-0.5">{activeBuilding?.address}</p>
            </div>
            <div>
              <p className="text-slate-500">Tổng số tầng:</p>
              <p className="font-semibold text-slate-900 text-sm mt-0.5">{activeBuilding?.totalFloors} tầng</p>
            </div>
            <div>
              <p className="text-slate-500">Tổng số phòng:</p>
              <p className="font-semibold text-slate-900 text-sm mt-0.5">{apartments.length} phòng</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-slate-500">Mô tả đặc điểm:</p>
              <p className="text-slate-700 mt-1 leading-relaxed">{activeBuilding?.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* STAFF ASSIGNMENT TAB */}
      {activeTab === "staff" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">
              Đội ngũ Nhân sự phụ trách {activeBuilding?.name}
            </h3>
            <span className="text-xs text-slate-500">
              Quản lý chính: <strong className="text-slate-900">{activeBuilding?.managerName}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {storageService
              .getUsers()
              .filter((u) => u.role === "STAFF" && u.assignedBuildingIds.includes(activeBuilding?.id || ""))
              .map((staff) => (
                <div key={staff.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shrink-0">
                    {staff.fullName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{staff.fullName}</h4>
                    <p className="text-[11px] text-slate-500">{staff.email} • {staff.phoneNumber}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] bg-blue-100 text-blue-800 font-medium">
                      Nhân viên Vận hành
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* APARTMENT DETAIL MODAL */}
      {selectedApartment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900">
                  Phòng {selectedApartment.roomCode}
                </span>
                {getStatusBadge(selectedApartment.status)}
              </div>
              <button
                onClick={() => setSelectedApartment(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400">Tầng:</span>
                  <p className="font-semibold text-slate-900">Tầng {selectedApartment.floor}</p>
                </div>
                <div>
                  <span className="text-slate-400">Diện tích:</span>
                  <p className="font-semibold text-slate-900">{selectedApartment.areaSqm} m²</p>
                </div>
                <div>
                  <span className="text-slate-400">Giá niêm yết:</span>
                  <p className="font-semibold text-teal-800">{formatCurrencyVND(selectedApartment.referencePrice)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Người thuê hiện tại:</span>
                  <p className="font-semibold text-slate-900">{selectedApartment.currentResidentName || "---"}</p>
                </div>
              </div>

              {/* Electric & Water Meter Info */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>Thiết bị Đo Điện & Nước phòng:</span>
                  </span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                    <span className="text-[10px] text-amber-700 font-semibold block flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-600" />
                      Mã Công tơ điện
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block">
                      {selectedApartment.electricityMeterCode}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-blue-200">
                    <span className="text-[10px] text-blue-700 font-semibold block flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-blue-600" />
                      Mã Đồng hồ nước
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block">
                      {selectedApartment.waterMeterCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Update Control */}
              <div>
                <label className="block text-slate-500 font-medium mb-1">Cập nhật trạng thái phòng:</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(["Trống", "Đang thuê", "Đã giữ chỗ", "Bảo trì", "Ngừng sử dụng"] as ApartmentStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedApartment, st)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                        selectedApartment.status === st
                          ? "bg-slate-900 text-white font-bold"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Predefined Assets in Room */}
              <div>
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                  <Boxes className="w-3.5 h-3.5 text-teal-700" />
                  <span>Danh mục Tài sản trang bị ({storageService.getAssets({ apartmentId: selectedApartment.id }).length})</span>
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {storageService.getAssets({ apartmentId: selectedApartment.id }).map((ast) => (
                    <div key={ast.id} className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="font-semibold text-slate-800">{ast.name}</span>
                        <span className="text-slate-400 block text-[10px]">Mã: {ast.code}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded font-semibold ${
                        ast.condition === "Tốt" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {ast.condition}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedApartment(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE APARTMENT MODAL */}
      {showCreateApartmentModal && activeBuilding && (
        <CreateApartmentModal
          building={activeBuilding}
          onClose={() => setShowCreateApartmentModal(false)}
          onSuccess={() => {
            setShowCreateApartmentModal(false);
            refreshBuildings();
          }}
        />
      )}

      {/* BATCH GENERATION MODAL */}
      {showBatchModal && (
        <BatchRoomGenerationModal
          building={activeBuilding}
          onClose={() => setShowBatchModal(false)}
          onSuccess={() => {
            setShowBatchModal(false);
            refreshBuildings();
          }}
        />
      )}

      {/* CREATE BUILDING MODAL */}
      {showCreateBuildingModal && (
        <CreateBuildingModal
          onClose={() => setShowCreateBuildingModal(false)}
          onSuccess={(newBldId) => {
            setShowCreateBuildingModal(false);
            refreshBuildings();
            if (newBldId) {
              setSelectedBuildingId(newBldId);
            }
          }}
        />
      )}

      {/* SOFT DELETE BUILDING MODAL */}
      {showDeleteBuildingModal && activeBuilding && (
        <SoftDeleteBuildingModal
          building={activeBuilding}
          onClose={() => setShowDeleteBuildingModal(false)}
          onSuccess={() => {
            setShowDeleteBuildingModal(false);
            refreshBuildings();
            // Automatically switch to another available active building if any
            const remaining = activeUserBuildings.filter((b) => b.id !== activeBuilding.id);
            if (remaining.length > 0) {
              setSelectedBuildingId(remaining[0].id);
            } else if (currentRole === "ADMIN") {
              setSelectedBuildingId("ALL");
            }
          }}
        />
      )}
    </div>
  );
};

/**
 * BATCH ROOM GENERATION MODAL COMPONENT
 */
const BatchRoomGenerationModal: React.FC<{
  building: Building;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ building, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [totalFloors, setTotalFloors] = useState<number>(3);
  const [roomsPerFloor, setRoomsPerFloor] = useState<number>(4);
  const [startFloor, setStartFloor] = useState<number>(1);
  const [referencePrice, setReferencePrice] = useState<number>(5500000);
  const [areaSqm, setAreaSqm] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Preview generated codes
  const previewCodes: string[] = [];
  for (let f = startFloor; f < startFloor + totalFloors; f++) {
    for (let r = 1; r <= roomsPerFloor; r++) {
      previewCodes.push(`${f}${r < 10 ? "0" + r : r}`);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const result = storageService.batchGenerateRooms(
        {
          buildingId: building.id,
          totalFloors,
          roomsPerFloor,
          startFloor,
          referencePrice,
          areaSqm,
        },
        currentUser
      );

      alert(`Sinh thành công ${result.generatedRoomsCount} phòng và ${result.generatedAssetsCount} tài sản kèm theo tại ${building.name}!`);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Có lỗi xảy ra khi sinh phòng");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#0F766E]" />
            <h3 className="font-bold text-sm text-slate-900">
              Sinh Phòng Hàng Loạt • {building.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Số lượng tầng cần sinh:</label>
              <input
                type="number"
                min={1}
                max={20}
                value={totalFloors}
                onChange={(e) => setTotalFloors(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Số phòng mỗi tầng:</label>
              <input
                type="number"
                min={1}
                max={20}
                value={roomsPerFloor}
                onChange={(e) => setRoomsPerFloor(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Tầng bắt đầu:</label>
              <input
                type="number"
                min={1}
                value={startFloor}
                onChange={(e) => setStartFloor(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Diện tích trung bình (m²):</label>
              <input
                type="number"
                min={10}
                value={areaSqm}
                onChange={(e) => setAreaSqm(parseInt(e.target.value) || 30)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-slate-700 font-medium mb-1">Giá thuê tham khảo (₫):</label>
              <input
                type="number"
                step={100000}
                value={referencePrice}
                onChange={(e) => setReferencePrice(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-semibold"
                required
              />
            </div>
          </div>

          {/* Preview list */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
              Xem trước danh sách ({previewCodes.length} phòng sẽ được tạo):
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {previewCodes.map((code) => (
                <span
                  key={code}
                  className="px-2 py-1 rounded bg-white text-slate-800 text-[10px] font-mono border border-slate-200 flex items-center gap-1.5"
                >
                  <strong className="text-slate-900">P.{code}</strong>
                  <span className="text-amber-700">⚡EM-{building.code}-{code}</span>
                  <span className="text-blue-700">💧WM-{building.code}-{code}</span>
                </span>
              ))}
            </div>
            <p className="text-[10px] text-teal-800 mt-2 font-medium">
              * Tự động sinh ID Công tơ điện (EM-{building.code}-[Phòng]), ID Đồng hồ nước (WM-{building.code}-[Phòng]) và 6 tài sản nội thất chuẩn cho từng phòng.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <span>{isSubmitting ? "Đang xử lý..." : "Xác nhận Sinh Phòng"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * CREATE APARTMENT MODAL COMPONENT (BẮT BUỘC CÔNG TƠ ĐIỆN VÀ NƯỚC)
 */
const CreateApartmentModal: React.FC<{
  building: Building;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ building, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [roomCode, setRoomCode] = useState("");
  const [floor, setFloor] = useState<number>(1);
  const [areaSqm, setAreaSqm] = useState<number>(28);
  const [referencePrice, setReferencePrice] = useState<number>(6500000);
  const [electricityMeterCode, setElectricityMeterCode] = useState("");
  const [waterMeterCode, setWaterMeterCode] = useState("");
  const [initialElectricityIndex, setInitialElectricityIndex] = useState<number>(0);
  const [initialWaterIndex, setInitialWaterIndex] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-suggest meter codes when roomCode changes
  const handleRoomCodeChange = (val: string) => {
    setRoomCode(val);
    const clean = val.trim().toUpperCase();
    if (clean) {
      if (!electricityMeterCode || electricityMeterCode.startsWith(`EM-${building.code}-`)) {
        setElectricityMeterCode(`EM-${building.code}-${clean}`);
      }
      if (!waterMeterCode || waterMeterCode.startsWith(`WM-${building.code}-`)) {
        setWaterMeterCode(`WM-${building.code}-${clean}`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setErrorMsg(null);

    if (!roomCode.trim()) {
      setErrorMsg("Vui lòng nhập số/mã phòng.");
      return;
    }
    if (!electricityMeterCode.trim()) {
      setErrorMsg("Vui lòng nhập ID/Mã công tơ điện của phòng.");
      return;
    }
    if (!waterMeterCode.trim()) {
      setErrorMsg("Vui lòng nhập ID/Mã đồng hồ nước của phòng.");
      return;
    }

    try {
      storageService.createApartment(
        {
          buildingId: building.id,
          roomCode: roomCode.trim().toUpperCase(),
          floor,
          areaSqm,
          referencePrice,
          description,
          electricityMeterCode: electricityMeterCode.trim().toUpperCase(),
          waterMeterCode: waterMeterCode.trim().toUpperCase(),
          initialElectricityIndex,
          initialWaterIndex,
        },
        currentUser
      );
      alert(`Đã tạo thành công phòng ${roomCode.trim().toUpperCase()} kèm công tơ điện (${electricityMeterCode.trim().toUpperCase()}) và đồng hồ nước (${waterMeterCode.trim().toUpperCase()})!`);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Có lỗi xảy ra khi tạo phòng.");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-teal-700" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Thêm Phòng Mới • {building.name}
              </h3>
              <p className="text-[11px] text-slate-500">
                Khởi tạo phòng mới và bắt buộc gắn mã công tơ điện, đồng hồ nước
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
          <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs overflow-y-auto pr-1 flex-1">
          {/* Thông tin phòng cơ bản */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Mã phòng <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: 105, 204..."
                value={roomCode}
                onChange={(e) => handleRoomCodeChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Tầng số <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={floor}
                onChange={(e) => setFloor(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Diện tích (m²) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={10}
                value={areaSqm}
                onChange={(e) => setAreaSqm(parseFloat(e.target.value) || 20)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Giá thuê niêm yết (₫/tháng) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step={100000}
                min={0}
                value={referencePrice}
                onChange={(e) => setReferencePrice(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-semibold text-teal-800"
                required
              />
            </div>
          </div>

          {/* KHỐI CÔNG TƠ ĐIỆN VÀ NƯỚC (BẮT BUỘC) */}
          <div className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-200 space-y-3">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Thiết lập Công tơ Điện & Đồng hồ Nước (Bắt buộc)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Công tơ điện */}
              <div className="space-y-2 bg-white p-3 rounded-lg border border-amber-100">
                <label className="block font-semibold text-slate-800 text-[11px] flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>Mã / ID Công tơ điện <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  placeholder={`EM-${building.code}-${roomCode || "101"}`}
                  value={electricityMeterCode}
                  onChange={(e) => setElectricityMeterCode(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-xs uppercase"
                  required
                />
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">Chỉ số điện khởi tạo (kWh):</span>
                  <input
                    type="number"
                    min={0}
                    value={initialElectricityIndex}
                    onChange={(e) => setInitialElectricityIndex(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Đồng hồ nước */}
              <div className="space-y-2 bg-white p-3 rounded-lg border border-blue-100">
                <label className="block font-semibold text-slate-800 text-[11px] flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-600" />
                  <span>Mã / ID Đồng hồ nước <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  placeholder={`WM-${building.code}-${roomCode || "101"}`}
                  value={waterMeterCode}
                  onChange={(e) => setWaterMeterCode(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-xs uppercase"
                  required
                />
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">Chỉ số nước khởi tạo (m³):</span>
                  <input
                    type="number"
                    min={0}
                    value={initialWaterIndex}
                    onChange={(e) => setInitialWaterIndex(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Mô tả phòng (tùy chọn):</label>
            <input
              type="text"
              placeholder="VD: Cửa sổ hướng Đông, có ban công thoáng mát..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-[11px]">
            * Hệ thống sẽ tự động gán gói 6 trang thiết bị nội thất chuẩn StayHub (Điều hòa, Tủ lạnh, Bình nóng lạnh, Giường nệm, Tủ áo, Bàn ghế) cho phòng này.
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
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tạo Phòng & Gắn Công Tơ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * CREATE BUILDING MODAL COMPONENT
 */
const CreateBuildingModal: React.FC<{
  onClose: () => void;
  onSuccess: (newBuildingId?: string) => void;
}> = ({ onClose, onSuccess }) => {
  const { currentUser, currentRole } = useAuth();
  const allUsers = storageService.getUsers();
  const availableManagers = allUsers.filter(
    (u) => u.role === "MANAGER" || u.role === "ADMIN"
  );

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [managerId, setManagerId] = useState(
    currentUser?.role === "MANAGER" ? currentUser.id : availableManagers[0]?.id || ""
  );

  // Auto room generation options
  const [autoGenerateRooms, setAutoGenerateRooms] = useState(true);
  const [totalFloors, setTotalFloors] = useState<number>(3);
  const [roomsPerFloor, setRoomsPerFloor] = useState<number>(4);
  const [referencePrice, setReferencePrice] = useState<number>(5500000);
  const [areaSqm, setAreaSqm] = useState<number>(30);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-generate suggested code
  const handleNameChange = (val: string) => {
    setName(val);
    if (!code || code.startsWith("SH-")) {
      const acronym = val
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .trim()
        .split(/\s+/)
        .map((w) => w[0]?.toUpperCase())
        .join("");
      setCode(acronym ? `SH-${acronym}` : "SH-NEW");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!name.trim()) {
      setErrorMsg("Vui lòng nhập tên cơ sở tòa nhà");
      return;
    }
    if (!code.trim()) {
      setErrorMsg("Vui lòng nhập mã định danh cơ sở");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const selectedManager =
        allUsers.find((u) => u.id === managerId) || currentUser;

      const newBuilding = storageService.createBuilding(
        {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          address: address.trim() || "Chưa cập nhật địa chỉ",
          totalFloors: autoGenerateRooms ? totalFloors : 1,
          totalRooms: 0,
          managerId: selectedManager.id,
          managerName: selectedManager.fullName,
          description: `Tòa nhà căn hộ dịch vụ cao cấp ${name.trim()} - Quản lý bởi ${selectedManager.fullName}`,
          isActive: true,
        },
        currentUser
      );

      // Auto batch generate rooms if checked
      if (autoGenerateRooms && totalFloors > 0 && roomsPerFloor > 0) {
        storageService.batchGenerateRooms(
          {
            buildingId: newBuilding.id,
            totalFloors,
            roomsPerFloor,
            startFloor: 1,
            referencePrice,
            areaSqm,
          },
          currentUser
        );
      }

      onSuccess(newBuilding.id);
    } catch (err: any) {
      setErrorMsg(err.message || "Có lỗi xảy ra khi tạo cơ sở mới");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#0F766E]" />
            <h3 className="font-bold text-sm text-slate-900">
              Khởi Tạo Cơ Sở / Tòa Nhà Mới
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium shrink-0">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs overflow-y-auto pr-1 flex-1">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Tên cơ sở / Tòa nhà <span className="text-rose-500">*</span>:
            </label>
            <input
              type="text"
              placeholder="Ví dụ: StayHub Riverside - Bình Thạnh, StayHub Diamond - Q.2..."
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Mã định danh cơ sở <span className="text-rose-500">*</span>:
              </label>
              <input
                type="text"
                placeholder="Ví dụ: SH-RS, SH-BT"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white font-mono uppercase font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Quản lý phụ trách:
              </label>
              {currentRole === "MANAGER" ? (
                <div className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 font-semibold text-slate-800">
                  {currentUser?.fullName} (Chính bạn)
                </div>
              ) : (
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white font-semibold cursor-pointer"
                >
                  {availableManagers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.role === "ADMIN" ? "Admin" : "Quản lý"})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Địa chỉ tòa nhà:
            </label>
            <input
              type="text"
              placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            />
          </div>

          {/* Quick Rooms Generation Option */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoGenerateRooms}
                onChange={(e) => setAutoGenerateRooms(e.target.checked)}
                className="w-4 h-4 text-[#0F766E] rounded focus:ring-teal-500"
              />
              <span className="font-semibold text-slate-800">
                Tự động sinh sẵn danh sách phòng & tài sản chuẩn ban đầu
              </span>
            </label>

            {autoGenerateRooms && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Số tầng:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={totalFloors}
                      onChange={(e) => setTotalFloors(parseInt(e.target.value) || 1)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Số phòng mỗi tầng:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={roomsPerFloor}
                      onChange={(e) => setRoomsPerFloor(parseInt(e.target.value) || 1)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Giá thuê niêm yết (₫):
                    </label>
                    <input
                      type="number"
                      step={100000}
                      value={referencePrice}
                      onChange={(e) => setReferencePrice(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Diện tích phòng (m²):
                    </label>
                    <input
                      type="number"
                      min={15}
                      value={areaSqm}
                      onChange={(e) => setAreaSqm(parseInt(e.target.value) || 25)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-teal-800 bg-teal-50/70 p-2 rounded-lg border border-teal-200/60">
                  ✓ Sẽ tự động tạo ngay <strong>{totalFloors * roomsPerFloor} phòng</strong> kèm 6 thiết bị chuẩn mỗi phòng (Điều hòa, Tủ lạnh, Bình nóng lạnh, Giường nệm, Tủ áo, Bàn ghế).
                </div>
              </div>
            )}
          </div>

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
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Đang khởi tạo..." : "Xác nhận Tạo Cơ sở"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * SOFT DELETE BUILDING MODAL COMPONENT
 * Checks that ALL rooms are in status "Trống" before allowing soft delete.
 */
const SoftDeleteBuildingModal: React.FC<{
  building: Building;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ building, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check validation from storage service
  const validation = storageService.canDeleteBuilding(building.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!validation.canDelete) {
      setErrorMsg("Cơ sở chưa đủ điều kiện an toàn để xóa mềm.");
      return;
    }

    if (!confirmed) {
      setErrorMsg("Vui lòng tích xác nhận đồng ý xóa mềm cơ sở.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      storageService.softDeleteBuilding(
        building.id,
        currentUser,
        reason.trim() || "Cơ sở đã dọn trống và hoàn tất thủ tục lưu trữ"
      );
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Có lỗi xảy ra khi xóa cơ sở");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Xóa Mềm (Lưu Trữ) Cơ Sở Tòa Nhà
            </h3>
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
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs overflow-y-auto pr-1 flex-1">
          {/* Target Building Info */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <p className="text-slate-500 text-[11px]">Cơ sở thực hiện xóa:</p>
            <h4 className="font-bold text-slate-900 text-sm mt-0.5">
              {building.name} <span className="font-mono text-teal-800">({building.code})</span>
            </h4>
            <p className="text-slate-500 text-[11px] mt-0.5">{building.address}</p>
          </div>

          {/* Validation Check Card */}
          {validation.canDelete ? (
            /* PASSED: All rooms are "Trống" */
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Đủ điều kiện an toàn để Xóa Mềm</span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-800">
                Tất cả <strong>{validation.totalRooms} phòng</strong> của cơ sở này đều đang ở trạng thái{" "}
                <span className="font-semibold underline">Trống</span>. Không có hợp đồng thuê hay cư dân nào đang lưu trú.
              </p>
              <div className="text-[10px] bg-white/70 p-2 rounded-lg border border-emerald-200 text-slate-600">
                ℹ️ <strong>Nguyên tắc xóa mềm:</strong> Tòa nhà sẽ chuyển sang trạng thái Ngừng hoạt động (ẩn khỏi danh mục vận hành hàng ngày), nhưng toàn bộ dữ liệu lịch sử phòng, thiết bị và báo cáo vẫn được bảo toàn nguyên vẹn và có thể khôi phục bất cứ lúc nào.
              </div>
            </div>
          ) : (
            /* FAILED: Some rooms are NOT "Trống" */
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-rose-800">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                <span>Không Đủ Điều Kiện Xóa Cơ Sở</span>
              </div>
              <p className="text-[11px] leading-relaxed text-rose-800 font-medium">
                {validation.reason}
              </p>

              {validation.nonVacantRooms && validation.nonVacantRooms.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                    Danh sách phòng chưa ở trạng thái Trống ({validation.nonVacantRooms.length}):
                  </span>
                  <div className="max-h-32 overflow-y-auto space-y-1 bg-white p-2 rounded-lg border border-rose-200">
                    {validation.nonVacantRooms.map((rm) => (
                      <div
                        key={rm.id}
                        className="flex items-center justify-between text-[11px] py-1 px-1.5 border-b border-slate-100 last:border-0"
                      >
                        <span className="font-bold text-slate-900">Phòng {rm.roomCode}</span>
                        <div className="flex items-center gap-2">
                          {rm.currentResidentName && (
                            <span className="text-slate-500 text-[10px]">
                              Khách: {rm.currentResidentName}
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              rm.status === "Đang thuê"
                                ? "bg-teal-100 text-teal-800"
                                : rm.status === "Đã giữ chỗ"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {rm.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-600 italic">
                👉 Vui lòng thanh lý trả phòng và cập nhật trạng thái các phòng này về "Trống" trước khi thực hiện xóa cơ sở.
              </p>
            </div>
          )}

          {/* Reason Input */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Lý do xóa mềm cơ sở:
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Hết hạn thuê mặt bằng, tạm dừng kinh doanh để sửa chữa toàn diện..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={!validation.canDelete}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white disabled:bg-slate-100 disabled:text-slate-400"
            />
          </div>

          {/* Confirmation Checkbox */}
          {validation.canDelete && (
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 mt-0.5"
                />
                <span className="text-slate-800 font-medium leading-tight">
                  Tôi đã kiểm tra kỹ và xác nhận muốn chuyển cơ sở <strong>{building.name}</strong> sang trạng thái lưu trữ (xóa mềm).
                </span>
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={!validation.canDelete || !confirmed || isSubmitting}
              className={`px-4 py-2 rounded-lg font-semibold shadow-xs flex items-center gap-1.5 transition-colors ${
                validation.canDelete && confirmed && !isSubmitting
                  ? "bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Đang xử lý..." : "Xác nhận Xóa Mềm"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
