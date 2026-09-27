export type UserRole = "ADMIN" | "MANAGER" | "STAFF" | "RESIDENT";

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  isActive: boolean;
  assignedBuildingIds: string[];
  avatarUrl?: string;
  residentId?: string;
  createdAt: string;
}

export interface Building {
  id: string;
  code: string;
  name: string;
  address: string;
  totalFloors: number;
  totalRooms: number;
  managerId: string;
  managerName: string;
  description: string;
  isActive: boolean;
  deletedAt?: string;
  deletedBy?: string;
  deleteReason?: string;
  createdAt: string;
}

export type ApartmentStatus = "Trống" | "Đã giữ chỗ" | "Đang thuê" | "Bảo trì" | "Ngừng sử dụng";

export interface Apartment {
  id: string;
  buildingId: string;
  buildingName: string;
  roomCode: string;
  floor: number;
  areaSqm: number;
  referencePrice: number;
  currentPrice: number;
  status: ApartmentStatus;
  description: string;
  currentContractId?: string;
  currentResidentId?: string;
  currentResidentName?: string;
  assetCount?: number;
  // Bắt buộc: ID công tơ điện và đồng hồ nước của phòng
  electricityMeterCode: string;
  waterMeterCode: string;
  initialElectricityIndex?: number;
  initialWaterIndex?: number;
  createdAt: string;
}

export interface AssetType {
  id: string;
  code: string;
  name: string;
  defaultLifeMonths: number;
  unit: string;
  description: string;
}

export type AssetCondition = "Tốt" | "Hư hỏng" | "Đang sửa" | "Ngừng sử dụng";

export interface AssetConditionLog {
  id: string;
  assetId: string;
  previousCondition: AssetCondition;
  newCondition: AssetCondition;
  updatedBy: string;
  notes: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  apartmentId: string;
  apartmentCode: string;
  buildingId: string;
  assetTypeId: string;
  assetTypeName: string;
  name: string;
  code: string;
  serialNumber: string;
  condition: AssetCondition;
  installedDate: string;
  lastCheckedAt: string;
  lastUpdatedBy: string;
  notes?: string;
  history?: AssetConditionLog[];
}

export interface CoResident {
  id: string;
  fullName: string;
  nationalId: string;
  phoneNumber: string;
  relationship: string;
  dateOfBirth?: string;
}

export interface Resident {
  id: string;
  userId: string;
  fullName: string;
  nationalId: string; // CCCD
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  hometown: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  status: "Đang thuê" | "Đã chuyển đi" | "Chờ nhận phòng";
  currentApartmentId?: string;
  currentApartmentCode?: string;
  currentBuildingId?: string;
  currentBuildingName?: string;
  currentContractId?: string;
  coResidents?: CoResident[];
  checkedInAt?: string;
  checkedOutAt?: string;
  createdAt: string;
}

export type ContractStatus = "Nháp" | "Chờ duyệt" | "Đã duyệt" | "Đang hiệu lực" | "Hết hạn" | "Đã chấm dứt";

export interface RentalContract {
  id: string;
  contractCode: string;
  buildingId: string;
  buildingName: string;
  apartmentId: string;
  apartmentCode: string;
  residentId: string;
  residentName: string;
  residentPhone: string;
  residentNationalId: string;
  coResidents: CoResident[];
  startDate: string;
  endDate: string;
  rentPrice: number;
  depositAmount: number;
  paymentCycleMonths: number;
  terms: string;
  status: ContractStatus;
  rejectionReason?: string;
  terminationReason?: string;
  terminatedAt?: string;
  depositRefunded?: number;
  depositDeducted?: number;
  createdBy: string;
  approvedBy?: string;
  renewedFromContractId?: string;
  createdAt: string;
  updatedAt: string;
}

export type FeeCalculationType = "PER_ROOM" | "PER_PERSON" | "PER_CONSUMPTION";

export interface Fee {
  id: string;
  buildingId: string;
  buildingName: string;
  name: string;
  code: string;
  calculationType: FeeCalculationType;
  unitPrice: number;
  unitName: string;
  isActive: boolean;
  effectiveDate: string;
  description: string;
}

export type UtilityType = "ELECTRICITY" | "WATER";

export interface UtilityReading {
  id: string;
  buildingId: string;
  buildingName: string;
  apartmentId: string;
  apartmentCode: string;
  utilityType: UtilityType;
  periodMonth: number;
  periodYear: number;
  previousIndex: number;
  currentIndex: number;
  consumption: number;
  unitPrice: number;
  totalAmount: number;
  recordedBy: string;
  recordedAt: string;
  isInvoiced: boolean;
  meterCode?: string;
  notes?: string;
}

export type InvoiceStatus = "Nháp" | "Chưa thanh toán" | "Thanh toán một phần" | "Đã thanh toán" | "Đã hủy";

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  itemType: "RENT" | "ELECTRICITY" | "WATER" | "SERVICE_FEE" | "OTHER";
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  detailSnapshot?: Record<string, any>;
}

export interface Payment {
  id: string;
  invoiceId: string;
  transactionCode: string;
  amount: number;
  paymentMethod: "SEPAY_QR" | "BANK_TRANSFER" | "CASH";
  paymentDate: string;
  referenceCode: string;
  bankName: string;
  accountNumber: string;
  payerName: string;
  status: "Thành công" | "Chờ xử lý" | "Hủy";
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceCode: string;
  buildingId: string;
  buildingName: string;
  apartmentId: string;
  apartmentCode: string;
  title?: string;
  contractId: string;
  residentId: string;
  residentName: string;
  residentPhone: string;
  periodMonth: number;
  periodYear: number;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balanceRemaining: number;
  status: InvoiceStatus;
  isOverdue: boolean;
  items: InvoiceItem[];
  payments: Payment[];
  notes?: string;
  createdById?: string;
  createdByName?: string;
  createdAt: string;
}

