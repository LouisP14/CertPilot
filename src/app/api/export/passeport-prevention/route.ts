import { auditExportPdf } from "@/lib/audit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Export au format CSV officiel du Passeport de Prévention
// Spec : "Passeport de prévention | Employeurs - Préparer ses fichiers pour l'alimentation en masse
//         des attestations de formation" (Caisse des Dépôts, v. 27/02/2026)
//
// Format : séparateur `|`, UTF-8, 20 colonnes dans un ordre strict
// Obligations employeur : depuis le 16 mars 2026 (décret n° 2025-748)

const CSV_HEADERS = [
  "ID_DECLARATION",
  "REFERENCE_DECLARATION",
  "ID_UNIQUE_PARTENAIRE",
  "NOM_FORMATION",
  "DATE_DEBUT_FORMATION",
  "DATE_FIN_FORMATION",
  "MODALITE_DISPENSE",
  "COMPETENCE_TRANSFERABLE",
  "QUALIFICATION_FORMATEUR",
  "FORMATION_CERTIFIANTE",
  "CERTIFICATION_VISEE",
  "DOMAINE_FORMATION",
  "SPECIALITE_FORMATION",
  "NIR",
  "NOM_TITULAIRE",
  "PRESENCE_EMPLOYEUR",
  "SIRET_EMPLOYEUR",
  "REFERENCE_EMPLOYEUR",
  "DATE_DEBUT_VALIDITE",
  "DATE_FIN_VALIDITE",
] as const;

