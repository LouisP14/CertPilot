// Filtre de période (Année / Trimestre) pour les exports Passeport Prévention.
// Extrait de src/app/api/export/passeport-prevention/route.ts pour réutilisation
// par la route d'export PDF.

export function parsePpDateFilter(
  year: string | null,
  trimestre: string | null,
): { gte?: Date; lte?: Date } | undefined {
  if (!year) return undefined;
  const y = parseInt(year);
  if (trimestre) {
    const trimMap: Record<string, [number, number]> = {
      Q1: [0, 2],
      Q2: [3, 5],
      Q3: [6, 8],
      Q4: [9, 11],
    };
    const [startMonth, endMonth] = trimMap[trimestre] || [0, 11];
    return {
      gte: new Date(y, startMonth, 1),
      lte: new Date(y, endMonth + 1, 0, 23, 59, 59),
    };
  }
  return {
    gte: new Date(y, 0, 1),
    lte: new Date(y, 11, 31, 23, 59, 59),
  };
}

// Libellé humain de la période pour les titres et sous-titres PDF.
// Ex: "Année 2026", "Année 2026 — T2 (avril - juin)"
export function formatPpPeriodLabel(
  year: string | null,
  trimestre: string | null,
): string {
  if (!year) return "Toutes périodes";
  if (!trimestre) return `Année ${year}`;
  const trimLabels: Record<string, string> = {
    Q1: "T1 (janvier - mars)",
    Q2: "T2 (avril - juin)",
    Q3: "T3 (juillet - septembre)",
    Q4: "T4 (octobre - décembre)",
  };
  return `Année ${year} — ${trimLabels[trimestre] || trimestre}`;
}