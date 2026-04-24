import { auditExportPdf } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { maskNir } from "@/lib/nir";
import {
  formatPpPeriodLabel,
  parsePpDateFilter,
} from "@/lib/passeport-prevention-period";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    if (!session.user.companyId) {
      return NextResponse.json({ employees: [], companyName: null });
    }

    const companyId = session.user.companyId;
    const type = request.nextUrl.searchParams.get("type") || "full_report";
    const now = new Date();

    const auditUser = session.user
      ? { id: session.user.id, name: session.user.name || undefined, email: session.user.email || undefined, companyId }
      : null;

    if (type === "alerts") {
      const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      const certificates = await prisma.certificate.findMany({
        where: {
          isArchived: false,
          employee: { companyId, isActive: true },
          expiryDate: { not: null, lte: in90Days },
        },
        include: {
          employee: { select: { firstName: true, lastName: true, position: true } },
          formationType: { select: { name: true, category: true } },
        },
        orderBy: { expiryDate: "asc" },
      });
      await auditExportPdf("CERTIFICATE", companyId, `Export PDF alertes ${certificates.length} certificat(s)`, auditUser);
      return NextResponse.json({ certificates });
    }

    if (type === "calendar") {
      const in12Months = new Date(now);
      in12Months.setMonth(in12Months.getMonth() + 12);
      const certificates = await prisma.certificate.findMany({
        where: {
          isArchived: false,
          employee: { companyId, isActive: true },
          expiryDate: { gte: now, lte: in12Months },
        },
        include: {
          employee: { select: { firstName: true, lastName: true, department: true } },
          formationType: { select: { name: true, category: true } },
        },
        orderBy: { expiryDate: "asc" },
      });

      const grouped: Record<string, typeof certificates> = {};
      for (const cert of certificates) {
        if (!cert.expiryDate) continue;
        const d = new Date(cert.expiryDate);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(cert);
      }
      await auditExportPdf("CERTIFICATE", companyId, `Export PDF calendrier ${certificates.length} echeance(s)`, auditUser);
      return NextResponse.json({ groupedCertificates: grouped });
    }

    if (type === "coverage_formations") {
      const totalEmployees = await prisma.employee.count({ where: { companyId, isActive: true } });
      const formationTypes = await prisma.formationType.findMany({
        where: { companyId },
        include: {
          certificates: {
            where: { isArchived: false, employee: { isActive: true, companyId } },
            select: { employeeId: true, expiryDate: true },
          },
        },
        orderBy: { name: "asc" },
      });

      const formations = formationTypes.map((ft) => {
        const validCerts = ft.certificates.filter((c) => !c.expiryDate || new Date(c.expiryDate) >= now);
        const uniqueEmployees = new Set(validCerts.map((c) => c.employeeId));
        const trainedCount = uniqueEmployees.size;
        const percentage = totalEmployees > 0 ? Math.round((trainedCount / totalEmployees) * 100) : 0;
        return { name: ft.name, category: ft.category, service: ft.service, trainedCount, totalEmployees, percentage };
      });

      await auditExportPdf("EMPLOYEE", companyId, `Export PDF couverture ${formations.length} formation(s)`, auditUser);
      return NextResponse.json({ formations });
    }

    if (type === "coverage_services") {
      const employees = await prisma.employee.findMany({
        where: { companyId, isActive: true },
        include: {
          certificates: {
            where: { isArchived: false },
            include: { formationType: { select: { name: true } } },
          },
        },
      });

      const deptSet = new Set(employees.map((e) => e.department).filter((d): d is string => !!d));
      const departments = [...deptSet].sort();

      const services = departments.map((dept) => {
        const deptEmps = employees.filter((e) => e.department === dept);
        const totalDeptEmployees = deptEmps.length;
        const formationNames = [...new Set(deptEmps.flatMap((e) => e.certificates.map((c) => c.formationType.name)))].sort();

        const formations = formationNames.map((fname) => {
          const employeesWithFormation = deptEmps.filter((e) =>
            e.certificates.some(
              (c) => c.formationType.name === fname && (!c.expiryDate || new Date(c.expiryDate) >= now),
            ),
          ).length;
          const percentage = totalDeptEmployees > 0 ? Math.round((employeesWithFormation / totalDeptEmployees) * 100) : 0;
          return { name: fname, employeesWithFormation, totalEmployees: totalDeptEmployees, percentage };
        });

        const globalPercentage = formations.length > 0
          ? Math.round(formations.reduce((sum, f) => sum + f.percentage, 0) / formations.length)
          : 0;

        return { name: dept, totalEmployees: totalDeptEmployees, formations, globalPercentage };
      });

      await auditExportPdf("EMPLOYEE", companyId, `Export PDF conformite ${services.length} service(s)`, auditUser);
      return NextResponse.json({ services });
    }

    if (type === "passeport_prevention") {
      if (session.user.role === "MANAGER") {
        return NextResponse.json(
          { error: "Acces en lecture seule" },
          { status: 403 },
        );
      }

      const year = request.nextUrl.searchParams.get("year");
      const trimestre = request.nextUrl.searchParams.get("trimestre");
      const dateFilter = parsePpDateFilter(year, trimestre);
      const periodLabel = formatPpPeriodLabel(year, trimestre);

      const [concernedCerts, historyCerts, allEmployees, ppCompany] =
        await Promise.all([
          // Certificats concernes sur la periode
          prisma.certificate.findMany({
            where: {
              isArchived: false,
              employee: { companyId, isActive: true },
              formationType: { isConcernedPP: true },
              ...(dateFilter && { obtainedDate: dateFilter }),
            },
            select: {
              id: true,
              obtainedDate: true,
              ppDeclaredAt: true,
              ppDeclarationRef: true,
              employee: {
                select: {
                  firstName: true,
                  lastName: true,
                  department: true,
                  nir: true,
                },
              },
              formationType: { select: { name: true } },
            },
            orderBy: { obtainedDate: "asc" },
          }),
          // Historique global (toutes declarations, non filtre par periode)
          prisma.certificate.findMany({
            where: {
              employee: { companyId },
              formationType: { isConcernedPP: true },
              ppDeclaredAt: { not: null },
              ppDeclarationRef: { not: null },
            },
            select: {
              id: true,
              ppDeclarationRef: true,
              ppDeclaredAt: true,
              isArchived: true,
            },
            orderBy: { ppDeclaredAt: "desc" },
          }),
          // Employes actifs pour stats par service
          prisma.employee.findMany({
            where: { companyId, isActive: true },
            select: { id: true, department: true, nir: true },
          }),
          prisma.company.findUnique({
            where: { id: companyId },
            select: { name: true, siret: true },
          }),
        ]);

      type PpCert = (typeof concernedCerts)[number];

      const formatName = (c: PpCert) =>
        `${c.employee.lastName} ${c.employee.firstName}`;

      // Ready : non declares, avec NIR
      const ready = concernedCerts
        .filter((c) => !c.ppDeclaredAt && c.employee.nir)
        .map((c) => ({
          employeeName: formatName(c),
          department: c.employee.department || "",
          formationName: c.formationType.name,
          obtainedDate: c.obtainedDate,
          nirMasked: maskNir(c.employee.nir),
        }));

      // Blocked : non declares, sans NIR
      const blocked = concernedCerts
        .filter((c) => !c.ppDeclaredAt && !c.employee.nir)
        .map((c) => ({
          employeeName: formatName(c),
          department: c.employee.department || "",
          formationName: c.formationType.name,
          obtainedDate: c.obtainedDate,
        }));

      // Declared sur la periode : groupes par ppDeclarationRef
      const declaredMap = new Map<
        string,
        {
          ppDeclarationRef: string;
          declaredAt: Date;
          items: Array<{
            employeeName: string;
            formationName: string;
            obtainedDate: Date;
          }>;
        }
      >();
      for (const c of concernedCerts) {
        if (!c.ppDeclaredAt || !c.ppDeclarationRef) continue;
        const ref = c.ppDeclarationRef;
        if (!declaredMap.has(ref)) {
          declaredMap.set(ref, {
            ppDeclarationRef: ref,
            declaredAt: c.ppDeclaredAt,
            items: [],
          });
        }
        declaredMap.get(ref)!.items.push({
          employeeName: formatName(c),
          formationName: c.formationType.name,
          obtainedDate: c.obtainedDate,
        });
      }
      const declared = Array.from(declaredMap.values()).sort(
        (a, b) => b.declaredAt.getTime() - a.declaredAt.getTime(),
      );

      // Historique global : groupe par ppDeclarationRef (non filtre par periode)
      const historyMap = new Map<
        string,
        {
          ppDeclarationRef: string;
          declaredAt: Date;
          count: number;
          activeCount: number;
          archivedCount: number;
        }
      >();
      for (const c of historyCerts) {
        if (!c.ppDeclarationRef || !c.ppDeclaredAt) continue;
        const ref = c.ppDeclarationRef;
        if (!historyMap.has(ref)) {
          historyMap.set(ref, {
            ppDeclarationRef: ref,
            declaredAt: c.ppDeclaredAt,
            count: 0,
            activeCount: 0,
            archivedCount: 0,
          });
        }
        const batch = historyMap.get(ref)!;
        batch.count++;
        if (c.isArchived) batch.archivedCount++;
        else batch.activeCount++;
      }
      const history = Array.from(historyMap.values())
        .sort((a, b) => b.declaredAt.getTime() - a.declaredAt.getTime())
        .slice(0, 50)
        .map((b) => ({
          ...b,
          status:
            b.activeCount > 0 ? ("active" as const) : ("archived" as const),
        }));

      // Counters
      const totalConcerned = concernedCerts.length;
      const alreadyDeclared = concernedCerts.filter(
        (c) => c.ppDeclaredAt !== null,
      ).length;
      const exportable = ready.length;
      const skipped = blocked.length;

      // Stats par service (departement)
      const deptSet = new Set(
        allEmployees
          .map((e) => e.department)
          .filter((d): d is string => !!d && d.trim() !== ""),
      );
      const byService = Array.from(deptSet)
        .map((dept) => {
          const deptTotalEmployees = allEmployees.filter(
            (e) => e.department === dept,
          ).length;
          const deptCerts = concernedCerts.filter(
            (c) => c.employee.department === dept,
          );
          const deptDeclared = deptCerts.filter(
            (c) => c.ppDeclaredAt !== null,
          ).length;
          const deptBlocked = deptCerts.filter(
            (c) => !c.ppDeclaredAt && !c.employee.nir,
          ).length;
          const deptTotalConcerned = deptCerts.length;
          const rate =
            deptTotalConcerned > 0
              ? Math.round((deptDeclared / deptTotalConcerned) * 100)
              : 0;
          return {
            department: dept,
            totalEmployees: deptTotalEmployees,
            totalConcerned: deptTotalConcerned,
            declared: deptDeclared,
            blocked: deptBlocked,
            rate,
          };
        })
        .filter((s) => s.totalConcerned > 0)
        .sort((a, b) => a.rate - b.rate);

      await auditExportPdf(
        "CERTIFICATE",
        companyId,
        `Export PDF Passeport Prevention ${totalConcerned} concernee(s) - periode ${year || "all"}${trimestre ? `/${trimestre}` : ""}`,
        auditUser,
      );

      return NextResponse.json({
        companyName: ppCompany?.name || null,
        companySiret: ppCompany?.siret || null,
        period: { year, trimestre, label: periodLabel },
        counters: { totalConcerned, exportable, alreadyDeclared, skipped },
        ready,
        declared,
        blocked,
        history,
        byService,
      });
    }

    // Default: full_report
    const employees = await prisma.employee.findMany({
      where: { companyId, isActive: true },
      include: {
        certificates: {
          where: { isArchived: false },
          include: { formationType: true },
          orderBy: { expiryDate: "asc" },
        },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true },
    });

    // Sous-section Passeport Prevention : derive depuis les employees deja charges.
    // Periode = annee civile en cours (cycle declaratif).
    const currentYear = now.getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

    const ppConcerned: Array<{
      employeeName: string;
      department: string;
      formationName: string;
      obtainedDate: Date;
      ppDeclaredAt: Date | null;
      hasNir: boolean;
    }> = [];

    for (const emp of employees) {
      for (const cert of emp.certificates) {
        if (!cert.formationType.isConcernedPP) continue;
        const d = cert.obtainedDate ? new Date(cert.obtainedDate) : null;
        if (!d || d < yearStart || d > yearEnd) continue;
        ppConcerned.push({
          employeeName: `${emp.lastName} ${emp.firstName}`,
          department: emp.department || "",
          formationName: cert.formationType.name,
          obtainedDate: cert.obtainedDate,
          ppDeclaredAt: cert.ppDeclaredAt,
          hasNir: !!emp.nir,
        });
      }
    }

    let passeportPrevention: {
      counters: {
        totalConcerned: number;
        exportable: number;
        alreadyDeclared: number;
        skipped: number;
      };
      topReady: Array<{
        employeeName: string;
        department: string;
        formationName: string;
        obtainedDate: Date;
      }>;
      blocked: Array<{
        employeeName: string;
        department: string;
        formationName: string;
      }>;
    } | null = null;

    if (ppConcerned.length > 0) {
      const ppAlreadyDeclared = ppConcerned.filter(
        (c) => c.ppDeclaredAt !== null,
      ).length;
      const ppReady = ppConcerned.filter(
        (c) => !c.ppDeclaredAt && c.hasNir,
      );
      const ppBlocked = ppConcerned.filter(
        (c) => !c.ppDeclaredAt && !c.hasNir,
      );
      const ppTopReady = ppReady
        .slice(0, ppReady.length > 20 ? 10 : ppReady.length)
        .map((c) => ({
          employeeName: c.employeeName,
          department: c.department,
          formationName: c.formationName,
          obtainedDate: c.obtainedDate,
        }));

      passeportPrevention = {
        counters: {
          totalConcerned: ppConcerned.length,
          exportable: ppReady.length,
          alreadyDeclared: ppAlreadyDeclared,
          skipped: ppBlocked.length,
        },
        topReady: ppTopReady,
        blocked: ppBlocked.map((c) => ({
          employeeName: c.employeeName,
          department: c.department,
          formationName: c.formationName,
        })),
      };
    }

    await auditExportPdf("EMPLOYEE", companyId, `Export PDF ${employees.length} employe(s)`, auditUser);

    return NextResponse.json({
      employees,
      companyName: company?.name || null,
      passeportPrevention,
    });
  } catch (error) {
    console.error("Error fetching export data:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recuperation des donnees" },
      { status: 500 },
    );
  }
}