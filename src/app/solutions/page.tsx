import type { Metadata } from "next";
import { ArrowRight, Shield, Heart, Zap } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Solutions par formation | CACES, SST, Habilitation électrique - CertPilot",
  description:
    "Découvrez comment CertPilot gère chaque type de formation : CACES, SST, habilitations électriques, ATEX, travail en hauteur. Logiciel adapté à chaque besoin métier.",
  alternates: {
    canonical: "/solutions",
  },
};

const SOLUTIONS = [
  {
    href: "/solutions/caces",
    icon: Shield,
    title: "Gestion CACES",
    subtitle: "Chariots, nacelles, engins de chantier",
    description:
      "Centralisez tous vos CACES (R489, R486, R482, R490...). Alertes avant expiration, planning de recyclage, convocations automatiques.",
    color: "amber",
    bgColor: "bg-amber-100",
    textColor: "text-amber-600",
    btnColor: "bg-amber-600 hover:bg-amber-700",
  },
  {
    href: "/solutions/sst",
    icon: Heart,
    title: "Suivi SST",
    subtitle: "Sauveteurs Secouristes du Travail",
    description:
      "Gérez vos SST et MAC SST. Suivi du ratio SST/effectif, alertes de recyclage tous les 24 mois, conformité code du travail.",
    color: "red",
    bgColor: "bg-red-100",
    textColor: "text-red-600",
    btnColor: "bg-red-600 hover:bg-red-700",
  },
  {
    href: "/solutions/habilitation-electrique",
    icon: Zap,
    title: "Habilitations électriques",
    subtitle: "NF C 18-510 - B0 B1 B2 BR BC H0 H1 H2",
    description:
      "Suivez tous les niveaux d'habilitation BT et HT. Recyclage tous les 3 ans, conformité NF C 18-510, export audit-ready.",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-600",
    btnColor: "bg-blue-600 hover:bg-blue-700",
  },
];

export default function SolutionsPage() {
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
              Demander une démo
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-6 pt-16 pb-20 lg:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-black leading-tight tracking-tight text-[#173B56] sm:text-5xl">
              Une solution pour chaque{" "}
              <span className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                formation
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              CertPilot s&apos;adapte à tous vos types de formations et
              habilitations. Découvrez nos solutions spécialisées.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
            {SOLUTIONS.map((solution) => (
              <Link
                key={solution.href}
                href={solution.href}
                className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-xl ${solution.bgColor}`}
                >
                  <solution.icon
                    className={`h-7 w-7 ${solution.textColor}`}
                  />
                </div>

                <h2 className="mt-6 text-xl font-black text-[#173B56]">
                  {solution.title}
                </h2>
                <p className={`mt-1 text-sm font-semibold ${solution.textColor}`}>
                  {solution.subtitle}
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  {solution.description}
                </p>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#173B56] group-hover:underline">
                  En savoir plus
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>

          {/* Autres formations */}
          <div className="mx-auto mt-20 max-w-3xl text-center">
            <h2 className="text-2xl font-black text-[#173B56]">
              Et bien d&apos;autres formations...
            </h2>
            <p className="mt-4 text-slate-600">
              CertPilot gère aussi : ATEX, travail en hauteur, espaces confinés,
              échafaudages, pont roulant, soudage, amiante, et toute formation
              personnalisée. Le catalogue est entièrement configurable.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700"
            >
              Parlez-nous de vos besoins
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} CertPilot. Tous droits réservés.</p>
          <nav className="flex gap-4">
            <Link href="/" className="hover:text-[#173B56]">
              Accueil
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
