import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useBuilding } from "../context/BuildingContext";
import { storageService } from "../services/storage";
import { formatDateVN, formatDateTimeVN } from "../lib/utils";
import { Asset, AssetCondition } from "../types";
import {
  Boxes,
  Search,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  History,
  DoorOpen,
  ChevronDown,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  Layers,
  LayoutGrid,
  Info,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Building2,
} from "lucide-react";

const SUGGESTED_DEVICE_TYPES = [
  "Điều hòa Inverter",
  "Tủ lạnh 180L",
  "Bình nóng lạnh 30L",
  "Giường nệm cao su 1m6x2m",
  "Tủ quần áo 2 cánh",
  "Bàn ghế làm việc",
  "Tivi Smart 55 inch",
  "Máy giặt cửa ngang",
  "Bếp từ đôi âm",
  "Lò vi sóng 20L",
  "Máy lọc nước RO",
  "Quạt trần điều khiển",
  "Khóa cửa vân tay thông minh",
  "Két sắt mini điện tử",
];

export const AssetsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { selectedBuildingId, buildings } = useBuilding();

  const currentBuilding = buildings.find((b) => b.id === selectedBuildingId);
  const apartments = storageService.getApartments(selectedBuildingId);

  const [conditionFilter, setConditionFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"BY_DEVICE" | "BY_ROOM" | "FLAT">("BY_DEVICE");

  // Track expanded groups (accordions)
  const [expandedDevices, setExpandedDevices] = useState<Record<string, boolean>>({});
  const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>({});

  // Modals
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [detailAsset, setDetailAsset] = useState<Asset | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newCondition, setNewCondition] = useState<AssetCondition>("Tốt");
  const [conditionNotes, setConditionNotes] = useState<string>("");

  // Add Asset Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<"BATCH" | "SINGLE">("BATCH");
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>("Điều hòa Inverter");
  const [customDeviceName, setCustomDeviceName] = useState<string>("");
  const [initialCondition, setInitialCondition] = useState<AssetCondition>("Tốt");
  const [installedDate, setInstalledDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [assetNotes, setAssetNotes] = useState<string>("");

  // Room selections for batch
  const [targetRoomIds, setTargetRoomIds] = useState<string[]>([]);

  // Room selection for single
  const [singleRoomId, setSingleRoomId] = useState<string>("");
  const [singleSerial, setSingleSerial] = useState<string>("");
  const [singleCode, setSingleCode] = useState<string>("");

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const assets = storageService.getAssets({ buildingId: selectedBuildingId });

  const filteredAssets = assets.filter((ast) => {
    if (conditionFilter !== "ALL" && ast.condition !== conditionFilter) return false;
    if (
      searchQuery &&
      !ast.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !ast.apartmentCode.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !ast.code.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !ast.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Helper to extract device base type
  const getDeviceTypeName = (ast: Asset): string => {
    if (ast.assetTypeName) return ast.assetTypeName;
    const parts = ast.name.split(" - P.");
    return parts[0] || ast.name;
  };

  // Group assets by Device Type
  const deviceGroups = React.useMemo(() => {
    const groups: Record<
      string,
      {
        deviceType: string;
        items: Asset[];
        total: number;
        good: number;
        issues: number;
        latestCheck: string;
      }
    > = {};

    filteredAssets.forEach((ast) => {
      const type = getDeviceTypeName(ast);
      if (!groups[type]) {
        groups[type] = {
          deviceType: type,
          items: [],
          total: 0,
          good: 0,
          issues: 0,
          latestCheck: ast.lastCheckedAt,
        };
      }
      groups[type].items.push(ast);
      groups[type].total += 1;
      if (ast.condition === "Tốt") {
        groups[type].good += 1;
      } else {
        groups[type].issues += 1;
      }
      if (new Date(ast.lastCheckedAt) > new Date(groups[type].latestCheck)) {
        groups[type].latestCheck = ast.lastCheckedAt;
      }
    });

    return Object.values(groups).sort((a, b) => a.deviceType.localeCompare(b.deviceType));
  }, [filteredAssets, refreshTrigger]);

  // Group assets by Room / Apartment
  const roomGroups = React.useMemo(() => {
    const groups: Record<
      string,
      {
        roomCode: string;
        apartmentId: string;
        items: Asset[];
        total: number;
        good: number;
        issues: number;
      }
    > = {};

    filteredAssets.forEach((ast) => {
      const room = ast.apartmentCode;
      if (!groups[room]) {
        groups[room] = {
          roomCode: room,
          apartmentId: ast.apartmentId,
          items: [],
          total: 0,
          good: 0,
          issues: 0,
        };
      }
      groups[room].items.push(ast);
      groups[room].total += 1;
      if (ast.condition === "Tốt") {
        groups[room].good += 1;
      } else {
        groups[room].issues += 1;
      }
    });

    return Object.values(groups).sort((a, b) => a.roomCode.localeCompare(b.roomCode, undefined, { numeric: true }));
  }, [filteredAssets, refreshTrigger]);

  const toggleDeviceGroup = (deviceType: string) => {
    setExpandedDevices((prev) => ({
      ...prev,
      [deviceType]: !prev[deviceType],
    }));
  };

  const toggleRoomGroup = (roomCode: string) => {
    setExpandedRooms((prev) => ({
      ...prev,
      [roomCode]: !prev[roomCode],
    }));
  };

  const expandAllDevices = () => {
    const all: Record<string, boolean> = {};
    deviceGroups.forEach((g) => {
      all[g.deviceType] = true;
    });
    setExpandedDevices(all);
  };

  const collapseAllDevices = () => {
    setExpandedDevices({});
  };

  const getConditionBadge = (condition: AssetCondition) => {
    switch (condition) {
      case "Tốt":
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Tốt
          </span>
        );
      case "Hư hỏng":
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            Hư hỏng
          </span>
        );
      case "Đang sửa":
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            Đang sửa
          </span>
        );
      case "Ngừng sử dụng":
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            Ngừng dùng
          </span>
        );
    }
  };

  const handleOpenUpdate = (ast: Asset, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedAsset(ast);
    setNewCondition(ast.condition);
    setConditionNotes("");
    setShowUpdateModal(true);
  };

  const handleOpenDetail = (ast: Asset, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDetailAsset(ast);
  };

  const handleSaveCondition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !currentUser) return;

    try {
      storageService.updateAssetCondition(
        selectedAsset.id,
        newCondition,
        conditionNotes,
        currentUser
      );
      setShowUpdateModal(false);
      setRefreshTrigger((prev) => prev + 1);
      setSelectedAsset(storageService.getAssetById(selectedAsset.id) || null);
      if (detailAsset?.id === selectedAsset.id) {
        setDetailAsset(storageService.getAssetById(selectedAsset.id) || null);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Open Add Modal with optional pre-filled device type
  const handleOpenAddModal = (presetDeviceType?: string) => {
    if (presetDeviceType) {
      setSelectedDeviceType(presetDeviceType);
      setCustomDeviceName("");
    } else {
      setSelectedDeviceType("Điều hòa Inverter");
      setCustomDeviceName("");
    }
    setInitialCondition("Tốt");
    setInstalledDate(new Date().toISOString().split("T")[0]);
    setAssetNotes("");
    setTargetRoomIds([]);
    setSingleRoomId(apartments[0]?.id || "");
    setSingleSerial("");
    setSingleCode("");
    setShowAddModal(true);
  };

  // Select/Unselect all rooms for batch
  const handleSelectAllRooms = () => {
    setTargetRoomIds(apartments.map((a) => a.id));
  };

  const handleClearAllRooms = () => {
    setTargetRoomIds([]);
  };

  // Select only rooms that do NOT yet have this device
  const handleSelectRoomsWithoutDevice = () => {
    const finalDeviceName = customDeviceName.trim() || selectedDeviceType;
    const existingRoomCodes = new Set(
      assets
        .filter((a) => getDeviceTypeName(a).toLowerCase() === finalDeviceName.toLowerCase())
        .map((a) => a.apartmentCode)
    );
    const unequipped = apartments
      .filter((apt) => !existingRoomCodes.has(apt.roomCode))
      .map((apt) => apt.id);
    setTargetRoomIds(unequipped);
  };

  const handleToggleRoomSelection = (aptId: string) => {
    setTargetRoomIds((prev) =>
      prev.includes(aptId) ? prev.filter((id) => id !== aptId) : [...prev, aptId]
    );
  };

  // Submit adding asset
  const handleSaveAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const finalDeviceName = customDeviceName.trim() || selectedDeviceType;
    if (!finalDeviceName) {
      alert("Vui lòng nhập hoặc chọn tên thiết bị");
      return;
    }

    try {
      if (addMode === "BATCH") {
        if (targetRoomIds.length === 0) {
          alert("Vui lòng chọn ít nhất một phòng cần trang bị thiết bị");
          return;
        }

        storageService.batchAddAssets(
          {
            apartmentIds: targetRoomIds,
            assetTypeName: finalDeviceName,
            condition: initialCondition,
            installedDate,
            notes: assetNotes,
          },
          currentUser
        );
      } else {
        // Single mode
        const apt = apartments.find((a) => a.id === singleRoomId);
        if (!apt) {
          alert("Vui lòng chọn phòng");
          return;
        }

        const bldCode = currentBuilding?.code || "BLD";
        const codePrefix =
          finalDeviceName
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9]/g, "")
            .substring(0, 6)
            .toUpperCase() || "DEV";

        const generatedCode = singleCode.trim() || `${bldCode}-${apt.roomCode}-${codePrefix}`;
        const generatedSerial =
          singleSerial.trim() || `SN-${apt.roomCode}-${Math.floor(1000 + Math.random() * 9000)}`;

        storageService.createAsset(
          {
            apartmentId: apt.id,
            apartmentCode: apt.roomCode,
            buildingId: apt.buildingId,
            assetTypeId: `type-${codePrefix.toLowerCase()}`,
            assetTypeName: finalDeviceName,
            name: `${finalDeviceName} - P.${apt.roomCode}`,
            code: generatedCode,
            serialNumber: generatedSerial,
            condition: initialCondition,
            installedDate,
            lastCheckedAt: new Date().toISOString(),
            lastUpdatedBy: currentUser.fullName,
            notes: assetNotes || "Trang bị mới vào phòng",
          },
          currentUser
        );
      }

      setShowAddModal(false);
      setRefreshTrigger((prev) => prev + 1);

      // Automatically expand the newly affected device type
      setExpandedDevices((prev) => ({
        ...prev,
        [finalDeviceName]: true,
      }));
    } catch (err: any) {
      alert(err.message || "Không thể thêm thiết bị");
    }
  };

  const handleDeleteAsset = (ast: Asset, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser) return;

    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa thiết bị "${ast.name}" khỏi phòng P.${ast.apartmentCode}?`
      )
    ) {
      storageService.deleteAsset(ast.id, currentUser);
      if (detailAsset?.id === ast.id) setDetailAsset(null);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
            Quản lý Thiết bị & Tài sản Căn hộ
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Cơ sở: <strong className="text-slate-800">{currentBuilding?.name}</strong> • Nhấp vào từng thiết bị để mở rộng danh sách chi tiết các phòng
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Add Device Button */}
          <button
            onClick={() => handleOpenAddModal()}
            className="bg-[#0F766E] hover:bg-[#115E59] text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm thiết bị vào các phòng</span>
          </button>

          {/* Top Summary Stats */}
          <div className="flex items-center gap-3 text-xs bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
            <span>
              Tổng thiết bị: <strong className="text-slate-900">{assets.length}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-semibold">
              Tốt: {assets.filter((a) => a.condition === "Tốt").length}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-rose-700 font-semibold">
              Sự cố: {assets.filter((a) => a.condition !== "Tốt").length}
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & View Mode */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo tên thiết bị, phòng, mã tài sản, số serial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
            />
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs self-start md:self-auto">
            <button
              onClick={() => setViewMode("BY_DEVICE")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === "BY_DEVICE"
                  ? "bg-white text-[#0F766E] shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Theo Loại Thiết bị</span>
            </button>
            <button
              onClick={() => setViewMode("BY_ROOM")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === "BY_ROOM"
                  ? "bg-white text-[#0F766E] shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <DoorOpen className="w-3.5 h-3.5" />
              <span>Theo Phòng</span>
            </button>
            <button
              onClick={() => setViewMode("FLAT")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === "FLAT"
                  ? "bg-white text-[#0F766E] shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Bảng phẳng</span>
            </button>
          </div>
        </div>

        {/* Sub-bar: Condition filter & Collapse/Expand all */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-medium">Tình trạng:</span>
            {["ALL", "Tốt", "Hư hỏng", "Đang sửa", "Ngừng sử dụng"].map((cond) => (
              <button
                key={cond}
                onClick={() => setConditionFilter(cond)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  conditionFilter === cond
                    ? "bg-[#0F766E] text-white font-semibold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cond === "ALL" ? "Tất cả" : cond}
              </button>
            ))}
          </div>

          {viewMode === "BY_DEVICE" && (
            <div className="flex items-center gap-2">
              <button
                onClick={expandAllDevices}
                className="text-xs text-[#0F766E] hover:underline font-medium cursor-pointer"
              >
                Mở rộng tất cả
              </button>
              <span className="text-slate-300">•</span>
              <button
                onClick={collapseAllDevices}
                className="text-xs text-slate-500 hover:underline font-medium cursor-pointer"
              >
                Thu gọn tất cả
              </button>
            </div>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: BY DEVICE (Default - As Requested by User) */}
      {viewMode === "BY_DEVICE" && (
        <div className="space-y-3">
          {deviceGroups.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
              <Boxes className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p>Chưa có thiết bị nào phù hợp với bộ lọc tìm kiếm.</p>
              <button
                onClick={() => handleOpenAddModal()}
                className="mt-3 text-xs text-[#0F766E] font-semibold hover:underline"
              >
                + Bấm vào đây để thêm thiết bị mới vào các phòng
              </button>
            </div>
          ) : (
            deviceGroups.map((group) => {
              const isExpanded = !!expandedDevices[group.deviceType];

              return (
                <div
                  key={group.deviceType}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all"
                >
                  {/* Equipment Header Row (Clickable to reveal details) */}
                  <div
                    onClick={() => toggleDeviceGroup(group.deviceType)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/70 text-[#0F766E] flex items-center justify-center shrink-0">
                        <Boxes className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">
                            {group.deviceType}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                            {group.total} chiếc
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Trang bị tại {group.items.length} phòng trong cơ sở • Kiểm tra gần nhất:{" "}
                          <span className="text-slate-700">{formatDateVN(group.latestCheck)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Health Status Badges */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {group.good} Tốt
                        </span>
                        {group.issues > 0 && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            {group.issues} Sự cố
                          </span>
                        )}
                      </div>

                      {/* Quick Add To Other Rooms Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAddModal(group.deviceType);
                        }}
                        title={`Thêm ${group.deviceType} vào các phòng khác`}
                        className="flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-white hover:bg-teal-50 px-2.5 py-1.5 rounded-lg border border-teal-200 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#0F766E]" />
                        <span>Thêm vào phòng khác</span>
                      </button>

                      {/* Expand Button Indicator */}
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F766E] bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200/60 hover:bg-teal-100 transition-colors">
                        <span>{isExpanded ? "Ẩn bớt" : "Xem chi tiết"}</span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-[#0F766E]" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-[#0F766E]" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail Table (Only shown when clicked) */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 bg-slate-50/50 p-4 animate-in fade-in">
                      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold">
                              <th className="py-2.5 px-3">Phòng</th>
                              <th className="py-2.5 px-3">Mã tài sản</th>
                              <th className="py-2.5 px-3">Số Serial</th>
                              <th className="py-2.5 px-3">Tình trạng</th>
                              <th className="py-2.5 px-3">Kiểm tra lần cuối</th>
                              <th className="py-2.5 px-3">Người cập nhật</th>
                              <th className="py-2.5 px-3 text-right">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {group.items.map((ast) => (
                              <tr
                                key={ast.id}
                                className="hover:bg-teal-50/30 transition-colors"
                              >
                                <td className="py-2.5 px-3">
                                  <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                    P.{ast.apartmentCode}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                                  {ast.code}
                                </td>
                                <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                                  {ast.serialNumber}
                                </td>
                                <td className="py-2.5 px-3">
                                  {getConditionBadge(ast.condition)}
                                </td>
                                <td className="py-2.5 px-3 text-slate-600">
                                  {formatDateVN(ast.lastCheckedAt)}
                                </td>
                                <td className="py-2.5 px-3 text-slate-700">
                                  {ast.lastUpdatedBy}
                                </td>
                                <td className="py-2.5 px-3 text-right space-x-1.5">
                                  <button
                                    onClick={(e) => handleOpenDetail(ast, e)}
                                    className="text-slate-600 hover:text-slate-900 font-medium px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[11px] transition-colors cursor-pointer"
                                  >
                                    Chi tiết
                                  </button>
                                  <button
                                    onClick={(e) => handleOpenUpdate(ast, e)}
                                    className="text-[#0F766E] hover:underline font-semibold px-2 py-1 bg-teal-50 rounded border border-teal-200 text-[11px] hover:bg-teal-100 transition-colors cursor-pointer"
                                  >
                                    Cập nhật
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteAsset(ast, e)}
                                    title="Xóa thiết bị khỏi phòng"
                                    className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded transition-colors cursor-pointer inline-block align-middle"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW MODE 2: BY ROOM */}
      {viewMode === "BY_ROOM" && (
        <div className="space-y-3">
          {roomGroups.map((group) => {
            const isExpanded = !!expandedRooms[group.roomCode];

            return (
              <div
                key={group.roomCode}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
              >
                <div
                  onClick={() => toggleRoomGroup(group.roomCode)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/70 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                      P.{group.roomCode}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Căn hộ P.{group.roomCode}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {group.total} thiết bị đã trang bị • {group.good} hoạt động tốt
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddMode("SINGLE");
                        setSingleRoomId(group.apartmentId);
                        setShowAddModal(true);
                      }}
                      className="text-[11px] font-semibold text-teal-800 bg-white hover:bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-[#0F766E]" />
                      <span>Thêm thiết bị vào phòng này</span>
                    </button>

                    <span className="text-xs font-semibold text-[#0F766E] bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 flex items-center gap-1">
                      <span>{isExpanded ? "Ẩn chi tiết" : "Xem thiết bị phòng"}</span>
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50/50 p-4">
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold">
                            <th className="py-2.5 px-3">Tên thiết bị</th>
                            <th className="py-2.5 px-3">Mã tài sản</th>
                            <th className="py-2.5 px-3">Số Serial</th>
                            <th className="py-2.5 px-3">Tình trạng</th>
                            <th className="py-2.5 px-3">Kiểm tra gần nhất</th>
                            <th className="py-2.5 px-3 text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {group.items.map((ast) => (
                            <tr key={ast.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-2.5 px-3 font-semibold text-slate-900">{ast.name}</td>
                              <td className="py-2.5 px-3 font-mono text-slate-700">{ast.code}</td>
                              <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{ast.serialNumber}</td>
                              <td className="py-2.5 px-3">{getConditionBadge(ast.condition)}</td>
                              <td className="py-2.5 px-3 text-slate-600">{formatDateVN(ast.lastCheckedAt)}</td>
                              <td className="py-2.5 px-3 text-right space-x-1.5">
                                <button
                                  onClick={(e) => handleOpenDetail(ast, e)}
                                  className="text-slate-600 hover:text-slate-900 font-medium px-2 py-1 bg-slate-100 rounded text-[11px] cursor-pointer"
                                >
                                  Chi tiết
                                </button>
                                <button
                                  onClick={(e) => handleOpenUpdate(ast, e)}
                                  className="text-[#0F766E] hover:underline font-semibold px-2 py-1 bg-teal-50 rounded border border-teal-200 text-[11px] cursor-pointer"
                                >
                                  Cập nhật
                                </button>
                                <button
                                  onClick={(e) => handleDeleteAsset(ast, e)}
                                  title="Xóa thiết bị"
                                  className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded transition-colors cursor-pointer inline-block align-middle"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 3: FLAT TABLE */}
      {viewMode === "FLAT" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                  <th className="py-3 px-4">Tên tài sản</th>
                  <th className="py-3 px-4">Phòng</th>
                  <th className="py-3 px-4">Mã tài sản</th>
                  <th className="py-3 px-4">Số Serial</th>
                  <th className="py-3 px-4">Tình trạng</th>
                  <th className="py-3 px-4">Kiểm tra gần nhất</th>
                  <th className="py-3 px-4">Người cập nhật</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssets.map((ast) => (
                  <tr key={ast.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{ast.name}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        P.{ast.apartmentCode}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">{ast.code}</td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{ast.serialNumber}</td>
                    <td className="py-3 px-4">{getConditionBadge(ast.condition)}</td>
                    <td className="py-3 px-4 text-slate-600">{formatDateVN(ast.lastCheckedAt)}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{ast.lastUpdatedBy}</td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={(e) => handleOpenDetail(ast, e)}
                        className="text-slate-600 hover:text-slate-900 font-medium px-2 py-1 bg-slate-100 rounded text-[11px] cursor-pointer"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={(e) => handleOpenUpdate(ast, e)}
                        className="text-[#0F766E] hover:underline font-semibold px-2 py-1 bg-teal-50 rounded border border-teal-200 text-[11px] cursor-pointer"
                      >
                        Cập nhật
                      </button>
                      <button
                        onClick={(e) => handleDeleteAsset(ast, e)}
                        title="Xóa thiết bị"
                        className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded transition-colors cursor-pointer inline-block align-middle"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: THÊM THIẾT BỊ VÀO PHÒNG (BATCH / SINGLE) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-[#0F766E]" />
                <h3 className="font-bold text-sm text-slate-900">
                  Thêm Thiết bị vào Phòng - {currentBuilding?.name}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAddAsset} className="mt-4 space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              {/* Mode switch */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setAddMode("BATCH")}
                  className={`flex-1 py-1.5 rounded-md font-semibold text-center transition-colors cursor-pointer ${
                    addMode === "BATCH"
                      ? "bg-white text-[#0F766E] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Trang bị hàng loạt vào nhiều phòng
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode("SINGLE")}
                  className={`flex-1 py-1.5 rounded-md font-semibold text-center transition-colors cursor-pointer ${
                    addMode === "SINGLE"
                      ? "bg-white text-[#0F766E] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Thêm vào 1 phòng cụ thể
                </button>
              </div>

              {/* Device Selection */}
              <div className="space-y-2">
                <label className="block text-slate-700 font-semibold">Chọn loại thiết bị:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-50 border border-slate-200 rounded-xl">
                  {SUGGESTED_DEVICE_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setSelectedDeviceType(type);
                        setCustomDeviceName("");
                      }}
                      className={`p-2 rounded-lg text-left text-[11px] font-medium transition-colors border cursor-pointer ${
                        selectedDeviceType === type && !customDeviceName
                          ? "bg-teal-50 border-teal-300 text-[#0F766E] font-bold"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="pt-1">
                  <label className="block text-slate-600 font-medium mb-1">
                    Hoặc nhập tên thiết bị khác:
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Máy sấy tóc Panasonic, Nồi cơm điện, Quạt hơi nước..."
                    value={customDeviceName}
                    onChange={(e) => setCustomDeviceName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>
              </div>

              {/* BATCH MODE: Select Rooms */}
              {addMode === "BATCH" ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-700 font-semibold">
                      Chọn các phòng cần trang bị (Đã chọn:{" "}
                      <strong className="text-[#0F766E]">{targetRoomIds.length}</strong> phòng):
                    </label>
                    <div className="flex items-center gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={handleSelectAllRooms}
                        className="text-[#0F766E] hover:underline font-semibold cursor-pointer"
                      >
                        Tất cả
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={handleSelectRoomsWithoutDevice}
                        className="text-teal-700 hover:underline font-medium cursor-pointer"
                      >
                        Chưa có thiết bị này
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={handleClearAllRooms}
                        className="text-slate-500 hover:underline cursor-pointer"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    {apartments.map((apt) => {
                      const isSelected = targetRoomIds.includes(apt.id);
                      return (
                        <div
                          key={apt.id}
                          onClick={() => handleToggleRoomSelection(apt.id)}
                          className={`p-2 rounded-lg border text-center cursor-pointer transition-colors select-none ${
                            isSelected
                              ? "bg-teal-600 text-white font-bold border-teal-700 shadow-xs"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <span className="text-xs">P.{apt.roomCode}</span>
                          <span
                            className={`block text-[9px] ${
                              isSelected ? "text-teal-100" : "text-slate-400"
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* SINGLE MODE: Select 1 Room */
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Phòng trang bị:
                    </label>
                    <select
                      value={singleRoomId}
                      onChange={(e) => setSingleRoomId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white font-semibold"
                    >
                      {apartments.map((apt) => (
                        <option key={apt.id} value={apt.id}>
                          Phòng {apt.roomCode} ({apt.status})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Mã tài sản (Tùy chọn):
                    </label>
                    <input
                      type="text"
                      placeholder="Để trống để tự tạo"
                      value={singleCode}
                      onChange={(e) => setSingleCode(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Số Serial (Tùy chọn):
                    </label>
                    <input
                      type="text"
                      placeholder="Để trống để tự tạo"
                      value={singleSerial}
                      onChange={(e) => setSingleSerial(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Condition & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Tình trạng bàn giao ban đầu:
                  </label>
                  <select
                    value={initialCondition}
                    onChange={(e) => setInitialCondition(e.target.value as AssetCondition)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white font-semibold"
                  >
                    <option value="Tốt">Tốt (Mới 100% / Hoạt động hoàn hảo)</option>
                    <option value="Đang sửa">Đang sửa (Cần kiểm tra kỹ thuật)</option>
                    <option value="Hư hỏng">Hư hỏng (Chờ bảo dưỡng)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Ngày trang bị / lắp đặt:
                  </label>
                  <input
                    type="date"
                    value={installedDate}
                    onChange={(e) => setInstalledDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Ghi chú lắp đặt / bàn giao:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Lô hàng mua mới tháng 09/2026, bảo hành chính hãng 24 tháng..."
                  value={assetNotes}
                  onChange={(e) => setAssetNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                />
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
                <span className="text-[11px] text-slate-500">
                  {addMode === "BATCH" ? (
                    <>
                      Dự kiến tạo:{" "}
                      <strong className="text-teal-800">
                        {targetRoomIds.length} thiết bị{" "}
                        {customDeviceName || selectedDeviceType}
                      </strong>
                    </>
                  ) : (
                    <>
                      Tạo 1 thiết bị cho{" "}
                      <strong className="text-teal-800">
                        P.{apartments.find((a) => a.id === singleRoomId)?.roomCode}
                      </strong>
                    </>
                  )}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Lưu và Trang bị vào phòng</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL (Opens when clicking 'Chi tiết') */}
      {detailAsset && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-[#0F766E]" />
                <h3 className="font-bold text-sm text-slate-900">Chi tiết Hồ sơ Thiết bị</h3>
              </div>
              <button
                onClick={() => setDetailAsset(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-base text-slate-900">{detailAsset.name}</h4>
                  <p className="text-slate-500 text-[11px]">
                    Căn hộ: <strong className="text-teal-800">Phòng {detailAsset.apartmentCode}</strong> • Tòa nhà:{" "}
                    <strong>{currentBuilding?.name}</strong>
                  </p>
                </div>
                <div>{getConditionBadge(detailAsset.condition)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/80 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Mã tài sản:</span>
                  <span className="font-mono font-bold text-slate-800">{detailAsset.code}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Số Serial:</span>
                  <span className="font-mono text-slate-800">{detailAsset.serialNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Ngày lắp đặt ban đầu:</span>
                  <span className="text-slate-800">{formatDateVN(detailAsset.installedDate)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Kiểm tra gần nhất:</span>
                  <span className="text-slate-800">{formatDateVN(detailAsset.lastCheckedAt)}</span>
                </div>
              </div>

              {detailAsset.notes && (
                <div className="pt-2 border-t border-slate-200/80 text-[11px]">
                  <span className="text-slate-500 block">Ghi chú hiện trạng:</span>
                  <p className="text-slate-700 italic mt-0.5">{detailAsset.notes}</p>
                </div>
              )}
            </div>

            {/* History Logs */}
            <div>
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-500" />
                <span>Nhật ký bảo trì & thay đổi tình trạng</span>
              </h4>
              {detailAsset.history && detailAsset.history.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {detailAsset.history.map((h) => (
                    <div
                      key={h.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] space-y-1"
                    >
                      <div className="flex justify-between items-center font-semibold">
                        <span className="text-[#0F766E]">
                          {h.previousCondition} → {h.newCondition}
                        </span>
                        <span className="text-slate-400 font-normal">{formatDateTimeVN(h.updatedAt)}</span>
                      </div>
                      <p className="text-slate-700">{h.notes}</p>
                      <p className="text-[10px] text-slate-400">Người thực hiện: {h.updatedBy}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-lg">
                  Chưa có lịch sử bảo dưỡng hoặc hư hỏng ghi nhận.
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Người cập nhật: {detailAsset.lastUpdatedBy}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setDetailAsset(null)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    handleOpenUpdate(detailAsset);
                  }}
                  className="px-3.5 py-1.5 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Cập nhật tình trạng</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE CONDITION MODAL */}
      {showUpdateModal && selectedAsset && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#0F766E]" />
                <h3 className="font-bold text-sm text-slate-900">
                  Cập nhật Tình trạng Tài sản
                </h3>
              </div>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCondition} className="mt-4 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <p className="text-slate-500">
                  Thiết bị: <strong className="text-slate-900">{selectedAsset.name}</strong>
                </p>
                <p className="text-slate-500">
                  Thuộc phòng: <strong className="text-teal-800">P.{selectedAsset.apartmentCode}</strong>
                </p>
                <p className="text-slate-500">
                  Mã tài sản: <span className="font-mono text-slate-700">{selectedAsset.code}</span>
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Tình trạng mới:</label>
                <select
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value as AssetCondition)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white font-semibold cursor-pointer"
                >
                  <option value="Tốt">Tốt (Hoạt động bình thường)</option>
                  <option value="Hư hỏng">Hư hỏng (Cần bảo dưỡng/sửa chữa)</option>
                  <option value="Đang sửa">Đang sửa (Kỹ thuật đang khắc phục)</option>
                  <option value="Ngừng sử dụng">Ngừng sử dụng (Thanh lý/loại bỏ)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Ghi chú nguyên nhân / hiện trạng:
                </label>
                <textarea
                  rows={3}
                  value={conditionNotes}
                  onChange={(e) => setConditionNotes(e.target.value)}
                  placeholder="Ghi nhận chi tiết tình trạng thực tế..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
