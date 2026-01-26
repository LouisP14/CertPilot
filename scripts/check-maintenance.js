const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  console.log("=== VÉRIFICATION CONFORMITÉ MAINTENANCE ===\n");

  // Employés du service Maintenance
  const maintenanceEmployees = await p.employee.findMany({
    where: { isActive: true, department: "Maintenance" },
    select: { id: true, firstName: true, lastName: true },
  });

  console.log(`Employés Maintenance: ${maintenanceEmployees.length}`);
  maintenanceEmployees.forEach((e) =>
    console.log(`  - ${e.firstName} ${e.lastName} (${e.id})`),
  );

  // Formations requises pour Maintenance
  const maintenanceFormations = await p.formationType.findMany({
    where: {
      isActive: true,
      service: { contains: "Maintenance" },
    },
    select: { id: true, name: true },
  });

  console.log(
    `\nFormations requises pour Maintenance: ${maintenanceFormations.length}`,
  );
  maintenanceFormations.forEach((f) => console.log(`  - ${f.name} (${f.id})`));

  console.log("\n=== DÉTAIL PAR FORMATION ===\n");

  for (const formation of maintenanceFormations) {
    console.log(`\n📋 ${formation.name}:`);

    // Pour chaque employé Maintenance, vérifier s'il a cette formation
    let countWithFormation = 0;

    for (const emp of maintenanceEmployees) {
      const cert = await p.certificate.findFirst({
        where: {
          employeeId: emp.id,
          formationTypeId: formation.id,
          isArchived: false,
        },
        select: { id: true, obtainedDate: true, expiryDate: true },
      });

      if (cert) {
        countWithFormation++;
        console.log(`  ✅ ${emp.firstName} ${emp.lastName}`);
      } else {
        console.log(
          `  ❌ ${emp.firstName} ${emp.lastName} - PAS DE CERTIFICAT`,
        );
      }
    }

    console.log(
      `  → ${countWithFormation}/${maintenanceEmployees.length} = ${Math.round((countWithFormation / maintenanceEmployees.length) * 100)}%`,
    );
  }

  // Calcul du pourcentage global
  console.log("\n=== CALCUL POURCENTAGE GLOBAL ===");
  let totalPercentage = 0;
  let formationCount = 0;

  for (const formation of maintenanceFormations) {
    let countWithFormation = 0;
    for (const emp of maintenanceEmployees) {
      const cert = await p.certificate.findFirst({
        where: {
          employeeId: emp.id,
          formationTypeId: formation.id,
          isArchived: false,
        },
      });
      if (cert) countWithFormation++;
    }
    const pct = Math.round(
      (countWithFormation / maintenanceEmployees.length) * 100,
    );
    totalPercentage += pct;
    formationCount++;
    console.log(`${formation.name}: ${pct}%`);
  }

  console.log(`\nMoyenne: ${Math.round(totalPercentage / formationCount)}%`);
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());
