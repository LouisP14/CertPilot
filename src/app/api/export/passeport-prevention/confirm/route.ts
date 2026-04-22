import { createAuditLog } from "@/lib/audit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST /api/export/passeport-prevention/confirm
// Marque les certificats d'un export CSV comme déclarés au Passeport de Prévention.
// À appeler après que l'utilisateur ait déposé le fichier sur prevention.moncompteformation.gouv.fr
//
// Body : { declarationRef: string, year?: string, trimestre?: string }
// - Applique le même filtre que l'export GET (année/trimestre) pour retrouver les certs
// - Set ppDeclaredAt = now() + ppDeclarationRef = declarationRef
// - Ne touche PAS les certs déjà déclarés (double protection)

function parseDateFilter(
  year: string | null | undefined,
  trimestre: string | null | undefined,
): { gte?: Date; lte?: Date } | undefined {
  if (!year) return undefined;
  const y = parseInt(year);
  if (trimestre) {
    const trimMap: Record<string, [number, number]> = {
      Q1: [0, 2],
      Q2: [3, 5],
      Q3: [6, 8],
      Q4: [9, 11],
    };
    const [startMonth, endMonth] = trimMap[trimestre] || [0, 11];
    return {
      gte: new Date(y, startMonth, 1),
      lte: new Date(y, endMonth + 1, 0, 23, 59, 59),
    };
  }
  return {
    gte: new Date(y, 0, 1),
    lte: new Date(y, 11, 31, 23, 59, 59),
  };
}

export async function POST(request: NextRequest) {
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

    const companyId = session.user.companyId;
    const body = (await request.json()) as {
      declarationRef?: unknown;
      year?: unknown;
      trimestre?: unknown;
    };

    const declarationRef =
      typeof body.declarationRef === "string"
        ? body.declarationRef.trim()
        : "";
    if (!declarationRef) {
      return NextResponse.json(
        { error: "declarationRef requis" },
        { status: 400 },
      );
    }

    const year = typeof body.year === "string" ? body.year : null;
    const trimestre =
      typeof body.trimestre === "string" ? body.trimestre : null;
    const dateFilter = parseDateFilter(year, trimestre);

    // Récupère les certs qui seraient dans ce batch (mêmes critères que GET)
    // + exclusion des déjà déclarés (double protection)
    const certs = await prisma.certificate.findMany({
      where: {
        isArchived: false,
        ppDeclaredAt: null,
        formationType: { isConcernedPP: true },
        employee: {
          companyId,
          isActive: true,
          nir: { not: null },
        },
        ...(dateFilter && { obtainedDate: dateFilter }),
      },
      select: {
        id: true,
        employee: { select: { firstName: true, lastName: true } },
        formationType: { select: { name: true } },
      },
    });

    if (certs.length === 0) {
      return NextResponse.json({
        confirmed: 0,
        declarationRef,
        message: "Aucun certificat à confirmer",
      });
    }

    const now = new Date();
    const result = await prisma.certificate.updateMany({
      where: { id: { in: certs.map((c) => c.id) } },
      data: {
        ppDeclaredAt: now,
        ppDeclarationRef: declarationRef,
      },
    });

    // Audit
    await createAuditLog({
      userId: session.user.id,
      userName: session.user.name || undefined,
      userEmail: session.user.email || undefined,
      companyId,
      action: "EXPORT",
      entityType: "CERTIFICATE",
      description: `Confirmation de dépôt Passeport Prévention : ${result.count} déclaration(s) marquée(s) comme déclarées`,
      metadata: {
        declarationRef,
        confirmedCount: result.count,
        period: { year, trimestre },
        certificateIds: certs.map((c) => c.id),
      },
    });

    return NextResponse.json({
      confirmed: result.count,
      declarationRef,
      declaredAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Confirm Passeport Prévention error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la confirmation" },
      { status: 500 },
    );
  }
}