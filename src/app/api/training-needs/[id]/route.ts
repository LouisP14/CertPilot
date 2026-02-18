import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// PUT: Mettre à jour le statut d'un besoin
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, plannedSessionId } = body;

    // SÉCURITÉ : vérifier que le besoin appartient à l'entreprise
    const existingNeed = await prisma.trainingNeed.findFirst({
      where: { id, employee: { companyId: session.user.companyId } },
    });
    if (!existingNeed) {
      return NextResponse.json({ error: "Besoin non trouvé" }, { status: 404 });
    }

    const need = await prisma.trainingNeed.update({
      where: { id },
      data: {
        status: status || undefined,
        plannedSessionId: plannedSessionId || undefined,
      },
      include: {
        employee: true,
        formationType: true,
      },
    });

    return NextResponse.json(need);
  } catch (error) {
    console.error("PUT training need error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du besoin" },
      { status: 500 },
    );
  }
}

// DELETE: Annuler un besoin
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
        { error: "Seuls les administrateurs peuvent supprimer les besoins" },
        { status: 403 },
      );
    }

    const { id } = await params;

    // SÉCURITÉ : vérifier que le besoin appartient à l'entreprise
    const existingNeed = await prisma.trainingNeed.findFirst({
      where: { id, employee: { companyId: session.user.companyId } },
    });
    if (!existingNeed) {
      return NextResponse.json({ error: "Besoin non trouvé" }, { status: 404 });
    }

    await prisma.trainingNeed.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE training need error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'annulation du besoin" },
      { status: 500 },
    );
  }
}
