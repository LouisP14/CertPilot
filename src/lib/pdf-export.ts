"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Palette de couleurs professionnelle CertPilot
const COLORS = {
  // Couleurs principales de la marque
  primary: [23, 59, 86] as [number, number, number], // #173B56 - Bleu foncé signature
  primaryDark: [15, 42, 61] as [number, number, number], // #0f2a3d - Bleu très foncé
  primaryLight: [30, 74, 107] as [number, number, number], // #1e4a6b - Bleu intermédiaire

  // Couleurs d'accent
  accent: [16, 185, 129] as [number, number, number], // emerald-500
  accentDark: [5, 150, 105] as [number, number, number], // emerald-600

  // Couleurs de statut
  success: [16, 185, 129] as [number, number, number], // emerald-500
  warning: [245, 158, 11] as [number, number, number], // amber-500
  danger: [239, 68, 68] as [number, number, number], // red-500

  // Neutres
  secondary: [100, 116, 139] as [number, number, number], // slate-500
  light: [248, 250, 252] as [number, number, number], // slate-50
  lighter: [241, 245, 249] as [number, number, number], // slate-100
  border: [203, 213, 225] as [number, number, number], // slate-300
  text: [15, 23, 42] as [number, number, number], // slate-900
  textMuted: [71, 85, 105] as [number, number, number], // slate-600
  white: [255, 255, 255] as [number, number, number],
};

// Fonction utilitaire pour dessiner l'en-tête moderne et professionnel
function drawModernHeader(
  doc: jsPDF,
  title: string,
  subtitle?: string,
  companyName?: string,
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const headerHeight = 42;

  // Fond principal du header avec dégradé simulé
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, headerHeight, "F");

  // Bande décorative accent en bas du header
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, headerHeight - 4, pageWidth, 4, "F");

  // Ligne de séparation subtile
  doc.setFillColor(...COLORS.primaryLight);
  doc.rect(0, headerHeight - 5, pageWidth, 1, "F");

  // Nom CertPilot
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.accent);
  doc.text("CertPilot", 15, 12);

  // Titre principal
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text(title, 15, 26);

  // Sous-titre si présent
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 200, 220); // Bleu clair
    doc.text(subtitle, 15, 34);
  }

  // Nom de l'entreprise à droite (dans un badge)
  if (companyName) {
    const textWidth = doc.getTextWidth(companyName);
    const badgeWidth = textWidth + 12;
    const badgeX = pageWidth - 15 - badgeWidth;

    // Badge fond
    doc.setFillColor(...COLORS.primaryLight);
    doc.roundedRect(badgeX, 7, badgeWidth, 10, 2, 2, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.white);
    doc.text(companyName, pageWidth - 15 - badgeWidth / 2, 14, {
      align: "center",
    });
  }

  // Date de génération dans un badge
  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 200, 220);
  doc.text(`Généré le ${dateStr}`, pageWidth - 15, 32, { align: "right" });

  // Reset text color
  doc.setTextColor(...COLORS.text);

  return headerHeight + 12;
}

// Fonction utilitaire pour dessiner le pied de page professionnel
function drawFooter(doc: jsPDF, currentPage: number, totalPages: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Bande de pied de page
  doc.setFillColor(...COLORS.lighter);
  doc.rect(0, pageHeight - 18, pageWidth, 18, "F");

  // Ligne de séparation accent
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, pageHeight - 18, pageWidth, 1, "F");

  // Nom CertPilot à gauche
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("CertPilot", 15, pageHeight - 8);

  // Numéro de page au centre avec style
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);
  doc.text(
    `Page ${currentPage} / ${totalPages}`,
    pageWidth / 2,
    pageHeight - 8,
    { align: "center" },
  );

  // Date et heure à droite
  const now = new Date();
  const dateTimeStr =
    now.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) +
    " à " +
    now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  doc.setFontSize(8);
  doc.text(dateTimeStr, pageWidth - 15, pageHeight - 8, { align: "right" });
}

// Style de tableau moderne et professionnel
function getModernTableStyles() {
  return {
    styles: {
      fontSize: 9,
      cellPadding: 5,
      lineColor: COLORS.border,
      lineWidth: 0.1,
      font: "helvetica",
    },
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: "bold" as const,
      fontSize: 9,
      cellPadding: 6,
      halign: "left" as const,
    },
    alternateRowStyles: {
      fillColor: COLORS.lighter,
    },
    bodyStyles: {
      textColor: COLORS.text,
    },
    footStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: "bold" as const,
    },
    tableLineColor: COLORS.border,
    tableLineWidth: 0,
  };
}

// Dessiner un badge de statut coloré
function drawStatusBadge(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  status: "success" | "warning" | "danger" | "neutral",
) {
  const colors = {
    success: {
      bg: [209, 250, 229] as [number, number, number],
      text: COLORS.success,
    },
    warning: {
      bg: [254, 243, 199] as [number, number, number],
      text: COLORS.warning,
    },
    danger: {
      bg: [254, 226, 226] as [number, number, number],
      text: COLORS.danger,
    },
    neutral: { bg: COLORS.lighter, text: COLORS.textMuted },
  };

  const color = colors[status];
  const textWidth = doc.getTextWidth(text);
  const badgeWidth = textWidth + 6;
  const badgeHeight = 6;

  doc.setFillColor(...color.bg);
  doc.roundedRect(
    x - badgeWidth / 2,
    y - badgeHeight / 2 - 1,
    badgeWidth,
    badgeHeight,
    1.5,
    1.5,
    "F",
  );

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...color.text);
  doc.text(text, x, y, { align: "center" });
}

