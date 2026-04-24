// Masquage NIR pour affichage dans les documents partagés (PDFs, rapports).
// Format préservé : sexe + année + mois de naissance (informations non identifiantes)
// Format masqué : département, commune, ordre, clé de contrôle (identifiantes)
//
// Exemple : "185047512345678" → "1 85 04 ** *** **"
//
// Appliqué côté serveur avant sérialisation : le NIR complet ne quitte jamais le
// backend pour les documents exportés.

export function maskNir(nir: string | null | undefined): string {
  if (!nir) return "";
  const cleaned = nir.replace(/\s/g, "");
  if (cleaned.length < 5) return "*** masqué ***";
  const sexe = cleaned[0];
  const annee = cleaned.substring(1, 3);
  const mois = cleaned.substring(3, 5);
  return `${sexe} ${annee} ${mois} ** *** **`;
}