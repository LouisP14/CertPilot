import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 3600;

export const metadata: Metadata = {
  title:
    "Guide complet : gestion des habilitations en entreprise (2026) | CertPilot",
  description:
    "Le guide de reference pour gerer les habilitations et formations obligatoires en entreprise : CACES, SST, habilitations electriques, ATEX, travail en hauteur. Obligations legales, delais de recyclage, bonnes pratiques et outils.",
  keywords: [
    "gestion habilitations entreprise",
    "suivi formations obligatoires",
    "habilitations securite travail",
    "CACES SST habilitation electrique",
    "logiciel gestion habilitations",
    "passeport formation",
    "recyclage habilitations",
    "conformite formations",
  ],
  alternates: {
    canonical: "/blog/guide-gestion-habilitations-entreprise",
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
          "Guide complet : gestion des habilitations en entreprise (2026)",
        datePublished: "2026-03-25",
        dateModified: "2026-03-30",
        author: { "@type": "Organization", name: "CertPilot" },
        publisher: {
          "@type": "Organization",
          name: "CertPilot",
          logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
        },
        description:
          "Le guide de reference pour gerer les habilitations et formations obligatoires en entreprise.",
        mainEntityOfPage: `${siteUrl}/blog/guide-gestion-habilitations-entreprise`,
        wordCount: 3500,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Accueil",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: `${siteUrl}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Guide gestion habilitations",
            item: `${siteUrl}/blog/guide-gestion-habilitations-entreprise`,
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

export default function GuidePilier() {
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
          <span className="rounded-full bg-[#173B56] px-3 py-1 text-xs font-medium text-white">
            Guide complet
          </span>
          <span className="text-sm text-slate-500">25 mars 2026</span>
          <span className="text-sm text-slate-500">18 min de lecture</span>
        </div>

        <h1 className="mb-8 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Guide complet : gestion des habilitations en entreprise (2026)
        </h1>

        <div className="prose prose-slate max-w-none text-slate-800 prose-li:text-slate-800">
          <p className="lead text-lg text-slate-600">
            La gestion des habilitations et formations obligatoires est un enjeu
            majeur pour toute entreprise. Entre les obligations legales, les
            delais de recyclage et la multiplicite des formations, il est facile
            de perdre le fil. Ce guide complet vous donne toutes les cles pour
            maitriser le sujet en 2026.
          </p>

          {/* Table of contents */}
          <div className="my-8 rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mt-0 text-lg font-bold text-[#173B56]">
              Sommaire
            </h2>
            <ol className="mt-3 space-y-1 text-sm">
              <li>
                <a href="#obligations" className="text-emerald-600 hover:underline">
                  1. Les obligations legales de l&apos;employeur
                </a>
              </li>
              <li>
                <a href="#types" className="text-emerald-600 hover:underline">
                  2. Les principaux types d&apos;habilitations
                </a>
              </li>
              <li>
                <a href="#caces" className="text-emerald-600 hover:underline">
                  3. CACES : categories, validite et recyclage
                </a>
              </li>
              <li>
                <a href="#sst" className="text-emerald-600 hover:underline">
                  4. SST et MAC SST : obligations et couverture
                </a>
              </li>
              <li>
                <a href="#electrique" className="text-emerald-600 hover:underline">
                  5. Habilitations electriques NF C 18-510
                </a>
              </li>
              <li>
                <a href="#autres" className="text-emerald-600 hover:underline">
                  6. Autres formations obligatoires
                </a>
              </li>
              <li>
                <a href="#passeport" className="text-emerald-600 hover:underline">
                  7. Le Passeport de Prevention
                </a>
              </li>
              <li>
                <a href="#organisation" className="text-emerald-600 hover:underline">
                  8. Comment organiser le suivi en pratique
                </a>
              </li>
              <li>
                <a href="#excel" className="text-emerald-600 hover:underline">
                  9. Pourquoi Excel ne suffit plus
                </a>
              </li>
              <li>
                <a href="#solution" className="text-emerald-600 hover:underline">
                  10. Automatiser avec un logiciel dedie
                </a>
              </li>
            </ol>
          </div>

          {/* Section 1 */}
          <h2 id="obligations" className="mt-10 text-2xl font-bold text-slate-900">
            1. Les obligations legales de l&apos;employeur
          </h2>
          <p className="text-slate-700">
            L&apos;article L4121-1 du Code du travail impose a l&apos;employeur
            de prendre les mesures necessaires pour assurer la securite et
            proteger la sante physique et mentale des travailleurs. Cela inclut
            des actions de formation et d&apos;information.
          </p>
          <p className="text-slate-700">
            Plus concretement, l&apos;employeur doit :
          </p>
          <ul>
            <li>
              <strong>Former les salaries</strong> a la securite lors de
              l&apos;embauche, d&apos;un changement de poste ou de technique
            </li>
            <li>
              <strong>Delivrer les autorisations</strong> necessaires (conduite
              d&apos;engins, travaux electriques, etc.)
            </li>
            <li>
              <strong>S&apos;assurer du renouvellement</strong> des
              certifications avant leur expiration
            </li>
            <li>
              <strong>Tenir a jour un registre</strong> des formations et
              habilitations de chaque salarie
            </li>
          </ul>
          <p className="text-slate-700">
            Le non-respect de ces obligations peut entrainer des sanctions
            penales (amende de 3 750 a 75 000 euros, voire emprisonnement en cas
            d&apos;accident), la mise en cause de la responsabilite civile de
            l&apos;employeur, et l&apos;arret immediat de l&apos;activite par
            l&apos;inspection du travail.
          </p>

          {/* Section 2 */}
          <h2 id="types" className="mt-10 text-2xl font-bold text-slate-900">
            2. Les principaux types d&apos;habilitations
          </h2>
          <p className="text-slate-700">
            Les habilitations et certifications obligatoires se repartissent en
            plusieurs grandes familles :
          </p>
          <div className="my-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-bold text-amber-800">CACES</p>
              <p className="text-sm text-amber-700">
                Conduite d&apos;engins : chariots, nacelles, grues, engins de chantier
              </p>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="font-bold text-red-800">SST</p>
              <p className="text-sm text-red-700">
                Sauveteurs Secouristes du Travail et MAC SST
              </p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="font-bold text-blue-800">
                Habilitations electriques
              </p>
              <p className="text-sm text-blue-700">
                NF C 18-510 : B0, B1, B2, BR, BC, H0, H1, H2
              </p>
            </div>
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
              <p className="font-bold text-purple-800">Autres</p>
              <p className="text-sm text-purple-700">
                ATEX, hauteur, espaces confines, amiante, echafaudages
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <h2 id="caces" className="mt-10 text-2xl font-bold text-slate-900">
            3. CACES : categories, validite et recyclage
          </h2>
          <p className="text-slate-700">
            Le CACES (Certificat d&apos;Aptitude a la Conduite En Securite) valide
            la capacite d&apos;un operateur a utiliser un type d&apos;engin en
            securite. Il ne constitue pas une habilitation en soi :
            l&apos;employeur doit delivrer une autorisation de conduite sur la
            base du CACES (article R4323-56 du Code du travail).
          </p>
          <h3 className="mt-6 text-xl font-semibold text-slate-800">
            Categories principales
          </h3>
          <ul>
            <li>
              <strong>R489</strong> — Chariots de manutention automoteurs (1 a 6
              categories)
            </li>
            <li>
              <strong>R486</strong> — Plates-formes elevatrices mobiles de
              personnel (PEMP/nacelles)
            </li>
            <li>
              <strong>R482</strong> — Engins de chantier (pelles, chargeuses,
              compacteurs...)
            </li>
            <li>
              <strong>R490</strong> — Grues de chargement (auxiliaires)
            </li>
            <li>
              <strong>R487</strong> — Grues a tour
            </li>
            <li>
              <strong>R483</strong> — Grues mobiles
            </li>
          </ul>
          <h3 className="mt-6 text-xl font-semibold text-slate-800">
            Duree de validite
          </h3>
          <p className="text-slate-700">
            Tous les CACES ont une validite de <strong>5 ans</strong>. Le
            recyclage doit etre planifie avant l&apos;expiration. En pratique, il
            est recommande de demarrer les demarches 3 a 6 mois avant pour
            trouver un organisme disponible et eviter les periodes
            d&apos;inactivite.
          </p>
          <p className="text-slate-700">
            <strong>Attention :</strong> un CACES expire ne permet plus de
            delivrer d&apos;autorisation de conduite. Le salarie ne peut plus
            utiliser l&apos;engin, sous peine de sanctions pour l&apos;employeur.
          </p>

          {/* Section 4 */}
          <h2 id="sst" className="mt-10 text-2xl font-bold text-slate-900">
            4. SST et MAC SST : obligations et couverture
          </h2>
          <p className="text-slate-700">
            Le Sauveteur Secouriste du Travail (SST) est un salarie forme aux
            premiers secours. L&apos;article R4224-15 du Code du travail rend
            obligatoire la presence de secouristes dans les entreprises.
          </p>
          <h3 className="mt-6 text-xl font-semibold text-slate-800">
            Combien de SST ?
          </h3>
          <p className="text-slate-700">
            La reglementation recommande <strong>au minimum 1 SST pour 20 salaries</strong>.
            Ce ratio doit etre adapte selon les risques specifiques de
            l&apos;entreprise, la repartition geographique des sites et les
            horaires de travail (equipes en 3x8, travail isole...).
          </p>
          <h3 className="mt-6 text-xl font-semibold text-slate-800">
            Formation et recyclage
          </h3>
          <ul>
            <li>
              <strong>Formation initiale SST :</strong> 14 heures (2 jours)
            </li>
            <li>
              <strong>MAC SST (Maintien et Actualisation des Competences) :</strong>{" "}
              7 heures, tous les <strong>24 mois</strong>
            </li>
          </ul>
          <p className="text-slate-700">
            Si le recyclage MAC SST n&apos;est pas effectue dans les delais, le
            certificat SST perd sa validite. Le salarie n&apos;est plus
            considere comme sauveteur secouriste et la couverture de
            l&apos;entreprise diminue.
          </p>

          {/* Section 5 */}
          <h2
            id="electrique"
            className="mt-10 text-2xl font-bold text-slate-900"
          >
            5. Habilitations electriques NF C 18-510
          </h2>
          <p className="text-slate-700">
            Depuis le decret 2010-1118, toute personne effectuant des operations
            sur ou au voisinage d&apos;installations electriques doit etre
            habilitee. L&apos;habilitation est delivree par l&apos;employeur
            apres une formation adaptee au niveau de risque.
          </p>
          <h3 className="mt-6 text-xl font-semibold text-slate-800">
            Les niveaux d&apos;habilitation
          </h3>
          <ul>
            <li>
              <strong>B0/H0 :</strong> Non-electriciens travaillant a proximite
              d&apos;installations BT/HT
            </li>
            <li>
              <strong>B1/H1 :</strong> Executants realisant des travaux
              electriques
            </li>
            <li>
              <strong>B2/H2 :</strong> Charges de travaux dirigeant des
              operations electriques
            </li>
            <li>
              <strong>BR :</strong> Charge d&apos;intervention en basse tension
            </li>
            <li>
              <strong>BC/HC :</strong> Charge de consignation
              (mise hors tension)
            </li>
            <li>
              <strong>BE/HE :</strong> Operations specifiques (essais, mesures,
              verifications)
            </li>
          </ul>
          <h3 className="mt-6 text-xl font-semibold text-slate-800">
            Recyclage
          </h3>
          <p className="text-slate-700">
            La norme NF C 18-510 recommande un recyclage tous les{" "}
            <strong>3 ans</strong>. L&apos;habilitation doit egalement etre
            revisee en cas de changement de poste, de modification des
            installations, ou apres un accident electrique.
          </p>

          {/* Section 6 */}
          <h2 id="autres" className="mt-10 text-2xl font-bold text-slate-900">
            6. Autres formations obligatoires
          </h2>
          <p className="text-slate-700">
            Au-dela des CACES, SST et habilitations electriques, de nombreuses
            autres formations sont requises selon le secteur d&apos;activite :
          </p>
          <ul>
            <li>
              <strong>Travail en hauteur :</strong> formation obligatoire pour
              toute personne exposee a un risque de chute. Recyclage recommande
              tous les 3 ans.
            </li>
            <li>
              <strong>Espaces confines :</strong> formation specifique CATEC ou
              equivalente, avec autorisation d&apos;intervention. Recyclage
              annuel recommande.
            </li>
            <li>
              <strong>ATEX (Atmospheres Explosives) :</strong> formation adaptee
              au zonage (zone 0, 1, 2 pour les gaz ; zone 20, 21, 22 pour les
              poussieres). Recyclage tous les 3 ans.
            </li>
            <li>
              <strong>Amiante sous-section 4 :</strong> formation obligatoire
              pour les interventions susceptibles de provoquer l&apos;emission de
              fibres d&apos;amiante. Recyclage tous les 3 ans.
            </li>
            <li>
              <strong>Echafaudages :</strong> formation au montage, demontage et
              utilisation. Recyclage recommande.
            </li>
            <li>
              <strong>Pont roulant :</strong> autorisation de conduite
              obligatoire, similaire au CACES.
            </li>
          </ul>

          {/* Section 7 */}
          <h2
            id="passeport"
            className="mt-10 text-2xl font-bold text-slate-900"
          >
            7. Le Passeport de Prevention
          </h2>
          <p className="text-slate-700">
            Le <strong>Passeport de Prevention</strong>, accessible via
            moncompteformation.gouv.fr, est un dispositif national lance pour
            centraliser les attestations de formation en sante et securite au
            travail. Il concerne les formations suivies a partir du 1er octobre
            2022.
          </p>
          <p className="text-slate-700">
            <strong>Ce que cela change pour les entreprises :</strong>
          </p>
          <ul>
            <li>
              Les organismes de formation alimentent directement le passeport du
              salarie
            </li>
            <li>
              L&apos;employeur peut consulter les formations enregistrees
            </li>
            <li>
              Le salarie dispose d&apos;une preuve numerique de ses
              qualifications
            </li>
          </ul>
          <p className="text-slate-700">
            <strong>En pratique :</strong> le Passeport de Prevention ne remplace
            pas le suivi interne des habilitations. Il ne couvre pas toutes les
            formations (CACES, habilitations electriques specifiques...) et ne
            genere pas d&apos;alertes. Un outil comme CertPilot reste
            indispensable pour le suivi operationnel au quotidien, et les
            donnees exportees depuis CertPilot sont compatibles avec le
            dispositif.
          </p>

          {/* Section 8 */}
          <h2
            id="organisation"
            className="mt-10 text-2xl font-bold text-slate-900"
          >
            8. Comment organiser le suivi en pratique
          </h2>
          <p className="text-slate-700">
            Un suivi efficace des habilitations repose sur 5 piliers :
          </p>
          <ol>
            <li>
              <strong>Inventaire exhaustif :</strong> lister tous les postes
              necessitant une habilitation, les formations associees et les
              salaries concernes.
            </li>
            <li>
              <strong>Centralisation :</strong> regrouper toutes les
              informations dans un systeme unique (plus de fichiers eparpilles).
            </li>
            <li>
              <strong>Alertes anticipees :</strong> parametrer des rappels 30,
              60 et 90 jours avant chaque expiration.
            </li>
            <li>
              <strong>Planification groupee :</strong> regrouper les recyclages
              par type de formation pour optimiser les couts et la logistique.
            </li>
            <li>
              <strong>Tracabilite :</strong> conserver l&apos;historique complet
              (dates, organismes, attestations) pour pouvoir le presenter en cas
              d&apos;audit ou de controle.
            </li>
          </ol>

          {/* Section 9 */}
          <h2 id="excel" className="mt-10 text-2xl font-bold text-slate-900">
            9. Pourquoi Excel ne suffit plus
          </h2>
          <p className="text-slate-700">
            Beaucoup d&apos;entreprises gerent encore leurs habilitations sur
            Excel. Cela fonctionne pour 5 ou 10 salaries, mais les limites
            apparaissent vite :
          </p>
          <ul>
            <li>
              <strong>Pas d&apos;alertes automatiques :</strong> personne n&apos;est
              prevenu quand un CACES expire
            </li>
            <li>
              <strong>Fichiers multiples :</strong> chaque site ou service a son
              propre fichier, impossible d&apos;avoir une vue consolidee
            </li>
            <li>
              <strong>Erreurs de saisie :</strong> dates inversees, doublons,
              oublis
            </li>
            <li>
              <strong>Pas de tracabilite :</strong> qui a modifie quoi et quand
              ?
            </li>
            <li>
              <strong>Audit penible :</strong> des heures a compiler les donnees
              en cas de controle
            </li>
            <li>
              <strong>Pas de convocations :</strong> chaque session de formation
              necessite des emails manuels
            </li>
          </ul>
          <p className="text-slate-700">
            Pour approfondir ce sujet, consultez notre{" "}
            <Link
              href="/comparaison"
              className="text-emerald-600 hover:underline"
            >
              comparaison detaillee CertPilot vs Excel
            </Link>{" "}
            avec calculateur de ROI.
          </p>

          {/* Section 10 */}
          <h2
            id="solution"
            className="mt-10 text-2xl font-bold text-slate-900"
          >
            10. Automatiser avec un logiciel dedie
          </h2>
          <p className="text-slate-700">
            Un logiciel de gestion des habilitations comme CertPilot permet de :
          </p>
          <ul>
            <li>
              <strong>Centraliser</strong> toutes les habilitations et
              certifications dans un tableau de bord unique
            </li>
            <li>
              <strong>Automatiser les alertes</strong> avant expiration (30, 60,
              90 jours configurable)
            </li>
            <li>
              <strong>Generer les convocations</strong> de formation par email en
              un clic
            </li>
            <li>
              <strong>Produire le passeport formation</strong> PDF avec QR code
              pour chaque salarie
            </li>
            <li>
              <strong>Signer electroniquement</strong> les attestations de
              presence
            </li>
            <li>
              <strong>Exporter les donnees</strong> pour les audits en PDF et
              Excel
            </li>
            <li>
              <strong>Tracer toutes les actions</strong> dans un audit trail
              complet
            </li>
          </ul>
          <p className="text-slate-700">
            Le resultat : <strong>zero habilitation expiree</strong>, des audits
            prepares en 5 minutes au lieu de plusieurs heures, et une conformite
            permanente avec les obligations legales.
          </p>
        </div>

        {/* Lead magnet CTA */}
        <div className="mt-12 rounded-2xl border border-emerald-200 bg-linear-to-br from-emerald-50 to-teal-50 p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                Ressource gratuite
              </p>
              <h3 className="mt-1 text-lg font-bold text-[#173B56]">
                Checklist conformite habilitations 2026
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                23 points de controle pour verifier votre conformite.
              </p>
            </div>
            <Link
              href="/checklist"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700"
            >
              Telecharger le PDF
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* CTA CertPilot */}
        <div className="mt-8 rounded-2xl bg-[#173B56] p-8 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-emerald-400" />
          <h3 className="mt-4 text-xl font-bold text-white">
            Pret a automatiser le suivi de vos habilitations ?
          </h3>
          <p className="mt-2 text-sm text-white/70">
            Essayez CertPilot gratuitement pendant 14 jours. Aucune carte
            bancaire requise.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-400"
          >
            Demarrer l&apos;essai gratuit
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>
    </div>
  );
}
