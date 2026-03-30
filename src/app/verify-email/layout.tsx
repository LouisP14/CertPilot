import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verification email | CertPilot",
  description: "Confirmez votre adresse email pour activer votre compte CertPilot.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
