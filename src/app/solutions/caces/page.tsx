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
  title: "Logiciel gestion CACES | Suivi habilitations caristes - CertPilot",
  description:
    "Gérez vos CACES et habilitations caristes avec CertPilot : alertes d'expiration automatiques, planning des recyclages, convocations, passeport formation PDF. Solution de suivi CACES pour entreprises.",
  keywords: [
    "gestion CACES",
    "logiciel CACES",
    "suivi CACES entreprise",
    "habilitation cariste",
    "renouvellement CACES",
    "recyclage CACES",
    "CACES R489",
    "CACES R486",
    "CACES R482",
    "formation cariste",
    "suivi habilitations caristes",
  ],
  alternates: {
    canonical: "/solutions/caces",
  },
  openGraph: {
    title: "Gestion CACES & habilitations caristes - CertPilot",
    description:
      "Automatisez le suivi de vos CACES : alertes avant expiration, convocations automatiques, passeport formation. Ne ratez plus aucun renouvellement.",
    url: "/solutions/caces",
  },
};

function JsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.certpilot.eu";

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/solutions/caces`,
        url: `${siteUrl}/solutions/caces`,
        name: "Logiciel de gestion CACES - CertPilot",
        description:
          "Solution de suivi des CACES et habilitations caristes pour entreprises",
        isPartOf: { "@id": `${siteUrl}/#website` },
        inLanguage: "fr-FR",
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Comment gérer les CACES de mes employés ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "CertPilot centralise tous vos CACES (R489, R486, R482, R490...) dans un tableau de bord unique. Chaque employé a une fiche avec ses habilitations, dates d'obtention et d'expiration. Des alertes automatiques vous préviennent avant chaque échéance.",
            },
          },
          {
            "@type": "Question",
            name: "Quelle est la durée de validité d'un CACES ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "La durée de validité dépend de la recommandation CACES et de la catégorie concernée. CertPilot vous permet de paramétrer les échéances par type de CACES et de déclencher des alertes automatiques (30, 60 ou 90 jours avant) pour sécuriser les renouvellements.",
            },
          },
          {
            "@type": "Question",
            name: "Combien de catégories de CACES peut-on suivre ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "CertPilot permet de suivre toutes les catégories CACES : R489 (chariots automoteurs), R486 (PEMP nacelles), R482 (engins de chantier), R490 (grues de chargement), R487 (grues à tour), R483 (grues mobiles), et toute autre catégorie personnalisée.",
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

const CACES_CATEGORIES = [
  {
    code: "R489",
    name: "Chariots automoteurs",
    description: "Chariots élévateurs, transpalettes, gerbeurs",
    validity: "Selon recommandation CACES",
  },
  {
    code: "R486",
    name: "PEMP (Nacelles)",
    description: "Plateformes élévatrices mobiles de personnes",
    validity: "Selon recommandation CACES",
  },
  {
    code: "R482",
    name: "Engins de chantier",
    description: "Pelles, chargeuses, bulldozers, tombereaux",
    validity: "Selon recommandation CACES",
  },
  {
    code: "R490",
    name: "Grues de chargement",
    description: "Grues auxiliaires de chargement de véhicules",
    validity: "Selon recommandation CACES",
  },
  {
    code: "R487",
    name: "Grues à tour",
    description: "Grues à montage automatisé ou par éléments",
    validity: "Selon recommandation CACES",
  },
  {
    code: "R483",
    name: "Grues mobiles",
    description: "Grues automotrices et sur porteur",
    validity: "Selon recommandation CACES",
  },
];

export default function CACESPage() {
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
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-800">
              <Shield className="h-4 w-4" />
              Gestion CACES
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-[#173B56] sm:text-5xl">
              Gérez vos{" "}
              <span className="bg-linear-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                CACES
              </span>{" "}
              sans effort
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              Ne ratez plus jamais un renouvellement CACES. CertPilot centralise
              toutes les habilitations de vos caristes, vous alerte avant chaque
              expiration et génère automatiquement les convocations de
              recyclage.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-amber-600/25 transition-all hover:bg-amber-700"
              >
                Voir la démo CACES
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

        {/* Pain Points */}
        <section className="border-t border-slate-200 bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-center text-2xl font-black text-[#173B56] sm:text-3xl">
              Les défis de la gestion CACES en entreprise
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
              Un CACES expiré = un opérateur interdit de conduite = un chantier
              à l&apos;arrêt. CertPilot élimine ces risques.
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Bell,
                  title: "Alertes avant expiration",
                  description:
                    "Soyez prévenu 30, 60 ou 90 jours avant l'expiration de chaque CACES. Plus de mauvaise surprise lors d'un contrôle.",
                },
                {
                  icon: Calendar,
                  title: "Planning de recyclage",
                  description:
                    "Planifiez les sessions de recyclage CACES et inscrivez vos opérateurs en quelques clics. Convocations automatiques par email.",
                },
                {
                  icon: FileText,
                  title: "Passeport formation PDF",
                  description:
                    "Générez le passeport formation de chaque cariste avec tous ses CACES, dates et QR code de vérification.",
                },
                {
                  icon: Users,
                  title: "Vue d'ensemble par équipe",
                  description:
                    "Visualisez d'un coup d'œil quels opérateurs sont habilités, lesquels doivent renouveler leur CACES.",
                },
                {
                  icon: Zap,
                  title: "Préparation audit facilitée",
                  description:
                    "Historique, traçabilité des actions et exports : préparez plus rapidement vos éléments en cas de contrôle.",
                },
                {
                  icon: Shield,
                  title: "Multi-catégories",
                  description:
                    "Gérez les principales familles CACES (R489, R486, R482, R490, R487, R483) et vos catégories personnalisées.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                    <feature.icon className="h-5 w-5 text-amber-600" />
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

        {/* CACES Categories */}
        <section className="border-t border-slate-200 bg-slate-50 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-center text-2xl font-black text-[#173B56] sm:text-3xl">
              Toutes les catégories CACES supportées
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
              CertPilot prend en charge toutes les recommandations CACES en
              vigueur et vous permet d&apos;ajouter des catégories
              personnalisées.
            </p>

            <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CACES_CATEGORIES.map((cat) => (
                <div
                  key={cat.code}
                  className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-sm font-black text-amber-700">
                    {cat.code}
                  </div>
                  <div>
                    <p className="font-bold text-[#173B56]">{cat.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {cat.description}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-amber-600">
                      Périodicité : {cat.validity}
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
              Simplifiez la gestion de vos CACES dès aujourd&apos;hui
            </h2>
            <p className="mt-4 text-lg text-white/70">
              Rejoignez les entreprises qui font confiance à CertPilot pour le
              suivi de leurs habilitations caristes.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-8 py-4 text-sm font-semibold text-white shadow-lg transition-all hover:bg-amber-400"
            >
              Demander une démo gratuite
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer minimal */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} CertPilot. Tous droits réservés.</p>
          <nav className="flex gap-4">
            <Link href="/" className="hover:text-[#173B56]">
              Accueil
            </Link>
            <Link href="/solutions/sst" className="hover:text-[#173B56]">
              SST
            </Link>
            <Link
              href="/solutions/habilitation-electrique"
              className="hover:text-[#173B56]"
            >
              Habilitation électrique
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
