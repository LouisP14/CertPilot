import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixDemoAccount() {
  console.log("🔧 Vérification du compte démo...");

  try {
    const user = await prisma.user.findUnique({
      where: { email: "demo@certpilot.fr" },
    });

    if (!user) {
      console.log("❌ Compte démo introuvable !");
      console.log("Utilisateurs existants:");
      const users = await prisma.user.findMany({
        select: { email: true, mustChangePassword: true },
      });
      console.log(users);
    } else {
      console.log("✅ Compte trouvé:", user.email);
      console.log("   mustChangePassword:", user.mustChangePassword);

      if (user.mustChangePassword) {
        const result = await prisma.user.update({
          where: { email: "demo@certpilot.fr" },
          data: { mustChangePassword: false },
        });
        console.log("✅ Compte mis à jour !");
      }
    }
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDemoAccount();
