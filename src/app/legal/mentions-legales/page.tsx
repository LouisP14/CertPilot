import {
  legalIsSetupComplete,
  legalMissingFields,
  legalProfile,
} from "@/lib/legal-profile";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Mentions légales | CertPilot",
  description:
    "Mentions légales de CertPilot - Logiciel de gestion des formations et habilitations",
};

function missing(value: string | null, fallback = "À compléter") {
  return value || fallback;
}

export default function MentionsLegales() {
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
        <h1 className="text-3xl font-black text-[#173B56]">Mentions légales</h1>
        <p className="mt-2 text-slate-600">
          Dernière mise à jour : 16 février 2026
        </p>

        {!legalIsSetupComplete && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Certaines mentions obligatoires seront finalisées après
            immatriculation (SIRET/RCS/TVA et identité légale complète).
          </div>
        )}

        <div className="mt-10 space-y-8 text-slate-700">
          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              1. Éditeur du site
            </h2>
            <div className="mt-4 space-y-2">
              <p>
                <strong>Marque :</strong> {legalProfile.brandName}
              </p>
              <p>
                <strong>Raison sociale :</strong>{" "}
                {missing(legalProfile.legalEntityName)}
              </p>
              <p>
                <strong>Forme juridique :</strong>{" "}
                {missing(legalProfile.legalForm)}
              </p>
              <p>
                <strong>Adresse du siège :</strong>{" "}
                {missing(legalProfile.address)}
              </p>
              <p>
                <strong>SIRET :</strong> {missing(legalProfile.siret)}
              </p>
              <p>
                <strong>RCS :</strong> {missing(legalProfile.rcs)}
              </p>
              <p>
                <strong>TVA intracommunautaire :</strong>{" "}
                {missing(legalProfile.vatNumber)}
              </p>
              <p>
                <strong>Directeur de la publication :</strong>{" "}
                {missing(legalProfile.publicationDirector)}
              </p>
              <p>
                <strong>Email :</strong>{" "}
                <a
                  href={`mailto:${legalProfile.contactEmail}`}
                  className="text-emerald-600 hover:underline"
                >
                  {legalProfile.contactEmail}
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">2. Hébergeur</h2>
            <div className="mt-4 space-y-2">
              <p>
                <strong>Raison sociale :</strong> {legalProfile.hostName}
              </p>
              <p>
                <strong>Adresse :</strong> {legalProfile.hostAddress}
              </p>
              <p>
                <strong>Site web :</strong>{" "}
                <a
                  href={legalProfile.hostWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline"
                >
                  {legalProfile.hostWebsite}
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              3. Propriété intellectuelle
            </h2>
            <p className="mt-4">
              L&apos;ensemble du contenu (textes, visuels, interfaces, éléments
              logiciels, bases de données) est protégé par le droit
              d&apos;auteur et les droits de propriété intellectuelle.
            </p>
            <p className="mt-2">
              Toute reproduction ou utilisation non autorisée est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              4. Données personnelles et cookies
            </h2>
            <p className="mt-4">Pour plus d&apos;informations :</p>
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li>
                <Link
                  href="/legal/confidentialite"
                  className="text-emerald-600 hover:underline"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/cookies"
                  className="text-emerald-600 hover:underline"
                >
                  Politique de cookies
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/dpa"
                  className="text-emerald-600 hover:underline"
                >
                  Accord de traitement des données (DPA)
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/securite"
                  className="text-emerald-600 hover:underline"
                >
                  Sécurité & disponibilité
                </Link>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              5. Droit applicable et juridiction
            </h2>
            <p className="mt-4">
              Les présentes mentions légales sont régies par le droit français.
              En cas de litige, les juridictions françaises sont compétentes.
            </p>
          </section>

          {!legalIsSetupComplete && (
            <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <p className="font-semibold text-[#173B56]">
                Champs en attente d&apos;immatriculation
              </p>
              <ul className="mt-2 ml-6 list-disc text-slate-600">
                {legalMissingFields.companyIdentity && (
                  <li>
                    Identité légale complète (raison sociale, forme, adresse)
                  </li>
                )}
                {legalMissingFields.registration && (
                  <li>Numéros d&apos;immatriculation (SIRET / RCS)</li>
                )}
                {legalMissingFields.tax && (
                  <li>Numéro de TVA intracommunautaire</li>
                )}
                {legalMissingFields.publication && (
                  <li>Directeur de la publication</li>
                )}
              </ul>
            </section>
          )}
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
