import { auth } from "@/lib/auth";
import ExcelJS from "exceljs";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * GET /api/import/template
 * Génère et télécharge le template Excel CertPilot à remplir par le client.
 * 3 onglets : Employés, Formations, Certificats
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const workbook = new ExcelJS.Workbook();

    // ── Onglet 1 : Employés ──
    const employeesHeader = [
      "Matricule*",
      "Nom*",
      "Prénom*",
      "Email",
      "Fonction*",
      "Service*",
      "Site",
      "Équipe",
      "Manager (matricule)",
      "Email manager",
      "Date visite médicale (JJ/MM/AAAA)",
    ];
    const employeesExample = [
      "MAT001",
      "Dupont",
      "Jean",
      "jean.dupont@email.com",
      "Technicien de maintenance",
      "Maintenance",
      "Rouen",
      "Équipe A",
      "MAT000",
      "chef@email.com",
      "15/03/2026",
    ];
    const employeesSheet = workbook.addWorksheet("Employés");
    employeesSheet.columns = employeesHeader.map((h) => ({
      header: h,
      key: h,
      width: Math.max(h.length + 2, 18),
    }));
    employeesSheet.addRow(employeesExample);

    // ── Onglet 2 : Types de formation ──
    const formationsHeader = [
      "Nom formation*",
      "Catégorie",
      "Service",
      "Validité (mois)",
    ];
    const formationsExample = [
      "Habilitation électrique B0-H0V",
      "Sécurité électrique",
      "Maintenance",
      "36",
    ];
    const formationsSheet = workbook.addWorksheet("Formations");
    formationsSheet.columns = formationsHeader.map((h) => ({
      header: h,
      key: h,
      width: Math.max(h.length + 2, 18),
    }));
    formationsSheet.addRow(formationsExample);

    // ── Onglet 3 : Certificats ──
    const certificatesHeader = [
      "Matricule employé*",
      "Nom formation*",
      "Date obtention* (JJ/MM/AAAA)",
      "Date expiration (JJ/MM/AAAA)",
      "Organisme",
      "Détails",
    ];
    const certificatesExample = [
      "MAT001",
      "Habilitation électrique B0-H0V",
      "15/01/2024",
      "15/01/2027",
      "AFPA Rouen",
      "B0 H0V",
    ];
    const certificatesSheet = workbook.addWorksheet("Certificats");
    certificatesSheet.columns = certificatesHeader.map((h) => ({
      header: h,
      key: h,
      width: Math.max(h.length + 2, 20),
    }));
    certificatesSheet.addRow(certificatesExample);

    // ── Onglet 4 : Instructions ──
    const instructionsSheet = workbook.addWorksheet("Instructions");
    instructionsSheet.getColumn(1).width = 90;
    const instructionLines = [
      ["=== TEMPLATE IMPORT CERTPILOT ==="],
      [""],
      ["INSTRUCTIONS GÉNÉRALES :"],
      ["1. Remplissez les onglets Employés, Formations et/ou Certificats selon vos besoins."],
      ["2. Les colonnes marquées d'un astérisque (*) sont obligatoires."],
      ["3. Vous pouvez importer un seul onglet à la fois ou tous en même temps."],
      ["4. La première ligne de chaque onglet contient les en-têtes — ne la modifiez pas."],
      ["5. La deuxième ligne contient un exemple — supprimez-la avant l'import."],
      [""],
      ["FORMAT DES DATES :"],
      ["  - Utilisez le format JJ/MM/AAAA (ex: 15/03/2026)"],
      [""],
      ["ONGLET EMPLOYÉS :"],
      ["  - Le Matricule doit être unique par employé."],
      ["  - Si un matricule existe déjà, l'employé sera mis à jour (pas de doublon)."],
      ["  - Manager (matricule) : indiquez le matricule d'un autre employé."],
      [""],
      ["ONGLET FORMATIONS :"],
      ["  - Le Nom formation doit être unique. S'il existe déjà, il sera mis à jour."],
      ["  - Validité (mois) : laissez vide si la formation n'expire pas."],
      [""],
      ["ONGLET CERTIFICATS :"],
      ["  - Le Matricule employé doit correspondre à un employé existant ou présent dans l'onglet Employés."],
      ["  - Le Nom formation doit correspondre à une formation existante ou présente dans l'onglet Formations."],
      ["  - Date expiration : laissez vide si la formation n'expire pas."],
    ];
    for (const line of instructionLines) {
      instructionsSheet.addRow(line);
    }

    const buffer = await workbook.xlsx.writeBuffer();

    const datePart = new Date().toISOString().split("T")[0];

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="certpilot-template-import-${datePart}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Template generation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du template" },
      { status: 500 },
    );
  }
}
