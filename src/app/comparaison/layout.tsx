import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CertPilot vs Excel - Comparaison et calculateur ROI",
  description:
    "Comparez CertPilot et Excel pour la gestion des habilitations. Calculateur ROI interactif, tableau comparatif feature par feature. Decouvrez combien vous economisez.",
  keywords: [
    "CertPilot vs Excel",
    "logiciel gestion habilitations",
    "calculateur ROI formation",
    "alternative Excel habilitations",
    "suivi habilitations logiciel",
  ],
  alternates: {
    canonical: "/comparaison",
  },
  openGraph: {
    title: "CertPilot vs Excel - Pourquoi passer a un logiciel dedie ?",
    description:
      "Tableau comparatif et calculateur ROI : decouvrez combien vous economisez en remplacant Excel par CertPilot.",
    url: "/comparaison",
  },
};

export default function ComparaisonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
