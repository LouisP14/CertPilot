import { ArrowLeft, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 3600;

export const metadata: Metadata = {
  title:
    "Obligations de formation securite : ce que dit la loi | Blog CertPilot",
  description:
    "Tour d'horizon des obligations legales en matiere de formations securite : SST, habilitations electriques, CACES, travail en hauteur. Ce que risque l'employeur.",
  alternates: {
    canonical: "/blog/obligations-formation-securite",
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
        headline:
          "Obligations de formation securite : ce que dit la loi",
        datePublished: "2026-01-20",
        dateModified: "2026-01-20",
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
          "Tour d'horizon des obligations legales en matiere de formations securite.",
        mainEntityOfPage: `${siteUrl}/blog/obligations-formation-securite`,
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
            name: "Obligations formation securite",
            item: `${siteUrl}/blog/obligations-formation-securite`,
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

export default function ArticleObligations() {
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
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            Reglementation
          </span>
          <span className="text-sm text-slate-500">20 janvier 2026</span>
          <span className="text-sm text-slate-500">10 min de lecture</span>
        </div>

        <h1 className="mb-8 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Obligations de formation securite : ce que dit la loi
        </h1>

        <div className="prose prose-slate max-w-none text-slate-800 prose-li:text-slate-800">
          <p className="lead text-lg text-slate-600">
            L&apos;employeur a une obligation generale de securite envers ses
            salaries (article L4121-1 du Code du travail). Cela inclut la
            formation a la securite, qui doit etre adaptee au poste de travail
            et mise a jour regulierement.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">
            Les formations obligatoires
          </h2>

          <h3 className="mt-6 text-xl font-semibold text-slate-800">
            SST - Sauveteurs Secouristes du Travail
          </h3>
          <p className="text-slate-700">
            L&apos;article R4224-15 impose la presence d&apos;un membre du
            personnel forme aux premiers secours dans chaque atelier ou sont
            effectues des travaux dangereux. Le certificat SST est valable 24
            mois et necessite un recyclage (MAC SST) de 7 heures.
          </p>

          <h3 className="mt-6 text-xl font-semibold text-slate-800">
            Habilitations electriques
          </h3>
          <p className="text-slate-700">
            Le decret 2010-1118 rend obligatoire l&apos;habilitation electrique
            pour tout travailleur effectuant des operations sur ou a proximite
            d&apos;installations electriques. Les niveaux (B0, B1, B2, BR, BC,
            H0, H1, H2) sont definis par la norme NF C 18-510.
          </p>

          <h3 className="mt-6 text-xl font-semibold text-slate-800">
            CACES
          </h3>
          <p className="text-slate-700">
            L&apos;autorisation de conduite est obligatoire pour la conduite
            d&apos;engins (article R4323-55 du Code du travail). Le CACES est le
            moyen privilegie pour valider les competences du conducteur avant
            delivrance de l&apos;autorisation par l&apos;employeur.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">
            Les risques en cas de non-conformite
          </h2>
          <div className="my-6 space-y-3">
            {[
              {
                title: "Responsabilite penale",
                desc: "En cas d'accident, l'absence de formation peut constituer une faute inexcusable de l'employeur.",
              },
              {
                title: "Amendes",
                desc: "Des amendes pouvant aller jusqu'a 10 000 EUR par salarie concerne en cas de controle de l'inspection du travail.",
              },
              {
                title: "Arret d'activite",
                desc: "L'inspecteur du travail peut ordonner l'arret immediat des travaux si les habilitations ne sont pas a jour.",
              },
            ].map((risk) => (
              <div
                key={risk.title}
                className="rounded-lg border-l-4 border-red-400 bg-red-50 p-4"
              >
                <div className="font-semibold text-red-800">{risk.title}</div>
                <div className="text-sm text-red-700">{risk.desc}</div>
              </div>
            ))}
          </div>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">
            Comment assurer sa conformite ?
          </h2>
          <p className="text-slate-700">
            La cle est d&apos;avoir une vision claire et a jour de toutes les
            formations et habilitations de vos equipes. Un outil comme CertPilot
            centralise ces informations, automatise les alertes d&apos;echeance
            et facilite la planification des sessions de formation.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-slate-200 bg-[#173B56] p-8 text-center">
          <BookOpen className="mx-auto mb-4 h-8 w-8 text-white/80" />
          <h3 className="mb-2 text-xl font-bold text-white">
            Securisez votre conformite
          </h3>
          <p className="mb-6 text-slate-300">
            CertPilot vous alerte automatiquement avant chaque echeance de
            formation.
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
