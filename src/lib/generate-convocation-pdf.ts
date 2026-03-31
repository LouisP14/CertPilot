import jsPDF from "jspdf";
import { CERTPILOT_LOGO_BASE64 } from "./logo-base64";

const COLORS = {
  primary: { r: 23, g: 59, b: 86 }, // #173B56
  emerald: { r: 16, g: 185, b: 129 }, // #10B981
  emeraldDark: { r: 5, g: 150, b: 105 }, // #059669
  slate700: { r: 51, g: 65, b: 85 }, // #334155
  slate500: { r: 100, g: 116, b: 139 }, // #64748b
  slate300: { r: 203, g: 213, b: 225 }, // #cbd5e1
  slate100: { r: 241, g: 245, b: 249 }, // #f1f5f9
  slate50: { r: 248, g: 250, b: 252 }, // #f8fafc
  white: { r: 255, g: 255, b: 255 },
  red700: { r: 185, g: 28, b: 28 }, // #b91c1c
  red50: { r: 254, g: 242, b: 242 }, // #fef2f2
};

function setColor(
  doc: jsPDF,
  color: { r: number; g: number; b: number },
  type: "text" | "fill" | "draw" = "text",
) {
  if (type === "text") doc.setTextColor(color.r, color.g, color.b);
  else if (type === "fill") doc.setFillColor(color.r, color.g, color.b);
  else doc.setDrawColor(color.r, color.g, color.b);
}

