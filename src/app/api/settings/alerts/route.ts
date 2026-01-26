import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { alertThresholds } = body;

    // Get or create company
    let company = await prisma.company.findFirst();

    if (company) {
      company = await prisma.company.update({
        where: { id: company.id },
        data: {
          alertThresholds: alertThresholds || "90,60,30,7",
        },
      });
    } else {
      company = await prisma.company.create({
        data: {
          name: "Mon Entreprise",
          alertThresholds: alertThresholds || "90,60,30,7",
        },
      });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("PUT alerts error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 },
    );
  }
}
