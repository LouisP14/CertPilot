import { auditDelete, auditUpdate } from "@/lib/audit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET: Récupérer une session spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const trainingSession = await prisma.trainingSession.findFirst({
      where: { id, formationType: { companyId: session.user.companyId } },
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
                position: true,
                department: true,
                site: true,
                team: true,
                hourlyCost: true,
              },
            },
          },
        },
      },
    });

    if (!trainingSession) {
      return NextResponse.json(
        { error: "Session non trouvée" },
        { status: 404 },
      );
    }

    return NextResponse.json(trainingSession);
  } catch (error) {
    console.error("GET session error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 },
    );
  }
}

// PATCH: Mettre à jour une session
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Vérifier que la session existe + appartenance entreprise
    const existingSession = await prisma.trainingSession.findFirst({
      where: { id, formationType: { companyId: session.user.companyId } },
      include: { attendees: true },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: "Session non trouvée" },
        { status: 404 },
      );
    }

    const updateData: Record<string, unknown> = {};

    // Mise à jour des champs autorisés
    if (body.startDate !== undefined) {
      updateData.startDate = new Date(body.startDate);
    }
    if (body.startTime !== undefined) {
      updateData.startTime = body.startTime ? new Date(body.startTime) : null;
    }
    if (body.endTime !== undefined) {
      updateData.endTime = body.endTime ? new Date(body.endTime) : null;
    }
    if (body.status !== undefined) {
      updateData.status = body.status;

      // Si la session est complétée, créer les certificats pour chaque participant
      if (body.status === "COMPLETED") {
        const formationType = await prisma.formationType.findUnique({
          where: { id: existingSession.formationTypeId },
        });

        for (const attendee of existingSession.attendees) {
          // Marquer le participant comme présent
          await prisma.trainingSessionAttendee.update({
            where: { id: attendee.id },
            data: { status: "ATTENDED" },
          });

          // Créer ou mettre à jour le certificat
          const expiryDate = new Date(existingSession.startDate);
          if (formationType?.defaultValidityMonths) {
            expiryDate.setMonth(
              expiryDate.getMonth() + formationType.defaultValidityMonths,
            );
          } else {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Par défaut 1 an
          }

          // Trouver le certificat existant
          const existingCertificate = await prisma.certificate.findFirst({
            where: {
              employeeId: attendee.employeeId,
              formationTypeId: existingSession.formationTypeId,
            },
          });

          if (existingCertificate) {
            await prisma.certificate.update({
              where: { id: existingCertificate.id },
              data: {
                obtainedDate: existingSession.startDate,
                expiryDate,
              },
            });
          } else {
            await prisma.certificate.create({
              data: {
                employeeId: attendee.employeeId,
                formationTypeId: existingSession.formationTypeId,
                obtainedDate: existingSession.startDate,
                expiryDate,
              },
            });
          }

          // Mettre à jour le TrainingNeed si existant
          await prisma.trainingNeed.updateMany({
            where: {
              employeeId: attendee.employeeId,
              formationTypeId: existingSession.formationTypeId,
              status: { in: ["PENDING", "PLANNED"] },
            },
            data: { status: "COMPLETED" },
          });
        }
      }

      // Si annulée, remettre les besoins en "PENDING"
      if (body.status === "CANCELLED") {
        for (const attendee of existingSession.attendees) {
          await prisma.trainingNeed.updateMany({
            where: {
              employeeId: attendee.employeeId,
              formationTypeId: existingSession.formationTypeId,
              status: "PLANNED",
            },
            data: { status: "PENDING" },
          });
        }
      }
    }
    if (body.location !== undefined) {
      updateData.location = body.location;
    }
    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }
    if (body.trainingCost !== undefined) {
      updateData.trainingCost = body.trainingCost;
      // Recalculer le coût total
      updateData.totalCost =
        body.trainingCost + (existingSession.totalAbsenceCost || 0);
    }
    if (body.convocationsSentAt !== undefined) {
      updateData.convocationsSentAt = new Date(body.convocationsSentAt);
    }

    const updatedSession = await prisma.trainingSession.update({
      where: { id },
      data: updateData,
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
              },
            },
          },
        },
      },
    });

    // Audit Trail
    await auditUpdate(
      "TRAINING_SESSION",
      id,
      `Session ${updatedSession.formationType.name}`,
      { status: existingSession.status, location: existingSession.location },
      { status: updatedSession.status, location: updatedSession.location },
      session.user
        ? {
            id: session.user.id,
            name: session.user.name || undefined,
            email: session.user.email || undefined,
          }
        : null,
    );

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("PATCH session error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 },
    );
  }
}

// DELETE: Supprimer une session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    // Vérifier que la session existe + appartenance entreprise
    const existingSession = await prisma.trainingSession.findFirst({
      where: { id, formationType: { companyId: session.user.companyId } },
      include: { attendees: true },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: "Session non trouvée" },
        { status: 404 },
      );
    }

    // Remettre les besoins de formation en "PENDING"
    for (const attendee of existingSession.attendees) {
      await prisma.trainingNeed.updateMany({
        where: {
          employeeId: attendee.employeeId,
          formationTypeId: existingSession.formationTypeId,
          status: "PLANNED",
        },
        data: { status: "PENDING" },
      });
    }

    // Supprimer les participants
    await prisma.trainingSessionAttendee.deleteMany({
      where: { sessionId: id },
    });

    // Supprimer la session
    await prisma.trainingSession.delete({
      where: { id },
    });

    // Audit Trail
    await auditDelete(
      "TRAINING_SESSION",
      id,
      `Session du ${existingSession.startDate.toLocaleDateString("fr-FR")}`,
      {
        formationTypeId: existingSession.formationTypeId,
        startDate: existingSession.startDate.toISOString(),
        status: existingSession.status,
      },
      session.user
        ? {
            id: session.user.id,
            name: session.user.name || undefined,
            email: session.user.email || undefined,
          }
        : null,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE session error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 },
    );
  }
}
