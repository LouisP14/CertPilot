import { auth } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";
import prisma from "@/lib/prisma";
import { parseBody, adminCreateClientSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

// Configuration des plans
const PLAN_CONFIGS: Record<string, { name: string; employeeLimit: number }> = {
  starter: { name: "Starter", employeeLimit: 20 },
  pro: { name: "Pro", employeeLimit: 100 },
  business: { name: "Business", employeeLimit: 300 },
  enterprise: { name: "Enterprise", employeeLimit: 1000 },
};

// POST - Créer un compte client (SUPER_ADMIN only)
export async function POST(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est SUPER_ADMIN
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = parseBody(adminCreateClientSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const {
      companyName,
      contactName,
      email,
      password,
      plan,
      subscriptionMonths,
    } = parsed.data;

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 },
      );
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Calculer la date de fin d'abonnement
    const subscriptionEndsAt = new Date();
    subscriptionEndsAt.setMonth(
      subscriptionEndsAt.getMonth() + (subscriptionMonths || 12),
    );

    // Obtenir la configuration du plan
    const selectedPlan = plan?.toLowerCase() || "business";
    const planConfig = PLAN_CONFIGS[selectedPlan] || PLAN_CONFIGS.business;

    // Créer l'entreprise
    const company = await prisma.company.create({
      data: {
        name: companyName,
        adminEmail: email.toLowerCase(),
        subscriptionStatus: "ACTIVE",
        subscriptionPlan: planConfig.name,
        employeeLimit: planConfig.employeeLimit,
        trialEndsAt: null, // Pas de trial, abonnement direct
      },
    });

    // Créer l'utilisateur admin lié à l'entreprise
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: contactName,
        role: "ADMIN",
        companyId: company.id,
        mustChangePassword: true, // Forcer le changement de mdp
        emailVerified: true, // Créé par admin = vérifié
      },
    });

    // Envoyer l'email de bienvenue avec les identifiants
    try {
      await sendWelcomeEmail({
        to: email.toLowerCase(),
        contactName,
        companyName,
        plan: selectedPlan,
        tempPassword: password, // Le mot de passe en clair avant hashage
      });
      console.log("✅ Email de bienvenue envoyé à:", email);
    } catch (emailError) {
      console.error("❌ Erreur envoi email bienvenue:", emailError);
      // On ne bloque pas la création si l'email échoue
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        company: {
          id: company.id,
          name: company.name,
          plan: company.subscriptionPlan,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erreur création compte client:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du compte" },
      { status: 500 },
    );
  }
}

// GET - Liste des entreprises/clients (SUPER_ADMIN only)
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 },
      );
    }

    const companies = await prisma.company.findMany({
      include: {
        users: {
          where: { isActive: true },
          select: { id: true, email: true, name: true, role: true },
        },
        _count: {
          select: {
            employees: { where: { isActive: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = companies.map((company) => ({
      ...company,
      adminCount: company.users.filter((u) => u.role === "ADMIN").length,
      managerCount: company.users.filter((u) => u.role === "MANAGER").length,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur récupération clients:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des clients" },
      { status: 500 },
    );
  }
}
