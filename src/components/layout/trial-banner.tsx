"use client";

import { AlertTriangle, Clock, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface TrialBannerProps {
  daysRemaining: number;
  trialDays?: number;
}

export function TrialBanner({
  daysRemaining,
  trialDays = 14,
}: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const isUrgent = daysRemaining <= 3;
  const Icon = isUrgent ? AlertTriangle : Clock;
  const progress = Math.max(
    0,
    Math.min(100, ((trialDays - daysRemaining) / trialDays) * 100),
  );

  return (
    <div
      className={`border-b px-4 py-2.5 ${
        isUrgent
          ? "bg-amber-50 text-amber-800 border-amber-200"
          : "bg-blue-50 text-blue-800 border-blue-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4 shrink-0" />
          <span className="text-sm">
            {daysRemaining === 0 ? (
              <strong>Dernier jour d&apos;essai gratuit !</strong>
            ) : daysRemaining === 1 ? (
              <strong>Plus qu&apos;1 jour d&apos;essai gratuit</strong>
            ) : (
              <>
                <strong>{daysRemaining} jours</strong> restants sur votre essai
                gratuit
              </>
            )}
          </span>

          {/* Progress bar */}
          <div
            className={`hidden h-2 w-32 overflow-hidden rounded-full sm:block ${
              isUrgent ? "bg-amber-200" : "bg-blue-200"
            }`}
          >
            <div
              className={`h-full rounded-full transition-all ${
                isUrgent ? "bg-amber-500" : "bg-blue-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/settings?tab=subscription"
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
              isUrgent
                ? "bg-amber-600 text-white hover:bg-amber-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Choisir un forfait
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className={`rounded p-1 transition-colors ${
              isUrgent
                ? "hover:bg-amber-200 text-amber-600"
                : "hover:bg-blue-200 text-blue-600"
            }`}
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
