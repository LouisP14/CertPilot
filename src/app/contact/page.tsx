"use client";

import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Mail,
  Package,
  Phone,
  Send,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

type Tranche = "1-50" | "51-150" | "151-300";
type Billing = "monthly" | "annual";

const PRICES: Record<string, Record<Tranche, Record<Billing, number>>> = {
  starter:  { "1-50": { monthly: 69,  annual: 57  }, "51-150": { monthly: 109, annual: 91  }, "151-300": { monthly: 149, annual: 124 } },
  pro:      { "1-50": { monthly: 149, annual: 124 }, "51-150": { monthly: 229, annual: 190 }, "151-300": { monthly: 329, annual: 273 } },
  business: { "1-50": { monthly: 349, annual: 290 }, "51-150": { monthly: 499, annual: 414 }, "151-300": { monthly: 699, annual: 580 } },
};

const PLAN_NAMES: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
  business: "Business",
  enterprise: "Enterprise",
};

const TRANCHE_LABELS: Record<Tranche, string> = {
  "1-50": "1–50 employés",
  "51-150": "51–150 employés",
  "151-300": "151–300 employés",
};

function ContactForm() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan") ?? "";
  const trancheParam = (searchParams.get("tranche") ?? "1-50") as Tranche;
  const billingParam = (searchParams.get("billing") ?? "annual") as Billing;

  const validTranches: Tranche[] = ["1-50", "51-150", "151-300"];
  const tranche: Tranche = validTranches.includes(trancheParam) ? trancheParam : "1-50";
  const billing: Billing = billingParam === "monthly" ? "monthly" : "annual";

  const planName = PLAN_NAMES[planParam] ?? null;
  const planPrices = PRICES[planParam];
  const price = planPrices ? planPrices[tranche][billing] : null;

  const selectedPlan = planName
    ? {
        name: planName,
        employees: planParam === "enterprise" ? "300+" : TRANCHE_LABELS[tranche],
        price,
      }
    : null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    employeeCount: planParam !== "enterprise" ? tranche : "300+",
    plan: planParam || "",
    billing: billing,
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/contact-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Une erreur est survenue");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col bg-linear-to-br from-slate-50 to-slate-100">
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="text-xl font-bold text-[#173B56]">
              CertPilot
            </Link>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center p-6">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <h1 className="mb-4 text-2xl font-bold text-slate-900">
              Demande envoyée !
            </h1>
            <p className="mb-8 text-slate-600">
              Merci pour votre intérêt ! Notre équipe va étudier votre demande
              et vous recontacter sous 24-48h pour organiser une démonstration
              personnalisée.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#173B56] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l&apos;accueil
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-[#173B56]">
            CertPilot
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-[#173B56]"
          >
            Connexion
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* En-tête */}
          <div className="mb-8 text-center">
            <h1 className="mb-3 text-3xl font-bold text-[#173B56]">
              Demander une démonstration
            </h1>
            <p className="text-slate-600">
              Remplissez ce formulaire et notre équipe vous contactera pour
              organiser une démo personnalisée de CertPilot.
            </p>
          </div>

          {/* Bandeau offre sélectionnée */}
          {selectedPlan && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-emerald-800">
                  Offre {selectedPlan.name} sélectionnée
                </p>
                <p className="text-sm text-emerald-600">
                  {selectedPlan.employees}{selectedPlan.price ? ` • ${selectedPlan.price}€/mois HT` : " • Sur devis"}
                </p>
              </div>
              <Link
                href="/#tarifs"
                className="text-sm font-medium text-emerald-700 hover:underline"
              >
                Changer
              </Link>
            </div>
          )}

          {/* Formulaire */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl"
          >
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {/* Nom de l'entreprise */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  Entreprise *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Nom de votre entreprise"
                />
              </div>

              {/* Nom du contact */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <User className="h-4 w-4 text-slate-400" />
                  Votre nom *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) =>
                    setFormData({ ...formData, contactName: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Prénom Nom"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Mail className="h-4 w-4 text-slate-400" />
                  Email professionnel *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="vous@entreprise.fr"
                />
              </div>

              {/* Téléphone */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Phone className="h-4 w-4 text-slate-400" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="06 12 34 56 78"
                />
              </div>

              {/* Nombre d'employés - affiché en lecture seule si un plan est sélectionné */}
              {!selectedPlan && (
                <div className="md:col-span-2">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Users className="h-4 w-4 text-slate-400" />
                    Nombre d&apos;employés à gérer
                  </label>
                  <select
                    value={formData.employeeCount}
                    onChange={(e) => {
                      const count = e.target.value;
                      // Auto-sélectionner le plan correspondant
                      let plan = "";
                      if (count === "1-50") plan = "starter";
                      else if (count === "51-150") plan = "pro";
                      else if (count === "151-300") plan = "business";
                      else if (count === "300+") plan = "enterprise";
                      setFormData({ ...formData, employeeCount: count, plan });
                    }}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="">Sélectionnez une tranche</option>
                    <option value="1-50">1 à 50 employés</option>
                    <option value="51-150">51 à 150 employés</option>
                    <option value="151-300">151 à 300 employés</option>
                    <option value="300+">Plus de 300 employés</option>
                  </select>
                </div>
              )}

              {/* Message */}
              <div className="md:col-span-2">
                <label className="mb-2 text-sm font-medium text-slate-700">
                  Votre message (optionnel)
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Décrivez brièvement vos besoins ou posez vos questions..."
                />
              </div>
            </div>

            {/* Bouton submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Envoyer ma demande
                </>
              )}
            </button>

            <p className="mt-4 text-center text-xs text-slate-500">
              En soumettant ce formulaire, vous acceptez d&apos;être contacté
              par notre équipe commerciale.
            </p>
          </form>

          {/* Avantages */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { title: "Démo personnalisée", desc: "Adaptée à vos besoins" },
              { title: "Sans engagement", desc: "Découvrez librement" },
              { title: "Réponse sous 48h", desc: "Équipe réactive" },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl bg-white/60 p-4 text-center backdrop-blur-sm"
              >
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Chargement...
        </div>
      }
    >
      <ContactForm />
    </Suspense>
  );
}
