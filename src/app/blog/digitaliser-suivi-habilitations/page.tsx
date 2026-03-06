import { ArrowLeft, BookOpen, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Pourquoi digitaliser le suivi des habilitations ? | Blog CertPilot",
  description:
    "Excel ne suffit plus pour gerer les formations de vos equipes. Decouvrez les avantages d'un logiciel dedie : alertes automatiques, conformite, gain de temps.",
  alternates: {
    canonical: "/blog/digitaliser-suivi-habilitations",
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
        headline: "Pourquoi digitaliser le suivi des habilitations ?",
        datePublished: "2025-12-10",
        dateModified: "2025-12-10",
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
          "Les avantages de la digitalisation du suivi des habilitations et formations.",
        mainEntityOfPage: `${siteUrl}/blog/digitaliser-suivi-habilitations`,
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
            name: "Digitaliser le suivi",
            item: `${siteUrl}/blog/digitaliser-suivi-habilitations`,
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

export default function ArticleDigitaliser() {
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
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
            Digitalisation
          </span>
          <span className="text-sm text-slate-500">10 decembre 2025</span>
          <span className="text-sm text-slate-500">6 min de lecture</span>
        </div>

        <h1 className="mb-8 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Pourquoi digitaliser le suivi des habilitations ?
        </h1>

        <div className="prose prose-slate max-w-none">
          <p className="lead text-lg text-slate-600">
            De nombreuses entreprises gerent encore leurs formations et
            habilitations sur des fichiers Excel. Cette approche, si elle
            fonctionne pour de petites structures, montre vite ses limites a
            mesure que l&apos;effectif grandit.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">
            Les limites d&apos;Excel
          </h2>
          <ul className="space-y-2 text-slate-700">
            <li>
              <strong>Pas d&apos;alertes automatiques :</strong> Vous devez
              verifier manuellement les dates d&apos;expiration, ce qui augmente
              le risque d&apos;oubli.
            </li>
            <li>
              <strong>Donnees dispersees :</strong> Plusieurs fichiers, versions
              differentes, risque d&apos;erreurs lors de la mise a jour.
            </li>
            <li>
              <strong>Aucune tracabilite :</strong> Pas d&apos;historique des
              modifications, difficile a auditer en cas de controle.
            </li>
            <li>
              <strong>Temps perdu :</strong> La saisie manuelle et les relances
              consomment un temps considerable.
            </li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">
            Les avantages d&apos;un logiciel dedie
          </h2>
          <div className="my-6 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Alertes automatiques",
                desc: "Recevez des notifications par email avant chaque echeance de formation.",
              },
              {
                title: "Vision temps reel",
                desc: "Tableau de bord avec le statut de chaque habilitation a jour.",
              },
              {
                title: "Conformite assuree",
                desc: "Plus de risque d'oublier un renouvellement, tout est trace.",
              },
              {
                title: "Gain de temps",
                desc: "Convocations automatiques, passeport formation PDF en 1 clic.",
              },
              {
                title: "Pilotage budgetaire",
                desc: "Suivez les couts de formation et optimisez votre plan de formation.",
              },
              {
                title: "Collaboration",
                desc: "Chaque manager peut consulter les habilitations de son equipe.",
              },
            ].map((advantage) => (
              <div
                key={advantage.title}
                className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4"
              >
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <div>
                  <div className="font-semibold text-slate-900">
                    {advantage.title}
                  </div>
                  <div className="text-sm text-slate-500">
                    {advantage.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">
            Le bon moment pour passer au digital
          </h2>
          <p className="text-slate-700">
            Si vous gerez plus de 20 salaries ou si vous avez plus de 3 types
            de formations a suivre, un outil dedie devient rentable des le
            premier mois. Le temps gagne sur les relances et la saisie couvre
            largement l&apos;investissement.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">
            CertPilot : la solution pensee pour les PME
          </h2>
          <p className="text-slate-700">
            CertPilot a ete concu specifiquement pour les entreprises
            industrielles et de services qui doivent gerer des habilitations
            reglementaires. Interface intuitive, mise en place en quelques
            minutes, et accompagnement personnalise.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-slate-200 bg-[#173B56] p-8 text-center">
          <BookOpen className="mx-auto mb-4 h-8 w-8 text-white/80" />
          <h3 className="mb-2 text-xl font-bold text-white">
            Passez au digital des aujourd&apos;hui
          </h3>
          <p className="mb-6 text-slate-300">
            Testez CertPilot gratuitement pendant 14 jours, sans engagement.
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
