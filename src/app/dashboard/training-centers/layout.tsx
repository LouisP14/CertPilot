import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Centres de formation",
  robots: { index: false, follow: false },
};

export default function TrainingCentersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