// Fonction pour formater les nombres sans caractères spéciaux problématiques
function formatNumber(num: number): string {
  // Utiliser un espace insécable standard pour les milliers
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

interface ExportOptions {
  title: string;
  subtitle?: string;
  filename: string;
  headers: string[];
  data: (string | number)[][];
  orientation?: "portrait" | "landscape";
  companyName?: string;
}

export function exportToPDF({
  title,
  subtitle,
  filename,
  headers,
  data,
  orientation = "portrait",
  companyName,
}: ExportOptions) {
  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
  });

  const startY = drawModernHeader(doc, title, subtitle, companyName);

  // Tableau avec style moderne
  autoTable(doc, {
    head: [headers],
    body: data,
    startY,
    ...getModernTableStyles(),
    margin: { left: 15, right: 15, bottom: 25 },
    didDrawPage: () => {
      // Le footer sera ajouté après
    },
  });

  // Ajouter les footers sur toutes les pages
  const pageCount = (
    doc as unknown as { internal: { getNumberOfPages: () => number } }
  ).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    // Redessiner le header sur les pages suivantes
    if (i > 1) {
      drawModernHeader(doc, title, subtitle, companyName);
    }
    drawFooter(doc, i, pageCount);
  }

  doc.save(`${filename}.pdf`);
}

