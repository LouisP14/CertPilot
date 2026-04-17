import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseBody, alertSettingsSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    if (session.user.role === "MANAGER") {
      return NextResponse.json(
        { error: "Accès en lecture seule" },
        { status: 403 },
      );
    }
    const companyId = session.user.companyId;

    const body = await request.json();
    const parsed = parseBody(alertSettingsSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { alertThresholds } = parsed.data;

    // Get or create company liée à la session
    let company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (company) {
      company = await prisma.company.update({
        where: { id: company.id },
        data: {
          alertThresholds: String(alertThresholds) || "90,60,30,7",
        },
      });
    } else {
      company = await prisma.company.create({
        data: {
          id: companyId,
          name: "Mon Entreprise",
          alertThresholds: String(alertThresholds) || "90,60,30,7",
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
