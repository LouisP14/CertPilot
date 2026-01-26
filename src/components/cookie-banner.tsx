"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Vérifier si le consentement a déjà été donné
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Afficher la bannière après un court délai
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem(
      "cookie-consent",
      JSON.stringify({
        necessary: true,
        preferences: true,
        analytics: true,
        timestamp: new Date().toISOString(),
      }),
    );
    setIsVisible(false);
  };

  const acceptNecessaryOnly = () => {
    localStorage.setItem(
      "cookie-consent",
      JSON.stringify({
        necessary: true,
        preferences: false,
        analytics: false,
        timestamp: new Date().toISOString(),
      }),
    );
    setIsVisible(false);
  };

  const savePreferences = (preferences: boolean, analytics: boolean) => {
    localStorage.setItem(
      "cookie-consent",
      JSON.stringify({
        necessary: true,
        preferences,
        analytics,
        timestamp: new Date().toISOString(),
      }),
    );
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
          {/* Main banner */}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#173B56]">
                  🍪 Nous utilisons des cookies
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Nous utilisons des cookies pour améliorer votre expérience sur
                  notre site, analyser notre trafic et personnaliser le contenu.
                  En cliquant sur &quot;Tout accepter&quot;, vous consentez à
                  l&apos;utilisation de tous les cookies.{" "}
                  <Link
                    href="/legal/cookies"
                    className="text-emerald-600 hover:underline"
                  >
                    En savoir plus
                  </Link>
                </p>
              </div>
              <button
                onClick={acceptNecessaryOnly}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Buttons */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={acceptAll}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Tout accepter
              </button>
              <button
                onClick={acceptNecessaryOnly}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Refuser les cookies optionnels
              </button>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-slate-500 hover:text-[#173B56] hover:underline"
              >
                {showDetails ? "Masquer les détails" : "Personnaliser"}
              </button>
            </div>
          </div>

          {/* Details panel */}
          {showDetails && (
            <div className="border-t border-slate-200 bg-slate-50 p-6">
              <CookiePreferences onSave={savePreferences} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CookiePreferences({
  onSave,
}: {
  onSave: (preferences: boolean, analytics: boolean) => void;
}) {
  const [preferences, setPreferences] = useState(true);
  const [analytics, setAnalytics] = useState(true);

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-[#173B56]">
        Paramétrer mes préférences
      </h4>

      {/* Necessary cookies - always on */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <p className="font-medium text-[#173B56]">
            Cookies strictement nécessaires
          </p>
          <p className="text-sm text-slate-500">
            Indispensables au fonctionnement du site (authentification,
            sécurité).
          </p>
        </div>
        <div className="flex h-6 w-11 items-center rounded-full bg-emerald-500 px-0.5">
          <div className="h-5 w-5 translate-x-5 rounded-full bg-white shadow" />
        </div>
      </div>

      {/* Preference cookies */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <p className="font-medium text-[#173B56]">Cookies de préférences</p>
          <p className="text-sm text-slate-500">
            Mémorisent vos préférences (thème, affichage).
          </p>
        </div>
        <button
          onClick={() => setPreferences(!preferences)}
          className={`flex h-6 w-11 items-center rounded-full px-0.5 transition-colors ${
            preferences ? "bg-emerald-500" : "bg-slate-200"
          }`}
        >
          <div
            className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
              preferences ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Analytics cookies */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <p className="font-medium text-[#173B56]">Cookies analytiques</p>
          <p className="text-sm text-slate-500">
            Nous aident à comprendre comment vous utilisez le site.
          </p>
        </div>
        <button
          onClick={() => setAnalytics(!analytics)}
          className={`flex h-6 w-11 items-center rounded-full px-0.5 transition-colors ${
            analytics ? "bg-emerald-500" : "bg-slate-200"
          }`}
        >
          <div
            className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
              analytics ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => onSave(preferences, analytics)}
          className="rounded-lg bg-[#173B56] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1e4d6d]"
        >
          Enregistrer mes préférences
        </button>
      </div>
    </div>
  );
}
