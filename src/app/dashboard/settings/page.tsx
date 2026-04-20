import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SettingsAccordion } from "./settings-accordion";

async function getCompanyData() {
  const session = await auth();
  if (!session?.user?.companyId) {
    return { company: null, services: [], totpEnabled: false };
  }
  const [company, serviceData, userData] = await Promise.all([
    prisma.company.findUnique({ where: { id: session.user.companyId } }),
    prisma.referenceData.findMany({
      where: { companyId: session.user.companyId, type: "SERVICE", isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { value: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { totpEnabled: true },
    }),
  ]);
  return {
    company,
    services: serviceData.map((s) => s.value),
    totpEnabled: userData?.totpEnabled ?? false,
  };
}

export default async function SettingsPage() {
  const { company, services, totpEnabled } = await getCompanyData();

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
              notifyEmployee: company.notifyEmployee,
              notifyManager: company.notifyManager,
            }
          : null
      }
      availableServices={services}
      totpEnabled={totpEnabled}
    />
  );
}
