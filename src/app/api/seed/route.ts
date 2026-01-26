import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// Seed initial admin user
export async function POST() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@passeport-formation.fr" },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { message: "Admin already exists" },
        { status: 400 },
      );
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("Admin123!", 10);

    const admin = await prisma.user.create({
      data: {
        email: "admin@passeport-formation.fr",
        password: hashedPassword,
        name: "Administrateur",
        role: "ADMIN",
      },
    });

    // Create default company
    await prisma.company.create({
      data: {
        name: "Mon Entreprise",
        alertThresholds: "90,60,30,7",
        adminEmail: "admin@passeport-formation.fr",
      },
    });

    // Create some default formation types
    const formationTypes = [
      {
        name: "Électricien Basse Tension",
        category: "B0S44-3 BT",
        defaultValidityMonths: 36,
      },
      {
        name: "Électricien Haute Tension",
        category: "B0S44-3 HT",
        defaultValidityMonths: 36,
      },
      {
        name: "Conducteur de chaufferie vapeur",
        category: null,
        defaultValidityMonths: null,
      },
      {
        name: "Agent de chaufferie vapeur",
        category: null,
        defaultValidityMonths: null,
      },
      {
        name: "Autoclaves - Conduite et Maintenance",
        category: null,
        defaultValidityMonths: null,
      },
      {
        name: "Gerbeur conducteur porté - CAT 1B",
        category: "R489 CAT 1B",
        defaultValidityMonths: 60,
      },
      {
        name: "Chariot à conducteur porté - CAT 3",
        category: "R489 CAT 3",
        defaultValidityMonths: 60,
      },
      {
        name: "Chariot élévateur frontal - CAT 2",
        category: "R485 CAT 2",
        defaultValidityMonths: 60,
      },
      {
        name: "Gerbeur accompagnant - CAT 2",
        category: "R485 CAT 2",
        defaultValidityMonths: 60,
      },
      {
        name: "Travaux en hauteur - port du harnais",
        category: "R431",
        defaultValidityMonths: 36,
      },
      {
        name: "Conduite palan et élingues",
        category: "R484",
        defaultValidityMonths: 60,
      },
      { name: "Nacelle", category: "R486", defaultValidityMonths: 60 },
      { name: "Espaces confinés", category: "R447", defaultValidityMonths: 36 },
      { name: "LOTOTO", category: null, defaultValidityMonths: null },
      {
        name: "Sauveteur Secouriste du Travail",
        category: "SST",
        defaultValidityMonths: 24,
      },
      {
        name: "Habilitation électrique BR",
        category: "BR",
        defaultValidityMonths: 36,
      },
      {
        name: "Habilitation électrique BC",
        category: "BC",
        defaultValidityMonths: 36,
      },
      {
        name: "Habilitation électrique B2V",
        category: "B2V",
        defaultValidityMonths: 36,
      },
      {
        name: "CACES Pont roulant",
        category: "R484",
        defaultValidityMonths: 60,
      },
      { name: "Formation incendie", category: null, defaultValidityMonths: 12 },
    ];

    for (const ft of formationTypes) {
      await prisma.formationType.create({ data: ft });
    }

    return NextResponse.json({
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
