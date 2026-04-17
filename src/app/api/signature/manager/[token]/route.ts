import { auditSign, createAuditLog } from "@/lib/audit";
import { sendPassportRejectedEmail, sendPassportValidatedEmail } from "@/lib/email";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const managerSignatureSchema = z.object({
  action: z.enum(["REJECT", "APPROVE"]).default("APPROVE"),
  signatureImage: z.string().min(1).optional(),
  signatureName: z.string().min(1).max(200).optional(),
  signatureTitle: z.string().max(200).optional(),
  rejectionReason: z.string().max(1000).optional(),
});

// GET - Vérifier le token et récupérer les infos pour la signature responsable
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    const signature = await prisma.passportSignature.findUnique({
      where: { managerToken: token },
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
      signature.managerTokenExpiry &&
      new Date() > signature.managerTokenExpiry
    ) {
      return NextResponse.json(
        { error: "Ce lien de signature a expiré. Contactez le service RH." },
        { status: 410 },
      );
    }

    // Vérifier que c'est bien le statut attendu
    if (signature.status !== "PENDING_MANAGER") {
      if (signature.status === "COMPLETED") {
        return NextResponse.json(
          { error: "Ce passeport a déjà été validé.", alreadySigned: true },
          { status: 400 },
        );
      }
      if (signature.status === "PENDING_EMPLOYEE") {
        return NextResponse.json(
          { error: "L'employé n'a pas encore signé ce passeport." },
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
      employeeSignature: {
        signedAt: signature.employeeSignedAt,
        name: signature.employeeSignatureName,
      },
      siteManagerName: signature.siteManagerName,
      status: signature.status,
    });
  } catch (error) {
    console.error("GET manager signature error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification" },
      { status: 500 },
    );
  }
}

// POST - Responsable signe et valide le passeport
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    const rawBody = await request.json();
    const parsed = managerSignatureSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    const { signatureImage, signatureName, signatureTitle, action, rejectionReason } = parsed.data;

    const signature = await prisma.passportSignature.findUnique({
      where: { managerToken: token },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            companyId: true,
            qrToken: true,
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

    if (
      signature.managerTokenExpiry &&
      new Date() > signature.managerTokenExpiry
    ) {
      return NextResponse.json(
        { error: "Ce lien de signature a expiré" },
        { status: 410 },
      );
    }

    if (signature.status !== "PENDING_MANAGER") {
      return NextResponse.json(
        { error: "Ce passeport n'est pas en attente de votre signature" },
        { status: 400 },
      );
    }

    // Récupérer l'IP du client
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(",")[0]
      : request.headers.get("x-real-ip") || "unknown";

    // Action: REJECT ou APPROVE
    if (action === "REJECT") {
      await prisma.passportSignature.update({
        where: { id: signature.id },
        data: {
          status: "REJECTED",
          rejectedAt: new Date(),
          rejectionReason: rejectionReason || "Non spécifié",
        },
      });

      // Créer une notification de rejet
      await prisma.notification.create({
        data: {
          type: "SIGNATURE_REJECTED",
          title: "Passeport rejeté",
          message: `Le passeport de ${signature.employee.firstName} ${signature.employee.lastName} a été rejeté. Raison : ${rejectionReason || "Non spécifié"}`,
          link: `/dashboard/employees/${signature.employee.id}`,
          employeeId: signature.employee.id,
          companyId: signature.employee.companyId,
        },
      });

      // Audit Trail - Rejet
      await createAuditLog({
        companyId: signature.employee.companyId,
        action: "SIGN",
        entityType: "EMPLOYEE",
        entityId: signature.employee.id,
        entityName: `Passeport ${signature.employee.firstName} ${signature.employee.lastName}`,
        description: `Rejet du passeport par le responsable. Raison : ${rejectionReason || "Non spécifié"}`,
        metadata: { rejectionReason, managerName: signature.siteManagerName },
      });

      if (signature.employee.email) {
        await sendPassportRejectedEmail({
          to: signature.employee.email,
          employeeName: signature.employee.firstName,
          rejectionReason: rejectionReason || "Non spécifié",
          managerName: signature.siteManagerName || "votre responsable",
        }).catch((err) =>
          console.error("[signature] Erreur envoi email rejet:", err),
        );
      }

      return NextResponse.json({
        success: true,
        message: "Passeport rejeté",
      });
    }

    // Action: APPROVE (par défaut)
    if (!signatureImage || !signatureName) {
      return NextResponse.json(
        { error: "Signature et nom requis pour valider" },
        { status: 400 },
      );
    }

    await prisma.passportSignature.update({
      where: { id: signature.id },
      data: {
        status: "COMPLETED",
        managerSignedAt: new Date(),
        managerSignatureImg: signatureImage,
        managerSignatureIP: ip,
        managerSignatureName: signatureName,
        managerSignatureTitle: signatureTitle || null,
        completedAt: new Date(),
      },
    });

    // Créer une notification de validation
    await prisma.notification.create({
      data: {
        type: "SIGNATURE_COMPLETED",
        title: "Passeport validé",
        message: `Le passeport de ${signature.employee.firstName} ${signature.employee.lastName} a été validé par ${signatureName}.`,
        link: `/dashboard/employees/${signature.employee.id}`,
        employeeId: signature.employee.id,
        companyId: signature.employee.companyId,
      },
    });

    // Audit Trail - Validation
    await auditSign(
      signature.employee.id,
      `Passeport ${signature.employee.firstName} ${signature.employee.lastName}`,
      signatureName,
      "MANAGER",
      signature.employee.companyId,
    );

    if (signature.employee.email) {
      await sendPassportValidatedEmail({
        to: signature.employee.email,
        employeeName: signature.employee.firstName,
        managerName: signatureName,
        qrToken: signature.employee.qrToken ?? undefined,
      }).catch((err) =>
        console.error("[signature] Erreur envoi email validation:", err),
      );
    }

    return NextResponse.json({
      success: true,
      message: "Passeport validé avec succès",
    });
  } catch (error) {
    console.error("POST manager signature error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la signature" },
      { status: 500 },
    );
  }
}
