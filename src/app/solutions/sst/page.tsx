import type { Metadata } from "next";
import {
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  FileText,
  Heart,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Logiciel gestion SST | Suivi Sauveteurs Secouristes du Travail - CertPilot",
  description:
    "Gérez vos formations SST et MAC SST avec CertPilot : suivi des certifications, alertes de recyclage automatiques, convocations, passeport formation. Logiciel SST pour entreprises.",
  keywords: [
    "gestion SST",
    "logiciel SST",
    "suivi SST entreprise",
    "sauveteur secouriste du travail",
    "formation SST",
    "MAC SST",
    "recyclage SST",
    "certificat SST",
    "suivi formations SST",
    "obligation SST entreprise",
  ],
  alternates: {
    canonical: "/solutions/sst",
  },
  openGraph: {
    title: "Gestion SST & formations secourisme - CertPilot",
    description:
      "Automatisez le suivi de vos SST : alertes MAC, convocations automatiques, passeport formation. Ne ratez plus aucun recyclage.",
    url: "/solutions/sst",
  },
};

function JsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.certpilot.eu";

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/solutions/sst`,
        url: `${siteUrl}/solutions/sst`,
        name: "Logiciel de gestion SST - CertPilot",
        description:
          "Solution de suivi des formations SST et MAC SST pour entreprises",
        isPartOf: { "@id": `${siteUrl}/#website` },
        inLanguage: "fr-FR",
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Quelle est la durée de validité du SST ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Le certificat SST a une durée de validité de 24 mois. Le titulaire doit suivre un recyclage (MAC SST - Maintien et Actualisation des Compétences) tous les 2 ans pour conserver sa certification. CertPilot vous alerte automatiquement avant chaque échéance.",
            },
          },
          {
            "@type": "Question",
            name: "Combien de SST faut-il dans une entreprise ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "L'article R4224-15 du Code du travail impose qu'un membre du personnel ait reçu la formation de secouriste dans chaque atelier où sont effectués des travaux dangereux. La recommandation est d'avoir 10 à 15% de l'effectif formé SST. CertPilot vous aide à calculer et maintenir ce ratio.",
            },
          },
          {
            "@type": "Question",
            name: "Comment organiser les recyclages MAC SST ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "CertPilot planifie automatiquement les sessions de MAC SST en fonction des dates d'expiration. Vous créez une session, inscrivez les SST à renouveler, et les convocations sont envoyées automatiquement par email avec lieu, date et horaires.",
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

const SST_FACTS = [
  {
    stat: "24 mois",
    label: "Durée de validité du certificat SST",
  },
  {
    stat: "10-15%",
    label: "Effectif recommandé formé SST",
  },
  {
    stat: "7h",
    label: "Durée du recyclage MAC SST",
  },
  {
    stat: "14h",
    label: "Durée de la formation initiale SST",
  },
];

export default function SSTPage() {
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
            <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-sm font-semibold text-red-800">
              <Heart className="h-4 w-4" />
              Gestion SST
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-[#173B56] sm:text-5xl">
              Suivi{" "}
              <span className="bg-linear-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                SST
              </span>{" "}
              simplifié
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              Gérez vos Sauveteurs Secouristes du Travail en toute sérénité.
              CertPilot suit les dates de validité, vous alerte pour les MAC SST
              et organise les recyclages automatiquement.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition-all hover:bg-red-700"
              >
                Voir la démo SST
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

        {/* Stats */}
        <section className="border-t border-slate-200 bg-white py-12">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {SST_FACTS.map((fact) => (
                <div key={fact.label} className="text-center">
                  <p className="text-3xl font-black text-red-600">
                    {fact.stat}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{fact.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Problèmes résolus */}
        <section className="border-t border-slate-200 bg-slate-50 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-center text-2xl font-black text-[#173B56] sm:text-3xl">
              Pourquoi digitaliser le suivi SST ?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
              Un SST expiré = un risque juridique en cas d&apos;accident.
              CertPilot vous protège.
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Bell,
                  title: "Alertes MAC SST",
                  description:
                    "Recevez une alerte quand un certificat SST approche de son échéance de 24 mois. Seuils d'alerte personnalisables.",
                },
                {
                  icon: Calendar,
                  title: "Sessions de recyclage",
                  description:
                    "Planifiez les sessions MAC SST pour vos équipes. Inscriptions, convocations et confirmations automatisées.",
                },
                {
                  icon: Users,
                  title: "Ratio SST / effectif",
                  description:
                    "Visualisez si vous respectez le ratio recommandé de 10-15% de SST dans votre effectif, service par service.",
                },
                {
                  icon: FileText,
                  title: "Passeport formation",
                  description:
                    "Chaque salarié dispose d'un passeport formation PDF avec l'historique de ses formations SST et autres habilitations.",
                },
                {
                  icon: Shield,
                  title: "Conformité réglementaire",
                  description:
                    "Historique complet et horodaté de toutes les formations SST. Prêt pour tout contrôle de l'inspection du travail.",
                },
                {
                  icon: Zap,
                  title: "Gain de temps",
                  description:
                    "Fini les tableurs Excel et les oublis. CertPilot automatise tout le suivi administratif de vos SST.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                    <feature.icon className="h-5 w-5 text-red-600" />
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

        {/* Comment ça marche */}
        <section className="border-t border-slate-200 bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-center text-2xl font-black text-[#173B56] sm:text-3xl">
              Comment gérer vos SST avec CertPilot
            </h2>

            <div className="mt-12 space-y-8">
              {[
                {
                  step: "1",
                  title: "Importez vos données",
                  description:
                    "Ajoutez vos employés et leurs certifications SST. Date d'obtention, organisme, date d'expiration — tout est centralisé.",
                },
                {
                  step: "2",
                  title: "Les alertes se déclenchent",
                  description:
                    "CertPilot surveille les échéances et vous alerte par email quand un MAC SST est nécessaire. Vous pouvez configurer les seuils.",
                },
                {
                  step: "3",
                  title: "Planifiez le recyclage",
                  description:
                    "Créez une session MAC SST, inscrivez les participants. Les convocations partent automatiquement.",
                },
                {
                  step: "4",
                  title: "Validez et tracez",
                  description:
                    "Après la formation, mettez à jour le certificat SST. L'historique est conservé, le passeport formation est à jour.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-sm font-black text-white">
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
              Passez au suivi SST digital
            </h2>
            <p className="mt-4 text-lg text-white/70">
              Rejoignez les entreprises qui automatisent leur gestion SST avec
              CertPilot.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-red-500 px-8 py-4 text-sm font-semibold text-white shadow-lg transition-all hover:bg-red-400"
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
