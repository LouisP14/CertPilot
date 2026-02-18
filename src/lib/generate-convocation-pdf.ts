import jsPDF from "jspdf";

const COLORS = {
  primary: { r: 23, g: 59, b: 86 }, // #173B56
  emerald: { r: 16, g: 185, b: 129 }, // #10B981
  slate700: { r: 51, g: 65, b: 85 }, // #334155
  slate500: { r: 100, g: 116, b: 139 }, // #64748b
  slate300: { r: 203, g: 213, b: 225 }, // #cbd5e1
  slate100: { r: 241, g: 245, b: 249 }, // #f1f5f9
  red: { r: 185, g: 28, b: 28 }, // #b91c1c
};

/**
 * Génère un PDF de convocation professionnel et retourne son contenu en base64.
 */
export function generateConvocationPDF(
  companyName: string,
  formationName: string,
  startDate: string,
  endDate: string,
  startTime: string,
  endTime: string,
  location: string,
  notes: string,
  employeesList: { name: string; email: string | null }[],
): string {
  const doc = new jsPDF();
  const pageWidth = 210;
  const margin = 25;
  const contentWidth = pageWidth - margin * 2;
  const now = new Date();
  const generationDate = now.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const generationTime = now.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  // ========================================
  // HEADER - Bandeau entreprise
  // ========================================
  doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.rect(0, 0, pageWidth, 45, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(companyName, margin, 25);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Emis le ${generationDate}`, margin, 35);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("CertPilot", pageWidth - margin, 28, { align: "right" });

  // ========================================
  // TITRE - Convocation
  // ========================================
  let y = 65;

  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("CONVOCATION", pageWidth / 2, y, { align: "center" });

  y += 10;
  doc.setTextColor(COLORS.slate500.r, COLORS.slate500.g, COLORS.slate500.b);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Formation professionnelle", pageWidth / 2, y, { align: "center" });

  // ========================================
  // DESTINATAIRE
  // ========================================
  y += 20;

  doc.setTextColor(COLORS.slate500.r, COLORS.slate500.g, COLORS.slate500.b);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("A l'attention de :", margin, y);

  y += 8;
  doc.setTextColor(COLORS.slate700.r, COLORS.slate700.g, COLORS.slate700.b);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");

  employeesList.forEach((emp, index) => {
    if (index < 4) {
      doc.text(emp.name, margin, y);
      y += 7;
    } else if (index === 4) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        `et ${employeesList.length - 4} autre(s) participant(s)`,
        margin,
        y,
      );
      y += 7;
    }
  });

  // ========================================
  // NOM DE LA FORMATION - Encadré
  // ========================================
  y += 10;
  const formationBoxY = y;
  const formationBoxHeight = 30;

  doc.setFillColor(COLORS.slate100.r, COLORS.slate100.g, COLORS.slate100.b);
  doc.roundedRect(
    margin,
    formationBoxY,
    contentWidth,
    formationBoxHeight,
    4,
    4,
    "F",
  );

  doc.setFillColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
  doc.rect(margin, formationBoxY, 4, formationBoxHeight, "F");

  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");

  const formationLines = doc.splitTextToSize(
    formationName.toUpperCase(),
    contentWidth - 20,
  );
  const formationTextY =
    formationBoxY +
    formationBoxHeight / 2 +
    (formationLines.length > 1 ? -3 : 2);
  doc.text(formationLines, margin + 12, formationTextY);

  // ========================================
  // DETAILS - Date, Horaires, Lieu
  // ========================================
  y = formationBoxY + formationBoxHeight + 20;

  const dateText =
    startDate === endDate
      ? formatDate(startDate)
      : `Du ${formatDate(startDate)} au ${formatDate(endDate)}`;

  const details = [
    { label: "Date", value: dateText },
    { label: "Horaires", value: `${startTime} - ${endTime}` },
    { label: "Lieu", value: location },
  ];

  details.forEach((detail) => {
    doc.setTextColor(COLORS.slate500.r, COLORS.slate500.g, COLORS.slate500.b);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(detail.label, margin, y);

    y += 6;
    doc.setTextColor(COLORS.slate700.r, COLORS.slate700.g, COLORS.slate700.b);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(detail.value, margin, y);

    y += 14;
  });

  // ========================================
  // NOTES (si présentes)
  // ========================================
  if (notes && notes.trim()) {
    y += 5;

    doc.setTextColor(COLORS.slate500.r, COLORS.slate500.g, COLORS.slate500.b);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Informations complementaires", margin, y);

    y += 6;
    doc.setTextColor(COLORS.slate700.r, COLORS.slate700.g, COLORS.slate700.b);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const notesLines = doc.splitTextToSize(notes, contentWidth);
    doc.text(notesLines.slice(0, 3), margin, y);
    y += notesLines.slice(0, 3).length * 5 + 10;
  }

  // ========================================
  // MESSAGE IMPORTANT
  // ========================================
  y = Math.max(y + 10, 230);

  doc.setFillColor(254, 226, 226); // red-100
  doc.roundedRect(margin, y, contentWidth, 20, 3, 3, "F");

  doc.setTextColor(COLORS.red.r, COLORS.red.g, COLORS.red.b);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(
    "Toute absence doit etre dument justifiee aupres du service RH.",
    margin + 8,
    y + 12,
  );

  // ========================================
  // FOOTER
  // ========================================
  const footerY = 280;

  doc.setDrawColor(COLORS.slate300.r, COLORS.slate300.g, COLORS.slate300.b);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setTextColor(COLORS.slate500.r, COLORS.slate500.g, COLORS.slate500.b);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Document genere automatiquement le ${generationDate} a ${generationTime} - ${companyName}`,
    pageWidth / 2,
    footerY + 8,
    { align: "center" },
  );

  return doc.output("datauristring").split(",")[1];
}
