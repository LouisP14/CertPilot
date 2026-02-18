import { Button } from "@/components/ui/button";
import { getCompanyFilter } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getCertificateStatus } from "@/lib/utils";
import { AlertCircle, Plus, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmployeesList } from "./employees-list";

export const metadata: Metadata = { title: "Employés" };

async function getEmployees() {
  const companyFilter = await getCompanyFilter();
  const employees = await prisma.employee.findMany({
    where: { isActive: true, ...companyFilter },
    include: {
      manager: true,
      certificates: {
        where: { isArchived: false },
        include: { formationType: true },
      },
      passportSignature: {
        select: {
          status: true,
        },
      },
    },
    orderBy: { lastName: "asc" },
  });

  return employees.map((emp) => {
    const statuses = emp.certificates.map((c) =>
      getCertificateStatus(c.expiryDate),
    );

    const validCount = statuses.filter((s) => s === "valid").length;
    const expiringCount = statuses.filter((s) => s === "expiring").length;
    const expiredCount = statuses.filter((s) => s === "expired").length;

    return {
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      photo: emp.photo,
      employeeId: emp.employeeId,
      position: emp.position,
      department: emp.department,
      qrToken: emp.qrToken,
      passportSignature: emp.passportSignature,
      statusCounts: {
        valid: validCount,
        expiring: expiringCount,
        expired: expiredCount,
      },
      certificateCount: emp.certificates.length,
    };
  });
}

async function getEmployeeLimit() {
  const companyFilter = await getCompanyFilter();
  if (!companyFilter?.companyId) return { limit: null, plan: null };

  const company = await prisma.company.findUnique({
    where: { id: companyFilter.companyId },
    select: { employeeLimit: true, subscriptionPlan: true },
  });

  return {
    limit: company?.employeeLimit ?? null,
    plan: company?.subscriptionPlan ?? null,
  };
}

export default async function EmployeesPage() {
  const [employees, { limit, plan }] = await Promise.all([
    getEmployees(),
    getEmployeeLimit(),
  ]);

  const currentCount = employees.length;
  const atLimit = limit !== null && currentCount >= limit;
  const usagePct = limit ? Math.round((currentCount / limit) * 100) : 0;
  const badgeCls =
    usagePct >= 100
      ? "bg-red-100 text-red-700 border border-red-300"
      : usagePct >= 80
        ? "bg-orange-100 text-orange-700 border border-orange-300"
        : "bg-gray-100 text-gray-600 border border-gray-300";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employés</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-600">
              Gérer les passeports formation de vos employés
            </p>
            {limit !== null && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeCls}`}>
                <Users className="h-3 w-3" />
                {currentCount} / {limit} employés
                {plan && (
                  <span className="ml-1 opacity-70">· {plan}</span>
                )}
              </span>
            )}
          </div>
          {atLimit && (
            <p className="flex items-center gap-1 text-sm text-red-600 mt-1">
              <AlertCircle className="h-4 w-4" />
              Limite atteinte — passez à un plan supérieur pour ajouter des employés.
            </p>
          )}
        </div>
        {atLimit ? (
          <Button disabled title="Limite d'employés atteinte">
            <Plus className="mr-2 h-4 w-4" />
            Nouvel employé
          </Button>
        ) : (
          <Link href="/dashboard/employees/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel employé
            </Button>
          </Link>
        )}
      </div>

      <EmployeesList employees={employees} />
    </div>
  );
}
