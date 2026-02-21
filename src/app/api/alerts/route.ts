import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier companyId
    if (!session.user.companyId) {
      return NextResponse.json([]);
    }
    const companyId = session.user.companyId;

    const now = new Date();
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    // Get certificates expiring within 90 days or already expired (uniquement employés actifs)
    const certificates = await prisma.certificate.findMany({
      where: {
        isArchived: false,
        employee: { companyId, isActive: true },
        expiryDate: {
          not: null,
          lte: in90Days,
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        formationType: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        expiryDate: "asc",
      },
    });

    const alerts = certificates.map((cert) => {
      const expiryDate = new Date(cert.expiryDate!);
      const daysLeft = Math.ceil(
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      return {
        id: cert.id,
        employeeId: cert.employee.id,
        employeeName: `${cert.employee.lastName} ${cert.employee.firstName}`,
        formationName: cert.formationType.name,
        expiryDate: cert.expiryDate!.toISOString(),
        daysLeft,
        status: daysLeft < 0 ? "expired" : "expiring",
      };
    });

    // Sort: expired first, then by days remaining
    alerts.sort((a, b) => {
      if (a.status === "expired" && b.status !== "expired") return -1;
      if (a.status !== "expired" && b.status === "expired") return 1;
      return a.daysLeft - b.daysLeft;
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("GET alerts error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des alertes" },
      { status: 500 },
    );
  }
}
