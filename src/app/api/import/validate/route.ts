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

interface RowWarning {
  sheet: string;
  row: number;
  column: string;
  message: string;
  refType: "FUNCTION" | "SERVICE" | "SITE" | "TEAM";
  refValue: string;
}

interface ReferenceToCreate {
  type: "FUNCTION" | "SERVICE" | "SITE" | "TEAM";
  value: string;
}

interface ValidationResult {
  employees: ParsedEmployee[];
  formations: ParsedFormation[];
  certificates: ParsedCertificate[];
  errors: RowError[];
  warnings: RowWarning[];
  referencesToCreate: ReferenceToCreate[];
  summary: {
    employeesToCreate: number;
    employeesToUpdate: number;
    formationsToCreate: number;
    formationsToUpdate: number;
    certificatesToCreate: number;
    referencesToCreate: number;
    totalErrors: number;
    totalWarnings: number;
  };
}

// Sets de valeurs de référentiels valides (passés aux parsers)
interface ReferenceRefs {
  functions: Set<string>; // FUNCTION - positions/fonctions
  services: Set<string>; // SERVICE - départements/services
  sites: Set<string>; // SITE
  teams: Set<string>; // TEAM
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
  medicalCheckupDate?: Date;
  _action: "CREATE" | "UPDATE";
}

interface ParsedFormation {
  name: string;
  category?: string;
  service?: string;
  defaultValidityMonths?: number;
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
  refs: ReferenceRefs,
): { employees: ParsedEmployee[]; errors: RowError[]; warnings: RowWarning[] } {
  const employees: ParsedEmployee[] = [];
  const errors: RowError[] = [];
  const warnings: RowWarning[] = [];
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

    // Validation référentiels
    if (position && !refs.functions.has(position.toLowerCase())) {
      warnings.push({
        sheet: "Employés",
        row: rowNum,
        column: "Fonction",
        message: `La fonction "${position}" n'existe pas dans vos référentiels. Elle sera créée automatiquement.`,
        refType: "FUNCTION",
        refValue: position,
      });
    }
    if (department && !refs.services.has(department.toLowerCase())) {
      warnings.push({
        sheet: "Employés",
        row: rowNum,
        column: "Service",
        message: `Le service "${department}" n'existe pas dans vos référentiels. Il sera créé automatiquement.`,
        refType: "SERVICE",
        refValue: department,
      });
    }
    const siteVal = strVal(row, "Site") || undefined;
    if (siteVal && !refs.sites.has(siteVal.toLowerCase())) {
      warnings.push({
        sheet: "Employés",
        row: rowNum,
        column: "Site",
        message: `Le site "${siteVal}" n'existe pas dans vos référentiels. Il sera créé automatiquement.`,
        refType: "SITE",
        refValue: siteVal,
      });
    }
    const teamVal = strVal(row, "Équipe", "Equipe") || undefined;
    if (teamVal && !refs.teams.has(teamVal.toLowerCase())) {
      warnings.push({
        sheet: "Employés",
        row: rowNum,
        column: "Équipe",
        message: `L'équipe "${teamVal}" n'existe pas dans vos référentiels. Elle sera créée automatiquement.`,
        refType: "TEAM",
        refValue: teamVal,
      });
    }

    employees.push({
      matricule,
      lastName,
      firstName,
      email,
      position,
      department,
      site: siteVal,
      team: teamVal,
      managerMatricule:
        strVal(row, "Manager (matricule)", "Manager") || undefined,
      managerEmail: strVal(row, "Email manager") || undefined,
      medicalCheckupDate: medicalDate,
      _action: existingMatricules.has(matricule) ? "UPDATE" : "CREATE",
    });
  }

  return { employees, errors, warnings };
}

