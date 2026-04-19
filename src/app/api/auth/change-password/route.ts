import { auth } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import prisma from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

const changePasswordSchema = z.object({
  newPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "Données invalides" },
        { status: 400 },
      );
    }

    const { newPassword } = parsed.data;

    // Hash du nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Mettre à jour l'utilisateur
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    createAuditLog({
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      action: "UPDATE",
      entityType: "USER",
      entityId: session.user.id,
      entityName: session.user.name ?? session.user.email,
      description: `Changement de mot de passe par ${session.user.name || session.user.email}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur changement mot de passe:", error);
    return NextResponse.json(
      { error: "Erreur lors du changement de mot de passe" },
      { status: 500 },
    );
  }
}
