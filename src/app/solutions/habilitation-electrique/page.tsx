import {
  ArrowRight,
  Bell,
  Calendar,
  FileText,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Logiciel gestion habilitations électriques | Suivi NF C 18-510 - CertPilot",
  description:
    "Gérez vos habilitations électriques avec CertPilot : suivi B0, B1, B2, BR, BC, H0, H1, H2, alertes de recyclage, convocations automatiques. Logiciel de conformité NF C 18-510.",
  keywords: [
    "gestion habilitation électrique",
    "logiciel habilitation électrique",
    "suivi habilitation électrique",
    "NF C 18-510",
    "habilitation B0 B1 B2 BR BC",
    "habilitation H0 H1 H2",
    "recyclage habilitation électrique",
    "formation habilitation électrique",
    "conformité électrique entreprise",
    "carnet de prescriptions",
  ],
  alternates: {
    canonical: "/solutions/habilitation-electrique",
  },
  openGraph: {
    title: "Gestion des habilitations électriques NF C 18-510 - CertPilot",
    description:
      "Automatisez le suivi de vos habilitations électriques : alertes, recyclages, convocations. Conformité NF C 18-510 assurée.",
    url: "/solutions/habilitation-electrique",
  },
};

function JsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.certpilot.eu";

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/solutions/habilitation-electrique`,
        url: `${siteUrl}/solutions/habilitation-electrique`,
        name: "Logiciel de gestion des habilitations électriques - CertPilot",
        description:
          "Solution de suivi des habilitations électriques NF C 18-510 pour entreprises",
        isPartOf: { "@id": `${siteUrl}/#website` },
        inLanguage: "fr-FR",
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Quelle est la durée de validité d'une habilitation électrique ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "La périodicité de renouvellement est définie par l'employeur en fonction de la norme NF C 18-510, de l'analyse des risques et des conditions d'activité. CertPilot permet de paramétrer cette périodicité par niveau d'habilitation et d'automatiser les alertes.",
            },
          },
          {
            "@type": "Question",
            name: "Quels sont les différents niveaux d'habilitation électrique ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Il existe plusieurs niveaux : B0/H0 (non-électricien), B1/H1 (exécutant), B2/H2 (chargé de travaux), BR (chargé d'intervention), BC/HC (chargé de consignation), BE/HE (opérations spécifiques). CertPilot permet de suivre tous ces niveaux et leurs combinaisons.",
            },
          },
          {
            "@type": "Question",
            name: "L'habilitation électrique est-elle obligatoire ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Oui, le décret 2010-1118 du 22 septembre 2010 rend obligatoire l'habilitation électrique pour tout travailleur effectuant des opérations sur ou à proximité d'installations électriques. L'employeur doit s'assurer que ses salariés sont formés et habilités. CertPilot vous aide à maintenir cette conformité.",
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

const HABILITATION_LEVELS = [
  {
    code: "B0 / H0",
    name: "Non-électricien",
    description:
      "Personnel non-électricien travaillant à proximité d'installations BT/HT",
    color: "bg-green-100 text-green-700",
  },
  {
    code: "B1 / H1",
    name: "Exécutant",
    description:
      "Exécute des travaux d'ordre électrique sous la direction d'un B2/H2",
    color: "bg-blue-100 text-blue-700",
  },
  {
    code: "B2 / H2",
    name: "Chargé de travaux",
    description: "Dirige les travaux d'ordre électrique et assure la sécurité",
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    code: "BR",
    name: "Chargé d'intervention",
    description: "Réalise des interventions de dépannage et de maintenance BT",
    color: "bg-violet-100 text-violet-700",
  },
  {
    code: "BC / HC",
    name: "Chargé de consignation",
    description: "Réalise les consignations et déconsignations électriques",
    color: "bg-amber-100 text-amber-700",
  },
  {
    code: "BE / HE",
    name: "Opérations spécifiques",
    description: "Essais, mesurages, vérifications ou manœuvres spécifiques",
    color: "bg-rose-100 text-rose-700",
  },
];

export default function HabilitationElectriquePage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      <JsonLd />

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
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-6 pt-16 pb-12 lg:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-800">
              <Zap className="h-4 w-4" />
              Habilitations électriques
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-[#173B56] sm:text-5xl">
              Gérez vos{" "}
              <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                habilitations électriques
              </span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              Conformité NF C 18-510 assurée. CertPilot centralise toutes les
              habilitations de vos électriciens, suit les recyclages et vous
              alerte avant chaque expiration.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700"
              >
                Voir la démo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/#fonctionnalites"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-6 py-3.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
              >
                Toutes les fonctionnalités
              </Link>
            </div>
          </div>
        </section>

        {/* Réglementation */}
        <section className="border-t border-slate-200 bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-center text-2xl font-black text-[#173B56] sm:text-3xl">
              L&apos;habilitation électrique : une obligation légale
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
              Le décret 2010-1118 impose l&apos;habilitation pour toute
              opération sur ou à proximité d&apos;installations électriques. Ne
              pas respecter cette obligation expose l&apos;employeur à des
              risques juridiques et organisationnels.
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Shield,
                  title: "Conformité NF C 18-510",
                  description:
                    "CertPilot suit les recommandations de la norme NF C 18-510 pour la durée de validité et les catégories d'habilitation.",
                },
                {
                  icon: Bell,
                  title: "Alertes de recyclage",
                  description:
                    "Périodicité de recyclage paramétrable selon votre politique de prévention. CertPilot vous prévient en amont pour planifier les sessions.",
                },
                {
                  icon: Calendar,
                  title: "Planification des formations",
                  description:
                    "Organisez les sessions de recyclage habilitation électrique. Convocations automatiques par email aux participants.",
                },
                {
                  icon: FileText,
                  title: "Titre d'habilitation tracé",
                  description:
                    "Chaque habilitation est enregistrée avec son niveau, sa date de délivrance, sa durée de validité et l'organisme formateur.",
                },
                {
                  icon: Users,
                  title: "Vue par niveau",
                  description:
                    "Filtrez vos employés par niveau d'habilitation : B0, B1, B2, BR, BC, H0, H1, H2, BE, HE et combinaisons.",
                },
                {
                  icon: Zap,
                  title: "Exports pour contrôle",
                  description:
                    "Exportez vos habilitations électriques en PDF ou Excel pour préparer vos éléments en cas de contrôle.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <feature.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="mt-4 font-bold text-[#173B56]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Niveaux d'habilitation */}
        <section className="border-t border-slate-200 bg-slate-50 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-center text-2xl font-black text-[#173B56] sm:text-3xl">
              Tous les niveaux d&apos;habilitation supportés
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
              CertPilot gère toutes les catégories d&apos;habilitation
              électrique BT et HT, y compris les niveaux combinés.
            </p>

            <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {HABILITATION_LEVELS.map((level) => (
                <div
                  key={level.code}
                  className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5"
                >
                  <div
                    className={`flex h-12 min-w-12 shrink-0 items-center justify-center rounded-lg px-2 text-xs font-black whitespace-nowrap ${level.color}`}
                  >
                    {level.code}
                  </div>
                  <div>
                    <p className="font-bold text-[#173B56]">{level.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {level.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="border-t border-slate-200 bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-center text-2xl font-black text-[#173B56] sm:text-3xl">
              Le cycle de vie d&apos;une habilitation avec CertPilot
            </h2>

            <div className="mt-12 space-y-8">
              {[
                {
                  step: "1",
                  title: "Formation initiale",
                  description:
                    "L'employé suit sa formation habilitation électrique. Vous enregistrez le titre dans CertPilot avec le niveau, la date et l'organisme.",
                },
                {
                  step: "2",
                  title: "Délivrance du titre",
                  description:
                    "L'employeur délivre le titre d'habilitation. CertPilot enregistre la date de début et calcule automatiquement l'échéance de recyclage.",
                },
                {
                  step: "3",
                  title: "Alerte de renouvellement",
                  description:
                    "À l'approche de l'échéance configurée, CertPilot vous alerte. Vous pouvez alors planifier le recyclage.",
                },
                {
                  step: "4",
                  title: "Recyclage et mise à jour",
                  description:
                    "Après le recyclage, mettez à jour l'habilitation. Un nouveau cycle démarre selon votre paramétrage, l'historique est conservé.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#173B56]">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-slate-200 bg-[#173B56] py-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl font-black text-white">
              Sécurisez vos habilitations électriques
            </h2>
            <p className="mt-4 text-lg text-white/70">
              Conformité NF C 18-510 assurée, alertes automatiques, traçabilité
              complète.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-8 py-4 text-sm font-semibold text-white shadow-lg transition-all hover:bg-blue-400"
            >
              Demander une démo gratuite
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
