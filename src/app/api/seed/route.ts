import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

function checkAuth(request: NextRequest): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  const secret = request.headers.get("authorization")?.replace("Bearer ", "")
    ?? new URL(request.url).searchParams.get("secret");
  return !!process.env.INIT_SECRET && secret === process.env.INIT_SECRET;
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

  const adminPassword = await bcrypt.hash("Admin2026!", 10);
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

  const demoPassword = await bcrypt.hash("demo123!", 10);
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
