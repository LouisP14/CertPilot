import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import ExcelJS from "exceljs";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ExportType = "all" | "expiring" | "expired" | "employees" | "services" | "formations";

function isValidExportType(value: string | null): value is ExportType {
  return ["all", "expiring", "expired", "employees", "services", "formations"].includes(value as string);
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("fr-FR");
}

function getDaysLeft(expiryDate: Date | null | undefined): number | string {
  if (!expiryDate) return "-";
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getCertificateStatus(expiryDate: Date | null | undefined): string {
  if (!expiryDate) return "Sans expiration";
  const now = new Date();
  const date = new Date(expiryDate);
  if (date < now) return "Expiree";
  const in90Days = new Date(now);
  in90Days.setDate(in90Days.getDate() + 90);
  if (date <= in90Days) return "Expire bientot";
  return "Valide";
}

function styleHeaderRow(sheet: ExcelJS.Worksheet): void {
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF173B56" },
  } as ExcelJS.FillPattern;
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.height = 22;
}

function applyStatusStyle(cell: ExcelJS.Cell, status: string): void {
  if (status === "Expiree") {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEE2E2" } } as ExcelJS.FillPattern;
    cell.font = { color: { argb: "FFDC2626" }, bold: true };
  } else if (status === "Expire bientot") {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF3C7" } } as ExcelJS.FillPattern;
    cell.font = { color: { argb: "FFD97706" }, bold: true };
  } else if (status === "Valide") {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD1FAE5" } } as ExcelJS.FillPattern;
    cell.font = { color: { argb: "FF059669" }, bold: true };
  }
}

function applyWarningStyle(cell: ExcelJS.Cell): void {
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF3C7" } } as ExcelJS.FillPattern;
  cell.font = { color: { argb: "FFD97706" }, bold: true };
}

function applyDangerStyle(cell: ExcelJS.Cell): void {
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEE2E2" } } as ExcelJS.FillPattern;
  cell.font = { color: { argb: "FFDC2626" }, bold: true };
}

