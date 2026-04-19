import { auth, getEmployeeFilter } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { detectTrainingNeeds } from "@/lib/detect-training-needs";
import prisma from "@/lib/prisma";
import { parseBody, generateNeedsSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

// GET: Liste des besoins de formation
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier companyId
    if (!session.user.companyId) {
      return NextResponse.json([]);
    }
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // PENDING, PLANNED, COMPLETED, CANCELLED
    const formationTypeId = searchParams.get("formationTypeId");

    const employeeFilter = await getEmployeeFilter();
    const where: Record<string, unknown> = {
      employee: employeeFilter,
    };
    if (status) where.status = status;
    if (formationTypeId) where.formationTypeId = formationTypeId;

    const needs = await prisma.trainingNeed.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            position: true,
            department: true,
            site: true,
            team: true,
            hourlyCost: true,
          },
        },
        formationType: {
          select: {
            id: true,
            name: true,
            category: true,
            service: true,
            durationHours: true,
            durationDays: true,
            isLegalObligation: true,
            renewalPriority: true,
          },
        },
      },
      orderBy: [{ priority: "desc" }, { expiryDate: "asc" }],
      take: 500,
    });

    return NextResponse.json(needs);
  } catch (error) {
    console.error("GET training needs error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des besoins" },
      { status: 500 },
    );
  }
}

// POST: Détecter les besoins de formation (scanner les certificats expirant)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (
      session.user?.role !== "ADMIN" &&
      session.user?.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent lancer la détection" },
        { status: 403 },
      );
    }

    if (!session.user.companyId) {
      return NextResponse.json(
        { error: "Company non définie" },
        { status: 400 },
      );
    }
    const companyId = session.user.companyId;

    const body = await request.json();
    const parsed = parseBody(generateNeedsSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { horizonDays = 90 } = parsed.data;

    const result = await detectTrainingNeeds(companyId, horizonDays);

    createAuditLog({
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      companyId,
      action: "CREATE",
      entityType: "TRAINING_NEED",
      entityName: "Détection automatique",
      description: `Détection des besoins de formation : ${result.created} nouveau(x) besoin(s) créé(s) (horizon ${horizonDays}j)`,
      metadata: { created: result.created, horizonDays },
    });

    return NextResponse.json({
      success: true,
      created: result.created,
      message: `${result.created} nouveau(x) besoin(s) détecté(s)`,
    });
  } catch (error) {
    console.error("POST training needs detection error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la détection des besoins" },
      { status: 500 },
    );
  }
}
