import { auditUpdate } from "@/lib/audit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/convocations/[id]
 *
 * Mise à jour partielle d'une convocation. Actuellement utilisé pour :
 * - archiver / désarchiver manuellement (`isArchived: true|false`)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    if (session.user.role === "MANAGER") {
      return NextResponse.json(
        { error: "Accès en lecture seule" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.convocation.findFirst({
      where: { id, companyId: session.user.companyId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Convocation non trouvée" },
        { status: 404 },
      );
    }

    const updateData: Record<string, unknown> = {};
    if (typeof body.isArchived === "boolean") {
      updateData.isArchived = body.isArchived;
      updateData.archivedAt = body.isArchived ? new Date() : null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Aucun champ modifiable fourni" },
        { status: 400 },
      );
    }

    const updated = await prisma.convocation.update({
      where: { id },
      data: updateData,
    });

    await auditUpdate(
      "CONVOCATION",
      id,
      `Convocation ${existing.formationName}`,
      { isArchived: existing.isArchived },
      { isArchived: updated.isArchived },
      session.user
        ? {
            id: session.user.id,
            name: session.user.name || undefined,
            email: session.user.email || undefined,
          }
        : null,
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH convocation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la convocation" },
      { status: 500 },
    );
  }
}