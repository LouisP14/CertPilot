const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  // 1. Nombre d'employés actifs
  const employeeCount = await p.employee.count({ where: { isActive: true } });
  console.log("=== EMPLOYÉS ACTIFS ===");
  console.log("Total:", employeeCount);

  // 2. Employés par service
  const employees = await p.employee.findMany({
    where: { isActive: true },
    select: { id: true, firstName: true, lastName: true, department: true },
  });

  const employeesByService = {};
  employees.forEach((e) => {
    const dept = e.department || "Non défini";
    if (!employeesByService[dept]) employeesByService[dept] = [];
    employeesByService[dept].push(`${e.firstName} ${e.lastName}`);
  });

  console.log("\n=== EMPLOYÉS PAR SERVICE ===");
  Object.entries(employeesByService).forEach(([service, emps]) => {
    console.log(`${service}: ${emps.length} employés`);
  });

  // 3. Formations requises par service
  const formationTypes = await p.formationType.findMany({
    where: { isActive: true },
    select: { id: true, name: true, service: true, category: true },
  });

  console.log("\n=== FORMATIONS PAR SERVICE ===");
  const formationsParService = {};
  formationTypes.forEach((ft) => {
    if (ft.service) {
      const services = ft.service.split(",").map((s) => s.trim());
      services.forEach((s) => {
        if (!formationsParService[s]) formationsParService[s] = [];
        formationsParService[s].push(ft.name);
      });
    }
  });

  Object.entries(formationsParService).forEach(([service, formations]) => {
    console.log(`${service}: ${formations.length} formations requises`);
    formations.forEach((f) => console.log(`  - ${f}`));
  });

  // 4. Vérification détaillée pour Maintenance
  console.log("\n=== VÉRIFICATION DÉTAILLÉE MAINTENANCE ===");
  const maintenanceEmployees = employees.filter(
    (e) => e.department === "Maintenance",
  );
  console.log(`Employés Maintenance: ${maintenanceEmployees.length}`);

  const maintenanceFormations = formationsParService["Maintenance"] || [];
  console.log(`Formations requises: ${maintenanceFormations.length}`);

  // Pour chaque formation, vérifier les certificats
  for (const emp of maintenanceEmployees) {
    const certs = await p.certificate.findMany({
      where: {
        employeeId: emp.id,
        isArchived: false,
        formationType: {
          service: { contains: "Maintenance" },
        },
      },
      include: { formationType: { select: { name: true } } },
    });

    console.log(`\n${emp.firstName} ${emp.lastName}:`);
    if (certs.length === 0) {
      console.log("  - Aucun certificat pour formations Maintenance");
    } else {
      certs.forEach((c) => console.log(`  - ${c.formationType.name}`));
    }
  }

  // 5. Vérification couverture par formation
  console.log("\n=== COUVERTURE PAR FORMATION ===");
  for (const ft of formationTypes.slice(0, 5)) {
    const certCount = await p.certificate.count({
      where: {
        formationTypeId: ft.id,
        isArchived: false,
      },
    });
    const uniqueEmployees = await p.certificate.findMany({
      where: { formationTypeId: ft.id, isArchived: false },
      select: { employeeId: true },
      distinct: ["employeeId"],
    });
    console.log(
      `${ft.name}: ${uniqueEmployees.length} employés formés sur ${employeeCount} (${Math.round((uniqueEmployees.length / employeeCount) * 100)}%)`,
    );
  }
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());
