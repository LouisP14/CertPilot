import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Vérifier les contraintes d'absence pour une date et des employés donnés
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const companyId = session.user.companyId;

    const body = await request.json();
    const { date, employeeIds } = body;

    if (!date || !employeeIds || employeeIds.length === 0) {
      return NextResponse.json(
        { error: "Date et employés requis" },
        { status: 400 },
      );
    }

    // Récupérer les contraintes de planification
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        planningConstraints: true,
      },
    });

    const constraints = company?.planningConstraints;

    const warnings: Array<{
      type: "team" | "site" | "percent" | "blockedDate" | "dayNotAllowed";
      severity: "warning" | "danger";
      message: string;
    }> = [];

    // Vérifier les dates bloquées et jours autorisés même sans autres contraintes
    const checkDate = new Date(date);
    const dayOfWeek = checkDate.getDay(); // 0 = dimanche, 1 = lundi, etc.

    // Vérifier si la date est bloquée
    if (constraints?.blacklistedDates) {
      try {
        const blacklistedDates: string[] = JSON.parse(
          constraints.blacklistedDates as string,
        );
        if (blacklistedDates.includes(date)) {
          warnings.push({
            type: "blockedDate",
            severity: "danger",
            message: `Cette date (${new Date(date).toLocaleDateString("fr-FR")}) est bloquée dans les paramètres`,
          });
        }
      } catch {
        // Ignorer les erreurs de parsing
      }
    }

    // Vérifier si le jour de la semaine est autorisé
    if (constraints?.allowedTrainingDays !== undefined) {
      const allowedDays = constraints.allowedTrainingDays;
      // Les jours sont stockés en bitmask: bit 0 = lundi, bit 1 = mardi, etc.
      // dayOfWeek: 0 = dimanche, 1 = lundi, etc.
      // Conversion: dimanche (0) -> bit 6, lundi (1) -> bit 0, etc.
      const bitPosition = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const isAllowed = (allowedDays & (1 << bitPosition)) !== 0;

      if (!isAllowed) {
        const dayNames = [
          "Dimanche",
          "Lundi",
          "Mardi",
          "Mercredi",
          "Jeudi",
          "Vendredi",
          "Samedi",
        ];
        warnings.push({
          type: "dayNotAllowed",
          severity: "danger",
          message: `Les formations ne sont pas autorisées le ${dayNames[dayOfWeek]}`,
        });
      }
    }

    if (!constraints) {
      return NextResponse.json({
        warnings,
        constraints: null,
      });
    }

    // Récupérer les informations des employés sélectionnés (filtrés par entreprise)
    const selectedEmployees = await prisma.employee.findMany({
      where: { id: { in: employeeIds }, companyId },
      select: { id: true, site: true, team: true, department: true },
    });

    // Récupérer les sessions existantes pour cette date (filtrées par entreprise)
    const existingSessions = await prisma.trainingSession.findMany({
      where: {
        startDate: {
          lte: new Date(date),
        },
        endDate: {
          gte: new Date(date),
        },
        status: {
          in: ["PLANNED", "SCHEDULED", "IN_PROGRESS", "CONFIRMED"],
        },
        formationType: { companyId },
      },
      include: {
        attendees: {
          include: {
            employee: {
              select: { id: true, site: true, team: true, department: true },
            },
          },
        },
      },
    });

    // Calculer les employés déjà absents ce jour-là
    const alreadyAbsentEmployees = existingSessions.flatMap((session) =>
      session.attendees.map((a) => a.employee),
    );

    // Compter le total des employés actifs de l'entreprise
    const totalEmployees = await prisma.employee.count({
      where: { isActive: true, companyId },
    });

    // Vérification par équipe + service (combinés)
    if (constraints.maxAbsentPerTeam) {
      const teamServiceCounts: Record<string, number> = {};

      // Compter les absents existants par équipe + service
      alreadyAbsentEmployees.forEach((emp) => {
        if (emp.team && emp.department) {
          const key = `${emp.team} - ${emp.department}`;
          teamServiceCounts[key] = (teamServiceCounts[key] || 0) + 1;
        } else if (emp.team) {
          // Fallback sur équipe seule si pas de service
          teamServiceCounts[emp.team] = (teamServiceCounts[emp.team] || 0) + 1;
        }
      });

      // Ajouter les nouveaux sélectionnés
      selectedEmployees.forEach((emp) => {
        if (emp.team && emp.department) {
          const key = `${emp.team} - ${emp.department}`;
          teamServiceCounts[key] = (teamServiceCounts[key] || 0) + 1;
        } else if (emp.team) {
          teamServiceCounts[emp.team] = (teamServiceCounts[emp.team] || 0) + 1;
        }
      });

      // Vérifier les dépassements
      Object.entries(teamServiceCounts).forEach(([teamService, count]) => {
        if (count > constraints.maxAbsentPerTeam) {
          warnings.push({
            type: "team",
            severity:
              count > constraints.maxAbsentPerTeam * 1.5 ? "danger" : "warning",
            message: `${teamService}: ${count} absents (max: ${constraints.maxAbsentPerTeam})`,
          });
        }
      });
    }

    // Vérification par site
    if (constraints.maxAbsentPerSite) {
      const siteCounts: Record<string, number> = {};

      // Compter les absents existants par site
      alreadyAbsentEmployees.forEach((emp) => {
        if (emp.site) {
          siteCounts[emp.site] = (siteCounts[emp.site] || 0) + 1;
        }
      });

      // Ajouter les nouveaux sélectionnés
      selectedEmployees.forEach((emp) => {
        if (emp.site) {
          siteCounts[emp.site] = (siteCounts[emp.site] || 0) + 1;
        }
      });

      // Vérifier les dépassements
      Object.entries(siteCounts).forEach(([site, count]) => {
        if (count > constraints.maxAbsentPerSite) {
          warnings.push({
            type: "site",
            severity:
              count > constraints.maxAbsentPerSite * 1.5 ? "danger" : "warning",
            message: `Site "${site}": ${count} absents (max: ${constraints.maxAbsentPerSite})`,
          });
        }
      });
    }

    // Vérification du pourcentage global
    if (constraints.maxAbsentPercent && totalEmployees > 0) {
      const totalAbsent =
        alreadyAbsentEmployees.length + selectedEmployees.length;
      const percentage = Math.round((totalAbsent / totalEmployees) * 100);

      if (percentage > constraints.maxAbsentPercent) {
        warnings.push({
          type: "percent",
          severity:
            percentage > constraints.maxAbsentPercent * 1.5
              ? "danger"
              : "warning",
          message: `${percentage}% de l'effectif absent (max: ${constraints.maxAbsentPercent}%)`,
        });
      }
    }

    return NextResponse.json({
      warnings,
      constraints: {
        maxAbsentPerTeam: constraints.maxAbsentPerTeam,
        maxAbsentPerSite: constraints.maxAbsentPerSite,
        maxAbsentPercent: constraints.maxAbsentPercent,
      },
      details: {
        alreadyAbsent: alreadyAbsentEmployees.length,
        newAbsent: selectedEmployees.length,
        totalAbsent: alreadyAbsentEmployees.length + selectedEmployees.length,
        totalEmployees,
      },
    });
  } catch (error) {
    console.error("POST check-constraints error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification des contraintes" },
      { status: 500 },
    );
  }
}
