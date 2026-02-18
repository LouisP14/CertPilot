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

    const trainingCenter = await prisma.trainingCenter.findFirst({
      where: { id, companyId: session.user.companyId },
      include: {
        offerings: {
          include: { formationType: true },
        },
        sessions: {
          take: 10,
          orderBy: { startDate: "desc" },
        },
      },
    });

    if (!trainingCenter) {
      return NextResponse.json({ error: "Centre non trouvé" }, { status: 404 });
    }

    return NextResponse.json(trainingCenter);
  } catch (error) {
    console.error("GET training center error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du centre" },
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
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (
      session.user?.role !== "ADMIN" &&
      session.user?.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent modifier les centres" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      code,
      address,
      city,
      postalCode,
      country,
      contactName,
      contactEmail,
      contactPhone,
      website,
      isPartner,
      discountPercent,
      paymentTerms,
      notes,
      maxCapacity,
      hasOwnPremises,
      canTravel,
      rating,
    } = body;

    // Récupérer les anciennes valeurs pour l'audit + vérification appartenance
    const oldCenter = await prisma.trainingCenter.findFirst({
      where: { id, companyId: session.user.companyId },
    });
    if (!oldCenter) {
      return NextResponse.json({ error: "Centre non trouvé" }, { status: 404 });
    }

    // Vérifier que le code est unique si modifié
    if (code) {
      const existing = await prisma.trainingCenter.findFirst({
        where: {
          code,
          NOT: { id },
        },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Ce code existe déjà" },
          { status: 400 },
        );
      }
    }

    const trainingCenter = await prisma.trainingCenter.update({
      where: { id },
      data: {
        name,
        code: code || null,
        address: address || null,
        city: city || null,
        postalCode: postalCode || null,
        country: country || "France",
        contactName: contactName || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        website: website || null,
        isPartner: isPartner || false,
        discountPercent: discountPercent ? parseFloat(discountPercent) : null,
        paymentTerms: paymentTerms || null,
        notes: notes || null,
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : null,
        hasOwnPremises: hasOwnPremises !== false,
        canTravel: canTravel || false,
        rating: rating ? parseFloat(rating) : null,
      },
    });

    // Audit trail
    await auditUpdate(
      "TRAINING_CENTER",
      trainingCenter.id,
      trainingCenter.name,
      {
        name: oldCenter.name,
        code: oldCenter.code,
        city: oldCenter.city,
        isPartner: oldCenter.isPartner,
        contactEmail: oldCenter.contactEmail,
      },
      {
        name: trainingCenter.name,
        code: trainingCenter.code,
        city: trainingCenter.city,
        isPartner: trainingCenter.isPartner,
        contactEmail: trainingCenter.contactEmail,
      },
      session.user
        ? {
            id: session.user.id,
            name: session.user.name || undefined,
            email: session.user.email || undefined,
          }
        : null,
    );

    return NextResponse.json(trainingCenter);
  } catch (error) {
    console.error("PUT training center error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du centre" },
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
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (
      session.user?.role !== "ADMIN" &&
      session.user?.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent supprimer les centres" },
        { status: 403 },
      );
    }

    const { id } = await params;

    // Récupérer le centre pour l'audit + vérification appartenance
    const center = await prisma.trainingCenter.findFirst({
      where: { id, companyId: session.user.companyId },
    });
    if (!center) {
      return NextResponse.json({ error: "Centre non trouvé" }, { status: 404 });
    }

    // Soft delete
    await prisma.trainingCenter.update({
      where: { id },
      data: { isActive: false },
    });

    // Audit trail
    await auditDelete(
      "TRAINING_CENTER",
      center.id,
      center.name,
      {
        name: center.name,
        code: center.code,
        city: center.city,
      },
      session.user
        ? {
            id: session.user.id,
            name: session.user.name || undefined,
            email: session.user.email || undefined,
          }
        : null,
    );

    return NextResponse.json({ message: "Centre désactivé" });
  } catch (error) {
    console.error("DELETE training center error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du centre" },
      { status: 500 },
    );
  }
}
