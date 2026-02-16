import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "DPA | CertPilot",
  description:
    "Accord de traitement des données (Data Processing Agreement) de CertPilot",
};

export default function DpaPage() {
  return (
    <div className="min-h-screen bg-slate-50">
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

      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-black text-[#173B56]">
          Accord de traitement des données (DPA)
        </h1>
        <p className="mt-2 text-slate-600">Version : Pré-contractuelle B2B</p>

        <div className="mt-10 space-y-8 text-slate-700">
          <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Ce document constitue un cadre DPA prêt à contractualiser. Les
            annexes client (durées de conservation spécifiques, mesures
            complémentaires, sous-traitants autorisés) sont validées à la
            signature.
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">1. Rôles RGPD</h2>
            <ul className="mt-4 ml-6 list-disc space-y-1">
              <li>
                Le Client agit en qualité de{" "}
                <strong>Responsable de traitement</strong>.
              </li>
              <li>
                CertPilot agit en qualité de <strong>Sous-traitant</strong>.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              2. Objet du traitement
            </h2>
            <p className="mt-4">
              Fourniture du service SaaS de gestion des habilitations,
              formations, passeports, alertes, convocations, signatures
              électroniques et audit trail.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              3. Catégories de données traitées
            </h2>
            <ul className="mt-4 ml-6 list-disc space-y-1">
              <li>Données d&apos;identification et RH (nom, poste, service)</li>
              <li>Données de suivi de formation et certificats</li>
              <li>Données d&apos;usage et de sécurité (logs, audit trail)</li>
              <li>Données potentiellement sensibles selon usage client</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              4. Instructions documentées
            </h2>
            <p className="mt-4">
              CertPilot ne traite les données que sur instruction documentée du
              Client et uniquement pour la fourniture du service contractuel.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              5. Mesures de sécurité
            </h2>
            <ul className="mt-4 ml-6 list-disc space-y-1">
              <li>Chiffrement en transit (HTTPS/TLS)</li>
              <li>Gestion des rôles et contrôle d&apos;accès</li>
              <li>Traçabilité des actions (audit trail)</li>
              <li>Procédures de sauvegarde et restauration</li>
              <li>Journalisation des incidents de sécurité</li>
            </ul>
            <p className="mt-3 text-sm text-slate-600">
              Voir aussi la page{" "}
              <Link
                href="/legal/securite"
                className="text-emerald-600 hover:underline"
              >
                Sécurité & disponibilité
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              6. Sous-traitants ultérieurs
            </h2>
            <p className="mt-4">
              CertPilot peut recourir à des sous-traitants techniques
              (hébergement, email transactionnel, facturation). La liste et les
              localisations sont communiquées au Client et mises à jour en cas
              de changement significatif.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              7. Localisation et transferts
            </h2>
            <p className="mt-4">
              Les données sont hébergées selon l&apos;architecture technique du
              service. En cas de transfert hors UE, des garanties appropriées
              sont appliquées (clauses contractuelles types ou mécanisme
              équivalent applicable).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              8. Assistance au Responsable de traitement
            </h2>
            <ul className="mt-4 ml-6 list-disc space-y-1">
              <li>Réponse aux demandes d&apos;exercice de droits</li>
              <li>Notification des violations de données personnelles</li>
              <li>Coopération en cas de contrôle d&apos;autorité</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              9. Sort des données en fin de contrat
            </h2>
            <p className="mt-4">
              À la fin du contrat, le Client peut exporter ses données selon les
              formats proposés. Les modalités de suppression/retour et délais
              sont définis contractuellement.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-4xl px-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} CertPilot. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
