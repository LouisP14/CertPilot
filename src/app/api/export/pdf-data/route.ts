import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
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

    const company = await prisma.company.findFirst();

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
