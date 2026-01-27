import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

/**
 * Crée 2 comptes :
 * 1. admin@certpilot.fr - Votre compte admin principal
 * 2. demo@certpilot.fr - Compte pour les démos clients (base vide)
 */
export async function POST() {
  try {
    const userCount = await prisma.user.count();

    if (userCount > 0) {
      return NextResponse.json({
        success: true,
        message: "Les comptes existent déjà",
        accounts: [
          { email: "admin@certpilot.fr", password: "Admin2026!" },
          { email: "demo@certpilot.fr", password: "demo123" },
        ],
      });
    }

    // === 1. VOTRE COMPTE ADMIN ===
    const adminCompany = await prisma.company.create({
      data: {
        name: "CertPilot Admin",
        alertThresholds: "90,60,30,7",
        adminEmail: "admin@certpilot.fr",
        signatureEnabled: false,
        subscriptionStatus: "ACTIVE",
        employeeLimit: 9999,
      },
    });

    const adminPassword = await bcrypt.hash("Admin2026!", 10);
    await prisma.user.create({
      data: {
        email: "admin@certpilot.fr",
        password: adminPassword,
        name: "Louis POULAIN",
        role: "ADMIN",
        companyId: adminCompany.id,
        mustChangePassword: false,
      },
    });

    // === 2. COMPTE DÉMO ===
    const demoCompany = await prisma.company.create({
      data: {
        name: "Entreprise Démo",
        alertThresholds: "90,60,30,7",
        adminEmail: "demo@certpilot.fr",
        signatureEnabled: false,
        subscriptionStatus: "ACTIVE",
        employeeLimit: 100,
      },
    });

    const demoPassword = await bcrypt.hash("demo123", 10);
    await prisma.user.create({
      data: {
        email: "demo@certpilot.fr",
        password: demoPassword,
        name: "Compte Démo",
        role: "ADMIN",
        companyId: demoCompany.id,
        mustChangePassword: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Comptes créés avec succès",
      accounts: [
        {
          email: "admin@certpilot.fr",
          password: "Admin2026!",
          usage: "Votre compte admin principal",
        },
        {
          email: "demo@certpilot.fr",
          password: "demo123",
          usage: "Compte pour démos clients (base vide)",
        },
      ],
    });
  } catch (error) {
    console.error("Erreur création comptes:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
