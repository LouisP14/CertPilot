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

    // PostgreSQL: recherche insensible à la casse avec ILIKE
    const searchPattern = `%${query}%`;

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
      SELECT id, "firstName", "lastName", "employeeId", position, department
      FROM "Employee"
      WHERE "isActive" = true
      AND (
        "firstName" ILIKE ${searchPattern}
        OR "lastName" ILIKE ${searchPattern}
        OR "employeeId" ILIKE ${searchPattern}
        OR position ILIKE ${searchPattern}
        OR department ILIKE ${searchPattern}
      )
      ORDER BY "lastName" ASC
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
