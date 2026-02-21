import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

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

    const workbook = XLSX.utils.book_new();

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
      "Type contrat",
      "Coût horaire (€)",
      "Heures/jour",
      "Date visite médicale (JJ/MM/AAAA)",
      "Actif (OUI/NON)",
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
      "CDI",
      "25",
      "7",
      "15/03/2026",
      "OUI",
    ];
    const employeesSheet = XLSX.utils.aoa_to_sheet([
      employeesHeader,
      employeesExample,
    ]);
    // Largeur des colonnes
    employeesSheet["!cols"] = employeesHeader.map((h) => ({
      wch: Math.max(h.length + 2, 18),
    }));
    XLSX.utils.book_append_sheet(workbook, employeesSheet, "Employés");

    // ── Onglet 2 : Types de formation ──
    const formationsHeader = [
      "Nom formation*",
      "Catégorie",
      "Service",
      "Validité (mois)",
      "Durée (heures)",
      "Durée (jours)",
      "Min participants",
      "Max participants",
      "Mode (PRESENTIEL/DISTANCIEL/MIXTE)",
      "Obligation légale (OUI/NON)",
      "Priorité renouvellement (1-10)",
      "Coût estimé/personne (€)",
      "Coût estimé/session (€)",
      "Actif (OUI/NON)",
    ];
    const formationsExample = [
      "Habilitation électrique B0-H0V",
      "Sécurité électrique",
      "Maintenance",
      "36",
      "14",
      "2",
      "4",
      "12",
      "PRESENTIEL",
      "OUI",
      "8",
      "350",
      "3500",
      "OUI",
    ];
    const formationsSheet = XLSX.utils.aoa_to_sheet([
      formationsHeader,
      formationsExample,
    ]);
    formationsSheet["!cols"] = formationsHeader.map((h) => ({
      wch: Math.max(h.length + 2, 18),
    }));
    XLSX.utils.book_append_sheet(workbook, formationsSheet, "Formations");

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
    const certificatesSheet = XLSX.utils.aoa_to_sheet([
      certificatesHeader,
      certificatesExample,
    ]);
    certificatesSheet["!cols"] = certificatesHeader.map((h) => ({
      wch: Math.max(h.length + 2, 20),
    }));
    XLSX.utils.book_append_sheet(workbook, certificatesSheet, "Certificats");

    // ── Onglet 4 : Instructions ──
    const instructions = [
      ["=== TEMPLATE IMPORT CERTPILOT ==="],
      [""],
      ["INSTRUCTIONS GÉNÉRALES :"],
      [
        "1. Remplissez les onglets Employés, Formations et/ou Certificats selon vos besoins.",
      ],
      ["2. Les colonnes marquées d'un astérisque (*) sont obligatoires."],
      [
        "3. Vous pouvez importer un seul onglet à la fois ou tous en même temps.",
      ],
      [
        "4. La première ligne de chaque onglet contient les en-têtes — ne la modifiez pas.",
      ],
      [
        "5. La deuxième ligne contient un exemple — supprimez-la avant l'import.",
      ],
      [""],
      ["FORMAT DES DATES :"],
      ["  - Utilisez le format JJ/MM/AAAA (ex: 15/03/2026)"],
      [""],
      ["ONGLET EMPLOYÉS :"],
      ["  - Le Matricule doit être unique par employé."],
      [
        "  - Si un matricule existe déjà, l'employé sera mis à jour (pas de doublon).",
      ],
      ["  - Manager (matricule) : indiquez le matricule d'un autre employé."],
      ["  - Actif : OUI ou NON (par défaut OUI si vide)."],
      [""],
      ["ONGLET FORMATIONS :"],
      [
        "  - Le Nom formation doit être unique. S'il existe déjà, il sera mis à jour.",
      ],
      ["  - Validité (mois) : laissez vide si la formation n'expire pas."],
      ["  - Mode : PRESENTIEL, DISTANCIEL ou MIXTE."],
      [""],
      ["ONGLET CERTIFICATS :"],
      [
        "  - Le Matricule employé doit correspondre à un employé existant ou présent dans l'onglet Employés.",
      ],
      [
        "  - Le Nom formation doit correspondre à une formation existante ou présente dans l'onglet Formations.",
      ],
      ["  - Date expiration : laissez vide si la formation n'expire pas."],
    ];
    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions);
    instructionsSheet["!cols"] = [{ wch: 90 }];
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instructions");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

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
