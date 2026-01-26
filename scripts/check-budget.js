const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const sessions = await p.trainingSession.findMany({
    select: { status: true, totalCost: true, startDate: true },
  });
  console.log("Sessions:");
  console.log(JSON.stringify(sessions, null, 2));

  // Vérifier les contraintes
  const company = await p.company.findFirst({
    include: { planningConstraints: true },
  });
  console.log("\nContraintes:");
  console.log(JSON.stringify(company?.planningConstraints, null, 2));
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());
