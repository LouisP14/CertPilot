import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Solutions par métier | CertPilot - Gestion formations & habilitations",
  description:
    "Découvrez les solutions CertPilot par type de formation : CACES, SST, habilitations électriques, ATEX, travail en hauteur. Logiciel de suivi adapté à chaque besoin.",
  alternates: {
    canonical: "/solutions",
  },
  openGraph: {
    title: "Solutions CertPilot par type de formation",
    description:
      "CACES, SST, habilitations électriques : CertPilot s'adapte à tous vos besoins de suivi des formations et certifications.",
    url: "/solutions",
  },
};

export default function SolutionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
