const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  // Services des employés
  const employees = await p.employee.findMany({
    where: { isActive: true },
    select: { department: true },
  });

  const servicesEmployes = [
    ...new Set(employees.map((e) => e.department).filter(Boolean)),
  ];
  console.log("=== SERVICES DES EMPLOYÉS ===");
  servicesEmployes.forEach((s) => {
    const count = employees.filter((e) => e.department === s).length;
    console.log(`  - ${s}: ${count} employés`);
  });

  // Services avec formations requises
  const formations = await p.formationType.findMany({
    where: { isActive: true },
    select: { name: true, service: true },
  });

  const servicesFormations = {};
  formations.forEach((f) => {
    if (f.service) {
      f.service
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => {
          if (!servicesFormations[s]) servicesFormations[s] = [];
          servicesFormations[s].push(f.name);
        });
    }
  });

  console.log("\n=== SERVICES AVEC FORMATIONS REQUISES ===");
  Object.entries(servicesFormations).forEach(([service, formations]) => {
    console.log(`  - ${service}: ${formations.length} formations`);
  });

  // Services manquants
  const servicesAvecFormations = Object.keys(servicesFormations);
  const manquants = servicesEmployes.filter(
    (s) => !servicesAvecFormations.includes(s),
  );

  console.log("\n=== SERVICES SANS FORMATIONS REQUISES ===");
  if (manquants.length === 0) {
    console.log("  Aucun");
  } else {
    manquants.forEach((s) => {
      console.log(`  ❌ ${s} - N'apparaîtra PAS dans le tableau Conformité !`);
    });
  }

  console.log("\n=== SOLUTION ===");
  console.log('Pour qu\'un service apparaisse dans "Conformité par service",');
  console.log("il faut assigner des formations requises à ce service dans");
  console.log(
    'Paramètres > Gestion des formations > Modifier > Champ "Service"',
  );
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());
