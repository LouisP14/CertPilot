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

    const formationTypes = await prisma.formationType.findMany({
      where: whereClause,
      orderBy: { name: "asc" },
    });

    return NextResponse.json(formationTypes);
  } catch (error) {
    console.error("GET formation types error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des formations" },
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
    const { name, category, service, defaultValidityMonths } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Le nom est obligatoire" },
        { status: 400 },
      );
    }

    const formationType = await prisma.formationType.create({
      data: {
        name,
        category: category || null,
        service: service || null,
        defaultValidityMonths: defaultValidityMonths
          ? parseInt(defaultValidityMonths)
          : null,
        companyId: session.user.companyId, // Ajouter le companyId
      },
    });

    // Audit Trail
    await auditCreate(
      "FORMATION_TYPE",
      formationType.id,
      formationType.name,
      { name, category, service, defaultValidityMonths },
      session.user
        ? {
            id: session.user.id,
            name: session.user.name || undefined,
            email: session.user.email || undefined,
          }
        : null,
    );

    return NextResponse.json(formationType, { status: 201 });
  } catch (error) {
    console.error("POST formation type error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la formation" },
      { status: 500 },
    );
  }
}
