import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Crée le schéma de la base de données PostgreSQL
 * À exécuter UNE FOIS avant /api/seed
 */
export async function GET() {
  try {
    console.log("🔧 Création du schéma PostgreSQL...");

    // Exécuter prisma db push
    const { stdout, stderr } = await execAsync("npx prisma db push --accept-data-loss");
    
    console.log("✅ Schéma créé !");
    console.log(stdout);
    
    if (stderr) {
      console.warn("Warnings:", stderr);
    }

    return NextResponse.json({
      success: true,
      message: "Schéma créé avec succès ! Allez maintenant sur /api/seed",
      output: stdout,
    });
  } catch (error: any) {
    console.error("❌ Erreur création schéma:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stdout: error.stdout,
        stderr: error.stderr,
      },
      { status: 500 },
    );
  }
}
