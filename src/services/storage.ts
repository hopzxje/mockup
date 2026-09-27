import {
  Building,
  Apartment,
  Asset,
  AssetType,
  User,
  Resident,
  RentalContract,
  Fee,
  UtilityReading,
  Invoice,
  InvoiceItem,
  Payment,
  MaintenanceRequest,
  VisitorRegistration,
  TemporaryResidenceStatus,
  InAppNotification,
  AuditLog,
  SePayTransaction,
  ZaloDeliveryRecord,
  SystemSettings,
  RolePermissionMatrixItem,
  UserRole,
  ContractStatus,
  ApartmentStatus,
  AssetCondition,
} from "../types";

import {
  initialBuildings,
  initialApartments,
  initialAssets,
  initialAssetTypes,
  initialUsers,
  initialResidents,
  initialContracts,
  initialFees,
  initialUtilityReadings,
  initialInvoices,
  initialMaintenanceRequests,
  initialVisitors,
  initialNotifications,
  initialAuditLogs,
  initialSePayTransactions,
  initialZaloDeliveryRecords,
} from "./mockData";

const STORAGE_KEY_PREFIX = "stayhub_v1_";

export const initialSystemSettings: SystemSettings = {
  brandName: "StayHub",
  slogan: "Quản lý Không gian sống & Căn hộ Hiện đại",
  companyName: "Hệ thống Căn hộ Dịch vụ StayHub Việt Nam",
  hotline: "1900 8899",
  supportEmail: "hotro@stayhub.vn",
  address: "Tòa nhà StayHub Innovation, Quận 1, TP. Hồ Chí Minh",
  currency: "VND",
  timezone: "Asia/Ho_Chi_Minh",
  sepayApiKey: "SEPAY_LIVE_API_KEY_STAYHUB_9988",
  sepayAccountNumber: "0901234567",
  sepayBankBrand: "MBBank",
  sepayWebhookSecret: "whsec_live_stayhub_sec2026",
  sepayAutoReconcile: true,
  zaloOaId: "284910284729104",
  zaloAppId: "zalo_app_stayhub_prod",
  zaloSecretKey: "zalo_sec_839218204928104",
  zaloAutoNotifyInvoice: true,
  zaloAutoNotifyMaintenance: true,
  sessionTimeoutMinutes: 60,
  maxLoginAttempts: 5,
  auditLogRetentionDays: 365,
  maintenanceMode: false,
};

export const initialRolePermissionsMatrix: RolePermissionMatrixItem[] = [
  {
    id: "perm-1",
    moduleGroup: "Tài khoản & Phân quyền",
    name: "Quản lý tài khoản người dùng",
    description: "Tạo mới, chỉnh sửa, xóa, khóa / mở khóa tài khoản 4 vai trò",
    admin: true,
    manager: false,
    staff: false,
    resident: false,
  },
  {
    id: "perm-2",
    moduleGroup: "Tài khoản & Phân quyền",
    name: "Đặt lại mật khẩu người dùng",
    description: "Cấp lại mật khẩu truy cập và gửi thông tin xác nhận cho tài khoản",
    admin: true,
    manager: false,
    staff: false,
    resident: false,
  },
  {
    id: "perm-3",
    moduleGroup: "Tài khoản & Phân quyền",
    name: "Phân quyền & Phân bổ cơ sở",
    description: "Gán vai trò hệ thống và phân bổ cơ sở quản lý cho nhân sự",
    admin: true,
    manager: false,
    staff: false,
    resident: false,
  },
  {
    id: "perm-4",
    moduleGroup: "Cấu hình & Giám sát",
    name: "Giám sát hệ thống & Nhật ký Audit",
    description: "Kiểm tra toàn bộ nhật ký thao tác, giám sát tài nguyên và an ninh hệ thống",
    admin: true,
    manager: true,
    staff: false,
    resident: false,
  },
  {
    id: "perm-5",
    moduleGroup: "Cấu hình & Giám sát",
    name: "Cấu hình cổng thanh toán SePay",
    description: "Thiết lập API key, Webhook endpoint và tự động đối soát ngân hàng",
    admin: true,
    manager: false,
    staff: false,
    resident: false,
  },
  {
    id: "perm-6",
    moduleGroup: "Cấu hình & Giám sát",
    name: "Cấu hình Zalo ZNS Gateway",
    description: "Cài đặt tham số kết nối Zalo OA, Secret Key và quản lý mẫu tin",
    admin: true,
    manager: false,
    staff: false,
    resident: false,
  },
  {
    id: "perm-7",
    moduleGroup: "Cấu hình & Giám sát",
    name: "Sao lưu & Khôi phục dữ liệu",
    description: "Xuất dữ liệu dự phòng JSON, phục hồi từ bản sao lưu và quản lý database",
    admin: true,
    manager: false,
    staff: false,
    resident: false,
  },
  {
    id: "perm-8",
    moduleGroup: "Vận hành Cơ sở & Cư dân",
    name: "Quản lý Cơ sở, Tầng & Phòng",
    description: "Thiết lập danh sách tòa nhà, loại phòng, giá thuê, trạng thái phòng",
    admin: false,
    manager: true,
    staff: true,
    resident: false,
  },
  {
    id: "perm-9",
    moduleGroup: "Vận hành Cơ sở & Cư dân",
    name: "Quản lý Cư dân & Hợp đồng thuê",
    description: "Lập hợp đồng, xét duyệt, quản lý thông tin lưu trú và CCCD cư dân",
    admin: false,
    manager: true,
    staff: true,
    resident: false,
  },
  {
    id: "perm-10",
    moduleGroup: "Vận hành Cơ sở & Cư dân",
    name: "Tiếp nhận & Duyệt khách thăm",
    description: "Kiểm soát an ninh khách ra vào và phê duyệt đăng ký lưu trú ngắn hạn",
    admin: false,
    manager: true,
    staff: true,
    resident: true,
  },
  {
    id: "perm-11",
    moduleGroup: "Tài chính & Thu phí",
    name: "Ghi chỉ số Điện Nước & Phí dịch vụ",
    description: "Chốt chỉ số đồng hồ điện nước định kỳ và tính tiền tiêu thụ",
    admin: false,
    manager: true,
    staff: true,
    resident: false,
  },
  {
    id: "perm-12",
    moduleGroup: "Tài chính & Thu phí",
    name: "Xuất Hóa đơn & Đối soát tiền thuê",
    description: "Tạo hóa đơn hàng tháng, theo dõi thanh toán và nhắc nợ",
    admin: false,
    manager: true,
    staff: false,
    resident: false,
  },
  {
    id: "perm-13",
    moduleGroup: "Tài chính & Thu phí",
    name: "Thanh toán hóa đơn VietQR",
    description: "Tra cứu hóa đơn cá nhân và quét mã QR SePay để thanh toán tự động",
    admin: false,
    manager: false,
    staff: false,
    resident: true,
  },
  {
    id: "perm-14",
    moduleGroup: "Kỹ thuật & Dịch vụ",
    name: "Kiểm kê Tài sản thiết bị",
    description: "Quản lý điều hòa, tủ lạnh, giường đệm và lịch sử bảo dưỡng đồ đạc",
    admin: false,
    manager: true,
    staff: true,
    resident: false,
  },
  {
    id: "perm-15",
    moduleGroup: "Kỹ thuật & Dịch vụ",
    name: "Yêu cầu & Xử lý Sửa chữa",
    description: "Tiếp nhận báo hỏng, cử nhân viên kỹ thuật khắc phục sự cố phòng",
    admin: false,
    manager: true,
    staff: true,
    resident: true,
  },
];


function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

class StayHubStorageService {
  // In-memory cache synced with localStorage
  private buildings: Building[] = getStored("buildings", initialBuildings);
  private apartments: Apartment[] = getStored("apartments", initialApartments);
  private assets: Asset[] = getStored("assets", initialAssets);
  private assetTypes: AssetType[] = getStored("assetTypes", initialAssetTypes);
  private users: User[] = getStored("users", initialUsers);
  private residents: Resident[] = getStored("residents", initialResidents);
  private contracts: RentalContract[] = getStored("contracts", initialContracts);
  private fees: Fee[] = getStored("fees", initialFees);
  private utilityReadings: UtilityReading[] = getStored("utilityReadings", initialUtilityReadings);
  private invoices: Invoice[] = getStored("invoices", initialInvoices);
  private maintenanceRequests: MaintenanceRequest[] = getStored("maintenanceRequests", initialMaintenanceRequests);
  private visitors: VisitorRegistration[] = getStored("visitors", initialVisitors);
  private notifications: InAppNotification[] = getStored("notifications", initialNotifications);
  private auditLogs: AuditLog[] = getStored("auditLogs", initialAuditLogs);
  private sepayTransactions: SePayTransaction[] = getStored("sepayTransactions", initialSePayTransactions);
  private zaloRecords: ZaloDeliveryRecord[] = getStored("zaloRecords", initialZaloDeliveryRecords);
  private systemSettings: SystemSettings = getStored("systemSettings", initialSystemSettings);

  public resetAllData(): void {
    localStorage.clear();
    this.buildings = [...initialBuildings];
    this.apartments = [...initialApartments];
    this.assets = [...initialAssets];
    this.assetTypes = [...initialAssetTypes];
    this.users = [...initialUsers];
    this.residents = [...initialResidents];
    this.contracts = [...initialContracts];
    this.fees = [...initialFees];
    this.utilityReadings = [...initialUtilityReadings];
    this.invoices = [...initialInvoices];
    this.maintenanceRequests = [...initialMaintenanceRequests];
    this.visitors = [...initialVisitors];
    this.notifications = [...initialNotifications];
    this.auditLogs = [...initialAuditLogs];
    this.sepayTransactions = [...initialSePayTransactions];
    this.zaloRecords = [...initialZaloDeliveryRecords];
    this.systemSettings = { ...initialSystemSettings };
    this.persistAll();
  }

  private persistAll(): void {
    setStored("buildings", this.buildings);
    setStored("apartments", this.apartments);
    setStored("assets", this.assets);
    setStored("assetTypes", this.assetTypes);
    setStored("users", this.users);
    setStored("residents", this.residents);
    setStored("contracts", this.contracts);
    setStored("fees", this.fees);
    setStored("utilityReadings", this.utilityReadings);
    setStored("invoices", this.invoices);
    setStored("maintenanceRequests", this.maintenanceRequests);
    setStored("visitors", this.visitors);
    setStored("notifications", this.notifications);
    setStored("auditLogs", this.auditLogs);
    setStored("sepayTransactions", this.sepayTransactions);
    setStored("zaloRecords", this.zaloRecords);
    setStored("systemSettings", this.systemSettings);
  }

  // --- Audit Logger ---
  public logAudit(params: {
    userId: string;
    userName: string;
    userRole: UserRole;
    action: string;
    entityName: string;
    entityId: string;
    buildingId?: string;
    buildingName?: string;
    details: string;
  }): void {
    const entry: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: params.userId,
      userName: params.userName,
      userRole: params.userRole,
      action: params.action,
      entityName: params.entityName,
      entityId: params.entityId,
      buildingId: params.buildingId,
      buildingName: params.buildingName,
      details: params.details,
      ipAddress: "127.0.0.1",
    };
    this.auditLogs.unshift(entry);
    setStored("auditLogs", this.auditLogs);
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  // --- Users & Identity ---
  public getUsers(): User[] {
    const activeBldIds = this.buildings.filter((b) => b.isActive !== false).map((b) => b.id);
    return this.users.map((u) => {
      if (u.role === "ADMIN" || u.role === "MANAGER") {
        return {
          ...u,
          assignedBuildingIds: Array.from(new Set([...u.assignedBuildingIds, ...activeBldIds])),
        };
      }
      return u;
    });
  }