export type MaintenancePriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type MaintenanceStatus = "Mới" | "Đã phân công" | "Đang xử lý" | "Hoàn thành" | "Hủy";

export interface MaintenanceTimeline {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  notes?: string;
}

export interface MaintenanceRequest {
  id: string;
  requestCode: string;
  buildingId: string;
  buildingName: string;
  apartmentId: string;
  apartmentCode: string;
  residentId: string;
  residentName: string;
  residentPhone: string;
  assetId?: string;
  assetName?: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  images: string[];
  completionNotes?: string;
  createdAt: string;
  updatedAt: string;
  timeline: MaintenanceTimeline[];
}

export type VisitorStatus = "Chờ duyệt" | "Đã duyệt" | "Từ chối";
export type VisitorStayType = "DAY" | "OVERNIGHT";
export type TemporaryResidenceStatus = "NOT_APPLICABLE" | "CHUA_DANG_KY" | "DA_NOP_HO_SO" | "DA_HOAN_TAT";

export interface VisitorRegistration {
  id: string;
  registrationCode: string;
  buildingId: string;
  buildingName: string;
  apartmentId: string;
  apartmentCode: string;
  residentId: string;
  residentName: string;
  residentPhone: string;
  visitorName: string;
  visitorIdNumber: string; // CCCD
  visitorPhone: string;
  visitDate: string;
  expectedArrival: string;
  expectedDeparture: string;
  purpose: string;
  status: VisitorStatus;

  // Overnight & Temporary Residence Registration
  stayType?: VisitorStayType;
  isOvernight?: boolean;
  leaveDate?: string;
  stayNights?: number;

  // Detailed info for temporary residence registration
  visitorDob?: string;
  visitorGender?: "Nam" | "Nữ" | "Khác";
  visitorNationality?: string;
  visitorIdIssueDate?: string;
  visitorIdIssuePlace?: string;
  visitorPermanentAddress?: string;
  relationshipWithResident?: string;
  idCardFrontImage?: string;
  idCardBackImage?: string;

  // Temporary Residence filing
  temporaryResidenceStatus?: TemporaryResidenceStatus;
  temporaryResidenceCode?: string;
  temporaryResidenceNotes?: string;

  // Fee for overnight stay & registration
  overnightFee?: number;
  feePaymentStatus?: "Chưa thanh toán" | "Đã thanh toán";
  paymentMethod?: "SEPAY_QR" | "INCLUDE_IN_INVOICE" | "CASH";
  paidAt?: string;
  transactionRef?: string;

  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: string;
}

export type NotificationScope = "ALL" | "BUILDING" | "APARTMENT" | "RESIDENT";
export type NotificationCategory = "GENERAL" | "MAINTENANCE" | "INVOICE" | "SECURITY" | "POLICY";

export interface InAppNotification {
  id: string;
  title: string;
  content: string;
  category?: NotificationCategory;
  scope: NotificationScope;
  buildingId?: string;
  buildingName?: string;
  apartmentId?: string;
  apartmentCode?: string;
  residentId?: string;
  residentName?: string;
  authorName: string;
  authorRole: UserRole;
  isPublished: boolean;
  publishedAt?: string;
  recipientCount: number;
  readByUserIds: string[];
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityName: string;
  entityId: string;
  buildingId?: string;
  buildingName?: string;
  details: string;
  ipAddress: string;
}

export interface SePayTransaction {
  id: string;
  gatewayTransactionId: string;
  referenceCode: string;
  amount: number;
  transferContent: string;
  bankBrandName: string;
  accountNumber: string;
  transactionDate: string;
  status: "Đã khớp" | "Chờ đối soát" | "Thanh toán thiếu" | "Thanh toán thừa" | "Sai mã / Hóa đơn đóng";
  matchedInvoiceId?: string;
  matchedInvoiceCode?: string;
  reconciledBy?: string;
  reconciledAt?: string;
  notes?: string;
}

export interface ZaloDeliveryRecord {
  id: string;
  recipientPhone: string;
  recipientName: string;
  templateId: string;
  templateName: string;
  eventName: string;
  status: "Đang chờ" | "Đã tiếp nhận" | "Đã giao" | "Thất bại";
  errorMessage?: string;
  retryCount: number;
  sentAt?: string;
  createdAt: string;
}

export interface SystemSettings {
  brandName: string;
  slogan: string;
  companyName: string;
  hotline: string;
  supportEmail: string;
  address: string;
  currency: string;
  timezone: string;
  // SePay Integration
  sepayApiKey: string;
  sepayAccountNumber: string;
  sepayBankBrand: string;
  sepayWebhookSecret: string;
  sepayAutoReconcile: boolean;
  // Zalo ZNS Integration
  zaloOaId: string;
  zaloAppId: string;
  zaloSecretKey: string;
  zaloAutoNotifyInvoice: boolean;
  zaloAutoNotifyMaintenance: boolean;
  // System Security & Operation
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  auditLogRetentionDays: number;
  maintenanceMode: boolean;
}

export interface RolePermissionMatrixItem {
  id: string;
  moduleGroup: "Tài khoản & Phân quyền" | "Cấu hình & Giám sát" | "Vận hành Cơ sở & Cư dân" | "Tài chính & Thu phí" | "Kỹ thuật & Dịch vụ";
  name: string;
  description: string;
  admin: boolean;
  manager: boolean;
  staff: boolean;
  resident: boolean;
}
