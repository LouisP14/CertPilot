import { auth } from "@/lib/auth";
import {
  sendContactConfirmation,
  sendNewContactNotification,
} from "@/lib/email";
import prisma from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import {
  contactRequestPatchSchema,
  contactRequestSchema,
  parseBody,
} from "@/lib/validations";
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
    // Rate limiting: 3 contact requests per minute per IP
    const ip = getClientIp(request);
    const rl = rateLimit(`contact:${ip}`, { limit: 3, windowSeconds: 60 });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Trop de tentatives. Veuillez réessayer dans quelques minutes." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = parseBody(contactRequestSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { companyName, contactName, email, phone, employeeCount, plan, billing, message } = parsed.data;

    // Créer la demande
    const contactRequest = await prisma.contactRequest.create({
      data: {
        companyName,
        contactName,
        email: email.toLowerCase(),
        phone: phone || null,
        employeeCount: employeeCount || null,
        plan: plan || null,
        billing: billing || null,
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

// PATCH - Mettre à jour le statut d'une demande (SUPER_ADMIN only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = parseBody(contactRequestPatchSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { id, status, notes } = parsed.data;

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
