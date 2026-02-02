import { Button } from "@/components/ui/button";
import { getCompanyFilter } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getCertificateStatus } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { EmployeesList } from "./employees-list";

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

export default async function EmployeesPage() {
  const employees = await getEmployees();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employés</h1>
          <p className="text-gray-600">
            Gérer les passeports formation de vos employés
          </p>
        </div>
        <Link href="/dashboard/employees/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel employé
          </Button>
        </Link>
      </div>

      <EmployeesList employees={employees} />
    </div>
  );
}
