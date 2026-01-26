const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Correction des doublons de formations...\n");

  // Définir les doublons: [ID à supprimer, ID correct à garder]
  const duplicates = [
    {
      duplicateId: "conduite-palan-et-lingues",
      correctId: "conduite-palan-et-élingues",
    },
    { duplicateId: "espaces-confins", correctId: "espaces-confinés" },
    {
      duplicateId: "gerbeur-conducteur-port---cat-1b",
      correctId: "gerbeur-conducteur-porté---cat-1b",
    },
    {
      duplicateId: "habilitation-lectrique-bc",
      correctId: "habilitation-électrique-bc",
    },
    {
      duplicateId: "habilitation-lectrique-br",
      correctId: "habilitation-électrique-br",
    },
  ];

  for (const { duplicateId, correctId } of duplicates) {
    console.log(`\n=== Traitement: ${duplicateId} → ${correctId} ===`);

    // Compter et transférer les certificats
    const certCount = await prisma.certificate.count({
      where: { formationTypeId: duplicateId },
    });
    console.log(`  Certificats à transférer: ${certCount}`);

    if (certCount > 0) {
      const result = await prisma.certificate.updateMany({
        where: { formationTypeId: duplicateId },
        data: { formationTypeId: correctId },
      });
      console.log(`  ✓ ${result.count} certificats transférés`);
    }

    // Compter et transférer les besoins de formation
    const needsCount = await prisma.trainingNeed.count({
      where: { formationTypeId: duplicateId },
    });
    console.log(`  Besoins de formation à transférer: ${needsCount}`);

    if (needsCount > 0) {
      const result = await prisma.trainingNeed.updateMany({
        where: { formationTypeId: duplicateId },
        data: { formationTypeId: correctId },
      });
      console.log(`  ✓ ${result.count} besoins transférés`);
    }

    // Compter et transférer les sessions
    const sessionsCount = await prisma.trainingSession.count({
      where: { formationTypeId: duplicateId },
    });
    console.log(`  Sessions à transférer: ${sessionsCount}`);

    if (sessionsCount > 0) {
      const result = await prisma.trainingSession.updateMany({
        where: { formationTypeId: duplicateId },
        data: { formationTypeId: correctId },
      });
      console.log(`  ✓ ${result.count} sessions transférées`);
    }

    // Supprimer le doublon
    try {
      await prisma.formationType.delete({
        where: { id: duplicateId },
      });
      console.log(`  ✓ Formation doublon supprimée`);
    } catch (e) {
      console.log(`  ✗ Erreur suppression: ${e.message}`);
    }
  }

  console.log("\n\n=== Vérification finale ===");

  // Vérifier qu'il n'y a plus de doublons
  const formations = await prisma.formationType.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const byName = {};
  formations.forEach((f) => {
    const normalizedName = f.name.trim().toLowerCase();
    if (!byName[normalizedName]) byName[normalizedName] = [];
    byName[normalizedName].push(f);
  });

  let hasDuplicates = false;
  for (const [name, items] of Object.entries(byName)) {
    if (items.length > 1) {
      hasDuplicates = true;
      console.log(`  Doublon restant: ${items[0].name}`);
    }
  }

  if (!hasDuplicates) {
    console.log("  ✓ Aucun doublon restant!");
  }

  console.log(`\nTotal formations: ${formations.length}`);
}

main()
  .then(() => console.log("\nTerminé!"))
  .catch((e) => console.error("Erreur:", e))
  .finally(() => prisma.$disconnect());
