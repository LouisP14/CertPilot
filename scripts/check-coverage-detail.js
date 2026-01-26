const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const employeeCount = await p.employee.count({ where: { isActive: true } });

  // Vérifier les formations spécifiques affichées
  const formationsToCheck = [
    "Sauveteur Secouriste du Travail",
    "Travaux en hauteur - port du harnais",
    "Formation incendie",
    "Électricien Basse Tension",
    "Habilitation électrique BR",
    "Espaces confinés",
  ];

  console.log(`Total employés actifs: ${employeeCount}\n`);

  for (const formationName of formationsToCheck) {
    const ft = await p.formationType.findFirst({
      where: { name: { contains: formationName } },
      select: { id: true, name: true },
    });

    if (!ft) {
      console.log(`❌ Formation "${formationName}" non trouvée`);
      continue;
    }

    // Méthode 1: Compter les certificats non archivés
    const certificates = await p.certificate.findMany({
      where: {
        formationTypeId: ft.id,
        isArchived: false,
      },
      select: { employeeId: true },
    });

    // Compter les employés uniques
    const uniqueEmployeeIds = new Set(certificates.map((c) => c.employeeId));
    const trainedCount = uniqueEmployeeIds.size;
    const percentage = Math.round((trainedCount / employeeCount) * 100);

    console.log(`${ft.name}:`);
    console.log(`  - Certificats trouvés: ${certificates.length}`);
    console.log(
      `  - Employés uniques formés: ${trainedCount}/${employeeCount} (${percentage}%)`,
    );

    // Vérifier si les employés existent et sont actifs
    const activeEmployeesWithCert = await p.certificate.findMany({
      where: {
        formationTypeId: ft.id,
        isArchived: false,
        employee: { isActive: true },
      },
      select: {
        employeeId: true,
        employee: {
          select: { firstName: true, lastName: true, isActive: true },
        },
      },
    });

    const uniqueActiveEmployees = new Set(
      activeEmployeesWithCert.map((c) => c.employeeId),
    );
    console.log(`  - Employés ACTIFS formés: ${uniqueActiveEmployees.size}`);

    // Lister les employés formés
    const employeeNames = [
      ...new Map(
        activeEmployeesWithCert.map((c) => [
          c.employeeId,
          `${c.employee.firstName} ${c.employee.lastName}`,
        ]),
      ).values(),
    ];
    if (employeeNames.length <= 10) {
      console.log(`  - Noms: ${employeeNames.join(", ")}`);
    }
    console.log("");
  }

  // Vérifier s'il y a des employés inactifs
  const inactiveCount = await p.employee.count({ where: { isActive: false } });
  console.log(`\nEmployés inactifs: ${inactiveCount}`);
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());
