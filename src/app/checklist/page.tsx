"use client";

import {
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Mail,
  Shield,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ChecklistPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/lead-magnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, source: "checklist" }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      setDownloadUrl(data.downloadUrl);
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-black text-[#173B56]">
            CertPilot
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-[#173B56] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1e4a6b]"
          >
            Essai gratuit
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
        <div className="grid gap-16 lg:grid-cols-2">
          {/* Left - Content */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-800">
              <FileText className="h-4 w-4" />
              Guide gratuit 2026
            </div>

            <h1 className="mt-6 text-3xl font-black leading-tight text-[#173B56] sm:text-4xl lg:text-5xl">
              Checklist conformité{" "}
              <span className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                habilitations
              </span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              Vérifiez en 5 minutes si votre entreprise est en conformité avec
              les obligations de formation sécurité. 23 points de contrôle
              essentiels pour éviter les sanctions.
            </p>

            {/* What's inside */}
            <div className="mt-10 space-y-4">
              <h2 className="text-sm font-semibold text-slate-800">
                Ce que contient la checklist :
              </h2>
              <CheckItem text="CACES : validité, catégories, autorisation de conduite" />
              <CheckItem text="SST : couverture par zone, recyclage MAC SST" />
              <CheckItem text="Habilitations électriques : niveaux NF C 18-510" />
              <CheckItem text="Formations obligatoires : travail en hauteur, ATEX, espaces confinés" />
              <CheckItem text="Documentation : registre unique, fiches de poste, audit trail" />
              <CheckItem text="Délais légaux de recyclage par type de formation" />
            </div>

            {/* Trust signals */}
            <div className="mt-10 flex items-center gap-6 border-t border-slate-200 pt-8">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Shield className="h-4 w-4 text-emerald-500" />
                <span>Conforme 2026</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <FileText className="h-4 w-4 text-emerald-500" />
                <span>PDF 4 pages</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>23 points</span>
              </div>
            </div>
          </div>

          {/* Right - Form or Download */}
          <div className="flex items-start justify-center lg:pt-12">
            {downloadUrl ? (
              <div className="w-full max-w-md rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-xl">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-[#173B56]">
                  Votre checklist est prête !
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Cliquez ci-dessous pour télécharger votre PDF.
                </p>
                <a
                  href={downloadUrl}
                  download
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700"
                >
                  <Download className="h-4 w-4" />
                  Télécharger le PDF
                </a>

                <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-[#173B56]">
                    Besoin d&apos;automatiser tout ça ?
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    CertPilot surveille vos habilitations et vous alerte
                    automatiquement.
                  </p>
                  <Link
                    href="/register"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:underline"
                  >
                    Essai gratuit 14 jours
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
                <h2 className="text-xl font-bold text-[#173B56]">
                  Télécharger la checklist
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Recevez votre checklist conformité habilitations 2026
                  gratuitement.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                      <User className="h-4 w-4 text-slate-400" />
                      Votre prénom
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jean"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Mail className="h-4 w-4 text-slate-400" />
                      Email professionnel *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jean@entreprise.fr"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  {error && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Télécharger gratuitement
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-slate-400">
                    Pas de spam. Vos données restent confidentielles.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
      <span className="text-sm text-slate-700">{text}</span>
    </div>
  );
}
