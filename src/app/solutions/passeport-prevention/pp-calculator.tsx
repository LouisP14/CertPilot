"use client";

import { AlertTriangle, Clock, Scale } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

// Calculateur "Combien vous coûte une non-conformité Passeport Prévention ?"
// — Sanction théorique maximale basée sur l'article L4741-1 du Code du travail :
//   10 000 € "autant de fois qu'il y a de travailleurs concernés par l'infraction"
//   (sources : Légifrance, INRS, Ministère du Travail).
// — Temps RH calculé sur une base d'environ 25 min par déclaration manuelle
//   (export, vérification NIR, dépôt sur prevention.moncompteformation.gouv.fr,
//   archivage preuve, relances internes).
// — Risque civil : obligation de sécurité de l'employeur (article L4121-1),
//   faute inexcusable pouvant majorer rentes et indemnités en cas d'accident.

const MIN_EMPLOYEES = 1;
const MAX_EMPLOYEES = 2000;
const MINUTES_PER_DECLARATION = 25;
const HOURLY_RATE_RH = 35;

type Intensity = "low" | "medium" | "high";

const INTENSITY_CONFIG: Record<
  Intensity,
  { label: string; description: string; formationsPerEmployee: number }
> = {
  low: {
    label: "Activité tertiaire",
    description: "Bureaux, services. Peu de formations obligatoires.",
    formationsPerEmployee: 0.5,
  },
  medium: {
    label: "Activité standard",
    description: "Industrie, BTP, logistique. SST, habilitations courantes.",
    formationsPerEmployee: 1.5,
  },
  high: {
    label: "Activité à risque",
    description: "BTP, chimie, énergie. CACES, ATEX, électrique, etc.",
    formationsPerEmployee: 3,
  },
};

function formatEuro(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value);
}

