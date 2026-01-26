import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    if (query.length < 2) {
      return NextResponse.json([]);
    }

    // SQLite: utiliser une requête raw pour la recherche insensible à la casse
    const lowerQuery = `%${query.toLowerCase()}%`;

    const employees = await prisma.$queryRaw<
      Array<{
        id: string;
        firstName: string;
        lastName: string;
        employeeId: string;
        position: string;
        department: string;
      }>
    >`
      SELECT id, firstName, lastName, employeeId, position, department
      FROM Employee
      WHERE isActive = 1
      AND (
        LOWER(firstName) LIKE ${lowerQuery}
        OR LOWER(lastName) LIKE ${lowerQuery}
        OR LOWER(employeeId) LIKE ${lowerQuery}
        OR LOWER(position) LIKE ${lowerQuery}
        OR LOWER(department) LIKE ${lowerQuery}
      )
      ORDER BY lastName ASC
      LIMIT 10
    `;

    return NextResponse.json(employees);
  } catch (error) {
    console.error("Search employees error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche" },
      { status: 500 },
    );
  }
}
