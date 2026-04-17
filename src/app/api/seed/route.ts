import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

function checkAuth(request: NextRequest): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return true;
}

/**
 * Crée 2 comptes :
 * 1. admin@certpilot.fr - Votre compte admin principal
 * 2. demo@certpilot.fr - Compte pour les démos clients (base vide)
 */
async function createAccounts() {
  const userCount = await prisma.user.count();

  if (userCount > 0) {
    return NextResponse.json({
      success: true,
      message: "Les comptes existent déjà",
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

  const adminPass = process.env.INIT_ADMIN_PASSWORD;
  if (!adminPass) {
    return NextResponse.json({ error: "INIT_ADMIN_PASSWORD non défini" }, { status: 500 });
  }
  const adminPassword = await bcrypt.hash(adminPass, 12);
  await prisma.user.create({
    data: {
      email: "admin@certpilot.fr",
      password: adminPassword,
      name: "Louis POULAIN",
      role: "ADMIN",
      companyId: adminCompany.id,
      mustChangePassword: false,
      emailVerified: true,
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

  const demoPass = process.env.INIT_DEMO_PASSWORD;
  if (!demoPass) {
    return NextResponse.json({ error: "INIT_DEMO_PASSWORD non défini" }, { status: 500 });
  }
  const demoPassword = await bcrypt.hash(demoPass, 12);
  await prisma.user.create({
    data: {
      email: "demo@certpilot.fr",
      password: demoPassword,
      name: "Compte Démo",
      role: "ADMIN",
      companyId: demoCompany.id,
      mustChangePassword: false,
      emailVerified: true,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Comptes créés avec succès",
  });
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    return await createAccounts();
  } catch (error) {
    console.error("Erreur création comptes:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    return await createAccounts();
  } catch (error) {
    console.error("Erreur création comptes:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
