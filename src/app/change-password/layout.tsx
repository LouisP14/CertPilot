import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changer le mot de passe",
  description: "Modifiez votre mot de passe CertPilot.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ChangePasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
