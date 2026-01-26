import prisma from "@/lib/prisma";
import CalendarPageClient from "./calendar-page-client";

async function getCertificatesCalendar() {
  const certificates = await prisma.certificate.findMany({
    where: {
      isArchived: false,
      expiryDate: { not: null },
    },
    include: {
      employee: true,
      formationType: true,
    },
    orderBy: { expiryDate: "asc" },
  });

  // Group by month
  const grouped: Record<string, (typeof certificates)[0][]> = {};

  certificates.forEach((cert) => {
    if (!cert.expiryDate) return;
    const date = new Date(cert.expiryDate);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(cert);
  });

  // Get unique services
  const services = [
    ...new Set(
      certificates
        .map((c) => c.employee.department)
        .filter((d): d is string => d !== null),
    ),
  ].sort();

  return { grouped, services };
}

export default async function CalendarPage() {
  const { grouped, services } = await getCertificatesCalendar();

  return (
    <CalendarPageClient groupedCertificates={grouped} services={services} />
  );
}
