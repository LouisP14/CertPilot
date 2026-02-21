import { createAuditLog } from "@/lib/audit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

// ── Types ──

interface RowError {
  sheet: string;
  row: number;
  column: string;
  message: string;
}

interface ValidationResult {
  employees: ParsedEmployee[];
  formations: ParsedFormation[];
  certificates: ParsedCertificate[];
  errors: RowError[];
  summary: {
    employeesToCreate: number;
    employeesToUpdate: number;
    formationsToCreate: number;
    formationsToUpdate: number;
    certificatesToCreate: number;
    totalErrors: number;
  };
}

interface ParsedEmployee {
  matricule: string;
  lastName: string;
  firstName: string;
  email?: string;
  position: string;
  department: string;
  site?: string;
  team?: string;
  managerMatricule?: string;
  managerEmail?: string;
  contractType?: string;
  hourlyCost?: number;
  workingHoursPerDay?: number;
  medicalCheckupDate?: Date;
  isActive: boolean;
  _action: "CREATE" | "UPDATE";
}

interface ParsedFormation {
  name: string;
  category?: string;
  service?: string;
  defaultValidityMonths?: number;
  durationHours: number;
  durationDays: number;
  minParticipants: number;
  maxParticipants: number;
  trainingMode: string;
  isLegalObligation: boolean;
  renewalPriority: number;
  estimatedCostPerPerson?: number;
  estimatedCostPerSession?: number;
  isActive: boolean;
  _action: "CREATE" | "UPDATE";
}

interface ParsedCertificate {
  employeeMatricule: string;
  formationName: string;
  obtainedDate: Date;
  expiryDate?: Date;
  organism?: string;
  details?: string;
  _action: "CREATE";
}

// ── Helpers ──

function parseDate(value: unknown): Date | undefined {
  if (!value) return undefined;

  // Si c'est un nombre (date série Excel)
  if (typeof value === "number") {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + value * 86400000);
    if (!isNaN(date.getTime())) return date;
    return undefined;
  }

  const str = String(value).trim();
  if (!str) return undefined;

  // Format JJ/MM/AAAA
  const match = str.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }

  // Format AAAA-MM-JJ (ISO)
  const isoMatch = str.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }

  return undefined;
}

function parseBool(value: unknown): boolean {
  if (!value) return true; // Par défaut OUI
  const str = String(value).trim().toUpperCase();
  return str !== "NON" && str !== "N" && str !== "0" && str !== "FALSE";
}

function parseFloat_(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const n = parseFloat(String(value).replace(",", "."));
  return isNaN(n) ? undefined : n;
}

function parseInt_(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const n = parseInt(String(value), 10);
  return isNaN(n) ? undefined : n;
}

function cellValue(row: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    const val = row[key];
    if (val !== undefined && val !== null && String(val).trim() !== "")
      return val;
  }
  return undefined;
}

function strVal(row: Record<string, unknown>, ...keys: string[]): string {
  const v = cellValue(row, ...keys);
  return v !== undefined ? String(v).trim() : "";
}

// ── Parse les onglets ──

