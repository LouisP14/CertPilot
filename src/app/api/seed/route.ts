import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// Seed compte démo vide (sans données)
export async function POST() {
  try {
    // Check if demo account already exists
    const existingDemo = await prisma.user.findUnique({
      where: { email: "demo@certpilot.fr" },
    });

    if (existingDemo) {
      return NextResponse.json(
        { 
          success: true,
          message: "Compte démo existe déjà",
          credentials: {
            email: "demo@certpilot.fr",
            password: "demo123"
          }
        },
        { status: 200 },
      );
    }

    // Create demo company
    const company = await prisma.company.create({
      data: {
        name: "Mon Entreprise",
        alertThresholds: "90,60,30,7",
        adminEmail: "demo@certpilot.fr",
        signatureEnabled: false,
        subscriptionStatus: "ACTIVE",
        employeeLimit: 100,
      },
    });

    // Create demo admin user (NO DATA)
    const hashedPassword = await bcrypt.hash("demo123", 10);

    await prisma.user.create({
      data: {
        email: "demo@certpilot.fr",
        password: hashedPassword,
        name: "Administrateur",
        role: "ADMIN",
        companyId: company.id,
        mustChangePassword: false,
      },
    });


    return NextResponse.json({
      success: true,
      message: "Compte démo créé avec succès (base vide)",
      credentials: {
        email: "demo@certpilot.fr",
        password: "demo123",
      },
    });
  } catch (error) {
    console.error("Erreur création compte démo:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
      message: "Seed completed successfully",
      admin: { email: admin.email, name: admin.name },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 },
    );
  }
}
