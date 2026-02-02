import { auditPlanSession } from "@/lib/audit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET: Liste des sessions planifiées
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const formationTypeId = searchParams.get("formationTypeId");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (formationTypeId) where.formationTypeId = formationTypeId;

    // Filtrer par companyId via formationType
    if (!session.user.companyId) {
      return NextResponse.json([]);
    }
    where.formationType = {
      companyId: session.user.companyId,
    };

    const sessions = await prisma.trainingSession.findMany({
      where,
      include: {
        formationType: true,
        trainingCenter: true,
        attendees: {
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
              },
            },
          },
        },
      },
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("GET sessions error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des sessions" },
      { status: 500 },
    );
  }
}

// POST: Créer une nouvelle session
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent créer des sessions" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      formationTypeId,
      trainingCenterId,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      isIntraCompany,
      trainingMode,
      minParticipants,
      maxParticipants,
      trainingCost,
      costPerPerson,
      totalAbsenceCost,
      totalCost,
      status,
      notes,
      employeeIds, // Liste des employés à inviter
      trainingNeedIds, // Besoins de formation à marquer comme planifiés
    } = body;

    // Vérifier la limite de participants si un centre est sélectionné
    if (trainingCenterId && employeeIds && employeeIds.length > 0) {
      const offering = await prisma.trainingCenterOffering.findFirst({
        where: {
          trainingCenterId,
          formationTypeId,
        },
        select: {
          maxParticipants: true,
        },
      });

      if (
        offering?.maxParticipants &&
        employeeIds.length > offering.maxParticipants
      ) {
        return NextResponse.json(
          {
            error: `Cette offre est limitée à ${offering.maxParticipants} participants maximum. Vous en avez sélectionné ${employeeIds.length}.`,
          },
          { status: 400 },
        );
      }
    }

    // Créer la session
    const trainingSession = await prisma.trainingSession.create({
      data: {
        formationTypeId,
        trainingCenterId: trainingCenterId || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate || startDate),
        startTime: startTime || "09:00",
        endTime: endTime || "17:00",
        location: location || null,
        isIntraCompany: isIntraCompany ?? false,
        trainingMode: trainingMode || "PRESENTIEL",
        minParticipants: minParticipants || 1,
        maxParticipants: maxParticipants || 12,
        trainingCost: trainingCost ? parseFloat(trainingCost) : null,
        costPerPerson: costPerPerson ? parseFloat(costPerPerson) : null,
        totalAbsenceCost: totalAbsenceCost
          ? parseFloat(totalAbsenceCost)
          : null,
        totalCost: totalCost ? parseFloat(totalCost) : null,
        status: status || "PLANNED",
        notes: notes || null,
      },
    });

    // Ajouter les participants
    if (employeeIds && employeeIds.length > 0) {
      // Récupérer les coûts horaires des employés
      const employees = await prisma.employee.findMany({
        where: { id: { in: employeeIds } },
        select: {
          id: true,
          hourlyCost: true,
          workingHoursPerDay: true,
        },
      });

      // Récupérer la durée de la formation
      const formationType = await prisma.formationType.findUnique({
        where: { id: formationTypeId },
        select: { durationHours: true, durationDays: true },
      });

      const durationHours =
        formationType?.durationHours || (formationType?.durationDays || 1) * 7;

      const attendeesData = employeeIds.map((employeeId: string) => {
        const emp = employees.find((e) => e.id === employeeId);
        const hourlyCost = emp?.hourlyCost || 25;
        const absenceCost = durationHours * hourlyCost;

        return {
          sessionId: trainingSession.id,
          employeeId,
          status: "INVITED",
          absenceCost,
        };
      });

      await prisma.trainingSessionAttendee.createMany({
        data: attendeesData,
      });

      // Calculer et mettre à jour les coûts totaux
      const calculatedTotalAbsenceCost = attendeesData.reduce(
        (sum: number, att: { absenceCost: number }) => sum + att.absenceCost,
        0,
      );
      const sessionTrainingCost = trainingCost ? parseFloat(trainingCost) : 0;
      const calculatedTotalCost =
        sessionTrainingCost + calculatedTotalAbsenceCost;

      await prisma.trainingSession.update({
        where: { id: trainingSession.id },
        data: {
          totalAbsenceCost: calculatedTotalAbsenceCost,
          totalCost: calculatedTotalCost,
        },
      });
    }

    // Marquer les besoins comme planifiés
    if (trainingNeedIds && trainingNeedIds.length > 0) {
      await prisma.trainingNeed.updateMany({
        where: { id: { in: trainingNeedIds } },
        data: {
          status: "PLANNED",
          plannedSessionId: trainingSession.id,
        },
      });
    }

    // Retourner la session avec les relations
    const result = await prisma.trainingSession.findUnique({
      where: { id: trainingSession.id },
      include: {
        formationType: true,
        trainingCenter: true,
        attendees: {
          include: {
            employee: true,
          },
        },
      },
    });

    // Audit Trail
    await auditPlanSession(
      result!.id,
      result!.formationType.name,
      result!.isIntraCompany ? "INTRA" : "INTER",
      employeeIds?.length || 0,
      new Date(startDate).toLocaleDateString("fr-FR"),
      session.user
        ? {
            id: session.user.id,
            name: session.user.name || undefined,
            email: session.user.email || undefined,
          }
        : null,
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST session error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la session" },
      { status: 500 },
    );
  }
}