// Export pour le tableau des alertes
export function exportAlertsToPDF(
  certificates: {
    employee: { firstName: string; lastName: string; position: string };
    formationType: { name: string; category: string | null };
    expiryDate: Date | null;
  }[],
  filters?: { search?: string; status?: string },
) {
  const now = new Date();
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Construire le sous-titre avec les filtres
  const filterParts: string[] = [];
  if (filters?.search) {
    filterParts.push(`Recherche: "${filters.search}"`);
  }
  if (filters?.status && filters.status !== "all") {
    filterParts.push(
      `Statut: ${filters.status === "expired" ? "Expirées" : "Expire bientôt"}`,
    );
  }
  const subtitle =
    filterParts.length > 0
      ? `${certificates.length} alerte(s) • ${filterParts.join(" | ")}`
      : `${certificates.length} alerte(s)`;

  const startY = drawModernHeader(
    doc,
    "Alertes - Formations à renouveler",
    subtitle,
  );

  const headers = [
    "Employé",
    "Fonction",
    "Formation",
    "Catégorie",
    "Fin de validité",
    "Jours restants",
    "Statut",
  ];

  const data = certificates.map((cert) => {
    const expiryDate = cert.expiryDate ? new Date(cert.expiryDate) : null;
    const daysLeft = expiryDate
      ? Math.ceil(
          (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        )
      : null;

    const status = !expiryDate
      ? "Valide"
      : daysLeft !== null && daysLeft < 0
        ? "Expirée"
        : "Expire bientôt";

    return [
      `${cert.employee.lastName.toUpperCase()} ${cert.employee.firstName}`,
      cert.employee.position || "-",
      cert.formationType.name,
      cert.formationType.category || "-",
      expiryDate ? expiryDate.toLocaleDateString("fr-FR") : "-",
      daysLeft !== null
        ? daysLeft < 0
          ? `${Math.abs(daysLeft)}j retard`
          : `${daysLeft}j`
        : "-",
      status,
    ];
  });

  autoTable(doc, {
    head: [headers],
    body: data,
    startY,
    ...getModernTableStyles(),
    margin: { left: 15, right: 15, bottom: 25 },
    columnStyles: {
      6: { cellWidth: 30 }, // Statut
    },
    didParseCell: (cellData) => {
      // Colorer le statut
      if (cellData.section === "body" && cellData.column.index === 6) {
        const status = cellData.cell.raw as string;
        if (status === "Expirée") {
          cellData.cell.styles.textColor = COLORS.danger;
          cellData.cell.styles.fontStyle = "bold";
        } else if (status === "Expire bientôt") {
          cellData.cell.styles.textColor = COLORS.warning;
          cellData.cell.styles.fontStyle = "bold";
        }
      }
      // Colorer les jours restants
      if (cellData.section === "body" && cellData.column.index === 5) {
        const value = cellData.cell.raw as string;
        if (value.includes("retard")) {
          cellData.cell.styles.textColor = COLORS.danger;
          cellData.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  // Ajouter les footers
  const pageCount = (
    doc as unknown as { internal: { getNumberOfPages: () => number } }
  ).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawFooter(doc, i, pageCount);
  }

  doc.save(`alertes-formations-${now.toISOString().split("T")[0]}.pdf`);
}

// Export pour le tableau de couverture par formation
export function exportFormationCoverageToPDF(
  formations: {
    name: string;
    category: string | null;
    service: string | null;
    trainedCount: number;
    totalEmployees: number;
    percentage: number;
  }[],
  filters?: { search?: string; service?: string | null },
) {
  const now = new Date();
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Construire le sous-titre avec les filtres
  const filterParts: string[] = [];
  if (filters?.search) {
    filterParts.push(`Recherche: "${filters.search}"`);
  }
  if (filters?.service) {
    filterParts.push(`Service: ${filters.service}`);
  }
  const subtitle =
    filterParts.length > 0
      ? `${formations.length} formation(s) • ${filterParts.join(" | ")}`
      : `${formations.length} formation(s)`;

  const startY = drawModernHeader(doc, "Couverture par formation", subtitle);

  const headers = [
    "Formation",
    "Catégorie",
    "Service(s)",
    "Formés",
    "Total",
    "Couverture",
  ];

  const data = formations.map((f) => [
    f.name,
    f.category || "-",
    f.service || "Tous",
    f.trainedCount.toString(),
    f.totalEmployees.toString(),
    `${f.percentage}%`,
  ]);

  autoTable(doc, {
    head: [headers],
    body: data,
    startY,
    ...getModernTableStyles(),
    margin: { left: 15, right: 15, bottom: 25 },
    columnStyles: {
      5: { halign: "center", fontStyle: "bold" },
    },
    didParseCell: (cellData) => {
      // Colorer le pourcentage selon le niveau
      if (cellData.section === "body" && cellData.column.index === 5) {
        const value = parseInt(cellData.cell.raw as string);
        if (value >= 80) {
          cellData.cell.styles.textColor = COLORS.success;
        } else if (value >= 50) {
          cellData.cell.styles.textColor = COLORS.warning;
        } else {
          cellData.cell.styles.textColor = COLORS.danger;
        }
      }
    },
  });

  // Ajouter les footers
  const pageCount = (
    doc as unknown as { internal: { getNumberOfPages: () => number } }
  ).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawFooter(doc, i, pageCount);
  }

  doc.save(`couverture-formations-${now.toISOString().split("T")[0]}.pdf`);
}

// Export pour le tableau de conformité par service
export function exportServiceCoverageToPDF(
  services: {
    name: string;
    totalEmployees: number;
    formations: {
      name: string;
      employeesWithFormation: number;
      totalEmployees: number;
      percentage: number;
    }[];
    globalPercentage: number;
  }[],
) {
  const now = new Date();
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const startY = drawModernHeader(
    doc,
    "Conformité par service",
    `${services.length} service(s) analysé(s)`,
  );

  const headers = [
    "Service",
    "Formation requise",
    "Formés",
    "Total",
    "Couverture",
  ];

  // Aplatir les données
  const data: (string | number)[][] = [];
  services.forEach((service) => {
    service.formations.forEach((formation, idx) => {
      data.push([
        idx === 0 ? service.name : "",
        formation.name,
        formation.employeesWithFormation.toString(),
        formation.totalEmployees.toString(),
        `${formation.percentage}%`,
      ]);
    });
  });

  autoTable(doc, {
    head: [headers],
    body: data,
    startY,
    ...getModernTableStyles(),
    margin: { left: 15, right: 15, bottom: 25 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 40 },
      4: { halign: "center", fontStyle: "bold" },
    },
    didParseCell: (cellData) => {
      // Colorer le pourcentage selon le niveau
      if (cellData.section === "body" && cellData.column.index === 4) {
        const value = parseInt(cellData.cell.raw as string);
        if (value >= 80) {
          cellData.cell.styles.textColor = COLORS.success;
        } else if (value >= 50) {
          cellData.cell.styles.textColor = COLORS.warning;
        } else {
          cellData.cell.styles.textColor = COLORS.danger;
        }
      }
    },
  });

  // Ajouter les footers
  const pageCount = (
    doc as unknown as { internal: { getNumberOfPages: () => number } }
  ).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawFooter(doc, i, pageCount);
  }

  doc.save(`conformite-services-${now.toISOString().split("T")[0]}.pdf`);
}

// Export pour la vue calendaire des échéances
export function exportCalendarToPDF(
  groupedCertificates: Record<
    string,
    {
      id: string;
      expiryDate: Date | null;
      employee: {
        firstName: string;
        lastName: string;
        department: string | null;
      };
      formationType: {
        name: string;
        category: string | null;
      };
    }[]
  >,
  filters?: { search?: string; service?: string },
) {
  const now = new Date();
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const months = Object.keys(groupedCertificates).sort();
  const totalCerts = months.reduce(
    (acc, key) => acc + groupedCertificates[key].length,
    0,
  );

  // Construire le sous-titre avec les filtres
  const filterParts: string[] = [];
  if (filters?.search) {
    filterParts.push(`Recherche: "${filters.search}"`);
  }
  if (filters?.service) {
    filterParts.push(`Service: ${filters.service}`);
  }
  const subtitle =
    filterParts.length > 0
      ? `${totalCerts} échéance(s) • ${filterParts.join(" | ")}`
      : `${totalCerts} échéance(s) à venir`;

  const startY = drawModernHeader(doc, "Calendrier des échéances", subtitle);

  const headers = [
    "Période",
    "Date",
    "Employé",
    "Service",
    "Formation",
    "Catégorie",
    "Délai",
  ];

  // Aplatir les données groupées par mois
  const data: (string | number)[][] = [];

  months.forEach((monthKey) => {
    const certificates = groupedCertificates[monthKey];
    const [year, month] = monthKey.split("-");
    const monthDate = new Date(parseInt(year), parseInt(month) - 1);
    const monthName = monthDate.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });

    certificates.forEach((cert, idx) => {
      const expiryDate = cert.expiryDate ? new Date(cert.expiryDate) : null;
      const daysLeft = expiryDate
        ? Math.ceil(
            (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          )
        : null;

      data.push([
        idx === 0 ? monthName.charAt(0).toUpperCase() + monthName.slice(1) : "",
        expiryDate ? expiryDate.toLocaleDateString("fr-FR") : "-",
        `${cert.employee.lastName.toUpperCase()} ${cert.employee.firstName}`,
        cert.employee.department || "-",
        cert.formationType.name,
        cert.formationType.category || "-",
        daysLeft !== null
          ? daysLeft < 0
            ? `${Math.abs(daysLeft)}j retard`
            : `${daysLeft}j`
          : "-",
      ]);
    });
  });

  autoTable(doc, {
    head: [headers],
    body: data,
    startY,
    ...getModernTableStyles(),
    margin: { left: 15, right: 15, bottom: 25 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 35 },
      6: { halign: "center" },
    },
    didParseCell: (cellData) => {
      // Colorer le délai
      if (cellData.section === "body" && cellData.column.index === 6) {
        const value = cellData.cell.raw as string;
        if (value.includes("retard")) {
          cellData.cell.styles.textColor = COLORS.danger;
          cellData.cell.styles.fontStyle = "bold";
        } else {
          const days = parseInt(value);
          if (days <= 30) {
            cellData.cell.styles.textColor = COLORS.warning;
            cellData.cell.styles.fontStyle = "bold";
          }
        }
      }
    },
  });

  // Ajouter les footers
  const pageCount = (
    doc as unknown as { internal: { getNumberOfPages: () => number } }
  ).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawFooter(doc, i, pageCount);
  }

  doc.save(`calendrier-formations-${now.toISOString().split("T")[0]}.pdf`);
}