  public getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public toggleUserActive(userId: string, currentUser: User): boolean {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return false;
    user.isActive = !user.isActive;
    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: user.isActive ? "MO_KHOA_TAI_KHOAN" : "KHOA_TAI_KHOAN",
      entityName: "User",
      entityId: user.id,
      details: `${user.isActive ? "Mở khóa" : "Khóa"} tài khoản ${user.email} (${user.fullName})`,
    });
    setStored("users", this.users);
    return true;
  }

  public createUser(userData: Omit<User, "id" | "createdAt">, currentUser: User): User {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "TAO_TAI_KHOAN",
      entityName: "User",
      entityId: newUser.id,
      details: `Tạo tài khoản mới: ${newUser.email} với vai trò ${newUser.role}`,
    });
    setStored("users", this.users);
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    this.users[index] = { ...this.users[index], ...updates };
    setStored("users", this.users);
    return this.users[index];
  }

  public updateUserWithAudit(userId: string, updates: Partial<User>, currentUser: User): User | null {
    const index = this.users.findIndex((u) => u.id === userId);
    if (index === -1) return null;
    const old = this.users[index];
    this.users[index] = { ...old, ...updates };
    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "CAP_NHAT_TAI_KHOAN",
      entityName: "User",
      entityId: userId,
      details: `Cập nhật tài khoản ${old.email}: vai trò ${updates.role || old.role}, cơ sở [${(updates.assignedBuildingIds || old.assignedBuildingIds).join(", ")}]`,
    });
    setStored("users", this.users);
    return this.users[index];
  }

  public deleteUser(userId: string, currentUser: User): boolean {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return false;
    if (user.id === currentUser.id) return false; // Không tự xóa chính mình
    this.users = this.users.filter((u) => u.id !== userId);
    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "XOA_TAI_KHOAN",
      entityName: "User",
      entityId: user.id,
      details: `Xóa vĩnh viễn tài khoản: ${user.email} (${user.fullName}, ${user.role})`,
    });
    setStored("users", this.users);
    return true;
  }

  public resetUserPassword(userId: string, tempPass: string, currentUser: User): boolean {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return false;
    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "DAT_LAI_MAT_KHAU",
      entityName: "User",
      entityId: user.id,
      details: `Cấp lại mật khẩu mới cho tài khoản: ${user.email} (${user.fullName})`,
    });
    return true;
  }

  // --- Buildings ---
  public getBuildings(): Building[] {
    return [...this.buildings];
  }

  public getBuildingById(id: string): Building | undefined {
    return this.buildings.find((b) => b.id === id);
  }

  public updateBuilding(id: string, updates: Partial<Building>, currentUser: User): Building | null {
    const index = this.buildings.findIndex((b) => b.id === id);
    if (index === -1) return null;
    this.buildings[index] = { ...this.buildings[index], ...updates };
    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "CAP_NHAT_CO_SO",
      entityName: "Building",
      entityId: id,
      buildingId: id,
      buildingName: this.buildings[index].name,
      details: `Cập nhật thông tin cơ sở ${this.buildings[index].name}`,
    });
    setStored("buildings", this.buildings);
    return this.buildings[index];
  }

  public createBuilding(buildingData: Omit<Building, "id" | "createdAt">, currentUser: User): Building {
    const newBld: Building = {
      ...buildingData,
      id: `bld-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.buildings.push(newBld);

    // Auto assign building to manager
    if (buildingData.managerId) {
      const targetMgr = this.users.find((u) => u.id === buildingData.managerId);
      if (targetMgr && !targetMgr.assignedBuildingIds.includes(newBld.id)) {
        targetMgr.assignedBuildingIds.push(newBld.id);
      }
    }

    if (currentUser.role === "MANAGER") {
      if (!currentUser.assignedBuildingIds.includes(newBld.id)) {
        currentUser.assignedBuildingIds.push(newBld.id);
      }
      const currentMgr = this.users.find((u) => u.id === currentUser.id);
      if (currentMgr && !currentMgr.assignedBuildingIds.includes(newBld.id)) {
        currentMgr.assignedBuildingIds.push(newBld.id);
      }
    }
    setStored("users", this.users);

    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "TAO_CO_SO",
      entityName: "Building",
      entityId: newBld.id,
      buildingId: newBld.id,
      buildingName: newBld.name,
      details: `Tạo cơ sở mới: ${newBld.name} (${newBld.code}) do ${currentUser.fullName} (${currentUser.role}) khởi tạo`,
    });
    setStored("buildings", this.buildings);
    return newBld;
  }

  public canDeleteBuilding(buildingId: string): {
    canDelete: boolean;
    reason?: string;
    totalRooms: number;
    vacantRoomsCount: number;
    nonVacantRooms: Apartment[];
    activeContractsCount: number;
    activeResidentsCount: number;
  } {
    const bld = this.buildings.find((b) => b.id === buildingId);
    if (!bld) {
      return {
        canDelete: false,
        reason: "Không tìm thấy cơ sở tòa nhà yêu cầu.",
        totalRooms: 0,
        vacantRoomsCount: 0,
        nonVacantRooms: [],
        activeContractsCount: 0,
        activeResidentsCount: 0,
      };
    }

    const apartments = this.apartments.filter((a) => a.buildingId === buildingId);
    const nonVacantRooms = apartments.filter((a) => a.status !== "Trống");
    const activeContracts = this.contracts.filter(
      (c) => c.buildingId === buildingId && (c.status === "Đang hiệu lực" || c.status === "Đã duyệt")
    );
    const activeResidents = this.residents.filter(
      (r) => r.currentBuildingId === buildingId && r.status === "Đang thuê"
    );

    if (nonVacantRooms.length > 0) {
      const roomListStr = nonVacantRooms
        .slice(0, 4)
        .map((r) => `P.${r.roomCode} (${r.status})`)
        .join(", ");
      const moreCount = nonVacantRooms.length > 4 ? ` và ${nonVacantRooms.length - 4} phòng khác` : "";

      return {
        canDelete: false,
        reason: `Cơ sở còn ${nonVacantRooms.length} phòng chưa ở trạng thái "Trống" (${roomListStr}${moreCount}). Vui lòng bàn giao trả phòng và cập nhật trạng thái phòng về "Trống" trước khi xóa.`,
        totalRooms: apartments.length,
        vacantRoomsCount: apartments.length - nonVacantRooms.length,
        nonVacantRooms,
        activeContractsCount: activeContracts.length,
        activeResidentsCount: activeResidents.length,
      };
    }

    if (activeContracts.length > 0) {
      return {
        canDelete: false,
        reason: `Cơ sở còn ${activeContracts.length} hợp đồng thuê đang có hiệu lực. Vui lòng thanh lý hoặc kết thúc hợp đồng trước khi xóa.`,
        totalRooms: apartments.length,
        vacantRoomsCount: apartments.length,
        nonVacantRooms: [],
        activeContractsCount: activeContracts.length,
        activeResidentsCount: activeResidents.length,
      };
    }

    if (activeResidents.length > 0) {
      return {
        canDelete: false,
        reason: `Cơ sở còn ${activeResidents.length} cư dân đang đăng ký lưu trú. Vui lòng chuyển hoặc làm thủ tục trả phòng cho cư dân.`,
        totalRooms: apartments.length,
        vacantRoomsCount: apartments.length,
        nonVacantRooms: [],
        activeContractsCount: 0,
        activeResidentsCount: activeResidents.length,
      };
    }

    return {
      canDelete: true,
      totalRooms: apartments.length,
      vacantRoomsCount: apartments.length,
      nonVacantRooms: [],
      activeContractsCount: 0,
      activeResidentsCount: 0,
    };
  }

  public softDeleteBuilding(
    buildingId: string,
    currentUser: User,
    reason?: string
  ): boolean {
    const check = this.canDeleteBuilding(buildingId);
    if (!check.canDelete) {
      throw new Error(check.reason || "Cơ sở chưa đủ điều kiện an toàn để xóa mềm.");
    }

    const index = this.buildings.findIndex((b) => b.id === buildingId);
    if (index === -1) return false;

    const bld = this.buildings[index];
    bld.isActive = false;
    bld.deletedAt = new Date().toISOString();
    bld.deletedBy = currentUser.fullName;
    bld.deleteReason = reason || "Cơ sở đã dọn trống và hoàn tất thủ tục lưu trữ";

    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "XOA_MEM_CO_SO",
      entityName: "Building",
      entityId: bld.id,
      buildingId: bld.id,
      buildingName: bld.name,
      details: `Xóa mềm (lưu trữ) cơ sở ${bld.name} (${bld.code}). Tất cả ${check.totalRooms} phòng đều ở trạng thái Trống. Lý do: ${bld.deleteReason}`,
    });

    setStored("buildings", this.buildings);
    return true;
  }

  public restoreBuilding(buildingId: string, currentUser: User): boolean {
    const index = this.buildings.findIndex((b) => b.id === buildingId);
    if (index === -1) return false;

    const bld = this.buildings[index];
    bld.isActive = true;
    delete bld.deletedAt;
    delete bld.deletedBy;
    delete bld.deleteReason;

    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "KHOI_PHUC_CO_SO",
      entityName: "Building",
      entityId: bld.id,
      buildingId: bld.id,
      buildingName: bld.name,
      details: `Khôi phục cơ sở ${bld.name} (${bld.code}) trở lại hoạt động bình thường`,
    });

    setStored("buildings", this.buildings);
    return true;
  }

  // --- Apartments & Batch Generation ---
  public getApartments(buildingId?: string): Apartment[] {
    const list = !buildingId || buildingId === "ALL" ? this.apartments : this.apartments.filter((a) => a.buildingId === buildingId);
    return list.map((a) => {
      const bld = this.buildings.find((b) => b.id === a.buildingId);
      const bldCode = bld?.code || a.buildingId.replace("bld-", "SH");
      return {
        ...a,
        electricityMeterCode: a.electricityMeterCode || `EM-${bldCode}-${a.roomCode}`,
        waterMeterCode: a.waterMeterCode || `WM-${bldCode}-${a.roomCode}`,
      };
    });
  }

  public getApartmentById(id: string): Apartment | undefined {
    const a = this.apartments.find((apt) => apt.id === id);
    if (!a) return undefined;
    const bld = this.buildings.find((b) => b.id === a.buildingId);
    const bldCode = bld?.code || a.buildingId.replace("bld-", "SH");
    return {
      ...a,
      electricityMeterCode: a.electricityMeterCode || `EM-${bldCode}-${a.roomCode}`,
      waterMeterCode: a.waterMeterCode || `WM-${bldCode}-${a.roomCode}`,
    };
  }

  public createApartment(data: {
    buildingId: string;
    roomCode: string;
    floor: number;
    areaSqm: number;
    referencePrice: number;
    description?: string;
    electricityMeterCode: string;
    waterMeterCode: string;
    initialElectricityIndex?: number;
    initialWaterIndex?: number;
  }, currentUser: User): Apartment {
    const building = this.getBuildingById(data.buildingId);
    if (!building) throw new Error("Cơ sở tòa nhà không tồn tại.");

    const cleanRoomCode = data.roomCode.trim().toUpperCase();
    if (!cleanRoomCode) throw new Error("Mã phòng không được để trống.");

    const cleanElectricityMeter = data.electricityMeterCode.trim().toUpperCase();
    if (!cleanElectricityMeter) throw new Error("Vui lòng nhập Mã/ID công tơ điện của phòng.");

    const cleanWaterMeter = data.waterMeterCode.trim().toUpperCase();
    if (!cleanWaterMeter) throw new Error("Vui lòng nhập Mã/ID đồng hồ nước của phòng.");

    // Check roomCode duplication in same building
    const existingRoom = this.apartments.find(
      (a) => a.buildingId === data.buildingId && a.roomCode.toLowerCase() === cleanRoomCode.toLowerCase()
    );
    if (existingRoom) {
      throw new Error(`Phòng ${cleanRoomCode} đã tồn tại trong cơ sở ${building.name}.`);
    }

    const aptId = `apt-${building.id}-${cleanRoomCode}`;
    const newApt: Apartment = {
      id: aptId,
      buildingId: building.id,
      buildingName: building.name,
      roomCode: cleanRoomCode,
      floor: Number(data.floor),
      areaSqm: Number(data.areaSqm),
      referencePrice: Number(data.referencePrice),
      currentPrice: Number(data.referencePrice),
      status: "Trống",
      description: data.description?.trim() || `Phòng ${cleanRoomCode} tầng ${data.floor}, trang bị sẵn gói tiện nghi chuẩn StayHub.`,
      assetCount: this.assetTypes.length,
      electricityMeterCode: cleanElectricityMeter,
      waterMeterCode: cleanWaterMeter,
      initialElectricityIndex: Number(data.initialElectricityIndex || 0),
      initialWaterIndex: Number(data.initialWaterIndex || 0),
      createdAt: new Date().toISOString(),
    };

    // Auto-generate standard room assets
    const newAssets: Asset[] = this.assetTypes.map((at, idx) => ({
      id: `ast-${aptId}-${at.code.toLowerCase()}`,
      apartmentId: aptId,
      apartmentCode: cleanRoomCode,
      buildingId: building.id,
      assetTypeId: at.id,
      assetTypeName: at.name,
      name: `${at.name} - P.${cleanRoomCode}`,
      code: `${building.code}-${cleanRoomCode}-${at.code}`,
      serialNumber: `SN-${cleanRoomCode}-${1000 + idx}`,
      condition: "Tốt",
      installedDate: new Date().toISOString().split("T")[0],
      lastCheckedAt: new Date().toISOString(),
      lastUpdatedBy: currentUser.fullName,
      notes: "Tài sản sinh tự động khi tạo phòng mới",
    }));

    this.apartments.push(newApt);
    this.assets.push(...newAssets);

    // Update building counts
    building.totalRooms = this.apartments.filter((a) => a.buildingId === building.id).length;
    building.totalFloors = Math.max(building.totalFloors, Number(data.floor));

    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "TAO_PHONG_MOI",
      entityName: "Apartment",
      entityId: newApt.id,
      buildingId: building.id,
      buildingName: building.name,
      details: `Tạo mới phòng ${cleanRoomCode} (Tầng ${data.floor}, ${data.areaSqm}m², ${data.referencePrice.toLocaleString("vi-VN")} ₫) - Công tơ điện: ${cleanElectricityMeter}, Đồng hồ nước: ${cleanWaterMeter}`,
    });

    setStored("apartments", this.apartments);
    setStored("assets", this.assets);
    setStored("buildings", this.buildings);

    return newApt;
  }

  public updateApartmentDetails(
    apartmentId: string,
    data: {
      areaSqm?: number;
      referencePrice?: number;
      description?: string;
      electricityMeterCode?: string;
      waterMeterCode?: string;
    },
    currentUser: User
  ): Apartment {
    const apt = this.apartments.find((a) => a.id === apartmentId);
    if (!apt) throw new Error("Không tìm thấy phòng");

    if (data.areaSqm !== undefined) apt.areaSqm = Number(data.areaSqm);
    if (data.referencePrice !== undefined) {
      apt.referencePrice = Number(data.referencePrice);
      apt.currentPrice = Number(data.referencePrice);
    }
    if (data.description !== undefined) apt.description = data.description;
    if (data.electricityMeterCode !== undefined && data.electricityMeterCode.trim()) {
      apt.electricityMeterCode = data.electricityMeterCode.trim().toUpperCase();
    }
    if (data.waterMeterCode !== undefined && data.waterMeterCode.trim()) {
      apt.waterMeterCode = data.waterMeterCode.trim().toUpperCase();
    }

    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "CAP_NHAT_PHONG",
      entityName: "Apartment",
      entityId: apt.id,
      buildingId: apt.buildingId,
      buildingName: apt.buildingName,
      details: `Cập nhật thông số phòng ${apt.roomCode} (CT Điện: ${apt.electricityMeterCode}, ĐH Nước: ${apt.waterMeterCode})`,
    });

    setStored("apartments", this.apartments);
    return apt;
  }

  public updateApartmentStatus(id: string, status: ApartmentStatus, currentUser: User): boolean {
    const apt = this.apartments.find((a) => a.id === id);
    if (!apt) return false;
    
    // Safety check: Cannot arbitrarily change status to "Trống" if active contract exists
    if (status === "Trống" && apt.currentContractId) {
      const activeContract = this.contracts.find(
        (c) => c.id === apt.currentContractId && (c.status === "Đang hiệu lực" || c.status === "Đã duyệt")
      );
      if (activeContract) {
        throw new Error("Không thể chuyển phòng về trạng thái 'Trống' khi đang có hợp đồng hiệu lực. Vui lòng làm thủ tục thanh lý hợp đồng trước.");
      }
    }

    const oldStatus = apt.status;
    apt.status = status;
    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "DOI_TRANG_THAI_PHONG",
      entityName: "Apartment",
      entityId: apt.id,
      buildingId: apt.buildingId,
      buildingName: apt.buildingName,
      details: `Phòng ${apt.roomCode} đổi trạng thái: ${oldStatus} -> ${status}`,
    });
    setStored("apartments", this.apartments);
    return true;
  }

  /**
   * Batch Room Generation
   * Generates rooms along with predefined assets in a transactional simulation
   */
  public batchGenerateRooms(params: {
    buildingId: string;
    totalFloors: number;
    roomsPerFloor: number;
    startFloor?: number;
    prefix?: string;
    referencePrice: number;
    areaSqm: number;
  }, currentUser: User): { generatedRoomsCount: number; generatedAssetsCount: number } {
    const building = this.getBuildingById(params.buildingId);
    if (!building) throw new Error("Cơ sở không tồn tại");

    const startFloor = params.startFloor || 1;
    const prefix = params.prefix || "";
    const newApartments: Apartment[] = [];
    const newAssets: Asset[] = [];

    // Collision check before committing
    for (let floor = startFloor; floor < startFloor + params.totalFloors; floor++) {
      for (let r = 1; r <= params.roomsPerFloor; r++) {
        const roomCode = `${prefix}${floor}${r < 10 ? "0" + r : r}`;
        const existing = this.apartments.find(
          (a) => a.buildingId === params.buildingId && a.roomCode === roomCode
        );
        if (existing) {
          throw new Error(`Mã phòng ${roomCode} đã tồn tại trong cơ sở ${building.name}. Hủy thao tác để tránh trùng lặp.`);
        }

        const aptId = `apt-${building.id}-${roomCode}`;
        newApartments.push({
          id: aptId,
          buildingId: building.id,
          buildingName: building.name,
          roomCode,
          floor,
          areaSqm: params.areaSqm,
          referencePrice: params.referencePrice,
          currentPrice: params.referencePrice,
          status: "Trống",
          description: `Phòng ${roomCode} tầng ${floor}, trang bị sẵn gói nội thất chuẩn StayHub.`,
          assetCount: this.assetTypes.length,
          electricityMeterCode: `EM-${building.code}-${roomCode}`,
          waterMeterCode: `WM-${building.code}-${roomCode}`,
          initialElectricityIndex: 0,
          initialWaterIndex: 0,
          createdAt: new Date().toISOString(),
        });

        // Predefined assets automatically generated with room
        this.assetTypes.forEach((at, idx) => {
          newAssets.push({
            id: `ast-${aptId}-${at.code.toLowerCase()}`,
            apartmentId: aptId,
            apartmentCode: roomCode,
            buildingId: building.id,
            assetTypeId: at.id,
            assetTypeName: at.name,
            name: `${at.name} - P.${roomCode}`,
            code: `${building.code}-${roomCode}-${at.code}`,
            serialNumber: `SN-${roomCode}-${1000 + idx}`,
            condition: "Tốt",
            installedDate: new Date().toISOString().split("T")[0],
            lastCheckedAt: new Date().toISOString(),
            lastUpdatedBy: currentUser.fullName,
            notes: "Tài sản sinh tự động theo cấu hình phòng chuẩn",
          });
        });
      }
    }

    // Atomic commit
    this.apartments.push(...newApartments);
    this.assets.push(...newAssets);
    
    // Update building totals
    building.totalRooms = this.apartments.filter((a) => a.buildingId === building.id).length;
    building.totalFloors = Math.max(building.totalFloors, startFloor + params.totalFloors - 1);

    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "SINH_PHONG_HANG_LOAT",
      entityName: "Building",
      entityId: building.id,
      buildingId: building.id,
      buildingName: building.name,
      details: `Sinh hàng loạt ${newApartments.length} phòng và ${newAssets.length} tài sản kèm theo tại cơ sở ${building.name}`,
    });

    setStored("apartments", this.apartments);
    setStored("assets", this.assets);
    setStored("buildings", this.buildings);

    return {
      generatedRoomsCount: newApartments.length,
      generatedAssetsCount: newAssets.length,
    };
  }

  // --- Assets ---
  public getAssets(filters?: { apartmentId?: string; buildingId?: string }): Asset[] {
    let result = [...this.assets];
    if (filters?.apartmentId) {
      result = result.filter((a) => a.apartmentId === filters.apartmentId);
    }
    if (filters?.buildingId && filters.buildingId !== "ALL") {
      result = result.filter((a) => a.buildingId === filters.buildingId);
    }
    return result;
  }

  public getAssetById(id: string): Asset | undefined {
    return this.assets.find((a) => a.id === id);
  }

  public updateAssetCondition(
    assetId: string,
    newCondition: AssetCondition,
    notes: string,
    currentUser: User
  ): boolean {
    const asset = this.assets.find((a) => a.id === assetId);
    if (!asset) return false;

    const previousCondition = asset.condition;
    asset.condition = newCondition;
    asset.lastCheckedAt = new Date().toISOString();
    asset.lastUpdatedBy = currentUser.fullName;
    asset.notes = notes;

    if (!asset.history) asset.history = [];
    asset.history.unshift({
      id: `log-${Date.now()}`,
      assetId: asset.id,
      previousCondition,
      newCondition,
      updatedBy: currentUser.fullName,
      notes,
      updatedAt: new Date().toISOString(),
    });

    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "CAP_NHAT_TINH_TRANG_TAI_SAN",
      entityName: "Asset",
      entityId: asset.id,
      buildingId: asset.buildingId,
      details: `Tài sản ${asset.name} đổi tình trạng: ${previousCondition} -> ${newCondition}. Ghi chú: ${notes}`,
    });

    setStored("assets", this.assets);
    return true;
  }

  public getAssetTypes(): AssetType[] {
    return [...this.assetTypes];
  }

  public createAsset(assetData: Omit<Asset, "id">, currentUser: User): Asset {
    const newId = `ast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newAsset: Asset = {
      ...assetData,
      id: newId,
      lastCheckedAt: assetData.lastCheckedAt || new Date().toISOString(),
      lastUpdatedBy: currentUser.fullName,
      history: [
        {
          id: `log-${Date.now()}`,
          assetId: newId,
          previousCondition: assetData.condition,
          newCondition: assetData.condition,
          updatedBy: currentUser.fullName,
          notes: "Tạo mới thiết bị và bàn giao vào phòng",
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    this.assets.push(newAsset);

    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "THEM_TAI_SAN_PHONG",
      entityName: "Asset",
      entityId: newAsset.id,
      buildingId: newAsset.buildingId,
      details: `Thêm thiết bị ${newAsset.name} vào phòng P.${newAsset.apartmentCode}`,
    });

    setStored("assets", this.assets);
    return newAsset;
  }

  public batchAddAssets(
    params: {
      apartmentIds: string[];
      assetTypeName: string;
      notes?: string;
      condition?: AssetCondition;
      installedDate?: string;
    },
    currentUser: User
  ): Asset[] {
    const created: Asset[] = [];
    const condition = params.condition || "Tốt";
    const installedDate = params.installedDate || new Date().toISOString().split("T")[0];

    const codePrefix =
      params.assetTypeName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0, 6)
        .toUpperCase() || "DEV";

    params.apartmentIds.forEach((aptId) => {
      const apt = this.apartments.find((a) => a.id === aptId);
      if (!apt) return;

      const building = this.buildings.find((b) => b.id === apt.buildingId);
      const bldCode = building ? building.code : "BLD";
      const newId = `ast-${apt.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      const newAsset: Asset = {
        id: newId,
        apartmentId: apt.id,
        apartmentCode: apt.roomCode,
        buildingId: apt.buildingId,
        assetTypeId: `type-${codePrefix.toLowerCase()}`,
        assetTypeName: params.assetTypeName,
        name: `${params.assetTypeName} - P.${apt.roomCode}`,
        code: `${bldCode}-${apt.roomCode}-${codePrefix}`,
        serialNumber: `SN-${apt.roomCode}-${Math.floor(1000 + Math.random() * 9000)}`,
        condition,
        installedDate,
        lastCheckedAt: new Date().toISOString(),
        lastUpdatedBy: currentUser.fullName,
        notes: params.notes || "Thêm hàng loạt theo danh sách phòng",
        history: [
          {
            id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            assetId: newId,
            previousCondition: condition,
            newCondition: condition,
            updatedBy: currentUser.fullName,
            notes: "Trang bị mới vào phòng",
            updatedAt: new Date().toISOString(),
          },
        ],
      };

      this.assets.push(newAsset);
      created.push(newAsset);
    });

    if (created.length > 0) {
      this.logAudit({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: "THEM_TAI_SAN_HANG_LOAT",
        entityName: "Asset",
        entityId: `batch-${Date.now()}`,
        buildingId: created[0].buildingId,
        details: `Thêm thiết bị ${params.assetTypeName} vào ${created.length} phòng`,
      });
      setStored("assets", this.assets);
    }

    return created;
  }

  public deleteAsset(assetId: string, currentUser: User): boolean {
    const idx = this.assets.findIndex((a) => a.id === assetId);
    if (idx === -1) return false;

    const removed = this.assets[idx];
    this.assets.splice(idx, 1);

    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "XOA_TAI_SAN_PHONG",
      entityName: "Asset",
      entityId: assetId,
      buildingId: removed.buildingId,
      details: `Xóa thiết bị ${removed.name} khỏi phòng P.${removed.apartmentCode}`,
    });

    setStored("assets", this.assets);
    return true;
  }

  // --- Residents ---
  public getResidents(buildingId?: string): Resident[] {
    if (!buildingId || buildingId === "ALL") return [...this.residents];
    return this.residents.filter((r) => r.currentBuildingId === buildingId);
  }

  public getResidentById(id: string): Resident | undefined {
    return this.residents.find((r) => r.id === id);
  }

  public getResidentByUserId(userId: string): Resident | undefined {
    return this.residents.find((r) => r.userId === userId);
  }

  public createResident(residentData: Omit<Resident, "id" | "createdAt">, currentUser: User): Resident {
    const newRes: Resident = {
      ...residentData,
      id: `res-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.residents.push(newRes);
    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "TAO_HO_SO_CU_DAN",
      entityName: "Resident",
      entityId: newRes.id,
      details: `Thêm cư dân: ${newRes.fullName} (SĐT: ${newRes.phoneNumber})`,
    });
    setStored("residents", this.residents);
    return newRes;
  }

  public checkInResident(residentId: string, currentUser: User): boolean {
    const resident = this.residents.find((r) => r.id === residentId);
    if (!resident) throw new Error("Không tìm thấy cư dân");
    if (!resident.currentContractId) throw new Error("Cư dân chưa có hợp đồng thuê");

    const contract = this.contracts.find((c) => c.id === resident.currentContractId);
    if (!contract) throw new Error("Không tìm thấy hợp đồng của cư dân");
    if (contract.status !== "Đã duyệt" && contract.status !== "Đang hiệu lực") {
      throw new Error(`Hợp đồng ${contract.contractCode} chưa được duyệt (trạng thái: ${contract.status}). Không đủ điều kiện check-in.`);
    }

    const apt = this.apartments.find((a) => a.id === contract.apartmentId);
    if (!apt) throw new Error("Phòng không tồn tại");

    resident.status = "Đang thuê";
    resident.checkedInAt = new Date().toISOString();
    resident.currentApartmentId = apt.id;
    resident.currentApartmentCode = apt.roomCode;
    resident.currentBuildingId = apt.buildingId;
    resident.currentBuildingName = apt.buildingName;

    contract.status = "Đang hiệu lực";
    apt.status = "Đang thuê";
    apt.currentResidentId = resident.id;
    apt.currentResidentName = resident.fullName;
    apt.currentContractId = contract.id;

    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "CHECK_IN_CU_DAN",
      entityName: "Resident",
      entityId: resident.id,
      buildingId: apt.buildingId,
      buildingName: apt.buildingName,
      details: `Check-in cư dân ${resident.fullName} vào phòng ${apt.roomCode}`,
    });

    setStored("residents", this.residents);
    setStored("contracts", this.contracts);
    setStored("apartments", this.apartments);
    return true;
  }

  public checkOutResident(
    residentId: string,
    handoverNotes: string,
    currentUser: User
  ): { success: boolean; message: string } {
    const resident = this.residents.find((r) => r.id === residentId);
    if (!resident) throw new Error("Không tìm thấy cư dân");

    // Check debts
    const pendingInvoices = this.invoices.filter(
      (inv) => inv.residentId === resident.id && inv.status !== "Đã thanh toán" && inv.status !== "Đã hủy" && inv.balanceRemaining > 0
    );
    if (pendingInvoices.length > 0) {
      const totalDebt = pendingInvoices.reduce((sum, inv) => sum + inv.balanceRemaining, 0);
      throw new Error(`Cư dân còn nợ ${pendingInvoices.length} hóa đơn chưa thanh toán với tổng số tiền ${totalDebt.toLocaleString("vi-VN")} ₫. Vui lòng thu tiền trước khi check-out.`);
    }

    const contract = this.contracts.find((c) => c.id === resident.currentContractId);
    if (contract) {
      contract.status = "Đã chấm dứt";
      contract.terminatedAt = new Date().toISOString();
      contract.terminationReason = `Hoàn tất thủ tục trả phòng (Check-out). Bàn giao tài sản: ${handoverNotes}`;
    }

    if (resident.currentApartmentId) {
      const apt = this.apartments.find((a) => a.id === resident.currentApartmentId);
      if (apt) {
        apt.status = "Trống";
        apt.currentResidentId = undefined;
        apt.currentResidentName = undefined;
        apt.currentContractId = undefined;
      }
    }

    resident.status = "Đã chuyển đi";
    resident.checkedOutAt = new Date().toISOString();
    resident.currentApartmentId = undefined;
    resident.currentApartmentCode = undefined;
    resident.currentContractId = undefined;

    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "CHECK_OUT_CU_DAN",
      entityName: "Resident",
      entityId: resident.id,
      details: `Check-out thành công cho cư dân ${resident.fullName}. Bàn giao: ${handoverNotes}`,
    });

    setStored("residents", this.residents);
    setStored("contracts", this.contracts);
    setStored("apartments", this.apartments);

    return { success: true, message: `Đã hoàn tất check-out cho cư dân ${resident.fullName}` };
  }

  // --- Rental Contracts ---
  public getContracts(buildingId?: string): RentalContract[] {
    if (!buildingId || buildingId === "ALL") return [...this.contracts];
    return this.contracts.filter((c) => c.buildingId === buildingId);
  }

  public getContractById(id: string): RentalContract | undefined {
    return this.contracts.find((c) => c.id === id);
  }

  public createContract(
    data: Omit<RentalContract, "id" | "contractCode" | "createdAt" | "updatedAt">,
    currentUser: User
  ): RentalContract {
    // Check overlap with active/approved contracts for the same apartment
    const overlapping = this.contracts.find((c) => {
      if (c.apartmentId !== data.apartmentId) return false;
      if (c.status !== "Đang hiệu lực" && c.status !== "Đã duyệt") return false;
      // Date overlap check: (StartA <= EndB) and (EndA >= StartB)
      const startNew = new Date(data.startDate).getTime();
      const endNew = new Date(data.endDate).getTime();
      const startOld = new Date(c.startDate).getTime();
      const endOld = new Date(c.endDate).getTime();
      return startNew <= endOld && endNew >= startOld;
    });

    if (overlapping) {
      throw new Error(`Phòng ${data.apartmentCode} đã có hợp đồng ${overlapping.contractCode} có hiệu lực trong khoảng thời gian từ ${overlapping.startDate} đến ${overlapping.endDate}. Không thể tạo hợp đồng chồng chéo.`);
    }

    const newCtr: RentalContract = {
      ...data,
      id: `ctr-${Date.now()}`,
      contractCode: `HD-${new Date().getFullYear()}-${data.apartmentCode}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.contracts.unshift(newCtr);

    // If draft created for an apartment, can flag apartment as "Đã giữ chỗ" if specified
    if (newCtr.status === "Chờ duyệt") {
      const apt = this.apartments.find((a) => a.id === newCtr.apartmentId);
      if (apt && apt.status === "Trống") {
        apt.status = "Đã giữ chỗ";
      }
    }

    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "TAO_HOP_DONG",
      entityName: "RentalContract",
      entityId: newCtr.id,
      buildingId: newCtr.buildingId,
      buildingName: newCtr.buildingName,
      details: `Tạo hợp đồng ${newCtr.contractCode} cho phòng ${newCtr.apartmentCode} (${newCtr.residentName})`,
    });

    setStored("contracts", this.contracts);
    setStored("apartments", this.apartments);
    return newCtr;
  }

  public approveContract(contractId: string, currentUser: User): boolean {
    const ctr = this.contracts.find((c) => c.id === contractId);
    if (!ctr) return false;
    ctr.status = "Đã duyệt";
    ctr.approvedBy = `${currentUser.fullName} (${currentUser.role})`;
    ctr.updatedAt = new Date().toISOString();

    const apt = this.apartments.find((a) => a.id === ctr.apartmentId);
    if (apt) {
      apt.status = "Đã giữ chỗ";
      apt.currentContractId = ctr.id;
    }

    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "PHE_DUYET_HOP_DONG",
      entityName: "RentalContract",
      entityId: ctr.id,
      buildingId: ctr.buildingId,
      buildingName: ctr.buildingName,
      details: `Phê duyệt hợp đồng ${ctr.contractCode} cho phòng ${ctr.apartmentCode}`,
    });

    setStored("contracts", this.contracts);
    setStored("apartments", this.apartments);
    return true;
  }

  public rejectContract(contractId: string, reason: string, currentUser: User): boolean {
    const ctr = this.contracts.find((c) => c.id === contractId);
    if (!ctr) return false;
    ctr.status = "Nháp";
    ctr.rejectionReason = reason;
    ctr.updatedAt = new Date().toISOString();

    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "TU_CHOI_HOP_DONG",
      entityName: "RentalContract",
      entityId: ctr.id,
      buildingId: ctr.buildingId,
      buildingName: ctr.buildingName,
      details: `Từ chối hợp đồng ${ctr.contractCode}. Lý do: ${reason}`,
    });

    setStored("contracts", this.contracts);
    return true;
  }

  public renewContract(
    contractId: string,
    newEndDate: string,
    newRentPrice: number,
    currentUser: User
  ): RentalContract {
    const oldCtr = this.contracts.find((c) => c.id === contractId);
    if (!oldCtr) throw new Error("Không tìm thấy hợp đồng cũ");

    const renewedCtr: RentalContract = {
      ...oldCtr,
      id: `ctr-${Date.now()}`,
      contractCode: `${oldCtr.contractCode}-GH`,
      startDate: oldCtr.endDate,
      endDate: newEndDate,
      rentPrice: newRentPrice,
      status: "Đang hiệu lực",
      renewedFromContractId: oldCtr.id,
      createdBy: `${currentUser.fullName} (${currentUser.role})`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.contracts.unshift(renewedCtr);

    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "GIA_HAN_HOP_DONG",
      entityName: "RentalContract",
      entityId: renewedCtr.id,
      buildingId: renewedCtr.buildingId,
      buildingName: renewedCtr.buildingName,
      details: `Gia hạn hợp đồng ${oldCtr.contractCode} thành ${renewedCtr.contractCode} đến ${newEndDate}`,
    });

    setStored("contracts", this.contracts);
    return renewedCtr;
  }

  public terminateContract(
    contractId: string,
    reason: string,
    depositRefunded: number,
    depositDeducted: number,
    currentUser: User
  ): boolean {
    const ctr = this.contracts.find((c) => c.id === contractId);
    if (!ctr) return false;

    ctr.status = "Đã chấm dứt";
    ctr.terminationReason = reason;
    ctr.terminatedAt = new Date().toISOString();
    ctr.depositRefunded = depositRefunded;
    ctr.depositDeducted = depositDeducted;
    ctr.updatedAt = new Date().toISOString();

    const apt = this.apartments.find((a) => a.id === ctr.apartmentId);
    if (apt) {
      apt.status = "Trống";
      apt.currentContractId = undefined;
      apt.currentResidentId = undefined;
      apt.currentResidentName = undefined;
    }

    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "CHAM_DUT_HOP_DONG",
      entityName: "RentalContract",
      entityId: ctr.id,
      buildingId: ctr.buildingId,
      buildingName: ctr.buildingName,
      details: `Chấm dứt hợp đồng ${ctr.contractCode}. Lý do: ${reason}. Hoàn cọc: ${depositRefunded.toLocaleString("vi-VN")} ₫`,
    });

    setStored("contracts", this.contracts);
    setStored("apartments", this.apartments);
    return true;
  }

  // --- Fees & Utility Readings ---
  public getFees(buildingId?: string): Fee[] {
    if (!buildingId || buildingId === "ALL") return [...this.fees];
    return this.fees.filter((f) => f.buildingId === buildingId);
  }

  public createOrUpdateFee(feeData: Partial<Fee> & { buildingId: string; name: string; unitPrice: number }, currentUser: User): Fee {
    if (feeData.id) {
      const idx = this.fees.findIndex((f) => f.id === feeData.id);
      if (idx !== -1) {
        this.fees[idx] = { ...this.fees[idx], ...feeData } as Fee;
        this.logAudit({
          userId: currentUser.id,
          userName: currentUser.fullName,
          userRole: currentUser.role,
          action: "CAP_NHAT_BIEU_PHI",
          entityName: "Fee",
          entityId: this.fees[idx].id,
          buildingId: this.fees[idx].buildingId,
          details: `Cập nhật biểu phí ${this.fees[idx].name}: ${this.fees[idx].unitPrice.toLocaleString("vi-VN")} ₫`,
        });
        setStored("fees", this.fees);
        return this.fees[idx];
      }
    }

    const bld = this.getBuildingById(feeData.buildingId);
    const newFee: Fee = {
      id: `fee-${Date.now()}`,
      buildingId: feeData.buildingId,
      buildingName: bld ? bld.name : "",
      name: feeData.name,
      code: feeData.code || `FEE_${Date.now()}`,
      calculationType: feeData.calculationType || "PER_ROOM",
      unitPrice: feeData.unitPrice,
      unitName: feeData.unitName || "phòng/tháng",
      isActive: feeData.isActive ?? true,
      effectiveDate: feeData.effectiveDate || new Date().toISOString().split("T")[0],
      description: feeData.description || "",
    };

    this.fees.push(newFee);
    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "TAO_BIEU_PHI",
      entityName: "Fee",
      entityId: newFee.id,
      buildingId: newFee.buildingId,
      details: `Tạo biểu phí mới: ${newFee.name} (${newFee.unitPrice.toLocaleString("vi-VN")} ₫)`,
    });
    setStored("fees", this.fees);
    return newFee;
  }

  public getUtilityReadings(filters?: {
    buildingId?: string;
    apartmentId?: string;
    periodMonth?: number;
    periodYear?: number;
  }): UtilityReading[] {
    let result = [...this.utilityReadings];
    if (filters?.buildingId && filters.buildingId !== "ALL") {
      result = result.filter((u) => u.buildingId === filters.buildingId);
    }
    if (filters?.apartmentId) {
      result = result.filter((u) => u.apartmentId === filters.apartmentId);
    }
    if (filters?.periodMonth) {
      result = result.filter((u) => u.periodMonth === filters.periodMonth);
    }
    if (filters?.periodYear) {
      result = result.filter((u) => u.periodYear === filters.periodYear);
    }
    return result.map((u) => {
      if (u.meterCode) return u;
      const apt = this.apartments.find((a) => a.id === u.apartmentId || a.roomCode === u.apartmentCode);
      const bld = this.buildings.find((b) => b.id === u.buildingId);
      const bldCode = bld?.code || "SH";
      const resolved = u.utilityType === "ELECTRICITY"
        ? (apt?.electricityMeterCode || `EM-${bldCode}-${u.apartmentCode}`)
        : (apt?.waterMeterCode || `WM-${bldCode}-${u.apartmentCode}`);
      return {
        ...u,
        meterCode: resolved,
      };
    });
  }

  public recordUtilityReading(data: {
    apartmentId: string;
    utilityType: "ELECTRICITY" | "WATER";
    periodMonth: number;
    periodYear: number;
    previousIndex: number;
    currentIndex: number;
    unitPrice: number;
    notes?: string;
  }, currentUser: User): UtilityReading {
    if (data.currentIndex < data.previousIndex) {
      throw new Error(`Chỉ số mới (${data.currentIndex}) không thể nhỏ hơn chỉ số cũ (${data.previousIndex})`);
    }

    const apt = this.apartments.find((a) => a.id === data.apartmentId);
    if (!apt) throw new Error("Không tìm thấy thông tin phòng");

    // Check duplicate
    const existing = this.utilityReadings.find(
      (u) =>
        u.apartmentId === data.apartmentId &&
        u.utilityType === data.utilityType &&
        u.periodMonth === data.periodMonth &&
        u.periodYear === data.periodYear
    );

    if (existing && existing.isInvoiced) {
      throw new Error("Chỉ số kỳ này đã được xuất hóa đơn khóa sổ. Không thể chỉnh sửa trực tiếp.");
    }

    const consumption = data.currentIndex - data.previousIndex;
    const totalAmount = consumption * data.unitPrice;
    const meterCode = data.utilityType === "ELECTRICITY"
      ? (apt.electricityMeterCode || `EM-${apt.roomCode}`)
      : (apt.waterMeterCode || `WM-${apt.roomCode}`);

    if (existing) {
      existing.previousIndex = data.previousIndex;
      existing.currentIndex = data.currentIndex;
      existing.consumption = consumption;
      existing.unitPrice = data.unitPrice;
      existing.totalAmount = totalAmount;
      existing.meterCode = meterCode;
      existing.recordedBy = currentUser.fullName;
      existing.recordedAt = new Date().toISOString();
      existing.notes = data.notes;
      this.logAudit({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: "CAP_NHAT_CHI_SO_DIEN_NUOC",
        entityName: "UtilityReading",
        entityId: existing.id,
        buildingId: apt.buildingId,
        details: `Cập nhật chỉ số ${data.utilityType} (Công tơ: ${meterCode}) P.${apt.roomCode} kỳ ${data.periodMonth}/${data.periodYear}: ${data.previousIndex} -> ${data.currentIndex} (Tiêu thụ: ${consumption})`,
      });
      setStored("utilityReadings", this.utilityReadings);
      return existing;
    }

    const newReading: UtilityReading = {
      id: `utl-${apt.roomCode}-${data.periodYear}${data.periodMonth}-${data.utilityType.toLowerCase()}`,
      buildingId: apt.buildingId,
      buildingName: apt.buildingName,
      apartmentId: apt.id,
      apartmentCode: apt.roomCode,
      utilityType: data.utilityType,
      periodMonth: data.periodMonth,
      periodYear: data.periodYear,
      previousIndex: data.previousIndex,
      currentIndex: data.currentIndex,
      consumption,
      unitPrice: data.unitPrice,
      totalAmount,
      recordedBy: currentUser.fullName,
      recordedAt: new Date().toISOString(),
      isInvoiced: false,
      meterCode,
      notes: data.notes,
    };

    this.utilityReadings.push(newReading);
    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "GHI_CHI_SO_DIEN_NUOC",
      entityName: "UtilityReading",
      entityId: newReading.id,
      buildingId: apt.buildingId,
      details: `Ghi chỉ số ${data.utilityType} P.${apt.roomCode} kỳ ${data.periodMonth}/${data.periodYear}: ${data.previousIndex} -> ${data.currentIndex} (Tiêu thụ: ${consumption})`,
    });

    setStored("utilityReadings", this.utilityReadings);
    return newReading;
  }

  // --- Invoices ---
  public getInvoices(filters?: {
    buildingId?: string;
    residentId?: string;
    apartmentId?: string;
    periodMonth?: number;
    periodYear?: number;
    status?: string;
  }): Invoice[] {
    let result = [...this.invoices];
    if (filters?.buildingId && filters.buildingId !== "ALL") {
      result = result.filter((i) => i.buildingId === filters.buildingId);
    }
    if (filters?.residentId) {
      result = result.filter((i) => i.residentId === filters.residentId);
    }
    if (filters?.apartmentId) {
      result = result.filter((i) => i.apartmentId === filters.apartmentId);
    }
    if (filters?.periodMonth) {
      result = result.filter((i) => i.periodMonth === filters.periodMonth);
    }
    if (filters?.periodYear) {
      result = result.filter((i) => i.periodYear === filters.periodYear);
    }
    if (filters?.status) {
      result = result.filter((i) => i.status === filters.status);
    }
    return result.map((inv) => {
      const bld = this.buildings.find((b) => b.id === inv.buildingId);
      return {
        ...inv,
        createdByName: inv.createdByName || bld?.managerName || "Nguyễn Văn Hùng (Quản lý)",
      };
    });
  }

  public getInvoiceById(id: string): Invoice | undefined {
    const inv = this.invoices.find((i) => i.id === id);
    if (!inv) return undefined;
    const bld = this.buildings.find((b) => b.id === inv.buildingId);
    return {
      ...inv,
      createdByName: inv.createdByName || bld?.managerName || "Nguyễn Văn Hùng (Quản lý)",
    };
  }

  public createInvoice(data: {
    contractId: string;
    title?: string;
    periodMonth: number;
    periodYear: number;
    dueDate: string;
    notes?: string;
    selectedItems?: Array<{
      itemType: InvoiceItem["itemType"];
      description: string;
      quantity: number;
      unitPrice: number;
      amount: number;
      detailSnapshot?: any;
    }>;
  }, currentUser: User): Invoice {
    const contract = this.contracts.find((c) => c.id === data.contractId);
    if (!contract) throw new Error("Hợp đồng không tồn tại");

    // Prevent duplicate invoice for same contract and period
    const existing = this.invoices.find(
      (inv) =>
        inv.contractId === data.contractId &&
        inv.periodMonth === data.periodMonth &&
        inv.periodYear === data.periodYear &&
        inv.status !== "Đã hủy"
    );
    if (existing) {
      throw new Error(`Hóa đơn cho hợp đồng ${contract.contractCode} kỳ ${data.periodMonth}/${data.periodYear} đã tồn tại (Mã: ${existing.invoiceCode})`);
    }

    const apt = this.apartments.find((a) => a.id === contract.apartmentId);
    if (!apt) throw new Error("Phòng không tồn tại");

    const invId = `inv-${Date.now()}`;
    let items: InvoiceItem[] = [];

    if (data.selectedItems && data.selectedItems.length > 0) {
      items = data.selectedItems.map((si, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        invoiceId: invId,
        itemType: si.itemType,
        description: si.description,
        quantity: si.quantity,
        unitPrice: si.unitPrice,
        amount: si.amount,
        detailSnapshot: si.detailSnapshot,
      }));

      // Mark readings as invoiced if included
      const elecSelected = data.selectedItems.find((i) => i.itemType === "ELECTRICITY");
      if (elecSelected) {
        const elecReading = this.utilityReadings.find(
          (u) =>
            u.apartmentId === apt.id &&
            u.utilityType === "ELECTRICITY" &&
            u.periodMonth === data.periodMonth &&
            u.periodYear === data.periodYear
        );
        if (elecReading) elecReading.isInvoiced = true;
      }

      const waterSelected = data.selectedItems.find((i) => i.itemType === "WATER");
      if (waterSelected) {
        const waterReading = this.utilityReadings.find(
          (u) =>
            u.apartmentId === apt.id &&
            u.utilityType === "WATER" &&
            u.periodMonth === data.periodMonth &&
            u.periodYear === data.periodYear
        );
        if (waterReading) waterReading.isInvoiced = true;
      }
    } else {
      // Find electricity reading
      const elecReading = this.utilityReadings.find(
        (u) =>
          u.apartmentId === apt.id &&
          u.utilityType === "ELECTRICITY" &&
          u.periodMonth === data.periodMonth &&
          u.periodYear === data.periodYear
      );

      // Find water reading
      const waterReading = this.utilityReadings.find(
        (u) =>
          u.apartmentId === apt.id &&
          u.utilityType === "WATER" &&
          u.periodMonth === data.periodMonth &&
          u.periodYear === data.periodYear
      );

      // 1. Rent item
      items.push({
        id: `item-${Date.now()}-rent`,
        invoiceId: invId,
        itemType: "RENT",
        description: `Tiền thuê phòng P.${apt.roomCode} (Tháng ${data.periodMonth < 10 ? "0" + data.periodMonth : data.periodMonth}/${data.periodYear})`,
        quantity: 1,
        unitPrice: contract.rentPrice,
        amount: contract.rentPrice,
      });

      // 2. Electricity item
      if (elecReading) {
        items.push({
          id: `item-${Date.now()}-elec`,
          invoiceId: invId,
          itemType: "ELECTRICITY",
          description: `Tiền điện (Chỉ số: ${elecReading.previousIndex} -> ${elecReading.currentIndex} = ${elecReading.consumption} kWh x ${elecReading.unitPrice.toLocaleString("vi-VN")} ₫)`,
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
        elecReading.isInvoiced = true;
      }

      // 3. Water item
      if (waterReading) {
        items.push({
          id: `item-${Date.now()}-water`,
          invoiceId: invId,
          itemType: "WATER",
          description: `Tiền nước (Chỉ số: ${waterReading.previousIndex} -> ${waterReading.currentIndex} = ${waterReading.consumption} m³ x ${waterReading.unitPrice.toLocaleString("vi-VN")} ₫)`,
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
        waterReading.isInvoiced = true;
      }

      // 4. Building active fees snapshot
      const activeFees = this.fees.filter((f) => f.buildingId === apt.buildingId && f.isActive);
      activeFees.forEach((fee, idx) => {
        items.push({
          id: `item-${Date.now()}-fee-${idx}`,
          invoiceId: invId,
          itemType: "SERVICE_FEE",
          description: `${fee.name} (${fee.unitName})`,
          quantity: 1,
          unitPrice: fee.unitPrice,
          amount: fee.unitPrice,
        });
      });
    }

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    const newInvoice: Invoice = {
      id: invId,
      invoiceCode: `INV-${data.periodYear}${data.periodMonth < 10 ? "0" + data.periodMonth : data.periodMonth}-${apt.roomCode}`,
      title: data.title?.trim() || "HÓA ĐƠN TIỀN PHÒNG & TIỆN ÍCH",
      buildingId: apt.buildingId,
      buildingName: apt.buildingName,
      apartmentId: apt.id,
      apartmentCode: apt.roomCode,
      contractId: contract.id,
      residentId: contract.residentId,
      residentName: contract.residentName,
      residentPhone: contract.residentPhone,
      periodMonth: data.periodMonth,
      periodYear: data.periodYear,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: data.dueDate,
      totalAmount,
      paidAmount: 0,
      balanceRemaining: totalAmount,
      status: "Chưa thanh toán",
      isOverdue: false,
      items,
      payments: [],
      notes: data.notes || "Vui lòng thanh toán bằng hình thức quét mã QR SePay tự động.",
      createdById: currentUser.id,
      createdByName: currentUser.fullName,
      createdAt: new Date().toISOString(),
    };

    this.invoices.unshift(newInvoice);

    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "PHAT_HANH_HOA_DON",
      entityName: "Invoice",
      entityId: newInvoice.id,
      buildingId: apt.buildingId,
      buildingName: apt.buildingName,
      details: `Phát hành hóa đơn ${newInvoice.invoiceCode} cho P.${apt.roomCode} tổng tiền ${totalAmount.toLocaleString("vi-VN")} ₫`,
    });

    setStored("invoices", this.invoices);
    setStored("utilityReadings", this.utilityReadings);
    return newInvoice;
  }

  // --- SePay Payments & Webhook ---
  public getSePayTransactions(): SePayTransaction[] {
    return [...this.sepayTransactions];
  }

  /**
   * Process SePay Webhook Payload
   * Enforces idempotency, match by reference code, records payment, updates balance, handles over/under payment
   */
  public processSePayWebhook(payload: {
    gatewayTransactionId: string;
    referenceCode: string;
    amount: number;
    transferContent: string;
    bankBrandName: string;
    accountNumber: string;
  }): { status: string; message: string; payment?: Payment } {
    // 1. Idempotency check: duplicate gateway transaction
    const existingTx = this.sepayTransactions.find(
      (tx) => tx.gatewayTransactionId === payload.gatewayTransactionId
    );
    if (existingTx) {
      return { status: "ALREADY_PROCESSED", message: "Giao dịch đã được ghi nhận trước đó" };
    }

    // 2. Find matching invoice by reference code in transfer content
    // Format: STYHUB<AptCode> or invoice code
    const matchingInvoice = this.invoices.find((inv) => {
      if (inv.status === "Đã thanh toán" || inv.status === "Đã hủy") return false;
      const refToken = `STYHUB${inv.apartmentCode}`;
      const codeToken = inv.invoiceCode.replace(/-/g, "");
      const contentUpper = payload.transferContent.toUpperCase();
      return contentUpper.includes(refToken) || contentUpper.includes(codeToken) || payload.referenceCode === inv.invoiceCode;
    });

    if (!matchingInvoice) {
      // Unmatched transaction -> send to reconciliation queue
      const unMatchedTx: SePayTransaction = {
        id: `sep-tx-${Date.now()}`,
        gatewayTransactionId: payload.gatewayTransactionId,
        referenceCode: payload.referenceCode,
        amount: payload.amount,
        transferContent: payload.transferContent,
        bankBrandName: payload.bankBrandName,
        accountNumber: payload.accountNumber,
        transactionDate: new Date().toISOString(),
        status: "Sai mã / Hóa đơn đóng",
        notes: "Không tìm thấy hóa đơn mở khớp với nội dung chuyển khoản",
      };
      this.sepayTransactions.unshift(unMatchedTx);
      setStored("sepayTransactions", this.sepayTransactions);
      return { status: "UNMATCHED", message: "Không khớp hóa đơn, đã đưa vào danh sách đối soát" };
    }

    // 3. Process payment for matching invoice
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      invoiceId: matchingInvoice.id,
      transactionCode: payload.gatewayTransactionId,
      amount: payload.amount,
      paymentMethod: "SEPAY_QR",
      paymentDate: new Date().toISOString(),
      referenceCode: payload.referenceCode,
      bankName: payload.bankBrandName,
      accountNumber: payload.accountNumber,
      payerName: "Khách thuê SePay",
      status: "Thành công",
      notes: `Ghi nhận tự động từ SePay Webhook (${payload.transferContent})`,
    };

    matchingInvoice.payments.push(newPayment);
    matchingInvoice.paidAmount += payload.amount;
    matchingInvoice.balanceRemaining = Math.max(0, matchingInvoice.totalAmount - matchingInvoice.paidAmount);

    let txStatus: SePayTransaction["status"] = "Đã khớp";
    if (matchingInvoice.balanceRemaining === 0) {
      matchingInvoice.status = "Đã thanh toán";
      matchingInvoice.isOverdue = false;
      if (matchingInvoice.paidAmount > matchingInvoice.totalAmount) {
        txStatus = "Thanh toán thừa";
      }
    } else {
      matchingInvoice.status = "Thanh toán một phần";
      txStatus = "Thanh toán thiếu";
    }

    const recordedTx: SePayTransaction = {
      id: `sep-tx-${Date.now()}`,
      gatewayTransactionId: payload.gatewayTransactionId,
      referenceCode: payload.referenceCode,
      amount: payload.amount,
      transferContent: payload.transferContent,
      bankBrandName: payload.bankBrandName,
      accountNumber: payload.accountNumber,
      transactionDate: new Date().toISOString(),
      status: txStatus,
      matchedInvoiceId: matchingInvoice.id,
      matchedInvoiceCode: matchingInvoice.invoiceCode,
      reconciledBy: "Hệ thống tự động SePay",
      reconciledAt: new Date().toISOString(),
      notes: `Khớp thành công cho hóa đơn ${matchingInvoice.invoiceCode}`,
    };
    this.sepayTransactions.unshift(recordedTx);

    // Create delivery log for Zalo confirmation
    this.zaloRecords.unshift({
      id: `zns-${Date.now()}`,
      recipientPhone: matchingInvoice.residentPhone,
      recipientName: matchingInvoice.residentName,
      templateId: "ZNS_PAYMENT_SUCCESS_V1",
      templateName: "Xác nhận nhận tiền thanh toán thành công",
      eventName: "XAC_NHAN_THANH_TOAN",
      status: "Đã giao",
      retryCount: 0,
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    this.logAudit({
      userId: "usr-admin-1",
      userName: "Hệ thống SePay Webhook",
      userRole: "ADMIN",
      action: "GHI_NHAN_THANH_TOAN",
      entityName: "Invoice",
      entityId: matchingInvoice.id,
      buildingId: matchingInvoice.buildingId,
      buildingName: matchingInvoice.buildingName,
      details: `Nhận ${payload.amount.toLocaleString("vi-VN")} ₫ cho hóa đơn ${matchingInvoice.invoiceCode}. Số dư còn nợ: ${matchingInvoice.balanceRemaining.toLocaleString("vi-VN")} ₫`,
    });

    setStored("invoices", this.invoices);
    setStored("sepayTransactions", this.sepayTransactions);
    setStored("zaloRecords", this.zaloRecords);

    return { status: "SUCCESS", message: "Thanh toán đã được ghi nhận thành công", payment: newPayment };
  }

  public reconcileTransactionManually(
    transactionId: string,
    invoiceId: string,
    currentUser: User,
    notes?: string
  ): { success: boolean; message: string } {
    const tx = this.sepayTransactions.find((t) => t.id === transactionId);
    if (!tx) {
      throw new Error("Không tìm thấy giao dịch chuyển khoản");
    }

    const invoice = this.invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) {
      throw new Error("Không tìm thấy hóa đơn cần khớp");
    }

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      invoiceId: invoice.id,
      transactionCode: tx.gatewayTransactionId,
      amount: tx.amount,
      paymentMethod: "SEPAY_QR",
      paymentDate: new Date().toISOString(),
      referenceCode: tx.referenceCode,
      bankName: tx.bankBrandName,
      accountNumber: tx.accountNumber,
      payerName: tx.transferContent || currentUser.fullName,
      status: "Thành công",
      notes: notes || `Khớp thủ công bởi ${currentUser.fullName} (${currentUser.role})`,
    };

    if (!invoice.payments) invoice.payments = [];
    invoice.payments.push(newPayment);
    invoice.paidAmount += tx.amount;
    invoice.balanceRemaining = Math.max(0, invoice.totalAmount - invoice.paidAmount);

    let txStatus: SePayTransaction["status"] = "Đã khớp";
    if (invoice.balanceRemaining === 0) {
      invoice.status = "Đã thanh toán";
      invoice.isOverdue = false;
      if (invoice.paidAmount > invoice.totalAmount) {
        txStatus = "Thanh toán thừa";
      }
    } else {
      invoice.status = "Thanh toán một phần";
      txStatus = "Thanh toán thiếu";
    }

    tx.status = txStatus;
    tx.matchedInvoiceId = invoice.id;
    tx.matchedInvoiceCode = invoice.invoiceCode;
    tx.reconciledBy = `${currentUser.fullName} (${currentUser.role})`;
    tx.reconciledAt = new Date().toISOString();
    tx.notes = notes
      ? `Khớp thủ công vào HĐ ${invoice.invoiceCode}: ${notes}`
      : `Khớp thủ công vào HĐ ${invoice.invoiceCode} bởi ${currentUser.fullName}`;

    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "DOI_SOAT_THU_CONG",
      entityName: "Invoice",
      entityId: invoice.id,
      buildingId: invoice.buildingId,
      buildingName: invoice.buildingName,
      details: `Khớp thủ công giao dịch ${tx.gatewayTransactionId} (${tx.amount.toLocaleString("vi-VN")} ₫) vào hóa đơn ${invoice.invoiceCode}.`,
    });

    setStored("invoices", this.invoices);
    setStored("sepayTransactions", this.sepayTransactions);

    return {
      success: true,
      message: `Khớp thành công giao dịch ${tx.gatewayTransactionId} vào hóa đơn ${invoice.invoiceCode}.`,
    };
  }

  // --- Maintenance Requests ---
  public getMaintenanceRequests(filters?: {
    buildingId?: string;
    residentId?: string;
    staffId?: string;
    status?: string;
  }): MaintenanceRequest[] {
    let result = [...this.maintenanceRequests];
    if (filters?.buildingId && filters.buildingId !== "ALL") {
      result = result.filter((m) => m.buildingId === filters.buildingId);
    }
    if (filters?.residentId) {
      result = result.filter((m) => m.residentId === filters.residentId);
    }
    if (filters?.staffId) {
      result = result.filter((m) => m.assignedStaffId === filters.staffId);
    }
    if (filters?.status) {
      result = result.filter((m) => m.status === filters.status);
    }
    return result;
  }

  public createMaintenanceRequest(
    data: {
      apartmentId: string;
      assetId?: string;
      title: string;
      description: string;
      priority: MaintenanceRequest["priority"];
      images?: string[];
    },
    currentUser: User
  ): MaintenanceRequest {
    const apt = this.apartments.find((a) => a.id === data.apartmentId);
    if (!apt) throw new Error("Phòng không tồn tại");

    let assetName: string | undefined;
    if (data.assetId) {
      const asset = this.assets.find((ast) => ast.id === data.assetId);
      if (asset) assetName = asset.name;
    }

    const newReq: MaintenanceRequest = {
      id: `mr-${Date.now()}`,
      requestCode: `MR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      buildingId: apt.buildingId,
      buildingName: apt.buildingName,
      apartmentId: apt.id,
      apartmentCode: apt.roomCode,
      residentId: currentUser.residentId || "res-self",
      residentName: currentUser.fullName,
      residentPhone: currentUser.phoneNumber,
      assetId: data.assetId,
      assetName,
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: "Mới",
      images: data.images || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          id: `tml-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorName: currentUser.fullName,
          actorRole: currentUser.role,
          action: "Tạo yêu cầu sửa chữa",
          notes: data.description,
        },
      ],
    };

    this.maintenanceRequests.unshift(newReq);

    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "TAO_YEU_CAU_SUA_CHUA",
      entityName: "MaintenanceRequest",
      entityId: newReq.id,
      buildingId: apt.buildingId,
      buildingName: apt.buildingName,
      details: `Cư dân ${currentUser.fullName} gửi yêu cầu sửa chữa P.${apt.roomCode}: ${newReq.title}`,
    });

    // Auto-dispatch maintenance notification to Resident, Staff assigned to building, and Manager
    const residentsInBld = this.residents.filter((r) => r.currentBuildingId === apt.buildingId);
    const staffInBld = this.users.filter((u) => u.role === "STAFF" && u.assignedBuildingIds.includes(apt.buildingId));
    const managers = this.users.filter((u) => u.role === "MANAGER" || u.role === "ADMIN");

    const autoNotif: InAppNotification = {
      id: `notif-mr-create-${Date.now()}`,
      title: `[Sửa chữa mới] P.${apt.roomCode} - ${newReq.title}`,
      content: `Yêu cầu bảo hành & sửa chữa mới tại Phòng ${apt.roomCode} (${apt.buildingName}): "${newReq.title}". Mức độ: ${newReq.priority === "URGENT" ? "Khẩn cấp" : newReq.priority === "HIGH" ? "Cao" : "Bình thường"}. Đã gửi thông báo tới Cư dân, Nhân viên kỹ thuật quản lý tòa nhà và Quản lý.`,
      category: "MAINTENANCE",
      scope: "BUILDING",
      buildingId: apt.buildingId,
      buildingName: apt.buildingName,
      apartmentId: apt.id,
      apartmentCode: apt.roomCode,
      residentId: currentUser.residentId || "res-self",
      residentName: currentUser.fullName,
      authorName: currentUser.fullName,
      authorRole: currentUser.role,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      recipientCount: residentsInBld.length + staffInBld.length + managers.length,
      readByUserIds: [currentUser.id],
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(autoNotif);
    setStored("notifications", this.notifications);

    setStored("maintenanceRequests", this.maintenanceRequests);
    return newReq;
  }

  public assignMaintenanceStaff(
    requestId: string,
    staffId: string,
    notes: string,
    currentUser: User
  ): boolean {
    const req = this.maintenanceRequests.find((m) => m.id === requestId);
    if (!req) return false;

    const staff = this.users.find((u) => u.id === staffId);
    if (!staff) return false;

    req.status = "Đã phân công";
    req.assignedStaffId = staff.id;
    req.assignedStaffName = staff.fullName;
    req.updatedAt = new Date().toISOString();
    req.timeline.push({
      id: `tml-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: "Phân công kỹ thuật viên",
      notes: `Giao cho ${staff.fullName}. ${notes}`,
    });

    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "PHAN_CONG_SUA_CHUA",
      entityName: "MaintenanceRequest",
      entityId: req.id,
      buildingId: req.buildingId,
      details: `Phân công nhân viên ${staff.fullName} xử lý sự cố ${req.requestCode}`,
    });

    // Auto-dispatch assignment notification to Resident, Assigned Staff, and Manager
    const autoNotif: InAppNotification = {
      id: `notif-mr-assign-${Date.now()}`,
      title: `[Phân công sửa chữa] ${req.requestCode} - P.${req.apartmentCode}`,
      content: `Kỹ thuật viên ${staff.fullName} đã được phân công xử lý sự cố "${req.title}" tại Phòng ${req.apartmentCode} (${req.buildingName}). Ghi chú: ${notes || "Đang chuẩn bị trang thiết bị kiểm tra."}`,
      category: "MAINTENANCE",
      scope: "BUILDING",
      buildingId: req.buildingId,
      buildingName: req.buildingName,
      apartmentId: req.apartmentId,
      apartmentCode: req.apartmentCode,
      residentId: req.residentId,
      residentName: req.residentName,
      authorName: currentUser.fullName,
      authorRole: currentUser.role,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      recipientCount: 5,
      readByUserIds: [currentUser.id],
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(autoNotif);
    setStored("notifications", this.notifications);

    setStored("maintenanceRequests", this.maintenanceRequests);
    return true;
  }

  public updateMaintenanceStatus(
    requestId: string,
    newStatus: MaintenanceRequest["status"],
    notes: string,
    currentUser: User
  ): boolean {
    const req = this.maintenanceRequests.find((m) => m.id === requestId);
    if (!req) return false;

    req.status = newStatus;
    req.updatedAt = new Date().toISOString();
    if (newStatus === "Hoàn thành") {
      req.completionNotes = notes;
    }

    req.timeline.push({
      id: `tml-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: `Chuyển trạng thái: ${newStatus}`,
      notes,
    });

    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "CAP_NHAT_TIEN_DO_SUA_CHUA",
      entityName: "MaintenanceRequest",
      entityId: req.id,
      buildingId: req.buildingId,
      details: `Yêu cầu ${req.requestCode} chuyển sang: ${newStatus}. Ghi chú: ${notes}`,
    });

    // Auto-dispatch status update notification to Resident, Assigned Staff, and Manager
    const autoNotif: InAppNotification = {
      id: `notif-mr-status-${Date.now()}`,
      title: `[Tiến độ: ${newStatus}] ${req.requestCode} - P.${req.apartmentCode}`,
      content: `Yêu cầu bảo hành & sửa chữa "${req.title}" tại Phòng ${req.apartmentCode} (${req.buildingName}) đã được cập nhật sang trạng thái: "${newStatus}". Ghi chú: ${notes || "Đã kiểm tra vận hành tốt."}`,
      category: "MAINTENANCE",
      scope: "BUILDING",
      buildingId: req.buildingId,
      buildingName: req.buildingName,
      apartmentId: req.apartmentId,
      apartmentCode: req.apartmentCode,
      residentId: req.residentId,
      residentName: req.residentName,
      authorName: currentUser.fullName,
      authorRole: currentUser.role,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      recipientCount: 5,
      readByUserIds: [currentUser.id],
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(autoNotif);
    setStored("notifications", this.notifications);

    setStored("maintenanceRequests", this.maintenanceRequests);
    return true;
  }

  public sendMaintenanceBroadcastNotification(
    data: {
      buildingId: string;
      apartmentId?: string;
      title: string;
      content: string;
      isUrgent?: boolean;
    },
    currentUser: User
  ): InAppNotification {
    const building = this.buildings.find((b) => b.id === data.buildingId);
    let apartmentCode: string | undefined;
    let residentId: string | undefined;
    let residentName: string | undefined;

    if (data.apartmentId) {
      const apt = this.apartments.find((a) => a.id === data.apartmentId);
      if (apt) {
        apartmentCode = apt.roomCode;
        const res = this.residents.find((r) => r.currentApartmentId === apt.id);
        if (res) {
          residentId = res.id;
          residentName = res.fullName;
        }
      }
    }

    const residentsInBld = this.residents.filter((r) => r.currentBuildingId === data.buildingId);
    const staffInBld = this.users.filter((u) => u.role === "STAFF" && u.assignedBuildingIds.includes(data.buildingId));
    const managers = this.users.filter((u) => u.role === "MANAGER" || u.role === "ADMIN");

    const newNotif: InAppNotification = {
      id: `notif-mb-${Date.now()}`,
      title: data.title,
      content: data.content,
      category: "MAINTENANCE",
      scope: data.apartmentId ? "APARTMENT" : "BUILDING",
      buildingId: data.buildingId,
      buildingName: building?.name,
      apartmentId: data.apartmentId,
      apartmentCode,
      residentId,
      residentName,
      authorName: currentUser.fullName,
      authorRole: currentUser.role,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      recipientCount: data.apartmentId ? 1 + staffInBld.length + managers.length : residentsInBld.length + staffInBld.length + managers.length,
      readByUserIds: [currentUser.id],
      createdAt: new Date().toISOString(),
    };

    this.notifications.unshift(newNotif);

    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "PHAT_THONG_BAO_BAO_TRI",
      entityName: "InAppNotification",
      entityId: newNotif.id,
      buildingId: data.buildingId,
      details: `Gửi thông báo bảo hành & sửa chữa tới Cư dân, Nhân viên quản lý tòa nhà và Quản lý: "${newNotif.title}"`,
    });

    setStored("notifications", this.notifications);
    return newNotif;
  }

  // --- Visitor Registrations ---
  public getVisitors(filters?: { buildingId?: string; residentId?: string }): VisitorRegistration[] {
    let result = [...this.visitors];
    if (filters?.buildingId && filters.buildingId !== "ALL") {
      result = result.filter((v) => v.buildingId === filters.buildingId);
    }
    if (filters?.residentId) {
      result = result.filter((v) => v.residentId === filters.residentId);
    }
    return result;
  }

  public createVisitor(
    data: Omit<VisitorRegistration, "id" | "registrationCode" | "status" | "createdAt">,
    currentUser: User
  ): VisitorRegistration {
    const newVis: VisitorRegistration = {
      ...data,
      id: `vis-${Date.now()}`,
      registrationCode: `VIS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      status: "Chờ duyệt",
      createdAt: new Date().toISOString(),
    };

    this.visitors.unshift(newVis);

    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "DANG_KY_KHACH_THAM",
      entityName: "VisitorRegistration",
      entityId: newVis.id,
      buildingId: newVis.buildingId,
      details: `Đăng ký khách đến thăm: ${newVis.visitorName} ngày ${newVis.visitDate} tại P.${newVis.apartmentCode}`,
    });

    setStored("visitors", this.visitors);
    return newVis;
  }

  public reviewVisitor(
    visitorId: string,
    status: "Đã duyệt" | "Từ chối",
    reviewNotes: string,
    currentUser: User
  ): boolean {
    const vis = this.visitors.find((v) => v.id === visitorId);
    if (!vis) return false;

    vis.status = status;
    vis.reviewedBy = `${currentUser.fullName} (${currentUser.role})`;
    vis.reviewNotes = reviewNotes;

    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: status === "Đã duyệt" ? "DUYET_KHACH_THAM" : "TU_CHOI_KHACH_THAM",
      entityName: "VisitorRegistration",
      entityId: vis.id,
      buildingId: vis.buildingId,
      details: `${status === "Đã duyệt" ? "Duyệt" : "Từ chối"} khách thăm ${vis.visitorName}. Ghi chú: ${reviewNotes}`,
    });

    setStored("visitors", this.visitors);
    return true;
  }

  public updateTemporaryResidence(
    visitorId: string,
    data: {
      temporaryResidenceStatus: TemporaryResidenceStatus;
      temporaryResidenceCode?: string;
      temporaryResidenceNotes?: string;
    },
    currentUser: User
  ): boolean {
    const vis = this.visitors.find((v) => v.id === visitorId);
    if (!vis) return false;

    vis.temporaryResidenceStatus = data.temporaryResidenceStatus;
    if (data.temporaryResidenceCode !== undefined) vis.temporaryResidenceCode = data.temporaryResidenceCode;
    if (data.temporaryResidenceNotes !== undefined) vis.temporaryResidenceNotes = data.temporaryResidenceNotes;

    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "CAP_NHAT_TAM_TRU",
      entityName: "VisitorRegistration",
      entityId: vis.id,
      buildingId: vis.buildingId,
      details: `Cập nhật trạng thái tạm trú cho khách thăm ${vis.visitorName} (P.${vis.apartmentCode}): ${data.temporaryResidenceStatus}`,
    });

    setStored("visitors", this.visitors);
    return true;
  }

  public updateVisitorPayment(
    visitorId: string,
    data: {
      feePaymentStatus: "Chưa thanh toán" | "Đã thanh toán";
      paymentMethod?: "SEPAY_QR" | "INCLUDE_IN_INVOICE" | "CASH";
      transactionRef?: string;
    },
    currentUser: User
  ): boolean {
    const vis = this.visitors.find((v) => v.id === visitorId);
    if (!vis) return false;

    vis.feePaymentStatus = data.feePaymentStatus;
    if (data.paymentMethod) vis.paymentMethod = data.paymentMethod;
    if (data.transactionRef) vis.transactionRef = data.transactionRef;
    if (data.feePaymentStatus === "Đã thanh toán") {
      vis.paidAt = new Date().toISOString();
    }

    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "THANH_TOAN_PHI_KHACH_THAM",
      entityName: "VisitorRegistration",
      entityId: vis.id,
      buildingId: vis.buildingId,
      details: `Cập nhật thanh toán phí khách qua đêm cho ${vis.visitorName}: ${data.feePaymentStatus} (${data.paymentMethod || "SEPAY_QR"})`,
    });

    setStored("visitors", this.visitors);
    return true;
  }

  // --- Notifications & Zalo ---
  public getNotifications(user?: User): InAppNotification[] {
    if (!user) return [...this.notifications];
    if (user.role === "ADMIN" || user.role === "MANAGER") return [...this.notifications];

    if (user.role === "RESIDENT") {
      return this.notifications.filter((n) => {
        if (!n.isPublished) return false;
        if (n.scope === "ALL") return true;
        if (n.scope === "BUILDING" && user.assignedBuildingIds.includes(n.buildingId || "")) return true;
        if (n.scope === "RESIDENT" && n.residentId === user.residentId) return true;
        return false;
      });
    }

    // MANAGER / STAFF
    return this.notifications.filter((n) => {
      if (n.scope === "ALL") return true;
      if (n.buildingId && user.assignedBuildingIds.includes(n.buildingId)) return true;
      return false;
    });
  }

  public createNotification(
    data: Omit<InAppNotification, "id" | "authorName" | "authorRole" | "createdAt" | "readByUserIds">,
    currentUser: User
  ): InAppNotification {
    const newNotif: InAppNotification = {
      ...data,
      id: `notif-${Date.now()}`,
      authorName: currentUser.fullName,
      authorRole: currentUser.role,
      readByUserIds: [],
      createdAt: new Date().toISOString(),
    };

    this.notifications.unshift(newNotif);

    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "TAO_THONG_BAO",
      entityName: "InAppNotification",
      entityId: newNotif.id,
      buildingId: newNotif.buildingId,
      details: `Tạo thông báo: "${newNotif.title}" (Phạm vi: ${newNotif.scope})`,
    });

    setStored("notifications", this.notifications);
    return newNotif;
  }

  public markNotificationAsRead(notificationId: string, userId: string): void {
    const notif = this.notifications.find((n) => n.id === notificationId);
    if (notif && !notif.readByUserIds.includes(userId)) {
      notif.readByUserIds.push(userId);
      setStored("notifications", this.notifications);
    }
  }

  public getZaloRecords(): ZaloDeliveryRecord[] {
    return [...this.zaloRecords];
  }

  // --- System Configuration, Roles & Governance (Admin Only) ---
  public getSystemSettings(): SystemSettings {
    return { ...this.systemSettings };
  }

  public updateSystemSettings(updates: Partial<SystemSettings>, currentUser: User): SystemSettings {
    this.systemSettings = { ...this.systemSettings, ...updates };
    setStored("systemSettings", this.systemSettings);
    this.logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: "CAP_NHAT_CAU_HINH",
      entityName: "SystemSettings",
      entityId: "system-config",
      details: `Cập nhật cấu hình hệ thống: [${Object.keys(updates).join(", ")}]`,
    });
    return { ...this.systemSettings };
  }

  public getRolePermissionsMatrix(): RolePermissionMatrixItem[] {
    return [...initialRolePermissionsMatrix];
  }

  public getSystemHealth() {
    const dataSizeApprox = JSON.stringify({
      users: this.users,
      buildings: this.buildings,
      apartments: this.apartments,
      invoices: this.invoices,
      auditLogs: this.auditLogs,
      settings: this.systemSettings,
    }).length;

    const activeUsers = this.users.filter((u) => u.isActive).length;
    const lockedUsers = this.users.filter((u) => !u.isActive).length;

    return {
      status: "HEALTHY",
      uptime: "99.98%",
      serverTime: new Date().toISOString(),
      activeUsers,
      lockedUsers,
      totalUsers: this.users.length,
      totalBuildings: this.buildings.length,
      totalApartments: this.apartments.length,
      totalInvoices: this.invoices.length,
      totalAuditLogs: this.auditLogs.length,
      storageUsedKb: Math.round(dataSizeApprox / 1024),
      sepayStatus: {
        online: true,
        latencyMs: 38,
        webhookActive: true,
        lastSynced: new Date().toISOString(),
      },
      zaloStatus: {
        online: true,
        latencyMs: 52,
        quotaRemaining: "4,820 / 5,000 ZNS",
        lastSent: new Date().toISOString(),
      },
    };
  }

  public backupData(): string {
    const backupObj = {
      exportVersion: "1.0",
      exportDate: new Date().toISOString(),
      settings: this.systemSettings,
      users: this.users,
      buildings: this.buildings,
      apartments: this.apartments,
      assets: this.assets,
      contracts: this.contracts,
      residents: this.residents,
      fees: this.fees,
      utilityReadings: this.utilityReadings,
      invoices: this.invoices,
      maintenanceRequests: this.maintenanceRequests,
      visitors: this.visitors,
      notifications: this.notifications,
      auditLogs: this.auditLogs,
      sepayTransactions: this.sepayTransactions,
      zaloRecords: this.zaloRecords,
    };
    return JSON.stringify(backupObj, null, 2);
  }

  public restoreData(jsonString: string, currentUser: User): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.users) this.users = data.users;
      if (data.buildings) this.buildings = data.buildings;
      if (data.apartments) this.apartments = data.apartments;
      if (data.assets) this.assets = data.assets;
      if (data.contracts) this.contracts = data.contracts;
      if (data.residents) this.residents = data.residents;
      if (data.fees) this.fees = data.fees;
      if (data.utilityReadings) this.utilityReadings = data.utilityReadings;
      if (data.invoices) this.invoices = data.invoices;
      if (data.maintenanceRequests) this.maintenanceRequests = data.maintenanceRequests;
      if (data.visitors) this.visitors = data.visitors;
      if (data.notifications) this.notifications = data.notifications;
      if (data.auditLogs) this.auditLogs = data.auditLogs;
      if (data.settings) this.systemSettings = data.settings;
      this.persistAll();
      this.logAudit({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: "KHOI_PHUC_DU_LIEU",
        entityName: "System",
        entityId: "backup-restore",
        details: `Khôi phục toàn bộ dữ liệu từ bản sao lưu JSON`,
      });
      return true;
    } catch (e) {
      console.error("Failed to restore backup:", e);
      return false;
    }
  }
}

export const storageService = new StayHubStorageService();
