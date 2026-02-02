import { auditSign } from "@/lib/audit";
import { sendManagerSignatureLink } from "@/lib/email";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Vérifier le token et récupérer les infos pour la signature employé
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    const signature = await prisma.passportSignature.findUnique({
      where: { employeeToken: token },
      include: {
        employee: {
          include: {
            certificates: {
              where: { isArchived: false },
              include: { formationType: true },
              orderBy: { expiryDate: "asc" },
            },
          },
        },
      },
    });

    if (!signature) {
      return NextResponse.json(
        { error: "Lien de signature invalide" },
        { status: 404 },
      );
    }

    // Vérifier expiration du token
    if (
      signature.employeeTokenExpiry &&
      new Date() > signature.employeeTokenExpiry
    ) {
      return NextResponse.json(
        { error: "Ce lien de signature a expiré. Contactez votre service RH." },
        { status: 410 },
      );
    }

    // Vérifier que c'est bien le statut attendu
    if (signature.status !== "PENDING_EMPLOYEE") {
      if (
        signature.status === "PENDING_MANAGER" ||
        signature.status === "COMPLETED"
      ) {
        return NextResponse.json(
          { error: "Vous avez déjà signé ce passeport.", alreadySigned: true },
          { status: 400 },
        );
      }
      return NextResponse.json(
        { error: "Ce passeport n'est pas en attente de votre signature." },
        { status: 400 },
      );
    }

    // Retourner les données nécessaires pour la page de signature
    return NextResponse.json({
      employee: {
        id: signature.employee.id,
        firstName: signature.employee.firstName,
        lastName: signature.employee.lastName,
        employeeId: signature.employee.employeeId,
        position: signature.employee.position,
        department: signature.employee.department,
        email: signature.employee.email,
        photo: signature.employee.photo,
      },
      certificates: signature.employee.certificates.map((cert) => ({
        id: cert.id,
        name: cert.formationType.name,
        category: cert.formationType.category,
        obtainedDate: cert.obtainedDate,
        expiryDate: cert.expiryDate,
        attachmentUrl: cert.attachmentUrl,
      })),
      status: signature.status,
      initiatedAt: signature.initiatedAt,
    });
  } catch (error) {
    console.error("GET employee signature error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification" },
      { status: 500 },
    );
  }
}

// POST - Employé signe son passeport
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { signatureImage, signatureName } = body;

    if (!signatureImage || !signatureName) {
      return NextResponse.json(
        { error: "Signature et nom requis" },
        { status: 400 },
      );
    }

    const signature = await prisma.passportSignature.findUnique({
      where: { employeeToken: token },
      include: {
        employee: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!signature) {
      return NextResponse.json(
        { error: "Lien de signature invalide" },
        { status: 404 },
      );
    }

    if (
      signature.employeeTokenExpiry &&
      new Date() > signature.employeeTokenExpiry
    ) {
      return NextResponse.json(
        { error: "Ce lien de signature a expiré" },
        { status: 410 },
      );
    }

    if (signature.status !== "PENDING_EMPLOYEE") {
      return NextResponse.json(
        { error: "Ce passeport a déjà été signé" },
        { status: 400 },
      );
    }

    // Récupérer l'IP du client
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(",")[0]
      : request.headers.get("x-real-ip") || "unknown";

    // Token du manager valide 7 jours après signature employé
    const managerTokenExpiry = new Date();
    managerTokenExpiry.setDate(managerTokenExpiry.getDate() + 7);

    // Enregistrer la signature de l'employé
    const updated = await prisma.passportSignature.update({
      where: { id: signature.id },
      data: {
        status: "PENDING_MANAGER",
        employeeSignedAt: new Date(),
        employeeSignatureImg: signatureImage,
        employeeSignatureIP: ip,
        employeeSignatureName: signatureName,
        managerTokenExpiry: managerTokenExpiry,
      },
    });

    // Audit Trail
    await auditSign(
      signature.employeeId,
      `Passeport ${signature.employee.firstName} ${signature.employee.lastName}`,
      signatureName,
      "EMPLOYEE",
    );

    if (signature.siteManagerEmail) {
      await sendManagerSignatureLink({
        to: signature.siteManagerEmail,
        managerName: signature.siteManagerName,
        employeeName: `${signature.employee.firstName} ${signature.employee.lastName}`,
        token: updated.managerToken,
        expiresAt: managerTokenExpiry,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Passeport signé avec succès. Le responsable va être notifié.",
    });
  } catch (error) {
    console.error("POST employee signature error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la signature" },
      { status: 500 },
    );
  }
}
