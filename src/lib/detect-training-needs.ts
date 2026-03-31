import prisma from "./prisma";

/**
 * Détecte les besoins de formation pour une entreprise donnée.
 * Réutilisable par l'API manuelle (POST /api/training-needs) et le cron automatique.
 */
export async function detectTrainingNeeds(
  companyId: string,
  horizonDays = 90,
): Promise<{ created: number; updated: number }> {
  // Lire les seuils de priorité configurés par l'entreprise
  const companySettings = await prisma.company.findUnique({
    where: { id: companyId },
    select: { priorityThresholds: true },
  });
  const rawThresholds = (companySettings?.priorityThresholds ?? "7,30,60")
    .split(",")
    .map(Number);
  const [critiqueDays, urgentDays, normalDays] = [
    rawThresholds[0] ?? 7,
    rawThresholds[1] ?? 30,
    rawThresholds[2] ?? 60,
  ];

  const computePriority = (
    daysUntilExpiry: number,
  ): { priority: number; priorityReason: string } => {
    if (daysUntilExpiry <= 0) {
      return { priority: 10, priorityReason: "⚠️ EXPIRÉ" };
    } else if (daysUntilExpiry <= critiqueDays) {
      return {
        priority: 9,
        priorityReason: `Expire dans ${daysUntilExpiry} jour(s)`,
      };
    } else if (daysUntilExpiry <= urgentDays) {
      return {
        priority: 8,
        priorityReason: `Expire dans ${daysUntilExpiry} jours`,
      };
    } else if (daysUntilExpiry <= normalDays) {
      return {
        priority: 6,
        priorityReason: `Expire dans ${Math.ceil(daysUntilExpiry / 7)} semaines`,
      };
    } else {
      return {
        priority: 4,
        priorityReason: `Expire dans ${Math.ceil(daysUntilExpiry / 30)} mois`,
      };
    }
  };

  const today = new Date();
  const horizonDate = new Date();
  horizonDate.setDate(horizonDate.getDate() + horizonDays);

  // 1. Récupérer les certificats qui expirent dans l'horizon
  const expiringCertificates = await prisma.certificate.findMany({
    where: {
      isArchived: false,
      expiryDate: {
        not: null,
        lte: horizonDate,
      },
      employee: {
        isActive: true,
        companyId,
      },
    },
    include: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          hourlyCost: true,
          workingHoursPerDay: true,
        },
      },
      formationType: {
        select: {
          id: true,
          name: true,
          durationHours: true,
          durationDays: true,
          isLegalObligation: true,
          renewalPriority: true,
          estimatedCostPerPerson: true,
        },
      },
    },
  });

  // 2. Vérifier les besoins existants pour éviter les doublons
  const existingNeeds = await prisma.trainingNeed.findMany({
    where: {
      status: { in: ["PENDING", "PLANNED"] },
      employee: { companyId },
    },
    select: {
      id: true,
      employeeId: true,
      formationTypeId: true,
      certificateId: true,
      status: true,
      plannedSessionId: true,
    },
  });

  const expiringCertificateIds = expiringCertificates.map((c) => c.id);

  // Nettoyer les besoins obsolètes
  await prisma.trainingNeed.deleteMany({
    where: {
      status: "PENDING",
      certificateId: { not: null, notIn: expiringCertificateIds },
      employee: { companyId },
    },
  });

  // Réinitialiser les besoins PLANNED orphelins en PENDING
  const plannedNeeds = existingNeeds.filter((n) => n.status === "PLANNED");

  if (plannedNeeds.length > 0) {
    const attendees = await prisma.trainingSessionAttendee.findMany({
      where: {
        sessionId: {
          in: plannedNeeds.map((n) => n.plannedSessionId!).filter(Boolean),
        },
        employeeId: { in: plannedNeeds.map((n) => n.employeeId) },
      },
      select: { employeeId: true, sessionId: true },
    });

    const attendeeSet = new Set(
      attendees.map((a) => `${a.employeeId}-${a.sessionId}`),
    );

    const orphanedPlannedIds = plannedNeeds
      .filter(
        (n) =>
          !n.plannedSessionId ||
          !attendeeSet.has(`${n.employeeId}-${n.plannedSessionId}`),
      )
      .map((n) => n.id);

    if (orphanedPlannedIds.length > 0) {
      await prisma.trainingNeed.updateMany({
        where: { id: { in: orphanedPlannedIds } },
        data: { status: "PENDING", plannedSessionId: null },
      });
    }
  }

  const existingSet = new Set(
    existingNeeds.map((n) => `${n.employeeId}-${n.formationTypeId}`),
  );

  // 3. Créer les nouveaux besoins
  const needsToCreate = [];

  for (const cert of expiringCertificates) {
    const key = `${cert.employeeId}-${cert.formationTypeId}`;
    if (existingSet.has(key)) continue;

    const expiryDate = cert.expiryDate!;
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    let { priority, priorityReason } = computePriority(daysUntilExpiry);

    if (cert.formationType.isLegalObligation) {
      priority = Math.min(10, priority + 1);
      priorityReason += " • Obligation légale";
    }

    const durationHours =
      cert.formationType.durationHours ||
      (cert.formationType.durationDays || 1) * 7;
    const hourlyCost = cert.employee.hourlyCost ?? 0;
    const estimatedCost = cert.formationType.estimatedCostPerPerson || 0;
    const absenceCost = durationHours * hourlyCost;
    const totalCost = estimatedCost + absenceCost;

    needsToCreate.push({
      employeeId: cert.employeeId,
      formationTypeId: cert.formationTypeId,
      certificateId: cert.id,
      expiryDate: expiryDate,
      daysUntilExpiry,
      priority,
      priorityReason,
      status: "PENDING",
      estimatedCost,
      absenceCost,
      totalCost,
    });
  }

  // 4. Insérer en base
  if (needsToCreate.length > 0) {
    await prisma.trainingNeed.createMany({
      data: needsToCreate,
    });
  }

  // 5. Mettre à jour les jours restants pour les besoins existants
  const pendingNeeds = await prisma.trainingNeed.findMany({
    where: {
      status: "PENDING",
      expiryDate: { not: null },
      employee: { companyId },
    },
    include: {
      employee: { select: { hourlyCost: true } },
      formationType: {
        select: {
          durationHours: true,
          durationDays: true,
          estimatedCostPerPerson: true,
        },
      },
    },
  });

  let updated = 0;
  for (const need of pendingNeeds) {
    if (need.expiryDate) {
      const daysUntilExpiry = Math.ceil(
        (need.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      let { priority, priorityReason } = computePriority(daysUntilExpiry);

      const durationHours =
        need.formationType.durationHours ||
        (need.formationType.durationDays || 1) * 7;
      const hourlyCost = need.employee.hourlyCost ?? 0;
      const estimatedCost = need.formationType.estimatedCostPerPerson || 0;
      const absenceCost = durationHours * hourlyCost;
      const totalCost = estimatedCost + absenceCost;

      await prisma.trainingNeed.update({
        where: { id: need.id },
        data: {
          daysUntilExpiry,
          priority,
          priorityReason,
          estimatedCost,
          absenceCost,
          totalCost,
        },
      });
      updated++;
    }
  }

  return { created: needsToCreate.length, updated };
}
