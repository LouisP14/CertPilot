export const revalidate = 3600;

import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Bell,
  CalendarCheck2,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Gavel,
  Scale,
  Shield,
  ShieldCheck,
  Upload,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PPCalculator } from "./pp-calculator";

export const metadata: Metadata = {
  title:
    "Passeport Prévention : logiciel conforme décret 2025-748 - CertPilot",
  description:
    "Déclarez vos formations au Passeport de Prévention en 1 clic. Export CSV conforme (décret n° 2025-748, art. L4141-5), alertes de relance, traçabilité. Évitez l'amende L4741-1 (10 000 € par salarié).",
  keywords: [
    "passeport prévention",
    "passeport de prévention",
    "décret 2025-748",
    "L4141-5 Code du travail",
    "L4741-1 sanctions",
    "déclaration passeport prévention",
    "logiciel passeport prévention",
    "attestation formation ADF",
    "Caisse des Dépôts passeport prévention",
    "obligation employeur passeport prévention",
    "passeport prévention 16 mars 2026",
    "prevention.moncompteformation.gouv.fr",
    "CSV passeport prévention",
    "import masse passeport prévention",
    "conformité santé sécurité travail",
    "formations obligatoires déclaration",
  ],
  alternates: {
    canonical: "/solutions/passeport-prevention",
  },
  openGraph: {
    title:
      "Passeport Prévention : logiciel de conformité pour employeurs - CertPilot",
    description:
      "Obligation en vigueur depuis le 16 mars 2026. CertPilot automatise vos déclarations au Passeport de Prévention national (décret n° 2025-748).",
    url: "/solutions/passeport-prevention",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Passeport Prévention — Logiciel conforme décret 2025-748",
    description:
      "Automatisez vos déclarations au Passeport de Prévention. Export CSV officiel, alertes, traçabilité. Évitez l'amende L4741-1.",
  },
};

function JsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.certpilot.eu";

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/solutions/passeport-prevention`,
        url: `${siteUrl}/solutions/passeport-prevention`,
        name: "Passeport de Prévention — Logiciel de conformité pour employeurs",
        description:
          "Solution logicielle pour automatiser la déclaration des formations au Passeport de Prévention national (décret n° 2025-748 du 1er août 2025, article L4141-5 du Code du travail).",
        isPartOf: { "@id": `${siteUrl}/#website` },
        inLanguage: "fr-FR",
        about: {
          "@type": "Thing",
          name: "Passeport de Prévention",
          description:
            "Dispositif français de traçabilité des formations en santé et sécurité au travail, instauré par la loi n° 2021-1018 et précisé par le décret n° 2025-748.",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "CertPilot — Module Passeport de Prévention",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description:
          "Génération du fichier CSV officiel au format Attestations de Formation (ADF), alertes de relance avant échéance, traçabilité complète des déclarations.",
        offers: {
          "@type": "Offer",
          priceCurrency: "EUR",
          price: "0",
          description: "Essai gratuit sur demande",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Qu'est-ce que le Passeport de Prévention ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Le Passeport de Prévention est un dispositif national français instauré par la loi n° 2021-1018 du 2 août 2021 et codifié à l'article L4141-5 du Code du travail. Il recense l'ensemble des formations en santé et sécurité au travail suivies par un salarié tout au long de sa carrière. Les modalités de déclaration par les employeurs sont précisées par le décret n° 2025-748 du 1er août 2025. Il est opéré par la Caisse des Dépôts pour le compte du Ministère du Travail.",
            },
          },
          {
            "@type": "Question",
            name: "À partir de quelle date la déclaration au Passeport de Prévention est-elle obligatoire ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "L'espace déclaratif employeur a été ouvert le 16 mars 2026. L'obligation concerne d'abord les formations obligatoires réglementaires et les formations à autorisation/habilitation (CACES, habilitations électriques, etc.), puis s'étend à l'ensemble des formations santé-sécurité à partir du 1er octobre 2026.",
            },
          },
          {
            "@type": "Question",
            name: "Quel est le délai pour déclarer une formation au Passeport de Prévention ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Jusqu'au 31 décembre 2026, le délai est de 9 mois après la fin du trimestre au cours duquel la formation s'est terminée (période transitoire). À partir du 1er janvier 2027, ce délai est ramené à 6 mois.",
            },
          },
          {
            "@type": "Question",
            name: "Quelles sont les sanctions en cas de non-déclaration au Passeport de Prévention ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "L'article L4741-1 du Code du travail prévoit une amende de 10 000 € « autant de fois qu'il y a de travailleurs concernés par l'infraction ». En récidive, la sanction peut aller jusqu'à 1 an d'emprisonnement et 30 000 € d'amende. Par ailleurs, l'absence de traçabilité peut caractériser un manquement à l'obligation de sécurité de l'employeur (article L4121-1), engageant sa responsabilité civile en cas d'accident du travail.",
            },
          },
          {
            "@type": "Question",
            name: "Quelles formations dois-je déclarer au Passeport de Prévention ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Les formations concernées sont celles relevant de la santé et sécurité au travail : formations obligatoires réglementaires (travail en hauteur, ATEX, gestes et postures, etc.), formations à autorisation/habilitation (CACES R482/R486/R489/R490, habilitations électriques NF C 18-510, etc.), SST et MAC SST, et toute formation prévue par la réglementation. Jusqu'au 30 septembre 2026, seules les deux premières catégories sont concernées.",
            },
          },
          {
            "@type": "Question",
            name: "Toutes les entreprises sont-elles concernées par le Passeport de Prévention ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Oui. Toutes les entreprises du secteur privé, quelle que soit leur taille ou leur secteur d'activité, sont concernées dès lors qu'elles dispensent ou financent des formations en santé et sécurité au travail. Le décret 2025-748 a également étendu le dispositif à la fonction publique.",
            },
          },
          {
            "@type": "Question",
            name: "Dans quel format doit-on déclarer les formations ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "La plateforme officielle (prevention.moncompteformation.gouv.fr) permet une saisie manuelle par formation. L'import de fichier en masse (plusieurs déclarations en un seul dépôt) est prévu pour le 9 juillet 2026. CertPilot génère dès aujourd'hui le fichier au format attendu par la Caisse des Dépôts (format ADF — Attestations de Formation), prêt à être déposé dès l'ouverture de cette fonctionnalité.",
            },
          },
          {
            "@type": "Question",
            name: "Quelle est la différence entre le Passeport de Prévention et le Passeport d'Orientation, de Formation et de Compétences (POFC) ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Le POFC (ex-CPF Passeport) recense l'ensemble du parcours professionnel du salarié (diplômes, formations, expériences). Le Passeport de Prévention est ciblé exclusivement sur les formations santé-sécurité au travail. Les deux dispositifs sont complémentaires et hébergés par la Caisse des Dépôts.",
            },
          },
          {
            "@type": "Question",
            name: "Comment CertPilot m'aide-t-il à être conforme ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "CertPilot centralise vos formations, identifie automatiquement celles éligibles au Passeport de Prévention (flag isConcernedPP sur chaque formation-type), vous alerte par email aux seuils J-60, J-30 et J-7 avant l'échéance de déclaration, génère le fichier CSV au format officiel, et conserve un historique horodaté pour l'audit. Vous gardez la preuve de chaque déclaration avec une référence unique.",
            },
          },
          {
            "@type": "Question",
            name: "Les salariés peuvent-ils consulter leur Passeport de Prévention ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "L'ouverture de l'espace salarié sur la plateforme officielle est prévue pour le 4ème trimestre 2026. En attendant, CertPilot met à disposition de chaque salarié un passeport formation numérique consultable via QR code, incluant l'historique complet de ses habilitations.",
            },
          },
          {
            "@type": "Question",
            name: "Où trouver le texte officiel du décret 2025-748 ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Le décret n° 2025-748 du 1er août 2025 est disponible sur Légifrance (journal officiel du 2 août 2025). Le portail officiel du Ministère du Travail dédié au Passeport de Prévention est passeport-prevention.travail-emploi.gouv.fr. La plateforme déclarative opérée par la Caisse des Dépôts est prevention.moncompteformation.gouv.fr.",
            },
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "Solutions",
            item: `${siteUrl}/solutions`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Passeport de Prévention",
            item: `${siteUrl}/solutions/passeport-prevention`,
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

