import { ArrowLeft, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Comment bien gerer les CACES en entreprise ? | Blog CertPilot",
  description:
    "Guide complet pour organiser le suivi des CACES : obligations legales, categories, durees de validite et bonnes pratiques pour securiser vos habilitations caristes.",
  alternates: {
    canonical: "/blog/gestion-caces-entreprise",
  },
};

function JsonLd() {
  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://www.certpilot.eu";
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Comment bien gerer les CACES en entreprise ?",
        datePublished: "2026-02-15",
        dateModified: "2026-02-15",
        author: { "@type": "Organization", name: "CertPilot" },
        publisher: {
          "@type": "Organization",
          name: "CertPilot",
          logo: {
            "@type": "ImageObject",
            url: `${siteUrl}/logo.png`,
          },
        },
        description:
          "Guide complet pour organiser le suivi des CACES en entreprise.",
        mainEntityOfPage: `${siteUrl}/blog/gestion-caces-entreprise`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: `${siteUrl}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Gestion CACES",
            item: `${siteUrl}/blog/gestion-caces-entreprise`,
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

export default function ArticleCACES() {
  return (
    <div className="min-h-screen bg-slate-50">
      <JsonLd />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#173B56]"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au blog
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-6 flex items-center gap-3">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
            CACES
          </span>
          <span className="text-sm text-slate-500">15 fevrier 2026</span>
          <span className="text-sm text-slate-500">8 min de lecture</span>
        </div>

        <h1 className="mb-8 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Comment bien gerer les CACES en entreprise ?
        </h1>

        <div className="prose prose-slate max-w-none">
          <p className="lead text-lg text-slate-600">
            Le Certificat d&apos;Aptitude a la Conduite En Securite (CACES) est
            un element incontournable de la securite au travail pour les
            entreprises utilisant des engins de levage, des chariots ou des
            nacelles. Voici comment organiser efficacement leur suivi.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">
            Qu&apos;est-ce que le CACES ?
          </h2>
          <p className="text-slate-700">
            Le CACES est une certification validant la capacite d&apos;un
            conducteur a utiliser un ou plusieurs types d&apos;engins en
            securite. Il ne constitue pas une habilitation en soi, mais
            l&apos;employeur s&apos;appuie sur lui pour delivrer
            l&apos;autorisation de conduite obligatoire (article R4323-56 du
            Code du travail).
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">
            Les principales categories
          </h2>
          <div className="my-6 grid gap-4 sm:grid-cols-2">
            {[
              {
                code: "R489",
                name: "Chariots automoteurs",
                desc: "Chariots elevateurs, transpalettes, gerbeurs",
              },
              {
                code: "R486",
                name: "PEMP (Nacelles)",
                desc: "Plateformes elevatrices mobiles de personnel",
              },
              {
                code: "R482",
                name: "Engins de chantier",
                desc: "Pelleteuses, chargeuses, compacteurs",
              },
              {
                code: "R490",
                name: "Grues de chargement",
                desc: "Grues auxiliaires de chargement de vehicules",
              },
            ].map((cat) => (
              <div
                key={cat.code}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="mb-1 text-sm font-bold text-amber-600">
                  {cat.code}
                </div>
                <div className="font-semibold text-slate-900">{cat.name}</div>
                <div className="text-sm text-slate-500">{cat.desc}</div>
              </div>
            ))}
          </div>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">
            Duree de validite et renouvellement
          </h2>
          <p className="text-slate-700">
            La duree de validite des CACES depend de la recommandation
            applicable. En general, le recyclage est recommande tous les 5 ans
            pour la plupart des categories. L&apos;employeur peut toutefois
            fixer une periodicite plus courte en fonction de son evaluation des
            risques.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">
            Bonnes pratiques de suivi
          </h2>
          <ul className="space-y-2 text-slate-700">
            <li>
              <strong>Centraliser les donnees :</strong> Regroupez tous les
              CACES dans un outil unique plutot que des fichiers Excel disperses.
            </li>
            <li>
              <strong>Automatiser les alertes :</strong> Configurez des alertes a
              90, 60 et 30 jours avant expiration pour anticiper les
              renouvellements.
            </li>
            <li>
              <strong>Planifier les sessions :</strong> Mutualisez les
              recyclages pour optimiser les couts et la logistique.
            </li>
            <li>
              <strong>Tracer les autorisations :</strong> Conservez un
              historique des autorisations de conduite delivrees.
            </li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">
            Comment CertPilot simplifie la gestion CACES
          </h2>
          <p className="text-slate-700">
            CertPilot centralise l&apos;ensemble de vos CACES dans un tableau de
            bord unique. Chaque employe dispose d&apos;une fiche avec ses
            habilitations, dates d&apos;obtention et d&apos;expiration. Les
            alertes automatiques, les convocations par email et le passeport
            formation PDF vous permettent de garder le controle sans effort.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-slate-200 bg-[#173B56] p-8 text-center">
          <BookOpen className="mx-auto mb-4 h-8 w-8 text-white/80" />
          <h3 className="mb-2 text-xl font-bold text-white">
            Simplifiez votre gestion CACES
          </h3>
          <p className="mb-6 text-slate-300">
            Essayez CertPilot gratuitement et centralisez le suivi de vos
            habilitations.
          </p>
          <Link
            href="/#pricing"
            className="inline-flex rounded-lg bg-white px-6 py-3 font-semibold text-[#173B56] transition hover:bg-slate-100"
          >
            Demarrer l&apos;essai gratuit
          </Link>
        </div>
      </article>
    </div>
  );
}
