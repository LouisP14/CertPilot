"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const PLANS = [
  { name: "Starter",    employees: "1–20",   monthly: 49,  annual: 41  },
  { name: "Pro",        employees: "21–100", monthly: 149, annual: 124, popular: true },
  { name: "Business",  employees: "101–300", monthly: 349, annual: 290 },
];

function IncludedFeature({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
        <Check className="h-3 w-3 text-emerald-600" />
      </div>
      <span className="text-sm text-slate-700">{children}</span>
    </div>
  );
}

export function PricingToggle() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <div>
      {/* Toggle */}
      <div className="mb-10 flex items-center justify-center gap-3">
        <button
          onClick={() => setBilling("monthly")}
          className={`text-sm font-600 transition-colors ${billing === "monthly" ? "font-semibold text-slate-900" : "text-slate-400"}`}
        >
          Mensuel
        </button>
        <button
          onClick={() => setBilling(billing === "monthly" ? "annual" : "monthly")}
          className="relative h-7 w-12 rounded-full bg-emerald-500 transition-colors"
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

      {/* Cards */}
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const price = billing === "monthly" ? plan.monthly : plan.annual;
          return (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-6 ${
                plan.popular
                  ? "border-2 border-emerald-500 bg-white shadow-xl shadow-emerald-500/10"
                  : "border border-slate-200 bg-white"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                  Populaire
                </div>
              )}
              <h3 className="text-lg font-semibold text-[#173B56]">{plan.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{plan.employees} employés</p>
              <div className="mt-4">
                <span className="text-4xl font-black text-[#173B56]">{price}€</span>
                <span className="text-slate-500">/mois HT</span>
              </div>
              <div className="mt-6 flex flex-1 flex-col gap-3">
                <IncludedFeature>Toutes les fonctionnalités</IncludedFeature>
                <IncludedFeature>Import / Export Excel</IncludedFeature>
                <IncludedFeature>Support prioritaire</IncludedFeature>
                <IncludedFeature>Mises à jour incluses</IncludedFeature>
                <IncludedFeature>Export PDF illimité</IncludedFeature>
              </div>
              <div className="mt-6 flex flex-col gap-2">
                <Link
                  href="/register"
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    plan.popular
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "border border-slate-300 bg-white text-[#173B56] hover:bg-slate-50"
                  }`}
                >
                  Démarrer l&apos;essai gratuit <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/contact?plan=${plan.name.toLowerCase()}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500 transition-all hover:text-[#173B56]"
                >
                  Demander une démo <ArrowRight className="h-4 w-4" />
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
          <p className="mt-2 text-sm text-slate-500">Tarif adapté à vos besoins</p>
          <div className="mt-6 flex flex-1 flex-col gap-3">
            <IncludedFeature>Toutes les fonctionnalités</IncludedFeature>
            <IncludedFeature>Import / Export Excel</IncludedFeature>
            <IncludedFeature>Support prioritaire</IncludedFeature>
            <IncludedFeature>Mises à jour incluses</IncludedFeature>
            <IncludedFeature>Export PDF illimité</IncludedFeature>
          </div>
          <Link
            href="/contact?plan=enterprise"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#173B56] transition-all hover:bg-slate-50"
          >
            Nous contacter <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}