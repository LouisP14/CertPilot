import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Vérification de l'isolation des données par entreprise...\n");

  // 1. Lister toutes les companies
  const companies = await prisma.company.findMany({
    include: {
      users: true,
      _count: {
        select: {
          employees: true,
          formationTypes: true,
        },
      },
    },
  });

  console.log(`📊 ${companies.length} entreprises trouvées:\n`);
  for (const company of companies) {
    console.log(`  - ${company.name} (${company.id})`);
    console.log(`    Admin: ${company.adminEmail || "N/A"}`);
    console.log(`    Users: ${company.users.length}`);
    console.log(`    Employees: ${company._count.employees}`);
    console.log(`    FormationTypes: ${company._count.formationTypes}`);
    console.log("");
  }

  // 2. Vérifier les employés sans companyId
  const employeesWithoutCompany = await prisma.employee.findMany({
    where: { companyId: null },
  });

  console.log(
    `\n⚠️  ${employeesWithoutCompany.length} employés sans companyId\n`,
  );

  // 3. Vérifier les formationTypes sans companyId
  const formationTypesWithoutCompany = await prisma.formationType.findMany({
    where: { companyId: null },
  });

  console.log(
    `⚠️  ${formationTypesWithoutCompany.length} types de formation sans companyId\n`,
  );

  // 4. Trouver la company "principale" (celle avec le plus d'utilisateurs ou la première)
  // On cherche la company qui a un adminEmail correspondant à un SUPER_ADMIN
  const superAdmin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });

  let mainCompany = companies[0];
  if (superAdmin?.companyId) {
    const found = companies.find((c) => c.id === superAdmin.companyId);
    if (found) mainCompany = found;
  }

  if (!mainCompany) {
    console.log("❌ Aucune entreprise trouvée. Création impossible.");
    return;
  }

  console.log(`\n🏢 Entreprise principale détectée: ${mainCompany.name}\n`);

  // 5. Assigner les employés orphelins à l'entreprise principale
  if (employeesWithoutCompany.length > 0) {
    console.log(
      `📝 Assignation de ${employeesWithoutCompany.length} employés à ${mainCompany.name}...`,
    );

    await prisma.employee.updateMany({
      where: { companyId: null },
      data: { companyId: mainCompany.id },
    });

    console.log("✅ Employés mis à jour");
  }

  // 6. Assigner les formationTypes orphelins à l'entreprise principale
  if (formationTypesWithoutCompany.length > 0) {
    console.log(
      `📝 Assignation de ${formationTypesWithoutCompany.length} types de formation à ${mainCompany.name}...`,
    );

    await prisma.formationType.updateMany({
      where: { companyId: null },
      data: { companyId: mainCompany.id },
    });

    console.log("✅ Types de formation mis à jour");
  }

  // 7. Vérification finale
  console.log("\n📊 Vérification finale:\n");

  const finalStats = await prisma.company.findMany({
    include: {
      _count: {
        select: {
          employees: true,
          formationTypes: true,
          users: true,
        },
      },
    },
  });

  for (const company of finalStats) {
    console.log(`  🏢 ${company.name}:`);
    console.log(`     - ${company._count.users} utilisateurs`);
    console.log(`     - ${company._count.employees} employés`);
    console.log(`     - ${company._count.formationTypes} types de formation`);
    console.log("");
  }

  // Vérifier s'il reste des orphelins
  const remainingOrphanEmployees = await prisma.employee.count({
    where: { companyId: null },
  });
  const remainingOrphanFormations = await prisma.formationType.count({
    where: { companyId: null },
  });

  if (remainingOrphanEmployees === 0 && remainingOrphanFormations === 0) {
    console.log(
      "✅ Toutes les données sont correctement isolées par entreprise!",
    );
  } else {
    console.log(
      `⚠️  Il reste ${remainingOrphanEmployees} employés et ${remainingOrphanFormations} formations sans entreprise`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
