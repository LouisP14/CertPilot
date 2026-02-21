import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function main() {
  const u = await p.user.findFirst({
    where: { email: "poulain.louis12@gmail.com" },
    select: { companyId: true },
  });
  if (!u?.companyId) return;

  const ft = await p.formationType.findFirst({
    where: { companyId: u.companyId, name: { contains: "CATEC" } },
    select: {
      id: true,
      name: true,
      durationHours: true,
      durationDays: true,
      estimatedCostPerPerson: true,
      estimatedCostPerSession: true,
    },
  });
  console.log("Formation:", ft);

  const emp = await p.employee.findFirst({
    where: { companyId: u.companyId, lastName: { contains: "Fournier" } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      hourlyCost: true,
      workingHoursPerDay: true,
    },
  });
  console.log("Employee:", emp);

  if (ft && emp) {
    const durationHours = ft.durationHours || (ft.durationDays || 1) * 7;
    const hourlyCost = emp.hourlyCost ?? 0;
    const estimatedCost = ft.estimatedCostPerPerson || 0;
    const absenceCost = durationHours * hourlyCost;
    const totalCost = estimatedCost + absenceCost;
    console.log("\n=== CALCUL DU COÛT ===");
    console.log(`durationHours (from DB) = ${ft.durationHours}`);
    console.log(`durationDays (from DB)  = ${ft.durationDays}`);
    console.log(`→ durationHours utilisé = ${durationHours}`);
    console.log(`hourlyCost employé      = ${hourlyCost} €/h`);
    console.log(`estimatedCostPerPerson  = ${estimatedCost} €`);
    console.log(
      `absenceCost             = ${durationHours} × ${hourlyCost} = ${absenceCost} €`,
    );
    console.log(
      `TOTAL                   = ${estimatedCost} + ${absenceCost} = ${totalCost} €`,
    );
  }
}

main().finally(() => p.$disconnect());
