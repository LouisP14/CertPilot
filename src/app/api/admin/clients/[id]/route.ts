import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// DELETE - Supprimer un client (company) et toutes ses données
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Vérifier que l'entreprise existe
    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
    }

    // Supprimer dans l'ordre pour éviter les violations de contraintes
    // Les relations avec onDelete: Cascade gèrent le reste automatiquement

    // 1. Supprimer les utilisateurs liés
    await prisma.user.deleteMany({
      where: { companyId: id },
    });

    // 2. Supprimer l'entreprise (cascade supprimera PlanningConstraints)
    await prisma.company.delete({
      where: { id },
    });

    console.log(`✅ Client supprimé: ${company.name} (ID: ${id})`);

    return NextResponse.json({
      success: true,
      message: `Client "${company.name}" supprimé avec succès`,
    });
  } catch (error) {
    console.error("Erreur suppression client:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du client" },
      { status: 500 },
    );
  }
}

// GET - Obtenir les détails d'un client
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Erreur récupération client:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du client" },
      { status: 500 },
    );
  }
}
