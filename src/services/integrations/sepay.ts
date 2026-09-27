export interface SePayQRInfo {
  bankId: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  amount: number;
  transferContent: string;
  qrImageUrl: string;
}

export interface SePayWebhookPayload {
  id: number;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  code: string | null;
  content: string;
  transferType: "in" | "out";
  transferAmount: number;
  accumulated: number;
  subAccount: string | null;
  referenceCode: string;
  description: string;
}

export const SEPAY_CONFIG = {
  BANK_ID: "MBBank",
  BANK_NAME: "Ngân hàng Quân Đội (MBBank)",
  ACCOUNT_NUMBER: "0908889999",
  ACCOUNT_HOLDER: "CTY TNHH QUAN LY STAYHUB",
  WEBHOOK_ENDPOINT: "/api/sepay/webhook",
  TOKEN_MASKED: "sep_sec_live_********************",
};

/**
 * Generate standard VietQR URL and transfer metadata for an invoice
 */
export function generateSePayQR(params: {
  apartmentCode: string;
  invoiceCode: string;
  amount: number;
}): SePayQRInfo {
  // Transfer content standard: STYHUB<RoomCode>
  const transferContent = `STYHUB${params.apartmentCode.replace(/[^a-zA-Z0-9]/g, "")}`;
  const encodedContent = encodeURIComponent(transferContent);
  const encodedName = encodeURIComponent(SEPAY_CONFIG.ACCOUNT_HOLDER);

  const qrImageUrl = `https://img.vietqr.io/image/MB-${SEPAY_CONFIG.ACCOUNT_NUMBER}-compact2.png?amount=${params.amount}&addInfo=${encodedContent}&accountName=${encodedName}`;

  return {
    bankId: SEPAY_CONFIG.BANK_ID,
    bankName: SEPAY_CONFIG.BANK_NAME,
    accountNumber: SEPAY_CONFIG.ACCOUNT_NUMBER,
    accountHolder: SEPAY_CONFIG.ACCOUNT_HOLDER,
    amount: params.amount,
    transferContent,
    qrImageUrl,
  };
}
