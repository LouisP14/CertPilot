import { auditCreate } from "@/lib/audit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { invalidateSignatureIfExists } from "@/lib/signature-utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const {
      employeeId,
      formationTypeId,
      obtainedDate,
      expiryDate,
      organism,
      details,
    } = body;

    if (!employeeId || !formationTypeId || !obtainedDate) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 },
      );
    }

    // SÉCURITÉ : vérifier que l'employé appartient bien à l'entreprise de l'utilisateur
    if (!session.user.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const employeeOwnership = await prisma.employee.findFirst({
      where: { id: employeeId, companyId: session.user.companyId },
    });
    if (!employeeOwnership) {
      return NextResponse.json(
        { error: "Employé non trouvé" },
        { status: 404 },
      );
    }

    const certificate = await prisma.certificate.create({
      data: {
        employeeId,
        formationTypeId,
        obtainedDate: new Date(obtainedDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        organism: organism || null,
        details: details || null,
      },
      include: {
        formationType: true,
        employee: true,
      },
    });

    // Invalider la signature si elle existe (modification du contenu du passeport)
    await invalidateSignatureIfExists(employeeId);

    // Audit Trail
    await auditCreate(
      "CERTIFICATE",
      certificate.id,
      `${certificate.formationType.name} - ${certificate.employee.firstName} ${certificate.employee.lastName}`,
      {
        formationType: certificate.formationType.name,
        employeeName: `${certificate.employee.firstName} ${certificate.employee.lastName}`,
        obtainedDate,
        expiryDate,
        organism,
      },
      session.user
        ? {
            id: session.user.id,
            name: session.user.name || undefined,
            email: session.user.email || undefined,
          }
        : null,
    );

    return NextResponse.json(certificate, { status: 201 });
  } catch (error) {
    console.error("POST certificate error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du certificat" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    const where: any = {
      isArchived: false,
    };

    if (employeeId) {
      where.employeeId = employeeId;
    }

    // Filtrer par companyId via l'employé
    if (!session.user.companyId) {
      return NextResponse.json([]);
    }
    where.employee = {
      companyId: session.user.companyId,
    };

    const certificates = await prisma.certificate.findMany({
      where,
      include: {
        formationType: true,
        employee: true,
      },
      orderBy: { expiryDate: "asc" },
    });

    return NextResponse.json(certificates);
  } catch (error) {
    console.error("GET certificates error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des certificats" },
      { status: 500 },
    );
  }
}
