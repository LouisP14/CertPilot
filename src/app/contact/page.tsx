"use client";

import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Mail,
  Phone,
  Send,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    employeeCount: "",
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

              {/* Nombre d'employés */}
              <div className="md:col-span-2">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Users className="h-4 w-4 text-slate-400" />
                  Nombre d&apos;employés à gérer
                </label>
                <select
                  value={formData.employeeCount}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeCount: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Sélectionnez une tranche</option>
                  <option value="1-50">1 à 50 employés</option>
                  <option value="51-100">51 à 100 employés</option>
                  <option value="101-200">101 à 200 employés</option>
                  <option value="201-500">201 à 500 employés</option>
                  <option value="500+">Plus de 500 employés</option>
                </select>
              </div>

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
