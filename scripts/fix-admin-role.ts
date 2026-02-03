import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Remettre le rôle SUPER_ADMIN à admin@certpilot.fr
  const user = await prisma.user.update({
    where: { email: "admin@certpilot.fr" },
    data: { role: "SUPER_ADMIN" },
  });

  console.log("✅ Rôle mis à jour:", user.email, "->", user.role);

  await prisma.$disconnect();
}

main();
