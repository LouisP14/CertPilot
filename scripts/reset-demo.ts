import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function resetDemoAccount() {
  console.log("🔄 Réinitialisation du compte DEMO...\n");

  try {
    // Réinitialiser le mot de passe du compte demo
    const hashedPassword = await bcrypt.hash("demo123!", 10);

    const user = await prisma.user.update({
      where: { email: "demo@certpilot.fr" },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    console.log("✅ Compte DEMO réinitialisé avec succès!");
    console.log(`   Email: ${user.email}`);
    console.log(`   Mot de passe: demo123!`);
    console.log(`   Rôle: ${user.role}`);
    console.log("\n🔗 Connectez-vous à: http://localhost:3000/login");
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDemoAccount();
