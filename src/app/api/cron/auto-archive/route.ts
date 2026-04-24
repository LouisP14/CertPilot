import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/cron/auto-archive
 *
 * Archivage automatique des sessions et convocations terminées depuis plus de
 * 30 jours. Évite l'encombrement des listes dans l'interface.
 *
 * Règles :
 * - TrainingSession : archivée si `endDate < now - 30j` ET status in
 *   (COMPLETED, CANCELLED) ET `isArchived = false`.
 * - Convocation : archivée si `endDate` (string YYYY-MM-DD) < now - 30j ET
 *   status = "completed" ET `isArchived = false`.
 *
 * Idempotent : ne ré-archive pas un élément déjà archivé.
 *
 * Protégé par CRON_SECRET (même mécanisme que /api/cron/check-alerts,
 * /api/cron/purge).
 */

const ARCHIVE_AFTER_DAYS = 30;

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
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - ARCHIVE_AFTER_DAYS);

    // Sessions : endDate est un DateTime, comparaison directe
    const sessionsUpdate = await prisma.trainingSession.updateMany({
      where: {
        isArchived: false,
        status: { in: ["COMPLETED", "CANCELLED"] },
        endDate: { lt: cutoff },
      },
      data: {
        isArchived: true,
        archivedAt: now,
      },
    });

    // Convocations : endDate est un String YYYY-MM-DD ; comparaison lexicographique
    // fonctionne correctement pour ce format ISO.
    const cutoffIso = cutoff.toISOString().split("T")[0];

    const convocationsUpdate = await prisma.convocation.updateMany({
      where: {
        isArchived: false,
        status: "completed",
        endDate: { lt: cutoffIso },
      },
      data: {
        isArchived: true,
        archivedAt: now,
      },
    });

    const summary = {
      sessionsArchived: sessionsUpdate.count,
      convocationsArchived: convocationsUpdate.count,
      cutoffDate: cutoff.toISOString(),
      archivedAt: now.toISOString(),
    };

    console.log("[cron/auto-archive] Archivage exécuté:", summary);

    return NextResponse.json({ success: true, ...summary });
  } catch (error) {
    console.error("[cron/auto-archive] Erreur:", error);
    return NextResponse.json(
      {
        error: `Erreur lors de l'archivage: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}