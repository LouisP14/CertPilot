import { createAuditLog } from "@/lib/audit";
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

function newDeclarationRef(): string {
  const ts = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const rand = Math.random().toString(36).substring(2, 8);
  return `exp_${ts}_${rand}`;
}

function parseDateFilter(
  year: string | null,
  trimestre: string | null,
): { gte?: Date; lte?: Date } | undefined {
  if (!year) return undefined;
  const y = parseInt(year);
  if (trimestre) {
    const trimMap: Record<string, [number, number]> = {
      Q1: [0, 2],
      Q2: [3, 5],
      Q3: [6, 8],
      Q4: [9, 11],
    };
    const [startMonth, endMonth] = trimMap[trimestre] || [0, 11];
    return {
      gte: new Date(y, startMonth, 1),
      lte: new Date(y, endMonth + 1, 0, 23, 59, 59),
    };
  }
  return {
    gte: new Date(y, 0, 1),
    lte: new Date(y, 11, 31, 23, 59, 59),
  };
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
    const includeDeclared = searchParams.get("includeDeclared") === "1";

    const year = searchParams.get("year");
    const trimestre = searchParams.get("trimestre");
    const dateFilter = parseDateFilter(year, trimestre);

    // Mode stats : JSON avec les compteurs pour l'UI
    if (statsOnly) {
      const baseWhere = {
        isArchived: false,
        employee: { companyId, isActive: true },
        formationType: { isConcernedPP: true },
        ...(dateFilter && { obtainedDate: dateFilter }),
      };

      const [total, alreadyDeclared, exportableReady, employeesWithoutNir] =
        await Promise.all([
          // Total concernées sur la période
          prisma.certificate.count({ where: baseWhere }),
          // Déjà déclarées (ppDeclaredAt renseigné)
          prisma.certificate.count({
            where: { ...baseWhere, ppDeclaredAt: { not: null } },
          }),
          // Prêtes à déclarer : non encore déclarées + NIR ok
          prisma.certificate.count({
            where: {
              ...baseWhere,
              ppDeclaredAt: null,
              employee: { companyId, isActive: true, nir: { not: null } },
            },
          }),
          // Employés sans NIR qui ont des formations concernées non déclarées
          prisma.employee.count({
            where: {
              companyId,
              isActive: true,
              nir: null,
              certificates: {
                some: {
                  isArchived: false,
                  ppDeclaredAt: null,
                  formationType: { isConcernedPP: true },
                  ...(dateFilter && { obtainedDate: dateFilter }),
                },
              },
            },
          }),
        ]);

      const notDeclared = total - alreadyDeclared;
      const skipped = notDeclared - exportableReady;

      return NextResponse.json({
        totalConcerned: total,
        exportable: exportableReady,
        skipped,
        alreadyDeclared,
        employeesWithoutNir,
      });
    }

    // Mode génération CSV : ne prend par défaut que les non-déclarés
    const certificates = await prisma.certificate.findMany({
      where: {
        isArchived: false,
        employee: { companyId, isActive: true },
        formationType: { isConcernedPP: true },
        ...(!includeDeclared && { ppDeclaredAt: null }),
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

    // Filtrer : on ne peut déclarer que les certificats avec NIR + nom
    const exportable = certificates.filter(
      (c) => c.employee.nir && (c.employee.birthName || c.employee.lastName),
    );

    // Identifiant unique pour ce batch (permet de confirmer/annuler plus tard)
    const declarationRef = newDeclarationRef();

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
        declId,
        `REF_${cert.id.substring(0, 20)}`,
        `${cert.employee.id.substring(0, 12)}_${cert.id.substring(0, 12)}`,
        sanitizeCsvField(cert.formationType.name),
        formatDateFr(startDate),
        formatDateFr(endDate),
        mapTrainingMode(cert.trainingMode || cert.formationType.trainingMode),
        sanitizeCsvField(cert.formationType.romeCodes),
        sanitizeCsvField(cert.trainerQualification),
        formationCertifiante,
        isCert === true
          ? sanitizeCsvField(cert.formationType.certificationCode)
          : "",
        isCert === false
          ? sanitizeCsvField(cert.formationType.formacodes)
          : "",
        isCert === false
          ? sanitizeCsvField(cert.formationType.nsfCodes)
          : "",
        sanitizeCsvField(cert.employee.nir),
        sanitizeCsvField(nomTitulaire),
        "",
        "",
        declarationRef,
        formatDateFr(endDate),
        formatDateFr(cert.expiryDate),
      ];

      lines.push(row.join("|"));
    }

    const csvContent = lines.join("\n");

    // Audit : génération du CSV (pas encore confirmé comme déposé)
    await createAuditLog({
      userId: session.user.id,
      userName: session.user.name || undefined,
      userEmail: session.user.email || undefined,
      companyId,
      action: "EXPORT",
      entityType: "CERTIFICATE",
      description: `Génération CSV Passeport Prévention - ${exportable.length} déclaration(s) sur ${certificates.length} concernée(s)`,
      metadata: {
        declarationRef,
        exportableCount: exportable.length,
        totalConcerned: certificates.length,
        period: { year, trimestre },
      },
    });

    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const periodPart = year ? `_${year}${trimestre ? `_${trimestre}` : ""}` : "";
    const filename = `passeport-prevention-adf${periodPart}_${dateStr}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-PP-Declaration-Ref": declarationRef,
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