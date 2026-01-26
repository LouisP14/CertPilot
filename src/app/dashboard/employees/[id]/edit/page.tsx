import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EmployeeForm } from "../../new/page";

async function getEmployee(id: string) {
  const employee = await prisma.employee.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      photo: true,
      employeeId: true,
      position: true,
      department: true,
      site: true,
      team: true,
      hourlyCost: true,
      contractType: true,
      workingHoursPerDay: true,
      managerId: true,
      managerEmail: true,
      medicalCheckupDate: true,
    },
  });

  return employee;
}

async function getEmployees() {
  return prisma.employee.findMany({
    where: { isActive: true },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { lastName: "asc" },
  });
}

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [employee, employees] = await Promise.all([
    getEmployee(id),
    getEmployees(),
  ]);

  if (!employee) {
    notFound();
  }

  return <EmployeeForm employee={employee} employees={employees} />;
}
