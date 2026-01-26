import { auditDelete } from "@/lib/audit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - Récupérer les convocations sauvegardées
export async function GET() {
  try {
    const convocations = await prisma.convocation.findMany({
      include: {
        attendees: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Reformater pour correspondre au format attendu par le frontend
    const formattedConvocations = convocations.map((conv) => ({
      id: conv.id,
      formationId: conv.formationId,
      formationName: conv.formationName,
      startDate: conv.startDate,
      endDate: conv.endDate,
      startTime: conv.startTime,
      endTime: conv.endTime,
      location: conv.location,
      notes: conv.notes,
      status: conv.status as "draft" | "sent" | "completed",
      createdAt: conv.createdAt.toISOString().split("T")[0],
      employees: conv.attendees.map((att) => ({
        id: att.employeeId,
        name: att.employeeName,
        email: att.employeeEmail,
      })),
    }));

    return NextResponse.json(formattedConvocations);
  } catch (error) {
    console.error("GET convocations error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des convocations" },
      { status: 500 },
    );
  }
}

// POST - Créer une nouvelle convocation (brouillon uniquement - pas d'envoi d'email)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      formationId,
      formationName,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      notes,
      employees,
      status = "draft",
    } = body;

    // Créer la convocation avec ses participants
    const convocation = await prisma.convocation.create({
      data: {
        formationId,
        formationName,
        startDate,
        endDate,
        startTime,
        endTime,
        location,
        notes,
        status,
        attendees: {
          create: employees.map(
            (emp: { id: string; name: string; email: string | null }) => ({
              employeeId: emp.id,
              employeeName: emp.name,
              employeeEmail: emp.email,
            }),
          ),
        },
      },
      include: {
        attendees: true,
      },
    });

    return NextResponse.json(convocation, { status: 201 });
  } catch (error) {
    console.error("POST convocation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la convocation" },
      { status: 500 },
    );
  }
}

// DELETE - Supprimer une convocation
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de convocation manquant" },
        { status: 400 },
      );
    }

    // Récupérer la convocation avant suppression pour l'audit
    const convocation = await prisma.convocation.findUnique({
      where: { id },
      include: { attendees: true },
    });

    if (!convocation) {
      return NextResponse.json(
        { error: "Convocation non trouvée" },
        { status: 404 },
      );
    }

    // Supprimer la convocation
    await prisma.convocation.delete({
      where: { id },
    });

    // Audit trail
    const participantNames = convocation.attendees
      .map((a) => a.employeeName)
      .join(", ");
    await auditDelete(
      "CONVOCATION",
      id,
      `${convocation.formationName} - ${participantNames}`,
      {
        formationName: convocation.formationName,
        startDate: convocation.startDate,
        endDate: convocation.endDate,
        participants: convocation.attendees.length,
        status: convocation.status,
      },
      session?.user
        ? {
            id: session.user.id,
            name: session.user.name || undefined,
            email: session.user.email || undefined,
          }
        : null,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE convocation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la convocation" },
      { status: 500 },
    );
  }
}
