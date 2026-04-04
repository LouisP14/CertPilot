import { auth } from "@/lib/auth";
import { auditUpdate } from "@/lib/audit";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
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
    const { secret, code } = body;

    if (!secret || !code) {
      return NextResponse.json({ error: "Secret et code requis" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (verifySync as any)({ secret, token: code }, { window: 1 }) as { valid: boolean };
    if (!result.valid) {
      const rl = rateLimit(`totp:${session.user.id}`, { limit: 5, windowSeconds: 300 });
      if (!rl.success) {
        return NextResponse.json({ error: "Trop de tentatives. Réessayez dans 5 minutes." }, { status: 429 });
      }
      return NextResponse.json({ error: "Code invalide" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { totpSecret: secret, totpEnabled: true },
    });

    await auditUpdate(
      "USER",
      session.user.id,
      session.user.name ?? session.user.email,
      { totpEnabled: false },
      { totpEnabled: true },
      {
        id: session.user.id,
        name: session.user.name ?? undefined,
        email: session.user.email,
        companyId: session.user.companyId,
      },
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST totp/enable error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
