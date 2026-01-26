const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const employees = await p.employee.findMany({
    select: { firstName: true, lastName: true, team: true, department: true },
    take: 20,
  });
  console.log(JSON.stringify(employees, null, 2));
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());
