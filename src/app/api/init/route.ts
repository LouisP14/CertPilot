import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// Cette route initialise la base de données PostgreSQL avec Prisma
export async function GET() {
  try {
    // Vérifier si l'utilisateur admin existe déjà
    let existingAdmin = null;
    try {
      existingAdmin = await prisma.user.findUnique({
        where: { email: "admin@certpilot.fr" },
      });
    } catch {
      // Table n'existe peut-être pas encore, on continue
    }

    if (existingAdmin) {
      // Réinitialiser le mot de passe pour être sûr
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await prisma.user.update({
        where: { email: "admin@certpilot.fr" },
        data: { 
          password: hashedPassword,
          role: "SUPER_ADMIN",
        },
      });
      
      return NextResponse.json({
        success: true,
        status: "password_reset",
        message: "Mot de passe admin réinitialisé",
        credentials: {
          email: "admin@certpilot.fr",
          password: "admin123",
        },
      });
    }

    // Vérifier si la company existe
    let company = await prisma.company.findFirst({
      where: { id: "certpilot-main" },
    });

    if (!company) {
      // Créer l'entreprise principale CertPilot
      company = await prisma.company.create({
        data: {
          id: "certpilot-main",
          name: "CertPilot",
          alertThresholds: "90,60,30,7",
          adminEmail: "admin@certpilot.fr",
          subscriptionStatus: "ACTIVE",
          subscriptionPlan: "Enterprise",
          employeeLimit: 500,
        },
      });
      console.log("✅ Entreprise créée:", company.name);
    }

    // Créer l'utilisateur SUPER_ADMIN
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.create({
      data: {
        email: "admin@certpilot.fr",
        password: hashedPassword,
        name: "Admin CertPilot",
        role: "SUPER_ADMIN",
        companyId: company.id,
        mustChangePassword: true,
      },
    });

    console.log("✅ Utilisateur admin créé:", admin.email);

    return NextResponse.json({
      success: true,
      status: "created",
      message: "Base de données initialisée avec succès",
      credentials: {
        email: "admin@certpilot.fr",
        password: "admin123",
      },
      note: "Changez le mot de passe à la première connexion !",
    });
  } catch (error) {
    console.error("Erreur init:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}

export async function POST() {
  return GET();
}
