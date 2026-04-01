"use client";

import { ArrowRight, CheckCircle2, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const plans = [
  {
    key: "starter",
    name: "Starter",
    price: "49",
    employees: "1-20 employés",
    popular: false,
  },
  {
    key: "pro",
    name: "Pro",
    price: "149",
    employees: "21-100 employés",
    popular: true,
  },
  {
    key: "business",
    name: "Business",
    price: "349",
    employees: "101-300 employés",
    popular: false,
  },
];

const features = [
  "Gestion complète des formations",
  "Suivi des habilitations",
  "Convocations automatiques",
  "Génération de certificats PDF",
  "Tableau de bord et statistiques",
  "Alertes automatiques",
  "Export PDF des passeports",
  "Support prioritaire",
];

export default function TrialExpiredPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleChoosePlan(planKey: string) {
    setLoadingPlan(planKey);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, billing: "monthly" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors du paiement");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-xl font-bold text-[#173B56]">
            CertPilot
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        {/* Message principal */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-10 w-10 text-amber-600" />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
            Votre essai gratuit a expiré
          </h1>
          <p className="mb-8 text-lg text-slate-600">
            Merci d&apos;avoir testé CertPilot ! Pour continuer à gérer vos
            formations et habilitations en toute simplicité, choisissez le
            forfait adapté à votre entreprise.
          </p>
        </div>

        {/* Plans */}
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`relative rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl ${
                plan.popular ? "ring-2 ring-emerald-500" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                  Populaire
                </div>
              )}
              <h3 className="mb-1 text-lg font-semibold text-slate-900">
                {plan.name}
              </h3>
              <p className="mb-4 text-sm text-slate-500">{plan.employees}</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-slate-900">
                  {plan.price}€
                </span>
                <span className="text-slate-500">/mois HT</span>
              </div>
              <button
                onClick={() => handleChoosePlan(plan.key)}
                disabled={loadingPlan !== null}
                className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 font-semibold transition-colors disabled:opacity-60 ${
                  plan.popular
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                }`}
              >
                {loadingPlan === plan.key ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Choisir"
                )}
              </button>
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-6 text-center text-sm text-red-600">{error}</p>
        )}

        {/* Fonctionnalités incluses */}
        <div className="mx-auto mt-16 max-w-2xl">
          <h2 className="mb-6 text-center text-xl font-semibold text-slate-900">
            Toutes les fonctionnalités incluses
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 text-slate-700"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Contact */}
        <div className="mx-auto mt-16 max-w-xl text-center">
          <p className="mb-4 text-slate-600">
            Besoin d&apos;une solution personnalisée ou plus de 500 employés ?
          </p>
          <Link
            href="mailto:contact@certpilot.eu"
            className="inline-flex items-center gap-2 font-semibold text-[#173B56] hover:underline"
          >
            Contactez notre équipe commerciale
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} CertPilot. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
