import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function testCredentials() {
  console.log("🔐 Test des identifiants de connexion\n");

  const credentials = [
    { email: "demo@certpilot.fr", password: "demo123!", name: "DEMO" },
    {
      email: "admin@passeport-formation.fr",
      password: "Admin123!",
      name: "ADMIN",
    },
    {
      email: "admin@certpilot.fr",
      password: "Admin123!",
      name: "ADMIN 2",
    },
  ];

  for (const cred of credentials) {
    console.log(`\n--- Test ${cred.name} ---`);
    console.log(`Email: ${cred.email}`);
    console.log(`Mot de passe: ${cred.password}`);

    try {
      const user = await prisma.user.findUnique({
        where: { email: cred.email },
        include: { company: true },
      });

      if (!user) {
        console.log("❌ Utilisateur non trouvé");
        continue;
      }

      const isPasswordValid = await bcrypt.compare(
        cred.password,
        user.password,
      );

      if (isPasswordValid) {
        console.log("✅ Mot de passe correct");
        console.log(`   Rôle: ${user.role}`);
        console.log(`   CompanyId: ${user.companyId || "❌ Aucune"}`);
        console.log(`   Company: ${user.company?.name || "❌ Aucune"}`);
        console.log(
          `   Must Change Password: ${user.mustChangePassword ? "Oui" : "Non"}`,
        );
      } else {
        console.log("❌ Mot de passe incorrect");
      }
    } catch (error) {
      console.error("❌ Erreur:", error);
    }
  }

  await prisma.$disconnect();
}

testCredentials();
