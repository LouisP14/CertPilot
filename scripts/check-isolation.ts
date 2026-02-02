import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== EMPLOYÉS ACTIFS ===");
  const employees = await prisma.employee.findMany({
    where: { isActive: true },
    select: { id: true, firstName: true, lastName: true, companyId: true },
  });
  employees.forEach((e) =>
    console.log(`${e.firstName} ${e.lastName} -> companyId: ${e.companyId}`),
  );

  console.log("\n=== USERS ===");
  const users = await prisma.user.findMany({
    select: { email: true, companyId: true, role: true },
  });
  users.forEach((u) =>
    console.log(`${u.email} -> companyId: ${u.companyId} - role: ${u.role}`),
  );

  console.log("\n=== COMPANIES ===");
  const companies = await prisma.company.findMany({
    select: { id: true, name: true },
  });
  companies.forEach((c) => console.log(`${c.name} -> id: ${c.id}`));

  await prisma.$disconnect();
}

main();
