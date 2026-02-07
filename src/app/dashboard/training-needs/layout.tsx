import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Besoins de formation",
  robots: { index: false, follow: false },
};

export default function TrainingNeedsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