function parseEmployeesSheet(
  rows: Record<string, unknown>[],
  existingMatricules: Set<string>,
): { employees: ParsedEmployee[]; errors: RowError[] } {
  const employees: ParsedEmployee[] = [];
  const errors: RowError[] = [];
  const seenMatricules = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +1 header, +1 zero-indexed

    const matricule = strVal(row, "Matricule*", "Matricule");
    const lastName = strVal(row, "Nom*", "Nom");
    const firstName = strVal(row, "Prénom*", "Prénom");
    const position = strVal(row, "Fonction*", "Fonction");
    const department = strVal(row, "Service*", "Service");

    // Vérifications obligatoires
    if (!matricule) {
      errors.push({
        sheet: "Employés",
        row: rowNum,
        column: "Matricule",
        message: "Le matricule est obligatoire",
      });
      continue;
    }
    if (!lastName) {
      errors.push({
        sheet: "Employés",
        row: rowNum,
        column: "Nom",
        message: "Le nom est obligatoire",
      });
    }
    if (!firstName) {
      errors.push({
        sheet: "Employés",
        row: rowNum,
        column: "Prénom",
        message: "Le prénom est obligatoire",
      });
    }
    if (!position) {
      errors.push({
        sheet: "Employés",
        row: rowNum,
        column: "Fonction",
        message: "La fonction est obligatoire",
      });
    }
    if (!department) {
      errors.push({
        sheet: "Employés",
        row: rowNum,
        column: "Service",
        message: "Le service est obligatoire",
      });
    }

    if (!lastName || !firstName || !position || !department) continue;

    // Doublon dans le fichier
    if (seenMatricules.has(matricule)) {
      errors.push({
        sheet: "Employés",
        row: rowNum,
        column: "Matricule",
        message: `Le matricule "${matricule}" est en doublon dans le fichier`,
      });
      continue;
    }
    seenMatricules.add(matricule);

    const medicalDate = parseDate(
      cellValue(
        row,
        "Date visite médicale (JJ/MM/AAAA)",
        "Date visite médicale",
      ),
    );
    const rawMedical = strVal(
      row,
      "Date visite médicale (JJ/MM/AAAA)",
      "Date visite médicale",
    );
    if (rawMedical && !medicalDate) {
      errors.push({
        sheet: "Employés",
        row: rowNum,
        column: "Date visite médicale",
        message: `Date invalide : "${rawMedical}". Utilisez le format JJ/MM/AAAA`,
      });
    }

    const email = strVal(row, "Email") || undefined;
    if (email && !email.includes("@")) {
      errors.push({
        sheet: "Employés",
        row: rowNum,
        column: "Email",
        message: `Email invalide : "${email}"`,
      });
    }

    employees.push({
      matricule,
      lastName,
      firstName,
      email,
      position,
      department,
      site: strVal(row, "Site") || undefined,
      team: strVal(row, "Équipe", "Equipe") || undefined,
      managerMatricule:
        strVal(row, "Manager (matricule)", "Manager") || undefined,
      managerEmail: strVal(row, "Email manager") || undefined,
      contractType: strVal(row, "Type contrat") || undefined,
      hourlyCost: parseFloat_(cellValue(row, "Coût horaire (€)", "Coût horaire")),
      workingHoursPerDay: parseFloat_(cellValue(row, "Heures/jour")),
      medicalCheckupDate: medicalDate,
      isActive: parseBool(cellValue(row, "Actif (OUI/NON)", "Actif")),
      _action: existingMatricules.has(matricule) ? "UPDATE" : "CREATE",
    });
  }

  return { employees, errors };
}

function parseFormationsSheet(
  rows: Record<string, unknown>[],
  existingNames: Set<string>,
): { formations: ParsedFormation[]; errors: RowError[] } {
  const formations: ParsedFormation[] = [];
  const errors: RowError[] = [];
  const seenNames = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    const name = strVal(row, "Nom formation*", "Nom formation", "Nom");
    if (!name) {
      errors.push({
        sheet: "Formations",
        row: rowNum,
        column: "Nom formation",
        message: "Le nom de la formation est obligatoire",
      });
      continue;
    }

    if (seenNames.has(name.toLowerCase())) {
      errors.push({
        sheet: "Formations",
        row: rowNum,
        column: "Nom formation",
        message: `La formation "${name}" est en doublon dans le fichier`,
      });
      continue;
    }
    seenNames.add(name.toLowerCase());

    const mode = strVal(
      row,
      "Mode (PRESENTIEL/DISTANCIEL/MIXTE)",
      "Mode",
    ).toUpperCase();
    if (mode && !["PRESENTIEL", "DISTANCIEL", "MIXTE"].includes(mode)) {
      errors.push({
        sheet: "Formations",
        row: rowNum,
        column: "Mode",
        message: `Mode invalide : "${mode}". Valeurs acceptées : PRESENTIEL, DISTANCIEL, MIXTE`,
      });
    }

    formations.push({
      name,
      category: strVal(row, "Catégorie", "Categorie") || undefined,
      service: strVal(row, "Service") || undefined,
      defaultValidityMonths: parseInt_(
        cellValue(row, "Validité (mois)", "Validité"),
      ),
      durationHours: parseFloat_(cellValue(row, "Durée (heures)", "Durée heures")) ?? 7,
      durationDays: parseInt_(cellValue(row, "Durée (jours)", "Durée jours")) ?? 1,
      minParticipants: parseInt_(cellValue(row, "Min participants")) ?? 1,
      maxParticipants: parseInt_(cellValue(row, "Max participants")) ?? 12,
      trainingMode:
        mode && ["PRESENTIEL", "DISTANCIEL", "MIXTE"].includes(mode)
          ? mode
          : "PRESENTIEL",
      isLegalObligation: parseBool(
        cellValue(row, "Obligation légale (OUI/NON)", "Obligation légale"),
      )
        ? strVal(
            row,
            "Obligation légale (OUI/NON)",
            "Obligation légale",
          ).toUpperCase() === "OUI"
        : false,
      renewalPriority:
        parseInt_(
          cellValue(row, "Priorité renouvellement (1-10)", "Priorité"),
        ) ?? 5,
      estimatedCostPerPerson: parseFloat_(
        cellValue(row, "Coût estimé/personne (€)", "Coût/personne"),
      ),
      estimatedCostPerSession: parseFloat_(
        cellValue(row, "Coût estimé/session (€)", "Coût/session"),
      ),
      isActive: parseBool(cellValue(row, "Actif (OUI/NON)", "Actif")),
      _action: existingNames.has(name.toLowerCase()) ? "UPDATE" : "CREATE",
    });
  }

  return { formations, errors };
}

