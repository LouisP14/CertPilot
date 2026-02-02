import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== EMPLOYÉS ===");
  const employees = await prisma.employee.findMany({
    select: { firstName: true, lastName: true, companyId: true },
  });
  console.log(JSON.stringify(employees, null, 2));

  console.log("\n=== COMPANIES ===");
  const companies = await prisma.company.findMany({
    select: { id: true, name: true },
  });
  console.log(JSON.stringify(companies, null, 2));

  console.log("\n=== USERS ===");
  const users = await prisma.user.findMany({
    select: { email: true, companyId: true },
  });
  console.log(JSON.stringify(users, null, 2));
}

main().finally(() => prisma.$disconnect());
