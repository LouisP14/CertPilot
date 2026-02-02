import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Migration des ReferenceData par entreprise...\n");

  // Récupérer toutes les entreprises
  const companies = await prisma.company.findMany();
  console.log(`📌 ${companies.length} entreprises trouvées`);

  // Récupérer toutes les références sans companyId
  const orphanRefs = await prisma.referenceData.findMany({
    where: { companyId: null },
  });
  console.log(`📌 ${orphanRefs.length} références orphelines (sans companyId)`);

  // Supprimer toutes les références orphelines (elles seront recréées par chaque entreprise)
  if (orphanRefs.length > 0) {
    await prisma.referenceData.deleteMany({
      where: { companyId: null },
    });
    console.log(`🗑️ Supprimé ${orphanRefs.length} références orphelines`);
  }

  // Vérifier les références par entreprise
  for (const company of companies) {
    const refs = await prisma.referenceData.findMany({
      where: { companyId: company.id },
    });
    console.log(`📌 ${company.name}: ${refs.length} références`);
  }

  console.log("\n✅ Migration terminée!");
  console.log(
    "\n💡 Chaque entreprise doit maintenant créer ses propres références.",
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