/**
 * Genere un PDF de convocation professionnel et retourne son contenu en base64.
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
  const margin = 20;
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
  const refNumber = `CONV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  // ========================================
  // HEADER - Bandeau entreprise + logo
  // ========================================
  setColor(doc, COLORS.primary, "fill");
  doc.rect(0, 0, pageWidth, 42, "F");

  // Accent emeraude en bas du header
  setColor(doc, COLORS.emerald, "fill");
  doc.rect(0, 42, pageWidth, 2, "F");

  // Logo CertPilot
  try {
    doc.addImage(CERTPILOT_LOGO_BASE64, "JPEG", pageWidth - margin - 28, 5, 32, 32);
  } catch {
    // Fallback texte si le logo ne charge pas
    setColor(doc, COLORS.white);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("CertPilot", pageWidth - margin, 25, { align: "right" });
  }

  // Nom entreprise
  setColor(doc, COLORS.white);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(companyName, margin, 20);

  // Date + reference
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Emis le ${generationDate}`, margin, 28);
  doc.setFontSize(8);
  doc.text(`Ref. ${refNumber}`, margin, 34);

  // ========================================
  // TITRE
  // ========================================
  let y = 58;

  setColor(doc, COLORS.primary);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("CONVOCATION", pageWidth / 2, y, { align: "center" });

  y += 8;
  setColor(doc, COLORS.slate500);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Formation professionnelle", pageWidth / 2, y, { align: "center" });

  // Filet emeraude decoratif
  y += 6;
  setColor(doc, COLORS.emerald, "fill");
  doc.rect(pageWidth / 2 - 20, y, 40, 1, "F");

  // ========================================
  // NOM DE LA FORMATION - Encadre
  // ========================================
  y += 12;
  const formationBoxY = y;

  // Calculer la hauteur selon le texte
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  const formationLines = doc.splitTextToSize(
    formationName.toUpperCase(),
    contentWidth - 24,
  );
  const formationBoxHeight = Math.max(28, 16 + formationLines.length * 7);

  // Fond
  setColor(doc, COLORS.slate100, "fill");
  doc.roundedRect(margin, formationBoxY, contentWidth, formationBoxHeight, 3, 3, "F");

  // Bordure gauche emeraude
  setColor(doc, COLORS.emerald, "fill");
  doc.roundedRect(margin, formationBoxY, 4, formationBoxHeight, 2, 2, "F");

  // Texte formation
  setColor(doc, COLORS.primary);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  const formationTextY =
    formationBoxY + formationBoxHeight / 2 - ((formationLines.length - 1) * 7) / 2 + 1;
  doc.text(formationLines, margin + 14, formationTextY);

  // ========================================
  // DETAILS - Grille 2 colonnes
  // ========================================
  y = formationBoxY + formationBoxHeight + 14;

  const dateText =
    startDate === endDate
      ? formatDate(startDate)
      : `Du ${formatDate(startDate)} au ${formatDate(endDate)}`;

  const colWidth = contentWidth / 2;

  // Ligne 1 : Date | Horaires
  const drawDetail = (
    label: string,
    value: string,
    x: number,
    yPos: number,
  ) => {
    setColor(doc, COLORS.emeraldDark);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(label.toUpperCase(), x, yPos);

    setColor(doc, COLORS.slate700);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    const lines = doc.splitTextToSize(value, colWidth - 10);
    doc.text(lines[0], x, yPos + 6);
    if (lines[1]) {
      doc.text(lines[1], x, yPos + 11);
    }
  };

  drawDetail("Date", dateText, margin, y);
  drawDetail("Horaires", `${startTime} - ${endTime}`, margin + colWidth, y);

  y += 20;
  drawDetail("Lieu", location || "A definir", margin, y);

  // ========================================
  // TABLEAU DES PARTICIPANTS
  // ========================================
  y += 22;

  setColor(doc, COLORS.primary);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Participants convoques", margin, y);

  y += 2;
  setColor(doc, COLORS.emerald, "fill");
  doc.rect(margin, y, 30, 1, "F");

  y += 6;

  // Header du tableau
  const tableX = margin;
  const col1W = 12; // N°
  const rowHeight = 8;

  setColor(doc, COLORS.primary, "fill");
  doc.roundedRect(tableX, y, contentWidth, rowHeight, 1, 1, "F");

  setColor(doc, COLORS.white);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("N\u00b0", tableX + 4, y + 5.5);
  doc.text("NOM ET PRENOM", tableX + col1W + 4, y + 5.5);

  y += rowHeight;

  // Lignes du tableau
  employeesList.forEach((emp, index) => {
    // Vérifier s'il faut une nouvelle page
    if (y + rowHeight > 250) {
      doc.addPage();
      y = 20;
    }

    // Fond alterné
    if (index % 2 === 0) {
      setColor(doc, COLORS.slate50, "fill");
      doc.rect(tableX, y, contentWidth, rowHeight, "F");
    }

    // Bordure fine en bas
    setColor(doc, COLORS.slate300, "draw");
    doc.setLineWidth(0.2);
    doc.line(tableX, y + rowHeight, tableX + contentWidth, y + rowHeight);

    // Contenu
    setColor(doc, COLORS.slate500);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(String(index + 1), tableX + 4, y + 5.5);

    setColor(doc, COLORS.slate700);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(emp.name, tableX + col1W + 4, y + 5.5);

    y += rowHeight;
  });

  // ========================================
  // NOTES (si presentes)
  // ========================================
  if (notes && notes.trim()) {
    y += 10;

    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    setColor(doc, COLORS.primary);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Informations complementaires", margin, y);

    y += 2;
    setColor(doc, COLORS.emerald, "fill");
    doc.rect(margin, y, 30, 1, "F");

    y += 6;
    setColor(doc, COLORS.slate700);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const notesLines = doc.splitTextToSize(notes, contentWidth);
    doc.text(notesLines.slice(0, 5), margin, y);
    y += notesLines.slice(0, 5).length * 4 + 5;
  }

  // ========================================
  // MESSAGE IMPORTANT
  // ========================================
  const warningY = Math.max(y + 8, 245);

  if (warningY > 265) {
    doc.addPage();
    const newY = 20;
    setColor(doc, COLORS.red50, "fill");
    doc.roundedRect(margin, newY, contentWidth, 16, 2, 2, "F");
    setColor(doc, COLORS.red700, "draw");
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, newY, contentWidth, 16, 2, 2, "S");
    setColor(doc, COLORS.red700);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(
      "Toute absence doit etre dument justifiee aupres du service RH.",
      pageWidth / 2,
      newY + 10,
      { align: "center" },
    );
  } else {
    setColor(doc, COLORS.red50, "fill");
    doc.roundedRect(margin, warningY, contentWidth, 16, 2, 2, "F");
    setColor(doc, COLORS.red700, "draw");
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, warningY, contentWidth, 16, 2, 2, "S");
    setColor(doc, COLORS.red700);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(
      "Toute absence doit etre dument justifiee aupres du service RH.",
      pageWidth / 2,
      warningY + 10,
      { align: "center" },
    );
  }

  // ========================================
  // FOOTER
  // ========================================
  const footerY = 280;

  setColor(doc, COLORS.slate300, "draw");
  doc.setLineWidth(0.3);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  setColor(doc, COLORS.slate500);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Document genere automatiquement le ${generationDate} a ${generationTime}`,
    margin,
    footerY + 5,
  );

  setColor(doc, COLORS.emeraldDark);
  doc.setFont("helvetica", "bold");
  doc.text(
    "CertPilot - www.certpilot.eu",
    pageWidth - margin,
    footerY + 5,
    { align: "right" },
  );

  return doc.output("datauristring").split(",")[1];
}