// Export rapport complet PDF
export function exportFullReportToPDF(
  employees: {
    firstName: string;
    lastName: string;
    position: string;
    department: string | null;
    site: string | null;
    certificates: {
      formationType: { name: string; category: string | null };
      obtainedDate: Date | null;
      expiryDate: Date | null;
      organism: string | null;
    }[];
  }[],
  stats: {
    totalEmployees: number;
    totalCertificates: number;
    expiringThisMonth: number;
    expired: number;
  },
  companyName?: string,
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Pre-compute
  const allCerts = employees.flatMap((e) => e.certificates);
  const certsWithExpiry = allCerts.filter((c) => c.expiryDate !== null);
  const validCerts = allCerts.filter(
    (c) => !c.expiryDate || new Date(c.expiryDate) >= now,
  );
  const globalRate =
    allCerts.length > 0
      ? Math.round((validCerts.length / allCerts.length) * 100)
      : 100;

  const deptMap = new Map<
    string,
    {
      empSet: Set<string>;
      valid: number;
      expiring: number;
      expired: number;
      total: number;
    }
  >();
  employees.forEach((emp, idx) => {
    const dept = emp.department || "Non renseigne";
    if (!deptMap.has(dept))
      deptMap.set(dept, {
        empSet: new Set(),
        valid: 0,
        expiring: 0,
        expired: 0,
        total: 0,
      });
    const d = deptMap.get(dept)!;
    d.empSet.add(`${idx}`);
    emp.certificates.forEach((cert) => {
      d.total++;
      if (!cert.expiryDate) {
        d.valid++;
        return;
      }
      const days = Math.ceil(
        (new Date(cert.expiryDate).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      if (days < 0) d.expired++;
      else if (days <= 90) d.expiring++;
      else d.valid++;
    });
  });
  const depts = [...deptMap.entries()]
    .map(([name, d]) => ({
      name,
      nbEmployees: d.empSet.size,
      valid: d.valid,
      expiring: d.expiring,
      expired: d.expired,
      total: d.total,
      rate: d.total > 0 ? Math.round((d.valid / d.total) * 100) : 100,
    }))
    .sort((a, b) => a.rate - b.rate);

  type AlertItem = {
    emp: (typeof employees)[0];
    cert: (typeof employees)[0]["certificates"][0];
    days: number;
  };
  const expiredAlerts: AlertItem[] = [];
  const expiring30Alerts: AlertItem[] = [];
  employees.forEach((emp) => {
    emp.certificates.forEach((cert) => {
      if (!cert.expiryDate) return;
      const days = Math.ceil(
        (new Date(cert.expiryDate).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      if (days < 0) expiredAlerts.push({ emp, cert, days });
      else if (days <= 30) expiring30Alerts.push({ emp, cert, days });
    });
  });
  expiredAlerts.sort((a, b) => a.days - b.days);
  expiring30Alerts.sort((a, b) => a.days - b.days);

  // PAGE 1 : Couverture
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 95, "F");
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 92, pageWidth, 5, "F");

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.accent);
  doc.text("CertPilot", 20, 22);

  const badgeText = "Rapport officiel";
  doc.setFontSize(10);
  const badgeWidth = doc.getTextWidth(badgeText) + 12;
  doc.setFillColor(...COLORS.accent);
  doc.roundedRect(pageWidth - 25 - badgeWidth, 15, badgeWidth, 12, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text(badgeText, pageWidth - 25 - badgeWidth / 2, 23, {
    align: "center",
  });

  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("Rapport des Passeports Formation", pageWidth / 2, 55, {
    align: "center",
  });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 200, 220);
  doc.text(
    "Synthese complete des habilitations et formations",
    pageWidth / 2,
    70,
    { align: "center" },
  );

  const infoY = 110;
  if (companyName) {
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text(companyName, pageWidth / 2, infoY, { align: "center" });
  }
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);
  doc.text(`Document genere le ${dateStr}`, pageWidth / 2, infoY + 10, {
    align: "center",
  });

  const cardWidth = 55;
  const cardHeight = 45;
  const cardY = 135;
  const cardGap = 10;
  const totalCardsWidth = cardWidth * 4 + cardGap * 3;
  const startXCard = (pageWidth - totalCardsWidth) / 2;
  const statsData = [
    { label: "Employes", value: stats.totalEmployees, color: COLORS.primary },
    {
      label: "Formations actives",
      value: stats.totalCertificates,
      color: COLORS.success,
    },
    {
      label: "Expirent ce mois",
      value: stats.expiringThisMonth,
      color: COLORS.warning,
    },
    { label: "Expirees", value: stats.expired, color: COLORS.danger },
  ];
  statsData.forEach((stat, idx) => {
    const x = startXCard + idx * (cardWidth + cardGap);
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(x + 1, cardY + 1, cardWidth, cardHeight, 4, 4, "F");
    doc.setFillColor(...COLORS.white);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 4, 4, "F");
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 4, 4, "S");
    doc.setFillColor(...stat.color);
    doc.roundedRect(x, cardY, cardWidth, 6, 4, 4, "F");
    doc.setFillColor(...COLORS.white);
    doc.rect(x, cardY + 3, cardWidth, 5, "F");
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...stat.color);
    doc.text(stat.value.toString(), x + cardWidth / 2, cardY + 24, {
      align: "center",
    });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.textMuted);
    doc.text(stat.label, x + cardWidth / 2, cardY + 36, { align: "center" });
  });

  // PAGE 2 : Tableau de bord
  doc.addPage();
  const dashStartY = drawModernHeader(
    doc,
    "Tableau de bord",
    "Synthese et indicateurs de conformite",
    companyName,
  );

  const rateColor =
    globalRate >= 80
      ? COLORS.success
      : globalRate >= 50
        ? COLORS.warning
        : COLORS.danger;
  let y2 = dashStartY + 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);
  doc.text("Taux de conformite global", pageWidth / 2, y2, {
    align: "center",
  });
  y2 += 10;

  doc.setFontSize(38);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...rateColor);
  doc.text(`${globalRate}%`, pageWidth / 2, y2, { align: "center" });
  y2 += 6;

  const barW = 140;
  const barH = 7;
  const barX = (pageWidth - barW) / 2;
  doc.setFillColor(220, 220, 220);
  doc.roundedRect(barX, y2, barW, barH, 3, 3, "F");
  const fillW = Math.max(4, (globalRate / 100) * barW);
  doc.setFillColor(...rateColor);
  doc.roundedRect(barX, y2, fillW, barH, 3, 3, "F");
  y2 += barH + 5;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textMuted);
  doc.text(
    `${validCerts.length} formation(s) valides sur ${allCerts.length} (dont ${allCerts.length - certsWithExpiry.length} sans expiration)`,
    pageWidth / 2,
    y2,
    { align: "center" },
  );
  y2 += 12;

  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(15, y2, pageWidth - 15, y2);
  y2 += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("Conformite par service", 15, y2);
  y2 += 5;

  if (depts.length > 0) {
    autoTable(doc, {
      head: [
        [
          "Service",
          "Nb employes",
          "Valides",
          "Expirant bientot",
          "Expirees",
          "Taux %",
        ],
      ],
      body: depts.map((d) => [
        d.name,
        d.nbEmployees.toString(),
        d.valid.toString(),
        d.expiring.toString(),
        d.expired.toString(),
        `${d.rate}%`,
      ]),
      startY: y2,
      ...getModernTableStyles(),
      margin: { left: 15, right: 15, bottom: 25 },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 30, halign: "center" },
        2: { cellWidth: 30, halign: "center" },
        3: { cellWidth: 35, halign: "center" },
        4: { cellWidth: 30, halign: "center" },
        5: { cellWidth: 30, halign: "center", fontStyle: "bold" },
      },
      didParseCell: (cellData) => {
        if (cellData.section !== "body") return;
        if (cellData.column.index === 5) {
          const rate = parseInt(cellData.cell.raw as string);
          cellData.cell.styles.fontStyle = "bold";
          if (rate >= 80) cellData.cell.styles.textColor = COLORS.success;
          else if (rate >= 50)
            cellData.cell.styles.textColor = COLORS.warning;
          else cellData.cell.styles.textColor = COLORS.danger;
        }
        if (
          cellData.column.index === 3 &&
          parseInt(cellData.cell.raw as string) > 0
        )
          cellData.cell.styles.textColor = COLORS.warning;
        if (
          cellData.column.index === 4 &&
          parseInt(cellData.cell.raw as string) > 0
        )
          cellData.cell.styles.textColor = COLORS.danger;
      },
    });
  } else {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COLORS.textMuted);
    doc.text("Aucun service renseigne.", 15, y2 + 6);
  }

  // PAGE 3 : Alertes prioritaires
  doc.addPage();
  const alertStartY = drawModernHeader(
    doc,
    "Alertes prioritaires",
    `${expiredAlerts.length} expiree(s) - ${expiring30Alerts.length} expirant dans 30 jours`,
    companyName,
  );

  let y3 = alertStartY + 5;

  // Section expired
  doc.setFillColor(254, 226, 226);
  doc.rect(15, y3, pageWidth - 30, 14, "F");
  doc.setFillColor(...COLORS.danger);
  doc.rect(15, y3, 4, 14, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.danger);
  doc.text(
    `Formations expirees  -  ${expiredAlerts.length} action(s) immediate(s) requise(s)`,
    25,
    y3 + 9,
  );
  y3 += 18;

  if (expiredAlerts.length === 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COLORS.success);
    doc.text("Aucune formation expiree. Excellent !", 20, y3 + 5);
    y3 += 15;
  } else {
    autoTable(doc, {
      head: [
        [
          "Employe",
          "Service",
          "Formation",
          "Date expiration",
          "Jours de retard",
        ],
      ],
      body: expiredAlerts.map(({ emp, cert, days }) => [
        `${emp.lastName.toUpperCase()} ${emp.firstName}`,
        emp.department || "-",
        cert.formationType.name,
        new Date(cert.expiryDate!).toLocaleDateString("fr-FR"),
        `${Math.abs(days)}j`,
      ]),
      startY: y3,
      ...getModernTableStyles(),
      margin: { left: 15, right: 15, bottom: 25 },
      columnStyles: { 4: { halign: "center", fontStyle: "bold" } },
      didParseCell: (cellData) => {
        if (cellData.section === "body" && cellData.column.index === 4) {
          cellData.cell.styles.textColor = COLORS.danger;
          cellData.cell.styles.fontStyle = "bold";
        }
      },
    });
    y3 = (
      doc as unknown as { lastAutoTable: { finalY: number } }
    ).lastAutoTable.finalY;
  }

  y3 += 10;
  if (y3 > pageHeight - 70) {
    doc.addPage();
    drawModernHeader(doc, "Alertes prioritaires (suite)", "", companyName);
    y3 = 59;
  }

  // Section expiring 30
  doc.setFillColor(254, 243, 199);
  doc.rect(15, y3, pageWidth - 30, 14, "F");
  doc.setFillColor(...COLORS.warning);
  doc.rect(15, y3, 4, 14, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.warning);
  doc.text(
    `Expirant dans 30 jours  -  ${expiring30Alerts.length} formation(s) a renouveler`,
    25,
    y3 + 9,
  );
  y3 += 18;

  if (expiring30Alerts.length === 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COLORS.success);
    doc.text(
      "Aucune formation n expire dans les 30 prochains jours.",
      20,
      y3 + 5,
    );
  } else {
    autoTable(doc, {
      head: [
        [
          "Employe",
          "Service",
          "Formation",
          "Date expiration",
          "Jours restants",
        ],
      ],
      body: expiring30Alerts.map(({ emp, cert, days }) => [
        `${emp.lastName.toUpperCase()} ${emp.firstName}`,
        emp.department || "-",
        cert.formationType.name,
        new Date(cert.expiryDate!).toLocaleDateString("fr-FR"),
        `${days}j`,
      ]),
      startY: y3,
      ...getModernTableStyles(),
      margin: { left: 15, right: 15, bottom: 25 },
      columnStyles: { 4: { halign: "center", fontStyle: "bold" } },
      didParseCell: (cellData) => {
        if (cellData.section === "body" && cellData.column.index === 4) {
          cellData.cell.styles.textColor = COLORS.warning;
          cellData.cell.styles.fontStyle = "bold";
        }
      },
    });
  }

  // PAGE 4+ : Detail complet
  doc.addPage();
  const detailStartY = drawModernHeader(
    doc,
    "Detail des formations par employe",
    `${employees.length} employe(s)  -  ${stats.totalCertificates} formation(s)`,
    companyName,
  );

  const headers = [
    "Employe",
    "Fonction",
    "Service",
    "Site",
    "Formation",
    "Categorie",
    "Obtention",
    "Validite",
    "Organisme",
    "J. restants",
    "Statut",
  ];
  const data: (string | number)[][] = [];

  employees.forEach((emp) => {
    if (emp.certificates.length === 0) {
      data.push([
        `${emp.lastName.toUpperCase()} ${emp.firstName}`,
        emp.position || "-",
        emp.department || "-",
        emp.site || "-",
        "Aucune formation",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
      ]);
    } else {
      emp.certificates.forEach((cert, idx) => {
        const expiryDate = cert.expiryDate
          ? new Date(cert.expiryDate)
          : null;
        const daysLeft = expiryDate
          ? Math.ceil(
              (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
            )
          : null;
        let status = "Valide";
        if (expiryDate) {
          if (daysLeft !== null && daysLeft < 0) status = "Expiree";
          else if (daysLeft !== null && daysLeft <= 90) status = "Bientot";
        }
        data.push([
          idx === 0
            ? `${emp.lastName.toUpperCase()} ${emp.firstName}`
            : "",
          idx === 0 ? emp.position || "-" : "",
          idx === 0 ? emp.department || "-" : "",
          idx === 0 ? emp.site || "-" : "",
          cert.formationType.name,
          cert.formationType.category || "-",
          cert.obtainedDate
            ? new Date(cert.obtainedDate).toLocaleDateString("fr-FR")
            : "-",
          expiryDate
            ? expiryDate.toLocaleDateString("fr-FR")
            : "Illimitee",
          (cert as typeof cert & { organism?: string | null }).organism || "-",
          daysLeft !== null ? daysLeft.toString() : "-",
          status,
        ]);
      });
    }
  });

  autoTable(doc, {
    head: [headers],
    body: data,
    startY: detailStartY,
    ...getModernTableStyles(),
    styles: {
      ...getModernTableStyles().styles,
      fontSize: 7,
      cellPadding: 2.5,
    },
    headStyles: {
      ...getModernTableStyles().headStyles,
      fontSize: 7,
      cellPadding: 3,
    },
    margin: { left: 8, right: 8, bottom: 25 },
    tableWidth: "auto",
    columnStyles: {
      0: { cellWidth: 36, fontStyle: "bold" },
      1: { cellWidth: 24 },
      2: { cellWidth: 22 },
      3: { cellWidth: 18 },
      4: { cellWidth: 42 },
      5: { cellWidth: 20 },
      6: { cellWidth: 20 },
      7: { cellWidth: 20 },
      8: { cellWidth: 26 },
      9: { cellWidth: 16, halign: "center" },
      10: { cellWidth: 16, halign: "center" },
    },
    didParseCell: (cellData) => {
      if (cellData.section !== "body") return;
      if (cellData.column.index === 10) {
        const status = cellData.cell.raw as string;
        if (status === "Expiree") {
          cellData.cell.styles.textColor = COLORS.danger;
          cellData.cell.styles.fontStyle = "bold";
        } else if (status === "Bientot") {
          cellData.cell.styles.textColor = COLORS.warning;
          cellData.cell.styles.fontStyle = "bold";
        } else if (status === "Valide") {
          cellData.cell.styles.textColor = COLORS.success;
        }
      }
      if (cellData.column.index === 9) {
        const val = cellData.cell.raw as string;
        if (val === "-") return;
        const days = parseInt(val);
        if (!isNaN(days)) {
          if (days < 0) {
            cellData.cell.styles.textColor = COLORS.danger;
            cellData.cell.styles.fontStyle = "bold";
          } else if (days <= 30) {
            cellData.cell.styles.textColor = COLORS.warning;
            cellData.cell.styles.fontStyle = "bold";
          }
        }
      }
    },
  });

  // FOOTERS sur toutes les pages
  const pageCount = (
    doc as unknown as { internal: { getNumberOfPages: () => number } }
  ).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawFooter(doc, i, pageCount);
  }

  doc.save(
    `rapport-passeports-formation-${now.toISOString().split("T")[0]}.pdf`,
  );
}

