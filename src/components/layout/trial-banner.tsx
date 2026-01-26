"use client";

import { AlertTriangle, Clock, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface TrialBannerProps {
  daysRemaining: number;
}

export function TrialBanner({ daysRemaining }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const isUrgent = daysRemaining <= 3;
  const Icon = isUrgent ? AlertTriangle : Clock;

  return (
    <div
      className={`flex items-center justify-between px-4 py-2 text-sm ${
        isUrgent
          ? "bg-amber-50 text-amber-800 border-b border-amber-200"
          : "bg-blue-50 text-blue-800 border-b border-blue-200"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span>
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
        <span className="hidden sm:inline">·</span>
        <Link
          href="/dashboard/settings?tab=subscription"
          className={`hidden sm:inline font-medium underline hover:no-underline ${
            isUrgent ? "text-amber-900" : "text-blue-900"
          }`}
        >
          Voir les offres
        </Link>
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
  );
}
