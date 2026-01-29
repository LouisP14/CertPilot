import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Politique de confidentialité | CertPilot",
  description:
    "Politique de confidentialité et protection des données personnelles de CertPilot",
};

export default function Confidentialite() {
  return (
    <div className="min-h-screen bg-slate-50">
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
          Dernière mise à jour : 26 janvier 2026
        </p>

        <div className="mt-10 space-y-8 text-slate-700">
          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              1. Introduction
            </h2>
            <p className="mt-4">
              CertPilot SAS (&quot;nous&quot;, &quot;notre&quot;,
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
              3.3 Données de connexion
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
                (Vercel), base de données, envoi d&apos;emails
              </li>
              <li>
                <strong>Les autorités</strong> : en cas d&apos;obligation légale
              </li>
            </ul>
            <p className="mt-2">
              Nous ne vendons jamais vos données à des tiers.
            </p>
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
              Certaines de nos infrastructures techniques peuvent être situées
              hors de l&apos;Union Européenne (notamment aux États-Unis pour
              l&apos;hébergement Vercel).
            </p>
            <p className="mt-2">
              Ces transferts sont encadrés par des garanties appropriées :
            </p>
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li>Clauses contractuelles types de la Commission européenne</li>
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
              Pour exercer ces droits, contactez notre DPO à{" "}
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
