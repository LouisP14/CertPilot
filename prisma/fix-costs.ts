import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixSessionCosts() {
  console.log("🔧 Correction des coûts des sessions...\n");

  const sessions = await prisma.trainingSession.findMany({
    include: {
      attendees: {
        include: { employee: true },
      },
    },
  });

  for (const session of sessions) {
    // Calculer la durée en jours
    const startDate = new Date(session.startDate);
    const endDate = new Date(session.endDate);
    const durationDays =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;

    let totalAbsenceCost = 0;

    // Calculer le coût d'absence pour chaque participant
    for (const att of session.attendees) {
      const hourlyCost = att.employee.hourlyCost || 40; // 40€/h par défaut
      const hoursPerDay = att.employee.workingHoursPerDay || 7;
      const absenceCost = hourlyCost * hoursPerDay * durationDays;
      totalAbsenceCost += absenceCost;

      // Mettre à jour le coût d'absence de chaque participant
      await prisma.trainingSessionAttendee.update({
        where: { id: att.id },
        data: { absenceCost },
      });
    }

    // Mettre à jour la session
    const trainingCost = session.trainingCost || 0;
    const totalCost = trainingCost + totalAbsenceCost;

    await prisma.trainingSession.update({
      where: { id: session.id },
      data: {
        totalAbsenceCost,
        totalCost,
      },
    });

    console.log(`✅ Session ${session.id.slice(0, 8)}...`);
    console.log(
      `   Durée: ${durationDays} jour(s), Participants: ${session.attendees.length}`,
    );
    console.log(
      `   Formation: ${trainingCost.toLocaleString()}€ | Absence: ${totalAbsenceCost.toLocaleString()}€ | Total: ${totalCost.toLocaleString()}€\n`,
    );
  }

  console.log("🎉 Tous les coûts ont été mis à jour !");
}

fixSessionCosts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
