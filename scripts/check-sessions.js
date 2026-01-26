const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  // Vérifier les sessions qui couvrent le 28/02/2026
  const sessions = await p.trainingSession.findMany({
    where: {
      startDate: { lte: new Date("2026-02-28") },
      endDate: { gte: new Date("2026-02-28") },
      status: { in: ["PLANNED", "SCHEDULED", "IN_PROGRESS", "CONFIRMED"] },
    },
    include: {
      attendees: {
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              team: true,
              department: true,
            },
          },
        },
      },
      formationType: { select: { name: true } },
    },
  });

  console.log("Sessions couvrant le 28/02/2026:", sessions.length);
  sessions.forEach((s) => {
    console.log(
      `- ${s.formationType?.name}: ${s.startDate.toISOString().split("T")[0]} -> ${s.endDate.toISOString().split("T")[0]} (${s.attendees.length} participants)`,
    );
    s.attendees.forEach((a) => {
      console.log(
        `    * ${a.employee.firstName} ${a.employee.lastName} - ${a.employee.team} / ${a.employee.department}`,
      );
    });
  });

  // Vérifier le nombre total d'employés actifs
  const total = await p.employee.count({ where: { isActive: true } });
  console.log("\nTotal employés actifs:", total);
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());
