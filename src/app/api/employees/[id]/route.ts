import { auditDelete, auditUpdate } from "@/lib/audit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const employee = await prisma.employee.findUnique({
      where: {
        id,
        companyId: session.user.companyId, // Isolation par entreprise
      },
      include: {
        manager: {
          select: { id: true, firstName: true, lastName: true },
        },
        certificates: {
          include: { formationType: true },
          orderBy: { expiryDate: "asc" },
        },
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employé non trouvé" },
        { status: 404 },
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error("GET employee error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'employé" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    if (
      session.user?.role !== "ADMIN" &&
      session.user?.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent modifier les employés" },
        { status: 403 },
      );
    }

    const companyId = session.user.companyId;
    const { id } = await params;
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      photo,
      employeeId,
      position,
      department,
      site,
      team,
      hourlyCost,
      contractType,
      workingHoursPerDay,
      managerId,
      managerEmail,
      medicalCheckupDate,
    } = body;

    // Récupérer l'employé actuel pour l'audit - avec vérification companyId
    const currentEmployee = await prisma.employee.findUnique({
      where: { id, companyId },
    });
    if (!currentEmployee) {
      return NextResponse.json(
        { error: "Employé non trouvé" },
        { status: 404 },
      );
    }

    // Check if employeeId is already used by another employee in the same company
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        employeeId,
        companyId,
        NOT: { id },
      },
    });

    if (existingEmployee) {
      return NextResponse.json(
        { error: "Ce matricule est déjà utilisé par un autre employé" },
        { status: 400 },
      );
    }

    const employee = await prisma.employee.update({
      where: { id, companyId },
      data: {
        firstName,
        lastName,
        email: email || null,
        photo: photo || null,
        employeeId,
        position,
        department,
        site: site || null,
        team: team || null,
        hourlyCost: hourlyCost ? parseFloat(hourlyCost) : null,
        contractType: contractType || null,
        workingHoursPerDay: workingHoursPerDay
          ? parseFloat(workingHoursPerDay)
          : 7,
        managerId: managerId || null,
        managerEmail: managerEmail || null,
        medicalCheckupDate: medicalCheckupDate
          ? new Date(medicalCheckupDate)
          : null,
      },
    });

    // Audit Trail
    await auditUpdate(
      "EMPLOYEE",
      employee.id,
      `${employee.firstName} ${employee.lastName}`,
      {
        firstName: currentEmployee.firstName,
        lastName: currentEmployee.lastName,
        email: currentEmployee.email,
        position: currentEmployee.position,
        department: currentEmployee.department,
      },
      { firstName, lastName, email, position, department },
      session.user
        ? {
            id: session.user.id,
            name: session.user.name || undefined,
            email: session.user.email || undefined,
          }
        : null,
    );

    return NextResponse.json(employee);
  } catch (error) {
    console.error("PUT employee error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'employé" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const companyId = session.user.companyId;
    const { id } = await params;

    // Récupérer l'employé pour l'audit avant suppression - avec vérification companyId
    const employeeToDelete = await prisma.employee.findUnique({
      where: { id, companyId },
    });

    if (!employeeToDelete) {
      return NextResponse.json(
        { error: "Employé non trouvé" },
        { status: 404 },
      );
    }

    // Soft delete - just mark as inactive
    await prisma.employee.update({
      where: { id, companyId },
      data: { isActive: false },
    });

    // Audit Trail
    if (employeeToDelete) {
      await auditDelete(
        "EMPLOYEE",
        id,
        `${employeeToDelete.firstName} ${employeeToDelete.lastName}`,
        {
          firstName: employeeToDelete.firstName,
          lastName: employeeToDelete.lastName,
          email: employeeToDelete.email,
          position: employeeToDelete.position,
          department: employeeToDelete.department,
        },
        session.user
          ? {
              id: session.user.id,
              name: session.user.name || undefined,
              email: session.user.email || undefined,
            }
          : null,
      );
    }

    return NextResponse.json({ message: "Employé désactivé" });
  } catch (error) {
    console.error("DELETE employee error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'employé" },
      { status: 500 },
    );
  }
}
