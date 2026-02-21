import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!session.user.companyId) {
      return NextResponse.json({ employees: [], companyName: null });
    }

    const companyId = session.user.companyId;

    const employees = await prisma.employee.findMany({
      where: {
        companyId,
        isActive: true,
      },
      include: {
        certificates: {
          where: { isArchived: false },
          include: {
            formationType: true,
          },
          orderBy: { expiryDate: "asc" },
        },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true },
    });

    return NextResponse.json({
      employees,
      companyName: company?.name || null,
    });
  } catch (error) {
    console.error("Error fetching export data:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 },
    );
  }
}
