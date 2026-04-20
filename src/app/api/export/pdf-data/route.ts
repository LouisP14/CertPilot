import { auditExportPdf } from "@/lib/audit";
import { auth } from "@/lib/auth";
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

    await auditExportPdf("EMPLOYEE", companyId, `Export PDF ${employees.length} employe(s)`, auditUser);

    return NextResponse.json({ employees, companyName: company?.name || null });
  } catch (error) {
    console.error("Error fetching export data:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recuperation des donnees" },
      { status: 500 },
    );
  }
}