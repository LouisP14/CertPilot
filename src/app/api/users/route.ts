import { auth } from "@/lib/auth";
import { sendManagerInvitationEmail } from "@/lib/email";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

// GET - Liste des utilisateurs de la company (ADMIN seulement)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: { companyId: session.user.companyId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        managedServices: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET users error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Créer un manager (ADMIN seulement)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, managedServices } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Nom et email obligatoires" }, { status: 400 });
    }
    if (!Array.isArray(managedServices) || managedServices.length === 0) {
      return NextResponse.json({ error: "Au moins un service supervisé est requis" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
    }

    // Générer un mot de passe temporaire
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        role: "MANAGER",
        companyId: session.user.companyId,
        mustChangePassword: true,
        emailVerified: true,
        managedServices,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        managedServices: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Récupérer le nom de la company pour l'email
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: { name: true },
    });

    // Envoyer l'email d'invitation
    await sendManagerInvitationEmail({
      to: user.email,
      managerName: user.name,
      companyName: company?.name ?? "votre entreprise",
      tempPassword,
      managedServices,
    }).catch((err) => console.error("[users] Erreur envoi email invitation manager:", err));

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("POST users error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
