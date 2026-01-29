import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// DELETE - Supprimer un client (company) et toutes ses données
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Vérifier que l'entreprise existe
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
    }

    // Supprimer toutes les données liées dans l'ordre
    // 1. Supprimer les enregistrements dépendants d'Employee
    await prisma.employeeFormation.deleteMany({
      where: { employee: { companyId: id } },
    });

    await prisma.trainingNeed.deleteMany({
      where: { employee: { companyId: id } },
    });

    await prisma.sessionParticipant.deleteMany({
      where: { employee: { companyId: id } },
    });

    // 2. Supprimer les employés
    await prisma.employee.deleteMany({
      where: { companyId: id },
    });

    // 3. Supprimer les sessions et leurs participants
    await prisma.sessionParticipant.deleteMany({
      where: { session: { companyId: id } },
    });

    await prisma.session.deleteMany({
      where: { companyId: id },
    });

    // 4. Supprimer les formations
    await prisma.formation.deleteMany({
      where: { companyId: id },
    });

    // 5. Supprimer les demandes de contact
    await prisma.contactRequest.deleteMany({
      where: { companyId: id },
    });

    // 6. Supprimer les centres de formation
    await prisma.trainingCenter.deleteMany({
      where: { companyId: id },
    });

    // 7. Supprimer les sites
    await prisma.site.deleteMany({
      where: { companyId: id },
    });

    // 8. Supprimer les services
    await prisma.service.deleteMany({
      where: { companyId: id },
    });

    // 9. Supprimer les équipes
    await prisma.team.deleteMany({
      where: { companyId: id },
    });

    // 10. Supprimer les logs d'audit
    await prisma.auditLog.deleteMany({
      where: { companyId: id },
    });

    // 11. Supprimer les utilisateurs
    await prisma.user.deleteMany({
      where: { companyId: id },
    });

    // 12. Finalement, supprimer l'entreprise
    await prisma.company.delete({
      where: { id },
    });

    console.log(`✅ Client supprimé: ${company.name} (ID: ${id})`);

    return NextResponse.json({
      success: true,
      message: `Client "${company.name}" supprimé avec succès`,
    });
  } catch (error) {
    console.error("Erreur suppression client:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du client" },
      { status: 500 },
    );
  }
}

// GET - Obtenir les détails d'un client
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Erreur récupération client:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du client" },
      { status: 500 },
    );
  }
}
