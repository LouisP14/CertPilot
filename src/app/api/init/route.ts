import { seedDemoDataIfNeeded } from "@/lib/seed-demo";
import { execSync } from "child_process";
import { NextResponse } from "next/server";

// Cette route initialise la base de données avec des données de démo
// Elle est appelée automatiquement au premier accès sur Vercel
export async function GET() {
  try {
    // Sur Vercel, créer les tables si elles n'existent pas
    if (process.env.VERCEL) {
      try {
        console.log("🔧 Création des tables SQLite...");
        execSync("npx prisma db push --skip-generate", {
          stdio: "inherit",
          env: { ...process.env, DATABASE_URL: "file:/tmp/dev.db" },
        });
        console.log("✅ Tables créées");
      } catch (dbError) {
        console.log("Tables peut-être déjà existantes:", dbError);
      }
    }

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
      { success: true, status: "error", error: String(error) },
      { status: 500 },
    );
  }
}

export async function POST() {
  return GET();
}
