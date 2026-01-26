const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  // Vérifier les valeurs exactes du champ service pour les formations "Tous"
  const formations = await p.formationType.findMany({
    where: { isActive: true },
    select: { name: true, service: true },
  });

  console.log("=== VALEURS DU CHAMP SERVICE ===\n");
  formations.forEach((f) => {
    console.log(`"${f.name}"`);
    console.log(`  service = "${f.service}"`);
    console.log("");
  });
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());
