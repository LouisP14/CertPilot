import {
  CertificateStatus,
  cn,
  getStatusColor,
  getStatusIcon,
  getStatusLabel,
} from "@/lib/utils";

interface BadgeProps {
  status: CertificateStatus;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  showIcon = true,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        getStatusColor(status),
        className,
      )}
    >
      {showIcon && <span>{getStatusIcon(status)}</span>}
      {getStatusLabel(status)}
    </span>
  );
}

interface SimpleBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "success" | "warning" | "danger";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: SimpleBadgeProps) {
  const variants = {
    default: "bg-blue-100 text-blue-800 border-blue-200",
    secondary: "bg-gray-100 text-gray-800 border-gray-200",
    success: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    danger: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
