import { promises as fs } from "fs";
import path from "path";

// Routes API à vérifier
const apiDir = "src/app/api";

// Patterns dangereux qui indiquent un manque de filtre
const dangerousPatterns = [
  /prisma\.\w+\.findMany\s*\(\s*\{[^}]*where:\s*\{[^}]*\}/g,
  /prisma\.\w+\.findFirst\s*\(\s*\{[^}]*where:\s*\{[^}]*\}/g,
  /prisma\.\w+\.count\s*\(\s*\{[^}]*where:\s*\{[^}]*\}/g,
];

// Mots-clés de sécurité qui devraient être présents
const securityKeywords = ["companyId", "getCompanyFilter", "SUPER_ADMIN"];

async function* walk(dir: string): AsyncGenerator<string> {
  const files = await fs.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      if (file.name !== "node_modules" && file.name !== ".next") {
        yield* walk(filePath);
      }
    } else if (file.name.endsWith(".ts") || file.name.endsWith(".tsx")) {
      yield filePath;
    }
  }
}

async function checkFile(filePath: string) {
  const content = await fs.readFile(filePath, "utf-8");
  const issues: string[] = [];

  // Vérifier si c'est une route API
  if (!filePath.includes("src/app/api")) {
    return null;
  }

  // Ignorer les fichiers de types
  if (filePath.includes(".d.ts")) {
    return null;
  }

  // Chercher les patterns dangereux
  for (const pattern of dangerousPatterns) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      // Vérifier si le fichier a des protections
      const hasAuth = content.includes("auth()") || content.includes("session");
      const hasCompanyFilter =
        content.includes("companyId") ||
        content.includes("getCompanyFilter") ||
        content.includes("companyFilter");

      if (!hasCompanyFilter) {
        issues.push(
          `⚠️  Requête Prisma sans filtre companyId détectée (${matches.length} occurrence(s))`,
        );
      }

      if (!hasAuth) {
        issues.push(`🔓 Pas d'authentification détectée`);
      }
    }
  }

  if (issues.length > 0) {
    return { file: filePath.replace(/\\/g, "/"), issues };
  }

  return null;
}

async function main() {
  console.log("🔍 Vérification de l'isolation des données par entreprise...\n");

  const problematicFiles: { file: string; issues: string[] }[] = [];

  for await (const file of walk(apiDir)) {
    const result = await checkFile(file);
    if (result) {
      problematicFiles.push(result);
    }
  }

  if (problematicFiles.length === 0) {
    console.log(
      "✅ Aucun problème d'isolation détecté ! Toutes les routes API sont sécurisées.",
    );
  } else {
    console.log(
      `❌ ${problematicFiles.length} fichier(s) avec des problèmes potentiels :\n`,
    );

    for (const { file, issues } of problematicFiles) {
      console.log(`📄 ${file}`);
      for (const issue of issues) {
        console.log(`   ${issue}`);
      }
      console.log();
    }

    console.log(
      "\n⚠️  ATTENTION: Ces fichiers doivent être vérifiés manuellement !",
    );
    console.log(
      "Chaque requête doit filtrer par companyId (sauf SUPER_ADMIN).",
    );
  }
}

main().catch(console.error);
