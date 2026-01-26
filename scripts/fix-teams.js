const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

// Mapping des anciennes équipes vers les nouvelles
const TEAM_MAPPING = {
  "Équipe A": "3x8 équipe 1",
  "Équipe B": "3x8 équipe 2",
  "Équipe C": "3x8 équipe 3",
  // Journée reste Journée
};

async function main() {
  console.log("🔄 Mise à jour des équipes des employés...\n");

  // Récupérer tous les employés avec les anciennes valeurs
  const employees = await p.employee.findMany({
    where: {
      team: {
        in: ["Équipe A", "Équipe B", "Équipe C"],
      },
    },
    select: { id: true, firstName: true, lastName: true, team: true },
  });

  console.log(`📋 ${employees.length} employés à mettre à jour\n`);

  for (const emp of employees) {
    const newTeam = TEAM_MAPPING[emp.team];
    if (newTeam) {
      await p.employee.update({
        where: { id: emp.id },
        data: { team: newTeam },
      });
      console.log(
        `✅ ${emp.firstName} ${emp.lastName}: ${emp.team} → ${newTeam}`,
      );
    }
  }

  console.log("\n✨ Mise à jour terminée !");
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());