export function PPCalculator() {
  const [employees, setEmployees] = useState<number>(50);
  const [intensity, setIntensity] = useState<Intensity>("medium");

  const results = useMemo(() => {
    const safeEmployees = Math.max(
      MIN_EMPLOYEES,
      Math.min(MAX_EMPLOYEES, employees || 0),
    );
    const config = INTENSITY_CONFIG[intensity];
    const formationsPerYear = Math.round(
      safeEmployees * config.formationsPerEmployee,
    );
    const sanctionMax = safeEmployees * 10_000;
    const hoursPerYear = Math.round(
      (formationsPerYear * MINUTES_PER_DECLARATION) / 60,
    );
    const rhCostPerYear = hoursPerYear * HOURLY_RATE_RH;

    return {
      sanctionMax,
      formationsPerYear,
      hoursPerYear,
      rhCostPerYear,
    };
  }, [employees, intensity]);

  return (
    <section
      id="calculateur"
      className="border-t border-slate-200 bg-linear-to-b from-slate-50 to-white py-16 lg:py-24"
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            Calculateur de risque
          </div>
          <h2 className="mt-6 text-3xl font-black tracking-tight text-[#173B56] sm:text-4xl">
            Combien vous coûte une non-conformité ?
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Estimation basée sur l&apos;<strong>article L4741-1 du Code du
            travail</strong> et les pratiques RH constatées. Sources
            officielles citées en bas de page.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 lg:p-10">
          {/* Inputs */}
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <label
                htmlFor="pp-employees"
                className="block text-sm font-bold text-[#173B56]"
              >
                Nombre de salariés dans votre entreprise
              </label>
              <p className="mt-1 text-xs text-slate-500">
                Y compris stagiaires et intérimaires concernés par des
                formations obligatoires.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <input
                  id="pp-employees"
                  type="range"
                  min={MIN_EMPLOYEES}
                  max={MAX_EMPLOYEES}
                  step={5}
                  value={employees}
                  onChange={(e) => setEmployees(Number(e.target.value))}
                  className="flex-1 accent-emerald-600"
                  aria-label="Nombre de salariés"
                />
                <input
                  type="number"
                  min={MIN_EMPLOYEES}
                  max={MAX_EMPLOYEES}
                  value={employees}
                  onChange={(e) => setEmployees(Number(e.target.value))}
                  className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-right font-bold text-[#173B56] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  aria-label="Nombre de salariés (valeur exacte)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#173B56]">
                Profil de votre activité
              </label>
              <p className="mt-1 text-xs text-slate-500">
                Détermine le volume moyen de formations éligibles au Passeport
                Prévention par salarié et par an.
              </p>
              <div className="mt-3 grid gap-2">
                {(Object.keys(INTENSITY_CONFIG) as Intensity[]).map((key) => {
                  const cfg = INTENSITY_CONFIG[key];
                  const selected = intensity === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setIntensity(key)}
                      className={`rounded-lg border p-3 text-left transition-all ${
                        selected
                          ? "border-emerald-500 bg-emerald-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                      aria-pressed={selected}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-bold ${
                            selected ? "text-emerald-800" : "text-[#173B56]"
                          }`}
                        >
                          {cfg.label}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {cfg.formationsPerEmployee} formation
                          {cfg.formationsPerEmployee > 1 ? "s" : ""}/salarié/an
                        </span>
                      </div>
                      <p
                        className={`mt-1 text-xs ${
                          selected ? "text-emerald-700" : "text-slate-500"
                        }`}
                      >
                        {cfg.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
                  <Scale className="h-4 w-4 text-white" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-red-700">
                  Exposition pénale
                </p>
              </div>
              <p className="mt-4 text-3xl font-black text-red-700 sm:text-4xl">
                {formatEuro(results.sanctionMax)}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-red-800">
                Plafond théorique de l&apos;article L4741-1 :{" "}
                <strong>10 000 €</strong> appliqués « autant de fois
                qu&apos;il y a de travailleurs concernés par
                l&apos;infraction ».
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Temps RH perdu / an
                </p>
              </div>
              <p className="mt-4 text-3xl font-black text-amber-900 sm:text-4xl">
                {formatNumber(results.hoursPerYear)} h
              </p>
              <p className="mt-2 text-xs leading-relaxed text-amber-900">
                {formatNumber(results.formationsPerYear)} déclarations/an ×
                25 min de traitement manuel (export CSV, saisie NIR,
                vérification, dépôt, archivage).
                <br />
                Soit ≈ <strong>{formatEuro(results.rhCostPerYear)}</strong>{" "}
                de charge RH/an.
              </p>
            </div>

            <div className="rounded-xl border border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 p-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#173B56]">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Risque civil
                </p>
              </div>
              <p className="mt-4 text-lg font-black leading-tight text-[#173B56]">
                Faute inexcusable possible
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-700">
                En cas d&apos;accident d&apos;un salarié non déclaré,
                l&apos;employeur peut être reconnu au titre de
                l&apos;obligation de sécurité (art. L4121-1). Conséquences :
                majoration de rente AT/MP + dommages et intérêts.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-emerald-50 p-6 text-center">
            <p className="text-sm font-semibold text-emerald-900">
              Avec CertPilot, les <strong>{formatNumber(results.hoursPerYear)}{" "}
              heures/an</strong> de saisie manuelle tombent à{" "}
              <strong>
                ≈ {Math.max(1, Math.round(results.hoursPerYear * 0.1))} h
              </strong>
              {" "}et la génération du fichier CSV conforme se fait en{" "}
              <strong>1 clic</strong>.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700"
            >
              Sécuriser ma conformité Passeport Prévention
            </Link>
          </div>

          <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-400">
            Estimation indicative basée sur les articles L4141-5, L4741-1 et
            L4121-1 du Code du travail (décret n° 2025-748) et sur un taux
            horaire RH moyen de {HOURLY_RATE_RH}&nbsp;€. Les sanctions réelles
            dépendent de la qualification retenue par l&apos;inspection du
            travail et du juge. Ne constitue pas un conseil juridique.
          </p>
        </div>
      </div>
    </section>
  );
}