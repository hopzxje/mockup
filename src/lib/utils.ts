import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency to VND standard: e.g. 3.500.000 ₫
 */
export function formatCurrencyVND(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount).replace("VND", "₫").trim();
}

/**
 * Format date to dd/MM/yyyy (Asia/Ho_Chi_Minh business timezone)
 */
export function formatDateVN(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "--/--/----";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "--/--/----";
  
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}

/**
 * Format date and time to dd/MM/yyyy HH:mm
 */
export function formatDateTimeVN(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "--/--/---- --:--";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "--/--/---- --:--";
  
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}

/**
 * Mask National ID (CCCD) for privacy: e.g. 079198123456 -> 079***3456
 */
export function maskCCCD(cccd: string | null | undefined): string {
  if (!cccd) return "---";
  if (cccd.length < 8) return cccd;
  return `${cccd.slice(0, 3)}***${cccd.slice(-4)}`;
}

/**
 * Mask Phone number: e.g. 0901234567 -> 090***4567
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "---";
  if (phone.length < 7) return phone;
  return `${phone.slice(0, 3)}***${phone.slice(-4)}`;
}
