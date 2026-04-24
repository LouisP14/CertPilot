// Utilitaires SIRET — numéro d'identification SIRET (14 chiffres)
// Pas de contrôle Luhn : certaines entités (La Poste, certaines administrations)
// dérogent au Luhn, on évite les faux négatifs.

export function isValidSiret(value: string | null | undefined): boolean {
  if (!value) return false;
  const cleaned = value.replace(/\s/g, "");
  return /^\d{14}$/.test(cleaned);
}

// Normalise un SIRET saisi par l'utilisateur : retire tous les espaces.
// Retourne null si vide, lève une erreur si invalide.
export function normalizeSiret(value: string | null | undefined): string | null {
  if (!value) return null;
  const cleaned = value.replace(/\s/g, "");
  if (cleaned === "") return null;
  if (!/^\d{14}$/.test(cleaned)) {
    throw new Error("Le SIRET doit comporter exactement 14 chiffres");
  }
  return cleaned;
}

// Formate un SIRET pour affichage : "12345678900012" → "123 456 789 00012"
export function formatSiret(value: string | null | undefined): string {
  if (!value) return "";
  const cleaned = value.replace(/\s/g, "");
  if (cleaned.length !== 14) return value;
  return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 9)} ${cleaned.substring(9, 14)}`;
}