function formatDateFr(date: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function mapTrainingMode(mode: string | null | undefined): string {
  if (!mode) return "";
  const upper = mode.toUpperCase();
  if (upper === "PRESENTIEL") return "PRESENTIEL";
  if (upper === "DISTANCIEL" || upper === "A_DISTANCE") return "A_DISTANCE";
  if (upper === "MIXTE") return "MIXTE";
  return "";
}

function sanitizeCsvField(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  // Remplacer tous les séparateurs `|` par `-` pour éviter de casser le format
  return String(value).replace(/\|/g, "-").trim();
}

function buildDeclarationId(params: {
  formationName: string;
  startDate: Date;
  certificateId: string;
}): string {
  const dateStr = formatDateFr(params.startDate).replace(/\//g, "");
  const slug = params.formationName
    .replace(/[^a-zA-Z0-9]/g, "_")
    .substring(0, 40);
  const shortId = params.certificateId.substring(0, 8);
  return `${slug}_${dateStr}_${shortId}`.substring(0, 255);
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    if (session.user.role === "MANAGER") {
      return NextResponse.json(
        { error: "Accès en lecture seule" },
        { status: 403 },
      );
    }

    const companyId = session.user.companyId;
    const { searchParams } = new URL(request.url);
    const statsOnly = searchParams.get("stats") === "1";

    // Période : year + trimestre (optionnels)
    const year = searchParams.get("year");
    const trimestre = searchParams.get("trimestre"); // Q1 | Q2 | Q3 | Q4

    let dateFilter: { gte?: Date; lte?: Date } | undefined;
    if (year) {
      const y = parseInt(year);
      if (trimestre) {
        const trimMap: Record<string, [number, number]> = {
          Q1: [0, 2],
          Q2: [3, 5],
          Q3: [6, 8],
          Q4: [9, 11],
        };
        const [startMonth, endMonth] = trimMap[trimestre] || [0, 11];
        dateFilter = {
          gte: new Date(y, startMonth, 1),
          lte: new Date(y, endMonth + 1, 0, 23, 59, 59),
        };
      } else {
        dateFilter = {
          gte: new Date(y, 0, 1),
          lte: new Date(y, 11, 31, 23, 59, 59),
        };
      }
    }

    // Si mode stats uniquement, retourner un JSON avec les compteurs (pour l'UI)
    if (statsOnly) {
      const [total, exportableCount, employeesWithoutNir] = await Promise.all([
        prisma.certificate.count({
          where: {
            isArchived: false,
            employee: { companyId, isActive: true },
            formationType: { isConcernedPP: true },
            ...(dateFilter && { obtainedDate: dateFilter }),
          },
        }),
        prisma.certificate.count({
          where: {
            isArchived: false,
            employee: {
              companyId,
              isActive: true,
              nir: { not: null },
            },
            formationType: { isConcernedPP: true },
            ...(dateFilter && { obtainedDate: dateFilter }),
          },
        }),
        prisma.employee.count({
          where: {
            companyId,
            isActive: true,
            nir: null,
            certificates: {
              some: {
                isArchived: false,
                formationType: { isConcernedPP: true },
                ...(dateFilter && { obtainedDate: dateFilter }),
              },
            },
          },
        }),
      ]);

      return NextResponse.json({
        totalConcerned: total,
        exportable: exportableCount,
        skipped: total - exportableCount,
        employeesWithoutNir,
      });
    }

    // Récupérer les certificats concernés par le Passeport Prévention
    const certificates = await prisma.certificate.findMany({
      where: {
        isArchived: false,
        employee: { companyId, isActive: true },
        formationType: { isConcernedPP: true },
        ...(dateFilter && { obtainedDate: dateFilter }),
      },
      include: {
        employee: {
          select: {
            id: true,
            lastName: true,
            firstName: true,
            birthName: true,
            nir: true,
            employeeId: true,
          },
        },
        formationType: {
          select: {
            name: true,
            isCertifiante: true,
            certificationCode: true,
            formacodes: true,
            nsfCodes: true,
            romeCodes: true,
            trainingMode: true,
          },
        },
      },
      orderBy: [{ obtainedDate: "asc" }, { id: "asc" }],
    });

    // Filtrer : on ne peut déclarer que les certificats avec NIR + nom de naissance
    const exportable = certificates.filter(
      (c) => c.employee.nir && (c.employee.birthName || c.employee.lastName),
    );

    // Construire le CSV
    const lines: string[] = [CSV_HEADERS.join("|")];

    for (const cert of exportable) {
      const startDate = cert.trainingStartDate || cert.obtainedDate;
      const endDate = cert.obtainedDate;
      const nomTitulaire = cert.employee.birthName || cert.employee.lastName;

      const declId = buildDeclarationId({
        formationName: cert.formationType.name,
        startDate,
        certificateId: cert.id,
      });

      const isCert = cert.formationType.isCertifiante;
      const formationCertifiante =
        isCert === true ? "OUI" : isCert === false ? "NON" : "";

      const row = [
        declId, // ID_DECLARATION
        `REF_${cert.id.substring(0, 20)}`, // REFERENCE_DECLARATION
        `${cert.employee.id.substring(0, 12)}_${cert.id.substring(0, 12)}`, // ID_UNIQUE_PARTENAIRE
        sanitizeCsvField(cert.formationType.name), // NOM_FORMATION
        formatDateFr(startDate), // DATE_DEBUT_FORMATION
        formatDateFr(endDate), // DATE_FIN_FORMATION
        mapTrainingMode(
          cert.trainingMode || cert.formationType.trainingMode,
        ), // MODALITE_DISPENSE
        sanitizeCsvField(cert.formationType.romeCodes), // COMPETENCE_TRANSFERABLE
        sanitizeCsvField(cert.trainerQualification), // QUALIFICATION_FORMATEUR
        formationCertifiante, // FORMATION_CERTIFIANTE
        isCert === true
          ? sanitizeCsvField(cert.formationType.certificationCode)
          : "", // CERTIFICATION_VISEE
        isCert === false
          ? sanitizeCsvField(cert.formationType.formacodes)
          : "", // DOMAINE_FORMATION
        isCert === false
          ? sanitizeCsvField(cert.formationType.nsfCodes)
          : "", // SPECIALITE_FORMATION
        sanitizeCsvField(cert.employee.nir), // NIR
        sanitizeCsvField(nomTitulaire), // NOM_TITULAIRE
        "", // PRESENCE_EMPLOYEUR (vide pour employeur)
        "", // SIRET_EMPLOYEUR (vide pour employeur)
        sanitizeCsvField(cert.ppDeclarationRef), // REFERENCE_EMPLOYEUR
        formatDateFr(endDate), // DATE_DEBUT_VALIDITE
        formatDateFr(cert.expiryDate), // DATE_FIN_VALIDITE
      ];

      lines.push(row.join("|"));
    }

    const csvContent = lines.join("\n");

    // Audit
    await auditExportPdf(
      "CERTIFICATE",
      companyId,
      `Export CSV Passeport Prévention - ${exportable.length} déclaration(s) sur ${certificates.length} concernée(s)`,
      session.user
        ? {
            id: session.user.id,
            name: session.user.name || undefined,
            email: session.user.email || undefined,
            companyId,
          }
        : null,
    );

    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const periodPart = year ? `_${year}${trimestre ? `_${trimestre}` : ""}` : "";
    const filename = `passeport-prevention-adf${periodPart}_${dateStr}.csv`;

    // Le CSV doit être UTF-8 (sans BOM, car la spec ne le mentionne pas)
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-PP-Total-Concerned": String(certificates.length),
        "X-PP-Exportable": String(exportable.length),
        "X-PP-Skipped": String(certificates.length - exportable.length),
      },
    });
  } catch (error) {
    console.error("Export Passeport Prévention error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du CSV" },
      { status: 500 },
    );
  }
}
