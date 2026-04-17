import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

// ============================================
// DONNÉES DE DÉMONSTRATION
// ============================================

const SERVICES = [
  "Maintenance",
  "Production",
  "Logistique",
  "Qualité",
  "Administratif",
];

const SITES = ["Rouen", "Le Havre", "Caen", "Paris", "Lyon"];

const POSITIONS = [
  "Technicien de maintenance",
  "Opérateur de production",
  "Cariste",
  "Chef d'équipe",
  "Responsable qualité",
  "Agent logistique",
  "Électricien industriel",
  "Mécanicien",
  "Soudeur",
  "Conducteur de ligne",
];

// Employés de démonstration
const EMPLOYEES_DATA = [
  {
    firstName: "Louis",
    lastName: "POULAIN",
    position: "Coordinateur Technique",
    department: "Maintenance",
    site: "Rouen",
  },
  {
    firstName: "Marie",
    lastName: "DUPONT",
    position: "Technicienne de maintenance",
    department: "Maintenance",
    site: "Rouen",
  },
  {
    firstName: "Pierre",
    lastName: "MARTIN",
    position: "Cariste",
    department: "Logistique",
    site: "Rouen",
  },
  {
    firstName: "Sophie",
    lastName: "BERNARD",
    position: "Chef d'équipe production",
    department: "Production",
    site: "Le Havre",
  },
  {
    firstName: "Thomas",
    lastName: "PETIT",
    position: "Électricien industriel",
    department: "Maintenance",
    site: "Le Havre",
  },
  {
    firstName: "Julie",
    lastName: "ROBERT",
    position: "Opérateur de production",
    department: "Production",
    site: "Le Havre",
  },
  {
    firstName: "Lucas",
    lastName: "DURAND",
    position: "Agent logistique",
    department: "Logistique",
    site: "Caen",
  },
  {
    firstName: "Emma",
    lastName: "LEROY",
    position: "Responsable qualité",
    department: "Qualité",
    site: "Caen",
  },
  {
    firstName: "Antoine",
    lastName: "MOREAU",
    position: "Mécanicien",
    department: "Maintenance",
    site: "Paris",
  },
  {
    firstName: "Camille",
    lastName: "SIMON",
    position: "Conducteur de ligne",
    department: "Production",
    site: "Paris",
  },
  {
    firstName: "Hugo",
    lastName: "LAURENT",
    position: "Soudeur",
    department: "Maintenance",
    site: "Lyon",
  },
  {
    firstName: "Léa",
    lastName: "LEFEBVRE",
    position: "Cariste",
    department: "Logistique",
    site: "Lyon",
  },
  {
    firstName: "Nathan",
    lastName: "MICHEL",
    position: "Technicien de maintenance",
    department: "Maintenance",
    site: "Rouen",
  },
  {
    firstName: "Chloé",
    lastName: "GARCIA",
    position: "Opérateur de production",
    department: "Production",
    site: "Rouen",
  },
  {
    firstName: "Maxime",
    lastName: "DAVID",
    position: "Chef d'équipe logistique",
    department: "Logistique",
    site: "Le Havre",
  },
  {
    firstName: "Sarah",
    lastName: "BERTRAND",
    position: "Électricien industriel",
    department: "Maintenance",
    site: "Caen",
  },
  {
    firstName: "Alexandre",
    lastName: "ROUX",
    position: "Agent de maintenance",
    department: "Maintenance",
    site: "Paris",
  },
  {
    firstName: "Manon",
    lastName: "VINCENT",
    position: "Opérateur de production",
    department: "Production",
    site: "Lyon",
  },
  {
    firstName: "Théo",
    lastName: "FOURNIER",
    position: "Cariste",
    department: "Logistique",
    site: "Rouen",
  },
  {
    firstName: "Inès",
    lastName: "MOREL",
    position: "Assistante qualité",
    department: "Qualité",
    site: "Le Havre",
  },
];

