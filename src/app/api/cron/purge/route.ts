import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/cron/purge
 *
 * Purge des données expirées pour respecter la politique de rétention RGPD.
 *
 * Protégé par CRON_SECRET (même mécanisme que /api/cron/check-alerts).
 *
 * Nettoie :
 * - EmailVerificationToken expirés (dépassement de expiresAt)
 * - LeadCapture de plus de 13 mois (durée légale prospection B2B CNIL)
 * - ContactRequest "REJECTED" ou "CONVERTED" de plus de 13 mois
 * - AlertLog de plus de 2 ans (conservation opérationnelle)
 *
 * NE PURGE PAS : AuditLog (conservation 5 ans — obligation légale).
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const secret =
      authHeader?.replace("Bearer ", "") ??
      new URL(request.url).searchParams.get("secret");

    if (!process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: "CRON_SECRET non configuré sur le serveur" },
        { status: 500 },
      );
    }

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const now = new Date();
    const thirteenMonthsAgo = new Date(now);
    thirteenMonthsAgo.setMonth(thirteenMonthsAgo.getMonth() - 13);
    const twoYearsAgo = new Date(now);
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const [
      expiredTokens,
      oldLeads,
      oldContactRequests,
      oldAlertLogs,
    ] = await Promise.all([
      prisma.emailVerificationToken.deleteMany({
        where: { expiresAt: { lt: now } },
      }),
      prisma.leadCapture.deleteMany({
        where: { createdAt: { lt: thirteenMonthsAgo } },
      }),
      prisma.contactRequest.deleteMany({
        where: {
          createdAt: { lt: thirteenMonthsAgo },
          status: { in: ["REJECTED", "CONVERTED"] },
        },
      }),
      prisma.alertLog.deleteMany({
        where: { sentAt: { lt: twoYearsAgo } },
      }),
    ]);

    const summary = {
      expiredTokens: expiredTokens.count,
      oldLeads: oldLeads.count,
      oldContactRequests: oldContactRequests.count,
      oldAlertLogs: oldAlertLogs.count,
      purgedAt: now.toISOString(),
    };

    console.log("[cron/purge] Purge RGPD exécutée:", summary);

    return NextResponse.json({
      success: true,
      ...summary,
    });
  } catch (error) {
    console.error("[cron/purge] Erreur:", error);
    return NextResponse.json(
      {
        error: `Erreur lors de la purge: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
