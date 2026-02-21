import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: "poulain.louis12@gmail.com" },
    select: { companyId: true },
  });

  if (!user?.companyId) {
    console.log("Utilisateur non trouvé");
    return;
  }

  console.log("CompanyId:", user.companyId);

  // Lister les formations
  const formations = await prisma.formationType.findMany({
    where: { companyId: user.companyId },
    select: {
      id: true,
      name: true,
      isActive: true,
      _count: { select: { certificates: true } },
    },
  });

  console.log(`\n${formations.length} formations trouvées :\n`);
  for (const f of formations) {
    console.log(
      `  - ${f.name} | active: ${f.isActive} | certificats: ${f._count.certificates}`,
    );
  }

  // Supprimer les certificats liés
  const certResult = await prisma.certificate.deleteMany({
    where: {
      formationType: { companyId: user.companyId },
    },
  });
  console.log(`\n${certResult.count} certificat(s) supprimé(s)`);

  // Supprimer les besoins de formation liés
  const needsResult = await prisma.trainingNeed.deleteMany({
    where: {
      formationType: { companyId: user.companyId },
    },
  });
  console.log(`${needsResult.count} besoin(s) de formation supprimé(s)`);

  // Supprimer les formations
  const formResult = await prisma.formationType.deleteMany({
    where: { companyId: user.companyId },
  });
  console.log(`${formResult.count} formation(s) supprimée(s)`);

  console.log("\nTerminé !");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
