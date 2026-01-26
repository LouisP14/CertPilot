import prisma from "@/lib/prisma";
import { SettingsAccordion } from "./settings-accordion";

async function getCompany() {
  return prisma.company.findFirst();
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
            }
          : null
      }
    />
  );
}
