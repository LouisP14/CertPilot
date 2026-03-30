import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token manquant" },
        { status: 400 },
      );
    }

    // Trouver le token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Lien de vérification invalide ou déjà utilisé" },
        { status: 400 },
      );
    }

    // Vérifier expiration
    if (new Date() > verificationToken.expiresAt) {
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });
      return NextResponse.json(
        { error: "Ce lien a expiré. Veuillez vous réinscrire." },
        { status: 410 },
      );
    }

    // Activer le compte
    await prisma.user.update({
      where: { email: verificationToken.email },
      data: { emailVerified: true },
    });

    // Supprimer le token utilisé
    await prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    });

    return NextResponse.json({
      success: true,
      message: "Email vérifié ! Vous pouvez maintenant vous connecter.",
    });
  } catch (error) {
    console.error("Erreur vérification email:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 },
    );
  }
}
