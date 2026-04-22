import { auditDelete, auditUpdate } from "@/lib/audit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseBody, updateFormationTypeSchema } from "@/lib/validations";
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
    const parsed = parseBody(updateFormationTypeSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const {
      name,
      category,
      service,
      defaultValidityMonths,
      isConcernedPP,
      isCertifiante,
      certificationCode,
      formacodes,
      nsfCodes,
      romeCodes,
    } = parsed.data;

    // Récupérer l'ancienne formation pour l'audit + vérification appartenance
    const oldFormation = await prisma.formationType.findFirst({
      where: { id, companyId: session.user.companyId },
    });
    if (!oldFormation) {
      return NextResponse.json(
        { error: "Formation non trouvée" },
        { status: 404 },
      );
    }

    const formationType = await prisma.formationType.update({
      where: { id },
      data: {
        name,
        category: category || null,
        service: service || null,
        defaultValidityMonths: defaultValidityMonths
          ? parseInt(String(defaultValidityMonths))
          : null,
        isConcernedPP: isConcernedPP ?? oldFormation.isConcernedPP,
        isCertifiante:
          isCertifiante === "OUI"
            ? true
            : isCertifiante === "NON"
              ? false
              : null,
        certificationCode: certificationCode || null,
        formacodes: formacodes || null,
        nsfCodes: nsfCodes || null,
        romeCodes: romeCodes || null,
      },
    });

    // Audit Trail — inclut les champs Passeport Prévention
    if (oldFormation) {
      const newIsCertifiante =
        isCertifiante === "OUI"
          ? true
          : isCertifiante === "NON"
            ? false
            : null;
      await auditUpdate(
        "FORMATION_TYPE",
        formationType.id,
        formationType.name,
        {
          name: oldFormation.name,
          category: oldFormation.category,
          service: oldFormation.service,
          defaultValidityMonths: oldFormation.defaultValidityMonths,
          isConcernedPP: oldFormation.isConcernedPP,
          isCertifiante: oldFormation.isCertifiante,
          certificationCode: oldFormation.certificationCode,
          formacodes: oldFormation.formacodes,
          nsfCodes: oldFormation.nsfCodes,
          romeCodes: oldFormation.romeCodes,
        },
        {
          name,
          category,
          service,
          defaultValidityMonths,
          isConcernedPP: isConcernedPP ?? oldFormation.isConcernedPP,
          isCertifiante: newIsCertifiante,
          certificationCode: certificationCode || null,
          formacodes: formacodes || null,
          nsfCodes: nsfCodes || null,
          romeCodes: romeCodes || null,
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

    return NextResponse.json(formationType);
  } catch (error) {
    console.error("PUT formation-type error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la formation" },
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

    // Récupérer la formation pour l'audit + vérification appartenance
    const formationToDelete = await prisma.formationType.findFirst({
      where: { id, companyId: session.user.companyId },
    });
    if (!formationToDelete) {
      return NextResponse.json(
        { error: "Formation non trouvée" },
        { status: 404 },
      );
    }

    // Vérifier s'il y a des certificats actifs liés à des employés actifs
    const activeCertificateCount = await prisma.certificate.count({
      where: {
        formationTypeId: id,
        isArchived: false,
        employee: { isActive: true },
      },
    });

    if (activeCertificateCount > 0) {
      return NextResponse.json(
        {
          error: `Impossible de supprimer cette formation car elle est utilisée par ${activeCertificateCount} certificat(s) actif(s)`,
        },
        { status: 400 },
      );
    }

    // Supprimer les certificats orphelins (archivés ou d'employés inactifs)
    await prisma.certificate.deleteMany({
      where: {
        formationTypeId: id,
        OR: [{ isArchived: true }, { employee: { isActive: false } }],
      },
    });

    // Soft delete
    await prisma.formationType.update({
      where: { id },
      data: { isActive: false },
    });

    // Audit Trail
    if (formationToDelete) {
      await auditDelete(
        "FORMATION_TYPE",
        id,
        formationToDelete.name,
        {
          name: formationToDelete.name,
          category: formationToDelete.category,
          service: formationToDelete.service,
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE formation-type error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la formation" },
      { status: 500 },
    );
  }
}
