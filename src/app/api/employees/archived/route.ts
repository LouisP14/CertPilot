import { auditCreate, auditDelete } from "@/lib/audit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Liste des employés archivés
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const employees = await prisma.employee.findMany({
      where: {
        isActive: false,
        companyId: session.user.companyId,
      },
      include: {
        certificates: {
          include: { formationType: true },
          orderBy: { expiryDate: "desc" },
        },
        _count: {
          select: {
            certificates: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error("GET archived employees error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des employés archivés" },
      { status: 500 },
    );
  }
}

// PATCH - Restaurer un employé archivé
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { employeeId, restoreCertificates } = await request.json();

    if (!employeeId) {
      return NextResponse.json({ error: "ID employé requis" }, { status: 400 });
    }

    // Vérifier que l'employé appartient à la company et est archivé
    const employee = await prisma.employee.findUnique({
      where: {
        id: employeeId,
        companyId: session.user.companyId,
        isActive: false,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employé archivé non trouvé" },
        { status: 404 },
      );
    }

    // Vérifier la limite d'employés
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: { employeeLimit: true },
    });

    const activeCount = await prisma.employee.count({
      where: { companyId: session.user.companyId, isActive: true },
    });

    if (company?.employeeLimit && activeCount >= company.employeeLimit) {
      return NextResponse.json(
        {
          error:
            "Limite d'employés atteinte. Passez à un plan supérieur pour réintégrer cet employé.",
        },
        { status: 403 },
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. Réactiver l'employé
      await tx.employee.update({
        where: { id: employeeId },
        data: { isActive: true },
      });

      // 2. Restaurer les certificats si demandé
      if (restoreCertificates) {
        await tx.certificate.updateMany({
          where: {
            employeeId,
            isArchived: true,
          },
          data: { isArchived: false, archivedAt: null },
        });
      }
    });

    // Audit Trail
    await auditCreate(
      "EMPLOYEE",
      employeeId,
      `${employee.firstName} ${employee.lastName}`,
      {
        action: "RESTORE",
        restoreCertificates,
        firstName: employee.firstName,
        lastName: employee.lastName,
      },
      session.user
        ? {
            id: session.user.id,
            name: session.user.name || undefined,
            email: session.user.email || undefined,
          }
        : null,
    );

    return NextResponse.json({
      success: true,
      message: `${employee.firstName} ${employee.lastName} a été réintégré${restoreCertificates ? " avec ses certificats" : ""}.`,
    });
  } catch (error) {
    console.error("PATCH restore employee error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la restauration de l'employé" },
      { status: 500 },
    );
  }
}

// DELETE - Supprimer définitivement un employé archivé
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("id");

    if (!employeeId) {
      return NextResponse.json({ error: "ID employé requis" }, { status: 400 });
    }

    // Vérifier que l'employé appartient à la company et est archivé
    const employee = await prisma.employee.findUnique({
      where: {
        id: employeeId,
        companyId: session.user.companyId,
        isActive: false,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employé archivé non trouvé" },
        { status: 404 },
      );
    }

    // Suppression définitive (cascade supprime les certificats, absences, etc.)
    await prisma.employee.delete({
      where: { id: employeeId },
    });

    // Audit Trail
    await auditDelete(
      "EMPLOYEE",
      employeeId,
      `${employee.firstName} ${employee.lastName}`,
      {
        action: "PERMANENT_DELETE",
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        position: employee.position,
        department: employee.department,
      },
      session.user
        ? {
            id: session.user.id,
            name: session.user.name || undefined,
            email: session.user.email || undefined,
          }
        : null,
    );

    return NextResponse.json({
      success: true,
      message: `${employee.firstName} ${employee.lastName} a été supprimé définitivement.`,
    });
  } catch (error) {
    console.error("DELETE permanent employee error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression définitive" },
      { status: 500 },
    );
  }
}
