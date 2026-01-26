import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkAndFixDuplicates() {
  console.log("🔍 Recherche des doublons dans TrainingNeed...\n");

  // Récupérer tous les besoins PENDING
  const allNeeds = await prisma.trainingNeed.findMany({
    where: { status: "PENDING" },
    include: {
      employee: { select: { firstName: true, lastName: true } },
      formationType: { select: { name: true } },
    },
    orderBy: [
      { employeeId: "asc" },
      { formationTypeId: "asc" },
      { createdAt: "asc" },
    ],
  });

  console.log(`Total besoins PENDING: ${allNeeds.length}`);

  // Grouper par employé + formation
  const grouped = new Map<string, typeof allNeeds>();

  for (const need of allNeeds) {
    const key = `${need.employeeId}|${need.formationTypeId}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(need);
  }

  // Trouver les doublons
  const duplicates: { key: string; count: number; needs: typeof allNeeds }[] =
    [];

  for (const [key, needs] of grouped) {
    if (needs.length > 1) {
      duplicates.push({ key, count: needs.length, needs });
    }
  }

  console.log(`\nGroupes uniques employé/formation: ${grouped.size}`);
  console.log(`Doublons trouvés: ${duplicates.length}`);

  if (duplicates.length > 0) {
    console.log("\n📋 Détails des doublons:\n");

    const idsToDelete: string[] = [];

    for (const dup of duplicates) {
      const first = dup.needs[0];
      console.log(
        `- ${first.employee.firstName} ${first.employee.lastName} / ${first.formationType.name}`,
      );
      console.log(
        `  → ${dup.count} entrées (on garde la plus ancienne, on supprime ${dup.count - 1})`,
      );

      // Garder le premier (le plus ancien), supprimer les autres
      for (let i = 1; i < dup.needs.length; i++) {
        idsToDelete.push(dup.needs[i].id);
      }
    }

    console.log(`\n🗑️  Suppression de ${idsToDelete.length} doublons...`);

    const deleted = await prisma.trainingNeed.deleteMany({
      where: { id: { in: idsToDelete } },
    });

    console.log(`✅ ${deleted.count} doublons supprimés !`);

    // Vérifier le résultat
    const remaining = await prisma.trainingNeed.count({
      where: { status: "PENDING" },
    });
    console.log(`\n📊 Besoins PENDING restants: ${remaining}`);
  } else {
    console.log("\n✅ Aucun doublon trouvé !");
  }
}

checkAndFixDuplicates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
