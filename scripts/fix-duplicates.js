const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Les doublons à supprimer (ceux sans accent dans l'ID)
  const duplicateIds = ["lectricien-basse-tension", "lectricien-haute-tension"];

  // Les vrais IDs (avec accent)
  const correctIds = ["électricien-basse-tension", "électricien-haute-tension"];

  for (let i = 0; i < duplicateIds.length; i++) {
    const duplicateId = duplicateIds[i];
    const correctId = correctIds[i];

    // Vérifier s'il y a des certificats liés au doublon
    const certificates = await prisma.certificate.findMany({
      where: { formationTypeId: duplicateId },
    });

    console.log(`\n${duplicateId}:`);
    console.log(`  - Certificats liés: ${certificates.length}`);

    if (certificates.length > 0) {
      // Transférer les certificats vers la bonne formation
      console.log(`  - Transfert des certificats vers ${correctId}...`);
      await prisma.certificate.updateMany({
        where: { formationTypeId: duplicateId },
        data: { formationTypeId: correctId },
      });
      console.log(`  - ✅ ${certificates.length} certificats transférés`);
    }

    // Vérifier les sessions
    const sessions = await prisma.trainingSession.findMany({
      where: { formationTypeId: duplicateId },
    });

    console.log(`  - Sessions liées: ${sessions.length}`);

    if (sessions.length > 0) {
      console.log(`  - Transfert des sessions vers ${correctId}...`);
      await prisma.trainingSession.updateMany({
        where: { formationTypeId: duplicateId },
        data: { formationTypeId: correctId },
      });
      console.log(`  - ✅ ${sessions.length} sessions transférées`);
    }

    // Supprimer le doublon
    try {
      await prisma.formationType.delete({
        where: { id: duplicateId },
      });
      console.log(`  - ✅ Formation doublon supprimée`);
    } catch (e) {
      console.log(`  - ❌ Erreur suppression: ${e.message}`);
    }
  }

  // Vérification finale
  console.log("\n=== Vérification finale ===");
  const remaining = await prisma.formationType.findMany({
    where: {
      name: { contains: "lectricien" },
    },
    select: { id: true, name: true, service: true },
  });
  console.log(JSON.stringify(remaining, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
