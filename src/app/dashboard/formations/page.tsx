import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCompanyFilter } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import { AddFormationTypeDialog } from "./add-formation-dialog";
import { FormationsTable } from "./formations-table";

export const metadata: Metadata = { title: "Formations" };

async function getFormationTypes() {
  const companyFilter = await getCompanyFilter();
  return prisma.formationType.findMany({
    where: { isActive: true, ...companyFilter },
    include: {
      _count: {
        select: {
          certificates: {
            where: {
              isArchived: false,
              employee: { isActive: true },
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export default async function FormationsPage() {
  const formationTypes = await getFormationTypes();

  // Transformer les données pour le composant client
  const formations = formationTypes.map((ft) => ({
    id: ft.id,
    name: ft.name,
    category: ft.category,
    service: ft.service,
    defaultValidityMonths: ft.defaultValidityMonths,
    certificateCount: ft._count.certificates,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Catalogue des Formations
          </h1>
          <p className="text-gray-500">
            Gérer les types de formations et habilitations
          </p>
        </div>
        <AddFormationTypeDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Types de formations ({formationTypes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {formationTypes.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <p>Aucun type de formation configuré.</p>
            </div>
          ) : (
            <FormationsTable formations={formations} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