// Centres de formation
const TRAINING_CENTERS_DATA = [
  {
    name: "AFPA Rouen",
    code: "AFPA-76",
    city: "Rouen",
    address: "135 rue du Madrillet",
    postalCode: "76800",
    contactName: "Jean-Marc DUBOIS",
    contactEmail: "contact.rouen@afpa.fr",
    contactPhone: "02 32 91 25 00",
    isPartner: true,
    discountPercent: 15,
    rating: 4.5,
  },
  {
    name: "APAVE Formation",
    code: "APAVE-IDF",
    city: "Paris",
    address: "191 rue de Vaugirard",
    postalCode: "75015",
    contactName: "Catherine LEFEVRE",
    contactEmail: "formation@apave.fr",
    contactPhone: "01 45 66 99 44",
    isPartner: true,
    discountPercent: 10,
    rating: 4.7,
  },
  {
    name: "SOCOTEC Formation",
    code: "SOCOTEC-NOR",
    city: "Le Havre",
    address: "Zone Industrielle",
    postalCode: "76600",
    contactName: "Philippe MERCIER",
    contactEmail: "formation.normandie@socotec.fr",
    contactPhone: "02 35 21 45 00",
    isPartner: false,
    rating: 4.2,
  },
  {
    name: "CNAM Normandie",
    code: "CNAM-NOR",
    city: "Caen",
    address: "Esplanade de la Paix",
    postalCode: "14000",
    contactName: "Marie LAMBERT",
    contactEmail: "cnam.normandie@lecnam.net",
    contactPhone: "02 31 56 70 00",
    isPartner: true,
    discountPercent: 20,
    rating: 4.6,
  },
  {
    name: "Bureau Veritas Formation",
    code: "BV-FORM",
    city: "Lyon",
    address: "67 Boulevard Vivier Merle",
    postalCode: "69003",
    contactName: "François MARTIN",
    contactEmail: "formation.lyon@bureauveritas.com",
    contactPhone: "04 72 13 25 00",
    isPartner: false,
    rating: 4.4,
  },
  {
    name: "Promotrans",
    code: "PROMO-LOG",
    city: "Rouen",
    address: "Zone Logistique du Port",
    postalCode: "76000",
    contactName: "Nicolas DUMONT",
    contactEmail: "contact@promotrans.fr",
    contactPhone: "02 32 08 15 00",
    isPartner: true,
    discountPercent: 12,
    rating: 4.3,
  },
  {
    name: "AFTRAL",
    code: "AFTRAL-IDF",
    city: "Paris",
    address: "46 Avenue de Villiers",
    postalCode: "75017",
    contactName: "Isabelle GARNIER",
    contactEmail: "idf@aftral.com",
    contactPhone: "01 42 12 50 50",
    isPartner: true,
    discountPercent: 8,
    rating: 4.5,
  },
  {
    name: "Dekra Industrial",
    code: "DEKRA-NOR",
    city: "Le Havre",
    address: "Rue de l'Industrie",
    postalCode: "76600",
    contactName: "Marc ROUSSEAU",
    contactEmail: "normandie@dekra.com",
    contactPhone: "02 35 54 00 00",
    isPartner: false,
    rating: 4.1,
  },
  {
    name: "SGS Academy",
    code: "SGS-FORM",
    city: "Paris",
    address: "29 Avenue Aristide Briand",
    postalCode: "94111",
    contactName: "Delphine PETIT",
    contactEmail: "academy.fr@sgs.com",
    contactPhone: "01 41 24 82 82",
    isPartner: true,
    discountPercent: 5,
    rating: 4.0,
  },
  {
    name: "GRETA Normandie",
    code: "GRETA-NOR",
    city: "Caen",
    address: "21 rue du Moulin au Roy",
    postalCode: "14000",
    contactName: "Sylvie BONNET",
    contactEmail: "contact@greta-normandie.fr",
    contactPhone: "02 31 70 30 30",
    isPartner: true,
    discountPercent: 18,
    rating: 4.3,
  },
];

