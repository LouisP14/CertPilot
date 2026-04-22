-- AlterTable
-- Opt-in par défaut : tous les users (y compris existants) reçoivent les alertes.
-- Les admins pourront ensuite décocher via Paramètres → Destinataires des alertes.
ALTER TABLE "User" ADD COLUMN     "receivesHabilitationAlerts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "receivesPPAlerts" BOOLEAN NOT NULL DEFAULT true;