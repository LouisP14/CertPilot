import { ArrowRight, BookOpen, Calendar, Clock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog & Ressources | Gestion des formations - CertPilot",
  description:
    "Articles, guides et ressources pour optimiser la gestion de vos formations, habilitations et certifications en entreprise. CACES, SST, habilitations electriques.",
  alternates: {
    canonical: "/blog",
  },
};

const ARTICLES = [
  {
    slug: "gestion-caces-entreprise",
    title: "Comment bien gerer les CACES en entreprise ?",
    excerpt:
      "Guide complet pour organiser le suivi des CACES : obligations legales, categories, durees de validite et bonnes pratiques pour securiser vos habilitations caristes.",
    date: "2026-02-15",
    readTime: "8 min",
    category: "CACES",
    categoryColor: "bg-amber-100 text-amber-700",
  },
  {
    slug: "obligations-formation-securite",
    title: "Obligations de formation securite : ce que dit la loi",
    excerpt:
      "Tour d'horizon des obligations legales en matiere de formations securite : SST, habilitations electriques, CACES, travail en hauteur. Ce que risque l'employeur en cas de non-conformite.",
    date: "2026-01-20",
    readTime: "10 min",
    category: "Reglementation",
    categoryColor: "bg-blue-100 text-blue-700",
  },
  {
    slug: "digitaliser-suivi-habilitations",
    title: "Pourquoi digitaliser le suivi des habilitations ?",
    excerpt:
      "Excel ne suffit plus pour gerer les formations de vos equipes. Decouvrez les avantages d'un logiciel dedie : alertes automatiques, conformite, gain de temps et tracabilite.",
    date: "2025-12-10",
    readTime: "6 min",
    category: "Digitalisation",
    categoryColor: "bg-emerald-100 text-emerald-700",
  },
];

function BreadcrumbJsonLd() {
  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://www.certpilot.eu";
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${siteUrl}/blog`,
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
    />
  );
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      <BreadcrumbJsonLd />

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
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Connexion
            </Link>
            <Link
              href="/#pricing"
              className="rounded-lg bg-[#173B56] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1e4d6e]"
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#173B56]/10 px-4 py-1.5 text-sm font-medium text-[#173B56]">
            <BookOpen className="h-4 w-4" />
            Blog & Ressources
          </div>
          <h1 className="mb-4 text-4xl font-black tracking-tight text-slate-900">
            Guides et bonnes pratiques
          </h1>
          <p className="text-lg text-slate-600">
            Articles pour vous aider a optimiser la gestion de vos formations,
            habilitations et certifications en entreprise.
          </p>
        </div>
      </section>

      {/* Articles */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
            >
              <div className="flex h-40 items-center justify-center bg-linear-to-br from-[#173B56] to-[#2a6b96]">
                <BookOpen className="h-12 w-12 text-white/80" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${article.categoryColor}`}
                  >
                    {article.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    {article.readTime}
                  </span>
                </div>
                <h2 className="mb-2 text-lg font-bold text-slate-900 transition group-hover:text-[#173B56]">
                  {article.title}
                </h2>
                <p className="mb-4 flex-1 text-sm text-slate-600">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar className="h-3 w-3" />
                    {new Date(article.date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-medium text-[#173B56] transition group-hover:gap-2">
                    Lire
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200 bg-[#173B56] py-16 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="mb-4 text-2xl font-bold text-white">
            Pret a simplifier la gestion de vos formations ?
          </h2>
          <p className="mb-8 text-slate-300">
            Rejoignez les entreprises qui font confiance a CertPilot pour
            securiser leurs habilitations.
          </p>
          <Link
            href="/#pricing"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-[#173B56] transition hover:bg-slate-100"
          >
            Demarrer l&apos;essai gratuit
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