async function main() {
  console.log("🌱 Seeding demo database...\n");

  // ============================================
  // 1. UTILISATEUR ADMIN
  // ============================================
  const hashedPassword = await bcrypt.hash("Admin123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@certpilot.fr" },
    update: {},
    create: {
      email: "admin@certpilot.fr",
      password: hashedPassword,
      name: "Administrateur",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // ============================================
  // 2. ENTREPRISE
  // ============================================
  const company = await prisma.company.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "CertPilot Industries",
      alertThresholds: "90,60,30,7",
      adminEmail: "admin@certpilot.fr",
      signatureEnabled: true,
      signatureResponsable: "Jean-Pierre DIRECTEUR",
      signatureTitre: "Directeur des Ressources Humaines",
    },
  });
  console.log("✅ Company created:", company.name);

  // ============================================
  // 3. TYPES DE FORMATIONS
  // ============================================
  const formationTypesData = [
    {
      name: "Électricien Basse Tension",
      category: "B0S44-3 BT",
      service: "Maintenance",
      defaultValidityMonths: 36,
      estimatedCostPerPerson: 450,
      durationDays: 2,
    },
    {
      name: "Électricien Haute Tension",
      category: "B0S44-3 HT",
      service: "Maintenance",
      defaultValidityMonths: 36,
      estimatedCostPerPerson: 650,
      durationDays: 3,
    },
    {
      name: "Gerbeur conducteur porté - CAT 1B",
      category: "R489 CAT 1B",
      service: "Logistique",
      defaultValidityMonths: 60,
      estimatedCostPerPerson: 380,
      durationDays: 2,
    },
    {
      name: "Chariot élévateur frontal - CAT 3",
      category: "R489 CAT 3",
      service: "Logistique",
      defaultValidityMonths: 60,
      estimatedCostPerPerson: 420,
      durationDays: 3,
    },
    {
      name: "Sauveteur Secouriste du Travail",
      category: "SST",
      service: null,
      defaultValidityMonths: 24,
      estimatedCostPerPerson: 250,
      durationDays: 2,
    },
    {
      name: "Travaux en hauteur - port du harnais",
      category: "R431",
      service: "Maintenance",
      defaultValidityMonths: 36,
      estimatedCostPerPerson: 320,
      durationDays: 1,
    },
    {
      name: "Habilitation électrique BR",
      category: "BR",
      service: "Maintenance",
      defaultValidityMonths: 36,
      estimatedCostPerPerson: 480,
      durationDays: 2,
    },
    {
      name: "Habilitation électrique BC",
      category: "BC",
      service: "Maintenance",
      defaultValidityMonths: 36,
      estimatedCostPerPerson: 480,
      durationDays: 2,
    },
    {
      name: "CACES Nacelle",
      category: "R486",
      service: "Maintenance",
      defaultValidityMonths: 60,
      estimatedCostPerPerson: 550,
      durationDays: 3,
    },
    {
      name: "CACES Pont roulant",
      category: "R484",
      service: "Production",
      defaultValidityMonths: 60,
      estimatedCostPerPerson: 450,
      durationDays: 2,
    },
    {
      name: "Espaces confinés",
      category: "R447",
      service: "Maintenance",
      defaultValidityMonths: 36,
      estimatedCostPerPerson: 380,
      durationDays: 1,
    },
    {
      name: "Formation incendie",
      category: "EPI",
      service: null,
      defaultValidityMonths: 12,
      estimatedCostPerPerson: 120,
      durationDays: 1,
    },
    {
      name: "Gestes et postures",
      category: "PRAP",
      service: "Production",
      defaultValidityMonths: 24,
      estimatedCostPerPerson: 180,
      durationDays: 1,
    },
    {
      name: "Conduite palan et élingues",
      category: "R484",
      service: "Logistique",
      defaultValidityMonths: 60,
      estimatedCostPerPerson: 350,
      durationDays: 2,
    },
    {
      name: "ATEX niveau 1",
      category: "ATEX",
      service: "Production",
      defaultValidityMonths: 36,
      estimatedCostPerPerson: 420,
      durationDays: 1,
    },
  ];

  const formationTypes: Record<string, { id: string; name: string }> = {};
  for (const ft of formationTypesData) {
    const id = ft.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const created = await prisma.formationType.upsert({
      where: { id },
      update: ft,
      create: { id, ...ft, durationHours: ft.durationDays * 7 },
    });
    formationTypes[ft.name] = { id: created.id, name: created.name };
  }
  console.log(
    "✅ Formation types created:",
    Object.keys(formationTypes).length,
  );

  // ============================================
  // 4. CENTRES DE FORMATION
  // ============================================
  const trainingCenters: Record<string, string> = {};
  for (const tc of TRAINING_CENTERS_DATA) {
    const created = await prisma.trainingCenter.upsert({
      where: { code: tc.code },
      update: tc,
      create: tc,
    });
    trainingCenters[tc.name] = created.id;
  }
  console.log(
    "✅ Training centers created:",
    Object.keys(trainingCenters).length,
  );

  // ============================================
  // 5. OFFRES DES CENTRES
  // ============================================
  const offeringsData = [
    // AFPA Rouen - spécialisé CACES et électricité
    {
      center: "AFPA Rouen",
      formation: "Gerbeur conducteur porté - CAT 1B",
      pricePerPerson: 350,
      pricePerSession: 2800,
    },
    {
      center: "AFPA Rouen",
      formation: "Chariot élévateur frontal - CAT 3",
      pricePerPerson: 400,
      pricePerSession: 3200,
    },
    {
      center: "AFPA Rouen",
      formation: "Électricien Basse Tension",
      pricePerPerson: 420,
      pricePerSession: 3500,
    },
    {
      center: "AFPA Rouen",
      formation: "Habilitation électrique BR",
      pricePerPerson: 450,
    },

    // APAVE Formation - formations sécurité
    {
      center: "APAVE Formation",
      formation: "Électricien Basse Tension",
      pricePerPerson: 480,
      pricePerSession: 3800,
    },
    {
      center: "APAVE Formation",
      formation: "Électricien Haute Tension",
      pricePerPerson: 680,
      pricePerSession: 5500,
    },
    {
      center: "APAVE Formation",
      formation: "Travaux en hauteur - port du harnais",
      pricePerPerson: 340,
    },
    {
      center: "APAVE Formation",
      formation: "Espaces confinés",
      pricePerPerson: 390,
    },

    // SOCOTEC Formation
    {
      center: "SOCOTEC Formation",
      formation: "CACES Nacelle",
      pricePerPerson: 580,
      pricePerSession: 4500,
    },
    {
      center: "SOCOTEC Formation",
      formation: "CACES Pont roulant",
      pricePerPerson: 470,
      pricePerSession: 3800,
    },
    {
      center: "SOCOTEC Formation",
      formation: "Gerbeur conducteur porté - CAT 1B",
      pricePerPerson: 390,
    },

    // CNAM Normandie - formations techniques
    {
      center: "CNAM Normandie",
      formation: "Électricien Basse Tension",
      pricePerPerson: 380,
      pricePerSession: 3000,
    },
    {
      center: "CNAM Normandie",
      formation: "Habilitation électrique BR",
      pricePerPerson: 420,
    },
    {
      center: "CNAM Normandie",
      formation: "Habilitation électrique BC",
      pricePerPerson: 420,
    },
    {
      center: "CNAM Normandie",
      formation: "ATEX niveau 1",
      pricePerPerson: 380,
    },

    // Bureau Veritas Formation
    {
      center: "Bureau Veritas Formation",
      formation: "Sauveteur Secouriste du Travail",
      pricePerPerson: 260,
      pricePerSession: 2000,
    },
    {
      center: "Bureau Veritas Formation",
      formation: "Formation incendie",
      pricePerPerson: 130,
      pricePerSession: 1000,
    },
    {
      center: "Bureau Veritas Formation",
      formation: "Espaces confinés",
      pricePerPerson: 400,
    },

    // Promotrans - spécialisé logistique
    {
      center: "Promotrans",
      formation: "Gerbeur conducteur porté - CAT 1B",
      pricePerPerson: 320,
      pricePerSession: 2500,
    },
    {
      center: "Promotrans",
      formation: "Chariot élévateur frontal - CAT 3",
      pricePerPerson: 380,
      pricePerSession: 3000,
    },
    {
      center: "Promotrans",
      formation: "Conduite palan et élingues",
      pricePerPerson: 320,
    },

    // AFTRAL
    {
      center: "AFTRAL",
      formation: "Gerbeur conducteur porté - CAT 1B",
      pricePerPerson: 360,
    },
    {
      center: "AFTRAL",
      formation: "Chariot élévateur frontal - CAT 3",
      pricePerPerson: 420,
    },
    { center: "AFTRAL", formation: "CACES Pont roulant", pricePerPerson: 480 },

    // Dekra Industrial
    {
      center: "Dekra Industrial",
      formation: "CACES Nacelle",
      pricePerPerson: 560,
    },
    {
      center: "Dekra Industrial",
      formation: "Travaux en hauteur - port du harnais",
      pricePerPerson: 350,
    },
    {
      center: "Dekra Industrial",
      formation: "Électricien Basse Tension",
      pricePerPerson: 500,
    },

    // SGS Academy
    {
      center: "SGS Academy",
      formation: "Sauveteur Secouriste du Travail",
      pricePerPerson: 280,
    },
    {
      center: "SGS Academy",
      formation: "Formation incendie",
      pricePerPerson: 140,
    },
    {
      center: "SGS Academy",
      formation: "Gestes et postures",
      pricePerPerson: 190,
    },

    // GRETA Normandie
    {
      center: "GRETA Normandie",
      formation: "Électricien Basse Tension",
      pricePerPerson: 350,
      pricePerSession: 2800,
    },
    {
      center: "GRETA Normandie",
      formation: "Sauveteur Secouriste du Travail",
      pricePerPerson: 220,
      pricePerSession: 1800,
    },
    {
      center: "GRETA Normandie",
      formation: "Gestes et postures",
      pricePerPerson: 150,
    },
    {
      center: "GRETA Normandie",
      formation: "Formation incendie",
      pricePerPerson: 100,
      pricePerSession: 800,
    },
  ];

  let offeringsCount = 0;
  for (const offer of offeringsData) {
    const centerId = trainingCenters[offer.center];
    const formationType = formationTypes[offer.formation];
    if (centerId && formationType) {
      try {
        await prisma.trainingCenterOffering.upsert({
          where: {
            trainingCenterId_formationTypeId: {
              trainingCenterId: centerId,
              formationTypeId: formationType.id,
            },
          },
          update: {
            pricePerPerson: offer.pricePerPerson,
            pricePerSession: offer.pricePerSession || null,
          },
          create: {
            trainingCenterId: centerId,
            formationTypeId: formationType.id,
            pricePerPerson: offer.pricePerPerson,
            pricePerSession: offer.pricePerSession || null,
            minParticipants: 1,
            maxParticipants: 12,
          },
        });
        offeringsCount++;
      } catch {
        // Ignore duplicates
      }
    }
  }
  console.log("✅ Center offerings created:", offeringsCount);

  // ============================================
  // 6. EMPLOYÉS
  // ============================================
  const employees: { id: string; name: string; department: string }[] = [];

  for (let i = 0; i < EMPLOYEES_DATA.length; i++) {
    const emp = EMPLOYEES_DATA[i];
    const employeeId = `EMP${String(1000 + i).padStart(5, "0")}`;

    const created = await prisma.employee.upsert({
      where: { employeeId_companyId: { employeeId, companyId: company.id } },
      update: emp,
      create: {
        ...emp,
        employeeId,
        companyId: company.id,
        email: `${emp.firstName.toLowerCase()}.${emp.lastName.toLowerCase()}@certpilot.fr`,
        team: `Équipe ${["A", "B", "C"][i % 3]}`,
        hourlyCost: 35 + Math.floor(Math.random() * 20),
        workingHoursPerDay: 7,
      },
    });
    employees.push({
      id: created.id,
      name: `${created.firstName} ${created.lastName}`,
      department: created.department,
    });
  }
  console.log("✅ Employees created:", employees.length);

  // ============================================
  // 7. CERTIFICATS (formations des employés)
  // ============================================
  // Matrice des formations par département
  const formationsByDepartment: Record<string, string[]> = {
    Maintenance: [
      "Électricien Basse Tension",
      "Habilitation électrique BR",
      "Travaux en hauteur - port du harnais",
      "Sauveteur Secouriste du Travail",
      "Espaces confinés",
      "CACES Nacelle",
    ],
    Production: [
      "CACES Pont roulant",
      "Sauveteur Secouriste du Travail",
      "Formation incendie",
      "Gestes et postures",
      "ATEX niveau 1",
    ],
    Logistique: [
      "Gerbeur conducteur porté - CAT 1B",
      "Chariot élévateur frontal - CAT 3",
      "Conduite palan et élingues",
      "Sauveteur Secouriste du Travail",
    ],
    Qualité: ["Sauveteur Secouriste du Travail", "Formation incendie"],
    Administratif: ["Sauveteur Secouriste du Travail", "Formation incendie"],
  };

  const organisms = [
    "AFPA",
    "APAVE",
    "SOCOTEC",
    "CNAM",
    "Bureau Veritas",
    "Promotrans",
  ];

  let certificatesCount = 0;
  const now = new Date();

  for (const emp of employees) {
    const deptFormations = formationsByDepartment[emp.department] || [
      "Sauveteur Secouriste du Travail",
    ];

    // Chaque employé a 60-100% des formations de son département
    const numFormations = Math.floor(
      deptFormations.length * (0.6 + Math.random() * 0.4),
    );
    const selectedFormations = deptFormations
      .sort(() => Math.random() - 0.5)
      .slice(0, numFormations);

    for (const formationName of selectedFormations) {
      const ft = formationTypes[formationName];
      if (!ft) continue;

      // Date d'obtention entre 6 mois et 4 ans dans le passé
      const daysAgo = Math.floor(180 + Math.random() * 1280);
      const obtainedDate = new Date(now);
      obtainedDate.setDate(obtainedDate.getDate() - daysAgo);

      // Validité basée sur le type de formation
      const ftData = formationTypesData.find((f) => f.name === formationName);
      let expiryDate: Date | null = null;
      if (ftData?.defaultValidityMonths) {
        expiryDate = new Date(obtainedDate);
        expiryDate.setMonth(
          expiryDate.getMonth() + ftData.defaultValidityMonths,
        );
      }

      try {
        await prisma.certificate.create({
          data: {
            employeeId: emp.id,
            formationTypeId: ft.id,
            obtainedDate,
            expiryDate,
            organism: organisms[Math.floor(Math.random() * organisms.length)],
          },
        });
        certificatesCount++;
      } catch {
        // Ignore duplicates
      }
    }
  }
  console.log("✅ Certificates created:", certificatesCount);

  // ============================================
  // 8. SESSIONS DE FORMATION
  // ============================================
  const sessionsData = [
    {
      formation: "Gerbeur conducteur porté - CAT 1B",
      center: "AFPA Rouen",
      startDate: new Date("2026-02-10"),
      endDate: new Date("2026-02-11"),
      status: "CONFIRMED",
      employees: ["Pierre MARTIN", "Théo FOURNIER", "Léa LEFEBVRE"],
    },
    {
      formation: "Électricien Basse Tension",
      center: "APAVE Formation",
      startDate: new Date("2026-02-17"),
      endDate: new Date("2026-02-18"),
      status: "CONFIRMED",
      employees: [
        "Thomas PETIT",
        "Marie DUPONT",
        "Nathan MICHEL",
        "Sarah BERTRAND",
      ],
    },
    {
      formation: "Sauveteur Secouriste du Travail",
      center: "GRETA Normandie",
      startDate: new Date("2026-03-03"),
      endDate: new Date("2026-03-04"),
      status: "PROPOSED",
      employees: [
        "Sophie BERNARD",
        "Julie ROBERT",
        "Chloé GARCIA",
        "Maxime DAVID",
        "Inès MOREL",
      ],
    },
    {
      formation: "CACES Nacelle",
      center: "SOCOTEC Formation",
      startDate: new Date("2026-03-10"),
      endDate: new Date("2026-03-12"),
      status: "PROPOSED",
      employees: ["Hugo LAURENT", "Antoine MOREAU"],
    },
    {
      formation: "Formation incendie",
      center: "Bureau Veritas Formation",
      startDate: new Date("2026-02-24"),
      endDate: new Date("2026-02-24"),
      status: "CONFIRMED",
      employees: [
        "Emma LEROY",
        "Lucas DURAND",
        "Camille SIMON",
        "Alexandre ROUX",
        "Manon VINCENT",
      ],
    },
    {
      formation: "Chariot élévateur frontal - CAT 3",
      center: "Promotrans",
      startDate: new Date("2026-04-07"),
      endDate: new Date("2026-04-09"),
      status: "DRAFT",
      employees: ["Pierre MARTIN", "Lucas DURAND", "Léa LEFEBVRE"],
    },
  ];

  let sessionsCount = 0;
  for (const sessionData of sessionsData) {
    const ft = formationTypes[sessionData.formation];
    const centerId = trainingCenters[sessionData.center];
    if (!ft || !centerId) continue;

    // Trouver les employés
    const attendeeEmployees = employees.filter((e) =>
      sessionData.employees.some((name) => e.name === name),
    );

    // Coûts
    const offering = await prisma.trainingCenterOffering.findUnique({
      where: {
        trainingCenterId_formationTypeId: {
          trainingCenterId: centerId,
          formationTypeId: ft.id,
        },
      },
    });

    const trainingCost =
      offering?.pricePerSession ||
      (offering?.pricePerPerson || 400) * attendeeEmployees.length;

    const session = await prisma.trainingSession.create({
      data: {
        formationTypeId: ft.id,
        trainingCenterId: centerId,
        startDate: sessionData.startDate,
        endDate: sessionData.endDate,
        startTime: "09:00",
        endTime: "17:00",
        status: sessionData.status,
        trainingCost,
        costPerPerson: trainingCost / attendeeEmployees.length,
        minParticipants: 1,
        maxParticipants: 12,
        confirmedAt: sessionData.status === "CONFIRMED" ? new Date() : null,
      },
    });

    // Ajouter les participants
    for (const emp of attendeeEmployees) {
      await prisma.trainingSessionAttendee.create({
        data: {
          sessionId: session.id,
          employeeId: emp.id,
          status: sessionData.status === "CONFIRMED" ? "CONFIRMED" : "INVITED",
        },
      });
    }

    sessionsCount++;
  }
  console.log("✅ Training sessions created:", sessionsCount);

  // ============================================
  // RÉSUMÉ
  // ============================================
  console.log("\n🎉 Demo seeding completed!");
  console.log("\n📊 Données créées:");
  console.log(`   • ${employees.length} employés`);
  console.log(`   • ${Object.keys(formationTypes).length} types de formations`);
  console.log(
    `   • ${Object.keys(trainingCenters).length} centres de formation`,
  );
  console.log(`   • ${offeringsCount} offres de formation`);
  console.log(`   • ${certificatesCount} certificats`);
  console.log(`   • ${sessionsCount} sessions planifiées`);
  console.log("\n📋 Identifiants de connexion:");
  console.log("   Email: admin@certpilot.fr");
  console.log("   Mot de passe: Admin123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
