-- AlterTable Employee : ajout NIR et nom de naissance
ALTER TABLE "Employee" ADD COLUMN     "nir" TEXT,
ADD COLUMN     "birthName" TEXT;

-- AlterTable FormationType : métadonnées Passeport de Prévention
ALTER TABLE "FormationType" ADD COLUMN     "isConcernedPP" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isCertifiante" BOOLEAN,
ADD COLUMN     "certificationCode" TEXT,
ADD COLUMN     "formacodes" TEXT,
ADD COLUMN     "nsfCodes" TEXT,
ADD COLUMN     "romeCodes" TEXT;

-- AlterTable Certificate : données spécifiques déclaration (qualification formateur, modalité, dates)
ALTER TABLE "Certificate" ADD COLUMN     "trainingStartDate" TIMESTAMP(3),
ADD COLUMN     "trainingMode" TEXT,
ADD COLUMN     "trainerQualification" TEXT,
ADD COLUMN     "ppDeclaredAt" TIMESTAMP(3),
ADD COLUMN     "ppDeclarationRef" TEXT;