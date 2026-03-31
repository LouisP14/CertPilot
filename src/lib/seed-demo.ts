import bcrypt from "bcryptjs";
import { isSeeded, markAsSeeded, prisma } from "./prisma";

export async function seedDemoDataIfNeeded() {
  if (isSeeded()) {
    return { status: "already_seeded" };
  }

  try {
    const userCount = await prisma.user.count();

    if (userCount > 0) {
      markAsSeeded();
      return { status: "data_exists" };
    }

    console.log("🌱 Base vide, création des données de démo...");
    await createDemoData();
    markAsSeeded();
    console.log("✅ Données de démo créées !");

    return { status: "seeded" };
  } catch (error) {
    console.error("❌ Erreur seed:", error);
    return { status: "error", error: String(error) };
  }
}

async function createDemoData() {
  const hashedPassword = await bcrypt.hash("demo123!", 10);

  // Créer l'entreprise
  const company = await prisma.company.create({
    data: {
      id: "demo-company",
      name: "Acme Industries",
      alertThresholds: "90,60,30,7",
      adminEmail: "admin@acme-industries.fr",
      signatureEnabled: true,
      signatureResponsable: "Marie DURAND",
      signatureTitre: "Responsable Formation",
      subscriptionStatus: "ACTIVE",
      employeeLimit: 100,
    },
  });

  // Contraintes de planification
  await prisma.planningConstraints.create({
    data: {
      companyId: company.id,
      yearlyBudget: 50000,
      monthlyBudget: 5000,
      quarterlyBudget: 15000,
      maxAbsentPerTeam: 2,
      maxAbsentPerSite: 5,
    },
  });

  // Créer l'utilisateur admin
  await prisma.user.create({
    data: {
      email: "demo@certpilot.fr",
      password: hashedPassword,
      name: "Marie DURAND",
      role: "ADMIN",
      companyId: company.id,
      mustChangePassword: false, // Compte démo, pas de changement requis
      emailVerified: true,
    },
  });

  // Types de formation
  const formationTypes = [
    {
      id: "sst",
      name: "SST - Sauveteur Secouriste du Travail",
      category: "Sécurité",
      defaultValidityMonths: 24,
      durationHours: 14,
      service: null,
      estimatedCostPerPerson: 250,
    },
    {
      id: "caces-r489",
      name: "CACES R489 - Chariots élévateurs",
      category: "CACES",
      defaultValidityMonths: 60,
      durationHours: 21,
      service: "Logistique",
      estimatedCostPerPerson: 850,
    },
    {
      id: "caces-r486",
      name: "CACES R486 - Nacelles",
      category: "CACES",
      defaultValidityMonths: 60,
      durationHours: 21,
      service: "Maintenance",
      estimatedCostPerPerson: 750,
    },
    {
      id: "habilitation-br",
      name: "Habilitation électrique BR",
      category: "Électricité",
      defaultValidityMonths: 36,
      durationHours: 14,
      service: "Maintenance",
      estimatedCostPerPerson: 650,
    },
    {
      id: "habilitation-b0",
      name: "Habilitation électrique B0",
      category: "Électricité",
      defaultValidityMonths: 36,
      durationHours: 7,
      service: null,
      estimatedCostPerPerson: 350,
    },
    {
      id: "espaces-confines",
      name: "Travail en espaces confinés",
      category: "Risques",
      defaultValidityMonths: 36,
      durationHours: 14,
      service: "Maintenance",
      estimatedCostPerPerson: 580,
    },
    {
      id: "travail-hauteur",
      name: "Travail en hauteur",
      category: "Risques",
      defaultValidityMonths: 36,
      durationHours: 7,
      service: "Maintenance",
      estimatedCostPerPerson: 420,
    },
    {
      id: "atex",
      name: "ATEX niveau 1",
      category: "Risques",
      defaultValidityMonths: 36,
      durationHours: 7,
      service: "Production",
      estimatedCostPerPerson: 380,
    },
    {
      id: "incendie",
      name: "Équipier première intervention",
      category: "Sécurité",
      defaultValidityMonths: 12,
      durationHours: 4,
      service: null,
      estimatedCostPerPerson: 180,
    },
    {
      id: "gestes-postures",
      name: "Gestes et postures",
      category: "Ergonomie",
      defaultValidityMonths: 36,
      durationHours: 7,
      service: "Logistique",
      estimatedCostPerPerson: 220,
    },
  ];

  for (const ft of formationTypes) {
    await prisma.formationType.create({
      data: {
        id: ft.id,
        name: ft.name,
        category: ft.category,
        defaultValidityMonths: ft.defaultValidityMonths,
        durationHours: ft.durationHours,
        service: ft.service,
        estimatedCostPerPerson: ft.estimatedCostPerPerson,
      },
    });
  }

  // Employés
  const employees = [
    {
      firstName: "Jean",
      lastName: "DUPONT",
      position: "Technicien maintenance",
      department: "Maintenance",
      site: "Paris",
      team: "Équipe A",
    },
    {
      firstName: "Sophie",
      lastName: "MARTIN",
      position: "Chef d'équipe production",
      department: "Production",
      site: "Paris",
      team: "Équipe B",
    },
    {
      firstName: "Pierre",
      lastName: "BERNARD",
      position: "Cariste",
      department: "Logistique",
      site: "Lyon",
      team: "Équipe A",
    },
    {
      firstName: "Camille",
      lastName: "LEROY",
      position: "Responsable qualité",
      department: "Qualité",
      site: "Paris",
      team: null,
    },
    {
      firstName: "Thomas",
      lastName: "MOREAU",
      position: "Électricien",
      department: "Maintenance",
      site: "Paris",
      team: "Équipe A",
    },
    {
      firstName: "Emma",
      lastName: "PETIT",
      position: "Opératrice production",
      department: "Production",
      site: "Lyon",
      team: "Équipe C",
    },
    {
      firstName: "Lucas",
      lastName: "GARCIA",
      position: "Magasinier",
      department: "Logistique",
      site: "Lyon",
      team: "Équipe B",
    },
    {
      firstName: "Julie",
      lastName: "ROUX",
      position: "Assistante RH",
      department: "Administration",
      site: "Paris",
      team: null,
    },
    {
      firstName: "Antoine",
      lastName: "DAVID",
      position: "Technicien maintenance",
      department: "Maintenance",
      site: "Lyon",
      team: "Équipe A",
    },
    {
      firstName: "Léa",
      lastName: "LAMBERT",
      position: "Opératrice production",
      department: "Production",
      site: "Paris",
      team: "Équipe B",
    },
    {
      firstName: "Hugo",
      lastName: "THOMAS",
      position: "Cariste",
      department: "Logistique",
      site: "Paris",
      team: "Équipe A",
    },
    {
      firstName: "Chloé",
      lastName: "ROBERT",
      position: "Technicienne qualité",
      department: "Qualité",
      site: "Lyon",
      team: null,
    },
  ];

  const now = new Date();
  let employeeCounter = 1;

  for (const emp of employees) {
    const employeeId = `EMP${String(employeeCounter++).padStart(4, "0")}`;

    const employee = await prisma.employee.create({
      data: {
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: `${emp.firstName.toLowerCase()}.${emp.lastName.toLowerCase()}@acme.fr`,
        employeeId: employeeId,
        position: emp.position,
        department: emp.department,
        site: emp.site,
        team: emp.team,
        isActive: true,
        hourlyCost: 35,
      },
    });

    // Certificats pour chaque employé
    const relevantFormations = formationTypes.filter(
      (ft) =>
        !ft.service ||
        ft.service === emp.department ||
        ft.id === "sst" ||
        ft.id === "incendie",
    );

    // Prendre 3-5 formations aléatoires
    const numFormations = Math.floor(Math.random() * 3) + 3;
    const shuffled = relevantFormations.sort(() => 0.5 - Math.random());
    const selectedFormations = shuffled.slice(
      0,
      Math.min(numFormations, shuffled.length),
    );

    for (const ft of selectedFormations) {
      // Date d'obtention entre 1 mois et 4 ans dans le passé
      const monthsAgo = Math.floor(Math.random() * 48) + 1;
      const obtainedDate = new Date(now);
      obtainedDate.setMonth(obtainedDate.getMonth() - monthsAgo);

      const expiryDate = new Date(obtainedDate);
      expiryDate.setMonth(expiryDate.getMonth() + ft.defaultValidityMonths);

      await prisma.certificate.create({
        data: {
          employeeId: employee.id,
          formationTypeId: ft.id,
          obtainedDate,
          expiryDate,
          organism: ["AFPA", "AFTRAL", "GRETA", "CNAM"][
            Math.floor(Math.random() * 4)
          ],
        },
      });
    }
  }

  // Centres de formation
  const trainingCenters = [
    {
      name: "AFPA Normandie",
      city: "Rouen",
      contactEmail: "contact@afpa-normandie.fr",
      discount: 15,
    },
    {
      name: "AFTRAL Centre",
      city: "Orléans",
      contactEmail: "contact@aftral-centre.fr",
      discount: 10,
    },
    {
      name: "GRETA Paris",
      city: "Paris",
      contactEmail: "contact@greta-paris.fr",
      discount: 8,
    },
    {
      name: "CNAM Formation",
      city: "Paris",
      contactEmail: "formation@cnam.fr",
      discount: 12,
    },
  ];

  for (const tc of trainingCenters) {
    await prisma.trainingCenter.create({
      data: {
        name: tc.name,
        city: tc.city,
        contactEmail: tc.contactEmail,
        isPartner: true,
        discountPercent: tc.discount,
        rating: 4 + Math.random(),
      },
    });
  }

  console.log("📊 Données de démo créées:");
  console.log(`   👤 1 admin: demo@certpilot.fr / demo123!`);
  console.log(`   🏢 1 entreprise: Acme Industries`);
  console.log(`   📋 ${formationTypes.length} formations`);
  console.log(`   👥 ${employees.length} employés`);
  console.log(`   🎓 ${trainingCenters.length} centres de formation`);
}
