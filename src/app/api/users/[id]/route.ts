import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// PUT - Modifier un manager (ADMIN seulement)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const { id } = await params;

    // Vérifier que l'utilisateur appartient bien à la même company
    const target = await prisma.user.findFirst({
      where: { id, companyId: session.user.companyId },
    });
    if (!target) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }
    // Empêcher de modifier son propre compte ou l'admin principal via cette route
    if (target.role === "ADMIN" || target.role === "SUPER_ADMIN") {
      return NextResponse.json({ error: "Impossible de modifier ce compte via cette route" }, { status: 403 });
    }

    const body = await request.json();
    const { name, managedServices, isActive } = body;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(managedServices !== undefined && { managedServices }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        managedServices: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT users/[id] error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer un manager (ADMIN seulement)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const { id } = await params;

    const target = await prisma.user.findFirst({
      where: { id, companyId: session.user.companyId },
    });
    if (!target) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }
    if (target.role === "ADMIN" || target.role === "SUPER_ADMIN") {
      return NextResponse.json({ error: "Impossible de supprimer ce compte" }, { status: 403 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE users/[id] error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
