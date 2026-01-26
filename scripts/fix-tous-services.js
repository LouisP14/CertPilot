const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

// Formations qui devraient être pour "Tous" les services
const FORMATIONS_TOUS = [
  "Sauveteur Secouriste du Travail",
  "Formation incendie",
  "Agent de chaufferie vapeur",
  "Autoclaves - Conduite et Maintenance",
  "Conducteur de chaufferie vapeur",
];

async function main() {
  console.log('=== MISE À JOUR DES FORMATIONS "TOUS" ===\n');

  for (const formationName of FORMATIONS_TOUS) {
    const formation = await p.formationType.findFirst({
      where: { name: formationName },
    });

    if (formation) {
      await p.formationType.update({
        where: { id: formation.id },
        data: { service: "Tous" },
      });
      console.log(`✅ "${formationName}" → service = "Tous"`);
    } else {
      console.log(`⚠️  "${formationName}" non trouvée`);
    }
  }

  console.log("\n✨ Mise à jour terminée !");
  console.log("Rechargez la page du dashboard pour voir les changements.");
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());
