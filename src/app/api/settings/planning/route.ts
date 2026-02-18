import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET: Récupérer les contraintes de planification
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const companyId = session.user.companyId;

    // Récupérer l'entreprise
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) {
      return NextResponse.json(
        { error: "Entreprise non configurée" },
        { status: 404 },
      );
    }

    // Récupérer ou créer les contraintes
    let constraints = await prisma.planningConstraints.findUnique({
      where: { companyId: company.id },
    });

    if (!constraints) {
      constraints = await prisma.planningConstraints.create({
        data: {
          companyId: company.id,
        },
      });
    }

    return NextResponse.json(constraints);
  } catch (error) {
    console.error("GET planning constraints error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des contraintes" },
      { status: 500 },
    );
  }
}

// PUT: Mettre à jour les contraintes
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (
      session.user?.role !== "ADMIN" &&
      session.user?.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent modifier les contraintes" },
        { status: 403 },
      );
    }

    const companyId = session.user.companyId;

    const body = await request.json();
    const {
      monthlyBudget,
      quarterlyBudget,
      yearlyBudget,
      alertThresholdDays,
      maxAbsentPerTeam,
      maxAbsentPerSite,
      maxAbsentPercent,
      blacklistedDates,
      allowedTrainingDays,
      preferGroupSessions,
      preferIntraCompany,
      minDaysBeforeExpiry,
    } = body;

    // Récupérer l'entreprise
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) {
      return NextResponse.json(
        { error: "Entreprise non configurée" },
        { status: 404 },
      );
    }

    // Upsert les contraintes
    const constraints = await prisma.planningConstraints.upsert({
      where: { companyId: company.id },
      create: {
        companyId: company.id,
        monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : null,
        quarterlyBudget: quarterlyBudget ? parseFloat(quarterlyBudget) : null,
        yearlyBudget: yearlyBudget ? parseFloat(yearlyBudget) : null,
        alertThresholdDays: alertThresholdDays || "90,60,30",
        maxAbsentPerTeam: maxAbsentPerTeam ? parseInt(maxAbsentPerTeam) : 2,
        maxAbsentPerSite: maxAbsentPerSite ? parseInt(maxAbsentPerSite) : 5,
        maxAbsentPercent: maxAbsentPercent ? parseFloat(maxAbsentPercent) : 20,
        blacklistedDates: blacklistedDates || "[]",
        allowedTrainingDays: allowedTrainingDays ?? 31,
        preferGroupSessions: preferGroupSessions ?? true,
        preferIntraCompany: preferIntraCompany ?? true,
        minDaysBeforeExpiry: minDaysBeforeExpiry
          ? parseInt(minDaysBeforeExpiry)
          : 30,
      },
      update: {
        monthlyBudget:
          monthlyBudget !== undefined
            ? monthlyBudget
              ? parseFloat(monthlyBudget)
              : null
            : undefined,
        quarterlyBudget:
          quarterlyBudget !== undefined
            ? quarterlyBudget
              ? parseFloat(quarterlyBudget)
              : null
            : undefined,
        yearlyBudget:
          yearlyBudget !== undefined
            ? yearlyBudget
              ? parseFloat(yearlyBudget)
              : null
            : undefined,
        alertThresholdDays: alertThresholdDays || undefined,
        maxAbsentPerTeam:
          maxAbsentPerTeam !== undefined
            ? parseInt(maxAbsentPerTeam)
            : undefined,
        maxAbsentPerSite:
          maxAbsentPerSite !== undefined
            ? parseInt(maxAbsentPerSite)
            : undefined,
        maxAbsentPercent:
          maxAbsentPercent !== undefined
            ? parseFloat(maxAbsentPercent)
            : undefined,
        blacklistedDates:
          blacklistedDates !== undefined ? blacklistedDates : undefined,
        allowedTrainingDays:
          allowedTrainingDays !== undefined ? allowedTrainingDays : undefined,
        preferGroupSessions:
          preferGroupSessions !== undefined ? preferGroupSessions : undefined,
        preferIntraCompany:
          preferIntraCompany !== undefined ? preferIntraCompany : undefined,
        minDaysBeforeExpiry:
          minDaysBeforeExpiry !== undefined
            ? parseInt(minDaysBeforeExpiry)
            : undefined,
      },
    });

    return NextResponse.json(constraints);
  } catch (error) {
    console.error("PUT planning constraints error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des contraintes" },
      { status: 500 },
    );
  }
}
