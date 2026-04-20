-- AlterTable
ALTER TABLE "AlertLog" ADD COLUMN     "notifyType" TEXT NOT NULL DEFAULT 'ADMIN';

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "notifyEmployee" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifyManager" BOOLEAN NOT NULL DEFAULT false;
