-- CreateTable
CREATE TABLE "PlanningConstraints" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "monthlyBudget" REAL,
    "quarterlyBudget" REAL,
    "yearlyBudget" REAL,
    "alertThresholdDays" TEXT NOT NULL DEFAULT '90,60,30',
    "maxAbsentPerTeam" INTEGER NOT NULL DEFAULT 2,
    "maxAbsentPerSite" INTEGER NOT NULL DEFAULT 5,
    "maxAbsentPercent" REAL NOT NULL DEFAULT 20,
    "blacklistedDates" TEXT NOT NULL DEFAULT '[]',
    "allowedTrainingDays" INTEGER NOT NULL DEFAULT 31,
    "preferGroupSessions" BOOLEAN NOT NULL DEFAULT true,
    "preferIntraCompany" BOOLEAN NOT NULL DEFAULT true,
    "minDaysBeforeExpiry" INTEGER NOT NULL DEFAULT 30,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlanningConstraints_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "employeeId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PassportSignature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "employeeToken" TEXT NOT NULL,
    "employeeTokenExpiry" DATETIME,
    "employeeSignedAt" DATETIME,
    "employeeSignatureImg" TEXT,
    "employeeSignatureIP" TEXT,
    "employeeSignatureName" TEXT,
    "managerToken" TEXT NOT NULL,
    "managerTokenExpiry" DATETIME,
    "managerSignedAt" DATETIME,
    "managerSignatureImg" TEXT,
    "managerSignatureIP" TEXT,
    "managerSignatureName" TEXT,
    "managerSignatureTitle" TEXT,
    "siteManagerEmail" TEXT,
    "siteManagerName" TEXT,
    "initiatedBy" TEXT,
    "initiatedAt" DATETIME,
    "completedAt" DATETIME,
    "rejectedAt" DATETIME,
    "rejectionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PassportSignature_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrainingCenter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "address" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'France',
    "latitude" REAL,
    "longitude" REAL,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "website" TEXT,
    "isPartner" BOOLEAN NOT NULL DEFAULT false,
    "discountPercent" REAL,
    "paymentTerms" TEXT,
    "notes" TEXT,
    "maxCapacity" INTEGER,
    "hasOwnPremises" BOOLEAN NOT NULL DEFAULT true,
    "canTravel" BOOLEAN NOT NULL DEFAULT false,
    "travelCostPerKm" REAL,
    "rating" REAL,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TrainingCenterOffering" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trainingCenterId" TEXT NOT NULL,
    "formationTypeId" TEXT NOT NULL,
    "pricePerPerson" REAL NOT NULL,
    "pricePerSession" REAL,
    "minParticipants" INTEGER NOT NULL DEFAULT 1,
    "maxParticipants" INTEGER NOT NULL DEFAULT 12,
    "durationHours" REAL,
    "durationDays" INTEGER,
    "availableModes" TEXT NOT NULL DEFAULT 'PRESENTIEL',
    "certificationCode" TEXT,
    "isOPCOEligible" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TrainingCenterOffering_trainingCenterId_fkey" FOREIGN KEY ("trainingCenterId") REFERENCES "TrainingCenter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TrainingCenterOffering_formationTypeId_fkey" FOREIGN KEY ("formationTypeId") REFERENCES "FormationType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrainingCenterAvailability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trainingCenterId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "startTime" TEXT NOT NULL DEFAULT '09:00',
    "endTime" TEXT NOT NULL DEFAULT '17:00',
    "spotsAvailable" INTEGER NOT NULL DEFAULT 12,
    "formationTypeId" TEXT,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "sessionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TrainingCenterAvailability_trainingCenterId_fkey" FOREIGN KEY ("trainingCenterId") REFERENCES "TrainingCenter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmployeeAbsence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmployeeAbsence_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrainingNeed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "formationTypeId" TEXT NOT NULL,
    "certificateId" TEXT,
    "expiryDate" DATETIME,
    "daysUntilExpiry" INTEGER,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "priorityReason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "plannedSessionId" TEXT,
    "estimatedCost" REAL,
    "absenceCost" REAL,
    "totalCost" REAL,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TrainingNeed_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TrainingNeed_formationTypeId_fkey" FOREIGN KEY ("formationTypeId") REFERENCES "FormationType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrainingSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "formationTypeId" TEXT NOT NULL,
    "trainingCenterId" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "startTime" TEXT NOT NULL DEFAULT '09:00',
    "endTime" TEXT NOT NULL DEFAULT '17:00',
    "location" TEXT,
    "isIntraCompany" BOOLEAN NOT NULL DEFAULT false,
    "trainingMode" TEXT NOT NULL DEFAULT 'PRESENTIEL',
    "minParticipants" INTEGER NOT NULL DEFAULT 1,
    "maxParticipants" INTEGER NOT NULL DEFAULT 12,
    "trainingCost" REAL,
    "costPerPerson" REAL,
    "totalAbsenceCost" REAL,
    "totalCost" REAL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "scenarioId" TEXT,
    "scenarioRank" INTEGER,
    "savingsVsAlternative" REAL,
    "notes" TEXT,
    "cancellationReason" TEXT,
    "confirmedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TrainingSession_formationTypeId_fkey" FOREIGN KEY ("formationTypeId") REFERENCES "FormationType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrainingSession_trainingCenterId_fkey" FOREIGN KEY ("trainingCenterId") REFERENCES "TrainingCenter" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrainingSessionAttendee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'INVITED',
    "absenceCost" REAL,
    "travelCost" REAL,
    "passed" BOOLEAN,
    "certificateId" TEXT,
    "confirmedAt" DATETIME,
    "attendedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TrainingSessionAttendee_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrainingSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TrainingSessionAttendee_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlanningScenario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "site" TEXT,
    "department" TEXT,
    "totalTrainingCost" REAL,
    "totalAbsenceCost" REAL,
    "totalCost" REAL,
    "savingsVsBaseline" REAL,
    "coveragePercent" REAL,
    "riskScore" REAL,
    "sessionsData" TEXT,
    "constraintsData" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" DATETIME,
    "approvedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "alertThresholds" TEXT NOT NULL DEFAULT '90,60,30,7',
    "adminEmail" TEXT,
    "signatureEnabled" BOOLEAN NOT NULL DEFAULT false,
    "signatureImage" TEXT,
    "signatureResponsable" TEXT,
    "signatureTitre" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Company" ("adminEmail", "alertThresholds", "createdAt", "id", "logo", "name", "updatedAt") SELECT "adminEmail", "alertThresholds", "createdAt", "id", "logo", "name", "updatedAt" FROM "Company";
