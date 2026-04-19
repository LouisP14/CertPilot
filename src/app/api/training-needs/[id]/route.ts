import { auth } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import prisma from "@/lib/prisma";
import { parseBody, updateNeedSchema } from "@/lib/validations";
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
    if (session.user.role === "MANAGER") {
      return NextResponse.json(
        { error: "Accès en lecture seule" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = parseBody(updateNeedSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { status, plannedSessionId } = parsed.data;

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

    createAuditLog({
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      companyId: session.user.companyId,
      action: "UPDATE",
      entityType: "TRAINING_NEED",
      entityId: id,
      entityName: `${need.employee.firstName} ${need.employee.lastName} — ${need.formationType.name}`,
      description: `Modification du besoin de formation : statut "${need.status}"${plannedSessionId ? ", session planifiée" : ""}`,
      oldValues: { status: existingNeed.status },
      newValues: { status: need.status, plannedSessionId: plannedSessionId || null },
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

    createAuditLog({
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      companyId: session.user.companyId,
      action: "DELETE",
      entityType: "TRAINING_NEED",
      entityId: id,
      description: `Annulation du besoin de formation par ${session.user.name || session.user.email}`,
      oldValues: { status: existingNeed.status },
      newValues: { status: "CANCELLED" },
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
