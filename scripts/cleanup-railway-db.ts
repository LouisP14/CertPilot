/**
 * Script de nettoyage de la base de données Railway
 * Lance avec: npx tsx scripts/cleanup-railway-db.ts
 */

import pg from "pg";
const { Client } = pg;

const client = new Client({
  host: "hopper.proxy.rlwy.net",
  port: 21710,
  user: "postgres",
  password: "LHESfmvQInTIpDtXIwzhjhQDYphPsGDc",
  database: "railway",
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log("🔌 Connexion à Railway PostgreSQL...");
  await client.connect();
  console.log("✅ Connecté!");

  // D'abord, voir quelles tables existent
  console.log("\n📋 Tables existantes:");
  const tablesResult = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `);
  const tableNames = tablesResult.rows.map((r) => r.table_name);
  console.log(tableNames.join(", "));

  // Vérifier si Company et User existent
  if (!tableNames.includes("Company") || !tableNames.includes("User")) {
    console.log("\n⚠️  Tables Company ou User manquantes!");
    console.log("   Le schéma n'a pas encore été synchronisé.");
    return;
  }

  // Lister les entreprises
  console.log("\n📊 Entreprises:");
  const companies = (await client.query(`SELECT id, name FROM "Company"`)).rows;
  console.log(`${companies.length} entreprise(s) trouvée(s):\n`);

  // Lister les utilisateurs
  const users = (
    await client.query(`SELECT id, email, role, "companyId" FROM "User"`)
  ).rows;

  for (const company of companies) {
    const companyUsers = users.filter((u) => u.companyId === company.id);
    console.log(`  🏢 "${company.name}" (ID: ${company.id})`);
    console.log(
      `     Utilisateurs: ${companyUsers.map((u) => `${u.email} (${u.role})`).join(", ") || "aucun"}`,
    );
  }

  // Identifier les bonnes entreprises
  const adminCompany = companies.find(
    (c) => c.id === "certpilot-main" || c.name === "CertPilot",
  );
  const demoCompany =
    companies.find((c) => c.id === "demo-company") ||
    companies.find(
      (c) =>
        c.id === "entreprise de démonstration" ||
        c.name === "Demo Entreprise" ||
        c.name === "Démo Entreprise" ||
        c.name === "Entreprise Démo",
    );

  const oldCompanies = companies.filter(
    (c) => c.id !== adminCompany?.id && c.id !== demoCompany?.id,
  );

  const finalAdminId = adminCompany?.id || "certpilot-main";
  const finalDemoId = demoCompany?.id || "demo-company";

  console.log(`\n📋 Plan:`);
  console.log(`   ADMIN: ${finalAdminId}`);
  console.log(`   DEMO: ${finalDemoId}`);
  console.log(
    `   À supprimer: ${oldCompanies.map((c) => c.id).join(", ") || "aucune"}`,
  );

  // Réassigner les utilisateurs
  console.log("\n🔄 Réassignation...");
  await client.query(
    `UPDATE "User" SET "companyId" = $1 WHERE email = 'admin@certpilot.fr'`,
    [finalAdminId],
  );
  console.log("   ✅ admin@certpilot.fr → " + finalAdminId);

  await client.query(
    `UPDATE "User" SET "companyId" = $1 WHERE email = 'demo@certpilot.fr'`,
    [finalDemoId],
  );
  console.log("   ✅ demo@certpilot.fr → " + finalDemoId);

  // Migrer les données
  const possibleTables = [
    "AuditLog",
    "Employee",
    "FormationType",
    "ReferenceData",
    "Site",
    "Service",
    "Team",
    "TrainingCenter",
    "Certificate",
    "TrainingNeed",
    "Convocation",
    "Session",
  ];

  for (const oldCompany of oldCompanies) {
    console.log(`\n🔀 Migration depuis "${oldCompany.name}"...`);

    for (const table of possibleTables) {
      if (!tableNames.includes(table)) continue;

      try {
        // Vérifier si companyId existe
        const colCheck = await client.query(
          `
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = $1 AND column_name = 'companyId'
        `,
          [table],
        );

        if (colCheck.rows.length > 0) {
          if (table === "ReferenceData") {
            const updateResult = await client.query(
              `
              UPDATE "ReferenceData" r
              SET "companyId" = $1
              WHERE r."companyId" = $2
                AND NOT EXISTS (
                  SELECT 1 FROM "ReferenceData" t
                  WHERE t."companyId" = $1
                    AND t.type = r.type
                    AND t.value = r.value
                )
            `,
              [finalDemoId, oldCompany.id],
            );

            await client.query(
              `
              DELETE FROM "ReferenceData" r
              WHERE r."companyId" = $2
                AND EXISTS (
                  SELECT 1 FROM "ReferenceData" t
                  WHERE t."companyId" = $1
                    AND t.type = r.type
                    AND t.value = r.value
                )
            `,
              [finalDemoId, oldCompany.id],
            );

            if (updateResult.rowCount && updateResult.rowCount > 0) {
              console.log(`   - ${updateResult.rowCount} ReferenceData migrés`);
            }
          } else {
            const result = await client.query(
              `UPDATE "${table}" SET "companyId" = $1 WHERE "companyId" = $2`,
              [finalDemoId, oldCompany.id],
            );
            if (result.rowCount && result.rowCount > 0) {
              console.log(`   - ${result.rowCount} ${table}(s) migrés`);
            }
          }
        }
      } catch (e) {
        /* ignore */
      }
    }

    // Supprimer utilisateurs orphelins
    await client.query(
      `DELETE FROM "User" WHERE "companyId" = $1 AND email NOT IN ('admin@certpilot.fr', 'demo@certpilot.fr')`,
      [oldCompany.id],
    );
  }

  // Réparer les logs d'audit sans companyId (si possible via userId/userEmail)
  await client.query(`
    UPDATE "AuditLog" l
    SET "companyId" = u."companyId"
    FROM "User" u
    WHERE l."companyId" IS NULL
      AND l."userId" IS NOT NULL
      AND l."userId" = u.id
  `);

  await client.query(`
    UPDATE "AuditLog" l
    SET "companyId" = u."companyId"
    FROM "User" u
    WHERE l."companyId" IS NULL
      AND l."userEmail" IS NOT NULL
      AND l."userEmail" = u.email
  `);

  // Réparer les référentiels sans companyId (attribués à la démo)
  await client.query(
    `
    DELETE FROM "ReferenceData" r
    USING "ReferenceData" t
    WHERE r."companyId" IS NULL
      AND t."companyId" IS NULL
      AND r.type = t.type
      AND r.value = t.value
      AND r.id < t.id
  `,
  );
  await client.query(
    `
    DELETE FROM "ReferenceData" r
    USING "ReferenceData" t
    WHERE r."companyId" IS NULL
      AND t."companyId" = $1
      AND r.type = t.type
      AND r.value = t.value
  `,
    [finalDemoId],
  );
  await client.query(
    `UPDATE "ReferenceData" SET "companyId" = $1 WHERE "companyId" IS NULL`,
    [finalDemoId],
  );

  // Supprimer anciennes entreprises
  console.log("\n🗑️  Suppression...");
  for (const oldCompany of oldCompanies) {
    try {
      await client.query(`DELETE FROM "Company" WHERE id = $1`, [
        oldCompany.id,
      ]);
      console.log(`   ✅ "${oldCompany.name}" supprimée`);
    } catch (e: any) {
      console.log(`   ⚠️  "${oldCompany.name}": ${e.message}`);
    }
  }

  // Vérification finale
  console.log("\n✅ Terminé! État final:\n");
  const finalCompanies = (await client.query(`SELECT id, name FROM "Company"`))
    .rows;
  const finalUsers = (
    await client.query(`SELECT email, "companyId" FROM "User"`)
  ).rows;

  for (const company of finalCompanies) {
    const companyUsers = finalUsers.filter((u) => u.companyId === company.id);
    console.log(`  🏢 "${company.name}" (${company.id})`);
    console.log(
      `     → ${companyUsers.map((u) => u.email).join(", ") || "aucun utilisateur"}`,
    );
  }
}

main()
  .catch((e) => {
    console.error("❌ Erreur:", e);
    process.exit(1);
  })
  .finally(() => client.end());
