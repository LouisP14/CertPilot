import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Cette route crée l'utilisateur demo si nécessaire
export async function GET() {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: "demo@certpilot.fr" },
    });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        status: "already_exists",
        message: "Utilisateur demo déjà créé",
        credentials: {
          email: "demo@certpilot.fr",
          password: "demo123",
        },
      });
    }

    // Créer l'entreprise
    const company = await prisma.company.create({
      data: {
        id: "demo-company",
        name: "Mon Entreprise (Démo)",
        alertThresholds: "90,60,30,7",
        subscriptionStatus: "ACTIVE",
        employeeLimit: 100,
      },
    });

    // Créer l'utilisateur admin
    const hashedPassword = await bcrypt.hash("demo123", 10);
    await prisma.user.create({
      data: {
        email: "demo@certpilot.fr",
        password: hashedPassword,
        name: "Admin Démo",
        role: "ADMIN",
        companyId: company.id,
      },
    });

    console.log("✅ Utilisateur demo créé !");

    return NextResponse.json({
      success: true,
      status: "created",
      message: "Utilisateur demo créé avec succès",
      credentials: {
        email: "demo@certpilot.fr",
        password: "demo123",
      },
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
