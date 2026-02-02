import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateData() {
  console.log("🔄 MIGRATION DES DONNÉES VERS LES BONNES ENTREPRISES\n");
  console.log("=".repeat(60));

  try {
    // 1. Vérifier les entreprises et utilisateurs
    const companies = await prisma.company.findMany({
      include: {
        users: true,
        _count: {
          select: {
            employees: true,
            formationTypes: true,
          },
        },
      },
    });

    console.log("\n📊 ENTREPRISES EXISTANTES:\n");
    for (const company of companies) {
      console.log(`\n🏢 ${company.name} (ID: ${company.id})`);
      console.log(`   - Employés: ${company._count.employees}`);
      console.log(`   - Formations: ${company._count.formationTypes}`);
      console.log(
        `   - Utilisateurs: ${company.users.map((u) => u.email).join(", ") || "Aucun"}`,
      );
    }

    // 2. Migrer les AuditLogs orphelins vers les companyId des utilisateurs
    console.log("\n\n🔄 MIGRATION DES AUDIT LOGS...");

    const auditLogsWithoutCompany = await prisma.auditLog.findMany({
      where: { companyId: null },
      select: { id: true, userId: true, userEmail: true },
    });

    console.log(
      `   Trouvé ${auditLogsWithoutCompany.length} audit logs sans companyId`,
    );

    for (const log of auditLogsWithoutCompany) {
      if (log.userId) {
        const user = await prisma.user.findUnique({
          where: { id: log.userId },
          select: { companyId: true },
        });

        if (user?.companyId) {
          await prisma.auditLog.update({
            where: { id: log.id },
            data: { companyId: user.companyId },
          });
        }
      } else if (log.userEmail) {
        const user = await prisma.user.findUnique({
          where: { email: log.userEmail },
          select: { companyId: true },
        });

        if (user?.companyId) {
          await prisma.auditLog.update({
            where: { id: log.id },
            data: { companyId: user.companyId },
          });
        }
      }
    }

    console.log("   ✅ Audit logs migrés");

    // 3. Afficher le résultat final
    console.log("\n\n📊 RÉSULTAT FINAL:\n");

    for (const company of companies) {
      const [employees, formations, certificates, convocations, auditLogs] =
        await Promise.all([
          prisma.employee.count({ where: { companyId: company.id } }),
          prisma.formationType.count({ where: { companyId: company.id } }),
          prisma.certificate.count({
            where: { employee: { companyId: company.id } },
          }),
          prisma.convocation.count({ where: { companyId: company.id } }),
          prisma.auditLog.count({ where: { companyId: company.id } }),
        ]);

      console.log(`\n🏢 ${company.name}`);
      console.log(`   - Employés: ${employees}`);
      console.log(`   - Formations: ${formations}`);
      console.log(`   - Certificats: ${certificates}`);
      console.log(`   - Convocations: ${convocations}`);
      console.log(`   - Audit Logs: ${auditLogs}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("\n✅ MIGRATION TERMINÉE");
    console.log("   Chaque entreprise a maintenant ses données isolées ! 🔒");
  } catch (error) {
    console.error("\n❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();
