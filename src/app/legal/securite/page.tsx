import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Sécurité & Disponibilité | CertPilot",
  description:
    "Engagements de sécurité, disponibilité, sauvegardes et continuité de service de CertPilot",
  alternates: {
    canonical: "/legal/securite",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SecurityPage() {
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
          Sécurité & disponibilité
        </h1>
        <p className="mt-2 text-slate-600">
          Référentiel opérationnel client B2B
        </p>

        <div className="mt-10 space-y-8 text-slate-700">
          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              1. Contrôle d&apos;accès
            </h2>
            <ul className="mt-4 ml-6 list-disc space-y-1">
              <li>Authentification sécurisée des comptes utilisateurs</li>
              <li>Gestion des rôles (ADMIN / MANAGER / VIEWER)</li>
              <li>Isolation des données par entreprise (multi-tenant)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">2. Chiffrement</h2>
            <ul className="mt-4 ml-6 list-disc space-y-1">
              <li>Chiffrement en transit via HTTPS/TLS</li>
              <li>Protection des secrets et mots de passe (hachage)</li>
              <li>Bonnes pratiques de configuration des accès</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              3. Journalisation et traçabilité
            </h2>
            <ul className="mt-4 ml-6 list-disc space-y-1">
              <li>Piste d&apos;audit des actions critiques</li>
              <li>Historique des opérations sensibles</li>
              <li>Traçabilité des exports et signatures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              4. Sauvegardes et restauration
            </h2>
            <p className="mt-4">
              Les sauvegardes et la restauration sont gérées sur
              l&apos;infrastructure de production. Les paramètres opérationnels
              (fréquence, durée de rétention, RPO, RTO) sont communiqués au
              client dans l&apos;annexe sécurité contractuelle.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              5. Gestion des incidents
            </h2>
            <ul className="mt-4 ml-6 list-disc space-y-1">
              <li>Détection et qualification des incidents</li>
              <li>Mesures de confinement et correction</li>
              <li>Communication client en cas d&apos;impact significatif</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              6. Disponibilité de service
            </h2>
            <p className="mt-4">
              CertPilot vise une haute disponibilité de service. Les engagements
              SLA contractuels (disponibilité cible, maintenance planifiée,
              support, délais de réponse) sont définis dans les documents de
              souscription.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">7. Contact</h2>
            <p className="mt-4">
              Pour un questionnaire sécurité client ou une revue de conformité,
              contactez{" "}
              <a
                href="mailto:contact@certpilot.eu"
                className="text-emerald-600 hover:underline"
              >
                contact@certpilot.eu
              </a>
              .
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Document connexe :{" "}
            <Link
              href="/legal/dpa"
              className="text-emerald-600 hover:underline"
            >
              Accord de traitement des données (DPA)
            </Link>
            .
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
