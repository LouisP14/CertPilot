import prisma from "@/lib/prisma";
import crypto from "crypto";

/**
 * Invalide la signature électronique d'un employé si elle existe et est complétée.
 * Cette fonction doit être appelée à chaque modification des formations/certificats
 * pour garantir l'intégrité de la signature.
 */
export async function invalidateSignatureIfExists(
  employeeId: string,
): Promise<boolean> {
  try {
    // Vérifier si une signature existe pour cet employé
    const signature = await prisma.passportSignature.findUnique({
      where: { employeeId },
    });

    // Si pas de signature ou signature déjà en DRAFT, rien à faire
    if (!signature || signature.status === "DRAFT") {
      return false;
    }

    // Invalider la signature en la remettant en DRAFT
    // Note: employeeToken et managerToken sont non-nullable avec @unique, on génère de nouveaux tokens
    await prisma.passportSignature.update({
      where: { employeeId },
      data: {
        status: "DRAFT",
        // Générer de nouveaux tokens uniques (champs non-nullable)
        employeeToken: crypto.randomUUID(),
        managerToken: crypto.randomUUID(),
        // Réinitialiser les dates d'expiration et signatures
        employeeTokenExpiry: null,
        managerTokenExpiry: null,
        employeeSignatureImg: null,
        employeeSignatureName: null,
        employeeSignedAt: null,
        employeeSignatureIP: null,
        managerSignatureImg: null,
        managerSignatureName: null,
        managerSignatureTitle: null,
        managerSignedAt: null,
        managerSignatureIP: null,
        completedAt: null,
        rejectedAt: null,
        rejectionReason: null,
      },
    });

    console.log(
      `Signature invalidée pour l'employé ${employeeId} suite à modification des formations`,
    );
    return true;
  } catch (error) {
    console.error("Erreur lors de l'invalidation de la signature:", error);
    return false;
  }
}
