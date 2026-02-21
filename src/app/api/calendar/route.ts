import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET: Récupérer les données du calendrier (sessions, expirations, contraintes)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier companyId
    if (!session.user.companyId) {
      return NextResponse.json({
        sessions: [],
        expirations: [],
        constraints: null,
      });
    }
    const companyId = session.user.companyId;

    const { searchParams } = new URL(request.url);
    const year = parseInt(
      searchParams.get("year") || new Date().getFullYear().toString(),
    );
    const month = searchParams.get("month")
      ? parseInt(searchParams.get("month")!)
      : null;

    // Dates de début et fin de la période
    let startDate: Date;
    let endDate: Date;

    if (month !== null) {
      // Vue mensuelle
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59);
    } else {
      // Vue annuelle
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59);
    }

    // 1. Sessions de formation planifiées
    const sessions = await prisma.trainingSession.findMany({
      where: {
        formationType: { companyId },
        startDate: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: ["PLANNED", "CONFIRMED", "IN_PROGRESS"],
        },
      },
      include: {
        formationType: {
          select: {
            id: true,
            name: true,
            category: true,
            durationDays: true,
          },
        },
        trainingCenter: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        attendees: {
          where: {
            employee: { isActive: true },
          },
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                department: true,
                team: true,
                site: true,
              },
            },
          },
        },
      },
      orderBy: { startDate: "asc" },
    });

    // 2. Expirations de certificats (uniquement employés actifs)
    const expirations = await prisma.certificate.findMany({
      where: {
        isArchived: false,
        employee: { companyId, isActive: true },
        expiryDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            team: true,
            site: true,
          },
        },
        formationType: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: { expiryDate: "asc" },
    });

    // 3. Contraintes de planification
    const company = await prisma.company.findFirst({
      where: { id: companyId },
      include: {
        planningConstraints: true,
      },
    });

    const constraints = company?.planningConstraints;

    // Parser les dates blacklistées
    let blacklistedDates: string[] = [];
    if (constraints?.blacklistedDates) {
      try {
        blacklistedDates = JSON.parse(constraints.blacklistedDates);
      } catch {
        blacklistedDates = [];
      }
    }

    // Filtrer les dates blacklistées pour la période demandée
    const filteredBlacklistedDates = blacklistedDates.filter((dateStr) => {
      const date = new Date(dateStr);
      return date >= startDate && date <= endDate;
    });

    // 4. Formater les données pour le calendrier
    const calendarEvents: Array<{
      id: string;
      type: "session" | "expiration" | "blacklisted";
      date: string;
      endDate?: string;
      title: string;
      subtitle?: string;
      status?: string;
      color: string;
      data: unknown;
    }> = [];

    // Sessions
    sessions.forEach((s) => {
      calendarEvents.push({
        id: `session-${s.id}`,
        type: "session",
        date: s.startDate.toISOString().split("T")[0],
        endDate: s.endDate?.toISOString().split("T")[0],
        title: s.formationType.name,
        subtitle: `${s.attendees.length} participant(s) • ${s.trainingCenter?.name || "Lieu à définir"}`,
        status: s.status,
        color: s.isIntraCompany ? "purple" : "blue",
        data: {
          sessionId: s.id,
          formationType: s.formationType,
          trainingCenter: s.trainingCenter,
          isIntraCompany: s.isIntraCompany,
          attendees: s.attendees.map((a) => ({
            id: a.employee.id,
            name: `${a.employee.firstName} ${a.employee.lastName}`,
            department: a.employee.department,
          })),
          trainingCost: s.trainingCost,
          totalCost: s.totalCost,
        },
      });
    });

    // Expirations
    expirations.forEach((e) => {
      if (!e.expiryDate) return;

      const now = new Date();
      const daysUntil = Math.ceil(
        (e.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      let color = "amber"; // Attention
      if (daysUntil < 0) {
        color = "red"; // Expiré
      } else if (daysUntil > 30) {
        color = "gray"; // OK pour le moment
      }

      calendarEvents.push({
        id: `expiration-${e.id}`,
        type: "expiration",
        date: e.expiryDate.toISOString().split("T")[0],
        title: `${e.employee.lastName} ${e.employee.firstName}`,
        subtitle: e.formationType.name,
        color,
        data: {
          certificateId: e.id,
          employeeId: e.employee.id,
          employeeName: `${e.employee.firstName} ${e.employee.lastName}`,
          formationType: e.formationType,
          department: e.employee.department,
          daysUntil,
        },
      });
    });

    // Jours bloqués
    filteredBlacklistedDates.forEach((dateStr) => {
      calendarEvents.push({
        id: `blacklisted-${dateStr}`,
        type: "blacklisted",
        date: dateStr,
        title: "Jour bloqué",
        subtitle: "Pas de formation",
        color: "slate",
        data: { reason: "Configuration contraintes" },
      });
    });

    // 5. Stats du mois/année
    // upcomingExpirations et expiredCount sont basés sur AUJOURD'HUI (pas la période affichée)
    const today = new Date();
    const in30Days = new Date(today);
    in30Days.setDate(in30Days.getDate() + 30);

    const [upcomingExpirationsCount, expiredCount] = await Promise.all([
      prisma.certificate.count({
        where: {
          isArchived: false,
          employee: { companyId, isActive: true },
          expiryDate: { gte: today, lte: in30Days },
        },
      }),
      prisma.certificate.count({
        where: {
          isArchived: false,
          employee: { companyId, isActive: true },
          expiryDate: { lt: today },
        },
      }),
    ]);

    const stats = {
      totalSessions: sessions.length,
      totalParticipants: sessions.reduce(
        (sum, s) => sum + s.attendees.length,
        0,
      ),
      totalExpirations: expirations.length,
      expiredCount,
      upcomingExpirations: upcomingExpirationsCount,
      blacklistedDays: filteredBlacklistedDates.length,
    };

    // 6. Jours de formation autorisés (pour l'affichage)
    const allowedDays = constraints?.allowedTrainingDays || 31; // Lun-Ven par défaut
    const allowedTrainingDays = {
      monday: (allowedDays & 1) !== 0,
      tuesday: (allowedDays & 2) !== 0,
      wednesday: (allowedDays & 4) !== 0,
      thursday: (allowedDays & 8) !== 0,
      friday: (allowedDays & 16) !== 0,
      saturday: (allowedDays & 32) !== 0,
      sunday: (allowedDays & 64) !== 0,
    };

    return NextResponse.json({
      year,
      month,
      events: calendarEvents,
      stats,
      constraints: {
        blacklistedDates: filteredBlacklistedDates,
        allowedTrainingDays,
        maxAbsentPerTeam: constraints?.maxAbsentPerTeam || 2,
        maxAbsentPerSite: constraints?.maxAbsentPerSite || 5,
      },
    });
  } catch (error) {
    console.error("GET calendar error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du calendrier" },
      { status: 500 },
    );
  }
}
