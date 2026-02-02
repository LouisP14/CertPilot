import { PrismaClient } from "@prisma/client";
import * as readline from "readline";

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function transferData() {
  console.log("🔄 TRANSFERT DES DONNÉES ENTRE ENTREPRISES\n");
  console.log("=".repeat(60));

  try {
    // 1. Afficher les entreprises
    const companies = await prisma.company.findMany({
      include: {
        users: true,
        _count: {
          select: { employees: true, formationTypes: true },
        },
      },
    });

    console.log("\n📊 ENTREPRISES DISPONIBLES:\n");
    companies.forEach((company, index) => {
      console.log(`\n${index + 1}. ${company.name} (ID: ${company.id})`);
      console.log(`   - Employés: ${company._count.employees}`);
      console.log(`   - Formations: ${company._count.formationTypes}`);
      console.log(
        `   - Utilisateurs: ${company.users.map((u) => u.email).join(", ") || "Aucun"}`,
      );
    });

    // 2. Demander le transfert
    console.log("\n" + "=".repeat(60));
    console.log(
      "\nℹ️  L'entreprise 'CertPilot' (default) contient toutes vos données existantes",
    );
    console.log("   mais n'a aucun utilisateur associé.");
    console.log("\n🎯 OPTIONS:");
    console.log("   1. Transférer vers Aptar Pharma Brécey (votre entreprise)");
    console.log("   2. Transférer vers Acme Industries (compte DEMO)");
    console.log("   3. Laisser dans CertPilot");
    console.log("   4. Supprimer l'entreprise CertPilot (après transfert)");
    console.log("   5. Annuler");

    const choice = await question("\nVotre choix (1-5): ");

    let targetCompanyId: string | null = null;

    switch (choice.trim()) {
      case "1":
        targetCompanyId =
          companies.find((c) => c.name === "Aptar Pharma Brécey")?.id || null;
        break;
      case "2":
        targetCompanyId =
          companies.find((c) => c.name === "Acme Industries")?.id || null;
        break;
      case "3":
        console.log("\n✅ Données laissées dans CertPilot");
        rl.close();
        return;
      case "5":
        console.log("\n❌ Opération annulée");
        rl.close();
        return;
    }

    if (!targetCompanyId) {
      console.log("\n❌ Entreprise cible invalide");
      rl.close();
      return;
    }

    console.log("\n🔄 Transfert en cours...");

    // 3. Transférer les employés
    const employeesUpdated = await prisma.employee.updateMany({
      where: { companyId: "default" },
      data: { companyId: targetCompanyId },
    });
    console.log(`   ✅ ${employeesUpdated.count} employés transférés`);

    // 4. Transférer les formations
    const formationsUpdated = await prisma.formationType.updateMany({
      where: { companyId: "default" },
      data: { companyId: targetCompanyId },
    });
    console.log(`   ✅ ${formationsUpdated.count} formations transférées`);

    // 5. Transférer les training centers
    const centersUpdated = await prisma.trainingCenter.updateMany({
      where: { companyId: "default" },
      data: { companyId: targetCompanyId },
    });
    console.log(
      `   ✅ ${centersUpdated.count} centres de formation transférés`,
    );

    // 6. Transférer les sessions
    const sessionsUpdated = await prisma.trainingSession.updateMany({
      where: { companyId: "default" },
      data: { companyId: targetCompanyId },
    });
    console.log(`   ✅ ${sessionsUpdated.count} sessions transférées`);

    // 7. Si choix 4, supprimer CertPilot
    if (choice.trim() === "4") {
      await prisma.company.delete({ where: { id: "default" } });
      console.log(`   ✅ Entreprise CertPilot supprimée`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ TRANSFERT TERMINÉ !\n");

    // Afficher le résultat
    const targetCompany = companies.find((c) => c.id === targetCompanyId);
    const [employees, formations, certificates] = await Promise.all([
      prisma.employee.count({ where: { companyId: targetCompanyId } }),
      prisma.formationType.count({ where: { companyId: targetCompanyId } }),
      prisma.certificate.count({
        where: { employee: { companyId: targetCompanyId } },
      }),
    ]);

    console.log(`📦 ${targetCompany?.name} possède maintenant:`);
    console.log(`   - ${employees} employés`);
    console.log(`   - ${formations} formations`);
    console.log(`   - ${certificates} certificats`);
  } catch (error) {
    console.error("\n❌ Erreur:", error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

transferData();
