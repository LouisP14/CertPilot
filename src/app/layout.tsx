import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.certpilot.eu";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CertPilot - Gestion des Formations et Habilitations",
    template: "%s | CertPilot",
  },
  description:
    "CertPilot : la plateforme SaaS pour gérer les habilitations, formations et certifications de vos équipes. Alertes automatiques, convocations, signatures électroniques et suivi de conformité.",
  keywords: [
    "gestion formations",
    "habilitations",
    "certifications",
    "suivi formations entreprise",
    "conformité",
    "passeport formation",
    "convocations formation",
    "signature électronique",
    "logiciel formation",
    "gestion compétences",
    "CACES",
    "SST",
    "habilitation électrique",
    "CertPilot",
  ],
  authors: [{ name: "CertPilot", url: SITE_URL }],
  creator: "CertPilot",
  publisher: "CertPilot",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "CertPilot",
    title: "CertPilot - Gestion des Formations et Habilitations",
    description:
      "Plateforme SaaS pour gérer les habilitations, formations et certifications de vos équipes. Alertes automatiques, convocations et signatures électroniques.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "CertPilot - Gestion des formations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CertPilot - Gestion des Formations et Habilitations",
    description:
      "Plateforme SaaS pour gérer les habilitations, formations et certifications de vos équipes.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#173B56",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
