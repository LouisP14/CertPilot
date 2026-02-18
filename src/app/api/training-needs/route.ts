import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET: Liste des besoins de formation
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // PENDING, PLANNED, COMPLETED, CANCELLED
    const formationTypeId = searchParams.get("formationTypeId");

    const where: Record<string, unknown> = {
      employee: { companyId },
    };
    if (status) where.status = status;
    if (formationTypeId) where.formationTypeId = formationTypeId;

    const needs = await prisma.trainingNeed.findMany({
      where,
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
            isLegalObligation: true,
            renewalPriority: true,
          },
        },
      },
      orderBy: [{ priority: "desc" }, { expiryDate: "asc" }],
    });

    return NextResponse.json(needs);
  } catch (error) {
    console.error("GET training needs error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des besoins" },
      { status: 500 },
    );
  }
}

// POST: Détecter les besoins de formation (scanner les certificats expirant)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (
      session.user?.role !== "ADMIN" &&
      session.user?.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent lancer la détection" },
        { status: 403 },
      );
    }

    if (!session.user.companyId) {
      return NextResponse.json(
        { error: "Company non définie" },
        { status: 400 },
      );
    }
    const companyId = session.user.companyId;

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

    // Helper : calcul du score de priorité (1-10) selon les seuils configurés
    const computePriority = (daysUntilExpiry: number): { priority: number; priorityReason: string } => {
      if (daysUntilExpiry <= 0) {
        return { priority: 10, priorityReason: "⚠️ EXPIRÉ" };
      } else if (daysUntilExpiry <= critiqueDays) {
        return { priority: 9, priorityReason: `Expire dans ${daysUntilExpiry} jour(s)` };
      } else if (daysUntilExpiry <= urgentDays) {
        return { priority: 8, priorityReason: `Expire dans ${daysUntilExpiry} jours` };
      } else if (daysUntilExpiry <= normalDays) {
        return { priority: 6, priorityReason: `Expire dans ${Math.ceil(daysUntilExpiry / 7)} semaines` };
      } else {
        return { priority: 4, priorityReason: `Expire dans ${Math.ceil(daysUntilExpiry / 30)} mois` };
      }
    };

    const body = await request.json();
    const { horizonDays = 90 } = body; // Horizon de détection (défaut: 90 jours)

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
        employeeId: true,
        formationTypeId: true,
        certificateId: true,
      },
    });

    const expiringCertificateIds = expiringCertificates.map((c) => c.id);

    // Nettoyer les besoins obsolètes (certificat supprimé ou hors horizon)
    await prisma.trainingNeed.deleteMany({
      where: {
        status: "PENDING",
        certificateId: { not: null, notIn: expiringCertificateIds },
        employee: { companyId },
      },
    });

    const existingSet = new Set(
      existingNeeds.map((n) => `${n.employeeId}-${n.formationTypeId}`),
    );

    // 3. Créer les nouveaux besoins
    const needsToCreate = [];

    for (const cert of expiringCertificates) {
      const key = `${cert.employeeId}-${cert.formationTypeId}`;

      // Skip si besoin déjà existant
      if (existingSet.has(key)) continue;

      const expiryDate = cert.expiryDate!;
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Calcul de la priorité via les seuils configurés
      let { priority, priorityReason } = computePriority(daysUntilExpiry);

      // Bonus priorité si obligation légale
      if (cert.formationType.isLegalObligation) {
        priority = Math.min(10, priority + 1);
        priorityReason += " • Obligation légale";
      }

      // Calcul des coûts estimés
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

    for (const need of pendingNeeds) {
      if (need.expiryDate) {
        const daysUntilExpiry = Math.ceil(
          (need.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );

        let { priority, priorityReason } = computePriority(daysUntilExpiry);

        // (pas de bonus legal ici car données non chargées dans ce contexte)

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
      }
    }

    return NextResponse.json({
      success: true,
      created: needsToCreate.length,
      message: `${needsToCreate.length} nouveau(x) besoin(s) détecté(s)`,
    });
  } catch (error) {
    console.error("POST training needs detection error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la détection des besoins" },
      { status: 500 },
    );
  }
}
