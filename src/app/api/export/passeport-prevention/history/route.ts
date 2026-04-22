import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/export/passeport-prevention/history
// Retourne l'historique des déclarations Passeport Prévention groupées par
// declarationRef : date, nombre de certificats, liste des employés concernés.

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const companyId = session.user.companyId;

    // Récupère tous les certs déclarés, groupés en mémoire par declarationRef
    const certs = await prisma.certificate.findMany({
      where: {
        ppDeclaredAt: { not: null },
        ppDeclarationRef: { not: null },
        employee: { companyId },
      },
      select: {
        id: true,
        ppDeclaredAt: true,
        ppDeclarationRef: true,
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeId: true,
          },
        },
        formationType: { select: { name: true } },
      },
      orderBy: { ppDeclaredAt: "desc" },
    });

    // Group by declarationRef
    const grouped = new Map<
      string,
      {
        declarationRef: string;
        declaredAt: Date;
        count: number;
        certificates: Array<{
          id: string;
          employeeName: string;
          employeeMatricule: string;
          formationName: string;
        }>;
      }
    >();

    for (const c of certs) {
      const ref = c.ppDeclarationRef!;
      if (!grouped.has(ref)) {
        grouped.set(ref, {
          declarationRef: ref,
          declaredAt: c.ppDeclaredAt!,
          count: 0,
          certificates: [],
        });
      }
      const batch = grouped.get(ref)!;
      batch.count++;
      batch.certificates.push({
        id: c.id,
        employeeName: `${c.employee.lastName} ${c.employee.firstName}`,
        employeeMatricule: c.employee.employeeId,
        formationName: c.formationType.name,
      });
    }

    const batches = Array.from(grouped.values()).sort(
      (a, b) => b.declaredAt.getTime() - a.declaredAt.getTime(),
    );

    return NextResponse.json({ batches });
  } catch (error) {
    console.error("History Passeport Prévention error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'historique" },
      { status: 500 },
    );
  }
}