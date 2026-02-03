import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface CenterComparison {
  center: {
    id: string;
    name: string;
    city: string;
    isPartner: boolean;
    discountPercent: number | null;
  };
  offering: {
    id: string;
    pricePerPerson: number;
    pricePerSession: number | null;
    minParticipants: number | null;
    maxParticipants: number | null;
    durationDays: number | null;
  };
  inter: {
    available: boolean;
    costPerPerson: number;
    trainingCost: number;
    totalCost: number;
  };
  intra: {
    available: boolean;
    costPerPerson: number | null;
    trainingCost: number | null;
    totalCost: number | null;
  };
  recommendation: "INTER" | "INTRA" | null;
  savings: number;
  breakEvenPoint: number | null;
}

// POST: Calculer les coûts INTER vs INTRA pour une formation
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { formationTypeId, employeeIds } = body;

    if (!formationTypeId || !employeeIds || employeeIds.length === 0) {
      return NextResponse.json(
        { error: "formationTypeId et employeeIds sont requis" },
        { status: 400 },
      );
    }

    // 1. Récupérer le type de formation
    const formationType = await prisma.formationType.findUnique({
      where: { id: formationTypeId },
      select: {
        id: true,
        name: true,
        category: true,
        durationHours: true,
        durationDays: true,
        minParticipants: true,
        maxParticipants: true,
        estimatedCostPerPerson: true,
        estimatedCostPerSession: true,
      },
    });

    if (!formationType) {
      return NextResponse.json(
        { error: "Type de formation non trouvé" },
        { status: 404 },
      );
    }

    // 2. Récupérer les employés avec leurs coûts
    const employees = await prisma.employee.findMany({
      where: { id: { in: employeeIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        hourlyCost: true,
        workingHoursPerDay: true,
        site: true,
        team: true,
      },
    });

    // 3. Calculer la durée en heures
    const durationHours =
      formationType.durationHours || (formationType.durationDays || 1) * 7;

    // 4. Calculer le coût d'absence total
    const absenceCostDetails = employees.map((emp) => {
      const hourlyCost = emp.hourlyCost ?? 0;
      const cost = durationHours * hourlyCost;
      return {
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        hourlyCost,
        hours: durationHours,
        absenceCost: cost,
      };
    });

    const totalAbsenceCost = absenceCostDetails.reduce(
      (sum, e) => sum + e.absenceCost,
      0,
    );

    // 5. Récupérer les offres des centres pour cette formation via SQL brut
    const offerings = await prisma.$queryRaw<
      Array<{
        id: string;
        pricePerPerson: number;
        pricePerSession: number | null;
        minParticipants: number | null;
        maxParticipants: number | null;
        durationDays: number | null;
        isActive: boolean;
        centerId: string;
        centerName: string;
        centerCity: string;
        isPartner: boolean;
        discountPercent: number | null;
        canTravel: boolean;
      }>
    >`
      SELECT 
        tco.id,
        tco."pricePerPerson",
        tco."pricePerSession",
        tco."minParticipants",
        tco."maxParticipants",
        tco."durationDays",
        tco."isActive",
        tc.id as "centerId",
        tc.name as "centerName",
        tc.city as "centerCity",
        tc."isPartner",
        tc."discountPercent",
        tc."canTravel"
      FROM "TrainingCenterOffering" tco
      JOIN "TrainingCenter" tc ON tco."trainingCenterId" = tc.id
      WHERE tco."formationTypeId" = ${formationTypeId}
        AND tco."isActive" = true
        AND tc."isActive" = true
    `;

    const nbEmployees = employees.length;

    // 6. Calculer les coûts pour chaque centre
    const centerComparisons: CenterComparison[] = offerings.map((offering) => {
      // Coût INTER (par personne)
      let interCostPerPerson = offering.pricePerPerson;
      if (offering.discountPercent) {
        interCostPerPerson *= 1 - offering.discountPercent / 100;
      }
      const interTrainingCost = interCostPerPerson * nbEmployees;
      const interTotalCost = interTrainingCost + totalAbsenceCost;

      // Coût INTRA (forfait session)
      let intraTotalCost: number | null = null;
      let intraTrainingCost: number | null = null;
      let intraCostPerPerson: number | null = null;
      let intraAvailable = false;

      if (offering.pricePerSession && offering.canTravel) {
        intraAvailable = true;
        intraTrainingCost = offering.pricePerSession;
        if (offering.discountPercent && intraTrainingCost !== null) {
          intraTrainingCost *= 1 - offering.discountPercent / 100;
        }
        if (intraTrainingCost !== null) {
          intraCostPerPerson = intraTrainingCost / nbEmployees;
          intraTotalCost = intraTrainingCost + totalAbsenceCost;
        }
      }

      // Déterminer le meilleur choix
      let recommendation: "INTER" | "INTRA" | null = null;
      let savings = 0;

      if (intraAvailable && intraTotalCost !== null) {
        if (intraTotalCost < interTotalCost) {
          recommendation = "INTRA";
          savings = interTotalCost - intraTotalCost;
        } else {
          recommendation = "INTER";
          savings = intraTotalCost - interTotalCost;
        }
      } else {
        recommendation = "INTER";
      }

      // Point d'équilibre (nombre de personnes où INTRA devient rentable)
      let breakEvenPoint: number | null = null;
      if (offering.pricePerSession && interCostPerPerson > 0) {
        breakEvenPoint = Math.ceil(
          offering.pricePerSession / interCostPerPerson,
        );
      }

      return {
        center: {
          id: offering.centerId,
          name: offering.centerName,
          city: offering.centerCity,
          isPartner: Boolean(offering.isPartner),
          discountPercent: offering.discountPercent,
        },
        offering: {
          id: offering.id,
          pricePerPerson: offering.pricePerPerson,
          pricePerSession: offering.pricePerSession,
          minParticipants: offering.minParticipants,
          maxParticipants: offering.maxParticipants,
          durationDays: offering.durationDays || formationType.durationDays,
        },
        inter: {
          available: true,
          costPerPerson: Math.round(interCostPerPerson * 100) / 100,
          trainingCost: Math.round(interTrainingCost * 100) / 100,
          totalCost: Math.round(interTotalCost * 100) / 100,
        },
        intra: {
          available: intraAvailable,
          costPerPerson: intraCostPerPerson
            ? Math.round(intraCostPerPerson * 100) / 100
            : null,
          trainingCost: intraTrainingCost
            ? Math.round(intraTrainingCost * 100) / 100
            : null,
          totalCost: intraTotalCost
            ? Math.round(intraTotalCost * 100) / 100
            : null,
        },
        recommendation,
        savings: Math.round(savings * 100) / 100,
        breakEvenPoint,
      };
    });

    // 7. Trier par coût total (meilleur en premier)
    centerComparisons.sort((a: CenterComparison, b: CenterComparison) => {
      const aCost =
        a.recommendation === "INTRA" && a.intra.totalCost
          ? a.intra.totalCost
          : a.inter.totalCost;
      const bCost =
        b.recommendation === "INTRA" && b.intra.totalCost
          ? b.intra.totalCost
          : b.inter.totalCost;
      return aCost - bCost;
    });

    // 8. Trouver le meilleur choix global
    const bestOption = centerComparisons[0] || null;

    return NextResponse.json({
      formationType: {
        id: formationType.id,
        name: formationType.name,
        category: formationType.category,
        durationHours,
        durationDays: formationType.durationDays,
      },
      employees: {
        count: nbEmployees,
        details: absenceCostDetails,
        totalAbsenceCost: Math.round(totalAbsenceCost * 100) / 100,
      },
      centers: centerComparisons,
      bestOption,
      summary: bestOption
        ? {
            centerId: bestOption.center.id,
            centerName: bestOption.center.name,
            mode: bestOption.recommendation,
            trainingCost:
              bestOption.recommendation === "INTRA"
                ? bestOption.intra.trainingCost
                : bestOption.inter.trainingCost,
            absenceCost: Math.round(totalAbsenceCost * 100) / 100,
            totalCost:
              bestOption.recommendation === "INTRA"
                ? bestOption.intra.totalCost
                : bestOption.inter.totalCost,
            savings: bestOption.savings,
          }
        : null,
    });
  } catch (error) {
    console.error("POST cost comparison error:", error);
    return NextResponse.json(
      { error: "Erreur lors du calcul des coûts" },
      { status: 500 },
    );
  }
}