function parseCertificatesSheet(
  rows: Record<string, unknown>[],
  validMatricules: Set<string>,
  validFormationNames: Set<string>,
): { certificates: ParsedCertificate[]; errors: RowError[] } {
  const certificates: ParsedCertificate[] = [];
  const errors: RowError[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    const matricule = strVal(
      row,
      "Matricule employé*",
      "Matricule employé",
      "Matricule",
    );
    const formationName = strVal(
      row,
      "Nom formation*",
      "Nom formation",
      "Formation",
    );
    const obtainedDateRaw = cellValue(
      row,
      "Date obtention* (JJ/MM/AAAA)",
      "Date obtention",
      "Date d'obtention",
    );

    if (!matricule) {
      errors.push({
        sheet: "Certificats",
        row: rowNum,
        column: "Matricule employé",
        message: "Le matricule est obligatoire",
      });
    }
    if (!formationName) {
      errors.push({
        sheet: "Certificats",
        row: rowNum,
        column: "Nom formation",
        message: "Le nom de la formation est obligatoire",
      });
    }

    const obtainedDate = parseDate(obtainedDateRaw);
    if (!obtainedDateRaw) {
      errors.push({
        sheet: "Certificats",
        row: rowNum,
        column: "Date obtention",
        message: "La date d'obtention est obligatoire",
      });
    } else if (!obtainedDate) {
      errors.push({
        sheet: "Certificats",
        row: rowNum,
        column: "Date obtention",
        message: `Date invalide : "${obtainedDateRaw}". Utilisez le format JJ/MM/AAAA`,
      });
    }

    if (!matricule || !formationName || !obtainedDate) continue;

    // Vérifier que le matricule existe
    if (!validMatricules.has(matricule)) {
      errors.push({
        sheet: "Certificats",
        row: rowNum,
        column: "Matricule employé",
        message: `Employé avec le matricule "${matricule}" introuvable (ni en base ni dans l'onglet Employés)`,
      });
      continue;
    }

    // Vérifier que la formation existe
    if (!validFormationNames.has(formationName.toLowerCase())) {
      errors.push({
        sheet: "Certificats",
        row: rowNum,
        column: "Nom formation",
        message: `Formation "${formationName}" introuvable (ni en base ni dans l'onglet Formations)`,
      });
      continue;
    }

    const expiryDateRaw = cellValue(
      row,
      "Date expiration (JJ/MM/AAAA)",
      "Date expiration",
      "Date d'expiration",
    );
    const expiryDate = parseDate(expiryDateRaw);
    if (expiryDateRaw && !expiryDate) {
      errors.push({
        sheet: "Certificats",
        row: rowNum,
        column: "Date expiration",
        message: `Date invalide : "${expiryDateRaw}". Utilisez le format JJ/MM/AAAA`,
      });
    }

    certificates.push({
      employeeMatricule: matricule,
      formationName,
      obtainedDate,
      expiryDate,
      organism: strVal(row, "Organisme") || undefined,
      details: strVal(row, "Détails", "Details") || undefined,
      _action: "CREATE",
    });
  }

  return { certificates, errors };
}

