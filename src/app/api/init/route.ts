import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

// Cette route initialise la base de données PostgreSQL avec Prisma
// Protégée : uniquement en développement ou avec INIT_SECRET
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    const secret = request.headers.get("authorization")?.replace("Bearer ", "")
      ?? new URL(request.url).searchParams.get("secret");
    if (!process.env.INIT_SECRET || secret !== process.env.INIT_SECRET) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
  }

  try {
    const results: { admin?: string; demo?: string } = {};

    // ========== COMPTE ADMIN ==========
    let adminCompany = await prisma.company.findFirst({
      where: { id: "certpilot-main" },
    });

    if (!adminCompany) {
      adminCompany = await prisma.company.create({
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
      console.log("✅ Entreprise CertPilot créée");
    }

    const adminPass = process.env.INIT_ADMIN_PASSWORD || "Admin123!";
    const hashedAdminPassword = await bcrypt.hash(adminPass, 12);
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@certpilot.fr" },
    });

    if (existingAdmin) {
      await prisma.user.update({
        where: { email: "admin@certpilot.fr" },
        data: {
          password: hashedAdminPassword,
          role: "SUPER_ADMIN",
          companyId: adminCompany.id,
          emailVerified: true,
        },
      });
      results.admin = "updated";
    } else {
      await prisma.user.create({
        data: {
          email: "admin@certpilot.fr",
          password: hashedAdminPassword,
          name: "Admin CertPilot",
          role: "SUPER_ADMIN",
          companyId: adminCompany.id,
          mustChangePassword: false,
          emailVerified: true,
        },
      });
      results.admin = "created";
    }

    // ========== COMPTE DEMO ==========
    let demoCompany = await prisma.company.findFirst({
      where: { id: "demo-company" },
    });

    if (!demoCompany) {
      demoCompany = await prisma.company.create({
        data: {
          id: "demo-company",
          name: "Demo Entreprise",
          alertThresholds: "90,60,30,7",
          adminEmail: "demo@certpilot.fr",
          subscriptionStatus: "ACTIVE",
          subscriptionPlan: "Professional",
          employeeLimit: 100,
        },
      });
      console.log("✅ Entreprise Demo créée");
    }

    const demoPass = process.env.INIT_DEMO_PASSWORD || "demo123!";
    const hashedDemoPassword = await bcrypt.hash(demoPass, 12);
    const existingDemo = await prisma.user.findUnique({
      where: { email: "demo@certpilot.fr" },
    });

    if (existingDemo) {
      await prisma.user.update({
        where: { email: "demo@certpilot.fr" },
        data: {
          password: hashedDemoPassword,
          role: "ADMIN",
          companyId: demoCompany.id,
          emailVerified: true,
        },
      });
      results.demo = "updated";
    } else {
      await prisma.user.create({
        data: {
          email: "demo@certpilot.fr",
          password: hashedDemoPassword,
          name: "Utilisateur Demo",
          role: "ADMIN",
          companyId: demoCompany.id,
          mustChangePassword: false,
          emailVerified: true,
        },
      });
      results.demo = "created";
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Erreur init:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
