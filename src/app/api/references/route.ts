import { auditCreate, auditDelete } from "@/lib/audit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET: Récupérer les référentiels
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // FUNCTION, SERVICE, SITE, TEAM

    // Filtrer par companyId de l'utilisateur connecté
    const companyId = session.user.companyId;
    if (!companyId) {
      return NextResponse.json([], { status: 200 });
    }
    const where: {
      type?: string;
      isActive?: boolean;
      companyId?: string | null;
    } = {
      companyId,
    };
    if (type) where.type = type;

    const references = await prisma.referenceData.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { value: "asc" }],
    });

    return NextResponse.json(references);
  } catch (error) {
    console.error("Erreur GET references:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des références" },
      { status: 500 },
    );
  }
}

// POST: Créer un nouveau référentiel
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const role = session?.user?.role;
    if (!session || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await request.json();
    const { type, value } = body;

    if (!type || !value) {
      return NextResponse.json(
        { error: "Type et valeur requis" },
        { status: 400 },
      );
    }

    const companyId = session.user.companyId;
    if (!companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Vérifier si la valeur existe déjà pour cette entreprise
    const existing = await prisma.referenceData.findFirst({
      where: {
        type,
        value: value.trim(),
        companyId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Cette valeur existe déjà" },
        { status: 400 },
      );
    }

    const reference = await prisma.referenceData.create({
      data: {
        type,
        value: value.trim(),
        companyId,
      },
    });

    // Audit trail
    await auditCreate(
      "REFERENCE",
      reference.id,
      value.trim(),
      { type, value: value.trim() },
      {
        id: session.user.id,
        name: session.user.name || "Administrateur",
        email: session.user.email || undefined,
        companyId: session.user.companyId,
      },
    );

    return NextResponse.json(reference);
  } catch (error: unknown) {
    console.error("Erreur POST reference:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 },
    );
  }
}

// DELETE: Supprimer un référentiel
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const role = session?.user?.role;
    if (!session || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    const companyId = session.user.companyId;
    if (!companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Récupérer les infos avant suppression pour l'audit
    const reference = await prisma.referenceData.findFirst({
      where: { id, companyId },
    });

    if (!reference) {
      return NextResponse.json(
        { error: "Référence non trouvée" },
        { status: 404 },
      );
    }

    await prisma.referenceData.delete({
      where: { id },
    });

    // Audit trail
    await auditDelete(
      "REFERENCE",
      id,
      reference.value,
      { type: reference.type, value: reference.value },
      {
        id: session.user.id,
        name: session.user.name || "Administrateur",
        email: session.user.email || undefined,
        companyId: session.user.companyId,
      },
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE reference:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 },
    );
  }
}
