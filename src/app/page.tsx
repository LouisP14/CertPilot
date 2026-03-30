import type { Metadata } from "next";
import type { ComponentType } from "react";

import { CookieBanner } from "@/components/cookie-banner";
import {
  ArrowRight,
  Bell,
  Calendar,
  Check,
  FileText,
  GraduationCap,
  Mail,
  PenTool,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "CertPilot - Gestion des Formations et Habilitations | Logiciel SaaS B2B",
  description:
    "CertPilot centralise la gestion de vos habilitations et formations professionnelles. Alertes automatiques, convocations, signatures électroniques, passeport formation PDF. Solution B2B à partir de 49€ HT/mois.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CertPilot - Zéro habilitation expirée, zéro surprise en audit",
    description:
      "Centralisez le suivi de vos CACES, SST et habilitations électriques. Alertes automatiques, convocations en 1 clic, passeport formation avec QR code.",
    url: "/",
  },
};

// JSON-LD Structured Data for Google
function JsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.certpilot.eu";

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "CertPilot",
        description:
          "Plateforme SaaS de gestion des formations et habilitations professionnelles",
        inLanguage: "fr-FR",
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "CertPilot",
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/logo.png`,
        },
        contactPoint: {
          "@type": "ContactPoint",
          email: "contact@certpilot.eu",
          contactType: "sales",
          availableLanguage: "French",
        },
        sameAs: [],
      },
      {
        "@type": "SoftwareApplication",
        name: "CertPilot",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description:
          "Logiciel SaaS de gestion des formations, habilitations et certifications pour les entreprises. Alertes automatiques, convocations, signatures électroniques.",
        offers: [
          {
            "@type": "Offer",
            name: "Starter",
            price: "49",
            priceCurrency: "EUR",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: "49",
              priceCurrency: "EUR",
              unitText: "MONTH",
            },
            description: "Pour 1 à 20 employés",
          },
          {
            "@type": "Offer",
            name: "Pro",
            price: "149",
            priceCurrency: "EUR",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: "149",
              priceCurrency: "EUR",
              unitText: "MONTH",
            },
            description: "Pour 21 à 100 employés",
          },
          {
            "@type": "Offer",
            name: "Business",
            price: "349",
            priceCurrency: "EUR",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: "349",
              priceCurrency: "EUR",
              unitText: "MONTH",
            },
            description: "Pour 101 à 300 employés",
          },
          {
            "@type": "Offer",
            name: "Enterprise",
            priceCurrency: "EUR",
            description: "Plus de 300 employés - sur devis",
          },
        ],
        featureList: [
          "Gestion des employés et fiches complètes",
          "Suivi des habilitations et certifications",
          "Alertes automatiques avant expiration",
          "Planification des sessions de formation",
          "Convocations automatiques par email",
          "Signature électronique",
          "Passeport formation PDF avec QR Code",
          "Import / Export Excel",
          "Audit trail complet",
          "Export PDF illimité",
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Qu'est-ce que CertPilot ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "CertPilot est une plateforme SaaS de gestion des formations et habilitations professionnelles. Elle permet de centraliser le suivi des certifications, automatiser les alertes d'expiration, générer les convocations et simplifier les audits de conformité.",
            },
          },
          {
            "@type": "Question",
            name: "Combien coûte CertPilot ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "CertPilot propose des plans à partir de 49€ HT/mois pour 1 à 20 employés. Le plan Pro (21-100 employés) est à 149€ HT/mois, Business (101-300) à 349€ HT/mois. Au-delà de 300 employés, contactez-nous pour un devis. Toutes les fonctionnalités sont incluses dans chaque plan. Essai gratuit 14 jours.",
            },
          },
          {
            "@type": "Question",
            name: "Quelles formations peut-on gérer avec CertPilot ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "CertPilot permet de gérer tous types de formations et habilitations : SST, CACES, habilitations électriques, espaces confinés, ATEX, travail en hauteur, et bien d'autres. Le catalogue est entièrement personnalisable.",
            },
          },
          {
            "@type": "Question",
            name: "Comment fonctionne le système d'alertes ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "CertPilot surveille automatiquement les dates d'expiration de toutes les habilitations. Vous configurez les seuils d'alerte (30, 60 ou 90 jours avant expiration) et recevez des notifications par email et dans le tableau de bord. Plus aucune habilitation n'expire sans que vous le sachiez.",
            },
          },
          {
            "@type": "Question",
            name: "CertPilot est-il conforme au RGPD ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "CertPilot est conçu pour répondre aux exigences RGPD (minimisation, sécurité, traçabilité, gestion des accès). Les données sont hébergées en Europe (Google Cloud europe-west4), chiffrées en transit et au repos. Un DPA (Data Processing Agreement) est disponible. L'accès aux données est isolé par entreprise.",
            },
          },
          {
            "@type": "Question",
            name: "Peut-on générer des convocations automatiquement ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Oui, CertPilot génère et envoie automatiquement les convocations de formation par email. Chaque convocation contient le lieu, la date, les horaires et les informations pratiques. Les employés peuvent confirmer leur présence directement.",
            },
          },
          {
            "@type": "Question",
            name: "Qu'est-ce que le passeport formation ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Le passeport formation est un document PDF récapitulant toutes les formations et habilitations d'un employé. Il inclut un QR code de vérification, les dates de validité et l'historique complet. Compatible avec la logique du Passeport de Prévention, il peut être généré en un clic depuis CertPilot.",
            },
          },
          {
            "@type": "Question",
            name: "Combien de temps faut-il pour démarrer avec CertPilot ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "La prise en main est immédiate. Créez votre compte, ajoutez vos employés et leurs habilitations, et CertPilot commence à surveiller les échéances. L'import peut se faire manuellement ou depuis un fichier Excel. La plupart des entreprises sont opérationnelles en moins d'une journée.",
            },
          },
          {
            "@type": "Question",
            name: "CertPilot gère-t-il la signature électronique ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Oui, CertPilot intègre la signature électronique pour les attestations de présence et les feuilles d'émargement. Les participants signent directement sur tablette ou ordinateur, et les documents signés sont archivés avec horodatage.",
            },
          },
          {
            "@type": "Question",
            name: "Peut-on exporter les données pour un audit ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Oui, CertPilot permet d'exporter les données en PDF et Excel : habilitations, employés, sessions de formation et historique des alertes. Un audit trail trace les actions clés et facilite la préparation documentaire en cas de contrôle.",
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

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-linear-to-b from-slate-50 to-white">
      <JsonLd />
      {/* Cookie Consent Banner */}
      <CookieBanner />

      {/* Fond décoratif */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-125 w-200 -translate-x-1/2 rounded-full bg-linear-to-br from-emerald-100/60 to-teal-50/40 blur-3xl" />
        <div className="absolute top-96 -right-32 h-96 w-96 rounded-full bg-linear-to-br from-sky-100/50 to-blue-50/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-linear-to-tr from-emerald-50/50 to-transparent blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-black tracking-tight text-[#173B56]">
              CertPilot
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#fonctionnalites"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-[#173B56]"
            >
              Fonctionnalités
            </a>
            <Link
              href="/solutions"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-[#173B56]"
            >
              Solutions
            </Link>
            <a
              href="#tarifs"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-[#173B56]"
            >
              Tarifs
            </a>
            <Link
              href="/blog"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-[#173B56]"
            >
              Blog
            </Link>
            <a
              href="#contact"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-[#173B56]"
            >
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-semibold text-slate-600 transition-colors hover:text-[#173B56] sm:block"
            >
              Connexion
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl bg-[#173B56] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-[#1e4a6b] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173B56] focus-visible:ring-offset-2"
            >
              Demander une démo
            </Link>
          </div>
        </div>
      </header>

      <main className="relative flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-800">
                <Sparkles className="h-4 w-4" />
                Essai gratuit 14 jours — sans engagement
              </div>

              <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-[#173B56] sm:text-5xl lg:text-6xl">
                Zéro habilitation{" "}
                <span className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  expirée.
                </span>{" "}
                Zéro surprise en audit.
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                Centralisez le suivi de vos CACES, SST et habilitations
                électriques. Alertes automatiques, convocations en 1 clic,
                passeport formation avec QR code. Remplacez vos fichiers Excel
                en moins d&apos;une journée.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                >
                  Démarrer l&apos;essai gratuit
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#demo"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-[#173B56] transition-all hover:border-slate-400 hover:bg-slate-50"
                >
                  <PlayIcon />
                  Voir la démo en 2 min
                </a>
              </div>

              <div className="mt-10 flex items-center gap-6 border-t border-slate-200 pt-8">
                <div>
                  <p className="text-2xl font-black text-emerald-600">-95%</p>
                  <p className="text-sm text-slate-500">de retards habilitations</p>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <div>
                  <p className="text-2xl font-black text-emerald-600">2h</p>
                  <p className="text-sm text-slate-500">gagnées / semaine</p>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <div>
                  <p className="text-2xl font-black text-emerald-600">
                    1 jour
                  </p>
                  <p className="text-sm text-slate-500">pour être opérationnel</p>
                </div>
              </div>
            </div>

            {/* Hub orbital */}
            <div className="relative hidden lg:block">
              <FeatureHub />
            </div>
            {/* Mobile fallback */}
            <div className="relative lg:hidden">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
                <img
                  src="/screenshots/Mock.png"
                  alt="CertPilot - Tableau de bord"
                  className="w-full h-auto"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="fonctionnalites"
          className="border-t border-slate-200 bg-white py-20 lg:py-28"
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <p className="text-sm font-semibold text-emerald-600">
                Fonctionnalités
              </p>
              <h2 className="mt-2 text-3xl font-black text-[#173B56] sm:text-4xl">
                Tout ce dont vous avez besoin
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-600">
                Une plateforme complète pour gérer vos formations et
                habilitations, de A à Z.
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={Users}
                title="Gestion des employés"
                description="Fiches complètes avec photo, poste, service et historique. Passeport formation PDF avec QR code, compatible Passeport de Prévention."
              />
              <FeatureCard
                icon={Shield}
                title="Suivi des habilitations"
                description="Visualisez en un coup d'œil les certifications de chaque collaborateur et leur date d'expiration."
              />
              <FeatureCard
                icon={Bell}
                title="Alertes automatiques"
                description="Recevez des notifications avant l'expiration des habilitations. Seuils personnalisables."
              />
              <FeatureCard
                icon={Calendar}
                title="Planification des sessions"
                description="Organisez vos sessions de formation, gérez les inscriptions et suivez les présences."
              />
              <FeatureCard
                icon={FileText}
                title="Convocations automatiques"
                description="Générez et envoyez automatiquement les convocations par email avec toutes les informations."
              />
              <FeatureCard
                icon={PenTool}
                title="Signature électronique"
                description="Faites signer les attestations de présence directement sur tablette ou ordinateur."
              />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="border-t border-slate-200 bg-linear-to-b from-slate-50 to-white py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <p className="text-sm font-semibold text-emerald-600">
                Ils nous font confiance
              </p>
              <h2 className="mt-2 text-3xl font-black text-[#173B56] sm:text-4xl">
                Ce que nos clients en disent
              </h2>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <TestimonialCard
                quote="Avant CertPilot, on gérait 200 habilitations sur Excel. On a découvert 12 CACES expirés dès le premier import. Aujourd'hui, plus aucun oubli."
                name="Responsable Maintenance"
                company="Industrie agroalimentaire, 180 employés"
              />
              <TestimonialCard
                quote="Lors du dernier audit DREAL, j'ai sorti tous les justificatifs en 5 minutes. L'inspecteur n'en revenait pas. Avant, ça me prenait une demi-journée."
                name="Responsable QHSE"
                company="BTP, 95 employés"
              />
              <TestimonialCard
                quote="Les alertes automatiques nous ont évité 3 arrêts de chantier cette année. Le ROI est immédiat. Je le recommande à tous les responsables sécurité."
                name="Directeur des opérations"
                company="Logistique & transport, 320 employés"
              />
            </div>
          </div>
        </section>

        {/* Video Demo */}
        <section
          id="demo"
          className="border-t border-slate-200 bg-white py-20 lg:py-28"
        >
          <div className="mx-auto max-w-4xl px-6">
            <div className="text-center">
              <p className="text-sm font-semibold text-emerald-600">
                Démo en vidéo
              </p>
              <h2 className="mt-2 text-3xl font-black text-[#173B56] sm:text-4xl">
                Découvrez CertPilot en 2 minutes
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-600">
                Voyez comment centraliser vos habilitations, automatiser vos
                alertes et générer vos passeports formation.
              </p>
            </div>

            <div className="mt-12 relative">
              <div className="absolute -inset-4 rounded-3xl bg-linear-to-br from-emerald-500/10 to-teal-500/10 blur-2xl" />
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-2xl shadow-slate-900/20">
                <video
                  className="h-full w-full object-contain"
                  controls
                  preload="metadata"
                >
                  <source src="/demo.mp4" type="video/mp4" />
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              </div>
            </div>
          </div>
        </section>

        {/* Tarifs */}
        <section
          id="tarifs"
          className="border-t border-slate-200 bg-linear-to-b from-slate-50 to-white py-20 lg:py-28"
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <p className="text-sm font-semibold text-emerald-600">Tarifs</p>
              <h2 className="mt-2 text-3xl font-black text-[#173B56] sm:text-4xl">
                Un prix adapté à votre taille
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-600">
                Toutes les fonctionnalités sont incluses. Vous ne payez
                qu&apos;en fonction du nombre d&apos;employés à gérer.
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-5xl gap-6 lg:grid-cols-4">
              <PricingCard
                name="Starter"
                price={49}
                employees="1-20"
                featured={false}
              />
              <PricingCard
                name="Pro"
                price={149}
                employees="21-100"
                featured={true}
              />
              <PricingCard
                name="Business"
                price={349}
                employees="101-300"
                featured={false}
              />
              <PricingCard
                name="Enterprise"
                price={null}
                employees="300+"
                featured={false}
              />
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm text-slate-500">
                Besoin d&apos;un devis sur mesure ?{" "}
                <Link
                  href="/contact"
                  className="font-semibold text-[#173B56] hover:underline"
                >
                  Contactez-nous
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-slate-200 bg-white py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-6">
            <div className="text-center">
              <p className="text-sm font-semibold text-emerald-600">FAQ</p>
              <h2 className="mt-2 text-3xl font-black text-[#173B56] sm:text-4xl">
                Questions fréquentes
              </h2>
            </div>

            <div className="mt-12 space-y-4">
              <FaqItem
                question="Combien de temps faut-il pour démarrer ?"
                answer="La prise en main est immédiate. Importez vos employés et habilitations depuis un fichier Excel, et CertPilot commence à surveiller les échéances. La plupart des entreprises sont opérationnelles en moins d'une journée."
              />
              <FaqItem
                question="Quelles formations peut-on gérer ?"
                answer="CertPilot gère tous types de formations et habilitations : CACES (R489, R486, R482...), SST/MAC SST, habilitations électriques (NF C 18-510), ATEX, travail en hauteur, espaces confinés, et bien d'autres. Le catalogue est entièrement personnalisable."
              />
              <FaqItem
                question="Comment fonctionnent les alertes automatiques ?"
                answer="Vous configurez les seuils d'alerte (30, 60 ou 90 jours avant expiration) et CertPilot envoie automatiquement des notifications par email et dans le tableau de bord. Plus aucune habilitation n'expire sans que vous le sachiez."
              />
              <FaqItem
                question="CertPilot est-il conforme au RGPD ?"
                answer="Oui. Données hébergées en Europe, chiffrées en transit et au repos, accès isolé par entreprise, audit trail complet. Un DPA (Data Processing Agreement) est disponible sur demande."
              />
              <FaqItem
                question="Peut-on exporter les données pour un audit ?"
                answer="Oui, exportez en PDF et Excel : habilitations, employés, sessions de formation et historique. L'audit trail trace toutes les actions et facilite la préparation documentaire en cas de contrôle DREAL ou inspection du travail."
              />
              <FaqItem
                question="CertPilot est-il compatible avec le Passeport de Prévention ?"
                answer="Oui. CertPilot génère un passeport formation numérique pour chaque employé avec QR code de vérification, conforme à la logique du Passeport de Prévention (moncompteformation.gouv.fr). Vous pouvez exporter les données de formation pour alimenter le dispositif national."
              />
              <FaqItem
                question="Y a-t-il un engagement de durée ?"
                answer="Non. Vous pouvez résilier à tout moment, sans frais. L'abonnement annuel offre simplement une réduction de 17% par rapport au mensuel."
              />
            </div>
          </div>
        </section>

        {/* CTA Contact */}
        <section
          id="contact"
          className="border-t border-slate-200 bg-[#173B56] py-20 lg:py-28"
        >
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              Prêt à simplifier la gestion de vos formations ?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
              Demandez une démonstration personnalisée et découvrez comment
              CertPilot peut transformer votre quotidien.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-sm font-semibold text-white shadow-lg transition-all hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#173B56]"
              >
                Demander une démo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center text-white/60">
              <a
                href="mailto:contact@certpilot.eu"
                className="flex items-center gap-2 transition-colors hover:text-white"
              >
                <Mail className="h-5 w-5" />
                contact@certpilot.eu
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          {/* Main footer content */}
          <div className="grid gap-8 md:grid-cols-5">
            {/* Brand */}
            <div className="md:col-span-1">
              <span className="text-lg font-black text-[#173B56]">
                CertPilot
              </span>
              <p className="mt-2 text-sm text-slate-500">
                La solution complète pour gérer les formations et habilitations
                de vos équipes.
              </p>
            </div>

            {/* Solutions */}
            <div>
              <h4 className="font-semibold text-[#173B56]">Solutions</h4>
              <nav className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
                <Link href="/solutions/caces" className="hover:text-[#173B56]">
                  Gestion CACES
                </Link>
                <Link href="/solutions/sst" className="hover:text-[#173B56]">
                  Suivi SST
                </Link>
                <Link
                  href="/solutions/habilitation-electrique"
                  className="hover:text-[#173B56]"
                >
                  Habilitations électriques
                </Link>
                <Link href="/solutions" className="hover:text-[#173B56]">
                  Toutes les solutions
                </Link>
              </nav>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-semibold text-[#173B56]">Navigation</h4>
              <nav className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
                <a href="#fonctionnalites" className="hover:text-[#173B56]">
                  Fonctionnalités
                </a>
                <a href="#tarifs" className="hover:text-[#173B56]">
                  Tarifs
                </a>
                <Link href="/contact" className="hover:text-[#173B56]">
                  Contact
                </Link>
                <Link href="/login" className="hover:text-[#173B56]">
                  Connexion
                </Link>
                <Link href="/blog" className="hover:text-[#173B56]">
                  Blog
                </Link>
                <Link href="/comparaison" className="hover:text-[#173B56]">
                  CertPilot vs Excel
                </Link>
                <Link href="/checklist" className="hover:text-[#173B56]">
                  Checklist gratuite
                </Link>
              </nav>
            </div>

            {/* Légal */}
            <div>
              <h4 className="font-semibold text-[#173B56]">
                Informations légales
              </h4>
              <nav className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
                <Link
                  href="/legal/mentions-legales"
                  className="hover:text-[#173B56]"
                >
                  Mentions légales
                </Link>
                <Link
                  href="/legal/confidentialite"
                  className="hover:text-[#173B56]"
                >
                  Politique de confidentialité
                </Link>
                <Link href="/legal/cgu" className="hover:text-[#173B56]">
                  CGU
                </Link>
                <Link href="/legal/cgv" className="hover:text-[#173B56]">
                  CGV
                </Link>
                <Link href="/legal/dpa" className="hover:text-[#173B56]">
                  DPA (RGPD)
                </Link>
                <Link href="/legal/securite" className="hover:text-[#173B56]">
                  Sécurité & disponibilité
                </Link>
                <Link href="/legal/cookies" className="hover:text-[#173B56]">
                  Cookies
                </Link>
              </nav>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-[#173B56]">Contact</h4>
              <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
                <a
                  href="mailto:contact@certpilot.eu"
                  className="hover:text-[#173B56]"
                >
                  contact@certpilot.eu
                </a>
                <a
                  href="https://www.linkedin.com/in/certpilot-france-88415b3ab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-[#173B56]"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 flex flex-col items-center justify-center border-t border-slate-200 pt-8">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} CertPilot. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-emerald-200 hover:shadow-lg">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[#173B56]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {description}
      </p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  employees,
  featured,
}: {
  name: string;
  price: number | null;
  employees: string;
  featured: boolean;
}) {
  const yearlyPrice = price ? Math.round(price * 10) : null;

  return (
    <div
      className={`relative flex flex-col rounded-2xl p-6 ${
        featured
          ? "border-2 border-emerald-500 bg-white shadow-xl shadow-emerald-500/10"
          : "border border-slate-200 bg-white"
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
          Populaire
        </div>
      )}

      <h3 className="text-lg font-semibold text-[#173B56]">{name}</h3>
      <p className="mt-1 text-sm text-slate-500">{employees} employés</p>

      <div className="mt-4">
        {price ? (
          <>
            <span className="text-4xl font-black text-[#173B56]">{price}€</span>
            <span className="text-slate-500">/mois HT</span>
          </>
        ) : (
          <span className="text-3xl font-black text-[#173B56]">Sur devis</span>
        )}
      </div>

      {yearlyPrice ? (
        <>
          <p className="mt-2 text-sm font-semibold text-emerald-700">
            {yearlyPrice}€/an HT
          </p>
          <p className="text-xs text-slate-500">Économisez 17% en annuel</p>
        </>
      ) : (
        <p className="mt-2 text-sm text-slate-500">
          Tarif adapté à vos besoins
        </p>
      )}

      <div className="mt-6 space-y-3">
        <IncludedFeature>Toutes les fonctionnalités</IncludedFeature>
        <IncludedFeature>Import / Export Excel</IncludedFeature>
        <IncludedFeature>Support prioritaire</IncludedFeature>
        <IncludedFeature>Mises à jour incluses</IncludedFeature>
        <IncludedFeature>Export PDF illimité</IncludedFeature>
      </div>

      <div className="mt-6 flex-1" />

      <Link
        href={`/contact?plan=${name.toLowerCase()}`}
        className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
          featured
            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700"
            : "border border-slate-300 bg-white text-[#173B56] hover:border-slate-400 hover:bg-slate-50"
        }`}
      >
        {price ? "Démarrer l\u0027essai gratuit" : "Nous contacter"}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function IncludedFeature({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
        <Check className="h-3 w-3 text-emerald-600" />
      </div>
      <span className="text-sm text-slate-700">{children}</span>
    </div>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group rounded-2xl border border-slate-200 bg-white transition-all hover:border-emerald-200 [[open]]:border-emerald-200 [[open]]:shadow-sm">
      <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-left text-sm font-semibold text-[#173B56] [&::-webkit-details-marker]:hidden">
        {question}
        <svg
          className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-6 pb-5 text-sm leading-relaxed text-slate-600">
        {answer}
      </div>
    </details>
  );
}

function TestimonialCard({
  quote,
  name,
  company,
}: {
  quote: string;
  name: string;
  company: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex gap-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className="h-5 w-5 text-amber-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="flex-1 text-sm leading-relaxed text-slate-600 italic">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="text-sm font-semibold text-[#173B56]">{name}</p>
        <p className="text-xs text-slate-500">{company}</p>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 2.5v11l9.5-5.5L4 2.5z" />
    </svg>
  );
}

// ============ FEATURE HUB ============

const HUB_NODES = [
  { label: "Alertes\nautomatiques", angle: 270, color: "#dc2626", bg: "#fef2f2", icon: "M16 3C9.4 3 4 8.4 4 15c0 9.5-3 12-3 12h30s-3-2.5-3-12c0-6.6-5.4-12-12-12z|M12.5 27a3.5 3.5 0 0 0 7 0" },
  { label: "Convocations\nautomatiques", angle: 315, color: "#2563eb", bg: "#eff6ff", icon: "M3 8l13 8 13-8|M3 8v16h26V8" },
  { label: "Signature\nélectronique", angle: 0, color: "#16a34a", bg: "#f0fdf4", icon: "M4 26c0 0 3-3 7-3s6 4 10 4 6-3 6-3|M20 6l4 4L12 22H8v-4L20 6z" },
  { label: "Passeport\nformation", angle: 45, color: "#7c3aed", bg: "#f5f3ff", icon: "M5 3h22v26H5z|M10 11h12|M10 15h12|M10 19h8" },
  { label: "Audit\nTrail", angle: 90, color: "#0ea5e9", bg: "#f0f9ff", icon: "M3 16l5 0 3-7 5 14 5-11 4 4 4 0" },
  { label: "Suivi\nbudget", angle: 135, color: "#10b981", bg: "#ecfdf5", icon: "M3 4h26v24H3z|M3 11h26|M16 4v24" },
  { label: "Planning\n& Sessions", angle: 180, color: "#d97706", bg: "#fffbeb", icon: "M3 5h26v24H3z|M3 13h26|M10 3v5|M22 3v5" },
  { label: "Détection\ndes besoins", angle: 225, color: "#a21caf", bg: "#fdf4ff", icon: "M13 5a8 8 0 1 0 0 16 8 8 0 0 0 0-16z|M19 19l8 8" },
];

function FeatureHub() {
  const r = 210;
  const cx = 250;
  const cy = 250;

  return (
    <div className="relative mx-auto" style={{ width: 500, height: 500 }}>
      {/* SVG rings + connectors */}
      <svg
        className="absolute inset-0"
        viewBox="0 0 500 500"
        fill="none"
      >
        {/* Dot grid */}
        <defs>
          <pattern id="dots" x="0" y="0" width="25" height="25" patternUnits="userSpaceOnUse">
            <circle cx="12.5" cy="12.5" r="0.8" fill="rgba(16,185,129,0.15)" />
          </pattern>
        </defs>
        <circle cx={cx} cy={cy} r="245" fill="url(#dots)" />

        {/* Orbital rings */}
        <circle cx={cx} cy={cy} r={r} stroke="rgba(16,185,129,0.12)" strokeWidth="1.5" strokeDasharray="6 8" />
        <circle cx={cx} cy={cy} r={r * 0.55} stroke="rgba(16,185,129,0.08)" strokeWidth="1" strokeDasharray="4 10" />

        {/* Connector lines + traveling dots */}
        {HUB_NODES.map((node, i) => {
          const rad = (node.angle * Math.PI) / 180;
          const nx = cx + r * Math.cos(rad);
          const ny = cy + r * Math.sin(rad);
          const sx = cx + 55 * Math.cos(rad);
          const sy = cy + 55 * Math.sin(rad);
          return (
            <g key={i}>
              <line
                x1={sx} y1={sy} x2={nx} y2={ny}
                stroke="rgba(16,185,129,0.18)" strokeWidth="1.2" strokeDasharray="4 6"
              />
              <circle r="3" fill="#16a34a" opacity="0.6">
                <animateMotion
                  dur={`${3 + i * 0.2}s`}
                  repeatCount="indefinite"
                  begin={`${-i * 0.4}s`}
                  path={`M${sx},${sy} L${nx},${ny}`}
                />
              </circle>
            </g>
          );
        })}
      </svg>

      {/* Center logo */}
      <div
        className="absolute flex flex-col items-center justify-center gap-2 rounded-3xl border border-emerald-200/50 bg-white shadow-xl"
        style={{
          width: 110, height: 110,
          left: cx - 55, top: cy - 55,
          boxShadow: "0 0 0 8px rgba(16,185,129,0.06), 0 0 0 20px rgba(16,185,129,0.03), 0 20px 60px rgba(15,23,42,0.12)",
          zIndex: 10,
        }}
      >
        <svg width="40" height="40" viewBox="0 0 52 52" fill="none">
          <path d="M26 4L8 11v14c0 11.5 8.3 22.3 18 24.8C35.7 47.3 44 36.5 44 25V11L26 4z" fill="rgba(16,185,129,0.12)" stroke="#16a34a" strokeWidth="2" />
          <polyline points="17,26 23,32 35,20" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <span className="text-xs font-extrabold tracking-tight text-[#173B56]">
          Cert<span className="text-emerald-600">Pilot</span>
        </span>
      </div>

      {/* Feature nodes */}
      {HUB_NODES.map((node, i) => {
        const rad = (node.angle * Math.PI) / 180;
        const nx = cx + r * Math.cos(rad);
        const ny = cy + r * Math.sin(rad);
        const paths = node.icon.split("|");

        return (
          <div
            key={i}
            className="absolute flex flex-col items-center gap-1.5"
            style={{
              left: nx, top: ny,
              transform: "translate(-50%, -50%)",
              zIndex: 10,
              animation: `hubFloat${i % 4} ${4.5 + i * 0.3}s ease-in-out infinite`,
            }}
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl border bg-white shadow-md transition-transform hover:scale-110"
              style={{
                borderColor: `${node.color}20`,
                background: `linear-gradient(135deg, #fff 60%, ${node.bg})`,
              }}
            >
              <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                {paths.map((d, j) => (
                  <path
                    key={j}
                    d={d}
                    stroke={node.color}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill={j === 0 ? `${node.color}10` : "none"}
                  />
                ))}
              </svg>
            </div>
            <span className="text-center text-[10px] font-semibold leading-tight text-slate-700 whitespace-pre-line">
              {node.label}
            </span>
          </div>
        );
      })}

      {/* Float animations */}
      <style>{`
        @keyframes hubFloat0 { 0%,100%{transform:translate(-50%,-50%) translateY(0)} 50%{transform:translate(-50%,-50%) translateY(-8px)} }
        @keyframes hubFloat1 { 0%,100%{transform:translate(-50%,-50%) translateY(0)} 50%{transform:translate(-50%,-50%) translateY(-6px)} }
        @keyframes hubFloat2 { 0%,100%{transform:translate(-50%,-50%) translateY(0)} 50%{transform:translate(-50%,-50%) translateY(7px)} }
        @keyframes hubFloat3 { 0%,100%{transform:translate(-50%,-50%) translateY(0)} 50%{transform:translate(-50%,-50%) translateY(-7px)} }
      `}</style>
    </div>
  );
}

