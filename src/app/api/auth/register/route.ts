import { sendVerificationEmail } from "@/lib/email";
import prisma from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { parseBody, registerSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 registrations per minute per IP
    const ip = getClientIp(request);
    const rl = rateLimit(`register:${ip}`, { limit: 5, windowSeconds: 60 });
    if (!rl.success) {
      return NextResponse.json(
        {
          error:
            "Trop de tentatives. Veuillez réessayer dans quelques minutes.",
        },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = parseBody(registerSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { email, password, name, companyName, plan } = parsed.data;
    const emailLower = email.toLowerCase();

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower },
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

    // Configurer le plan du trial (employeeLimit toujours bridé à 50)
    const TRIAL_PLANS = {
      starter:  { subscriptionPlan: "Starter",  adminLimit: 1    },
      pro:      { subscriptionPlan: "Pro",       adminLimit: 3    },
      business: { subscriptionPlan: "Business",  adminLimit: null },
    };
    const trialConfig = TRIAL_PLANS[plan ?? "business"];

    // Créer l'entreprise avec trial de 14 jours
    const company = await prisma.company.create({
      data: {
        name: companyName,
        adminEmail: emailLower,
        trialEndsAt,
        subscriptionStatus: "TRIAL",
        subscriptionPlan: trialConfig.subscriptionPlan,
        employeeLimit: 50,
        adminLimit: trialConfig.adminLimit,
      },
    });

    // Créer l'utilisateur admin (non vérifié)
    await prisma.user.create({
      data: {
        email: emailLower,
        password: hashedPassword,
        name,
        role: "ADMIN",
        companyId: company.id,
        emailVerified: false,
      },
    });

    // Générer un token de vérification (expire dans 24h)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Supprimer les anciens tokens pour cet email
    await prisma.emailVerificationToken.deleteMany({
      where: { email: emailLower },
    });

    await prisma.emailVerificationToken.create({
      data: {
        email: emailLower,
        token,
        expiresAt,
      },
    });

    // Envoyer l'email de vérification
    await sendVerificationEmail({
      to: emailLower,
      name,
      token,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Compte créé. Vérifiez votre email pour activer votre essai.",
        requiresVerification: true,
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
