import { createAuditLog } from "@/lib/audit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextResponse } from "next/server";

/**
 * POST /api/me/delete-account
 *
 * Droit à l'effacement (RGPD Article 17).
 *
 * Anonymise le compte de l'utilisateur connecté :
 * - Email remplacé par un identifiant aléatoire non attribuable
 * - Nom remplacé par "Utilisateur supprimé"
 * - Mot de passe remplacé par un hash aléatoire (empêche toute reconnexion)
 * - 2FA désactivée, isActive=false
 *
 * L'enregistrement lui-même est conservé (sans données personnelles)
 * pour préserver l'intégrité de l'audit trail — obligation légale
 * qui prime sur le droit à l'effacement (RGPD art.17 §3).
 *
 * Protection : refuse si l'utilisateur est le dernier ADMIN actif de
 * son entreprise, pour ne pas orpheliner la Company.
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const currentUserId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyId: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Compte introuvable ou déjà désactivé" },
        { status: 404 },
      );
    }

    // Protection : empêcher la suppression du dernier ADMIN actif d'une entreprise
    if (user.companyId && (user.role === "ADMIN" || user.role === "SUPER_ADMIN")) {
      const otherAdmins = await prisma.user.count({
        where: {
          companyId: user.companyId,
          role: { in: ["ADMIN", "SUPER_ADMIN"] },
          isActive: true,
          id: { not: currentUserId },
        },
      });
      if (otherAdmins === 0) {
        return NextResponse.json(
          {
            error:
              "Vous êtes le dernier administrateur actif de votre entreprise. Transférez les droits d'administration à un autre utilisateur avant de supprimer votre compte.",
          },
          { status: 400 },
        );
      }
    }

    // Anonymisation
    const anonymousEmail = `deleted-${crypto.randomUUID()}@removed.local`;
    const randomPassword = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 12);

    await prisma.user.update({
      where: { id: currentUserId },
      data: {
        email: anonymousEmail,
        name: "Utilisateur supprimé",
        password: hashedPassword,
        isActive: false,
        emailVerified: false,
        totpSecret: null,
        totpEnabled: false,
        mustChangePassword: false,
      },
    });

    await createAuditLog({
      userId: currentUserId,
      userName: user.name,
      userEmail: user.email,
      companyId: user.companyId,
      action: "DELETE",
      entityType: "USER",
      entityId: currentUserId,
      entityName: user.email,
      description: `Suppression de compte à la demande de l'utilisateur (RGPD art.17). Données personnelles anonymisées.`,
    });

    return NextResponse.json({
      success: true,
      message:
        "Votre compte a été supprimé. Vos données personnelles ont été anonymisées.",
    });
  } catch (error) {
    console.error("Erreur suppression compte:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du compte" },
      { status: 500 },
    );
  }
}
