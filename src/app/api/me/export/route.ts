import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/me/export
 *
 * Droit à la portabilité (RGPD Article 20).
 *
 * Retourne au format JSON l'ensemble des données personnelles
 * stockées sur l'utilisateur connecté :
 * - Profil (email, nom, rôle, statut, timestamps)
 * - Entreprise associée (nom, plan)
 * - Historique d'audit lié à cet utilisateur
 *
 * N'inclut PAS : mot de passe hashé, secret TOTP (données techniques
 * sensibles non destinées à la portabilité).
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        managedServices: true,
        isActive: true,
        emailVerified: true,
        mustChangePassword: true,
        totpEnabled: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true,
            subscriptionPlan: true,
            subscriptionStatus: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 },
      );
    }

    // Derniers 1000 logs d'audit concernant cet utilisateur
    const auditLogs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 1000,
      select: {
        action: true,
        entityType: true,
        entityId: true,
        entityName: true,
        description: true,
        createdAt: true,
      },
    });

    const exportData = {
      exportedAt: new Date().toISOString(),
      rgpdNotice:
        "Cet export contient l'ensemble des données personnelles que nous conservons sur vous (RGPD article 20). Il n'inclut pas les secrets techniques (mot de passe hashé, secret 2FA).",
      user,
      auditLogs,
      auditLogsCount: auditLogs.length,
      auditLogsNote:
        "Limité aux 1000 entrées les plus récentes. Pour l'historique complet, contactez notre DPO.",
    };

    const filename = `certpilot-mes-donnees-${new Date().toISOString().split("T")[0]}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Erreur export données perso:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération de l'export" },
      { status: 500 },
    );
  }
}
