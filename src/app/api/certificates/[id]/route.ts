import { auditDelete, auditUpdate } from "@/lib/audit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { invalidateSignatureIfExists } from "@/lib/signature-utils";
import { parseBody, updateCertificateSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    if (session.user.role === "MANAGER") {
      return NextResponse.json(
        { error: "Accès en lecture seule" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = parseBody(updateCertificateSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const {
      formationTypeId,
      obtainedDate,
      expiryDate,
      organism,
      details,
      trainingStartDate,
      trainingMode,
      trainerQualification,
    } = parsed.data;

    // Récupérer le certificat actuel + vérification appartenance entreprise
    const currentCertificate = await prisma.certificate.findFirst({
      where: { id, employee: { companyId: session.user.companyId } },
      include: { formationType: true, employee: true },
    });
    if (!currentCertificate) {
      return NextResponse.json(
        { error: "Certificat non trouvé" },
        { status: 404 },
      );
    }

    const certificate = await prisma.certificate.update({
      where: { id },
      data: {
        formationTypeId,
        obtainedDate: new Date(obtainedDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        organism: organism || null,
        details: details || null,
        trainingStartDate: trainingStartDate
          ? new Date(trainingStartDate)
          : null,
        trainingMode: trainingMode || null,
        trainerQualification: trainerQualification || null,
      },
      include: {
        formationType: true,
        employee: true,
      },
    });

    // Invalider la signature si elle existe (modification du contenu du passeport)
    await invalidateSignatureIfExists(certificate.employeeId);

    // Audit Trail — inclut les champs Passeport Prévention
    if (currentCertificate) {
      await auditUpdate(
        "CERTIFICATE",
        certificate.id,
        `${certificate.formationType.name} - ${certificate.employee.firstName} ${certificate.employee.lastName}`,
        {
          formationTypeId: currentCertificate.formationTypeId,
          obtainedDate: currentCertificate.obtainedDate?.toISOString(),
          expiryDate: currentCertificate.expiryDate?.toISOString(),
          organism: currentCertificate.organism,
          details: currentCertificate.details,
          trainingStartDate:
            currentCertificate.trainingStartDate?.toISOString() || null,
          trainingMode: currentCertificate.trainingMode,
          trainerQualification: currentCertificate.trainerQualification,
        },
        {
          formationTypeId,
          obtainedDate,
          expiryDate,
          organism,
          details,
          trainingStartDate: trainingStartDate || null,
          trainingMode: trainingMode || null,
          trainerQualification: trainerQualification || null,
        },
        session.user
          ? {
              id: session.user.id,
              name: session.user.name || undefined,
              email: session.user.email || undefined,
            }
          : null,
      );
    }

    return NextResponse.json(certificate);
  } catch (error) {
    console.error("PUT certificate error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du certificat" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    if (session.user.role === "MANAGER") {
      return NextResponse.json(
        { error: "Accès en lecture seule" },
        { status: 403 },
      );
    }

    const { id } = await params;

    // Récupérer le certificat + vérification appartenance entreprise
    const certificate = await prisma.certificate.findFirst({
      where: { id, employee: { companyId: session.user.companyId } },
      include: { formationType: true, employee: true },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificat non trouvé" },
        { status: 404 },
      );
    }

    // Archive instead of delete to keep history
    await prisma.certificate.update({
      where: { id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
    });

    // Invalider la signature si elle existe (modification du contenu du passeport)
    await invalidateSignatureIfExists(certificate.employeeId);

    // Audit Trail
    await auditDelete(
      "CERTIFICATE",
      id,
      `${certificate.formationType.name} - ${certificate.employee.firstName} ${certificate.employee.lastName}`,
      {
        formationType: certificate.formationType.name,
        employeeName: `${certificate.employee.firstName} ${certificate.employee.lastName}`,
        obtainedDate: certificate.obtainedDate?.toISOString(),
        expiryDate: certificate.expiryDate?.toISOString(),
      },
      session.user
        ? {
            id: session.user.id,
            name: session.user.name || undefined,
            email: session.user.email || undefined,
          }
        : null,
    );

    return NextResponse.json({ message: "Certificat archivé" });
  } catch (error) {
    console.error("DELETE certificate error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du certificat" },
      { status: 500 },
    );
  }
}
