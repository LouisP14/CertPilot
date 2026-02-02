import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - Récupérer les formations et employés pour le formulaire de convocation
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier companyId
    if (!session.user.companyId) {
      return NextResponse.json({
        formations: [],
        employees: [],
        companyName: "Entreprise",
      });
    }
    const companyId = session.user.companyId;

    const [formations, employees, company] = await Promise.all([
      prisma.formationType.findMany({
        where: { isActive: true, companyId },
        select: {
          id: true,
          name: true,
          category: true,
        },
        orderBy: { name: "asc" },
      }),
      prisma.employee.findMany({
        where: { isActive: true, companyId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          department: true,
        },
        orderBy: { lastName: "asc" },
      }),
      prisma.company.findUnique({
        where: { id: companyId },
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
