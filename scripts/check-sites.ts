import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkSites() {
  console.log("🔍 Vérification des sites dans la base de données...\n");

  const sites = await prisma.referenceData.findMany({
    where: {
      type: "SITE",
    },
    orderBy: {
      value: "asc",
    },
  });

  console.log(`Total sites trouvés: ${sites.length}\n`);

  sites.forEach((site, index) => {
    console.log(`${index + 1}. ID: ${site.id}`);
    console.log(`   Valeur: "${site.value}"`);
    console.log(`   Active: ${site.isActive}`);
    console.log(`   Créé le: ${site.createdAt}`);
    console.log("");
  });

  // Vérifier spécifiquement "Vaudreuil"
  const vaudreuil = await prisma.referenceData.findFirst({
    where: {
      type: "SITE",
      value: {
        contains: "audreuil",
        mode: "insensitive",
      },
    },
  });

  if (vaudreuil) {
    console.log('⚠️  "Vaudreuil" (ou similaire) existe déjà dans la base:');
    console.log(`   ID: ${vaudreuil.id}`);
    console.log(`   Valeur exacte: "${vaudreuil.value}"`);
    console.log(`   Active: ${vaudreuil.isActive}`);
  } else {
    console.log('✅ "Vaudreuil" n\'existe pas dans la base');
  }
}

checkSites()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
