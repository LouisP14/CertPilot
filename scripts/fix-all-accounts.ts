import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function fixAllAccounts() {
  console.log("🔧 CORRECTION DE TOUS LES COMPTES\n");

  try {
    // 1. Réinitialiser le compte ADMIN
    console.log("1️⃣ Compte ADMIN...");
    const adminHashedPassword = await bcrypt.hash("Admin123!", 10);

    await prisma.user.upsert({
      where: { email: "admin@passeport-formation.fr" },
      update: {
        password: adminHashedPassword,
        mustChangePassword: false,
      },
      create: {
        email: "admin@passeport-formation.fr",
        password: adminHashedPassword,
        name: "Administrateur",
        role: "SUPER_ADMIN",
        mustChangePassword: false,
      },
    });
    console.log("   ✅ admin@passeport-formation.fr / Admin123!");

    // 2. Réinitialiser le compte DEMO
    console.log("\n2️⃣ Compte DEMO...");
    const demoHashedPassword = await bcrypt.hash("demo123!", 10);

    let demoCompany = await prisma.company.findFirst({
      where: { name: "Acme Industries" },
    });

    if (!demoCompany) {
      demoCompany = await prisma.company.create({
        data: {
          name: "Acme Industries",
          alertThresholds: "90,60,30,7",
          adminEmail: "demo@certpilot.fr",
          signatureEnabled: true,
          signatureResponsable: "Marie DURAND",
          signatureTitre: "Responsable Formation",
          subscriptionStatus: "ACTIVE",
          employeeLimit: 100,
        },
      });
      console.log("   ✅ Entreprise Acme Industries créée");
    }

    await prisma.user.upsert({
      where: { email: "demo@certpilot.fr" },
      update: {
        password: demoHashedPassword,
        mustChangePassword: false,
        companyId: demoCompany.id,
      },
      create: {
        email: "demo@certpilot.fr",
        password: demoHashedPassword,
        name: "Marie DURAND",
        role: "ADMIN",
        companyId: demoCompany.id,
        mustChangePassword: false,
      },
    });
    console.log("   ✅ demo@certpilot.fr / demo123!");

    // 3. Tester les mots de passe
    console.log("\n🧪 TEST DES MOTS DE PASSE:");

    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@passeport-formation.fr" },
    });

    const demoUser = await prisma.user.findUnique({
      where: { email: "demo@certpilot.fr" },
    });

    if (adminUser) {
      const adminTest = await bcrypt.compare("Admin123!", adminUser.password);
      console.log(
        `\n   ADMIN: ${adminTest ? "✅ Fonctionne" : "❌ Ne fonctionne PAS"}`,
      );
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Rôle: ${adminUser.role}`);
    }

    if (demoUser) {
      const demoTest = await bcrypt.compare("demo123!", demoUser.password);
      console.log(
        `\n   DEMO: ${demoTest ? "✅ Fonctionne" : "❌ Ne fonctionne PAS"}`,
      );
      console.log(`   Email: ${demoUser.email}`);
      console.log(`   Rôle: ${demoUser.role}`);
      console.log(`   CompanyId: ${demoUser.companyId}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("\n✅ COMPTES CORRIGÉS ET TESTÉS");
    console.log("\n🔑 UTILISEZ CES IDENTIFIANTS:");
    console.log("   ADMIN: admin@passeport-formation.fr / Admin123!");
    console.log("   DEMO:  demo@certpilot.fr / demo123!");
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllAccounts();
