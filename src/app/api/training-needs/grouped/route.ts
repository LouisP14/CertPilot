import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Besoins regroupés par formation (pour planification)
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer tous les besoins en attente
    const needs = await prisma.trainingNeed.findMany({
      where: { status: "PENDING" },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            position: true,
            department: true,
            site: true,
            team: true,
            hourlyCost: true,
            workingHoursPerDay: true,
          },
        },
        formationType: {
          select: {
            id: true,
            name: true,
            category: true,
            service: true,
            durationHours: true,
            durationDays: true,
            minParticipants: true,
            maxParticipants: true,
            isLegalObligation: true,
            estimatedCostPerPerson: true,
            estimatedCostPerSession: true,
          },
        },
      },
      orderBy: [{ priority: "desc" }, { expiryDate: "asc" }],
    });

    // Regrouper par type de formation
    const groupedByFormation = needs.reduce(
      (acc, need) => {
        const ftId = need.formationTypeId;
        if (!acc[ftId]) {
          acc[ftId] = {
            formationType: need.formationType,
            needs: [],
            totalEmployees: 0,
            avgPriority: 0,
            maxPriority: 0,
            earliestExpiry: null as Date | null,
            totalEstimatedCost: 0,
            totalAbsenceCost: 0,
            sites: new Set<string>(),
            teams: new Set<string>(),
          };
        }

        acc[ftId].needs.push(need);
        acc[ftId].totalEmployees++;
        acc[ftId].maxPriority = Math.max(acc[ftId].maxPriority, need.priority);
        acc[ftId].totalEstimatedCost += need.estimatedCost || 0;
        acc[ftId].totalAbsenceCost += need.absenceCost || 0;

        if (need.employee.site) acc[ftId].sites.add(need.employee.site);
        if (need.employee.team) acc[ftId].teams.add(need.employee.team);

        if (
          need.expiryDate &&
          (!acc[ftId].earliestExpiry ||
            need.expiryDate < acc[ftId].earliestExpiry)
        ) {
          acc[ftId].earliestExpiry = need.expiryDate;
        }

        return acc;
      },
      {} as Record<string, unknown>,
    );

    // Calculer la moyenne de priorité et convertir les Sets en arrays
    const result = Object.values(groupedByFormation).map((group: unknown) => {
      const g = group as {
        needs: { priority: number }[];
        totalEmployees: number;
        maxPriority: number;
        sites: Set<string>;
        teams: Set<string>;
        formationType: unknown;
        earliestExpiry: Date | null;
        totalEstimatedCost: number;
        totalAbsenceCost: number;
      };
      const avgPriority =
        g.needs.reduce(
          (sum: number, n: { priority: number }) => sum + n.priority,
          0,
        ) / g.totalEmployees;

      return {
        ...g,
        avgPriority: Math.round(avgPriority * 10) / 10,
        sites: Array.from(g.sites),
        teams: Array.from(g.teams),
      };
    });

    // Trier par priorité max puis par nombre d'employés
    result.sort((a, b) => {
      if (b.maxPriority !== a.maxPriority) return b.maxPriority - a.maxPriority;
      return b.totalEmployees - a.totalEmployees;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET grouped training needs error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des besoins groupés" },
      { status: 500 },
    );
  }
}
