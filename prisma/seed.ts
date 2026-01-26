import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("Admin123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@passeport-formation.fr" },
    update: {},
    create: {
      email: "admin@passeport-formation.fr",
      password: hashedPassword,
      name: "Administrateur",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create default company
  const company = await prisma.company.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "Mon Entreprise",
      alertThresholds: "90,60,30,7",
      adminEmail: "admin@passeport-formation.fr",
    },
  });
  console.log("✅ Company created:", company.name);

  // Create default formation types
  const formationTypes = [
    {
      name: "Électricien Basse Tension",
      category: "B0S44-3 BT",
      defaultValidityMonths: 36,
    },
    {
      name: "Électricien Haute Tension",
      category: "B0S44-3 HT",
      defaultValidityMonths: 36,
    },
    {
      name: "Conducteur de chaufferie vapeur",
      category: null,
      defaultValidityMonths: null,
    },
    {
      name: "Agent de chaufferie vapeur",
      category: null,
      defaultValidityMonths: null,
    },
    {
      name: "Autoclaves - Conduite et Maintenance",
      category: null,
      defaultValidityMonths: null,
    },
    {
      name: "Gerbeur conducteur porté - CAT 1B",
      category: "R489 CAT 1B",
      defaultValidityMonths: 60,
    },
    {
      name: "Chariot à conducteur porté - CAT 3",
      category: "R489 CAT 3",
      defaultValidityMonths: 60,
    },
    {
      name: "Chariot élévateur frontal - CAT 2",
      category: "R485 CAT 2",
      defaultValidityMonths: 60,
    },
    {
      name: "Gerbeur accompagnant - CAT 2",
      category: "R485 CAT 2",
      defaultValidityMonths: 60,
    },
    {
      name: "Travaux en hauteur - port du harnais",
      category: "R431",
      defaultValidityMonths: 36,
    },
    {
      name: "Conduite palan et élingues",
      category: "R484",
      defaultValidityMonths: 60,
    },
    { name: "Nacelle", category: "R486", defaultValidityMonths: 60 },
    { name: "Espaces confinés", category: "R447", defaultValidityMonths: 36 },
    { name: "LOTOTO", category: null, defaultValidityMonths: null },
    {
      name: "Sauveteur Secouriste du Travail",
      category: "SST",
      defaultValidityMonths: 24,
    },
    {
      name: "Habilitation électrique BR",
      category: "BR",
      defaultValidityMonths: 36,
    },
    {
      name: "Habilitation électrique BC",
      category: "BC",
      defaultValidityMonths: 36,
    },
    {
      name: "Habilitation électrique B2V",
      category: "B2V",
      defaultValidityMonths: 36,
    },
    { name: "CACES Pont roulant", category: "R484", defaultValidityMonths: 60 },
    { name: "Formation incendie", category: null, defaultValidityMonths: 12 },
  ];

  for (const ft of formationTypes) {
    await prisma.formationType.upsert({
      where: { id: ft.name.toLowerCase().replace(/\s+/g, "-") },
      update: ft,
      create: {
        id: ft.name.toLowerCase().replace(/\s+/g, "-"),
        ...ft,
      },
    });
  }
  console.log("✅ Formation types created:", formationTypes.length);

  // Create a sample employee
  const employee = await prisma.employee.upsert({
    where: { employeeId: "910002689" },
    update: {},
    create: {
      firstName: "Louis",
      lastName: "POULAIN",
      employeeId: "910002689",
      position: "Coordinateur Technique UP H/F",
      department: "Entretien Brecey",
      managerEmail: "manager@entreprise.fr",
      medicalCheckupDate: new Date("2020-12-07"),
    },
  });
  console.log(
    "✅ Sample employee created:",
    employee.lastName,
    employee.firstName,
  );

  // Add some certificates to the sample employee
  const electricienBT = await prisma.formationType.findFirst({
    where: { name: "Électricien Basse Tension" },
  });

  const gerbeur = await prisma.formationType.findFirst({
    where: { name: "Gerbeur conducteur porté - CAT 1B" },
  });

  const sst = await prisma.formationType.findFirst({
    where: { name: "Sauveteur Secouriste du Travail" },
  });

  if (electricienBT) {
    await prisma.certificate.upsert({
      where: { id: "cert-elec-bt" },
      update: {},
      create: {
        id: "cert-elec-bt",
        employeeId: employee.id,
        formationTypeId: electricienBT.id,
        obtainedDate: new Date("2023-09-12"),
        expiryDate: new Date("2026-09-12"),
        details: "HOV B2V BR BC",
        organism: "APAVE",
      },
    });
  }

  if (gerbeur) {
    await prisma.certificate.upsert({
      where: { id: "cert-gerbeur" },
      update: {},
      create: {
        id: "cert-gerbeur",
        employeeId: employee.id,
        formationTypeId: gerbeur.id,
        obtainedDate: new Date("2021-03-23"),
        expiryDate: new Date("2026-03-22"),
        organism: "SOCOTEC",
      },
    });
  }

  if (sst) {
    await prisma.certificate.upsert({
      where: { id: "cert-sst" },
      update: {},
      create: {
        id: "cert-sst",
        employeeId: employee.id,
        formationTypeId: sst.id,
        obtainedDate: new Date("2023-05-24"),
        expiryDate: new Date("2025-05-24"),
        organism: "APAVE",
      },
    });
  }

  console.log("✅ Sample certificates created");

  console.log("\n🎉 Seeding completed!");
  console.log("\n📋 Login credentials:");
  console.log("   Email: admin@passeport-formation.fr");
  console.log("   Password: Admin123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
