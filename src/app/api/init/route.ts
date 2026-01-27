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
    const rows = await prisma.$queryRawUnsafe(`PRAGMA table_info("${table}")`);
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
    {
      name: "mustChangePassword",
      type: "BOOLEAN",
      notNull: true,
      defaultValue: 0,
    },
  ]);

  await ensureColumns("Company", [
    {
      name: "signatureEnabled",
      type: "BOOLEAN",
      notNull: true,
      defaultValue: 0,
    },
    { name: "signatureImage", type: "TEXT" },
    { name: "signatureResponsable", type: "TEXT" },
    { name: "signatureTitre", type: "TEXT" },
    { name: "trialEndsAt", type: "DATETIME" },
    {
      name: "subscriptionStatus",
      type: "TEXT",
      notNull: true,
      defaultValue: "TRIAL",
    },
    { name: "subscriptionPlan", type: "TEXT" },
    { name: "employeeLimit", type: "INTEGER", notNull: true, defaultValue: 50 },
    { name: "stripeCustomerId", type: "TEXT" },
    { name: "stripeSubscriptionId", type: "TEXT" },
  ]);

  await ensureColumns("Employee", [
    { name: "site", type: "TEXT" },
    { name: "team", type: "TEXT" },
    { name: "hourlyCost", type: "REAL" },
    { name: "contractType", type: "TEXT" },
    {
      name: "workingHoursPerDay",
      type: "REAL",
      notNull: true,
      defaultValue: 7,
    },
  ]);

  await ensureColumns("FormationType", [
    { name: "service", type: "TEXT" },
    { name: "durationHours", type: "REAL", notNull: true, defaultValue: 7 },
    { name: "durationDays", type: "INTEGER", notNull: true, defaultValue: 1 },
    {
      name: "minParticipants",
      type: "INTEGER",
      notNull: true,
      defaultValue: 1,
    },
    {
      name: "maxParticipants",
      type: "INTEGER",
      notNull: true,
      defaultValue: 12,
    },
    {
      name: "trainingMode",
      type: "TEXT",
      notNull: true,
      defaultValue: "PRESENTIEL",
    },
    {
      name: "isLegalObligation",
      type: "BOOLEAN",
      notNull: true,
      defaultValue: 0,
    },
    {
      name: "renewalPriority",
      type: "INTEGER",
      notNull: true,
      defaultValue: 5,
    },
    { name: "estimatedCostPerPerson", type: "REAL" },
    { name: "estimatedCostPerSession", type: "REAL" },
  ]);

  await ensureColumns("TrainingSession", [
    { name: "convocationsSentAt", type: "DATETIME" },
  ]);

  await runSqlStatements(`
CREATE TABLE IF NOT EXISTS "ContactRequest" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "companyName" TEXT NOT NULL,
  "contactName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "employeeCount" TEXT,
  "message" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT,
  "userName" TEXT,
  "userEmail" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "entityName" TEXT,
  "description" TEXT NOT NULL,
  "oldValues" TEXT,
  "newValues" TEXT,
  "metadata" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Convocation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "formationId" TEXT NOT NULL,
  "formationName" TEXT NOT NULL,
  "startDate" TEXT NOT NULL,
  "endDate" TEXT NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "ConvocationAttendee" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "convocationId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "employeeName" TEXT NOT NULL,
  "employeeEmail" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ConvocationAttendee_convocationId_fkey" FOREIGN KEY ("convocationId") REFERENCES "Convocation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ReferenceData" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "type" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS "AuditLog_entityType_entityId_idx" ON "AuditLog" ("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog" ("userId");
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog" ("action");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog" ("createdAt");
CREATE INDEX IF NOT EXISTS "Convocation_formationId_idx" ON "Convocation" ("formationId");
CREATE INDEX IF NOT EXISTS "Convocation_status_idx" ON "Convocation" ("status");
CREATE INDEX IF NOT EXISTS "Convocation_createdAt_idx" ON "Convocation" ("createdAt");
CREATE INDEX IF NOT EXISTS "ConvocationAttendee_convocationId_idx" ON "ConvocationAttendee" ("convocationId");
CREATE INDEX IF NOT EXISTS "ConvocationAttendee_employeeId_idx" ON "ConvocationAttendee" ("employeeId");
CREATE UNIQUE INDEX IF NOT EXISTS "ReferenceData_type_value_key" ON "ReferenceData" ("type", "value");
CREATE INDEX IF NOT EXISTS "ReferenceData_type_isActive_idx" ON "ReferenceData" ("type", "isActive");
`);
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
        mustChangePassword: false, // Compte démo, pas de changement requis
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