function parseFormationsSheet(
  rows: Record<string, unknown>[],
  existingNames: Set<string>,
  refs: ReferenceRefs,
): {
  formations: ParsedFormation[];
  errors: RowError[];
  warnings: RowWarning[];
} {
  const formations: ParsedFormation[] = [];
  const errors: RowError[] = [];
  const warnings: RowWarning[] = [];
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

    const serviceVal = strVal(row, "Service") || undefined;
    if (serviceVal && !refs.services.has(serviceVal.toLowerCase())) {
      warnings.push({
        sheet: "Formations",
        row: rowNum,
        column: "Service",
        message: `Le service "${serviceVal}" n'existe pas dans vos référentiels. Il sera créé automatiquement.`,
        refType: "SERVICE",
        refValue: serviceVal,
      });
    }

    formations.push({
      name,
      category: strVal(row, "Catégorie", "Categorie") || undefined,
      service: serviceVal,
      defaultValidityMonths: parseInt_(
        cellValue(row, "Validité (mois)", "Validité"),
      ),
      _action: existingNames.has(name.toLowerCase()) ? "UPDATE" : "CREATE",
    });
  }

  return { formations, errors, warnings };
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
    const [existingEmployees, existingFormations, existingReferences] =
      await Promise.all([
        prisma.employee.findMany({
          where: { companyId },
          select: { employeeId: true, id: true },
        }),
        prisma.formationType.findMany({
          where: { companyId },
          select: { name: true, id: true },
        }),
        prisma.referenceData.findMany({
          where: { companyId, isActive: true },
          select: { type: true, value: true },
        }),
      ]);

    // Construire les sets de référentiels
    const refs: ReferenceRefs = {
      functions: new Set<string>(),
      services: new Set<string>(),
      sites: new Set<string>(),
      teams: new Set<string>(),
    };
    for (const ref of existingReferences) {
      const key = ref.value.toLowerCase();
      switch (ref.type) {
        case "FUNCTION":
          refs.functions.add(key);
          break;
        case "SERVICE":
          refs.services.add(key);
          break;
        case "SITE":
          refs.sites.add(key);
          break;
        case "TEAM":
          refs.teams.add(key);
          break;
      }
    }

    const existingMatricules = new Set(
      existingEmployees.map((e) => e.employeeId),
    );
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
    const allWarnings: RowWarning[] = [];

    // Parse Employés
    if (employeesSheetName) {
      const sheet = workbook.Sheets[employeesSheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
      if (rows.length > 0) {
        const result = parseEmployeesSheet(rows, existingMatricules, refs);
        parsedEmployees = result.employees;
        allErrors.push(...result.errors);
        allWarnings.push(...result.warnings);
      }
    }

    // Parse Formations
    if (formationsSheetName) {
      const sheet = workbook.Sheets[formationsSheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
      if (rows.length > 0) {
        const result = parseFormationsSheet(rows, existingFormationNames, refs);
        parsedFormations = result.formations;
        allErrors.push(...result.errors);
        allWarnings.push(...result.warnings);
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

    // Déduire les références uniques à créer
    const refsToCreateMap = new Map<string, ReferenceToCreate>();
    for (const w of allWarnings) {
      const key = `${w.refType}::${w.refValue.toLowerCase()}`;
      if (!refsToCreateMap.has(key)) {
        refsToCreateMap.set(key, { type: w.refType, value: w.refValue });
      }
    }
    const referencesToCreate = Array.from(refsToCreateMap.values());

    const validationResult: ValidationResult = {
      employees: parsedEmployees,
      formations: parsedFormations,
      certificates: parsedCertificates,
      errors: allErrors,
      warnings: allWarnings,
      referencesToCreate,
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
        referencesToCreate: referencesToCreate.length,
        totalErrors: allErrors.length,
        totalWarnings: allWarnings.length,
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
        referencesCreated: 0,
      };

      // 0. Créer les références manquantes
      for (const ref of referencesToCreate) {
        // Vérifier que ça n'existe pas déjà (double sécurité)
        const existing = await tx.referenceData.findFirst({
          where: {
            type: ref.type,
            value: ref.value,
            companyId,
          },
        });
        if (!existing) {
          await tx.referenceData.create({
            data: {
              type: ref.type,
              value: ref.value,
              companyId,
            },
          });
          stats.referencesCreated++;
        }
      }

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
              isActive: true,
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
              isActive: true,
              companyId,
            },
          });
          existingFormationNamesMap.set(ft.name.toLowerCase(), created.id);
          stats.formationsCreated++;
        }
      }

      // 2. Upsert Employees
      for (const emp of parsedEmployees) {
        const employeeData = {
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          position: emp.position,
          department: emp.department,
          site: emp.site,
          team: emp.team,
          managerEmail: emp.managerEmail,
          medicalCheckupDate: emp.medicalCheckupDate,
          isActive: true,
        };

        const existingId = existingMatriculesMap.get(emp.matricule);
        if (existingId) {
          await tx.employee.update({
            where: { id: existingId },
            data: employeeData,
          });
          // Désarchiver les certificats si l'employé est réactivé
          await tx.certificate.updateMany({
            where: { employeeId: existingId, isArchived: true },
            data: { isArchived: false },
          });
          stats.employeesUpdated++;
        } else {
          // Upsert par employeeId (unique global) pour éviter les conflits
          const upserted = await tx.employee.upsert({
            where: { employeeId: emp.matricule },
            update: { ...employeeData, companyId },
            create: { ...employeeData, employeeId: emp.matricule, companyId },
          });
          existingMatriculesMap.set(emp.matricule, upserted.id);
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

        // Vérifier si un certificat identique existe déjà
        const existingCert = await tx.certificate.findFirst({
          where: {
            employeeId,
            formationTypeId,
            obtainedDate: cert.obtainedDate,
          },
        });

        if (existingCert) {
          // Mettre à jour le certificat existant
          await tx.certificate.update({
            where: { id: existingCert.id },
            data: {
              expiryDate: cert.expiryDate,
              organism: cert.organism,
              details: cert.details,
            },
          });
        } else {
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
        }
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
      description: `Import Excel : ${result.employeesCreated} employés créés, ${result.employeesUpdated} mis à jour, ${result.formationsCreated} formations créées, ${result.formationsUpdated} mises à jour, ${result.certificatesCreated} certificats créés, ${result.referencesCreated} référentiels créés`,
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
          error instanceof Error ? error.message : "Erreur lors de l'import",
      },
      { status: 500 },
    );
  }
}
