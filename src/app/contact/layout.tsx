import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demander une démo - Contact",
  description:
    "Contactez CertPilot pour une démonstration personnalisée de notre plateforme de gestion des formations et habilitations. Réponse sous 24h.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Demander une démo CertPilot",
    description:
      "Contactez-nous pour une démonstration personnalisée. Solution de gestion des formations à partir de 199€/mois.",
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