const KEY_FACTS = [
  {
    stat: "16/03/2026",
    label: "Obligation déclarative en vigueur",
    sub: "Décret n° 2025-748",
  },
  {
    stat: "9 mois",
    label: "Délai transitoire après trimestre",
    sub: "6 mois dès 01/01/2027",
  },
  {
    stat: "10 000 €",
    label: "Sanction par salarié concerné",
    sub: "Article L4741-1",
  },
  {
    stat: "1 clic",
    label: "Génération du CSV officiel",
    sub: "Format ADF Caisse des Dépôts",
  },
];

const TIMELINE = [
  {
    date: "2 août 2021",
    title: "Loi n° 2021-1018",
    description:
      "Création du Passeport de Prévention à l'article L4141-5 du Code du travail.",
  },
  {
    date: "28 avril 2025",
    title: "Ouverture aux organismes de formation",
    description:
      "La plateforme officielle accueille les déclarations des OF certifiés.",
  },
  {
    date: "2 août 2025",
    title: "Décret n° 2025-748",
    description:
      "Publication au Journal Officiel des modalités de déclaration employeur.",
  },
  {
    date: "16 mars 2026",
    title: "Obligation employeur en vigueur",
    description:
      "Espace déclaratif ouvert aux entreprises pour les formations réglementaires et habilitations.",
    highlight: true,
  },
  {
    date: "9 juillet 2026",
    title: "Import de fichier en masse",
    description:
      "Ouverture de la fonctionnalité d'import multi-déclarations au format CSV.",
  },
  {
    date: "1er octobre 2026",
    title: "Extension à toutes les formations",
    description:
      "Fin de la période transitoire. Toutes les formations santé-sécurité deviennent déclarables.",
  },
];

const FEATURES = [
  {
    icon: BadgeCheck,
    title: "Identification automatique des formations concernées",
    description:
      "Chaque type de formation dispose d'un flag « concernée PP ». Aucune formation éligible ne vous échappe : SST, CACES, habilitations électriques, travail en hauteur, ATEX, etc.",
  },
  {
    icon: FileSpreadsheet,
    title: "Export CSV au format officiel ADF",
    description:
      "Fichier conforme à la spécification de la Caisse des Dépôts : 20 colonnes, séparateur pipe, encodage UTF-8. Prêt à déposer dès l'ouverture de l'import en masse le 9 juillet 2026.",
  },
  {
    icon: Bell,
    title: "Alertes automatiques aux seuils J-60 / J-30 / J-7",
    description:
      "CertPilot surveille chaque formation et vous alerte par email avant l'échéance de déclaration. Vous choisissez les administrateurs destinataires.",
  },
  {
    icon: Shield,
    title: "Traçabilité horodatée pour l'audit",
    description:
      "Chaque déclaration est consignée avec une référence unique, la date, le lot concerné et le détail par salarié. Prêt pour un contrôle de l'inspection du travail.",
  },
  {
    icon: Users,
    title: "Gestion du NIR et des données salariés",
    description:
      "Le NIR (numéro de sécurité sociale) est obligatoire pour chaque déclaration. CertPilot le stocke chiffré et vous alerte sur les salariés dont le NIR est manquant avant l'export.",
  },
  {
    icon: Gavel,
    title: "Conformité RGPD et sécurité",
    description:
      "Hébergement en France, chiffrement des données sensibles, journalisation des accès. Le traitement des NIR respecte les obligations de la CNIL.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Centralisez vos formations dans CertPilot",
    description:
      "Import Excel ou saisie manuelle. Les formations éligibles au Passeport de Prévention sont automatiquement identifiées.",
  },
  {
    step: "2",
    title: "Complétez les données requises",
    description:
      "NIR des salariés concernés, modalité de formation (présentiel / distanciel / mixte), qualification du formateur, codes Formacode/RNCP si certifiante.",
  },
  {
    step: "3",
    title: "Générez le CSV en 1 clic",
    description:
      "Filtrez par année ou trimestre, cliquez sur « Télécharger le CSV Passeport Prévention ». Le fichier respecte le format officiel de la Caisse des Dépôts.",
  },
  {
    step: "4",
    title: "Déposez et confirmez",
    description:
      "Déposez le fichier sur prevention.moncompteformation.gouv.fr (dès le 09/07/2026), puis confirmez le dépôt dans CertPilot. L'historique des déclarations est conservé.",
  },
];

