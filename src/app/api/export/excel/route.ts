import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

type ExportType = "all" | "expiring" | "expired" | "employees";

function isValidExportType(value: string | null): value is ExportType {
  return (
    value === "all" ||
    value === "expiring" ||
    value === "expired" ||
    value === "employees"
  );
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("fr-FR");
}

function getCertificateStatus(expiryDate: Date | null): string {
  if (!expiryDate) return "Sans expiration";

  const now = new Date();
  const date = new Date(expiryDate);

  if (date < now) return "Expirée";

  const in90Days = new Date(now);
  in90Days.setDate(in90Days.getDate() + 90);

  if (date <= in90Days) return "Expire bientôt";
  return "Valide";
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const companyId = session.user.companyId;
    const rawType = request.nextUrl.searchParams.get("type");
    const exportType: ExportType = isValidExportType(rawType) ? rawType : "all";

    const now = new Date();
    const in90Days = new Date(now);
    in90Days.setDate(in90Days.getDate() + 90);

    const employees = await prisma.employee.findMany({
      where: {
        companyId,
        isActive: true,
      },
      include: {
        certificates: {
          where: {
            isArchived: false,
          },
          include: {
            formationType: {
              select: {
                name: true,
                category: true,
              },
            },
          },
          orderBy: {
            expiryDate: "asc",
          },
        },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });

    const workbook = XLSX.utils.book_new();

    if (exportType === "employees") {
      const rows = employees.map((employee) => ({
        Nom: employee.lastName,
        Prénom: employee.firstName,
        Matricule: employee.employeeId,
        Email: employee.email || "-",
        Fonction: employee.position,
        Service: employee.department,
        Site: employee.site || "-",
        Équipe: employee.team || "-",
      }));

      const sheet = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, sheet, "Employés");
    } else {
      const rows: Array<Record<string, string>> = [];

      for (const employee of employees) {
        const filteredCertificates = employee.certificates.filter((cert) => {
          if (exportType === "all") return true;
          if (!cert.expiryDate) return false;

          const expiryDate = new Date(cert.expiryDate);
          if (exportType === "expired") {
            return expiryDate < now;
          }

          return expiryDate >= now && expiryDate <= in90Days;
        });

        if (exportType === "all" && filteredCertificates.length === 0) {
          rows.push({
            Nom: employee.lastName,
            Prénom: employee.firstName,
            Matricule: employee.employeeId,
            Email: employee.email || "-",
            Fonction: employee.position,
            Service: employee.department,
            Formation: "Aucune formation",
            Catégorie: "-",
            "Date d'obtention": "-",
            "Date d'expiration": "-",
            Statut: "-",
          });
          continue;
        }

        for (const cert of filteredCertificates) {
          rows.push({
            Nom: employee.lastName,
            Prénom: employee.firstName,
            Matricule: employee.employeeId,
            Email: employee.email || "-",
            Fonction: employee.position,
            Service: employee.department,
            Formation: cert.formationType.name,
            Catégorie: cert.formationType.category || "-",
            "Date d'obtention": formatDate(cert.obtainedDate),
            "Date d'expiration": formatDate(cert.expiryDate),
            Statut: getCertificateStatus(cert.expiryDate),
          });
        }
      }

      const sheetNameByType: Record<
        Exclude<ExportType, "employees">,
        string
      > = {
        all: "Employés & formations",
        expiring: "Expire < 90 jours",
        expired: "Formations expirées",
      };

      const sheet = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(
        workbook,
        sheet,
        sheetNameByType[exportType],
      );
    }

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    const datePart = new Date().toISOString().split("T")[0];
    const filenameByType: Record<ExportType, string> = {
      all: `passeport-formation-all-${datePart}.xlsx`,
      expiring: `passeport-formation-expiring-${datePart}.xlsx`,
      expired: `passeport-formation-expired-${datePart}.xlsx`,
      employees: `passeport-formation-employees-${datePart}.xlsx`,
    };

    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filenameByType[exportType]}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Excel export error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération de l'export Excel" },
      { status: 500 },
    );
  }
}
