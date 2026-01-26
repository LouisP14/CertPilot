import { auditCreate, auditUpdate } from "@/lib/audit";
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
    const { name, adminEmail } = body;

    // Get or create company
    let company = await prisma.company.findFirst();
    const oldCompany = company ? { ...company } : null;

    if (company) {
      company = await prisma.company.update({
        where: { id: company.id },
        data: {
          name: name || company.name,
          adminEmail: adminEmail || null,
        },
      });

      // Audit Trail
      await auditUpdate(
        "COMPANY",
        company.id,
        company.name,
        { name: oldCompany?.name, adminEmail: oldCompany?.adminEmail },
        { name, adminEmail },
        session.user
          ? {
              id: session.user.id,
              name: session.user.name || undefined,
              email: session.user.email || undefined,
            }
          : null,
      );
    } else {
      company = await prisma.company.create({
        data: {
          name: name || "Mon Entreprise",
          adminEmail: adminEmail || null,
        },
      });

      // Audit Trail
      await auditCreate(
        "COMPANY",
        company.id,
        company.name,
        { name, adminEmail },
        session.user
          ? {
              id: session.user.id,
              name: session.user.name || undefined,
              email: session.user.email || undefined,
            }
          : null,
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("PUT company error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 },
    );
  }
}
