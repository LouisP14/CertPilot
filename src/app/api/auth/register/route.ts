import prisma from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { parseBody, registerSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 registrations per minute per IP
    const ip = getClientIp(request);
    const rl = rateLimit(`register:${ip}`, { limit: 5, windowSeconds: 60 });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Trop de tentatives. Veuillez réessayer dans quelques minutes." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = parseBody(registerSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { email, password, name, companyName } = parsed.data;

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

    // Calculer la date de fin d'essai (14 jours)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    // Créer l'entreprise avec trial de 14 jours
    const company = await prisma.company.create({
      data: {
        name: companyName,
        adminEmail: email.toLowerCase(),
        trialEndsAt,
        subscriptionStatus: "TRIAL",
        subscriptionPlan: "Starter", // Plan par défaut pendant le trial
        employeeLimit: 50, // Limite par défaut
      },
    });

    // Créer l'utilisateur admin lié à l'entreprise
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role: "ADMIN",
        companyId: company.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Compte créé avec succès",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        company: {
          id: company.id,
          name: company.name,
          trialEndsAt: company.trialEndsAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription" },
      { status: 500 },
    );
  }
}
