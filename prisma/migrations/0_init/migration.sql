-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "companyId" TEXT,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "managedServices" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "totpSecret" TEXT,
    "totpEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadCapture" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "source" TEXT NOT NULL DEFAULT 'checklist',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadCapture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactRequest" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "employeeCount" TEXT,
    "plan" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "alertThresholds" TEXT NOT NULL DEFAULT '90,60,30,7',
    "priorityThresholds" TEXT NOT NULL DEFAULT '7,30,60',
    "adminEmail" TEXT,
    "signatureEnabled" BOOLEAN NOT NULL DEFAULT false,
    "signatureImage" TEXT,
    "signatureResponsable" TEXT,
    "signatureTitre" TEXT,
    "trialEndsAt" TIMESTAMP(3),
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'TRIAL',
    "subscriptionPlan" TEXT,
    "employeeLimit" INTEGER NOT NULL DEFAULT 50,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanningConstraints" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "monthlyBudget" DOUBLE PRECISION,
    "quarterlyBudget" DOUBLE PRECISION,
    "yearlyBudget" DOUBLE PRECISION,
    "alertThresholdDays" TEXT NOT NULL DEFAULT '90,60,30',
    "maxAbsentPerTeam" INTEGER NOT NULL DEFAULT 2,
    "maxAbsentPerSite" INTEGER NOT NULL DEFAULT 5,
    "maxAbsentPercent" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "blacklistedDates" TEXT NOT NULL DEFAULT '[]',
    "allowedTrainingDays" INTEGER NOT NULL DEFAULT 31,
    "preferGroupSessions" BOOLEAN NOT NULL DEFAULT true,
    "preferIntraCompany" BOOLEAN NOT NULL DEFAULT true,
    "minDaysBeforeExpiry" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanningConstraints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
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
    "medicalCheckupDate" TIMESTAMP(3),
    "qrToken" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hourlyCost" DOUBLE PRECISION,
    "contractType" TEXT,
    "workingHoursPerDay" DOUBLE PRECISION NOT NULL DEFAULT 7,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormationType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "service" TEXT,
    "defaultValidityMonths" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "durationHours" DOUBLE PRECISION NOT NULL DEFAULT 7,
    "durationDays" INTEGER NOT NULL DEFAULT 1,
    "minParticipants" INTEGER NOT NULL DEFAULT 1,
    "maxParticipants" INTEGER NOT NULL DEFAULT 12,
    "trainingMode" TEXT NOT NULL DEFAULT 'PRESENTIEL',
    "isLegalObligation" BOOLEAN NOT NULL DEFAULT false,
    "renewalPriority" INTEGER NOT NULL DEFAULT 5,
    "estimatedCostPerPerson" DOUBLE PRECISION,
    "estimatedCostPerSession" DOUBLE PRECISION,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormationType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "formationTypeId" TEXT NOT NULL,
    "obtainedDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "organism" TEXT,
    "details" TEXT,
    "attachmentUrl" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertLog" (
    "id" TEXT NOT NULL,
    "certificateId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "recipients" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "employeeId" TEXT,
    "companyId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PassportSignature" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "employeeToken" TEXT NOT NULL,
    "employeeTokenExpiry" TIMESTAMP(3),
    "employeeSignedAt" TIMESTAMP(3),
    "employeeSignatureImg" TEXT,
    "employeeSignatureIP" TEXT,
    "employeeSignatureName" TEXT,
    "managerToken" TEXT NOT NULL,
    "managerTokenExpiry" TIMESTAMP(3),
    "managerSignedAt" TIMESTAMP(3),
    "managerSignatureImg" TEXT,
    "managerSignatureIP" TEXT,
    "managerSignatureName" TEXT,
    "managerSignatureTitle" TEXT,
    "siteManagerEmail" TEXT,
    "siteManagerName" TEXT,
    "initiatedBy" TEXT,
    "initiatedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PassportSignature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingCenter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "address" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'France',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "website" TEXT,
    "isPartner" BOOLEAN NOT NULL DEFAULT false,
    "discountPercent" DOUBLE PRECISION,
    "paymentTerms" TEXT,
    "notes" TEXT,
    "maxCapacity" INTEGER,
    "hasOwnPremises" BOOLEAN NOT NULL DEFAULT true,
    "canTravel" BOOLEAN NOT NULL DEFAULT false,
    "rating" DOUBLE PRECISION,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingCenterOffering" (
    "id" TEXT NOT NULL,
    "trainingCenterId" TEXT NOT NULL,
    "formationTypeId" TEXT NOT NULL,
    "pricePerPerson" DOUBLE PRECISION NOT NULL,
    "pricePerSession" DOUBLE PRECISION,
    "minParticipants" INTEGER NOT NULL DEFAULT 1,
    "maxParticipants" INTEGER NOT NULL DEFAULT 12,
    "durationHours" DOUBLE PRECISION,
    "durationDays" INTEGER,
    "availableModes" TEXT NOT NULL DEFAULT 'PRESENTIEL',
    "certificationCode" TEXT,
    "isOPCOEligible" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingCenterOffering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingCenterAvailability" (
    "id" TEXT NOT NULL,
    "trainingCenterId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL DEFAULT '09:00',
    "endTime" TEXT NOT NULL DEFAULT '17:00',
    "spotsAvailable" INTEGER NOT NULL DEFAULT 12,
    "formationTypeId" TEXT,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingCenterAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeAbsence" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeAbsence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingNeed" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "formationTypeId" TEXT NOT NULL,
    "certificateId" TEXT,
    "expiryDate" TIMESTAMP(3),
    "daysUntilExpiry" INTEGER,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "priorityReason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "plannedSessionId" TEXT,
    "estimatedCost" DOUBLE PRECISION,
    "absenceCost" DOUBLE PRECISION,
    "totalCost" DOUBLE PRECISION,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingNeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingSession" (
    "id" TEXT NOT NULL,
    "formationTypeId" TEXT NOT NULL,
    "trainingCenterId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL DEFAULT '09:00',
    "endTime" TEXT NOT NULL DEFAULT '17:00',
    "location" TEXT,
    "isIntraCompany" BOOLEAN NOT NULL DEFAULT false,
    "trainingMode" TEXT NOT NULL DEFAULT 'PRESENTIEL',
    "minParticipants" INTEGER NOT NULL DEFAULT 1,
    "maxParticipants" INTEGER NOT NULL DEFAULT 12,
    "trainingCost" DOUBLE PRECISION,
    "costPerPerson" DOUBLE PRECISION,
    "totalAbsenceCost" DOUBLE PRECISION,
    "totalCost" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "convocationsSentAt" TIMESTAMP(3),
    "scenarioId" TEXT,
    "scenarioRank" INTEGER,
    "savingsVsAlternative" DOUBLE PRECISION,
    "notes" TEXT,
    "cancellationReason" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingSessionAttendee" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'INVITED',
    "absenceCost" DOUBLE PRECISION,
    "travelCost" DOUBLE PRECISION,
    "passed" BOOLEAN,
    "certificateId" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "attendedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingSessionAttendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanningScenario" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "site" TEXT,
    "department" TEXT,
    "totalTrainingCost" DOUBLE PRECISION,
    "totalAbsenceCost" DOUBLE PRECISION,
    "totalCost" DOUBLE PRECISION,
    "savingsVsBaseline" DOUBLE PRECISION,
    "coveragePercent" DOUBLE PRECISION,
    "riskScore" DOUBLE PRECISION,
    "sessionsData" TEXT,
    "constraintsData" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanningScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT,
    "userEmail" TEXT,
    "companyId" TEXT,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Convocation" (
    "id" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "formationName" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Convocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConvocationAttendee" (
    "id" TEXT NOT NULL,
    "convocationId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "employeeEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConvocationAttendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferenceData" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT,

    CONSTRAINT "ReferenceData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_token_key" ON "EmailVerificationToken"("token");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_token_idx" ON "EmailVerificationToken"("token");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_email_idx" ON "EmailVerificationToken"("email");

