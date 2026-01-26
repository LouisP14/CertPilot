import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Récupérer les contraintes de planification
    const company = await prisma.company.findFirst({
      include: {
        planningConstraints: true,
      },
    });

    const constraints = company?.planningConstraints;

    // Calculer les dates pour les périodes
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Début de l'année courante
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    // Récupérer les sessions avec leurs coûts pour l'année
    const sessions = await prisma.trainingSession.findMany({
      where: {
        startDate: {
          gte: startOfYear,
          lte: endOfYear,
        },
        status: {
          in: ["PLANNED", "CONFIRMED", "IN_PROGRESS", "COMPLETED"],
        },
      },
      select: {
        id: true,
        startDate: true,
        totalCost: true,
        status: true,
        formationType: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            attendees: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    });

    // Initialiser les dépenses par mois (0-11)
    const monthlyData: Array<{
      month: number;
      name: string;
      spent: number;
      sessions: number;
    }> = [];

    const monthNames = [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ];

    for (let i = 0; i < 12; i++) {
      monthlyData.push({
        month: i,
        name: monthNames[i],
        spent: 0,
        sessions: 0,
      });
    }

    // Calculer les dépenses par mois et totaux
    let annualSpent = 0;
    let annualSessions = 0;

    sessions.forEach((session) => {
      const cost = session.totalCost || 0;
      const sessionDate = new Date(session.startDate);
      const sessionMonth = sessionDate.getMonth();

      monthlyData[sessionMonth].spent += cost;
      monthlyData[sessionMonth].sessions++;
      annualSpent += cost;
      annualSessions++;
    });

    // Calculer les trimestres
    const quarterlyData = [
      {
        quarter: 1,
        name: "T1 (Jan-Mar)",
        spent:
          monthlyData[0].spent + monthlyData[1].spent + monthlyData[2].spent,
        sessions:
          monthlyData[0].sessions +
          monthlyData[1].sessions +
          monthlyData[2].sessions,
      },
      {
        quarter: 2,
        name: "T2 (Avr-Jun)",
        spent:
          monthlyData[3].spent + monthlyData[4].spent + monthlyData[5].spent,
        sessions:
          monthlyData[3].sessions +
          monthlyData[4].sessions +
          monthlyData[5].sessions,
      },
      {
        quarter: 3,
        name: "T3 (Jul-Sep)",
        spent:
          monthlyData[6].spent + monthlyData[7].spent + monthlyData[8].spent,
        sessions:
          monthlyData[6].sessions +
          monthlyData[7].sessions +
          monthlyData[8].sessions,
      },
      {
        quarter: 4,
        name: "T4 (Oct-Déc)",
        spent:
          monthlyData[9].spent + monthlyData[10].spent + monthlyData[11].spent,
        sessions:
          monthlyData[9].sessions +
          monthlyData[10].sessions +
          monthlyData[11].sessions,
      },
    ];

    // Traduire les statuts
    const statusLabels: Record<string, string> = {
      PLANNED: "Planifiée",
      CONFIRMED: "Confirmée",
      IN_PROGRESS: "En cours",
      COMPLETED: "Terminée",
      CANCELLED: "Annulée",
    };

    // Formater les sessions pour le PDF
    const sessionsForExport = sessions.map((session) => ({
      name: session.formationType.name,
      date: new Date(session.startDate).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      cost: session.totalCost || 0,
      participants: session._count.attendees,
      status: statusLabels[session.status] || session.status,
    }));

    return NextResponse.json({
      year: currentYear,
      currentMonth,
      constraints: constraints
        ? {
            monthlyBudget: constraints.monthlyBudget,
            quarterlyBudget: constraints.quarterlyBudget,
            annualBudget: constraints.yearlyBudget,
          }
        : null,
      monthly: monthlyData,
      quarterly: quarterlyData,
      annual: {
        spent: annualSpent,
        sessions: annualSessions,
      },
      sessions: sessionsForExport,
    });
  } catch (error) {
    console.error("GET budget stats error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques budget" },
      { status: 500 },
    );
  }
}
