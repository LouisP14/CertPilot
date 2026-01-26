import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const INITIAL_DATA = {
  FUNCTION: [
    "Opérateur de production",
    "Technicien de maintenance",
    "Coordinateur technique",
    "Chef d'équipe",
    "Responsable de production",
    "Responsable maintenance",
    "Responsable qualité",
    "Technicien qualité",
    "Magasinier",
    "Cariste",
    "Agent logistique",
    "Responsable logistique",
    "Technicien HSE",
    "Responsable HSE",
    "Ingénieur process",
    "Responsable amélioration continue",
    "Assistant administratif",
    "Responsable RH",
    "Directeur de site",
  ],
  SERVICE: [
    "Production",
    "Maintenance",
    "Qualité",
    "Logistique",
    "HSE",
    "Ressources Humaines",
    "Administration",
    "Direction",
    "Amélioration Continue",
    "Méthodes",
    "Industrialisation",
  ],
  SITE: ["Brécey", "Granville"],
  TEAM: ["3x8 équipe 1", "3x8 équipe 2", "3x8 équipe 3", "Journée", "Week-end"],
};

async function seedReferences() {
  console.log("🌱 Ajout des données de référence...");

  for (const [type, values] of Object.entries(INITIAL_DATA)) {
    for (const value of values) {
      try {
        await prisma.referenceData.upsert({
          where: {
            type_value: {
              type,
              value,
            },
          },
          update: {},
          create: {
            type,
            value,
            isActive: true,
            sortOrder: 0,
          },
        });
        console.log(`✅ ${type}: ${value}`);
      } catch (error) {
        console.log(`⚠️  ${type}: ${value} existe déjà`);
      }
    }
  }

  console.log("✨ Terminé !");
}

seedReferences()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
