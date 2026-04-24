-- AlterTable TrainingSession : ajout archivage
ALTER TABLE "TrainingSession" ADD COLUMN "isArchived" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "TrainingSession" ADD COLUMN "archivedAt" TIMESTAMP(3);

-- AlterTable Convocation : ajout archivage
ALTER TABLE "Convocation" ADD COLUMN "isArchived" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Convocation" ADD COLUMN "archivedAt" TIMESTAMP(3);

-- Index pour filtrage performant
CREATE INDEX "Convocation_isArchived_idx" ON "Convocation"("isArchived");