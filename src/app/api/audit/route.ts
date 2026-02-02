/**
 * API Audit Trail
 * GET /api/audit - Récupère les logs d'audit avec filtres et pagination
 */

import { AuditAction, AuditEntityType, getAuditLogs } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;

    // Parsing des paramètres
    const entityType = searchParams.get("entityType") as AuditEntityType | null;
    const entityId = searchParams.get("entityId");
    const action = searchParams.get("action") as AuditAction | null;
    const userId = searchParams.get("userId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Dates - Ajuster endDate pour inclure toute la journée
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr
      ? (() => {
          const date = new Date(endDateStr);
          date.setHours(23, 59, 59, 999); // Fin de journée
          return date;
        })()
      : undefined;

    // IMPORTANT: Tous les utilisateurs voient uniquement les logs de leur entreprise
    const companyId = session.user.companyId;
    if (!companyId) {
      return NextResponse.json({
        logs: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      });
    }

    const result = await getAuditLogs({
      entityType: entityType || undefined,
      entityId: entityId || undefined,
      action: action || undefined,
      userId: userId || undefined,
      companyId,
      search: search || undefined,
      startDate,
      endDate,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur API audit:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des logs" },
      { status: 500 },
    );
  }
}
