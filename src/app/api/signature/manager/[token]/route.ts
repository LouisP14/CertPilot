import { auditSign, createAuditLog } from "@/lib/audit";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
    const body = await request.json();
    const { signatureImage, signatureName, signatureTitle, action } = body;

    const signature = await prisma.passportSignature.findUnique({
      where: { managerToken: token },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, email: true },
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
      const { rejectionReason } = body;

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
        },
      });

      // Audit Trail - Rejet
      await createAuditLog({
        action: "SIGN",
        entityType: "EMPLOYEE",
        entityId: signature.employee.id,
        entityName: `Passeport ${signature.employee.firstName} ${signature.employee.lastName}`,
        description: `Rejet du passeport par le responsable. Raison : ${rejectionReason || "Non spécifié"}`,
        metadata: { rejectionReason, managerName: signature.siteManagerName },
      });

      // TODO: Envoyer email de notification de rejet
      console.log(`
      ========================================
      📧 EMAIL DE REJET (SIMULATION)
      ========================================
      À: ${signature.employee.email}
      Objet: Passeport Formation rejeté
      
      Bonjour ${signature.employee.firstName},
      
      Votre passeport formation a été rejeté par le responsable.
      Raison : ${rejectionReason || "Non spécifié"}
      
      Veuillez contacter votre service RH.
      ========================================
      `);

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
      },
    });

    // Audit Trail - Validation
    await auditSign(
      signature.employee.id,
      `Passeport ${signature.employee.firstName} ${signature.employee.lastName}`,
      signatureName,
      "MANAGER",
    );

    // TODO: Envoyer email de confirmation à l'employé
    console.log(`
    ========================================
    📧 EMAIL DE VALIDATION (SIMULATION)
    ========================================
    À: ${signature.employee.email}
    Objet: ✅ Passeport Formation validé !
    
    Bonjour ${signature.employee.firstName},
    
    Votre passeport formation a été signé et validé par le responsable.
    
    Vous pouvez le consulter à tout moment via votre QR code personnel.
    
    Cordialement,
    L'équipe RH
    ========================================
    `);

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
