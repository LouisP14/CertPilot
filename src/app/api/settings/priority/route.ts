import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseBody, prioritySettingsSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: { priorityThresholds: true },
    });
    return NextResponse.json({
      priorityThresholds: company?.priorityThresholds ?? "7,30,60",
    });
  } catch (error) {
    console.error("GET priority thresholds error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

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
    const parsed = parseBody(prioritySettingsSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { priorityThresholds } = parsed.data;

    // Validation : 3 nombres positifs croissants
    const parts = String(priorityThresholds)
      .split(",")
      .map((v) => parseInt(v.trim(), 10));

    if (
      parts.length !== 3 ||
      parts.some((v) => isNaN(v) || v < 1) ||
      parts[0] >= parts[1] ||
      parts[1] >= parts[2]
    ) {
      return NextResponse.json(
        {
          error:
            "Seuils invalides : 3 valeurs positives et croissantes requises",
        },
        { status: 400 },
      );
    }

    const company = await prisma.company.update({
      where: { id: companyId },
      data: { priorityThresholds: parts.join(",") },
    });

    return NextResponse.json({
      priorityThresholds: company.priorityThresholds,
    });
  } catch (error) {
    console.error("PUT priority thresholds error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
