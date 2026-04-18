import Link from "next/link"
import { ArrowRight, Lock } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Fonctionnalité non disponible" }

const FEATURE_LABELS: Record<string, { name: string; description: string }> = {
  "training-needs":   { name: "Besoins de formation",      description: "Détection automatique des renouvellements à planifier, avec priorisation par urgence." },
  "sessions":         { name: "Planning & sessions",        description: "Création et suivi des sessions de formation, affectation des participants." },
  "convocations":     { name: "Gestion des convocations",  description: "Création et envoi des convocations par email directement depuis la plateforme." },
  "calendar":         { name: "Vue calendaire",             description: "Visualisation de toutes vos sessions et échéances sur un calendrier mensuel." },
  "training-centers": { name: "Centres de formation",       description: "Répertoire de vos organismes de formation avec contacts et spécialités." },
  "export":           { name: "Import / Export Excel",      description: "Export de vos données employés et formations en Excel, import en masse." },
  "audit":            { name: "Audit Trail",                description: "Journal complet de toutes les actions effectuées sur votre compte (qui, quoi, quand)." },
}

const PLAN_FEATURES: Record<string, string[]> = {
  Pro: [
    "Besoins de formation automatiques",
    "Planning & suivi des sessions",
    "Gestion des convocations",
    "Vue calendaire",
    "Rôle Gestionnaire",
    "Jusqu'à 3 administrateurs",
  ],
  Business: [
    "Tout le plan Pro",
    "Centres de formation",
    "Import / Export Excel",
    "Audit Trail",
    "Administrateurs illimités",
    "Support dédié 7j/7",
  ],
}

interface Props {
  searchParams: Promise<{ feature?: string; required?: string }>
}

export default async function UpgradePage({ searchParams }: Props) {
  const params = await searchParams
  const feature = params.feature ?? ""
  const required = (params.required ?? "Pro") as "Pro" | "Business"

  const featureInfo = FEATURE_LABELS[feature] ?? {
    name: "Cette fonctionnalité",
    description: "Cette fonctionnalité n'est pas disponible dans votre plan actuel.",
  }
  const planFeatures = PLAN_FEATURES[required] ?? []

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="mb-6 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <Lock className="h-8 w-8 text-slate-400" />
          </div>
        </div>

        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
            required === "Pro"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-violet-100 text-violet-700"
          }`}
        >
          Plan {required} requis
        </span>

        <h1 className="mt-4 text-2xl font-black text-[#173B56]">
          {featureInfo.name}
        </h1>
        <p className="mt-3 text-slate-500">{featureInfo.description}</p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-left">
          <p className="mb-4 text-sm font-semibold text-slate-700">
            Ce que vous obtenez avec le plan {required} :
          </p>
          <ul className="space-y-2">
            {planFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Voir les tarifs <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Parler à un conseiller
          </Link>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          Essai gratuit 14 jours — accès complet Business, sans carte bancaire
        </p>
      </div>
    </div>
  )
}