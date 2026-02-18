import { auditCreate } from "@/lib/audit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET: Liste des offres d'un centre
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const offerings = await prisma.trainingCenterOffering.findMany({
      where: { trainingCenterId: id },
      include: {
        formationType: {
          select: {
            id: true,
            name: true,
            category: true,
            service: true,
            durationHours: true,
            durationDays: true,
            estimatedCostPerPerson: true,
            estimatedCostPerSession: true,
          },
        },
      },
      orderBy: { formationType: { name: "asc" } },
    });

    return NextResponse.json(offerings);
  } catch (error) {
    console.error("GET offerings error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des offres" },
      { status: 500 },
    );
  }
}

// POST: Créer une nouvelle offre
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (session.user?.role !== "ADMIN" && session.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent ajouter des offres" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      formationTypeId,
      pricePerPerson,
      pricePerSession,
      minParticipants,
      maxParticipants,
      durationHours,
      durationDays,
      availableModes,
      certificationCode,
      isOPCOEligible,
      isActive,
    } = body;

    // Vérifier que le centre existe
    const center = await prisma.trainingCenter.findUnique({
      where: { id },
    });
    if (!center) {
      return NextResponse.json({ error: "Centre non trouvé" }, { status: 404 });
    }

    // Vérifier que le type de formation existe
    const formationType = await prisma.formationType.findUnique({
      where: { id: formationTypeId },
    });
    if (!formationType) {
      return NextResponse.json(
        { error: "Type de formation non trouvé" },
        { status: 404 },
      );
    }

    // Vérifier qu'il n'y a pas déjà une offre pour ce centre/formation
    const existing = await prisma.trainingCenterOffering.findUnique({
      where: {
        trainingCenterId_formationTypeId: {
          trainingCenterId: id,
          formationTypeId,
        },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Une offre existe déjà pour cette formation dans ce centre" },
        { status: 400 },
      );
    }

    const offering = await prisma.trainingCenterOffering.create({
      data: {
        trainingCenterId: id,
        formationTypeId,
        pricePerPerson: parseFloat(pricePerPerson),
        pricePerSession: pricePerSession ? parseFloat(pricePerSession) : null,
        minParticipants: minParticipants ? parseInt(minParticipants) : 1,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : 12,
        durationHours: durationHours ? parseFloat(durationHours) : null,
        durationDays: durationDays ? parseInt(durationDays) : null,
        availableModes: availableModes || "PRESENTIEL",
        certificationCode: certificationCode || null,
        isOPCOEligible: isOPCOEligible ?? true,
        isActive: isActive ?? true,
      },
      include: {
        formationType: true,
        trainingCenter: true,
      },
    });

    // Audit trail
    await auditCreate(
      "OFFERING",
      offering.id,
      `${offering.formationType.name} - ${offering.trainingCenter.name}`,
      {
        formation: offering.formationType.name,
        centre: offering.trainingCenter.name,
        pricePerPerson,
        pricePerSession,
        minParticipants,
        maxParticipants,
        availableModes,
      },
      session.user
        ? {
            id: session.user.id,
            name: session.user.name || undefined,
            email: session.user.email || undefined,
          }
        : null,
    );

    return NextResponse.json(offering, { status: 201 });
  } catch (error) {
    console.error("POST offering error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'offre" },
      { status: 500 },
    );
  }
}
