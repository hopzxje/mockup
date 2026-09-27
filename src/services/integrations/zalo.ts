export interface ZnsTemplateDefinition {
  id: string;
  name: string;
  description: string;
  requiredParameters: string[];
}

export const ZALO_OA_CONFIG = {
  OA_ID: "2984102938472910",
  OA_NAME: "StayHub Living Support",
  APP_ID: "482019284719284",
  SECRET_MASKED: "zalo_sec_********************",
  STATUS: "ACTIVE_VERIFIED",
};

export const ZNS_TEMPLATES: Record<string, ZnsTemplateDefinition> = {
  ZNS_INVOICE_ISSUED_V1: {
    id: "ZNS_INVOICE_ISSUED_V1",
    name: "Thông báo phát hành hóa đơn",
    description: "Gửi tự động khi Quản lý xuất hóa đơn tiền phòng & điện nước",
    requiredParameters: ["customer_name", "room_code", "period", "total_amount", "due_date"],
  },
  ZNS_PAYMENT_SUCCESS_V1: {
    id: "ZNS_PAYMENT_SUCCESS_V1",
    name: "Biên nhận thanh toán thành công",
    description: "Gửi tự động khi SePay webhook khớp thanh toán",
    requiredParameters: ["customer_name", "room_code", "amount_paid", "balance_remaining", "transaction_code"],
  },
  ZNS_OVERDUE_REMINDER_V1: {
    id: "ZNS_OVERDUE_REMINDER_V1",
    name: "Nhắc nợ hóa đơn quá hạn",
    description: "Gửi định kỳ cho các hóa đơn quá hạn thanh toán",
    requiredParameters: ["customer_name", "room_code", "balance_due", "days_overdue"],
  },
  ZNS_MAINTENANCE_UPDATE_V1: {
    id: "ZNS_MAINTENANCE_UPDATE_V1",
    name: "Cập nhật tiến độ sửa chữa",
    description: "Thông báo khi nhân viên kỹ thuật bắt đầu xử lý hoặc hoàn thành",
    requiredParameters: ["customer_name", "room_code", "request_title", "status_text"],
  },
};
