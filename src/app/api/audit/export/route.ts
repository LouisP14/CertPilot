import { AuditAction, AuditEntityType } from "@/lib/audit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

function toJsonString(value: string | null): string {
  if (!value) return "";
  try {
    return JSON.stringify(JSON.parse(value));
  } catch {
    return value;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const companyId = session.user.companyId;
    if (!companyId) {
      return NextResponse.json(
        { error: "Entreprise non définie" },
        { status: 400 },
      );
    }

    const searchParams = request.nextUrl.searchParams;

    const entityType = searchParams.get("entityType") as AuditEntityType | null;
    const entityId = searchParams.get("entityId");
    const action = searchParams.get("action") as AuditAction | null;
    const userId = searchParams.get("userId");
    const search = searchParams.get("search");

    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr
      ? (() => {
          const date = new Date(endDateStr);
          date.setHours(23, 59, 59, 999);
          return date;
        })()
      : undefined;

    const where: Record<string, unknown> = { companyId };
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (action) where.action = action;
    if (userId) where.userId = userId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, Date>).gte = startDate;
      if (endDate) (where.createdAt as Record<string, Date>).lte = endDate;
    }

    if (search) {
      where.OR = [
        { description: { contains: search } },
        { entityName: { contains: search } },
        { userName: { contains: search } },
      ];
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const rows = logs.map((log) => ({
      Date: new Date(log.createdAt).toLocaleDateString("fr-FR"),
      Heure: new Date(log.createdAt).toLocaleTimeString("fr-FR"),
      Action: log.action,
      Entité: log.entityType,
      "ID entité": log.entityId || "",
      "Nom entité": log.entityName || "",
      Description: log.description,
      Utilisateur: log.userName || "Système",
      "Email utilisateur": log.userEmail || "",
      "ID utilisateur": log.userId || "",
      "Adresse IP": log.ipAddress || "",
      "User agent": log.userAgent || "",
      "Anciennes valeurs": toJsonString(log.oldValues),
      "Nouvelles valeurs": toJsonString(log.newValues),
      Métadonnées: toJsonString(log.metadata),
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Trail");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    const datePart = new Date().toISOString().split("T")[0];
    const filename = `audit-trail-${datePart}.xlsx`;

    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Export audit excel error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'export Excel de l'audit trail" },
      { status: 500 },
    );
  }
}
