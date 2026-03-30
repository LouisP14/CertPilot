import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creer un compte - Essai gratuit 14 jours | CertPilot",
  description:
    "Creez votre compte CertPilot gratuitement. Essai 14 jours sans engagement, toutes les fonctionnalites incluses. Gerez vos habilitations CACES, SST et electriques.",
  alternates: {
    canonical: "/register",
  },
  openGraph: {
    title: "Essai gratuit 14 jours - CertPilot",
    description:
      "Creez votre compte et commencez a gerer vos habilitations en moins d'une journee.",
    url: "/register",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
