import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Récupérer toutes les demandes (admin only)
export async function GET() {
  try {
    const requests = await prisma.contactRequest.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Erreur récupération demandes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des demandes" },
      { status: 500 },
    );
  }
}

// POST - Créer une nouvelle demande de contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyName,
      contactName,
      email,
      phone,
      employeeCount,
      plan,
      message,
    } = body;

    // Validation
    if (!companyName || !contactName || !email) {
      return NextResponse.json(
        { error: "Les champs entreprise, nom et email sont requis" },
        { status: 400 },
      );
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    // Créer la demande
    const contactRequest = await prisma.contactRequest.create({
      data: {
        companyName,
        contactName,
        email: email.toLowerCase(),
        phone: phone || null,
        employeeCount: employeeCount || null,
        plan: plan || null,
        message: message || null,
        status: "NEW",
      },
    });

    return NextResponse.json(contactRequest, { status: 201 });
  } catch (error) {
    console.error("Erreur création demande:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de la demande" },
      { status: 500 },
    );
  }
}

// PATCH - Mettre à jour le statut d'une demande (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    const updated = await prisma.contactRequest.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erreur mise à jour demande:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 },
    );
  }
}
