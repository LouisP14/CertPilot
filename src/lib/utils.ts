import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateInput(date: Date | string | null): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

export type CertificateStatus = "valid" | "expiring" | "expired" | "no-expiry";

export function getCertificateStatus(
  expiryDate: Date | null,
  alertThresholds: number[] = [90, 60, 30, 7],
): CertificateStatus {
  if (!expiryDate) return "no-expiry";

  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysUntilExpiry < 0) return "expired";
  if (daysUntilExpiry <= Math.max(...alertThresholds)) return "expiring";
  return "valid";
}

export function getDaysUntilExpiry(expiryDate: Date | null): number | null {
  if (!expiryDate) return null;
  const now = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function getStatusColor(status: CertificateStatus): string {
  switch (status) {
    case "valid":
      return "bg-green-100 text-green-800 border-green-200";
    case "expiring":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "expired":
      return "bg-red-100 text-red-800 border-red-200";
    case "no-expiry":
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export function getStatusIcon(status: CertificateStatus): string {
  switch (status) {
    case "valid":
      return "✅";
    case "expiring":
      return "⚠️";
    case "expired":
      return "❌";
    case "no-expiry":
      return "∞";
  }
}

export function getStatusLabel(status: CertificateStatus): string {
  switch (status) {
    case "valid":
      return "Valide";
    case "expiring":
      return "Expire bientôt";
    case "expired":
      return "Expiré";
    case "no-expiry":
      return "Sans expiration";
  }
}
