import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createDemoAccount() {
  console.log("🔧 Création du compte démo...");

  try {
    // Vérifier si le compte existe déjà
    const existing = await prisma.user.findUnique({
      where: { email: "demo@certpilot.fr" },
    });

    if (existing) {
      console.log("✅ Compte démo existe déjà");
      if (existing.mustChangePassword) {
        await prisma.user.update({
          where: { email: "demo@certpilot.fr" },
          data: { mustChangePassword: false },
        });
        console.log("✅ mustChangePassword mis à false");
      }
      return;
    }

    // Trouver ou créer une entreprise démo
    let company = await prisma.company.findFirst({
      where: {
        OR: [{ name: "Acme Industries" }, { adminEmail: "demo@certpilot.fr" }],
      },
    });

    if (!company) {
      company = await prisma.company.create({
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
      console.log("✅ Entreprise démo créée");
    }

    // Créer l'utilisateur
    const hashedPassword = await bcrypt.hash("demo123", 10);
    const user = await prisma.user.create({
      data: {
        email: "demo@certpilot.fr",
        password: hashedPassword,
        name: "Marie DURAND",
        role: "ADMIN",
        companyId: company.id,
        mustChangePassword: false,
      },
    });

    console.log("✅ Compte démo créé:", user.email);
    console.log("   Connexion: demo@certpilot.fr / demo123");
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoAccount();
