import { auth } from "@/lib/auth";
import { sendEmployeeSignatureLink } from "@/lib/email";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Récupérer le statut de signature d'un employé
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json({ error: "employeeId requis" }, { status: 400 });
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
    if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { employeeId, siteManagerEmail, siteManagerName } = body;

    if (!employeeId) {
      return NextResponse.json({ error: "employeeId requis" }, { status: 400 });
    }

    // Vérifier que l'employé existe et a un email
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
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

    if (!siteManagerEmail) {
      return NextResponse.json(
        { error: "Email du responsable requis" },
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
        employeeToken: `emp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        employeeTokenExpiry: tokenExpiry,
        managerToken: `mgr_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
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
        employeeToken: `emp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        employeeTokenExpiry: tokenExpiry,
        managerToken: `mgr_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
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
