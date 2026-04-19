"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Minus } from "lucide-react";

type Tranche = "1-50" | "51-150" | "151-300";
type Billing = "monthly" | "annual";

const TRANCHES: { label: string; value: Tranche }[] = [
  { label: "1–50 emp.", value: "1-50" },
  { label: "51–150 emp.", value: "51-150" },
  { label: "151–300 emp.", value: "151-300" },
];

const PRICES: Record<string, Record<Tranche, Record<Billing, number>>> = {
  Starter:  { "1-50": { monthly: 69,  annual: 57  }, "51-150": { monthly: 109, annual: 91  }, "151-300": { monthly: 149, annual: 124 } },
  Pro:      { "1-50": { monthly: 149, annual: 124 }, "51-150": { monthly: 229, annual: 190 }, "151-300": { monthly: 329, annual: 273 } },
  Business: { "1-50": { monthly: 349, annual: 290 }, "51-150": { monthly: 499, annual: 414 }, "151-300": { monthly: 699, annual: 580 } },
};

const PLANS = [
  {
    key: "Starter",
    name: "Starter",
    tagline: "Suivi & alertes de conformité",
    popular: false,
    included: [
      "Suivi des habilitations (CACES, SST…)",
      "Alertes email J-90 / J-30 / J-7",
      "Détection des renouvellements",
      "Passeport formation (QR code)",
      "1 administrateur",
    ],
    excluded: [
      "Gestion des convocations",
      "Planning & sessions",
      "Audit Trail",
    ],
  },
  {
    key: "Pro",
    name: "Pro",
    tagline: "Automatisation & documentation",
    popular: true,
    included: [
      "Tout Starter",
      "Besoins de formation automatiques",
      "Planning & suivi des sessions",
      "Gestion des convocations",
      "Vue calendaire",
      "Rôle Gestionnaire",
      "3 administrateurs max",
    ],
    excluded: [
      "Centres de formation",
      "Import / Export Excel",
      "Audit Trail",
    ],
  },
  {
    key: "Business",
    name: "Business",
    tagline: "Pilotage & reporting avancé",
    popular: false,
    included: [
      "Tout Pro",
      "Centres de formation",
      "Import / Export Excel",
      "Audit Trail",
      "Administrateurs illimités",
      "Support dédié 7j/7",
    ],
    excluded: [],
  },
] as const;

export function PricingToggle() {
  const [billing, setBilling] = useState<Billing>("annual");
  const [tranche, setTranche] = useState<Tranche>("1-50");

  return (
    <div>
      {/* Billing toggle */}
      <div className="mb-6 flex items-center justify-center gap-3">
        <button
          onClick={() => setBilling("monthly")}
          className={`text-sm font-medium transition-colors ${billing === "monthly" ? "font-semibold text-slate-900" : "text-slate-400"}`}
        >
          Mensuel
        </button>
        <button
          onClick={() => setBilling(billing === "monthly" ? "annual" : "monthly")}
          className={`relative h-7 w-12 rounded-full transition-colors ${billing === "annual" ? "bg-emerald-500" : "bg-slate-300"}`}
          aria-label="Basculer facturation"
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${billing === "annual" ? "left-6" : "left-1"}`}
          />
        </button>
        <button
          onClick={() => setBilling("annual")}
          className={`text-sm transition-colors ${billing === "annual" ? "font-semibold text-slate-900" : "text-slate-400"}`}
        >
          Annuel
        </button>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
          −17%
        </span>
      </div>

      {/* Tranche selector */}
      <div className="mb-10 flex items-center justify-center">
        <div className="inline-flex gap-2">
          {TRANCHES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTranche(t.value)}
              className={`rounded-xl border-2 px-5 py-2 text-sm font-medium transition-all ${
                tranche === t.value
                  ? "border-emerald-500 bg-white text-[#173B56] shadow-md shadow-emerald-500/10"
                  : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const price = PRICES[plan.key][tranche][billing];
          const isPopular = plan.popular;
          return (
            <div
              key={plan.key}
              className={`relative flex flex-col rounded-2xl p-6 ${
                isPopular
                  ? "border-2 border-emerald-500 bg-white shadow-xl shadow-emerald-500/10"
                  : "border border-slate-200 bg-white"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                  Populaire
                </div>
              )}
              <h3 className="text-lg font-semibold text-[#173B56]">{plan.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>
              <div className="mt-4">
                <span className="text-4xl font-black text-[#173B56]">{price}€</span>
                <span className="text-slate-500">/mois HT</span>
              </div>
              {billing === "annual" && (
                <p className="mt-1 text-xs text-slate-400">Facturé annuellement</p>
              )}

              <div className="mt-6 flex flex-1 flex-col gap-2">
                {plan.included.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <Check className="h-2.5 w-2.5 text-emerald-600" />
                    </div>
                    <span className="text-sm text-slate-700">{f}</span>
                  </div>
                ))}
                {plan.excluded.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100">
                      <Minus className="h-2.5 w-2.5 text-slate-400" />
                    </div>
                    <span className="text-sm text-slate-400">{f}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <Link
                  href={`/register?plan=${plan.key.toLowerCase()}`}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    isPopular
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "border border-slate-300 bg-white text-[#173B56] hover:bg-slate-50"
                  }`}
                >
                  Essai gratuit 14j <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/contact?plan=${plan.key.toLowerCase()}&tranche=${tranche}&billing=${billing}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500 transition-all hover:text-[#173B56]"
                >
                  Demander une démo
                </Link>
              </div>
            </div>
          );
        })}

        {/* Enterprise */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-[#173B56]">Enterprise</h3>
          <p className="mt-1 text-sm text-slate-500">300+ employés</p>
          <div className="mt-4">
            <span className="text-3xl font-black text-[#173B56]">Sur devis</span>
          </div>
          <p className="mt-2 text-sm text-slate-500">Tarif adapté à vos besoins et à votre volume</p>
          <div className="mt-6 flex flex-1 flex-col gap-2">
            {["Tout Business", "Volume illimité", "SLA contractuel", "Onboarding dédié", "Support prioritaire"].map((f) => (
              <div key={f} className="flex items-start gap-2">
                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="h-2.5 w-2.5 text-emerald-600" />
                </div>
                <span className="text-sm text-slate-700">{f}</span>
              </div>
            ))}
          </div>
          <Link
            href="/contact?plan=enterprise"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#173B56] transition-all hover:bg-slate-50"
          >
            Nous contacter <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        Essai gratuit 14 jours — accès complet Business, sans carte bancaire
      </p>
    </div>
  );
}