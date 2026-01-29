import prisma from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

// POST - Créer un compte client (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyName,
      contactName,
      email,
      password,
      plan,
      employeeLimit,
      subscriptionMonths,
    } = body;

    // Validation
    if (!companyName || !contactName || !email || !password) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis" },
        { status: 400 },
      );
    }

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

    // Créer l'entreprise
    const company = await prisma.company.create({
      data: {
        name: companyName,
        adminEmail: email.toLowerCase(),
        subscriptionStatus: "ACTIVE",
        subscriptionPlan: plan || "Starter",
        employeeLimit: employeeLimit || 50,
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
      },
    });

    // Envoyer l'email de bienvenue avec les identifiants
    try {
      await sendWelcomeEmail({
        to: email.toLowerCase(),
        contactName,
        companyName,
        plan: plan || "starter",
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

// GET - Liste des entreprises/clients (admin only)
export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error("Erreur récupération clients:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des clients" },
      { status: 500 },
    );
  }
}
