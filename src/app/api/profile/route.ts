import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseBody, updateProfileSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

// GET: Récupérer les informations du profil de l'utilisateur connecté
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            subscriptionStatus: true,
            subscriptionPlan: true,
            trialEndsAt: true,
            employeeLimit: true,
            adminLimit: true,
            adminEmail: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 },
      );
    }

    let employeeCount = 0;
    let adminCount = 0;
    let managerCount = 0;
    if (user.company?.id) {
      [employeeCount, adminCount, managerCount] = await Promise.all([
        prisma.employee.count({
          where: { companyId: user.company.id, isActive: true },
        }),
        prisma.user.count({
          where: { companyId: user.company.id, role: "ADMIN", isActive: true },
        }),
        prisma.user.count({
          where: { companyId: user.company.id, role: "MANAGER", isActive: true },
        }),
      ]);
    }

    return NextResponse.json({
      ...user,
      employeeCount,
      adminCount,
      managerCount,
    });
  } catch (error) {
    console.error("GET profile error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du profil" },
      { status: 500 },
    );
  }
}

// PUT: Mettre à jour le profil de l'utilisateur connecté
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = parseBody(updateProfileSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { name, currentPassword, newPassword } = parsed.data;

    // Récupérer l'utilisateur actuel
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 },
      );
    }

    // Si changement de mot de passe, vérifier l'ancien
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Le mot de passe actuel est requis" },
          { status: 400 },
        );
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        currentUser.password,
      );
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Le mot de passe actuel est incorrect" },
          { status: 400 },
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          {
            error:
              "Le nouveau mot de passe doit contenir au moins 8 caractères",
          },
          { status: 400 },
        );
      }
    }

    // Construire les données de mise à jour
    const updateData: Record<string, unknown> = {};
    if (name && name.trim()) updateData.name = name.trim();
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 12);
      updateData.mustChangePassword = false;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Aucune modification à effectuer" },
        { status: 400 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PUT profile error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 },
    );
  }
}
