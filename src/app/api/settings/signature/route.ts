import { auth } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import prisma from "@/lib/prisma";
import { parseBody, signatureSettingsSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: {
        signatureEnabled: true,
        signatureImage: true,
        signatureResponsable: true,
        signatureTitre: true,
      },
    });

    return NextResponse.json(
      company || {
        signatureEnabled: false,
        signatureImage: null,
        signatureResponsable: null,
        signatureTitre: null,
      },
    );
  } catch (error) {
    console.error("GET signature error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la signature" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    if (
      session.user?.role !== "ADMIN" &&
      session.user?.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent modifier la signature" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = parseBody(signatureSettingsSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const {
      signatureEnabled,
      signatureImage,
      signatureResponsable,
      signatureTitre,
    } = parsed.data;

    // Récupérer la company de l'utilisateur
    let company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
    });

    if (company) {
      company = await prisma.company.update({
        where: { id: session.user.companyId },
        data: {
          signatureEnabled: signatureEnabled ?? company.signatureEnabled,
          signatureImage:
            signatureImage !== undefined
              ? signatureImage
              : company.signatureImage,
          signatureResponsable:
            signatureResponsable !== undefined
              ? signatureResponsable
              : company.signatureResponsable,
          signatureTitre:
            signatureTitre !== undefined
              ? signatureTitre
              : company.signatureTitre,
        },
      });
    } else {
      company = await prisma.company.create({
        data: {
          name: "Mon Entreprise",
          signatureEnabled: signatureEnabled ?? false,
          signatureImage: signatureImage || null,
          signatureResponsable: signatureResponsable || null,
          signatureTitre: signatureTitre || null,
        },
      });
    }

    createAuditLog({
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      companyId: session.user.companyId,
      action: "UPDATE",
      entityType: "SETTINGS",
      entityId: session.user.companyId,
      entityName: "Paramètres signature",
      description: `Modification des paramètres de signature électronique par ${session.user.name || session.user.email}`,
      newValues: { signatureEnabled, signatureResponsable, signatureTitre },
    });

    return NextResponse.json({
      signatureEnabled: company.signatureEnabled,
      signatureImage: company.signatureImage,
      signatureResponsable: company.signatureResponsable,
      signatureTitre: company.signatureTitre,
    });
  } catch (error) {
    console.error("PUT signature error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la signature" },
      { status: 500 },
    );
  }
}
