import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Conditions Générales d'Utilisation | CertPilot",
  description:
    "Conditions Générales d'Utilisation de CertPilot - Logiciel de gestion des formations",
};

export default function CGU() {
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
          Conditions Générales d&apos;Utilisation
        </h1>
        <p className="mt-2 text-slate-600">
          Dernière mise à jour : 26 janvier 2026
        </p>

        <div className="mt-10 space-y-8 text-slate-700">
          <section>
            <h2 className="text-xl font-bold text-[#173B56]">1. Objet</h2>
            <p className="mt-4">
              Les présentes Conditions Générales d&apos;Utilisation (CGU)
              définissent les modalités d&apos;accès et d&apos;utilisation de la
              plateforme CertPilot, accessible à l&apos;adresse{" "}
              <a
                href="https://certpilot.fr"
                className="text-emerald-600 hover:underline"
              >
                certpilot.fr
              </a>
              .
            </p>
            <p className="mt-2">
              CertPilot est une solution SaaS de gestion des formations et
              habilitations professionnelles destinée aux entreprises et
              organismes de formation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              2. Acceptation des CGU
            </h2>
            <p className="mt-4">
              L&apos;accès et l&apos;utilisation de CertPilot impliquent
              l&apos;acceptation pleine et entière des présentes CGU.
            </p>
            <p className="mt-2">
              En créant un compte ou en utilisant le service, vous reconnaissez
              avoir pris connaissance de ces conditions et les accepter sans
              réserve.
            </p>
            <p className="mt-2">
              Si vous n&apos;acceptez pas ces conditions, vous ne devez pas
              utiliser le service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">3. Définitions</h2>
            <ul className="mt-4 ml-6 list-disc space-y-2">
              <li>
                <strong>&quot;Service&quot;</strong> : la plateforme CertPilot
                et l&apos;ensemble de ses fonctionnalités
              </li>
              <li>
                <strong>&quot;Utilisateur&quot;</strong> : toute personne
                physique accédant au Service
              </li>
              <li>
                <strong>&quot;Client&quot;</strong> : l&apos;entreprise ou
                l&apos;organisme ayant souscrit un abonnement
              </li>
              <li>
                <strong>&quot;Administrateur&quot;</strong> : Utilisateur
                disposant des droits de gestion du compte Client
              </li>
              <li>
                <strong>&quot;Employé&quot;</strong> : personne dont les
                formations sont gérées via le Service
              </li>
              <li>
                <strong>&quot;Contenu&quot;</strong> : toute donnée, document ou
                information saisie dans le Service
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              4. Description du Service
            </h2>
            <p className="mt-4">
              CertPilot propose les fonctionnalités suivantes :
            </p>
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li>Gestion du catalogue des formations et habilitations</li>
              <li>Suivi des certifications des employés</li>
              <li>Alertes automatiques d&apos;expiration</li>
              <li>Génération de passeports formation individuels</li>
              <li>Planification et convocations aux sessions</li>
              <li>Gestion des besoins de formation</li>
              <li>Suivi budgétaire</li>
              <li>Signatures électroniques</li>
              <li>Audit trail et traçabilité</li>
              <li>Export de rapports et statistiques</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              5. Accès au Service
            </h2>

            <h3 className="mt-4 font-semibold text-[#173B56]">
              5.1 Création de compte
            </h3>
            <p className="mt-2">
              L&apos;accès au Service nécessite la création d&apos;un compte.
              L&apos;Utilisateur s&apos;engage à fournir des informations
              exactes et à les maintenir à jour.
            </p>

            <h3 className="mt-4 font-semibold text-[#173B56]">
              5.2 Identifiants
            </h3>
            <p className="mt-2">
              Les identifiants de connexion sont personnels et confidentiels.
              L&apos;Utilisateur est responsable de leur préservation et de
              toute utilisation faite de son compte.
            </p>

            <h3 className="mt-4 font-semibold text-[#173B56]">
              5.3 Disponibilité
            </h3>
            <p className="mt-2">
              CertPilot s&apos;efforce d&apos;assurer une disponibilité maximale
              du Service (objectif 99,9%). Toutefois, des interruptions peuvent
              survenir pour maintenance ou en cas de force majeure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              6. Obligations de l&apos;Utilisateur
            </h2>
            <p className="mt-4">L&apos;Utilisateur s&apos;engage à :</p>
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li>
                Utiliser le Service conformément à sa destination et à la
                législation en vigueur
              </li>
              <li>
                Ne pas tenter d&apos;accéder de manière non autorisée au Service
                ou aux données d&apos;autres utilisateurs
              </li>
              <li>Ne pas introduire de virus ou code malveillant</li>
              <li>
                Ne pas utiliser le Service à des fins illégales ou frauduleuses
              </li>
              <li>Respecter les droits de propriété intellectuelle</li>
              <li>
                Saisir des informations exactes concernant les employés et leurs
                formations
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              7. Propriété intellectuelle
            </h2>
            <p className="mt-4">
              CertPilot et l&apos;ensemble de ses composants (logiciel,
              interface, marque, documentation) sont la propriété exclusive de
              CertPilot SAS.
            </p>
            <p className="mt-2">
              L&apos;Utilisateur dispose d&apos;un droit d&apos;utilisation
              personnel et non exclusif, limité à la durée de son abonnement.
            </p>
            <p className="mt-2">
              Toute reproduction, modification ou distribution non autorisée est
              strictement interdite.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              8. Données et Contenu
            </h2>
            <p className="mt-4">
              Le Client reste propriétaire des données qu&apos;il saisit dans le
              Service.
            </p>
            <p className="mt-2">
              CertPilot s&apos;engage à ne pas utiliser les données du Client à
              d&apos;autres fins que la fourniture du Service.
            </p>
            <p className="mt-2">
              Le Client peut à tout moment exporter ses données dans un format
              standard (PDF, Excel).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              9. Responsabilité
            </h2>

            <h3 className="mt-4 font-semibold text-[#173B56]">
              9.1 Responsabilité de CertPilot
            </h3>
            <p className="mt-2">
              CertPilot s&apos;engage à fournir le Service avec diligence.
              Toutefois, CertPilot ne peut garantir :
            </p>
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li>
                L&apos;absence totale d&apos;erreurs ou d&apos;interruptions
              </li>
              <li>La compatibilité avec tous les environnements techniques</li>
              <li>Les résultats obtenus par l&apos;utilisation du Service</li>
            </ul>

            <h3 className="mt-4 font-semibold text-[#173B56]">
              9.2 Limitation de responsabilité
            </h3>
            <p className="mt-2">
              En aucun cas, CertPilot ne pourra être tenue responsable des
              dommages indirects, pertes de données, de profits ou
              d&apos;exploitation subis par le Client.
            </p>
            <p className="mt-2">
              La responsabilité totale de CertPilot est limitée au montant des
              sommes versées par le Client au cours des 12 derniers mois.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              10. Confidentialité
            </h2>
            <p className="mt-4">
              CertPilot s&apos;engage à maintenir la confidentialité des données
              du Client et à mettre en œuvre toutes les mesures de sécurité
              appropriées.
            </p>
            <p className="mt-2">
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
              11. Suspension et résiliation
            </h2>
            <p className="mt-4">
              CertPilot se réserve le droit de suspendre ou résilier
              l&apos;accès au Service en cas de :
            </p>
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li>Non-paiement des sommes dues</li>
              <li>Violation des présentes CGU</li>
              <li>Utilisation frauduleuse du Service</li>
              <li>Comportement portant atteinte à la sécurité du Service</li>
            </ul>
            <p className="mt-2">
              En cas de résiliation, le Client conserve ses données pendant 30
              jours pour les exporter.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              12. Modifications des CGU
            </h2>
            <p className="mt-4">
              CertPilot peut modifier les présentes CGU à tout moment. Les
              Utilisateurs seront informés par email ou notification dans
              l&apos;application.
            </p>
            <p className="mt-2">
              La poursuite de l&apos;utilisation du Service après modification
              vaut acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              13. Droit applicable et litiges
            </h2>
            <p className="mt-4">
              Les présentes CGU sont soumises au droit français.
            </p>
            <p className="mt-2">
              En cas de litige, les parties s&apos;efforceront de trouver une
              solution amiable. À défaut, les tribunaux de Paris seront seuls
              compétents.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">14. Contact</h2>
            <p className="mt-4">
              Pour toute question relative aux présentes CGU :
            </p>
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
              <p>
                <strong>CertPilot SAS</strong>
              </p>
              <p className="mt-2">123 Avenue de la Formation</p>
              <p>75001 Paris, France</p>
              <p className="mt-2">
                Email :{" "}
                <a
                  href="mailto:contact@certpilot.fr"
                  className="text-emerald-600 hover:underline"
                >
                  contact@certpilot.fr
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
