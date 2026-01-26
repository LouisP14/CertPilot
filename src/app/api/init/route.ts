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

  if (!Array.isArray(existing) || existing.length === 0) {
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

  const getColumns = async (table: string) => {
    const rows = await prisma.$queryRawUnsafe(
      `PRAGMA table_info("${table}")`,
    );
    const columns = new Set<string>();
    if (Array.isArray(rows)) {
      for (const row of rows) {
        if (row?.name) {
          columns.add(String(row.name));
        }
      }
    }
    return columns;
  };

  const ensureColumns = async (
    table: string,
    definitions: Array<{
      name: string;
      type: string;
      notNull?: boolean;
      defaultValue?: string | number;
    }>,
  ) => {
    const existingColumns = await getColumns(table);
    for (const column of definitions) {
      if (existingColumns.has(column.name)) {
        continue;
      }

      const parts = [
        `ALTER TABLE "${table}" ADD COLUMN "${column.name}" ${column.type}`,
      ];

      if (column.notNull) {
        parts.push("NOT NULL");
      }

      if (column.defaultValue !== undefined) {
        if (typeof column.defaultValue === "number") {
          parts.push(`DEFAULT ${column.defaultValue}`);
        } else {
          parts.push(`DEFAULT '${column.defaultValue}'`);
        }
      }

      await prisma.$executeRawUnsafe(`${parts.join(" ")};`);
    }
  };

  await ensureColumns("User", [
    { name: "companyId", type: "TEXT" },
    { name: "mustChangePassword", type: "BOOLEAN", notNull: true, defaultValue: 0 },
  ]);

  await ensureColumns("Company", [
    { name: "signatureEnabled", type: "BOOLEAN", notNull: true, defaultValue: 0 },
    { name: "signatureImage", type: "TEXT" },
    { name: "signatureResponsable", type: "TEXT" },
    { name: "signatureTitre", type: "TEXT" },
    { name: "trialEndsAt", type: "DATETIME" },
    { name: "subscriptionStatus", type: "TEXT", notNull: true, defaultValue: "TRIAL" },
    { name: "subscriptionPlan", type: "TEXT" },
    { name: "employeeLimit", type: "INTEGER", notNull: true, defaultValue: 50 },
    { name: "stripeCustomerId", type: "TEXT" },
    { name: "stripeSubscriptionId", type: "TEXT" },
  ]);
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
