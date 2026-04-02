import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SettingsAccordion } from "./settings-accordion";

async function getCompanyData() {
  const session = await auth();
  if (!session?.user?.companyId) {
    return { company: null, services: [] };
  }
  const [company, serviceData] = await Promise.all([
    prisma.company.findUnique({ where: { id: session.user.companyId } }),
    prisma.referenceData.findMany({
      where: { companyId: session.user.companyId, type: "SERVICE", isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { value: true },
    }),
  ]);
  return { company, services: serviceData.map((s) => s.value) };
}

export default async function SettingsPage() {
  const { company, services } = await getCompanyData();

  return (
    <SettingsAccordion
      company={
        company
          ? {
              id: company.id,
              name: company.name,
              adminEmail: company.adminEmail,
              alertThresholds: company.alertThresholds,
              priorityThresholds: company.priorityThresholds,
            }
          : null
      }
      availableServices={services}
    />
  );
}
