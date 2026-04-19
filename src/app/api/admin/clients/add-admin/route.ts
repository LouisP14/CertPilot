import { auth } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const body = await request.json();
    const { companyId, name, email, password } = body;

    if (!companyId || !name || !email || !password) {
      return NextResponse.json(
        { error: "companyId, name, email et password sont requis" },
        { status: 400 },
      );
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, subscriptionPlan: true, adminLimit: true },
    });

    if (!company) {
      return NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 });
    }

    const currentAdminCount = await prisma.user.count({
      where: { companyId, role: "ADMIN", isActive: true },
    });

    if (company.adminLimit !== null && currentAdminCount >= company.adminLimit) {
      return NextResponse.json(
        {
          error: `Limite d'administrateurs atteinte (${company.adminLimit} max pour ce plan)`,
        },
        { status: 403 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role: "ADMIN",
        companyId,
        mustChangePassword: true,
        emailVerified: true,
      },
    });

    try {
      await sendWelcomeEmail({
        to: email.toLowerCase(),
        contactName: name,
        companyName: company.name,
        plan: (company.subscriptionPlan ?? "business").toLowerCase(),
        tempPassword: password,
      });
    } catch (emailError) {
      console.error("Erreur envoi email bienvenue (add-admin):", emailError);
    }

    return NextResponse.json(
      { success: true, user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erreur add-admin:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'administrateur" },
      { status: 500 },
    );
  }
}