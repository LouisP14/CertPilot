import { auth } from "@/lib/auth";
import { auditUpdate } from "@/lib/audit";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifySync } from "otplib";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Réservé aux administrateurs" }, { status: 403 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: "Code requis" }, { status: 400 });
    }

    // Récupérer le secret stocké en DB
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { totpSecret: true, totpEnabled: true },
    });

    if (!user?.totpEnabled || !user?.totpSecret) {
      return NextResponse.json({ error: "TOTP non activé" }, { status: 400 });
    }

    // Vérifier le code TOTP avec la même API que enable/route.ts
    const result = verifySync({ secret: user.totpSecret, token: code, options: { window: 1 } });
    if (!result.valid) {
      return NextResponse.json({ error: "Code invalide" }, { status: 400 });
    }

    // Désactiver le TOTP en DB
    await prisma.user.update({
      where: { id: session.user.id },
      data: { totpSecret: null, totpEnabled: false },
    });

    await auditUpdate(
      "USER",
      session.user.id,
      session.user.name ?? session.user.email,
      { totpEnabled: true },
      { totpEnabled: false },
      {
        id: session.user.id,
        name: session.user.name ?? undefined,
        email: session.user.email,
        companyId: session.user.companyId,
      },
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST totp/disable error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
