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

// Codes RS (Répertoire Spécifique) pour CERTIFICATION_VISEE
// Source : opendata.caissedesdepots.fr/dataset/code-des-certification-rs-sst-passeport-de-prevention
// Liste non exhaustive (~40 codes les plus courants en santé-sécurité)
// Liste complète : https://www.francecompetences.fr/
export const RS_CODES: CodeEntry[] = [
  // CACES R489 - Chariots de manutention
  { code: "RS6866", label: "CACES R489 cat. 1A - Transpalettes" },
  { code: "RS6867", label: "CACES R489 cat. 1B - Gerbeurs > 1,20 m" },
  { code: "RS6800", label: "CACES R489 cat. 2A - Chariots à plateau porteur" },
  { code: "RS6868", label: "CACES R489 cat. 2B - Chariots tracteurs" },
  { code: "RS6869", label: "CACES R489 cat. 3 - Chariots élévateurs porte-à-faux" },
  { code: "RS6871", label: "CACES R489 cat. 4 - Chariots élévateurs frontaux" },
  { code: "RS6870", label: "CACES R489 cat. 5 - Chariots élévateurs à mât rétractable" },
  { code: "RS6872", label: "CACES R489 cat. 6 - Chariots poste de conduite élevable" },
  { code: "RS6873", label: "CACES R489 cat. 7 - Conduite hors production" },
  // CACES R482 - Engins de chantier
  { code: "RS7040", label: "CACES R482 cat. A - Engins compacts" },
  { code: "RS7041", label: "CACES R482 cat. B1 - Engins d'extraction" },
  { code: "RS7044", label: "CACES R482 cat. C1 - Engins de chargement" },
  { code: "RS7045", label: "CACES R482 cat. C2 - Engins de réglage" },
  { code: "RS7046", label: "CACES R482 cat. C3 - Engins de nivellement" },
  { code: "RS7047", label: "CACES R482 cat. D - Engins de compactage" },
  { code: "RS7048", label: "CACES R482 cat. E - Engins de transport" },
  { code: "RS7049", label: "CACES R482 cat. F - Chariots de manutention BTP" },
  { code: "RS7023", label: "CACES R482 cat. G - Conduite hors production" },
  // CACES R483 - Grues mobiles
  { code: "RS6998", label: "CACES R483 cat. A - Grues mobiles à flèche treillis" },
  { code: "RS6999", label: "CACES R483 cat. B - Grues mobiles" },
  // CACES R484 - Ponts roulants
  { code: "RS6879", label: "CACES R484 cat. 1 - Ponts roulants télécommande" },
  { code: "RS6934", label: "CACES R484 cat. 2 - Ponts roulants en cabine" },
  // CACES R485 - Gerbeurs
  { code: "RS6937", label: "CACES R485 cat. 1 - Gerbeurs accompagnant" },
  { code: "RS6938", label: "CACES R485 cat. 2 - Gerbeurs > 2,5 m" },
  // CACES R486A - PEMP (nacelles)
  { code: "RS7000", label: "CACES R486A cat. A - PEMP à élévation verticale" },
  { code: "RS7001", label: "CACES R486A cat. B - PEMP multidirectionnelle" },
  { code: "RS7002", label: "CACES R486A cat. C - Conduite hors production PEMP" },
  // CACES R487 - Grues à tour
  { code: "RS6880", label: "CACES R487 cat. 1 - Grues à tour" },
  { code: "RS6935", label: "CACES R487 cat. 2 - Grues à tour" },
  { code: "RS6936", label: "CACES R487 cat. 3 - Montage automatisé" },
  // CACES R490 - Grues auxiliaires
  { code: "RS6997", label: "CACES R490 - Grues de chargement" },
  // Amiante
  { code: "RS6417", label: "Amiante SS3 - Opérateurs de chantier" },
  { code: "RS6422", label: "Amiante SS3 - Encadrement technique" },
  { code: "RS6423", label: "Amiante SS3 - Encadrement de chantier" },
  { code: "RS6418", label: "Amiante SS4 - Encadrement technique" },
  { code: "RS6419", label: "Amiante SS4 - Encadrement de chantier" },
  { code: "RS6420", label: "Amiante - Cumul fonctions d'encadrement" },
  // ADR - Transport matières dangereuses
  { code: "RS5629", label: "ADR - Conducteur (base)" },
  { code: "RS5630", label: "ADR - Spécialisation citernes" },
  { code: "RS5633", label: "ADR - Spécialisation classe 1 (explosifs)" },
  { code: "RS5634", label: "ADR - Spécialisation classe 7 (radioactif)" },
  { code: "RS5770", label: "Conseiller sécurité transport marchandises dangereuses" },
  // Santé-sécurité générale
  { code: "RS5774", label: "Coordonnateur sécurité et de santé (SPS)" },
  { code: "RS5995", label: "CCP Référent santé-sécurité-environnement" },
  { code: "RS6727", label: "Prévenir et gérer les risques SST (DU)" },
  { code: "RS6742", label: "Référent santé, sécurité et QVT" },
  { code: "RS5719", label: "PSE1 - Premiers secours en équipe niveau 1" },
  { code: "RS5720", label: "PSE2 - Premiers secours en équipe niveau 2" },
  { code: "RS6192", label: "Gestion du stress et prévention des TMS" },
  { code: "RS5226", label: "Ergomotricité - Manutention de personnes" },
  { code: "RS5877", label: "Santé et qualité de vie au travail" },
  // Fluides frigorigènes
  { code: "RS5638", label: "Manipulation fluides frigorigènes" },
  // Biocides / Phytopharmaceutiques
  { code: "RS6440", label: "Biocides - Désinfectants" },
  { code: "RS6441", label: "Biocides - Autres produits" },
  { code: "RS6442", label: "Biocides - Nuisibles" },
  { code: "RS5655", label: "Phytopharmaceutiques - Décideur" },
  { code: "RS5653", label: "Phytopharmaceutiques - Opérateur" },
];