import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";

async function runSqlStatements(sql: string) {
  const cleaned = sql
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((line) => line.replace(/--.*$/g, "").trim())
    .join("\n");

  const statements = cleaned
    .split(";")
    .map((stmt) => stmt.trim())
    .filter((stmt) => stmt.length > 0);

  for (const statement of statements) {
    try {
      await prisma.$executeRawUnsafe(`${statement};`);
    } catch (error) {
      const message = String(error);
      if (!message.includes("already exists")) {
        throw error;
      }
    }
  }
}

async function ensureSchema() {
  const existing = await prisma.$queryRawUnsafe(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='User'",
  );

  if (Array.isArray(existing) && existing.length > 0) {
    return;
  }

  const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
  const entries = await fs.readdir(migrationsDir, { withFileTypes: true });
  const migrationFolders = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const folder of migrationFolders) {
    const sqlPath = path.join(migrationsDir, folder, "migration.sql");
    const sql = await fs.readFile(sqlPath, "utf8");
    await runSqlStatements(sql);
  }
}

// Cette route crée l'utilisateur demo si nécessaire
export async function GET() {
  try {
    await ensureSchema();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: "demo@certpilot.fr" },
    });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        status: "already_exists",
        message: "Utilisateur demo déjà créé",
        credentials: {
          email: "demo@certpilot.fr",
          password: "demo123",
        },
      });
    }

    // Créer l'entreprise
    const company = await prisma.company.create({
      data: {
        id: "demo-company",
        name: "Mon Entreprise (Démo)",
        alertThresholds: "90,60,30,7",
        subscriptionStatus: "ACTIVE",
        employeeLimit: 100,
      },
    });

    // Créer l'utilisateur admin
    const hashedPassword = await bcrypt.hash("demo123", 10);
    await prisma.user.create({
      data: {
        email: "demo@certpilot.fr",
        password: hashedPassword,
        name: "Admin Démo",
        role: "ADMIN",
        companyId: company.id,
      },
    });

    console.log("✅ Utilisateur demo créé !");

    return NextResponse.json({
      success: true,
      status: "created",
      message: "Utilisateur demo créé avec succès",
      credentials: {
        email: "demo@certpilot.fr",
        password: "demo123",
      },
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
