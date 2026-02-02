import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// Cette route initialise la base de données PostgreSQL avec Prisma
export async function GET() {
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

    const hashedAdminPassword = await bcrypt.hash("Admin123!", 10);
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

    const hashedDemoPassword = await bcrypt.hash("demo123!", 10);
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
        },
      });
      results.demo = "created";
    }

    return NextResponse.json({
      success: true,
      results,
      credentials: {
        admin: { email: "admin@certpilot.fr", password: "Admin123!" },
        demo: { email: "demo@certpilot.fr", password: "demo123!" },
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
