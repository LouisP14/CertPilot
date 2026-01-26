import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - Récupérer les formations et employés pour le formulaire de convocation
export async function GET() {
  try {
    const [formations, employees, company] = await Promise.all([
      prisma.formationType.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          category: true,
        },
        orderBy: { name: "asc" },
      }),
      prisma.employee.findMany({
        where: { isActive: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          department: true,
        },
        orderBy: { lastName: "asc" },
      }),
      prisma.company.findFirst({
        select: { name: true },
      }),
    ]);

    return NextResponse.json({
      formations,
      employees,
      companyName: company?.name || "Entreprise",
    });
  } catch (error) {
    console.error("GET convocations form-data error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 },
    );
  }
}
