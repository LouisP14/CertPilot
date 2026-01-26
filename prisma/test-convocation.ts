import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function test() {
  // Test si convocationsSentAt existe
  const session = await prisma.trainingSession.findFirst({
    select: {
      id: true,
      convocationsSentAt: true,
      formationType: { select: { name: true } },
    },
  });

  console.log("Session trouvée:", session);

  // Tester la mise à jour
  if (session) {
    const updated = await prisma.trainingSession.update({
      where: { id: session.id },
      data: { convocationsSentAt: new Date() },
    });
    console.log("Mise à jour OK:", updated.convocationsSentAt);
  }
}

test()
  .catch((e) => {
    console.error("ERREUR:", e);
  })
  .finally(() => prisma.$disconnect());
