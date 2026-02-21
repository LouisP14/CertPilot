import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: "poulain.louis12@gmail.com" },
  });
  if (!user) {
    console.log("User not found");
    return;
  }
  const companyId = user.companyId;
  console.log("CompanyId:", companyId);

  const empCount = await prisma.employee.count({ where: { companyId } });
  const ftCount = await prisma.formationType.count({ where: { companyId } });
  const certCount = await prisma.certificate.count({
    where: { employee: { companyId } },
  });
  console.log(
    `Avant: ${empCount} employés, ${ftCount} formations, ${certCount} certificats`,
  );

  const delCerts = await prisma.certificate.deleteMany({
    where: { employee: { companyId } },
  });
  console.log("Certificats supprimés:", delCerts.count);

  const delEmps = await prisma.employee.deleteMany({ where: { companyId } });
  console.log("Employés supprimés:", delEmps.count);

  const delFt = await prisma.formationType.deleteMany({
    where: { companyId },
  });
  console.log("Formations supprimées:", delFt.count);

  const delRefs = await prisma.referenceData.deleteMany({
    where: { companyId },
  });
  console.log("Référentiels supprimés:", delRefs.count);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
