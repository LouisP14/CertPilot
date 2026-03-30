import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Checklist conformite habilitations 2026 - PDF gratuit | CertPilot",
  description:
    "Telechargez gratuitement la checklist conformite habilitations 2026 : 23 points de controle CACES, SST, habilitations electriques, ATEX, travail en hauteur.",
  keywords: [
    "checklist habilitations",
    "conformite formations obligatoires",
    "checklist CACES SST",
    "verification habilitations entreprise",
    "audit habilitations PDF",
  ],
  alternates: {
    canonical: "/checklist",
  },
  openGraph: {
    title: "Checklist conformite habilitations 2026 - PDF gratuit",
    description:
      "23 points de controle pour verifier la conformite de vos habilitations CACES, SST et electriques.",
    url: "/checklist",
  },
};

export default function ChecklistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