function applySuccessStyle(cell: ExcelJS.Cell): void {
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD1FAE5" } } as ExcelJS.FillPattern;
  cell.font = { color: { argb: "FF059669" }, bold: true };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const companyId = session.user.companyId;
    const rawType = request.nextUrl.searchParams.get("type");
    const exportType: ExportType = isValidExportType(rawType) ? rawType : "all";

    const now = new Date();
    const in90Days = new Date(now);
    in90Days.setDate(in90Days.getDate() + 90);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "CertPilot";
    workbook.created = now;
    workbook.modified = now;

    if (exportType === "services" || exportType === "formations") {
      const employees = await prisma.employee.findMany({
        where: { companyId, isActive: true },
        include: {
          certificates: {
            where: { isArchived: false },
            include: {
              formationType: { select: { name: true, category: true } },
            },
          },
        },
      });

      if (exportType === "services") {
        const deptSet = new Set(employees.map((e) => e.department).filter((d): d is string => !!d));
        const departments = [...deptSet].sort();

        const columnDefs = [
          { header: "Service", key: "Service", width: 25 },
          { header: "Nb employes", key: "Nb employes", width: 15 },
          { header: "Formations valides", key: "Formations valides", width: 20 },
          { header: "Expirant 90j", key: "Expirant 90j", width: 15 },
          { header: "Expirees", key: "Expirees", width: 12 },
          { header: "Total formations", key: "Total formations", width: 18 },
          { header: "Conformite %", key: "Conformite %", width: 15 },
        ];

        const getIdx = (key: string) => columnDefs.findIndex((c) => c.key === key) + 1;
        const sheet = workbook.addWorksheet("Repartition par service");
        sheet.columns = columnDefs;

        for (const dept of departments) {
          const deptEmployees = employees.filter((e) => e.department === dept);
          const allCerts = deptEmployees.flatMap((e) => e.certificates);
          const validCerts = allCerts.filter((c) => !c.expiryDate || new Date(c.expiryDate) >= now);
          const expiringCerts = allCerts.filter((c) => {
            if (!c.expiryDate) return false;
            const d = new Date(c.expiryDate);
            return d >= now && d <= in90Days;
          });
          const expiredCerts = allCerts.filter((c) => c.expiryDate && new Date(c.expiryDate) < now);
          const conformite =
            allCerts.length > 0
              ? Math.round((validCerts.length / allCerts.length) * 100)
              : 0;

          const row = sheet.addRow({
            "Service": dept,
            "Nb employes": deptEmployees.length,
            "Formations valides": validCerts.length,
            "Expirant 90j": expiringCerts.length,
            "Expirees": expiredCerts.length,
            "Total formations": allCerts.length,
            "Conformite %": conformite,
          });

          const conformiteCell = row.getCell(getIdx("Conformite %"));
          if (conformite >= 80) applySuccessStyle(conformiteCell);
          else if (conformite >= 50) applyWarningStyle(conformiteCell);
          else applyDangerStyle(conformiteCell);

          if (expiringCerts.length > 0) applyWarningStyle(row.getCell(getIdx("Expirant 90j")));
          if (expiredCerts.length > 0) applyDangerStyle(row.getCell(getIdx("Expirees")));
        }

        styleHeaderRow(sheet);
      } else {
        // formations
        const formationMap = new Map<
          string,
          {
            name: string;
            category: string | null;
            certs: (typeof employees)[0]["certificates"];
          }
        >();

        for (const emp of employees) {
          for (const cert of emp.certificates) {
            const key = cert.formationType.name;
            if (!formationMap.has(key)) {
              formationMap.set(key, {
                name: cert.formationType.name,
                category: cert.formationType.category,
                certs: [],
              });
            }
            formationMap.get(key)!.certs.push(cert);
          }
        }

        const columnDefs = [
          { header: "Formation", key: "Formation", width: 35 },
          { header: "Categorie", key: "Categorie", width: 20 },
          { header: "Nb habilites", key: "Nb habilites", width: 15 },
          { header: "Valides", key: "Valides", width: 12 },
          { header: "Expirant 90j", key: "Expirant 90j", width: 15 },
          { header: "Expirees", key: "Expirees", width: 12 },
          { header: "Derniere obtention", key: "Derniere obtention", width: 22 },
        ];

        const getIdx = (key: string) => columnDefs.findIndex((c) => c.key === key) + 1;
        const sheet = workbook.addWorksheet("Synthese par formation");
        sheet.columns = columnDefs;

        const formations = [...formationMap.values()].sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        for (const f of formations) {
          const validCerts = f.certs.filter(
            (c) => !c.expiryDate || new Date(c.expiryDate) >= now
          );
          const expiringCerts = f.certs.filter((c) => {
            if (!c.expiryDate) return false;
            const d = new Date(c.expiryDate);
            return d >= now && d <= in90Days;
          });
          const expiredCerts = f.certs.filter(
            (c) => c.expiryDate && new Date(c.expiryDate) < now
          );
          const lastObtained = f.certs.reduce<Date | null>((max, c) => {
            if (!c.obtainedDate) return max;
            const d = new Date(c.obtainedDate);
            return !max || d > max ? d : max;
          }, null);

          const row = sheet.addRow({
            "Formation": f.name,
            "Categorie": f.category || "-",
            "Nb habilites": f.certs.length,
            "Valides": validCerts.length,
            "Expirant 90j": expiringCerts.length,
            "Expirees": expiredCerts.length,
            "Derniere obtention": lastObtained ? formatDate(lastObtained) : "-",
          });

          if (expiringCerts.length > 0) applyWarningStyle(row.getCell(getIdx("Expirant 90j")));
          if (expiredCerts.length > 0) applyDangerStyle(row.getCell(getIdx("Expirees")));
        }

        styleHeaderRow(sheet);
      }
    } else {
      // employees, all, expiring, expired
      const employees = await prisma.employee.findMany({
        where: { companyId, isActive: true },
        include: {
          certificates: {
            where: { isArchived: false },
            include: {
              formationType: { select: { name: true, category: true } },
            },
            orderBy: { expiryDate: "asc" },
          },
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      });

      if (exportType === "employees") {
        const columnDefs = [
          { header: "Nom", key: "Nom", width: 20 },
          { header: "Prenom", key: "Prenom", width: 20 },
          { header: "Matricule", key: "Matricule", width: 15 },
          { header: "Email", key: "Email", width: 30 },
          { header: "Fonction", key: "Fonction", width: 20 },
          { header: "Service", key: "Service", width: 20 },
          { header: "Site", key: "Site", width: 15 },
          { header: "Equipe", key: "Equipe", width: 15 },
        ];
        const sheet = workbook.addWorksheet("Employes");
        sheet.columns = columnDefs;

        for (const employee of employees) {
          sheet.addRow({
            "Nom": employee.lastName,
            "Prenom": employee.firstName,
            "Matricule": employee.employeeId,
            "Email": employee.email || "-",
            "Fonction": employee.position,
            "Service": employee.department,
            "Site": employee.site || "-",
            "Equipe": employee.team || "-",
          });
        }

        styleHeaderRow(sheet);
      } else {
        const sheetNames: Record<string, string> = {
          all: "Employes et formations",
          expiring: "Expirant dans 90 jours",
          expired: "Formations expirees",
        };

        const columnDefs = [
          { header: "Nom", key: "Nom", width: 18 },
          { header: "Prenom", key: "Prenom", width: 18 },
          { header: "Matricule", key: "Matricule", width: 14 },
          { header: "Email", key: "Email", width: 28 },
          { header: "Fonction", key: "Fonction", width: 20 },
          { header: "Service", key: "Service", width: 18 },
          { header: "Site", key: "Site", width: 14 },
          { header: "Equipe", key: "Equipe", width: 14 },
          { header: "Formation", key: "Formation", width: 28 },
          { header: "Categorie", key: "Categorie", width: 16 },
          { header: "Date obtention", key: "Date obtention", width: 16 },
          { header: "Date expiration", key: "Date expiration", width: 16 },
          { header: "Jours restants", key: "Jours restants", width: 15 },
          { header: "Organisme", key: "Organisme", width: 22 },
          { header: "Statut", key: "Statut", width: 16 },
        ];

        const getIdx = (key: string) => columnDefs.findIndex((c) => c.key === key) + 1;
        const sheet = workbook.addWorksheet(sheetNames[exportType] || "Export");
        sheet.columns = columnDefs;

        for (const employee of employees) {
          const filteredCertificates = employee.certificates.filter((cert) => {
            if (exportType === "all") return true;
            if (!cert.expiryDate) return false;
            const d = new Date(cert.expiryDate);
            if (exportType === "expired") return d < now;
            return d >= now && d <= in90Days;
          });

          if (exportType === "all" && filteredCertificates.length === 0) {
            sheet.addRow({
              "Nom": employee.lastName,
              "Prenom": employee.firstName,
              "Matricule": employee.employeeId,
              "Email": employee.email || "-",
              "Fonction": employee.position,
              "Service": employee.department,
              "Site": employee.site || "-",
              "Equipe": employee.team || "-",
              "Formation": "Aucune formation",
              "Categorie": "-",
              "Date obtention": "-",
              "Date expiration": "-",
              "Jours restants": "-",
              "Organisme": "-",
              "Statut": "-",
            });
            continue;
          }

          for (const cert of filteredCertificates) {
            const status = getCertificateStatus(cert.expiryDate);
            const daysLeft = getDaysLeft(cert.expiryDate);

            const row = sheet.addRow({
              "Nom": employee.lastName,
              "Prenom": employee.firstName,
              "Matricule": employee.employeeId,
              "Email": employee.email || "-",
              "Fonction": employee.position,
              "Service": employee.department,
              "Site": employee.site || "-",
              "Equipe": employee.team || "-",
              "Formation": cert.formationType.name,
              "Categorie": cert.formationType.category || "-",
              "Date obtention": formatDate(cert.obtainedDate),
              "Date expiration": formatDate(cert.expiryDate),
              "Jours restants": daysLeft,
              "Organisme": cert.organism || "-",
              "Statut": status,
            });

            applyStatusStyle(row.getCell(getIdx("Statut")), status);

            const joursCell = row.getCell(getIdx("Jours restants"));
            if (status === "Expiree") {
              joursCell.font = { color: { argb: "FFDC2626" }, bold: true };
            } else if (status === "Expire bientot") {
              joursCell.font = { color: { argb: "FFD97706" }, bold: true };
            }
          }
        }

        styleHeaderRow(sheet);
      }
    }

    const excelBuffer = await workbook.xlsx.writeBuffer();
    const datePart = now.toISOString().split("T")[0];

    const filenameByType: Record<ExportType, string> = {
      all: `formations-employes-${datePart}.xlsx`,
      expiring: `formations-expirant-${datePart}.xlsx`,
      expired: `formations-expirees-${datePart}.xlsx`,
      employees: `liste-employes-${datePart}.xlsx`,
      services: `synthese-services-${datePart}.xlsx`,
      formations: `synthese-formations-${datePart}.xlsx`,
    };

    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filenameByType[exportType]}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Excel export error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la generation de l'export Excel" },
      { status: 500 }
    );
  }
}