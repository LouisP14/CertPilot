import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Conditions Générales de Vente | CertPilot",
  description:
    "Conditions Générales de Vente de CertPilot - Logiciel de gestion des formations",
  alternates: {
    canonical: "/legal/cgv",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CGV() {
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
          Conditions Générales de Vente
        </h1>
        <p className="mt-2 text-slate-600">
          Dernière mise à jour : 26 janvier 2026
        </p>

        <div className="mt-10 space-y-8 text-slate-700">
          <section>
            <h2 className="text-xl font-bold text-[#173B56]">1. Préambule</h2>
            <p className="mt-4">
              Les présentes Conditions Générales de Vente (CGV)
              s&apos;appliquent à toute souscription d&apos;un abonnement au
              service CertPilot édité par CertPilot SAS.
            </p>
            <p className="mt-2">
              Toute commande implique l&apos;acceptation sans réserve des
              présentes CGV.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              2. Identification du vendeur
            </h2>
            <div className="mt-4 space-y-2">
              <p>
                <strong>CertPilot</strong>
              </p>
              <p>
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

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              3. Description des offres
            </h2>
            <p className="mt-4">
              CertPilot propose des abonnements mensuels ou annuels selon la
              taille de l&apos;entreprise :
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left font-semibold">Offre</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Employés
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Prix/mois
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Prix/an
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-3">Starter</td>
                    <td className="px-4 py-3">1 à 50</td>
                    <td className="px-4 py-3">199 € HT</td>
                    <td className="px-4 py-3">1 990 € HT (-17%)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Business</td>
                    <td className="px-4 py-3">51 à 100</td>
                    <td className="px-4 py-3">349 € HT</td>
                    <td className="px-4 py-3">3 490 € HT (-17%)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Enterprise</td>
                    <td className="px-4 py-3">101 à 200</td>
                    <td className="px-4 py-3">599 € HT</td>
                    <td className="px-4 py-3">5 990 € HT (-17%)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Corporate</td>
                    <td className="px-4 py-3">201 à 500</td>
                    <td className="px-4 py-3">1 199 € HT</td>
                    <td className="px-4 py-3">11 990 € HT (-17%)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Pour les entreprises de plus de 500 employés, un devis
              personnalisé sera établi sur demande.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              4. Fonctionnalités incluses
            </h2>
            <p className="mt-4">
              Toutes les offres incluent l&apos;ensemble des fonctionnalités :
            </p>
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li>Gestion illimitée des formations et certificats</li>
              <li>Passeports formation personnalisés avec QR Code</li>
              <li>Alertes d&apos;expiration automatiques</li>
              <li>Planification des sessions et convocations</li>
              <li>Signatures électroniques</li>
              <li>Exports PDF et Excel</li>
              <li>Audit trail complet</li>
              <li>Support par email</li>
              <li>Mises à jour incluses</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              5. Commande et souscription
            </h2>

            <h3 className="mt-4 font-semibold text-[#173B56]">
              5.1 Processus de commande
            </h3>
            <p className="mt-2">
              La souscription s&apos;effectue en ligne sur le site CertPilot. Le
              Client sélectionne son offre, crée son compte et procède au
              paiement.
            </p>

            <h3 className="mt-4 font-semibold text-[#173B56]">
              5.2 Période d&apos;essai
            </h3>
            <p className="mt-2">
              Une période d&apos;essai gratuite de 14 jours est proposée sans
              engagement ni carte bancaire. À l&apos;issue de cette période, le
              Client doit souscrire un abonnement pour continuer à utiliser le
              service.
            </p>

            <h3 className="mt-4 font-semibold text-[#173B56]">
              5.3 Confirmation
            </h3>
            <p className="mt-2">
              Un email de confirmation est envoyé au Client dès la validation du
              paiement, accompagné de la facture correspondante.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              6. Prix et paiement
            </h2>

            <h3 className="mt-4 font-semibold text-[#173B56]">6.1 Prix</h3>
            <p className="mt-2">
              Les prix sont exprimés en euros hors taxes (HT). La TVA applicable
              (20%) est ajoutée au moment de la facturation.
            </p>
            <p className="mt-2">
              CertPilot se réserve le droit de modifier ses tarifs. Toute
              modification sera notifiée au Client avec un préavis de 30 jours.
            </p>

            <h3 className="mt-4 font-semibold text-[#173B56]">
              6.2 Moyens de paiement
            </h3>
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li>Carte bancaire (Visa, Mastercard, American Express)</li>
              <li>Prélèvement SEPA (abonnement annuel uniquement)</li>
              <li>Virement bancaire (sur demande, abonnement annuel)</li>
            </ul>

            <h3 className="mt-4 font-semibold text-[#173B56]">
              6.3 Facturation
            </h3>
            <p className="mt-2">
              L&apos;abonnement mensuel est facturé le jour de la souscription,
              puis à chaque date anniversaire. L&apos;abonnement annuel est
              facturé en une seule fois à la souscription.
            </p>

            <h3 className="mt-4 font-semibold text-[#173B56]">
              6.4 Retard de paiement
            </h3>
            <p className="mt-2">
              En cas de retard de paiement, des pénalités de retard seront
              appliquées au taux légal majoré de 10 points. Une indemnité
              forfaitaire de 40 € pour frais de recouvrement sera due
              conformément à l&apos;article L.441-6 du Code de commerce.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              7. Durée et renouvellement
            </h2>
            <p className="mt-4">
              L&apos;abonnement est souscrit pour une durée initiale d&apos;un
              mois ou d&apos;un an selon l&apos;offre choisie.
            </p>
            <p className="mt-2">
              <strong>Renouvellement tacite :</strong> l&apos;abonnement est
              renouvelé automatiquement pour une période identique, sauf
              résiliation par le Client avant la date d&apos;échéance.
            </p>
            <p className="mt-2">
              Un email de rappel est envoyé 7 jours avant chaque renouvellement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">8. Résiliation</h2>

            <h3 className="mt-4 font-semibold text-[#173B56]">
              8.1 Résiliation par le Client
            </h3>
            <p className="mt-2">
              Le Client peut résilier son abonnement à tout moment depuis son
              espace client. La résiliation prendra effet à la fin de la période
              en cours.
            </p>

            <h3 className="mt-4 font-semibold text-[#173B56]">
              8.2 Résiliation par CertPilot
            </h3>
            <p className="mt-2">
              CertPilot peut résilier l&apos;abonnement en cas de :
            </p>
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li>Non-paiement après mise en demeure restée infructueuse</li>
              <li>Violation grave des CGU</li>
              <li>Utilisation frauduleuse du service</li>
            </ul>

            <h3 className="mt-4 font-semibold text-[#173B56]">
              8.3 Conséquences de la résiliation
            </h3>
            <p className="mt-2">
              En cas de résiliation, le Client conserve l&apos;accès au service
              jusqu&apos;à la fin de la période payée. Il dispose ensuite de 30
              jours pour exporter ses données.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              9. Droit de rétractation
            </h2>
            <p className="mt-4">
              Conformément à l&apos;article L.221-28 du Code de la consommation,
              le droit de rétractation ne s&apos;applique pas aux contrats de
              fourniture de contenu numérique exécuté immédiatement avec
              l&apos;accord du consommateur.
            </p>
            <p className="mt-2">
              Le Client professionnel (B2B) ne bénéficie pas du droit de
              rétractation.
            </p>
            <p className="mt-2">
              Toutefois, CertPilot propose une période d&apos;essai gratuite de
              14 jours permettant de tester le service avant tout engagement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              10. Garanties et responsabilité
            </h2>

            <h3 className="mt-4 font-semibold text-[#173B56]">
              10.1 Engagement de service
            </h3>
            <p className="mt-2">
              CertPilot s&apos;engage sur un taux de disponibilité de 99,9%
              (hors maintenance planifiée). En cas de défaillance, un avoir sera
              accordé au prorata du temps d&apos;indisponibilité.
            </p>

            <h3 className="mt-4 font-semibold text-[#173B56]">
              10.2 Limitation de responsabilité
            </h3>
            <p className="mt-2">
              La responsabilité de CertPilot est limitée au montant des sommes
              versées par le Client au cours des 12 derniers mois.
            </p>
            <p className="mt-2">
              CertPilot ne saurait être tenue responsable des dommages
              indirects, pertes de données ou de profits, même si CertPilot a
              été informée de la possibilité de tels dommages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              11. Données personnelles
            </h2>
            <p className="mt-4">
              CertPilot traite les données personnelles conformément au RGPD.
              Pour plus d&apos;informations, consultez notre{" "}
              <Link
                href="/legal/confidentialite"
                className="text-emerald-600 hover:underline"
              >
                Politique de confidentialité
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              12. Propriété intellectuelle
            </h2>
            <p className="mt-4">
              Le Client dispose d&apos;un droit d&apos;utilisation non exclusif
              du Service pendant la durée de son abonnement. Ce droit ne confère
              aucun droit de propriété sur le logiciel ou son code source.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              13. Réclamations et support
            </h2>
            <p className="mt-4">
              Pour toute réclamation ou demande de support :
            </p>
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li>
                Email :{" "}
                <a
                  href="mailto:contact@certpilot.eu"
                  className="text-emerald-600 hover:underline"
                >
                  contact@certpilot.eu
                </a>
              </li>
              <li>Formulaire de contact dans l&apos;application</li>
            </ul>
            <p className="mt-2">
              CertPilot s&apos;engage à répondre dans un délai de 48 heures
              ouvrées.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              14. Droit applicable et litiges
            </h2>
            <p className="mt-4">
              Les présentes CGV sont soumises au droit français.
            </p>
            <p className="mt-2">
              En cas de litige, les parties rechercheront une solution amiable.
              À défaut, le litige sera soumis aux tribunaux compétents de Paris.
            </p>
            <p className="mt-2">
              Conformément à l&apos;article L.612-1 du Code de la consommation,
              le Client consommateur peut recourir gratuitement au médiateur de
              la consommation :
            </p>
            <div className="mt-2 ml-6 rounded-lg border border-slate-200 bg-white p-3 text-sm">
              <p>Médiateur du e-commerce de la FEVAD</p>
              <p>60 rue La Boétie - 75008 Paris</p>
              <p>
                <a
                  href="https://www.mediateurfevad.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline"
                >
                  www.mediateurfevad.fr
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              15. Modification des CGV
            </h2>
            <p className="mt-4">
              CertPilot se réserve le droit de modifier les présentes CGV. Les
              modifications seront communiquées au Client par email avec un
              préavis de 30 jours.
            </p>
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