export default function PasseportPreventionPage() {
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
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-900">
              <AlertTriangle className="h-4 w-4" />
              Obligation en vigueur depuis le 16 mars 2026
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-[#173B56] sm:text-5xl lg:text-6xl">
              Passeport de{" "}
              <span className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Prévention
              </span>
              <br />
              <span className="text-3xl sm:text-4xl lg:text-5xl">
                déclarez en 1 clic, sans erreur
              </span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              CertPilot est le logiciel français qui{" "}
              <strong>automatise la déclaration</strong> de vos formations
              santé-sécurité au Passeport de Prévention national (décret n°
              2025-748). Export CSV officiel, alertes de relance, traçabilité
              complète pour l&apos;audit.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700"
              >
                Demander une démo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#calculateur"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-6 py-3.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
              >
                Calculer mon risque de non-conformité
              </Link>
            </div>

            <p className="mt-6 text-xs text-slate-500">
              Sources officielles : Légifrance · INRS · Ministère du Travail ·
              Caisse des Dépôts
            </p>
          </div>
        </section>

        {/* Key facts */}
        <section className="border-t border-slate-200 bg-white py-12">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {KEY_FACTS.map((fact) => (
                <div key={fact.label} className="text-center">
                  <p className="text-3xl font-black text-emerald-600 sm:text-4xl">
                    {fact.stat}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#173B56]">
                    {fact.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {fact.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Calculator */}
        <PPCalculator />

        {/* Qu'est-ce que le PP */}
        <section className="border-t border-slate-200 bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-4xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-black tracking-tight text-[#173B56] sm:text-4xl">
                Qu&apos;est-ce que le Passeport de Prévention ?
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Un dispositif national obligatoire, opéré par la Caisse des
                Dépôts pour le compte du Ministère du Travail.
              </p>
            </div>

            <div className="prose prose-slate mx-auto mt-10 max-w-none text-base leading-relaxed text-slate-700">
              <p>
                Le <strong>Passeport de Prévention</strong> est un registre
                national numérique qui recense l&apos;ensemble des formations
                en santé et sécurité au travail suivies par chaque salarié.
                Instauré par l&apos;<strong>article 6 de la loi n° 2021-1018
                du 2 août 2021</strong>, il est codifié à l&apos;
                <strong>article L4141-5 du Code du travail</strong>. Les
                modalités concrètes de déclaration ont été précisées par le{" "}
                <strong>décret n° 2025-748 du 1er août 2025</strong>, publié
                au Journal Officiel le 2 août 2025.
              </p>

              <h3 className="mt-8 text-xl font-bold text-[#173B56]">
                Un registre pour sécuriser la traçabilité des formations
              </h3>
              <p>
                Son objectif est double : permettre aux salariés de conserver
                une preuve pérenne de leurs formations (y compris en cas de
                changement d&apos;employeur), et donner aux employeurs un
                outil de pilotage pour vérifier les qualifications de leurs
                équipes en matière de prévention des risques professionnels.
              </p>

              <h3 className="mt-8 text-xl font-bold text-[#173B56]">
                Trois acteurs concernés
              </h3>
              <ul>
                <li>
                  <strong>Les organismes de formation</strong> déclarent
                  depuis le 1er septembre 2025.
                </li>
                <li>
                  <strong>Les employeurs</strong> déclarent depuis le{" "}
                  <strong>16 mars 2026</strong> — date d&apos;ouverture
                  effective de l&apos;espace déclaratif.
                </li>
                <li>
                  <strong>Les salariés</strong> pourront consulter leur
                  passeport individuel à compter du 4ème trimestre 2026.
                </li>
              </ul>

              <h3 className="mt-8 text-xl font-bold text-[#173B56]">
                Deux plateformes officielles à connaître
              </h3>
              <ul>
                <li>
                  <a
                    href="https://passeport-prevention.travail-emploi.gouv.fr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 underline hover:text-emerald-900"
                  >
                    passeport-prevention.travail-emploi.gouv.fr
                  </a>{" "}
                  — portail d&apos;information du Ministère du Travail.
                </li>
                <li>
                  <a
                    href="https://prevention.moncompteformation.gouv.fr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 underline hover:text-emerald-900"
                  >
                    prevention.moncompteformation.gouv.fr
                  </a>{" "}
                  — plateforme déclarative opérée par la Caisse des Dépôts.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="border-t border-slate-200 bg-slate-50 py-16 lg:py-20">
          <div className="mx-auto max-w-4xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-black tracking-tight text-[#173B56] sm:text-4xl">
                Calendrier officiel du déploiement
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                De la loi fondatrice à l&apos;obligation déclarative complète,
                les dates à retenir.
              </p>
            </div>

            <div className="mt-12">
              <ol className="relative border-l-2 border-emerald-200 pl-8">
                {TIMELINE.map((item) => (
                  <li key={item.date} className="mb-10 last:mb-0">
                    <div
                      className={`absolute -left-2.25 flex h-4 w-4 items-center justify-center rounded-full ${
                        item.highlight
                          ? "bg-emerald-600 ring-4 ring-emerald-100"
                          : "bg-emerald-400"
                      }`}
                    />
                    <div
                      className={`rounded-xl border p-5 ${
                        item.highlight
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <time
                          className={`text-xs font-bold uppercase tracking-wider ${
                            item.highlight
                              ? "text-emerald-700"
                              : "text-slate-500"
                          }`}
                        >
                          {item.date}
                        </time>
                        {item.highlight && (
                          <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                            En vigueur
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1 font-bold text-[#173B56]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Sanctions */}
        <section className="border-t border-slate-200 bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-4xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-sm font-semibold text-red-800">
                <Gavel className="h-4 w-4" />
                Risque juridique
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-[#173B56] sm:text-4xl">
                Ce que vous risquez en cas de non-conformité
              </h2>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-red-700" />
                  <h3 className="font-bold text-red-900">Sanctions pénales</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-red-900">
                  L&apos;<strong>article L4741-1 du Code du travail</strong>{" "}
                  prévoit une amende de <strong>10 000 €</strong> « autant de
                  fois qu&apos;il y a de travailleurs concernés par
                  l&apos;infraction ». En cas de <strong>récidive</strong>{" "}
                  dans l&apos;année, la peine peut atteindre{" "}
                  <strong>1 an d&apos;emprisonnement et 30 000 €</strong>.
                </p>
                <p className="mt-3 text-xs italic text-red-700">
                  Pour une entreprise de 100 salariés en infraction,
                  l&apos;exposition théorique maximale atteint 1 000 000 €.
                </p>
              </div>

              <div className="rounded-xl border border-slate-300 bg-slate-50 p-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-slate-700" />
                  <h3 className="font-bold text-[#173B56]">
                    Responsabilité civile et AT/MP
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">
                  L&apos;absence de traçabilité d&apos;une formation
                  obligatoire peut caractériser un manquement à l&apos;
                  <strong>
                    obligation de sécurité de l&apos;employeur (article
                    L4121-1)
                  </strong>
                  . En cas d&apos;accident du travail impliquant un salarié
                  non déclaré comme formé, la <strong>faute inexcusable</strong>{" "}
                  peut être retenue : majoration de rente, dommages et
                  intérêts, réparation intégrale du préjudice.
                </p>
                <p className="mt-3 text-xs italic text-slate-600">
                  Le coût moyen d&apos;un sinistre avec faute inexcusable se
                  chiffre souvent en centaines de milliers d&apos;euros.
                </p>
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-slate-500">
              Références : Légifrance —{" "}
              <a
                href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043907990"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#173B56]"
              >
                L4141-5
              </a>
              {" · "}
              <a
                href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032376248"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#173B56]"
              >
                L4741-1
              </a>
              {" · "}
              <a
                href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000035640828"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#173B56]"
              >
                L4121-1
              </a>
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-slate-200 bg-slate-50 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-black tracking-tight text-[#173B56] sm:text-4xl">
                Comment CertPilot vous met en conformité
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Une suite complète pensée pour les responsables RH et HSE qui
                doivent sécuriser leur déclaration Passeport Prévention.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    <feature.icon className="h-5 w-5 text-emerald-700" />
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

        {/* Steps */}
        <section className="border-t border-slate-200 bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-4xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-black tracking-tight text-[#173B56] sm:text-4xl">
                Votre conformité en 4 étapes
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                De l&apos;import de vos données au dépôt officiel sur la
                plateforme de la Caisse des Dépôts.
              </p>
            </div>

            <div className="mt-12 space-y-8">
              {STEPS.map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-black text-white">
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

        {/* Différenciateur */}
        <section className="border-t border-slate-200 bg-linear-to-br from-emerald-50 to-teal-50 py-16 lg:py-20">
          <div className="mx-auto max-w-4xl px-6">
            <div className="rounded-2xl border border-emerald-200 bg-white p-8 shadow-xl shadow-emerald-900/5 lg:p-12">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
                    <CheckCircle2 className="h-3 w-3" />
                    Prêt dès aujourd&apos;hui
                  </div>
                  <h2 className="mt-3 text-2xl font-black tracking-tight text-[#173B56] sm:text-3xl">
                    Le seul logiciel français qui génère le CSV officiel dès
                    aujourd&apos;hui
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-slate-700">
                    L&apos;ouverture officielle de l&apos;import en masse sur{" "}
                    <em>prevention.moncompteformation.gouv.fr</em> est prévue
                    pour le <strong>9 juillet 2026</strong>. CertPilot produit
                    déjà le fichier au <strong>format ADF exact</strong>{" "}
                    attendu par la Caisse des Dépôts — 20 colonnes, séparateur
                    pipe, encodage UTF-8. Vous préparez votre stock de
                    déclarations dès maintenant, et vous les déposez en 1 clic
                    dès l&apos;ouverture.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-slate-200 bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-4xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-black tracking-tight text-[#173B56] sm:text-4xl">
                Questions fréquentes sur le Passeport de Prévention
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Les réponses aux 10 questions les plus posées par les
                responsables RH et HSE.
              </p>
            </div>

            <div className="mt-12 space-y-4">
              {[
                {
                  q: "Qu'est-ce que le Passeport de Prévention ?",
                  a: "Un registre national numérique instauré par la loi n° 2021-1018 du 2 août 2021, codifié à l'article L4141-5 du Code du travail. Il recense toutes les formations santé-sécurité suivies par un salarié. Opéré par la Caisse des Dépôts pour le compte du Ministère du Travail.",
                },
                {
                  q: "Quand la déclaration devient-elle obligatoire ?",
                  a: "L'obligation employeur est en vigueur depuis le 16 mars 2026 pour les formations réglementaires et les habilitations. Elle s'étend à l'ensemble des formations santé-sécurité le 1er octobre 2026.",
                },
                {
                  q: "Quel est le délai pour déclarer ?",
                  a: "Jusqu'au 31 décembre 2026 : 9 mois après la fin du trimestre de formation. À partir du 1er janvier 2027 : 6 mois.",
                },
                {
                  q: "Quelles sont les sanctions en cas de défaut de déclaration ?",
                  a: "L'article L4741-1 du Code du travail prévoit une amende de 10 000 € par salarié concerné. En récidive : 1 an d'emprisonnement et 30 000 €. S'ajoute le risque civil (faute inexcusable en cas d'accident, article L4121-1).",
                },
                {
                  q: "Quelles formations dois-je déclarer ?",
                  a: "Les formations obligatoires réglementaires (travail en hauteur, ATEX, gestes et postures), les formations à autorisation / habilitation (CACES R482/R486/R489/R490, NF C 18-510), le SST et MAC SST, puis toutes les formations santé-sécurité à partir du 1er octobre 2026.",
                },
                {
                  q: "Toutes les entreprises sont-elles concernées ?",
                  a: "Oui, toutes tailles et secteurs privés, plus la fonction publique (extension par le décret 2025-748). Dès lors que vous dispensez ou financez des formations santé-sécurité, vous êtes concerné.",
                },
                {
                  q: "Dans quel format doit-on déclarer ?",
                  a: "Saisie manuelle disponible depuis le 16 mars 2026 sur prevention.moncompteformation.gouv.fr. Import en masse (fichier CSV multi-déclarations) disponible à partir du 9 juillet 2026. CertPilot génère ce fichier dès aujourd'hui au format ADF attendu.",
                },
                {
                  q: "Le NIR des salariés est-il obligatoire ?",
                  a: "Oui. Le numéro de sécurité sociale (13 chiffres, hors clé) est requis pour chaque déclaration. CertPilot permet sa saisie sécurisée et vous alerte avant export si un NIR manque.",
                },
                {
                  q: "Comment prouver que j'ai bien déclaré ?",
                  a: "CertPilot conserve l'historique complet : date de génération du CSV, référence unique du lot, liste des salariés et formations concernées, et un mécanisme d'annulation / re-déclaration si correction nécessaire. Idéal pour un contrôle de l'inspection du travail.",
                },
                {
                  q: "Un salarié a-t-il accès à son Passeport de Prévention ?",
                  a: "L'ouverture de l'espace salarié sur la plateforme officielle est prévue pour le 4ème trimestre 2026. En attendant, CertPilot fournit à chaque salarié un passeport formation numérique avec QR code pour consultation immédiate.",
                },
              ].map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm open:border-emerald-200 open:bg-emerald-50"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 font-bold text-[#173B56] group-open:text-emerald-900">
                    <span>{faq.q}</span>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform group-open:rotate-45 group-open:bg-emerald-100 group-open:text-emerald-700">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed text-slate-700">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="border-t border-slate-200 bg-[#173B56] py-16 lg:py-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <CalendarCheck2 className="mx-auto h-12 w-12 text-emerald-400" />
            <h2 className="mt-6 text-3xl font-black text-white sm:text-4xl">
              Prêt à sécuriser votre conformité Passeport Prévention ?
            </h2>
            <p className="mt-4 text-lg text-white/70">
              Rejoignez les entreprises françaises qui automatisent déjà leurs
              déclarations avec CertPilot. Démo gratuite sans engagement.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-sm font-semibold text-white shadow-lg transition-all hover:bg-emerald-400"
              >
                Demander une démo gratuite
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/solutions"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/5"
              >
                Voir toutes les solutions
              </Link>
            </div>
          </div>
        </section>

        {/* Sources */}
        <section className="border-t border-slate-200 bg-slate-50 py-12">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center text-sm font-bold uppercase tracking-wider text-slate-500">
              Sources officielles
            </h2>
            <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  label: "Décret n° 2025-748 (JO du 02/08/2025)",
                  url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000052032325",
                },
                {
                  label: "Article L4141-5 Code du travail",
                  url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043907990",
                },
                {
                  label: "Article L4741-1 (sanctions)",
                  url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032376248",
                },
                {
                  label: "Loi n° 2021-1018 art. 6",
                  url: "https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000043884456",
                },
                {
                  label: "Portail officiel du Ministère",
                  url: "https://passeport-prevention.travail-emploi.gouv.fr/",
                },
                {
                  label: "Plateforme déclarative (Caisse des Dépôts)",
                  url: "https://prevention.moncompteformation.gouv.fr/",
                },
                {
                  label: "Service-Public.fr — obligations employeur",
                  url: "https://entreprendre.service-public.gouv.fr/vosdroits/F39616",
                },
                {
                  label: "INRS — focus juridique Passeport Prévention",
                  url: "https://www.inrs.fr/publications/juridique/focus-juridiques/focus-juridique-passeport-prevention-contenu-modalites-a-mettre-en-oeuvre.html",
                },
              ].map((src) => (
                <a
                  key={src.url}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 transition-all hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <FileText className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="text-slate-700 hover:text-[#173B56]">
                    {src.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} CertPilot. Tous droits réservés.</p>
          <nav className="flex flex-wrap gap-4">
            <Link href="/" className="hover:text-[#173B56]">
              Accueil
            </Link>
            <Link href="/solutions" className="hover:text-[#173B56]">
              Solutions
            </Link>
            <Link href="/solutions/sst" className="hover:text-[#173B56]">
              SST
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