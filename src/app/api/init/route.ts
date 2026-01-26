import { seedDemoDataIfNeeded } from "@/lib/seed-demo";
import { NextResponse } from "next/server";

// Cette route initialise la base de données avec des données de démo
// Elle est appelée automatiquement au premier accès sur Vercel
export async function GET() {
  try {
    const result = await seedDemoDataIfNeeded();

    return NextResponse.json({
      success: true,
      ...result,
      credentials:
        result.status === "seeded"
          ? {
              email: "demo@certpilot.fr",
              password: "demo123",
            }
          : undefined,
    });
  } catch (error) {
    console.error("Erreur init:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}

export async function POST() {
  return GET();
}
