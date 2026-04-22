import { createAuditLog } from "@/lib/audit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { alertRecipientsSchema, parseBody } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

// GET : liste des admins de la société + leurs préférences de notification
export async function GET() {
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

    const admins = await prisma.user.findMany({
      where: {
        companyId: session.user.companyId,
        role: "ADMIN",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        receivesHabilitationAlerts: true,
        receivesPPAlerts: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ admins });
  } catch (error) {
    console.error("GET alert-recipients error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des destinataires" },
      { status: 500 },
    );
  }
}

// PUT : met à jour les préférences de notification des admins
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const parsed = parseBody(alertRecipientsSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { preferences } = parsed.data;
    const userIds = preferences.map((p) => p.userId);

    // Sécurité : on ne peut modifier que les users de SA propre société
    const targetUsers = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        companyId: session.user.companyId,
        role: "ADMIN",
      },
      select: { id: true },
    });
    const allowedIds = new Set(targetUsers.map((u) => u.id));
    const invalidIds = userIds.filter((id) => !allowedIds.has(id));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: "Certains destinataires ne sont pas des admins de votre société" },
        { status: 403 },
      );
    }

    // Transaction : tous les updates en une fois
    await prisma.$transaction(
      preferences.map((p) =>
        prisma.user.update({
          where: { id: p.userId },
          data: {
            receivesHabilitationAlerts: p.receivesHabilitationAlerts,
            receivesPPAlerts: p.receivesPPAlerts,
          },
        }),
      ),
    );

    await createAuditLog({
      userId: session.user.id,
      userName: session.user.name || undefined,
      userEmail: session.user.email || undefined,
      companyId: session.user.companyId,
      action: "UPDATE",
      entityType: "SETTINGS",
      entityId: session.user.companyId,
      entityName: "Destinataires des alertes",
      description: `Préférences de notification mises à jour pour ${preferences.length} admin(s)`,
      newValues: { preferences },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT alert-recipients error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des destinataires" },
      { status: 500 },
    );
  }
}