// ── POST /api/import/validate ──

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const role = session.user.role;
    if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent importer des données" },
        { status: 403 },
      );
    }

    const companyId = session.user.companyId;
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get("mode") || "validate"; // "validate" ou "confirm"

    // Lire le fichier uploadé
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 },
      );
    }

    if (
      file.type !==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
      !file.name.endsWith(".xlsx")
    ) {
      return NextResponse.json(
        { error: "Le fichier doit être au format .xlsx" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    // Charger les données existantes pour détecter CREATE vs UPDATE
    const [existingEmployees, existingFormations] = await Promise.all([
      prisma.employee.findMany({
        where: { companyId },
        select: { employeeId: true, id: true },
      }),
      prisma.formationType.findMany({
        where: { companyId },
        select: { name: true, id: true },
      }),
    ]);

    const existingMatricules = new Set(existingEmployees.map((e) => e.employeeId));
    const existingMatriculesMap = new Map(
      existingEmployees.map((e) => [e.employeeId, e.id]),
    );
    const existingFormationNames = new Set(
      existingFormations.map((f) => f.name.toLowerCase()),
    );
    const existingFormationNamesMap = new Map(
      existingFormations.map((f) => [f.name.toLowerCase(), f.id]),
    );

    // Parser chaque onglet
    const employeesSheetName = workbook.SheetNames.find((n) =>
      n.toLowerCase().includes("employ"),
    );
    const formationsSheetName = workbook.SheetNames.find(
      (n) =>
        n.toLowerCase().includes("formation") &&
        !n.toLowerCase().includes("certificat"),
    );
    const certificatesSheetName = workbook.SheetNames.find((n) =>
      n.toLowerCase().includes("certificat"),
    );

    let parsedEmployees: ParsedEmployee[] = [];
    let parsedFormations: ParsedFormation[] = [];
    let parsedCertificates: ParsedCertificate[] = [];
    const allErrors: RowError[] = [];

    // Parse Employés
    if (employeesSheetName) {
      const sheet = workbook.Sheets[employeesSheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
      if (rows.length > 0) {
        const result = parseEmployeesSheet(rows, existingMatricules);
        parsedEmployees = result.employees;
        allErrors.push(...result.errors);
      }
    }

    // Parse Formations
    if (formationsSheetName) {
      const sheet = workbook.Sheets[formationsSheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
      if (rows.length > 0) {
        const result = parseFormationsSheet(rows, existingFormationNames);
        parsedFormations = result.formations;
        allErrors.push(...result.errors);
      }
    }

    // Parse Certificats (après employés et formations pour validations croisées)
    if (certificatesSheetName) {
      const sheet = workbook.Sheets[certificatesSheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
      if (rows.length > 0) {
        // Construire l'ensemble des matricules valides = existants + fichier
        const allValidMatricules = new Set(existingMatricules);
        for (const emp of parsedEmployees) {
          allValidMatricules.add(emp.matricule);
        }

        // Construire l'ensemble des formations valides = existantes + fichier
        const allValidFormations = new Set(existingFormationNames);
        for (const ft of parsedFormations) {
          allValidFormations.add(ft.name.toLowerCase());
        }

        const result = parseCertificatesSheet(
          rows,
          allValidMatricules,
          allValidFormations,
        );
        parsedCertificates = result.certificates;
        allErrors.push(...result.errors);
      }
    }

    // Si aucun onglet reconnu
    if (!employeesSheetName && !formationsSheetName && !certificatesSheetName) {
      return NextResponse.json(
        {
          error:
            "Aucun onglet reconnu. Le fichier doit contenir des onglets nommés 'Employés', 'Formations' et/ou 'Certificats'.",
        },
        { status: 400 },
      );
    }

    const validationResult: ValidationResult = {
      employees: parsedEmployees,
      formations: parsedFormations,
      certificates: parsedCertificates,
      errors: allErrors,
      summary: {
        employeesToCreate: parsedEmployees.filter((e) => e._action === "CREATE")
          .length,
        employeesToUpdate: parsedEmployees.filter((e) => e._action === "UPDATE")
          .length,
        formationsToCreate: parsedFormations.filter(
          (f) => f._action === "CREATE",
        ).length,
        formationsToUpdate: parsedFormations.filter(
          (f) => f._action === "UPDATE",
        ).length,
        certificatesToCreate: parsedCertificates.length,
        totalErrors: allErrors.length,
      },
    };

    // Mode VALIDATE → renvoyer le rapport sans écrire en base
    if (mode === "validate") {
      return NextResponse.json(validationResult);
    }

    // Mode CONFIRM → écrire en base (transactionnel)
    if (allErrors.length > 0) {
      return NextResponse.json(
        {
          error: `Impossible d'importer : ${allErrors.length} erreur(s) détectée(s). Corrigez le fichier et relancez la validation.`,
          errors: allErrors,
        },
        { status: 422 },
      );
    }

    // Import transactionnel
    const result = await prisma.$transaction(async (tx) => {
      const stats = {
        employeesCreated: 0,
        employeesUpdated: 0,
        formationsCreated: 0,
        formationsUpdated: 0,
        certificatesCreated: 0,
      };

      // 1. Upsert FormationTypes
      for (const ft of parsedFormations) {
        const existingId = existingFormationNamesMap.get(ft.name.toLowerCase());
        if (existingId) {
          await tx.formationType.update({
            where: { id: existingId },
            data: {
              category: ft.category,
              service: ft.service,
              defaultValidityMonths: ft.defaultValidityMonths,
              durationHours: ft.durationHours,
              durationDays: ft.durationDays,
              minParticipants: ft.minParticipants,
              maxParticipants: ft.maxParticipants,
              trainingMode: ft.trainingMode,
              isLegalObligation: ft.isLegalObligation,
              renewalPriority: ft.renewalPriority,
              estimatedCostPerPerson: ft.estimatedCostPerPerson,
              estimatedCostPerSession: ft.estimatedCostPerSession,
              isActive: ft.isActive,
            },
          });
          stats.formationsUpdated++;
        } else {
          const created = await tx.formationType.create({
            data: {
              name: ft.name,
              category: ft.category,
              service: ft.service,
              defaultValidityMonths: ft.defaultValidityMonths,
              durationHours: ft.durationHours,
              durationDays: ft.durationDays,
              minParticipants: ft.minParticipants,
              maxParticipants: ft.maxParticipants,
              trainingMode: ft.trainingMode,
              isLegalObligation: ft.isLegalObligation,
              renewalPriority: ft.renewalPriority,
              estimatedCostPerPerson: ft.estimatedCostPerPerson,
              estimatedCostPerSession: ft.estimatedCostPerSession,
              isActive: ft.isActive,
              companyId,
            },
          });
          existingFormationNamesMap.set(ft.name.toLowerCase(), created.id);
          stats.formationsCreated++;
        }
      }

      // 2. Upsert Employees
      for (const emp of parsedEmployees) {
        const existingId = existingMatriculesMap.get(emp.matricule);
        if (existingId) {
          await tx.employee.update({
            where: { id: existingId },
            data: {
              firstName: emp.firstName,
              lastName: emp.lastName,
              email: emp.email,
              position: emp.position,
              department: emp.department,
              site: emp.site,
              team: emp.team,
              managerEmail: emp.managerEmail,
              contractType: emp.contractType,
              hourlyCost: emp.hourlyCost,
              workingHoursPerDay: emp.workingHoursPerDay ?? 7,
              medicalCheckupDate: emp.medicalCheckupDate,
              isActive: emp.isActive,
            },
          });
          stats.employeesUpdated++;
        } else {
          const created = await tx.employee.create({
            data: {
              employeeId: emp.matricule,
              firstName: emp.firstName,
              lastName: emp.lastName,
              email: emp.email,
              position: emp.position,
              department: emp.department,
              site: emp.site,
              team: emp.team,
              managerEmail: emp.managerEmail,
              contractType: emp.contractType,
              hourlyCost: emp.hourlyCost,
              workingHoursPerDay: emp.workingHoursPerDay ?? 7,
              medicalCheckupDate: emp.medicalCheckupDate,
              isActive: emp.isActive,
              companyId,
            },
          });
          existingMatriculesMap.set(emp.matricule, created.id);
          stats.employeesCreated++;
        }
      }

      // 2b. Résoudre les managers (deuxième passe)
      for (const emp of parsedEmployees) {
        if (emp.managerMatricule) {
          const managerId = existingMatriculesMap.get(emp.managerMatricule);
          const employeeId = existingMatriculesMap.get(emp.matricule);
          if (managerId && employeeId) {
            await tx.employee.update({
              where: { id: employeeId },
              data: { managerId },
            });
          }
        }
      }

      // 3. Créer les Certificats
      // Recharger les IDs des employés et formations (y compris les nouveaux)
      for (const cert of parsedCertificates) {
        const employeeId = existingMatriculesMap.get(cert.employeeMatricule);
        const formationTypeId = existingFormationNamesMap.get(
          cert.formationName.toLowerCase(),
        );

        if (!employeeId || !formationTypeId) continue; // Ne devrait pas arriver vu les validations

        await tx.certificate.create({
          data: {
            employeeId,
            formationTypeId,
            obtainedDate: cert.obtainedDate,
            expiryDate: cert.expiryDate,
            organism: cert.organism,
            details: cert.details,
          },
        });
        stats.certificatesCreated++;
      }

      return stats;
    });

    // Audit
    await createAuditLog({
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      companyId: session.user.companyId,
      action: "IMPORT",
      entityType: "EMPLOYEE",
      entityName: file.name,
      description: `Import Excel : ${result.employeesCreated} employés créés, ${result.employeesUpdated} mis à jour, ${result.formationsCreated} formations créées, ${result.formationsUpdated} mises à jour, ${result.certificatesCreated} certificats créés`,
    });

    return NextResponse.json({
      success: true,
      message: "Import terminé avec succès",
      stats: result,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de l'import",
      },
      { status: 500 },
    );
  }
}
