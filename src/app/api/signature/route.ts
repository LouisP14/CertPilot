import { auth } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { sendEmployeeSignatureLink } from "@/lib/email";
import prisma from "@/lib/prisma";
import { parseBody, initiateSignatureSchema } from "@/lib/validations";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

function generateSecureToken(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(32).toString("hex")}`;
}

// GET - Récupérer le statut de signature d'un employé
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json({ error: "employeeId requis" }, { status: 400 });
    }

    // SÉCURITÉ : vérifier que l'employé appartient à l'entreprise et est actif
    const employeeCheck = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        companyId: session.user.companyId,
        isActive: true,
      },
    });
    if (!employeeCheck) {
      return NextResponse.json(
        { error: "Employé non trouvé" },
        { status: 404 },
      );
    }

    const signature = await prisma.passportSignature.findUnique({
      where: { employeeId },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            employeeId: true,
          },
        },
      },
    });

    return NextResponse.json(signature);
  } catch (error) {
    console.error("GET signature error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 },
    );
  }
}

// POST - Initier le workflow de signature (envoi à l'employé)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (
      !session ||
      (session.user?.role !== "ADMIN" && session.user?.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = parseBody(initiateSignatureSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { employeeId, siteManagerEmail, siteManagerName } = parsed.data;

    // Vérifier que l'employé existe, a un email, et appartient à l'entreprise
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, companyId: session.user.companyId },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employé non trouvé" },
        { status: 404 },
      );
    }

    if (!employee.email) {
      return NextResponse.json(
        { error: "L'employé doit avoir une adresse email pour signer" },
        { status: 400 },
      );
    }

    // Token valide 7 jours
    const tokenExpiry = new Date();
    tokenExpiry.setDate(tokenExpiry.getDate() + 7);

    // Créer ou mettre à jour le workflow de signature
    const signature = await prisma.passportSignature.upsert({
      where: { employeeId },
      update: {
        status: "PENDING_EMPLOYEE",
        employeeToken: generateSecureToken("emp"),
        employeeTokenExpiry: tokenExpiry,
        managerToken: generateSecureToken("mgr"),
        managerTokenExpiry: null, // Sera défini après signature employé
        siteManagerEmail,
        siteManagerName: siteManagerName || null,
        initiatedBy: session.user?.id || null,
        initiatedAt: new Date(),
        // Reset les signatures précédentes
        employeeSignedAt: null,
        employeeSignatureImg: null,
        employeeSignatureIP: null,
        employeeSignatureName: null,
        managerSignedAt: null,
        managerSignatureImg: null,
        managerSignatureIP: null,
        managerSignatureName: null,
        managerSignatureTitle: null,
        completedAt: null,
        rejectedAt: null,
        rejectionReason: null,
      },
      create: {
        employeeId,
        status: "PENDING_EMPLOYEE",
        employeeToken: generateSecureToken("emp"),
        employeeTokenExpiry: tokenExpiry,
        managerToken: generateSecureToken("mgr"),
        siteManagerEmail,
        siteManagerName: siteManagerName || null,
        initiatedBy: session.user?.id || null,
        initiatedAt: new Date(),
      },
    });

    await sendEmployeeSignatureLink({
      to: employee.email,
      employeeName: employee.firstName,
      token: signature.employeeToken,
      expiresAt: tokenExpiry,
    });

    createAuditLog({
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      companyId: session.user.companyId,
      action: "SIGN",
      entityType: "SIGNATURE",
      entityId: signature.id,
      entityName: `${employee.firstName} ${employee.lastName}`,
      description: `Initiation du processus de signature pour ${employee.firstName} ${employee.lastName} — responsable : ${siteManagerEmail}`,
      metadata: { employeeId, siteManagerEmail, siteManagerName },
    });

    return NextResponse.json({
      success: true,
      message: "Demande de signature envoyée",
      signatureId: signature.id,
    });
  } catch (error) {
    console.error("POST signature error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de la demande" },
      { status: 500 },
    );
  }
}

// DELETE - Annuler le processus de signature
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (
      !session ||
      (session.user?.role !== "ADMIN" && session.user?.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json(
        { error: "employeeId requis" },
        { status: 400 },
      );
    }

    // Vérifier que l'employé appartient à l'entreprise
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, companyId: session.user.companyId },
      select: { id: true },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employé non trouvé" },
        { status: 404 },
      );
    }

    // Supprimer le processus de signature
    await prisma.passportSignature.deleteMany({
      where: { employeeId },
    });

    createAuditLog({
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      companyId: session.user.companyId,
      action: "DELETE",
      entityType: "SIGNATURE",
      entityId: employeeId,
      description: `Annulation du processus de signature pour l'employé ${employeeId} par ${session.user.name || session.user.email}`,
      metadata: { employeeId },
    });

    return NextResponse.json({
      success: true,
      message: "Processus de signature annulé",
    });
  } catch (error) {
    console.error("DELETE signature error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'annulation" },
      { status: 500 },
    );
  }
}
