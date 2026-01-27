import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// PATCH - Mettre à jour une demande de contact
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    // Vérifier que la demande existe
    const existingRequest = await prisma.contactRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Demande non trouvée" },
        { status: 404 },
      );
    }

    // Valider le statut
    const validStatuses = [
      "NEW",
      "CONTACTED",
      "DEMO_DONE",
      "PAYMENT_SENT",
      "CONVERTED",
      "REJECTED",
    ];

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    // Mettre à jour la demande
    const updatedRequest = await prisma.contactRequest.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Erreur mise à jour demande:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 },
    );
  }
}

// GET - Récupérer une demande spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const contactRequest = await prisma.contactRequest.findUnique({
      where: { id },
    });

    if (!contactRequest) {
      return NextResponse.json(
        { error: "Demande non trouvée" },
        { status: 404 },
      );
    }

    return NextResponse.json(contactRequest);
  } catch (error) {
    console.error("Erreur récupération demande:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 },
    );
  }
}

// DELETE - Supprimer une demande
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await prisma.contactRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression demande:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 },
    );
  }
}
