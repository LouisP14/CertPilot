import { jsPDF } from "jspdf";
import fs from "fs";

const PRIMARY = [23, 59, 86]; // #173B56
const GREEN = [5, 150, 105]; // #059669
const GRAY = [100, 116, 139]; // #64748b
const LIGHT_BG = [248, 250, 252]; // #f8fafc
const WHITE = [255, 255, 255];

function generateChecklist() {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const margin = 20;
  const contentW = W - margin * 2;
  let y = 0;

  // ============ PAGE 1 - COVER ============
  // Background gradient simulation
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, W, 297, "F");

  // Decorative circles
  doc.setFillColor(255, 255, 255);
  doc.setGState(new doc.GState({ opacity: 0.03 }));
  doc.circle(160, 60, 80, "F");
  doc.circle(40, 230, 60, "F");
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Shield icon (simple)
  doc.setFillColor(...GREEN);
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.5);
  const shieldX = W / 2;
  const shieldY = 85;
  // Shield outline
  doc.setFillColor(255, 255, 255);
  doc.setGState(new doc.GState({ opacity: 0.15 }));
  doc.circle(shieldX, shieldY, 25, "F");
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Checkmark in circle
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1.5);
  doc.line(shieldX - 8, shieldY, shieldX - 2, shieldY + 6);
  doc.line(shieldX - 2, shieldY + 6, shieldX + 10, shieldY - 8);

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text("CHECKLIST", W / 2, 130, { align: "center" });
  doc.text("CONFORMITÉ", W / 2, 145, { align: "center" });

  doc.setFontSize(20);
  doc.setTextColor(...GREEN);
  doc.text("HABILITATIONS 2026", W / 2, 160, { align: "center" });

  // Subtitle
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.setGState(new doc.GState({ opacity: 0.7 }));
  doc.text("23 points de contrôle essentiels", W / 2, 178, { align: "center" });
  doc.text("pour assurer la conformité de votre entreprise", W / 2, 186, { align: "center" });
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Bottom branding
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("CertPilot", W / 2, 250, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setGState(new doc.GState({ opacity: 0.6 }));
  doc.text("www.certpilot.eu", W / 2, 258, { align: "center" });
  doc.setGState(new doc.GState({ opacity: 1 }));

  // ============ PAGE 2 - CACES + SST ============
  doc.addPage();
  y = margin;

  y = drawHeader(doc, y, margin, contentW);

  // Section CACES
  y = drawSectionTitle(doc, y, "1", "CACES", "7 points", margin, contentW);
  const cacesItems = [
    "Tous les CACES sont en cours de validité (5 ans max)",
    "Chaque conducteur possède une autorisation de conduite signée par l'employeur",
    "Les catégories correspondent aux engins utilisés (R489, R486, R482, R490...)",
    "Les recyclages sont planifiés avant expiration",
    "Les CACES sont délivrés par un organisme certifié",
    "Un registre des autorisations de conduite est tenu à jour",
    "Les intérimaires présentent un CACES valide avant prise de poste",
  ];
  for (const item of cacesItems) {
    y = drawCheckItem(doc, item, y, margin);
  }

  y += 8;

  // Section SST
  y = drawSectionTitle(doc, y, "2", "SST - Sauveteurs Secouristes du Travail", "4 points", margin, contentW);
  const sstItems = [
    "Au moins 1 SST pour 20 salariés (ou plus selon les risques)",
    "Les certificats SST sont valides (24 mois max)",
    "Les recyclages MAC SST (7h) sont planifiés avant expiration",
    "La couverture SST est vérifiée par site / atelier / équipe",
  ];
  for (const item of sstItems) {
    y = drawCheckItem(doc, item, y, margin);
  }

  // ============ PAGE 3 - ELEC + AUTRES + DOC ============
  doc.addPage();
  y = margin;

  y = drawHeader(doc, y, margin, contentW);

  // Section Habilitations électriques
  y = drawSectionTitle(doc, y, "3", "Habilitations électriques NF C 18-510", "5 points", margin, contentW);
  const elecItems = [
    "Tout intervenant sur ou à proximité d'installations électriques est habilité",
    "Les niveaux correspondent aux tâches (B0, B1, B2, BR, BC, H0, H1, H2...)",
    "Un titre d'habilitation signé par l'employeur est remis à chaque habilité",
    "Le recyclage est planifié (recommandé tous les 3 ans)",
    "Les habilitations sont mises à jour après changement de poste ou d'installation",
  ];
  for (const item of elecItems) {
    y = drawCheckItem(doc, item, y, margin);
  }

  y += 8;

  // Section Autres formations
  y = drawSectionTitle(doc, y, "4", "Autres formations obligatoires", "4 points", margin, contentW);
  const otherItems = [
    "Travail en hauteur : personnel formé, recyclage à jour",
    "Espaces confinés : formation spécifique + autorisation d'intervention",
    "ATEX : formation adaptée au zonage de l'établissement",
    "Amiante SS4 : formation valide pour tout intervenant exposé",
  ];
  for (const item of otherItems) {
    y = drawCheckItem(doc, item, y, margin);
  }

  y += 8;

  // Section Documentation
  y = drawSectionTitle(doc, y, "5", "Documentation & traçabilité", "3 points", margin, contentW);
  const docItems = [
    "Un registre centralisé de toutes les habilitations est maintenu",
    "Les attestations de formation et certificats sont archivés",
    "Un historique des recyclages et renouvellements est disponible pour audit",
  ];
  for (const item of docItems) {
    y = drawCheckItem(doc, item, y, margin);
  }

  // ============ PAGE 4 - SCORING + CTA ============
  doc.addPage();
  y = margin;

  y = drawHeader(doc, y, margin, contentW);

  // Scoring title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PRIMARY);
  doc.text("Votre score de conformité", margin, y);
  y += 12;

  // Scoring table
  const scores = [
    { range: "23/23", level: "Conforme", desc: "Bravo ! Vous êtes en règle.", color: [5, 150, 105] },
    { range: "18-22", level: "Quasi conforme", desc: "Corrigez les écarts rapidement.", color: [245, 158, 11] },
    { range: "12-17", level: "Risque modéré", desc: "Actions correctives nécessaires.", color: [249, 115, 22] },
    { range: "< 12", level: "Non conforme", desc: "Risque de sanction en cas de contrôle.", color: [220, 38, 38] },
  ];

  for (const score of scores) {
    doc.setFillColor(...LIGHT_BG);
    doc.roundedRect(margin, y - 5, contentW, 18, 3, 3, "F");

    doc.setFillColor(...score.color);
    doc.roundedRect(margin + 3, y - 2, 24, 12, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(score.range, margin + 15, y + 5, { align: "center" });

    doc.setTextColor(...PRIMARY);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(score.level, margin + 32, y + 5);

    doc.setTextColor(...GRAY);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(score.desc, margin + 32, y + 11);

    y += 22;
  }

  y += 15;

  // CTA Section
  doc.setFillColor(...PRIMARY);
  doc.roundedRect(margin, y, contentW, 75, 5, 5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Automatisez votre conformité", W / 2, y + 18, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setGState(new doc.GState({ opacity: 0.8 }));
  doc.text("Vous gérez encore vos habilitations sur Excel ?", W / 2, y + 30, { align: "center" });
  doc.text("CertPilot automatise tout : alertes, convocations,", W / 2, y + 38, { align: "center" });
  doc.text("passeport formation PDF, signature électronique.", W / 2, y + 46, { align: "center" });
  doc.setGState(new doc.GState({ opacity: 1 }));

  // CTA button
  doc.setFillColor(...GREEN);
  doc.roundedRect(W / 2 - 40, y + 52, 80, 14, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Essai gratuit 14 jours", W / 2, y + 61, { align: "center" });

  y += 85;

  // URL
  doc.setTextColor(...GREEN);
  doc.setFontSize(11);
  doc.text("www.certpilot.eu/register", W / 2, y, { align: "center" });

  y += 15;

  // Footer
  doc.setTextColor(...GRAY);
  doc.setFontSize(8);
  doc.text("CertPilot — Zéro habilitation expirée. Zéro surprise en audit.", W / 2, y, { align: "center" });
  doc.text("contact@certpilot.eu", W / 2, y + 5, { align: "center" });

  // Save
  const buffer = doc.output("arraybuffer");
  fs.writeFileSync("public/documents/checklist-conformite-habilitations-2026.pdf", Buffer.from(buffer));
  console.log("PDF generated: public/documents/checklist-conformite-habilitations-2026.pdf");
}

function drawHeader(doc, y, margin, contentW) {
  doc.setTextColor(...PRIMARY);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("CertPilot", margin, y);

  doc.setTextColor(...GRAY);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Checklist Conformité Habilitations 2026", margin + contentW, y, { align: "right" });

  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.3);
  y += 3;
  doc.line(margin, y, margin + contentW, y);
  y += 10;
  return y;
}

function drawSectionTitle(doc, y, num, title, points, margin, contentW) {
  // Number badge
  doc.setFillColor(...GREEN);
  doc.roundedRect(margin, y - 5, 10, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(num, margin + 5, y + 2, { align: "center" });

  // Title
  doc.setTextColor(...PRIMARY);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin + 14, y + 2);

  // Points badge
  doc.setTextColor(...GRAY);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(points, margin + contentW, y + 2, { align: "right" });

  y += 10;
  return y;
}

function drawCheckItem(doc, text, y, margin) {
  // Checkbox
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin + 4, y - 3.5, 5, 5, 1, 1);

  // Text
  doc.setTextColor(51, 65, 85); // slate-700
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // Handle long text wrapping
  const maxWidth = 150;
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, margin + 13, y);

  y += lines.length * 5 + 4;
  return y;
}

generateChecklist();
