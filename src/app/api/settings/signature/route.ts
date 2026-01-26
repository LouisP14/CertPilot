import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const company = await prisma.company.findFirst({
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
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    if (session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent modifier la signature" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      signatureEnabled,
      signatureImage,
      signatureResponsable,
      signatureTitre,
    } = body;

    // Récupérer ou créer la company
    let company = await prisma.company.findFirst();

    if (company) {
      company = await prisma.company.update({
        where: { id: company.id },
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
