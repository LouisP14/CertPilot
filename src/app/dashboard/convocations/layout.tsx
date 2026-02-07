import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Convocations",
  robots: { index: false, follow: false },
};

export default function ConvocationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