// Export pour le suivi du budget formation
export function exportBudgetToPDF(budgetData: {
  year: number;
  constraints: {
    monthlyBudget: number | null;
    quarterlyBudget: number | null;
    annualBudget: number | null;
  };
  monthly: {
    month: number;
    name: string;
    spent: number;
    sessions: number;
  }[];
  quarterly: {
    quarter: number;
    name: string;
    spent: number;
    sessions: number;
  }[];
  annual: {
    spent: number;
    sessions: number;
  };
  sessions?: {
    name: string;
    date: string;
    cost: number;
    participants: number;
    status: string;
  }[];
}) {
  const now = new Date();
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const { year, constraints, monthly, quarterly, annual, sessions } =
    budgetData;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  const startY = drawModernHeader(
    doc,
    `Suivi du Budget Formation ${year}`,
    `${annual.sessions} session(s) planifiee(s) - Total: ${formatNumber(annual.spent)} EUR`,
  );

  let currentY = startY;

  // Fonction pour obtenir le status
  const getStatus = (spent: number, budget: number | null) => {
    if (!budget || budget === 0) return "neutral";
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return "danger";
    if (percentage >= 80) return "warning";
    return "success";
  };

  const getPercentage = (spent: number, budget: number | null) => {
    if (!budget || budget === 0) return 0;
    return Math.round((spent / budget) * 100);
  };

  // ========== SECTION BUDGET ANNUEL ==========
  if (constraints.annualBudget && constraints.annualBudget > 0) {
    // Titre de section
    doc.setFillColor(...COLORS.lighter);
    doc.roundedRect(15, currentY, pageWidth - 30, 8, 2, 2, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text("BUDGET ANNUEL", 20, currentY + 5.5);
    currentY += 12;

    const annualPercentage = getPercentage(
      annual.spent,
      constraints.annualBudget,
    );
    const annualStatus = getStatus(annual.spent, constraints.annualBudget);
    const remaining = constraints.annualBudget - annual.spent;

    // Card budget annuel
    doc.setFillColor(...COLORS.light);
    doc.roundedRect(15, currentY, pageWidth - 30, 28, 3, 3, "F");

    // Barre de progression
    const barWidth = pageWidth - 50;
    const barHeight = 6;
    const barX = 25;
    const barY = currentY + 8;

    // Fond de la barre
    doc.setFillColor(...COLORS.border);
    doc.roundedRect(barX, barY, barWidth, barHeight, 2, 2, "F");

    // Barre de progression
    const progressWidth = Math.min(
      (annualPercentage / 100) * barWidth,
      barWidth,
    );
    const progressColor =
      annualStatus === "danger"
        ? COLORS.danger
        : annualStatus === "warning"
          ? COLORS.warning
          : COLORS.success;
    doc.setFillColor(...progressColor);
    doc.roundedRect(barX, barY, progressWidth, barHeight, 2, 2, "F");

    // Texte au-dessus de la barre
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.text);
    doc.text(`${formatNumber(annual.spent)} EUR`, barX, currentY + 5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.textMuted);
    doc.text(
      `sur ${formatNumber(constraints.annualBudget)} EUR`,
      barX + doc.getTextWidth(`${formatNumber(annual.spent)} EUR `) + 2,
      currentY + 5,
    );

    // Pourcentage à droite
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...progressColor);
    doc.text(`${annualPercentage}%`, pageWidth - 25, currentY + 5, {
      align: "right",
    });

    // Texte sous la barre
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.textMuted);
    doc.text(`${annual.sessions} session(s)`, barX, barY + barHeight + 6);

    doc.text(
      `Reste: ${formatNumber(remaining)} EUR`,
      pageWidth - 25,
      barY + barHeight + 6,
      { align: "right" },
    );

    currentY += 35;
  }

  // ========== SECTION BUDGET MENSUEL ==========
  if (constraints.monthlyBudget && constraints.monthlyBudget > 0) {
    // Titre de section
    doc.setFillColor(...COLORS.lighter);
    doc.roundedRect(15, currentY, pageWidth - 30, 8, 2, 2, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text(
      `BUDGET MENSUEL (${formatNumber(constraints.monthlyBudget)} EUR / mois)`,
      20,
      currentY + 5.5,
    );
    currentY += 12;

    // Tableau des mois
    const monthlyHeaders = [
      "Mois",
      "Dépenses",
      "Sessions",
      "Utilisation",
      "Statut",
    ];
    const monthlyData = monthly.map((m) => {
      const percentage = getPercentage(m.spent, constraints.monthlyBudget);
      const status =
        percentage >= 100 ? "DEPASSE" : percentage >= 80 ? "ATTENTION" : "OK";
      return [
        m.name,
        `${formatNumber(m.spent)} EUR`,
        m.sessions.toString(),
        `${percentage}%`,
        status,
      ];
    });

    // Total
    const totalMonthlySpent = monthly.reduce((sum, m) => sum + m.spent, 0);
    const totalMonthlySessions = monthly.reduce(
      (sum, m) => sum + m.sessions,
      0,
    );

    autoTable(doc, {
      head: [monthlyHeaders],
      body: monthlyData,
      foot: [
        [
          "TOTAL",
          `${formatNumber(totalMonthlySpent)} EUR`,
          totalMonthlySessions.toString(),
          "-",
          "",
        ],
      ],
      startY: currentY,
      ...getModernTableStyles(),
      margin: { left: 15, right: 15 },
      columnStyles: {
        0: { fontStyle: "bold" },
        1: { halign: "right" },
        2: { halign: "center" },
        3: { halign: "center" },
        4: { halign: "center" },
      },
      didParseCell: (cellData) => {
        // Colorer le pourcentage selon le niveau
        if (cellData.section === "body" && cellData.column.index === 3) {
          const value = parseInt(cellData.cell.raw as string);
          if (value >= 100) {
            cellData.cell.styles.textColor = COLORS.danger;
            cellData.cell.styles.fontStyle = "bold";
          } else if (value >= 80) {
            cellData.cell.styles.textColor = COLORS.warning;
          } else if (value > 0) {
            cellData.cell.styles.textColor = COLORS.success;
          }
        }
      },
    });

    currentY =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 10;
  }

  // ========== SECTION BUDGET TRIMESTRIEL ==========
  if (constraints.quarterlyBudget && constraints.quarterlyBudget > 0) {
    // Nouvelle page si nécessaire
    if (currentY > 200) {
      doc.addPage();
      currentY = 20;
    }

    // Titre de section
    doc.setFillColor(...COLORS.lighter);
    doc.roundedRect(15, currentY, pageWidth - 30, 8, 2, 2, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text(
      `BUDGET TRIMESTRIEL (${formatNumber(constraints.quarterlyBudget)} EUR / trimestre)`,
      20,
      currentY + 5.5,
    );
    currentY += 12;

    // Tableau des trimestres
    const quarterlyHeaders = [
      "Trimestre",
      "Dépenses",
      "Budget",
      "Sessions",
      "Utilisation",
      "Statut",
    ];
    const quarterlyData = quarterly.map((q) => {
      const percentage = getPercentage(q.spent, constraints.quarterlyBudget);
      const status =
        percentage >= 100 ? "DEPASSE" : percentage >= 80 ? "ATTENTION" : "OK";
      return [
        q.name,
        `${formatNumber(q.spent)} EUR`,
        `${formatNumber(constraints.quarterlyBudget!)} EUR`,
        q.sessions.toString(),
        `${percentage}%`,
        status,
      ];
    });

    autoTable(doc, {
      head: [quarterlyHeaders],
      body: quarterlyData,
      startY: currentY,
      ...getModernTableStyles(),
      margin: { left: 15, right: 15 },
      columnStyles: {
        0: { fontStyle: "bold" },
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "center" },
        4: { halign: "center" },
        5: { halign: "center" },
      },
      didParseCell: (cellData) => {
        if (cellData.section === "body" && cellData.column.index === 4) {
          const value = parseInt(cellData.cell.raw as string);
          if (value >= 100) {
            cellData.cell.styles.textColor = COLORS.danger;
            cellData.cell.styles.fontStyle = "bold";
          } else if (value >= 80) {
            cellData.cell.styles.textColor = COLORS.warning;
          } else if (value > 0) {
            cellData.cell.styles.textColor = COLORS.success;
          }
        }
      },
    });

    currentY =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 10;
  }

  // ========== SECTION DÉTAIL DES SESSIONS ==========
  if (sessions && sessions.length > 0) {
    // Nouvelle page si nécessaire
    if (currentY > 180) {
      doc.addPage();
      currentY = 20;
    }

    // Titre de section
    doc.setFillColor(...COLORS.lighter);
    doc.roundedRect(15, currentY, pageWidth - 30, 8, 2, 2, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text(`DETAIL DES SESSIONS (${sessions.length})`, 20, currentY + 5.5);
    currentY += 12;

    const sessionHeaders = [
      "Formation",
      "Date",
      "Participants",
      "Coût",
      "Statut",
    ];
    const sessionData = sessions.map((s) => [
      s.name,
      s.date,
      s.participants.toString(),
      `${formatNumber(s.cost)} EUR`,
      s.status,
    ]);

    autoTable(doc, {
      head: [sessionHeaders],
      body: sessionData,
      startY: currentY,
      ...getModernTableStyles(),
      margin: { left: 15, right: 15, bottom: 25 },
      columnStyles: {
        0: { cellWidth: 60 },
        3: { halign: "right", fontStyle: "bold" },
        4: { halign: "center" },
      },
    });
  }

  // Ajouter les footers
  const pageCount = (
    doc as unknown as { internal: { getNumberOfPages: () => number } }
  ).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawFooter(doc, i, pageCount);
  }

  doc.save(`budget-formation-${year}-${now.toISOString().split("T")[0]}.pdf`);
}
