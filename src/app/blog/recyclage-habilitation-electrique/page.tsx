import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 3600;

export const metadata: Metadata = {
  title:
    "Recyclage habilitation electrique : delais, obligations et bonnes pratiques | Blog CertPilot",
  description:
    "Tout savoir sur le recyclage de l'habilitation electrique : delais de renouvellement, exigences NF C 18-510, consequences en cas d'expiration et comment automatiser le suivi avec CertPilot.",
  alternates: {
    canonical: "/blog/recyclage-habilitation-electrique",
  },
  keywords: [
    "recyclage habilitation electrique",
    "delai renouvellement",
    "NF C 18-510",
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
          "Recyclage habilitation electrique : delais, obligations et bonnes pratiques",
        datePublished: "2026-03-15",
        dateModified: "2026-03-15",
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
          "Guide complet sur le recyclage de l'habilitation electrique : delais, norme NF C 18-510 et bonnes pratiques.",
        mainEntityOfPage: `${siteUrl}/blog/recyclage-habilitation-electrique`,
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
            name: "Recyclage habilitation electrique",
            item: `${siteUrl}/blog/recyclage-habilitation-electrique`,
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

export default function ArticleRecyclageHabilitationElectrique() {
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
          <span className="text-sm text-slate-500">15 mars 2026</span>
          <span className="text-sm text-slate-500">7 min de lecture</span>
        </div>

        <h1 className="mb-8 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Recyclage habilitation electrique : delais, obligations et bonnes
          pratiques
        </h1>

        <div className="prose prose-slate max-w-none">
          <p className="lead text-lg text-slate-600">
            L&apos;habilitation electrique est une obligation incontournable pour
            tout travailleur intervenant sur ou a proximite d&apos;installations
            electriques. Mais obtenir l&apos;habilitation ne suffit pas : encore
            faut-il la maintenir a jour par un recyclage regulier. Cet article
            fait le point sur les delais, les obligations reglementaires et les
            bonnes pratiques pour ne jamais etre pris en defaut.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">
            Qu&apos;est-ce que l&apos;habilitation electrique ?
          </h2>
          <p className="text-slate-700">
            L&apos;habilitation electrique est la reconnaissance, par
            l&apos;employeur, de la capacite d&apos;un salarie a accomplir en
            securite les taches qui lui sont confiees sur ou au voisinage
            d&apos;installations electriques. Elle est delivree apres une
            formation theorique et pratique conforme a la norme NF C 18-510.
            Contrairement a une idee recue, l&apos;habilitation n&apos;est pas
            un diplome : c&apos;est un titre delivre par l&apos;employeur, qui
            engage sa responsabilite.
          </p>
          <p className="text-slate-700">
            Les niveaux d&apos;habilitation vont de B0/H0 (travaux non
            electriques au voisinage) jusqu&apos;a B2V/H2V (travaux sous
            tension), en passant par BS (interventions elementaires) et BR
            (interventions generales). Chaque niveau correspond a un perimetre
            d&apos;intervention precis, et la formation associee doit etre
            adaptee en consequence.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">
            Ce que dit la norme NF C 18-510
          </h2>
          <p className="text-slate-700">
            La norme NF C 18-510, qui remplace l&apos;ancienne UTE C 18-510,
            constitue le referentiel de base pour toutes les operations sur les
            installations electriques en France. Elle definit les regles de
            securite, les niveaux d&apos;habilitation et les conditions de
            formation. Depuis son adoption, elle est devenue le standard
            incontournable pour les organismes de formation et les employeurs.
          </p>
          <p className="text-slate-700">
            La norme precise que l&apos;habilitation doit etre revue
            periodiquement. L&apos;employeur a l&apos;obligation de
            s&apos;assurer que les competences de ses salaries restent a jour,
            notamment en cas de changement de poste, d&apos;evolution des
            installations ou d&apos;absence prolongee. La formation de recyclage
            permet de reactualiser les connaissances et de verifier
            l&apos;aptitude du salarie a travailler en securite.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">
            Delais de recyclage : la regle des 3 ans
          </h2>
          <p className="text-slate-700">
            La recommandation generale est de proceder au recyclage de
            l&apos;habilitation electrique tous les 3 ans. Ce delai est inscrit
            dans la norme NF C 18-510 et constitue la periodicite de reference
            retenue par la grande majorite des organismes de formation et des
            inspections du travail. Toutefois, l&apos;employeur peut decider
            d&apos;une periodicite plus courte s&apos;il le juge necessaire au
            regard de son evaluation des risques.
          </p>
          <div className="my-6 rounded-lg border border-blue-200 bg-blue-50 p-5">
            <p className="font-semibold text-blue-800">
              A retenir : les cas de recyclage anticipe
            </p>
            <ul className="mt-2 space-y-1 text-sm text-blue-700">
              <li>
                Changement de fonction ou de poste impliquant de nouvelles
                operations electriques
              </li>
              <li>
                Evolution significative des installations electriques de
                l&apos;entreprise
              </li>
              <li>
                Absence prolongee du salarie (superieure a 6 mois par exemple)
              </li>
              <li>Accident ou incident electrique sur le site</li>
              <li>
                Modification de la reglementation ou de la norme applicable
              </li>
            </ul>
          </div>
          <p className="text-slate-700">
            En pratique, il est recommande de planifier les recyclages au moins 3
            mois avant la date d&apos;expiration pour tenir compte des
            contraintes de planning, de disponibilite des organismes de formation
            et des eventuels reports. Un recyclage programme a la derniere minute
            expose l&apos;entreprise a un risque de non-conformite si la session
            est annulee ou reportee.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">
            Consequences d&apos;une habilitation expiree
          </h2>
          <p className="text-slate-700">
            Laisser un salarie intervenir sur des installations electriques avec
            une habilitation expiree expose l&apos;entreprise a des
            consequences graves, tant sur le plan juridique que sur le plan de la
            securite. Voici les principaux risques :
          </p>
          <ul className="space-y-2 text-slate-700">
            <li>
              <strong>Responsabilite penale de l&apos;employeur :</strong> En cas
              d&apos;accident, l&apos;absence d&apos;habilitation valide
              constitue une faute inexcusable. L&apos;employeur peut etre
              poursuivi pour mise en danger de la vie d&apos;autrui, avec des
              peines pouvant aller jusqu&apos;a 1 an d&apos;emprisonnement et
              15 000 euros d&apos;amende.
            </li>
            <li>
              <strong>Sanctions administratives :</strong> L&apos;inspection du
              travail peut dresser un proces-verbal, imposer un arret des
              travaux et exiger la mise en conformite immediate.
            </li>
            <li>
              <strong>Consequences assurentielles :</strong> En cas
              d&apos;accident du travail, la CPAM peut engager une procedure de
              faute inexcusable de l&apos;employeur, entrainant une majoration
              de la rente et des dommages et interets supplementaires.
            </li>
            <li>
              <strong>Risques pour les salaries :</strong> Un operateur dont les
              connaissances ne sont pas a jour est plus expose aux risques
              d&apos;electrisation, d&apos;electrocution et de brulures. Le
              risque electrique reste l&apos;une des premieres causes
              d&apos;accidents graves au travail.
            </li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">
            Bonnes pratiques pour un suivi efficace
          </h2>
          <p className="text-slate-700">
            Gerer les habilitations electriques de dizaines, voire de centaines
            de collaborateurs demande une organisation rigoureuse. Voici les
            bonnes pratiques a mettre en place :
          </p>
          <ul className="space-y-2 text-slate-700">
            <li>
              <strong>Tenir un registre centralise :</strong> Regroupez
              l&apos;ensemble des habilitations dans un outil unique. Chaque
              salarie doit avoir une fiche a jour mentionnant son niveau
              d&apos;habilitation, la date d&apos;obtention et la date
              d&apos;expiration.
            </li>
            <li>
              <strong>Automatiser les alertes :</strong> Configurez des rappels
              automatiques a 90, 60 et 30 jours avant expiration. Cela laisse le
              temps d&apos;organiser la formation de recyclage sans precipitation.
            </li>
            <li>
              <strong>Impliquer les managers :</strong> Les responsables
              d&apos;equipe doivent avoir une visibilite sur les habilitations de
              leurs collaborateurs pour eviter d&apos;affecter un salarie non
              habilite a une tache electrique.
            </li>
            <li>
              <strong>Archiver les attestations :</strong> Conservez les
              attestations de formation et les titres d&apos;habilitation pendant
              toute la duree du contrat de travail, et au moins 5 ans apres le
              depart du salarie.
            </li>
            <li>
              <strong>Anticiper les besoins :</strong> Analysez chaque annee les
              departs, les arrivees et les changements de poste pour prevoir le
              volume de formations necessaires et negocier les tarifs avec vos
              organismes de formation.
            </li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">
            Comment CertPilot automatise le suivi du recyclage
          </h2>
          <p className="text-slate-700">
            CertPilot a ete concu pour eliminer les oublis et simplifier la
            gestion des habilitations electriques. Voici comment la plateforme
            vous accompagne au quotidien :
          </p>
          <ul className="space-y-2 text-slate-700">
            <li>
              <strong>Tableau de bord centralise :</strong> Visualisez en un
              coup d&apos;oeil l&apos;etat de toutes les habilitations
              electriques de votre entreprise : valides, a renouveler sous 90
              jours, expirees.
            </li>
            <li>
              <strong>Alertes automatiques :</strong> CertPilot envoie des
              notifications par email aux responsables RH et aux managers a 90,
              60 et 30 jours avant chaque expiration. Plus aucun recyclage
              n&apos;est oublie.
            </li>
            <li>
              <strong>Passeport formation PDF :</strong> Generez en un clic le
              passeport formation de chaque salarie, incluant l&apos;ensemble de
              ses habilitations avec leurs dates de validite. Ideal pour les
              audits et les controles.
            </li>
            <li>
              <strong>Historique complet :</strong> Chaque formation, chaque
              recyclage, chaque changement d&apos;habilitation est trace et
              horodate. Vous disposez d&apos;une piste d&apos;audit complete en
              cas de controle de l&apos;inspection du travail.
            </li>
          </ul>
          <p className="text-slate-700">
            Avec CertPilot, vous passez d&apos;une gestion reactive a une
            gestion proactive. Fini les fichiers Excel disperses, les alertes
            oubliees et les surprises lors des audits. Vous gardez le controle
            sur l&apos;ensemble de vos habilitations electriques, en toute
            serenite.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-slate-200 bg-[#173B56] p-8 text-center">
          <BookOpen className="mx-auto mb-4 h-8 w-8 text-white/80" />
          <h3 className="mb-2 text-xl font-bold text-white">
            Ne laissez plus expirer vos habilitations electriques
          </h3>
          <p className="mb-6 text-slate-300">
            Essayez CertPilot gratuitement et automatisez le suivi de vos
            recyclages.
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
