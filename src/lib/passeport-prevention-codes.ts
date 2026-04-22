// Référentiels de codes pour le Passeport de Prévention
// Source : fiches pratiques INRS + référentiels officiels (ROME, Formacode, NSF)
// Ces listes couvrent les codes les plus courants en santé-sécurité au travail.
// Pour la liste exhaustive : https://passeport-prevention.travail-emploi.gouv.fr/

export type CodeEntry = {
  code: string;
  label: string;
  hint?: string;
};

// Codes ROME — compétences transférables (CompetenceTransferable dans la spec)
// Sélection des codes les plus pertinents pour la santé-sécurité au travail
export const ROME_CODES: CodeEntry[] = [
  { code: "K1705", label: "Sécurité civile et secours" },
  { code: "K2503", label: "Sécurité publique" },
  { code: "H1302", label: "Management et ingénierie HSE" },
  { code: "H1303", label: "Intervention technique HSE industriel" },
  { code: "I1502", label: "Inspection de conformité" },
  { code: "I1304", label: "Maintenance d'équipements industriels" },
  { code: "N1101", label: "Conduite d'engins de déplacement (CACES)" },
  { code: "N1103", label: "Magasinage et préparation de commandes" },
  { code: "F1106", label: "Ingénierie et études du BTP" },
  { code: "F1605", label: "Montage d'agencements" },
  { code: "F1703", label: "Maçonnerie" },
  { code: "F1704", label: "Préparation gros œuvre et terrassement" },
  { code: "H2913", label: "Soudage manuel" },
  { code: "I1301", label: "Installation et maintenance ascenseurs" },
  { code: "F1603", label: "Installation électrique" },
  { code: "F1605", label: "Montage de structures métalliques" },
  { code: "115650", label: "Prévention des risques professionnels" },
  { code: "121885", label: "Analyse de risques" },
  { code: "400635", label: "Secourisme" },
];

// Formacodes — codes de domaine de formation (DOMAINE_FORMATION)
// Pour les formations NON certifiantes
export const FORMACODES: CodeEntry[] = [
  { code: "42829", label: "Sécurité au travail" },
  { code: "42817", label: "Prévention des risques professionnels" },
  { code: "42826", label: "Secourisme du travail (SST)" },
  { code: "42866", label: "Prévention des risques psychosociaux (RPS)" },
  { code: "42801", label: "Hygiène au travail" },
  { code: "42885", label: "Risque électrique" },
  { code: "42881", label: "Risque incendie" },
  { code: "42856", label: "Risque routier" },
  { code: "42803", label: "Amiante" },
  { code: "42887", label: "ATEX - atmosphères explosibles" },
  { code: "42812", label: "Travail en hauteur" },
  { code: "42810", label: "Manutention manuelle (PRAP)" },
  { code: "42804", label: "Risques chimiques" },
  { code: "42889", label: "Radioprotection" },
  { code: "42875", label: "SSIAP - sécurité incendie ERP" },
  { code: "31634", label: "Conduite d'engins (CACES)" },
  { code: "23671", label: "Habilitation électrique" },
  { code: "42806", label: "Risques biologiques" },
  { code: "42808", label: "Hyperbare" },
];

// Codes NSF — Nomenclature des Spécialités de Formation (SPECIALITE_FORMATION)
// Pour les formations NON certifiantes
export const NSF_CODES: CodeEntry[] = [
  { code: "344", label: "Sécurité des biens et des personnes (global)" },
  { code: "344r", label: "Enseignement et formation - sécurité" },
  { code: "344p", label: "Encadrement et gestion de la sécurité" },
  { code: "344t", label: "Techniques sécurité des biens et personnes" },
  { code: "311", label: "Transport, manutention, magasinage (global)" },
  { code: "311u", label: "Conduite d'engins et véhicules (CACES)" },
  { code: "227", label: "Énergie, génie climatique" },
  { code: "227u", label: "Électricité - habilitation" },
  { code: "231", label: "Mines et carrières, génie civil" },
  { code: "255", label: "Mécanique - électricité" },
  { code: "255r", label: "Mécanique - électricité - enseignement" },
  { code: "330", label: "Santé (général)" },
  { code: "336", label: "Travail social - secours" },
];

// Qualifications formateur (enum QUALIFICATION_FORMATEUR dans la spec)
export const FORMATEUR_QUALIFICATIONS: CodeEntry[] = [
  { code: "ENSEIGNANT", label: "Enseignant (lycée, université)" },
  {
    code: "FORMATEUR_D_ADULTES_FORMATION_SPECIALISEE",
    label: "Formateur d'adultes avec formation spécialisée",
  },
  { code: "INGENIEUR", label: "Ingénieur" },
  { code: "PREVENTEUR", label: "Préventeur" },
  { code: "PSYCHOLOGUE", label: "Psychologue" },
  { code: "RESPONSABLE_QHSE", label: "Responsable QHSE" },
  { code: "ANCIEN_PROFESSIONNEL", label: "Ancien professionnel du secteur" },
];

// Modalité de dispense (MODALITE_DISPENSE)
export const MODALITES_DISPENSE: CodeEntry[] = [
  { code: "PRESENTIEL", label: "En présentiel" },
  { code: "A_DISTANCE", label: "À distance" },
  { code: "MIXTE", label: "Mixte (présentiel + distance)" },
];