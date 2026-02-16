import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demander une démo gratuite | CertPilot - Logiciel gestion formations",
  description:
    "Demandez une démonstration gratuite de CertPilot : logiciel SaaS de gestion des formations, habilitations CACES, SST, habilitations électriques. Réponse sous 24h. À partir de 199€/mois.",
  keywords: [
    "démo logiciel formation",
    "gestion habilitations devis",
    "logiciel CACES",
    "logiciel SST",
    "logiciel habilitation électrique",
    "CertPilot contact",
  ],
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Démo gratuite CertPilot - Gestion des formations et habilitations",
    description:
      "Découvrez comment CertPilot automatise le suivi de vos habilitations et formations. Demandez votre démo personnalisée.",
    url: "/contact",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
