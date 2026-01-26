const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Recherche de formations en double...\n");

  // Récupérer toutes les formations
  const formations = await prisma.formationType.findMany({
    select: {
      id: true,
      name: true,
      service: true,
      _count: {
        select: {
          certificates: true,
          trainingNeeds: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Grouper par nom pour détecter les doublons
  const byName = {};
  formations.forEach((f) => {
    const normalizedName = f.name.trim().toLowerCase();
    if (!byName[normalizedName]) {
      byName[normalizedName] = [];
    }
    byName[normalizedName].push(f);
  });

  // Afficher les doublons
  let hasDuplicates = false;
  for (const [name, items] of Object.entries(byName)) {
    if (items.length > 1) {
      hasDuplicates = true;
      console.log(
        `\n=== DOUBLON: "${items[0].name}" (${items.length} entrées) ===`,
      );
      items.forEach((f) => {
        console.log(`  ID: ${f.id}`);
        console.log(`    Service: ${f.service || "null"}`);
        console.log(`    Certificats: ${f._count.certificates}`);
      });
    }
  }

  if (!hasDuplicates) {
    console.log("Aucun doublon trouvé!");
  }
}

main()
  .catch((e) => console.error("Erreur:", e))
  .finally(() => prisma.$disconnect());
