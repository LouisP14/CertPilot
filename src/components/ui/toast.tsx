"use client";

import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

let toastIdCounter = 0;
const listeners = new Set<(toasts: Toast[]) => void>();
let toasts: Toast[] = [];

function emit() {
  listeners.forEach((listener) => listener([...toasts]));
}

export const toast = {
  success: (title: string, message?: string, duration = 5000) => {
    const id = `toast-${++toastIdCounter}`;
    toasts.push({ id, type: "success", title, message, duration });
    emit();
    if (duration > 0) {
      setTimeout(() => toast.dismiss(id), duration);
    }
  },
  error: (title: string, message?: string, duration = 7000) => {
    const id = `toast-${++toastIdCounter}`;
    toasts.push({ id, type: "error", title, message, duration });
    emit();
    if (duration > 0) {
      setTimeout(() => toast.dismiss(id), duration);
    }
  },
  warning: (title: string, message?: string, duration = 6000) => {
    const id = `toast-${++toastIdCounter}`;
    toasts.push({ id, type: "warning", title, message, duration });
    emit();
    if (duration > 0) {
      setTimeout(() => toast.dismiss(id), duration);
    }
  },
  info: (title: string, message?: string, duration = 5000) => {
    const id = `toast-${++toastIdCounter}`;
    toasts.push({ id, type: "info", title, message, duration });
    emit();
    if (duration > 0) {
      setTimeout(() => toast.dismiss(id), duration);
    }
  },
  dismiss: (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  },
};

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    listeners.add(setCurrentToasts);
    return () => {
      clearTimeout(timer);
      listeners.delete(setCurrentToasts);
    };
  }, []);

  // Ne rien rendre côté serveur
  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-9999 flex flex-col gap-2 pointer-events-none">
      {currentToasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

function ToastItem({ toast: t }: { toast: Toast }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => toast.dismiss(t.id), 300);
  };

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
    error: <XCircle className="h-5 w-5 text-red-600" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-600" />,
    info: <Info className="h-5 w-5 text-[#173B56]" />,
  };

  const colors = {
    success: "bg-emerald-50 border-emerald-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-amber-50 border-amber-200",
    info: "bg-[#173B56]/5 border-[#173B56]/20",
  };

  const textColors = {
    success: "text-emerald-900",
    error: "text-red-900",
    warning: "text-amber-900",
    info: "text-[#173B56]",
  };

  return (
    <div
      className={`pointer-events-auto flex w-96 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-2xl border p-4 shadow-xl transition-all duration-300 ${
        colors[t.type]
      } ${
        isExiting
          ? "translate-x-[calc(100%+2rem)] opacity-0"
          : "translate-x-0 opacity-100"
      }`}
    >
      <div className="shrink-0 mt-0.5">{icons[t.type]}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={`font-semibold ${textColors[t.type]}`}>{t.title}</p>
            {t.message && (
              <p className={`text-sm mt-1 ${textColors[t.type]} opacity-80`}>
                {t.message}
              </p>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className={`shrink-0 rounded-lg p-1.5 transition-colors hover:bg-black/5 ${textColors[t.type]}`}
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
