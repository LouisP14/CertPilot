import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Politique de confidentialité | CertPilot",
  description:
    "Politique de confidentialité et protection des données personnelles de CertPilot",
  alternates: {
    canonical: "/legal/confidentialite",
  },
  robots: {
    index: true,
    follow: true,
  },
};

function BreadcrumbJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.certpilot.eu";
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Confidentialite", item: `${siteUrl}/legal/confidentialite` },
    ],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
  );
}

export default function Confidentialite() {
  return (
    <div className="min-h-screen bg-slate-50">
      <BreadcrumbJsonLd />
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#173B56]"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-black text-[#173B56]">
          Politique de confidentialité
        </h1>
        <p className="mt-2 text-slate-600">
          Dernière mise à jour : 17 avril 2026
        </p>

        <div className="mt-10 space-y-8 text-slate-700">
          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              1. Introduction
            </h2>
            <p className="mt-4">
              CertPilot (&quot;nous&quot;, &quot;notre&quot;,
              &quot;nos&quot;) s&apos;engage à protéger la vie privée des
              utilisateurs de son service de gestion des formations et
              habilitations professionnelles.
            </p>
            <p className="mt-2">
              Cette politique de confidentialité explique comment nous
              collectons, utilisons, stockons et protégeons vos données
              personnelles conformément au Règlement Général sur la Protection
              des Données (RGPD) et à la loi Informatique et Libertés.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              2. Responsable du traitement
            </h2>
            <div className="mt-4 space-y-2">
              <p>
                <strong>CertPilot</strong>
              </p>
              <p>
                Email DPO :{" "}
                <a
                  href="mailto:contact@certpilot.eu"
                  className="text-emerald-600 hover:underline"
                >
                  contact@certpilot.eu
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              3. Données collectées
            </h2>
            <p className="mt-4">
              Nous collectons les catégories de données suivantes :
            </p>

            <h3 className="mt-4 font-semibold text-[#173B56]">
              3.1 Données d&apos;identification des employés
            </h3>
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li>Nom et prénom</li>
              <li>Photo d&apos;identité (optionnelle)</li>
              <li>Poste occupé</li>
              <li>Service / département</li>
              <li>Date d&apos;embauche</li>
              <li>Matricule interne</li>
            </ul>

            <h3 className="mt-4 font-semibold text-[#173B56]">
              3.2 Données de formation
            </h3>
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li>Historique des formations suivies</li>
              <li>Certificats et attestations</li>
              <li>Dates de validité des habilitations</li>
              <li>Besoins de formation identifiés</li>
              <li>Signatures électroniques</li>
            </ul>

            <h3 className="mt-4 font-semibold text-[#173B56]">
              3.3 Données liées au Passeport de Prévention
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Dans le cadre de l&apos;obligation employeur instaurée par le
              décret n° 2025-748 du 1er août 2025 (article L4141-5 du Code du
              travail), les catégories suivantes peuvent être traitées :
            </p>
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li>
                <strong>Numéro d&apos;identification au répertoire (NIR)</strong>{" "}
                — 13 chiffres, obligatoire pour la déclaration à la plateforme
                nationale. Stocké sur notre base en Union Européenne, jamais
                exposé dans les interfaces consultables par des tiers.
              </li>
              <li>Nom de naissance du salarié (si différent du nom d&apos;usage)</li>
              <li>
                Modalité de formation (présentiel / distanciel / mixte),
                qualification du formateur, codes RNCP / Formacode / NSF /
                ROME
              </li>
              <li>
                Référence horodatée de chaque déclaration exportée (pour
                audit)
              </li>
            </ul>
            <p className="mt-2 text-sm text-slate-600">
              Le NIR n&apos;est ni utilisé pour identifier l&apos;employé dans
              l&apos;interface utilisateur, ni affiché sur le passeport QR
              code. Il sert exclusivement à la génération du fichier officiel
              déposé sur{" "}
              <em>prevention.moncompteformation.gouv.fr</em> (Caisse des
              Dépôts).
            </p>

            <h3 className="mt-4 font-semibold text-[#173B56]">
              3.4 Données de connexion
            </h3>
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li>Adresse email professionnelle</li>
              <li>Logs de connexion</li>
              <li>Adresse IP</li>
              <li>Historique des actions (audit trail)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              4. Finalités du traitement
            </h2>
            <p className="mt-4">Vos données sont traitées pour :</p>
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li>
                <strong>Gestion des formations :</strong> suivi des
                habilitations, alertes d&apos;expiration, planification des
                sessions
              </li>
              <li>
                <strong>Génération de documents :</strong> passeports formation,
                convocations, attestations
              </li>
              <li>
                <strong>
                  Déclaration au Passeport de Prévention national :
                </strong>{" "}
                préparation du fichier officiel exigé par l&apos;article
                L4141-5 du Code du travail et déposé par l&apos;employeur sur
                la plateforme de la Caisse des Dépôts.
              </li>
              <li>
                <strong>Conformité réglementaire :</strong> respect des
                obligations légales en matière de formation professionnelle
              </li>
              <li>
                <strong>Audit et traçabilité :</strong> historique des actions
                pour les contrôles et audits
              </li>
              <li>
                <strong>Amélioration du service :</strong> statistiques
                anonymisées, analyse des usages
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              5. Base légale du traitement
            </h2>
            <p className="mt-4">Les traitements de données sont fondés sur :</p>
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li>
                <strong>L&apos;exécution du contrat</strong> : fourniture du
                service CertPilot
              </li>
              <li>
                <strong>L&apos;obligation légale</strong> : respect des
                obligations en matière de formation professionnelle (Code du
                travail)
              </li>
              <li>
                <strong>L&apos;intérêt légitime</strong> : sécurité,
                amélioration du service, prévention des fraudes
              </li>
              <li>
                <strong>Le consentement</strong> : pour les cookies non
                essentiels et les communications marketing
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              6. Destinataires des données
            </h2>
            <p className="mt-4">Vos données peuvent être communiquées à :</p>
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li>
                <strong>Votre employeur</strong> : responsable de la gestion de
                vos formations
              </li>
              <li>
                <strong>Les centres de formation</strong> : dans le cadre de
                l&apos;inscription aux sessions
              </li>
              <li>
                <strong>Nos sous-traitants techniques</strong> : hébergement
                (Railway — Pays-Bas, UE), envoi d&apos;emails (Resend — États-Unis, CCT),
                paiements (Stripe — États-Unis, DPF+CCT), génération de QR codes
                (api.qrserver.com — UE)
              </li>
              <li>
                <strong>Les autorités</strong> : en cas d&apos;obligation légale
              </li>
            </ul>
            <p className="mt-2">
              Nous ne vendons jamais vos données à des tiers.
            </p>
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
              <p className="font-semibold text-amber-900">
                Information sur le passeport formation accessible par QR code
              </p>
              <p className="mt-2 text-amber-800">
                Le passeport formation de chaque salarié est consultable via un
                QR code généré par votre employeur. Les données accessibles par
                ce lien (nom, prénom, fonction, service, photo si renseignée,
                liste des formations validées) sont consultables par toute
                personne disposant du lien. Ce fonctionnement est{" "}
                <strong>volontaire et nécessaire</strong> à la vérification
                terrain des habilitations (audit sécurité, contrôle
                d&apos;accès, inspection). Si vous ne souhaitez pas que votre
                photo soit visible, vous pouvez demander à votre employeur de
                la retirer.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              7. Durée de conservation
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 text-left font-semibold">
                      Type de données
                    </th>
                    <th className="py-2 text-left font-semibold">
                      Durée de conservation
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2">Données des employés actifs</td>
                    <td className="py-2">
                      Durée du contrat de travail + 5 ans
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">Données des employés archivés</td>
                    <td className="py-2">
                      Conservées pour traçabilité jusqu&apos;à suppression
                      définitive par le responsable de compte
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">Certificats et attestations</td>
                    <td className="py-2">Durée de validité + 10 ans</td>
                  </tr>
                  <tr>
                    <td className="py-2">Logs de connexion</td>
                    <td className="py-2">1 an</td>
                  </tr>
                  <tr>
                    <td className="py-2">Audit trail</td>
                    <td className="py-2">5 ans</td>
                  </tr>
                  <tr>
                    <td className="py-2">Leads commerciaux (prospects)</td>
                    <td className="py-2">13 mois — purge automatique</td>
                  </tr>
                  <tr>
                    <td className="py-2">Logs d&apos;alertes</td>
                    <td className="py-2">2 ans — purge automatique</td>
                  </tr>
                  <tr>
                    <td className="py-2">Données de facturation</td>
                    <td className="py-2">10 ans (obligation comptable)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              8. Transferts hors UE
            </h2>
            <p className="mt-4">
              L&apos;hébergement de vos données est réalisé en Union Européenne
              (Railway, Pays-Bas — région europe-west4). Certains sous-traitants
              techniques sont établis aux États-Unis :
            </p>
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li><strong>Resend</strong> (envoi d&apos;emails transactionnels) — encadré par les clauses contractuelles types (CCT)</li>
              <li><strong>Stripe</strong> (traitement des paiements) — certifié Data Privacy Framework (DPF) et clauses contractuelles types (CCT)</li>
            </ul>
            <p className="mt-2">
              Ces transferts sont encadrés par des garanties appropriées :
            </p>
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li>Clauses contractuelles types de la Commission européenne (Art. 46 RGPD)</li>
              <li>
                Data Privacy Framework (DPF) pour les transferts vers les USA
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">9. Vos droits</h2>
            <p className="mt-4">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li>
                <strong>Droit d&apos;accès</strong> : obtenir la confirmation
                que vos données sont traitées et en recevoir une copie
              </li>
              <li>
                <strong>Droit de rectification</strong> : faire corriger les
                données inexactes
              </li>
              <li>
                <strong>Droit à l&apos;effacement</strong> : demander la
                suppression de vos données
              </li>
              <li>
                <strong>Droit à la limitation</strong> : restreindre le
                traitement de vos données
              </li>
              <li>
                <strong>Droit à la portabilité</strong> : recevoir vos données
                dans un format structuré
              </li>
              <li>
                <strong>Droit d&apos;opposition</strong> : vous opposer au
                traitement de vos données
              </li>
            </ul>
            <p className="mt-4">
              Les utilisateurs disposant d&apos;un compte CertPilot (Administrateur / Manager)
              peuvent exercer directement leurs droits d&apos;effacement et de portabilité
              depuis leur profil (rubrique <strong>Mes droits RGPD</strong>) sans intervention
              de notre part.
            </p>
            <p className="mt-2">
              Pour tout autre demande, contactez notre DPO à{" "}
              <a
                href="mailto:contact@certpilot.eu"
                className="text-emerald-600 hover:underline"
              >
                contact@certpilot.eu
              </a>
            </p>
            <p className="mt-2">
              Vous pouvez également introduire une réclamation auprès de la CNIL
              :{" "}
              <a
                href="https://www.cnil.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:underline"
              >
                www.cnil.fr
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              10. Sécurité des données
            </h2>
            <p className="mt-4">
              Nous mettons en œuvre des mesures techniques et organisationnelles
              appropriées pour protéger vos données :
            </p>
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li>Chiffrement des données en transit (HTTPS/TLS)</li>
              <li>Chiffrement des données au repos</li>
              <li>Authentification sécurisée</li>
              <li>Contrôle d&apos;accès strict basé sur les rôles</li>
              <li>Sauvegardes régulières</li>
              <li>Audit trail complet</li>
              <li>Tests de sécurité réguliers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              11. Modifications de la politique
            </h2>
            <p className="mt-4">
              Nous pouvons modifier cette politique de confidentialité à tout
              moment. Les modifications seront publiées sur cette page avec une
              nouvelle date de mise à jour. Pour les modifications importantes,
              nous vous informerons par email ou via une notification dans
              l&apos;application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">12. Contact</h2>
            <p className="mt-4">
              Pour toute question concernant cette politique de confidentialité
              ou vos données personnelles :
            </p>
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
              <p>
                <strong>Délégué à la Protection des Données (DPO)</strong>
              </p>
              <p className="mt-2">
                Email :{" "}
                <a
                  href="mailto:contact@certpilot.eu"
                  className="text-emerald-600 hover:underline"
                >
                  contact@certpilot.eu
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-4xl px-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} CertPilot. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
