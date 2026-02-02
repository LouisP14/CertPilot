import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUsers() {
  console.log("🔍 Vérification des utilisateurs...\n");

  try {
    // Récupérer tous les utilisateurs
    const users = await prisma.user.findMany({
      include: {
        company: true,
      },
    });

    if (users.length === 0) {
      console.log("❌ Aucun utilisateur trouvé dans la base de données!");
      return;
    }

    console.log(`✅ ${users.length} utilisateur(s) trouvé(s):\n`);

    for (const user of users) {
      console.log("---");
      console.log(`Email: ${user.email}`);
      console.log(`Nom: ${user.name}`);
      console.log(`Rôle: ${user.role}`);
      console.log(`Company ID: ${user.companyId || "❌ AUCUNE"}`);
      console.log(`Company Name: ${user.company?.name || "❌ AUCUNE"}`);
      console.log(`Must Change Password: ${user.mustChangePassword}`);
      console.log(`Created At: ${user.createdAt}`);
    }

    console.log("\n---\n");
    console.log("🔑 Identifiants disponibles:");
    console.log("DEMO: demo@certpilot.fr / demo123!");
    console.log("ADMIN: admin@passeport-formation.fr / Admin123!");
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
