import { auth } from "@/lib/auth";
import {
  sendContactConfirmation,
  sendNewContactNotification,
} from "@/lib/email";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Récupérer toutes les demandes (SUPER_ADMIN only)
export async function GET() {
  try {
    // Vérifier que l'utilisateur est SUPER_ADMIN
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 },
      );
    }

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

    // Envoyer email de confirmation au prospect
    try {
      if (plan) {
        await sendContactConfirmation({
          to: email.toLowerCase(),
          contactName,
          companyName,
          plan,
        });
      }
    } catch (emailError) {
      console.error("Erreur envoi email confirmation:", emailError);
      // Ne pas bloquer la création de la demande si l'email échoue
    }

    // Notifier l'admin par email
    try {
      await sendNewContactNotification({
        contactName,
        companyName,
        email: email.toLowerCase(),
        phone,
        employeeCount,
        plan,
        message,
      });
    } catch (emailError) {
      console.error("Erreur envoi notification admin:", emailError);
    }

    return NextResponse.json(contactRequest, { status: 201 });
  } catch (error) {
    console.error("Erreur création demande:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de la demande" },
      { status: 500 },
    );
  }
}

// DELETE - Supprimer une demande (SUPER_ADMIN only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    await prisma.contactRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression demande:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
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
