import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const companyId = session.user.companyId;
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    if (query.length < 2) {
      return NextResponse.json([]);
    }

    // SQLite: recherche insensible à la casse avec LIKE
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
      AND "companyId" = ${companyId}
      AND (
        "firstName" LIKE ${searchPattern}
        OR "lastName" LIKE ${searchPattern}
        OR "employeeId" LIKE ${searchPattern}
        OR position LIKE ${searchPattern}
        OR department LIKE ${searchPattern}
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
