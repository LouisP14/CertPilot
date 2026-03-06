"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-bold text-slate-900">
          Erreur de chargement
        </h2>
        <p className="mb-6 text-sm text-slate-600">
          Une erreur est survenue lors du chargement de cette page. Veuillez
          réessayer.
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-[#173B56] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1e4d6e]"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
