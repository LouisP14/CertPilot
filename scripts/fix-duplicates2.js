const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Début de la correction...");

  // Les doublons à supprimer (ceux sans accent dans l'ID)
  const duplicates = [
    {
      duplicateId: "lectricien-basse-tension",
      correctId: "électricien-basse-tension",
    },
    {
      duplicateId: "lectricien-haute-tension",
      correctId: "électricien-haute-tension",
    },
  ];

  for (const { duplicateId, correctId } of duplicates) {
    console.log(`\nTraitement de ${duplicateId}...`);

    // Vérifier s'il y a des certificats liés au doublon
    const certCount = await prisma.certificate.count({
      where: { formationTypeId: duplicateId },
    });
    console.log(`  Certificats liés: ${certCount}`);

    if (certCount > 0) {
      const result = await prisma.certificate.updateMany({
        where: { formationTypeId: duplicateId },
        data: { formationTypeId: correctId },
      });
      console.log(`  Certificats transférés: ${result.count}`);
    }

    // Vérifier les sessions
    const sessionCount = await prisma.trainingSession.count({
      where: { formationTypeId: duplicateId },
    });
    console.log(`  Sessions liées: ${sessionCount}`);

    if (sessionCount > 0) {
      const result = await prisma.trainingSession.updateMany({
        where: { formationTypeId: duplicateId },
        data: { formationTypeId: correctId },
      });
      console.log(`  Sessions transférées: ${result.count}`);
    }

    // Supprimer le doublon
    try {
      await prisma.formationType.delete({
        where: { id: duplicateId },
      });
      console.log(`  ✓ Formation doublon supprimée`);
    } catch (e) {
      console.log(`  Erreur suppression: ${e.message}`);
    }
  }

  console.log("\n=== Résultat final ===");
  const remaining = await prisma.formationType.findMany({
    where: { name: { contains: "lectricien" } },
    select: { id: true, name: true, service: true },
  });
  console.log(JSON.stringify(remaining, null, 2));
}

main()
  .then(() => console.log("\nTerminé!"))
  .catch((e) => console.error("Erreur:", e))
  .finally(() => prisma.$disconnect());
