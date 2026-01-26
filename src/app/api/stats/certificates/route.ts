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
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    // Compter tous les certificats expirés et expirant
    const [expiredCount, expiringCount, totalNeeds] = await Promise.all([
      prisma.certificate.count({
        where: {
          isArchived: false,
          expiryDate: {
            not: null,
            lt: now,
          },
          employee: {
            isActive: true,
          },
          formationType: {
            isActive: true,
          },
        },
      }),
      prisma.certificate.count({
        where: {
          isArchived: false,
          expiryDate: {
            not: null,
            gte: now,
            lte: in90Days,
          },
          employee: {
            isActive: true,
          },
          formationType: {
            isActive: true,
          },
        },
      }),
      prisma.trainingNeed.count({
        where: {
          status: { in: ["PENDING", "PLANNED"] },
        },
      }),
    ]);

    return NextResponse.json({
      expiredCount,
      expiringCount,
      totalNeeds,
    });
  } catch (error) {
    console.error("GET certificate stats error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 },
    );
  }
}
