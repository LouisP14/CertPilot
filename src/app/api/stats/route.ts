import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Total employés actifs
    const totalEmployees = await prisma.employee.count({
      where: { isActive: true },
    });

    // Total formations actives (non archivées)
    const totalCertificates = await prisma.certificate.count({
      where: { isArchived: false },
    });

    // Formations expirant ce mois
    const expiringThisMonth = await prisma.certificate.count({
      where: {
        isArchived: false,
        expiryDate: {
          not: null,
          gte: now,
          lte: endOfMonth,
        },
      },
    });

    // Formations expirées
    const expired = await prisma.certificate.count({
      where: {
        isArchived: false,
        expiryDate: {
          not: null,
          lt: now,
        },
      },
    });

    return NextResponse.json({
      totalEmployees,
      totalCertificates,
      expiringThisMonth,
      expired,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 },
    );
  }
}