DROP TABLE "Company";
ALTER TABLE "new_Company" RENAME TO "Company";
CREATE TABLE "new_Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "photo" TEXT,
    "employeeId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "site" TEXT,
    "team" TEXT,
    "managerId" TEXT,
    "managerEmail" TEXT,
    "medicalCheckupDate" DATETIME,
    "qrToken" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hourlyCost" REAL,
    "contractType" TEXT,
    "workingHoursPerDay" REAL NOT NULL DEFAULT 7,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Employee_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Employee" ("createdAt", "department", "email", "employeeId", "firstName", "id", "isActive", "lastName", "managerEmail", "managerId", "medicalCheckupDate", "photo", "position", "qrToken", "updatedAt") SELECT "createdAt", "department", "email", "employeeId", "firstName", "id", "isActive", "lastName", "managerEmail", "managerId", "medicalCheckupDate", "photo", "position", "qrToken", "updatedAt" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_employeeId_key" ON "Employee"("employeeId");
CREATE UNIQUE INDEX "Employee_qrToken_key" ON "Employee"("qrToken");
CREATE TABLE "new_FormationType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "service" TEXT,
    "defaultValidityMonths" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "durationHours" REAL NOT NULL DEFAULT 7,
    "durationDays" INTEGER NOT NULL DEFAULT 1,
    "minParticipants" INTEGER NOT NULL DEFAULT 1,
    "maxParticipants" INTEGER NOT NULL DEFAULT 12,
    "trainingMode" TEXT NOT NULL DEFAULT 'PRESENTIEL',
    "isLegalObligation" BOOLEAN NOT NULL DEFAULT false,
    "renewalPriority" INTEGER NOT NULL DEFAULT 5,
    "estimatedCostPerPerson" REAL,
    "estimatedCostPerSession" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_FormationType" ("category", "createdAt", "defaultValidityMonths", "id", "isActive", "name", "updatedAt") SELECT "category", "createdAt", "defaultValidityMonths", "id", "isActive", "name", "updatedAt" FROM "FormationType";
DROP TABLE "FormationType";
ALTER TABLE "new_FormationType" RENAME TO "FormationType";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PlanningConstraints_companyId_key" ON "PlanningConstraints"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "PassportSignature_employeeId_key" ON "PassportSignature"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "PassportSignature_employeeToken_key" ON "PassportSignature"("employeeToken");

-- CreateIndex
CREATE UNIQUE INDEX "PassportSignature_managerToken_key" ON "PassportSignature"("managerToken");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingCenter_code_key" ON "TrainingCenter"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingCenterOffering_trainingCenterId_formationTypeId_key" ON "TrainingCenterOffering"("trainingCenterId", "formationTypeId");

-- CreateIndex
CREATE INDEX "TrainingCenterAvailability_trainingCenterId_date_idx" ON "TrainingCenterAvailability"("trainingCenterId", "date");

-- CreateIndex
CREATE INDEX "EmployeeAbsence_employeeId_startDate_endDate_idx" ON "EmployeeAbsence"("employeeId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "TrainingNeed_status_priority_idx" ON "TrainingNeed"("status", "priority");

-- CreateIndex
CREATE INDEX "TrainingNeed_expiryDate_idx" ON "TrainingNeed"("expiryDate");

-- CreateIndex
CREATE INDEX "TrainingSession_status_startDate_idx" ON "TrainingSession"("status", "startDate");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingSessionAttendee_sessionId_employeeId_key" ON "TrainingSessionAttendee"("sessionId", "employeeId");
