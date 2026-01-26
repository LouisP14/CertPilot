const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const formations = await prisma.formationType.findMany({
    where: {
      name: {
        contains: "lectricien",
      },
    },
    select: {
      id: true,
      name: true,
      service: true,
    },
  });

  console.log("Formations Électricien:");
  console.log(JSON.stringify(formations, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
