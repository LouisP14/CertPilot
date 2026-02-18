import { auditDelete, auditUpdate } from "@/lib/audit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET: Détail d'une offre
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; offeringId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { offeringId } = await params;

    const offering = await prisma.trainingCenterOffering.findFirst({
      where: { id: offeringId, trainingCenter: { companyId: session.user.companyId } },
      include: {
        formationType: true,
        trainingCenter: true,
      },
    });

    if (!offering) {
      return NextResponse.json({ error: "Offre non trouvée" }, { status: 404 });
    }

    return NextResponse.json(offering);
  } catch (error) {
    console.error("GET offering error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'offre" },
      { status: 500 },
    );
  }
}

// PUT: Modifier une offre
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; offeringId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (
      session.user?.role !== "ADMIN" &&
      session.user?.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent modifier les offres" },
        { status: 403 },
      );
    }

    const { offeringId } = await params;
    const body = await request.json();
    const {
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

    // Récupérer les anciennes valeurs pour l'audit + vérification appartenance
    const oldOffering = await prisma.trainingCenterOffering.findFirst({
      where: { id: offeringId, trainingCenter: { companyId: session.user.companyId } },
      include: { formationType: true, trainingCenter: true },
    });
    if (!oldOffering) {
      return NextResponse.json({ error: "Offre non trouvée" }, { status: 404 });
    }

    const offering = await prisma.trainingCenterOffering.update({
      where: { id: offeringId },
      data: {
        pricePerPerson:
          pricePerPerson !== undefined ? parseFloat(pricePerPerson) : undefined,
        pricePerSession:
          pricePerSession !== undefined
            ? pricePerSession
              ? parseFloat(pricePerSession)
              : null
            : undefined,
        minParticipants:
          minParticipants !== undefined ? parseInt(minParticipants) : undefined,
        maxParticipants:
          maxParticipants !== undefined ? parseInt(maxParticipants) : undefined,
        durationHours:
          durationHours !== undefined
            ? durationHours
              ? parseFloat(durationHours)
              : null
            : undefined,
        durationDays:
          durationDays !== undefined
            ? durationDays
              ? parseInt(durationDays)
              : null
            : undefined,
        availableModes: availableModes || undefined,
        certificationCode:
          certificationCode !== undefined
            ? certificationCode || null
            : undefined,
        isOPCOEligible:
          isOPCOEligible !== undefined ? isOPCOEligible : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
      include: {
        formationType: true,
        trainingCenter: true,
      },
    });

    // Audit trail
    await auditUpdate(
      "OFFERING",
      offering.id,
      `${offering.formationType.name} - ${offering.trainingCenter.name}`,
      {
        pricePerPerson: oldOffering.pricePerPerson,
        pricePerSession: oldOffering.pricePerSession,
        minParticipants: oldOffering.minParticipants,
        maxParticipants: oldOffering.maxParticipants,
        availableModes: oldOffering.availableModes,
        isActive: oldOffering.isActive,
      },
      {
        pricePerPerson: offering.pricePerPerson,
        pricePerSession: offering.pricePerSession,
        minParticipants: offering.minParticipants,
        maxParticipants: offering.maxParticipants,
        availableModes: offering.availableModes,
        isActive: offering.isActive,
      },
      session.user
        ? {
            id: session.user.id,
            name: session.user.name || undefined,
            email: session.user.email || undefined,
          }
        : null,
    );

    return NextResponse.json(offering);
  } catch (error) {
    console.error("PUT offering error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de l'offre" },
      { status: 500 },
    );
  }
}

// DELETE: Supprimer une offre
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; offeringId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (
      session.user?.role !== "ADMIN" &&
      session.user?.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent supprimer les offres" },
        { status: 403 },
      );
    }

    const { offeringId } = await params;

    // Récupérer l'offre pour l'audit + vérification appartenance
    const offering = await prisma.trainingCenterOffering.findFirst({
      where: { id: offeringId, trainingCenter: { companyId: session.user.companyId } },
      include: { formationType: true, trainingCenter: true },
    });
    if (!offering) {
      return NextResponse.json({ error: "Offre non trouvée" }, { status: 404 });
    }

    await prisma.trainingCenterOffering.delete({
      where: { id: offeringId },
    });

    // Audit trail
    await auditDelete(
      "OFFERING",
      offering.id,
      `${offering.formationType.name} - ${offering.trainingCenter.name}`,
      {
        formation: offering.formationType.name,
        centre: offering.trainingCenter.name,
        pricePerPerson: offering.pricePerPerson,
        pricePerSession: offering.pricePerSession,
      },
      session.user
        ? {
            id: session.user.id,
            name: session.user.name || undefined,
            email: session.user.email || undefined,
          }
        : null,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE offering error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'offre" },
      { status: 500 },
    );
  }
}
