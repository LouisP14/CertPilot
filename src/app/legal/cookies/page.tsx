import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Politique de cookies | CertPilot",
  description:
    "Politique de cookies de CertPilot - Gestion des cookies et traceurs",
  alternates: {
    canonical: "/legal/cookies",
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
      { "@type": "ListItem", position: 2, name: "Cookies", item: `${siteUrl}/legal/cookies` },
    ],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
  );
}

export default function Cookies() {
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
          Politique de cookies
        </h1>
        <p className="mt-2 text-slate-600">
          Dernière mise à jour : 26 janvier 2026
        </p>

        <div className="mt-10 space-y-8 text-slate-700">
          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              1. Qu&apos;est-ce qu&apos;un cookie ?
            </h2>
            <p className="mt-4">
              Un cookie est un petit fichier texte déposé sur votre terminal
              (ordinateur, smartphone, tablette) lors de la visite d&apos;un
              site web. Il permet au site de mémoriser des informations sur
              votre visite, comme vos préférences de langue ou de connexion.
            </p>
            <p className="mt-2">
              Les cookies peuvent être déposés par le site que vous visitez
              (&quot;cookies propriétaires&quot;) ou par d&apos;autres sites
              (&quot;cookies tiers&quot;).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              2. Les cookies utilisés par CertPilot
            </h2>
            <p className="mt-4">
              CertPilot utilise différentes catégories de cookies :
            </p>

            <h3 className="mt-6 font-semibold text-[#173B56]">
              2.1 Cookies strictement nécessaires
            </h3>
            <p className="mt-2">
              Ces cookies sont indispensables au fonctionnement du site. Ils ne
              peuvent pas être désactivés.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-2 text-left font-semibold">Nom</th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Finalité
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">Durée</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-2 font-mono text-xs">
                      next-auth.session-token
                    </td>
                    <td className="px-4 py-2">
                      Authentification de l&apos;utilisateur
                    </td>
                    <td className="px-4 py-2">Session</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-xs">
                      next-auth.csrf-token
                    </td>
                    <td className="px-4 py-2">
                      Protection contre les attaques CSRF
                    </td>
                    <td className="px-4 py-2">Session</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-xs">
                      next-auth.callback-url
                    </td>
                    <td className="px-4 py-2">Redirection après connexion</td>
                    <td className="px-4 py-2">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="mt-6 font-semibold text-[#173B56]">
              2.2 Stockage local (localStorage)
            </h3>
            <p className="mt-2">
              CertPilot utilise le stockage local du navigateur (localStorage)
              pour mémoriser vos préférences d&apos;interface. Ces données ne
              sont pas transmises à nos serveurs.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-2 text-left font-semibold">Clé</th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Finalité
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">Durée</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-2 font-mono text-xs">cookie-consent</td>
                    <td className="px-4 py-2">
                      Mémorisation de vos choix de consentement
                    </td>
                    <td className="px-4 py-2">Persistent</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="mt-6 font-semibold text-[#173B56]">
              2.3 Cookies analytiques
            </h3>
            <p className="mt-2">
              CertPilot n&apos;utilise actuellement <strong>aucun outil
              d&apos;analyse tiers</strong> (Google Analytics ou équivalent).
              Aucun cookie de mesure d&apos;audience n&apos;est déposé.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">3. Base légale</h2>
            <p className="mt-4">
              Conformément à la directive ePrivacy et au RGPD :
            </p>
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li>
                <strong>Cookies strictement nécessaires :</strong> déposés sans
                consentement car indispensables au fonctionnement du service
                (authentification, sécurité CSRF)
              </li>
              <li>
                <strong>Stockage local :</strong> utilisé sans transmission
                à nos serveurs, uniquement pour vos préférences d&apos;interface
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              4. Gestion de vos préférences
            </h2>

            <h3 className="mt-4 font-semibold text-[#173B56]">
              4.1 Bannière de consentement
            </h3>
            <p className="mt-2">
              Lors de votre première visite, une bannière vous permet
              d&apos;accepter ou de refuser les cookies non essentiels. Vous
              pouvez modifier vos choix à tout moment.
            </p>

            <h3 className="mt-4 font-semibold text-[#173B56]">
              4.2 Paramètres du navigateur
            </h3>
            <p className="mt-2">
              Vous pouvez également configurer votre navigateur pour :
            </p>
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li>Accepter ou refuser tous les cookies</li>
              <li>Être averti avant l&apos;enregistrement d&apos;un cookie</li>
              <li>Supprimer les cookies existants</li>
            </ul>

            <div className="mt-4 space-y-2">
              <p className="font-medium">
                Liens vers les guides des principaux navigateurs :
              </p>
              <ul className="ml-6 list-disc space-y-1 text-sm">
                <li>
                  <a
                    href="https://support.google.com/chrome/answer/95647"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:underline"
                  >
                    Google Chrome
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.mozilla.org/fr/kb/cookies-informations-sites-enregistrent"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:underline"
                  >
                    Mozilla Firefox
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:underline"
                  >
                    Safari
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:underline"
                  >
                    Microsoft Edge
                  </a>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              5. Cookies tiers
            </h2>
            <p className="mt-4">
              CertPilot n&apos;intègre actuellement aucun service tiers déposant
              des cookies (pas de Google Analytics, pas de réseaux sociaux,
              pas de publicité). Les seuls cookies présents sont les cookies
              techniques de session listés ci-dessus.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Note : la génération des QR codes sur les passeports formation
              utilise le service <strong>api.qrserver.com</strong> (UE). Cet
              appel est effectué côté serveur et ne dépose aucun cookie sur
              votre terminal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              6. Durée de conservation
            </h2>
            <p className="mt-4">
              Conformément aux recommandations de la CNIL, les cookies ont une
              durée de vie maximale de 13 mois. Votre consentement est redemandé
              au-delà de cette période.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              7. Évolutions de la politique
            </h2>
            <p className="mt-4">
              Cette politique de cookies peut être modifiée à tout moment. Nous
              vous informerons de toute modification importante par une
              notification sur le site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">8. Contact</h2>
            <p className="mt-4">
              Pour toute question concernant notre utilisation des cookies :
            </p>
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
              <p>
                <strong>CertPilot</strong>
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

          <section>
            <h2 className="text-xl font-bold text-[#173B56]">
              9. Pour aller plus loin
            </h2>
            <p className="mt-4">Ressources utiles :</p>
            <ul className="mt-2 ml-6 list-disc space-y-1">
              <li>
                <a
                  href="https://www.cnil.fr/fr/cookies-et-autres-traceurs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline"
                >
                  CNIL - Cookies et autres traceurs
                </a>
              </li>
              <li>
                <a
                  href="https://www.youronlinechoices.com/fr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline"
                >
                  Your Online Choices - Gérer vos cookies publicitaires
                </a>
              </li>
            </ul>
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
