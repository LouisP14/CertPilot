import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Mentions légales | CertPilot",
  description:
    "Mentions légales de CertPilot - Logiciel de gestion des formations et habilitations",
};

export default function MentionsLegales() {
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
        <h1 className="text-3xl font-black text-[#173B56]">Mentions légales</h1>
        <p className="mt-2 text-slate-600">
          Dernière mise à jour : 26 janvier 2026
        </p>

        <div className="mt-10 space-y-8 text-slate-700">
          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              1. Éditeur du site
            </h2>
            <div className="mt-4 space-y-2">
              <p>
                <strong>Raison sociale :</strong> CertPilot
              </p>
              <p>
                <strong>Email :</strong>{" "}
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
            <h2 className="text-xl font-bold text-[#173B56]">2. Hébergeur</h2>
            <div className="mt-4 space-y-2">
              <p>
                <strong>Raison sociale :</strong> Vercel Inc.
              </p>
              <p>
                <strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA
                91789, USA
              </p>
              <p>
                <strong>Site web :</strong>{" "}
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline"
                >
                  https://vercel.com
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              3. Propriété intellectuelle
            </h2>
            <p className="mt-4">
              L&apos;ensemble du contenu de ce site (textes, images, logos,
              graphismes, icônes, logiciels, bases de données, etc.) est protégé
              par le droit d&apos;auteur et les droits de propriété
              intellectuelle, conformément au Code de la Propriété
              Intellectuelle.
            </p>
            <p className="mt-2">
              Toute reproduction, représentation, modification, publication,
              adaptation de tout ou partie des éléments du site, quel que soit
              le moyen ou le procédé utilisé, est interdite, sauf autorisation
              écrite préalable de CertPilot SAS.
            </p>
            <p className="mt-2">
              La marque &quot;CertPilot&quot; et le logo associé sont des
              marques déposées. Toute utilisation non autorisée constitue une
              contrefaçon passible de sanctions pénales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              4. Limitation de responsabilité
            </h2>
            <p className="mt-4">
              CertPilot SAS s&apos;efforce d&apos;assurer au mieux de ses
              possibilités l&apos;exactitude et la mise à jour des informations
              diffusées sur ce site. Toutefois, CertPilot SAS ne peut garantir
              l&apos;exactitude, la précision ou l&apos;exhaustivité des
              informations mises à disposition sur ce site.
            </p>
            <p className="mt-2">
              En conséquence, CertPilot SAS décline toute responsabilité :
            </p>
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li>
                Pour toute imprécision, inexactitude ou omission portant sur des
                informations disponibles sur le site
              </li>
              <li>
                Pour tous dommages résultant d&apos;une intrusion frauduleuse
                d&apos;un tiers
              </li>
              <li>
                Pour tout dommage causé par un virus informatique transmis par
                le site
              </li>
              <li>
                Et plus généralement, de tous dommages directs ou indirects
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              5. Liens hypertextes
            </h2>
            <p className="mt-4">
              Le site peut contenir des liens hypertextes vers d&apos;autres
              sites internet. CertPilot SAS n&apos;exerce aucun contrôle sur ces
              sites et décline toute responsabilité quant à leur contenu ou
              leurs pratiques en matière de protection des données personnelles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              6. Données personnelles
            </h2>
            <p className="mt-4">
              Pour plus d&apos;informations sur la collecte et le traitement de
              vos données personnelles, veuillez consulter notre{" "}
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
            <h2 className="text-xl font-bold text-[#173B56]">7. Cookies</h2>
            <p className="mt-4">
              Pour plus d&apos;informations sur l&apos;utilisation des cookies,
              veuillez consulter notre{" "}
              <Link
                href="/legal/cookies"
                className="text-emerald-600 hover:underline"
              >
                Politique de cookies
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              8. Droit applicable et juridiction
            </h2>
            <p className="mt-4">
              Les présentes mentions légales sont régies par le droit français.
              En cas de litige, les tribunaux français seront seuls compétents.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">9. Crédits</h2>
            <div className="mt-4 space-y-2">
              <p>
                <strong>Conception et développement :</strong> CertPilot SAS
              </p>
              <p>
                <strong>Icônes :</strong> Lucide Icons (
                <a
                  href="https://lucide.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline"
                >
                  lucide.dev
                </a>
                )
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
