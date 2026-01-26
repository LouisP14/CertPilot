import { prisma } from "./prisma";

// Créer les tables SQLite directement avec du SQL brut
export async function createTablesIfNotExist() {
  const createTablesSql = `
    -- Company
    CREATE TABLE IF NOT EXISTS "Company" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "name" TEXT NOT NULL,
      "logo" TEXT,
      "alertThresholds" TEXT DEFAULT '90,60,30,7',
      "adminEmail" TEXT,
      "signatureEnabled" BOOLEAN DEFAULT false,
      "signatureImage" TEXT,
      "signatureResponsable" TEXT,
      "signatureTitre" TEXT,
      "subscriptionStatus" TEXT DEFAULT 'TRIAL',
      "employeeLimit" INTEGER DEFAULT 50,
      "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- PlanningConstraints
    CREATE TABLE IF NOT EXISTS "PlanningConstraints" (
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
      "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE
    );

    -- User
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "password" TEXT NOT NULL,
      "name" TEXT,
      "role" TEXT DEFAULT 'VIEWER',
      "companyId" TEXT,
      "mustChangePassword" BOOLEAN DEFAULT false,
      "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL
    );

    -- Employee
    CREATE TABLE IF NOT EXISTS "Employee" (
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
      "isActive" BOOLEAN DEFAULT true,
      "qrToken" TEXT UNIQUE,
      "managerId" TEXT,
      "managerEmail" TEXT,
      "medicalCheckupDate" DATETIME,
      "hourlyCost" REAL,
      "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("managerId") REFERENCES "Employee"("id") ON DELETE SET NULL
    );

    -- FormationType
    CREATE TABLE IF NOT EXISTS "FormationType" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "name" TEXT NOT NULL,
      "category" TEXT,
      "service" TEXT,
      "defaultValidityMonths" INTEGER,
      "durationHours" INTEGER NOT NULL DEFAULT 7,
      "durationDays" INTEGER,
      "minParticipants" INTEGER DEFAULT 1,
      "maxParticipants" INTEGER DEFAULT 12,
      "isLegalObligation" BOOLEAN DEFAULT false,
      "estimatedCostPerPerson" REAL,
      "estimatedCostPerSession" REAL,
      "prerequisites" TEXT,
      "targetAudience" TEXT,
      "isActive" BOOLEAN DEFAULT true,
      "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Certificate
    CREATE TABLE IF NOT EXISTS "Certificate" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "employeeId" TEXT NOT NULL,
      "formationTypeId" TEXT NOT NULL,
      "obtainedDate" DATETIME NOT NULL,
      "expiryDate" DATETIME,
      "organism" TEXT,
      "details" TEXT,
      "attachmentUrl" TEXT,
      "isArchived" BOOLEAN DEFAULT false,
      "archivedAt" DATETIME,
      "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE,
      FOREIGN KEY ("formationTypeId") REFERENCES "FormationType"("id")
    );

    -- TrainingCenter
    CREATE TABLE IF NOT EXISTS "TrainingCenter" (
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
      "isPartner" BOOLEAN DEFAULT false,
      "discountPercent" REAL,
      "paymentTerms" TEXT,
      "notes" TEXT,
      "maxCapacity" INTEGER,
      "hasOwnPremises" BOOLEAN DEFAULT true,
      "canTravel" BOOLEAN DEFAULT false,
      "travelCostPerKm" REAL,
      "rating" REAL,
      "totalSessions" INTEGER DEFAULT 0,
      "isActive" BOOLEAN DEFAULT true,
      "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- AlertLog
    CREATE TABLE IF NOT EXISTS "AlertLog" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "certificateId" TEXT NOT NULL,
      "alertType" TEXT NOT NULL,
      "recipients" TEXT NOT NULL,
      "sentAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("certificateId") REFERENCES "Certificate"("id") ON DELETE CASCADE
    );

    -- Notification
    CREATE TABLE IF NOT EXISTS "Notification" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "type" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "message" TEXT NOT NULL,
      "isRead" BOOLEAN DEFAULT false,
      "link" TEXT,
      "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ReferenceData
    CREATE TABLE IF NOT EXISTS "ReferenceData" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "type" TEXT NOT NULL,
      "value" TEXT NOT NULL,
      "isActive" BOOLEAN DEFAULT true,
      "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- AuditLog
    CREATE TABLE IF NOT EXISTS "AuditLog" (
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
      "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Exécuter chaque CREATE TABLE séparément
  const statements = createTablesSql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.startsWith("CREATE"));

  for (const statement of statements) {
    try {
      await prisma.$executeRawUnsafe(statement);
    } catch (e) {
      // Table existe peut-être déjà
      console.log("Table creation:", e);
    }
  }

  console.log("✅ Tables créées ou déjà existantes");
}
