import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Assignation d'une entreprise au SUPER_ADMIN...\n");

  // Créer une entreprise pour le SUPER_ADMIN s'il n'en a pas
  let company = await prisma.company.findFirst({
    where: { name: "CertPilot Admin" },
  });
  if (!company) {
    company = await prisma.company.create({
      data: {
        id: "certpilot-admin",
        name: "CertPilot Admin",
        adminEmail: "admin@passeport-formation.fr",
        subscriptionStatus: "active",
      },
    });
    console.log("✅ Créé entreprise CertPilot Admin");
  } else {
    console.log("📌 Entreprise CertPilot Admin existe déjà");
  }

  // Mettre à jour l'utilisateur admin
  const admin = await prisma.user.findUnique({
    where: { email: "admin@passeport-formation.fr" },
  });
  if (admin && !admin.companyId) {
    await prisma.user.update({
      where: { email: "admin@passeport-formation.fr" },
      data: { companyId: company.id },
    });
    console.log("✅ Admin assigné à:", company.name);
  } else if (admin?.companyId) {
    console.log("📌 Admin déjà assigné à une entreprise:", admin.companyId);
  }

  // Migrer les logs sans companyId vers cette entreprise
  const updated = await prisma.auditLog.updateMany({
    where: { companyId: null },
    data: { companyId: company.id },
  });
  console.log(`✅ ${updated.count} logs d'audit migrés vers CertPilot Admin`);

  console.log("\n✅ Terminé!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
