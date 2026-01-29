import { auditCreate } from "@/lib/audit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Filtrer par companyId - SÉCURITÉ: si pas de companyId, ne rien retourner
    const whereClause: { isActive: boolean; companyId?: string } = {
      isActive: true,
    };
    if (session.user.role === "SUPER_ADMIN") {
      // Super admin voit tout
    } else if (session.user.companyId) {
      whereClause.companyId = session.user.companyId;
    } else {
      // Pas de companyId = pas d'accès aux données
      return NextResponse.json([]);
    }

    const employees = await prisma.employee.findMany({
      where: whereClause,
      include: {
        manager: {
          select: { id: true, firstName: true, lastName: true },
        },
        certificates: {
          where: { isArchived: false },
          include: { formationType: true },
        },
      },
      orderBy: { lastName: "asc" },
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error("GET employees error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des employés" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
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

    // Validation
    if (!firstName || !lastName || !employeeId || !position || !department) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 },
      );
    }

    // Check if employeeId already exists (dans la même companyId)
    const whereUnique: any = { employeeId };
    if (session.user.role !== "SUPER_ADMIN" && session.user.companyId) {
      // Pour les non super admins, vérifier aussi le companyId
      const existingEmployee = await prisma.employee.findFirst({
        where: {
          employeeId,
          companyId: session.user.companyId,
        },
      });

      if (existingEmployee) {
        return NextResponse.json(
          { error: "Ce matricule existe déjà" },
          { status: 400 },
        );
      }
    } else {
      const existingEmployee = await prisma.employee.findUnique({
        where: whereUnique,
      });

      if (existingEmployee) {
        return NextResponse.json(
          { error: "Ce matricule existe déjà" },
          { status: 400 },
        );
      }
    }

    const employee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        email: email || null,
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
        companyId: session.user.companyId, // Ajouter le companyId
      },
    });

    // Audit Trail
    await auditCreate(
      "EMPLOYEE",
      employee.id,
      `${employee.firstName} ${employee.lastName}`,
      {
        firstName,
        lastName,
        email,
        employeeId,
        position,
        department,
        site,
        team,
      },
      session.user
        ? {
            id: session.user.id,
            name: session.user.name || undefined,
            email: session.user.email || undefined,
          }
        : null,
    );

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error("POST employee error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'employé" },
      { status: 500 },
    );
  }
}
