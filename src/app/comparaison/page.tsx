"use client";

import {
  AlertTriangle,
  ArrowRight,
  Calculator,
  CheckCircle2,
  FileSpreadsheet,
  MinusCircle,
  Shield,
  TrendingUp,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Comparison table data                                              */
/* ------------------------------------------------------------------ */

const COMPARISON_FEATURES = [
  { feature: "Alertes automatiques d\u2019expiration", excel: "no", certpilot: "yes" },
  { feature: "Suivi centralis\u00e9 des habilitations", excel: "no", certpilot: "yes" },
  { feature: "Piste d\u2019audit compl\u00e8te", excel: "no", certpilot: "yes" },
  { feature: "Signature \u00e9lectronique int\u00e9gr\u00e9e", excel: "no", certpilot: "yes" },
  { feature: "Passeport formation PDF avec QR code", excel: "no", certpilot: "yes" },
  { feature: "Convocations automatiques", excel: "no", certpilot: "yes" },
  { feature: "Collaboration multi-utilisateurs", excel: "partial", certpilot: "yes" },
  { feature: "Conformit\u00e9 r\u00e9glementaire", excel: "partial", certpilot: "yes" },
  { feature: "Suivi des co\u00fbts de formation", excel: "partial", certpilot: "yes" },
] as const;

function StatusIcon({ status }: { status: "yes" | "no" | "partial" }) {
  if (status === "yes")
    return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
  if (status === "no")
    return <XCircle className="h-5 w-5 text-red-400" />;
  return <MinusCircle className="h-5 w-5 text-amber-500" />;
}

/* ------------------------------------------------------------------ */
/*  ROI Calculator                                                     */
/* ------------------------------------------------------------------ */

function getCertPilotPrice(employees: number): number {
  if (employees <= 20) return 490;
  if (employees <= 100) return 1490;
  if (employees <= 300) return 3490;
  return 3490; // cap at highest published tier
}

function ROICalculator() {
  const [employees, setEmployees] = useState(50);
  const [hoursPerWeek, setHoursPerWeek] = useState(3);
  const [hourlyRate, setHourlyRate] = useState(35);

  const excelAnnualCost = hoursPerWeek * hourlyRate * 52;
  const certpilotCost = getCertPilotPrice(employees);
  const annualSavings = excelAnnualCost - certpilotCost;
  const roiPercent =
    certpilotCost > 0
      ? Math.round(((excelAnnualCost - certpilotCost) / certpilotCost) * 100)
      : 0;

  return (
    <section className="border-t border-slate-200 bg-slate-50 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-center gap-2 text-emerald-600">
          <Calculator className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">
            Calculateur ROI
          </span>
        </div>
        <h2 className="mt-4 text-center text-2xl font-black text-[#173B56] sm:text-3xl">
          Combien vous co&ucirc;te vraiment Excel&nbsp;?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
          Ajustez les curseurs ci-dessous pour estimer vos &eacute;conomies
          annuelles en passant &agrave; CertPilot.
        </p>

        {/* Inputs */}
        <div className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-3">
          {/* Employees */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <label
              htmlFor="employees"
              className="block text-sm font-semibold text-slate-700"
            >
              Nombre de salari&eacute;s
            </label>
            <input
              id="employees"
              type="range"
              min={5}
              max={300}
              step={5}
              value={employees}
              onChange={(e) => setEmployees(Number(e.target.value))}
              className="mt-3 w-full accent-emerald-600"
            />
            <div className="mt-2 text-center text-2xl font-black text-[#173B56]">
              {employees}
            </div>
          </div>

          {/* Hours per week */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <label
              htmlFor="hours"
              className="block text-sm font-semibold text-slate-700"
            >
              Heures / semaine sur Excel
            </label>
            <input
              id="hours"
              type="range"
              min={1}
              max={20}
              step={0.5}
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              className="mt-3 w-full accent-emerald-600"
            />
            <div className="mt-2 text-center text-2xl font-black text-[#173B56]">
              {hoursPerWeek}h
            </div>
          </div>

          {/* Hourly rate */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <label
              htmlFor="rate"
              className="block text-sm font-semibold text-slate-700"
            >
              Co&ucirc;t horaire charg&eacute; (&euro;)
            </label>
            <input
              id="rate"
              type="range"
              min={15}
              max={80}
              step={1}
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="mt-3 w-full accent-emerald-600"
            />
            <div className="mt-2 text-center text-2xl font-black text-[#173B56]">
              {hourlyRate}&nbsp;&euro;
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Excel annual cost */}
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm font-semibold text-red-600">
              Co&ucirc;t annuel Excel
            </p>
            <p className="mt-2 text-3xl font-black text-red-700">
              {excelAnnualCost.toLocaleString("fr-FR")}&nbsp;&euro;
            </p>
          </div>

          {/* CertPilot annual cost */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <p className="text-sm font-semibold text-emerald-600">
              Co&ucirc;t annuel CertPilot
            </p>
            <p className="mt-2 text-3xl font-black text-emerald-700">
              {certpilotCost.toLocaleString("fr-FR")}&nbsp;&euro;
            </p>
          </div>

          {/* Savings */}
          <div className="rounded-xl border border-[#173B56]/20 bg-[#173B56]/5 p-6 text-center">
            <p className="text-sm font-semibold text-[#173B56]">
              &Eacute;conomies annuelles
            </p>
            <p className="mt-2 text-3xl font-black text-[#173B56]">
              {annualSavings > 0
                ? `${annualSavings.toLocaleString("fr-FR")}\u00a0\u20ac`
                : "0\u00a0\u20ac"}
            </p>
          </div>

          {/* ROI */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
            <p className="text-sm font-semibold text-amber-700">
              ROI
            </p>
            <p className="mt-2 text-3xl font-black text-amber-700">
              {roiPercent > 0 ? `+${roiPercent}` : roiPercent}&nbsp;%
            </p>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-xl text-center text-xs text-slate-400">
          Estimation indicative. Le co&ucirc;t Excel inclut uniquement le temps
          pass&eacute; &agrave; la gestion manuelle. Les gains indirects
          (r&eacute;duction des risques, conformit&eacute;, productivit&eacute;)
          ne sont pas comptabilis&eacute;s.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Pain points                                                        */
/* ------------------------------------------------------------------ */

const PAIN_POINTS = [
  {
    icon: AlertTriangle,
    title: "CACES expir\u00e9 non d\u00e9tect\u00e9",
    description:
      "Un cariste continue de conduire un chariot \u00e9l\u00e9vateur avec un CACES expir\u00e9 depuis 3 mois. L\u2019inspection du travail passe : amende, arr\u00eat du chantier et mise en cause de la responsabilit\u00e9 de l\u2019employeur.",
  },
  {
    icon: Shield,
    title: "Audit de derni\u00e8re minute",
    description:
      "Votre client donneur d\u2019ordres demande la liste des habilitations \u00e0 jour sous 24h. Il faut fouiller 15 fichiers Excel, v\u00e9rifier les dates une par une et esp\u00e9rer qu\u2019aucune cellule n\u2019a \u00e9t\u00e9 modifi\u00e9e par erreur.",
  },
  {
    icon: FileSpreadsheet,
    title: "Fichier Excel corrompu ou \u00e9cras\u00e9",
    description:
      "Deux personnes modifient le m\u00eame fichier en m\u00eame temps. R\u00e9sultat : des lignes disparaissent, des dates sont \u00e9cras\u00e9es et personne ne sait quelle version est la bonne.",
  },
  {
    icon: TrendingUp,
    title: "Aucune visibilit\u00e9 sur les co\u00fbts",
    description:
      "Impossible de savoir combien l\u2019entreprise d\u00e9pense r\u00e9ellement en formations obligatoires. Les donn\u00e9es sont \u00e9parpill\u00e9es entre RH, managers et organismes de formation.",
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ComparaisonPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-black tracking-tight text-[#173B56]">
              CertPilot
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-semibold text-slate-600 transition-colors hover:text-[#173B56] sm:block"
            >
              Connexion
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl bg-[#173B56] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-[#1e4a6b]"
            >
              Demander une d&eacute;mo
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ---- Hero ---- */}
        <section className="mx-auto max-w-7xl px-6 pt-16 pb-12 lg:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-800">
              <FileSpreadsheet className="h-4 w-4" />
              Comparatif
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-[#173B56] sm:text-5xl">
              CertPilot vs{" "}
              <span className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Excel
              </span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              Vos tableurs mettent votre conformit&eacute; en danger. D&eacute;couvrez
              pourquoi des centaines d&rsquo;entreprises remplacent Excel par une
              solution d&eacute;di&eacute;e au suivi des habilitations et
              certifications.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700"
              >
                D&eacute;marrer l&rsquo;essai gratuit
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/#fonctionnalites"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-6 py-3.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
              >
                Toutes les fonctionnalit&eacute;s
              </Link>
            </div>
          </div>
        </section>

        {/* ---- Comparison Table ---- */}
        <section className="border-t border-slate-200 bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-center text-2xl font-black text-[#173B56] sm:text-3xl">
              Comparaison fonctionnalit&eacute; par fonctionnalit&eacute;
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
              Excel est un formidable tableur, mais il n&rsquo;a pas
              &eacute;t&eacute; con&ccedil;u pour g&eacute;rer la conformit&eacute;
              r&eacute;glementaire de vos &eacute;quipes.
            </p>

            <div className="mt-12 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-4 font-semibold text-slate-700">
                      Fonctionnalit&eacute;
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-slate-700">
                      Excel
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-emerald-700">
                      CertPilot
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {COMPARISON_FEATURES.map((row) => (
                    <tr key={row.feature} className="hover:bg-slate-50/60">
                      <td className="px-6 py-4 font-medium text-[#173B56]">
                        {row.feature}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <StatusIcon status={row.excel} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <StatusIcon status={row.certpilot} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ---- ROI Calculator ---- */}
        <ROICalculator />

        {/* ---- Pain Points ---- */}
        <section className="border-t border-slate-200 bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-center text-2xl font-black text-[#173B56] sm:text-3xl">
              Quand Excel vous met en difficult&eacute;
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
              Ces sc&eacute;narios arrivent chaque jour dans des entreprises qui
              g&egrave;rent encore leurs habilitations sur des fichiers Excel.
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {PAIN_POINTS.map((point) => (
                <div
                  key={point.title}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                    <point.icon className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="mt-4 font-bold text-[#173B56]">
                    {point.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {point.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- CTA ---- */}
        <section className="border-t border-slate-200 bg-[#173B56] py-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl font-black text-white">
              Passez d&rsquo;Excel &agrave; CertPilot en quelques minutes
            </h2>
            <p className="mt-4 text-lg text-white/70">
              Essai gratuit, sans carte bancaire. Importez vos donn&eacute;es
              Excel et constatez la diff&eacute;rence imm&eacute;diatement.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-sm font-semibold text-white shadow-lg transition-all hover:bg-emerald-400"
            >
              D&eacute;marrer l&rsquo;essai gratuit
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer minimal */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} CertPilot. Tous droits r&eacute;serv&eacute;s.</p>
          <nav className="flex gap-4">
            <Link href="/" className="hover:text-[#173B56]">
              Accueil
            </Link>
            <Link href="/solutions/caces" className="hover:text-[#173B56]">
              CACES
            </Link>
            <Link href="/solutions/sst" className="hover:text-[#173B56]">
              SST
            </Link>
            <Link href="/contact" className="hover:text-[#173B56]">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
