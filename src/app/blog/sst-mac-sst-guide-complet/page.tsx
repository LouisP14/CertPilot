import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 3600;

export const metadata: Metadata = {
  title:
    "SST et MAC SST : le guide complet pour les entreprises | Blog CertPilot",
  description:
    "Guide complet sur la formation SST et le recyclage MAC SST : obligations legales, nombre de sauveteurs secouristes requis, periodicite de 24 mois et suivi avec CertPilot.",
  alternates: {
    canonical: "/blog/sst-mac-sst-guide-complet",
  },
  keywords: [
    "SST entreprise",
    "MAC SST recyclage",
    "formation sauveteur secouriste",
  ],
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
          "SST et MAC SST : le guide complet pour les entreprises",
        datePublished: "2026-03-01",
        dateModified: "2026-03-01",
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
          "Guide complet sur la formation SST et le recyclage MAC SST en entreprise.",
        mainEntityOfPage: `${siteUrl}/blog/sst-mac-sst-guide-complet`,
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
            name: "SST et MAC SST",
            item: `${siteUrl}/blog/sst-mac-sst-guide-complet`,
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

export default function ArticleSSTMacSST() {
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
            Formation
          </span>
          <span className="text-sm text-slate-500">1 mars 2026</span>
          <span className="text-sm text-slate-500">9 min de lecture</span>
        </div>

        <h1 className="mb-8 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          SST et MAC SST : le guide complet pour les entreprises
        </h1>

        <div className="prose prose-slate max-w-none text-slate-800 prose-li:text-slate-800">
          <p className="lead text-lg text-slate-600">
            La formation Sauveteur Secouriste du Travail (SST) est l&apos;une
            des formations obligatoires les plus repandues en entreprise.
            Pourtant, de nombreuses organisations peinent a maintenir leurs
            effectifs a jour, notamment en ce qui concerne le recyclage MAC SST.
            Ce guide fait le point sur vos obligations et vous donne les cles
            pour un suivi efficace.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">
            Qu&apos;est-ce que la formation SST ?
          </h2>
          <p className="text-slate-700">
            Le Sauveteur Secouriste du Travail (SST) est un salarie forme aux
            gestes de premiers secours et capable d&apos;intervenir en cas
            d&apos;accident sur le lieu de travail. La formation SST, d&apos;une
            duree minimale de 14 heures (generalement 2 jours), est dispensee
            par des formateurs certifies par le reseau Assurance
            Maladie-Risques Professionnels / INRS.
          </p>
          <p className="text-slate-700">
            Le SST remplit une double mission : porter les premiers secours a
            toute personne victime d&apos;un accident ou d&apos;un malaise, et
            contribuer a la prevention des risques professionnels dans
            l&apos;entreprise. Il est forme a alerter les secours, proteger la
            zone de l&apos;accident, examiner la victime et pratiquer les gestes
            de secours adaptes (mise en position laterale de securite, massage
            cardiaque, utilisation du defibrillateur, etc.).
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">
            Obligations legales : combien de SST par entreprise ?
          </h2>
          <p className="text-slate-700">
            Le Code du travail impose a chaque employeur de disposer de
            personnel forme aux premiers secours. L&apos;article R4224-15
            precise qu&apos;un membre du personnel doit recevoir la formation de
            secouriste necessaire pour donner les premiers secours en cas
            d&apos;urgence dans chaque atelier ou sont accomplis des travaux
            dangereux, et sur chaque chantier employant 20 travailleurs au moins
            pendant plus de 15 jours.
          </p>
          <p className="text-slate-700">
            En pratique, la recommandation de l&apos;INRS est de former entre 10
            % et 15 % de l&apos;effectif total de l&apos;entreprise au SST.
            Pour les sites a risques (industrie, BTP, chimie), ce taux peut
            monter a 20 % ou plus. Il est essentiel de tenir compte des absences
            (conges, arrets maladie, travail en equipes) pour garantir une
            couverture permanente.
          </p>
          <div className="my-6 grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Bureaux / Tertiaire",
                ratio: "10 %",
                desc: "Minimum recommande pour les environnements a faible risque",
              },
              {
                label: "Industrie / Logistique",
                ratio: "15 %",
                desc: "Taux standard pour les activites comportant des risques physiques",
              },
              {
                label: "BTP / Chimie",
                ratio: "20 %+",
                desc: "Taux renforce pour les activites a haut risque d'accident",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="mb-1 text-2xl font-black text-emerald-600">
                  {item.ratio}
                </div>
                <div className="font-semibold text-slate-900">{item.label}</div>
                <div className="mt-1 text-sm text-slate-500">{item.desc}</div>
              </div>
            ))}
          </div>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">
            Le MAC SST : Maintien et Actualisation des Competences
          </h2>
          <p className="text-slate-700">
            Le certificat SST a une validite de 24 mois. A l&apos;issue de cette
            periode, le sauveteur secouriste doit suivre une formation de
            Maintien et Actualisation des Competences (MAC SST), d&apos;une
            duree de 7 heures (1 journee). Sans ce recyclage, le certificat SST
            n&apos;est plus valide et le salarie ne peut plus exercer son role
            de sauveteur secouriste.
          </p>
          <p className="text-slate-700">
            La session MAC SST permet de reactualiser les connaissances du
            secouriste, de reviser les gestes techniques, d&apos;integrer les
            eventuelles evolutions des protocoles de secours et de s&apos;entrainer
            sur des mises en situation realistes. C&apos;est aussi l&apos;occasion
            de faire le point sur les situations d&apos;accident rencontrees dans
            l&apos;entreprise et d&apos;adapter la formation aux risques
            specifiques du site.
          </p>
          <div className="my-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5">
            <p className="font-semibold text-emerald-800">
              Attention : la regle des 24 mois
            </p>
            <p className="mt-2 text-sm text-emerald-700">
              Le delai de 24 mois court a partir de la date d&apos;obtention du
              certificat SST initial ou du dernier MAC SST. Si le recyclage
              n&apos;est pas effectue dans les delais, le salarie perd son
              statut de SST. Il devra alors repasser la formation initiale
              complete de 14 heures au lieu des 7 heures du MAC SST. Anticiper
              le recyclage est donc un enjeu financier autant que reglementaire.
            </p>
          </div>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">
            Les erreurs les plus frequentes
          </h2>
          <p className="text-slate-700">
            Dans notre experience aupres de centaines d&apos;entreprises, voici
            les erreurs les plus courantes en matiere de gestion SST :
          </p>
          <ul className="space-y-2 text-slate-700">
            <li>
              <strong>Ne pas anticiper les departs :</strong> Un SST qui quitte
              l&apos;entreprise ou change de poste laisse un vide dans la
              couverture. Il faut prevoir des formations en amont pour maintenir
              le taux de couverture.
            </li>
            <li>
              <strong>Oublier le delai de 24 mois :</strong> Contrairement aux
              CACES (5 ans) ou aux habilitations electriques (3 ans), le
              recyclage SST est beaucoup plus frequent. Sans outil de suivi
              automatise, les oublis sont quasi inevitables.
            </li>
            <li>
              <strong>Ne pas verifier la couverture par equipe :</strong> Avoir
              15 % de SST dans l&apos;entreprise ne sert a rien si tous
              travaillent dans le meme service. Il faut repartir les SST pour
              couvrir chaque atelier, chaque equipe et chaque plage horaire.
            </li>
            <li>
              <strong>Confondre SST et PSC1 :</strong> Le PSC1 (Prevention et
              Secours Civiques de niveau 1) est une formation grand public qui
              ne repond pas a l&apos;obligation de l&apos;employeur. Seul le
              certificat SST delivre par un formateur certifie INRS est
              reconnu.
            </li>
            <li>
              <strong>Ne pas archiver les attestations :</strong> En cas de
              controle de l&apos;inspection du travail ou d&apos;accident,
              l&apos;employeur doit prouver que ses SST sont a jour. Les
              attestations doivent etre conservees et accessibles rapidement.
            </li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">
            Organiser le suivi de la couverture SST
          </h2>
          <p className="text-slate-700">
            Un suivi efficace de la couverture SST repose sur plusieurs piliers :
          </p>
          <ul className="space-y-2 text-slate-700">
            <li>
              <strong>Cartographier les besoins :</strong> Identifiez le nombre
              de SST necessaires par site, par service et par equipe en
              fonction de vos effectifs et de vos risques.
            </li>
            <li>
              <strong>Planifier les sessions :</strong> Etablissez un calendrier
              annuel de formations initiales et de recyclages MAC SST pour
              lisser les couts et eviter les pics de demande.
            </li>
            <li>
              <strong>Suivre les indicateurs :</strong> Taux de couverture par
              site, nombre de SST a recycler dans les 3 prochains mois, nombre
              de SST expires. Ces indicateurs doivent etre accessibles en temps
              reel.
            </li>
            <li>
              <strong>Communiquer aupres des equipes :</strong> Les salaries
              doivent savoir qui sont les SST de leur equipe. Des affichages et
              des listes a jour sont indispensables.
            </li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">
            Comment CertPilot simplifie la gestion SST
          </h2>
          <p className="text-slate-700">
            CertPilot centralise l&apos;ensemble de vos formations SST et MAC
            SST dans un tableau de bord unique. Chaque salarie dispose
            d&apos;une fiche complete avec son niveau de certification, la date
            d&apos;obtention et la date d&apos;expiration.
          </p>
          <ul className="space-y-2 text-slate-700">
            <li>
              <strong>Alertes a 90, 60 et 30 jours :</strong> Les responsables
              RH et les managers recoivent des notifications automatiques avant
              chaque expiration de MAC SST. Plus aucun recyclage n&apos;est
              oublie.
            </li>
            <li>
              <strong>Taux de couverture en temps reel :</strong> CertPilot
              calcule automatiquement votre taux de couverture SST par site, par
              service et par equipe. Vous identifiez immediatement les zones a
              risque.
            </li>
            <li>
              <strong>Passeport formation PDF :</strong> Generez en un clic le
              passeport formation de chaque salarie incluant ses certifications
              SST, ses dates de recyclage et l&apos;historique complet de ses
              formations.
            </li>
            <li>
              <strong>Convocations automatisees :</strong> Envoyez les
              convocations aux formations directement depuis CertPilot, avec
              suivi des confirmations et des presences.
            </li>
          </ul>
          <p className="text-slate-700">
            Avec CertPilot, vous avez une vision claire et a jour de votre
            couverture SST. Vous anticipez les besoins, evitez les expirations
            et restez en conformite avec la reglementation, sans effort
            supplementaire.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-slate-200 bg-[#173B56] p-8 text-center">
          <BookOpen className="mx-auto mb-4 h-8 w-8 text-white/80" />
          <h3 className="mb-2 text-xl font-bold text-white">
            Gardez le controle sur vos formations SST
          </h3>
          <p className="mb-6 text-slate-300">
            Essayez CertPilot gratuitement et ne laissez plus aucun MAC SST
            expirer.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex rounded-lg bg-white px-6 py-3 font-semibold text-[#173B56] transition hover:bg-slate-100"
            >
              Demarrer l&apos;essai gratuit
            </Link>
            <Link
              href="/checklist"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Telecharger la checklist
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
