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

    // Filtrer par companyId - chaque utilisateur ne voit que ses données
    if (!session.user.companyId) {
      return NextResponse.json([]);
    }
    const whereClause = {
      isActive: true,
      companyId: session.user.companyId,
    };

    const trainingCenters = await prisma.trainingCenter.findMany({
      where: whereClause,
      include: {
        offerings: {
          include: { formationType: true },
        },
        _count: {
          select: { sessions: true, offerings: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(trainingCenters);
  } catch (error) {
    console.error("GET training centers error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des centres" },
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

    if (
      session.user?.role !== "ADMIN" &&
      session.user?.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent créer des centres" },
        { status: 403 },
      );
    }

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
    } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: "Le nom est obligatoire" },
        { status: 400 },
      );
    }

    // Vérifier que le code est unique si fourni
    if (code) {
      const existing = await prisma.trainingCenter.findUnique({
        where: { code },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Ce code existe déjà" },
          { status: 400 },
        );
      }
    }

    const trainingCenter = await prisma.trainingCenter.create({
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
        companyId: session.user.companyId, // Ajouter le companyId
      },
    });

    // Audit trail
    await auditCreate(
      "TRAINING_CENTER",
      trainingCenter.id,
      trainingCenter.name,
      {
        name,
        code,
        city,
        isPartner,
        contactEmail,
      },
      session.user
        ? {
            id: session.user.id,
            name: session.user.name || undefined,
            email: session.user.email || undefined,
          }
        : null,
    );

    return NextResponse.json(trainingCenter, { status: 201 });
  } catch (error) {
    console.error("POST training center error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du centre" },
      { status: 500 },
    );
  }
}
