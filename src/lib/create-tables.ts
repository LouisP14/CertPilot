import Database from "better-sqlite3";
import * as fs from "fs";
import * as path from "path";

// Créer les tables SQLite directement avec better-sqlite3
export async function createTablesIfNotExist() {
  // Déterminer le chemin de la base de données
  const dbPath = process.env.VERCEL
    ? "/tmp/dev.db"
    : path.join(process.cwd(), "prisma", "dev.db");

  console.log("📂 DB Path:", dbPath);

  // S'assurer que le répertoire existe
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Ouvrir/créer la base de données
  const db = new Database(dbPath);

  const statements = [
    // Company
    `CREATE TABLE IF NOT EXISTS "Company" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "name" TEXT NOT NULL,
      "logo" TEXT,
      "alertThresholds" TEXT DEFAULT '90,60,30,7',
      "adminEmail" TEXT,
      "signatureEnabled" INTEGER DEFAULT 0,
      "signatureImage" TEXT,
      "signatureResponsable" TEXT,
      "signatureTitre" TEXT,
      "subscriptionStatus" TEXT DEFAULT 'TRIAL',
      "employeeLimit" INTEGER DEFAULT 50,
      "createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    // PlanningConstraints
    `CREATE TABLE IF NOT EXISTS "PlanningConstraints" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "companyId" TEXT NOT NULL UNIQUE,
      "yearlyBudget" REAL,
      "quarterlyBudget" REAL,
      "monthlyBudget" REAL,
      "maxAbsentPerTeam" INTEGER DEFAULT 2,
      "maxAbsentPerSite" INTEGER DEFAULT 5,
      "maxAbsentPerDepartment" INTEGER DEFAULT 3,
      "maxAbsentCompanyWide" INTEGER,
      "preferredTrainingDays" TEXT DEFAULT 'TUESDAY,WEDNESDAY,THURSDAY',
      "blackoutPeriods" TEXT,
      "advanceNoticeDays" INTEGER DEFAULT 14,
      "createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE
    )`,

    // User
    `CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "password" TEXT NOT NULL,
      "name" TEXT,
      "role" TEXT DEFAULT 'VIEWER',
      "companyId" TEXT,
      "mustChangePassword" INTEGER DEFAULT 0,
      "createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL
    )`,

    // Employee
    `CREATE TABLE IF NOT EXISTS "Employee" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "employeeId" TEXT NOT NULL UNIQUE,
      "firstName" TEXT NOT NULL,
      "lastName" TEXT NOT NULL,
      "email" TEXT,
      "photo" TEXT,
      "position" TEXT NOT NULL,
      "department" TEXT NOT NULL,
      "site" TEXT,
      "team" TEXT,
      "isActive" INTEGER DEFAULT 1,
      "qrToken" TEXT UNIQUE,
      "managerId" TEXT,
      "managerEmail" TEXT,
      "medicalCheckupDate" TEXT,
      "hourlyCost" REAL,
      "createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("managerId") REFERENCES "Employee"("id") ON DELETE SET NULL
    )`,

    // FormationType
    `CREATE TABLE IF NOT EXISTS "FormationType" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "name" TEXT NOT NULL,
      "category" TEXT,
      "service" TEXT,
      "defaultValidityMonths" INTEGER,
      "durationHours" INTEGER NOT NULL DEFAULT 7,
      "durationDays" INTEGER,
      "minParticipants" INTEGER DEFAULT 1,
      "maxParticipants" INTEGER DEFAULT 12,
      "isLegalObligation" INTEGER DEFAULT 0,
      "estimatedCostPerPerson" REAL,
      "estimatedCostPerSession" REAL,
      "prerequisites" TEXT,
      "targetAudience" TEXT,
      "isActive" INTEGER DEFAULT 1,
      "createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    // Certificate
    `CREATE TABLE IF NOT EXISTS "Certificate" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "employeeId" TEXT NOT NULL,
      "formationTypeId" TEXT NOT NULL,
      "obtainedDate" TEXT NOT NULL,
      "expiryDate" TEXT,
      "organism" TEXT,
      "details" TEXT,
      "attachmentUrl" TEXT,
      "isArchived" INTEGER DEFAULT 0,
      "archivedAt" TEXT,
      "createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE,
      FOREIGN KEY ("formationTypeId") REFERENCES "FormationType"("id")
    )`,

    // TrainingCenter
    `CREATE TABLE IF NOT EXISTS "TrainingCenter" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "name" TEXT NOT NULL,
      "code" TEXT UNIQUE,
      "address" TEXT,
      "city" TEXT,
      "postalCode" TEXT,
      "country" TEXT DEFAULT 'France',
      "latitude" REAL,
      "longitude" REAL,
      "contactName" TEXT,
      "contactEmail" TEXT,
      "contactPhone" TEXT,
      "website" TEXT,
      "isPartner" INTEGER DEFAULT 0,
      "discountPercent" REAL,
      "paymentTerms" TEXT,
      "notes" TEXT,
      "maxCapacity" INTEGER,
      "hasOwnPremises" INTEGER DEFAULT 1,
      "canTravel" INTEGER DEFAULT 0,
      "travelCostPerKm" REAL,
      "rating" REAL,
      "totalSessions" INTEGER DEFAULT 0,
      "isActive" INTEGER DEFAULT 1,
      "createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    // AlertLog
    `CREATE TABLE IF NOT EXISTS "AlertLog" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "certificateId" TEXT NOT NULL,
      "alertType" TEXT NOT NULL,
      "recipients" TEXT NOT NULL,
      "sentAt" TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("certificateId") REFERENCES "Certificate"("id") ON DELETE CASCADE
    )`,

    // Notification
    `CREATE TABLE IF NOT EXISTS "Notification" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "type" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "message" TEXT NOT NULL,
      "isRead" INTEGER DEFAULT 0,
      "link" TEXT,
      "createdAt" TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    // ReferenceData
    `CREATE TABLE IF NOT EXISTS "ReferenceData" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "type" TEXT NOT NULL,
      "value" TEXT NOT NULL,
      "isActive" INTEGER DEFAULT 1,
      "createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    // AuditLog
    `CREATE TABLE IF NOT EXISTS "AuditLog" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "userId" TEXT,
      "userName" TEXT,
      "userEmail" TEXT,
      "action" TEXT NOT NULL,
      "entityType" TEXT NOT NULL,
      "entityId" TEXT,
      "entityName" TEXT,
      "description" TEXT,
      "oldValues" TEXT,
      "newValues" TEXT,
      "ipAddress" TEXT,
      "userAgent" TEXT,
      "metadata" TEXT,
      "createdAt" TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
  ];

  for (const statement of statements) {
    try {
      db.exec(statement);
    } catch (e) {
      console.error("❌ Erreur création table:", e);
    }
  }

  db.close();
  console.log("✅ Toutes les tables créées dans", dbPath);
}
