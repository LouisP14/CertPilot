import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SettingsAccordion } from "./settings-accordion";

async function getCompany() {
  const session = await auth();
  if (!session?.user?.companyId) {
    return null;
  }
  return prisma.company.findUnique({
    where: { id: session.user.companyId },
  });
}

export default async function SettingsPage() {
  const company = await getCompany();

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
    />
  );
}
