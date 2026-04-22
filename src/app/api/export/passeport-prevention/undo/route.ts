import { createAuditLog } from "@/lib/audit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST /api/export/passeport-prevention/undo
// Annule une déclaration Passeport de Prévention : remet ppDeclaredAt et
// ppDeclarationRef à null pour tous les certificats d'un batch donné.
//
// Body : { declarationRef: string }
// À utiliser en cas d'erreur après avoir confirmé un dépôt (fichier rejeté
// par la plateforme, double envoi, etc.)

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
    const body = (await request.json()) as { declarationRef?: unknown };
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

    // On filtre sur companyId via la relation employee pour l'isolation
    const certs = await prisma.certificate.findMany({
      where: {
        ppDeclarationRef: declarationRef,
        employee: { companyId },
      },
      select: { id: true },
    });

    if (certs.length === 0) {
      return NextResponse.json(
        { error: "Aucune déclaration trouvée avec cette référence" },
        { status: 404 },
      );
    }

    const result = await prisma.certificate.updateMany({
      where: { id: { in: certs.map((c) => c.id) } },
      data: {
        ppDeclaredAt: null,
        ppDeclarationRef: null,
      },
    });

    // Audit
    await createAuditLog({
      userId: session.user.id,
      userName: session.user.name || undefined,
      userEmail: session.user.email || undefined,
      companyId,
      action: "UPDATE",
      entityType: "CERTIFICATE",
      description: `Annulation de déclaration Passeport Prévention : ${result.count} déclaration(s) remise(s) à "non déclarée"`,
      metadata: {
        declarationRef,
        undoneCount: result.count,
        certificateIds: certs.map((c) => c.id),
      },
    });

    return NextResponse.json({
      undone: result.count,
      declarationRef,
    });
  } catch (error) {
    console.error("Undo Passeport Prévention error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'annulation" },
      { status: 500 },
    );
  }
}