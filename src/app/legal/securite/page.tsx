import { ArrowLeft, CheckCircle2 } from "lucide-react";
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

function BreadcrumbJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.certpilot.eu";
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Sécurité", item: `${siteUrl}/legal/securite` },
    ],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
  );
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
      <span>{children}</span>
    </li>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-[#173B56]">{title}</h2>
      {children}
    </section>
  );
}

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <BreadcrumbJsonLd />
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
        <div className="mb-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
          Référentiel sécurité B2B
        </div>
        <h1 className="text-3xl font-black text-[#173B56]">
          Sécurité &amp; disponibilité
        </h1>
        <p className="mt-3 text-slate-600 max-w-2xl">
          CertPilot est conçu pour des environnements professionnels exigeants. Ce document
          détaille les mesures techniques et organisationnelles mises en œuvre pour protéger
          vos données.
        </p>

        <div className="mt-10 space-y-5">

          {/* Hébergement */}
          <Section title="🌍 Hébergement & localisation des données">
            <ul className="space-y-3 text-slate-700">
              <Check>
                <strong>Données hébergées en Europe</strong> — serveurs d&apos;application et base de données
                localisés en Europe (Frankfurt, Allemagne) via Railway et son infrastructure cloud.
              </Check>
              <Check>
                <strong>Sous-traitants encadrés contractuellement</strong> — les prestataires tiers
                (Resend pour les emails, Stripe pour les paiements) sont soumis aux clauses
                contractuelles types de la Commission Européenne (CCT/SCC), conformément au RGPD.
              </Check>
              <Check>
                <strong>Base de données PostgreSQL</strong> dédiée avec volume persistant — vos données
                ne sont jamais partagées avec d&apos;autres clients.
              </Check>
            </ul>
          </Section>

          {/* Isolation des données */}
          <Section title="🔒 Isolation & cloisonnement des données">
            <ul className="space-y-3 text-slate-700">
              <Check>
                <strong>Architecture multi-tenant stricte</strong> — chaque entreprise dispose d&apos;un
                identifiant unique (<code className="rounded bg-slate-100 px-1 text-sm">companyId</code>)
                vérifié sur chaque requête API. Aucun accès croisé n&apos;est techniquement possible.
              </Check>
              <Check>
                <strong>Contrôle d&apos;accès par rôle</strong> — trois niveaux de droits distincts :
                Administrateur, Manager, Lecteur. Chaque utilisateur n&apos;accède qu&apos;aux données
                de son périmètre.
              </Check>
              <Check>
                <strong>Sessions sécurisées</strong> — authentification par token JWT signé,
                expiration automatique des sessions inactives.
              </Check>
            </ul>
          </Section>

          {/* Authentification */}
          <Section title="🔑 Authentification & protection des accès">
            <ul className="space-y-3 text-slate-700">
              <Check>
                <strong>Mots de passe hachés avec bcrypt</strong> (facteur de coût 12) —
                standard utilisé par les banques et institutions financières. Même CertPilot
                ne peut pas lire vos mots de passe.
              </Check>
              <Check>
                <strong>Vérification d&apos;email obligatoire</strong> à l&apos;inscription —
                aucun compte actif sans confirmation.
              </Check>
              <Check>
                <strong>Double authentification (TOTP)</strong> — activation optionnelle
                d&apos;un second facteur via Google Authenticator ou Authy pour les comptes
                administrateurs.
              </Check>
              <Check>
                <strong>Protection anti-brute force</strong> — limitation automatique des tentatives
                de connexion échouées (10 essais / 15 minutes par compte), avec rate limiting
                dédié sur les codes TOTP.
              </Check>
              <Check>
                <strong>Tokens de réinitialisation à usage unique</strong> avec expiration
                de 24h — aucune réutilisation possible.
              </Check>
              <Check>
                <strong>Mots de passe temporaires cryptographiquement sûrs</strong> — générés
                via <code className="rounded bg-slate-100 px-1 text-sm">crypto.randomBytes</code>,
                standard de sécurité pour la génération de secrets non prédictibles.
              </Check>
            </ul>
          </Section>

          {/* Chiffrement & transport */}
          <Section title="🔐 Chiffrement des données">
            <ul className="space-y-3 text-slate-700">
              <Check>
                <strong>HTTPS/TLS sur toutes les communications</strong> — aucune donnée
                ne transite en clair entre votre navigateur et nos serveurs.
              </Check>
              <Check>
                <strong>HSTS activé</strong> (Strict-Transport-Security, max-age 1 an) —
                votre navigateur refuse automatiquement toute connexion non chiffrée.
              </Check>
              <Check>
                <strong>Headers de sécurité HTTP</strong> — protection contre le
                clickjacking (X-Frame-Options: DENY), le sniffing de contenu
                (X-Content-Type-Options), le XSS (X-XSS-Protection) et une politique
                de sécurité du contenu stricte (Content-Security-Policy) limitant
                les sources autorisées pour les scripts, styles et appels réseau.
              </Check>
              <Check>
                <strong>Chiffrement de la base de données en transit</strong> — connexion
                chiffrée TLS entre l&apos;application et PostgreSQL.
              </Check>
            </ul>
          </Section>

          {/* Traçabilité */}
          <Section title="📋 Traçabilité & audit trail">
            <ul className="space-y-3 text-slate-700">
              <Check>
                <strong>Audit Trail complet et exportable</strong> — chaque action sensible
                (création, modification, suppression, signature, export) est horodatée,
                associée à l&apos;utilisateur et à son adresse IP.
              </Check>
              <Check>
                <strong>Signature électronique horodatée</strong> — les passeports formation
                enregistrent la date, l&apos;heure, l&apos;IP et l&apos;image de signature
                de chaque signataire. Valeur probante en cas de contrôle ou de litige.
              </Check>
              <Check>
                <strong>Export Excel de l&apos;audit trail</strong> — disponible à tout moment
                depuis le tableau de bord pour vos obligations de conformité.
              </Check>
              <Check>
                <strong>Notifications internes</strong> — chaque action critique génère
                une notification dans l&apos;interface pour votre équipe RH.
              </Check>
            </ul>
          </Section>

          {/* Sauvegardes */}
          <Section title="💾 Sauvegardes & continuité de service">
            <ul className="space-y-3 text-slate-700">
              <Check>
                <strong>Sauvegardes automatiques quotidiennes</strong> de la base de données
                PostgreSQL — gérées par Railway avec rétention intégrée.
              </Check>
              <Check>
                <strong>Volume persistant dédié</strong> — vos fichiers (photos, justificatifs)
                sont stockés sur un volume persistant indépendant du déploiement applicatif.
              </Check>
              <Check>
                <strong>Export total de vos données à tout moment</strong> — format Excel ou PDF,
                sans dépendance propriétaire. Vous pouvez quitter CertPilot avec toutes
                vos données en moins de 5 minutes.
              </Check>
              <Check>
                <strong>Zéro interruption lors des mises à jour</strong> — déploiement continu
                sans coupure de service.
              </Check>
            </ul>
          </Section>

          {/* RGPD */}
          <Section title="🇪🇺 Conformité RGPD">
            <ul className="space-y-3 text-slate-700">
              <Check>
                <strong>Accord de traitement des données (DPA)</strong> disponible et
                signable — CertPilot agit en tant que sous-traitant au sens de l&apos;article 28
                du RGPD.
              </Check>
              <Check>
                <strong>Droit à l&apos;effacement et à la portabilité en libre-service</strong> —
                suppression anonymisée du compte et export JSON de toutes les données
                personnelles accessibles directement depuis le profil utilisateur (Art. 17 et 20 RGPD),
                sans intervention technique requise.
              </Check>
              <Check>
                <strong>Données en Union Européenne</strong> — aucun sous-traitant
                situé hors UE pour le traitement ou le stockage des données personnelles.
              </Check>
              <Check>
                <strong>Minimisation des données</strong> — seules les données nécessaires
                à la gestion des habilitations sont collectées.
              </Check>
            </ul>
          </Section>

          {/* Contact */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
            <h2 className="mb-2 font-bold text-emerald-800">
              Questionnaire sécurité ou revue de conformité
            </h2>
            <p className="text-sm text-emerald-700">
              Votre DSI souhaite approfondir un point ? Nous répondons aux questionnaires
              de sécurité fournisseur et pouvons fournir une annexe technique détaillée
              sur demande.
            </p>
            <a
              href="mailto:contact@certpilot.eu"
              className="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Contacter notre équipe →
            </a>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Documents liés :{" "}
            <Link href="/legal/dpa" className="text-emerald-600 hover:underline">
              Accord de traitement des données (DPA)
            </Link>
            {" · "}
            <Link href="/legal/confidentialite" className="text-emerald-600 hover:underline">
              Politique de confidentialité
            </Link>
          </div>
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