-- CreateIndex
CREATE INDEX "LeadCapture_email_idx" ON "LeadCapture"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PlanningConstraints_companyId_key" ON "PlanningConstraints"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_qrToken_key" ON "Employee"("qrToken");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeId_companyId_key" ON "Employee"("employeeId", "companyId");

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

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_companyId_idx" ON "AuditLog"("companyId");

-- CreateIndex
CREATE INDEX "Convocation_formationId_idx" ON "Convocation"("formationId");

-- CreateIndex
CREATE INDEX "Convocation_status_idx" ON "Convocation"("status");

-- CreateIndex
CREATE INDEX "Convocation_createdAt_idx" ON "Convocation"("createdAt");

-- CreateIndex
CREATE INDEX "Convocation_companyId_idx" ON "Convocation"("companyId");

-- CreateIndex
CREATE INDEX "ConvocationAttendee_convocationId_idx" ON "ConvocationAttendee"("convocationId");

-- CreateIndex
CREATE INDEX "ConvocationAttendee_employeeId_idx" ON "ConvocationAttendee"("employeeId");

-- CreateIndex
CREATE INDEX "ReferenceData_type_isActive_idx" ON "ReferenceData"("type", "isActive");

-- CreateIndex
CREATE INDEX "ReferenceData_companyId_idx" ON "ReferenceData"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "ReferenceData_type_value_companyId_key" ON "ReferenceData"("type", "value", "companyId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanningConstraints" ADD CONSTRAINT "PlanningConstraints_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormationType" ADD CONSTRAINT "FormationType_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_formationTypeId_fkey" FOREIGN KEY ("formationTypeId") REFERENCES "FormationType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertLog" ADD CONSTRAINT "AlertLog_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "Certificate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PassportSignature" ADD CONSTRAINT "PassportSignature_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingCenter" ADD CONSTRAINT "TrainingCenter_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingCenterOffering" ADD CONSTRAINT "TrainingCenterOffering_trainingCenterId_fkey" FOREIGN KEY ("trainingCenterId") REFERENCES "TrainingCenter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingCenterOffering" ADD CONSTRAINT "TrainingCenterOffering_formationTypeId_fkey" FOREIGN KEY ("formationTypeId") REFERENCES "FormationType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingCenterAvailability" ADD CONSTRAINT "TrainingCenterAvailability_trainingCenterId_fkey" FOREIGN KEY ("trainingCenterId") REFERENCES "TrainingCenter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeAbsence" ADD CONSTRAINT "EmployeeAbsence_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingNeed" ADD CONSTRAINT "TrainingNeed_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingNeed" ADD CONSTRAINT "TrainingNeed_formationTypeId_fkey" FOREIGN KEY ("formationTypeId") REFERENCES "FormationType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_formationTypeId_fkey" FOREIGN KEY ("formationTypeId") REFERENCES "FormationType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_trainingCenterId_fkey" FOREIGN KEY ("trainingCenterId") REFERENCES "TrainingCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSessionAttendee" ADD CONSTRAINT "TrainingSessionAttendee_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSessionAttendee" ADD CONSTRAINT "TrainingSessionAttendee_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConvocationAttendee" ADD CONSTRAINT "ConvocationAttendee_convocationId_fkey" FOREIGN KEY ("convocationId") REFERENCES "Convocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenceData" ADD CONSTRAINT "ReferenceData_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
