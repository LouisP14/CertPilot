// Script pour envoyer les emails de prospection
// Usage: npx tsx scripts/send-prospection.ts [batch_number]
// batch 1 = contacts 1-6, batch 2 = 7-12, etc.

const ALL_PROSPECTS = [
  // Batch 1 - Aéro/Défense + Énergie
  {
    to: "jade.seri@hutchinson.com",
    firstName: "Jade",
    company: "Hutchinson",
    sector: "industrie",
  },
  {
    to: "benjamin.fichet@totalenergies.com",
    firstName: "Benjamin",
    company: "TotalEnergies",
    sector: "energie",
  },
  {
    to: "caroline.beucler@naval-group.com",
    firstName: "Caroline",
    company: "Naval Group",
    sector: "aero-defense",
  },
  {
    to: "erwan.duval@orano.group",
    firstName: "Erwan",
    company: "Orano",
    sector: "energie",
  },
  {
    to: "revel.remy@mecachrome.com",
    firstName: "Rémy",
    company: "Mecachrome",
    sector: "aero-defense",
  },
  {
    to: "dean.olson@btgenergy.com",
    firstName: "Dean",
    company: "BTG Energy",
    sector: "energie",
  },

  // Batch 2 - Industrie
  {
    to: "w.zehnder@minitubes.com",
    firstName: "W.",
    company: "Minitubes",
    sector: "industrie",
  },
  {
    to: "sebastien.jakowczyk@cooper.fr",
    firstName: "Sébastien",
    company: "Cooper",
    sector: "industrie",
  },
  {
    to: "rbarre@ligiergroup.com",
    firstName: "R.",
    company: "Ligier Group",
    sector: "industrie",
  },
  {
    to: "emmanuelle.bord@rector.fr",
    firstName: "Emmanuelle",
    company: "Rector",
    sector: "industrie",
  },
  {
    to: "antoine.dartus@roquette.com",
    firstName: "Antoine",
    company: "Roquette",
    sector: "industrie",
  },
  {
    to: "sboulay@groupeserap.com",
    firstName: "S.",
    company: "Groupe Serap",
    sector: "industrie",
  },

  // Batch 3 - Chimie/Pharma + BTP + Transport
  {
    to: "bleclercq@htlbiotech.com",
    firstName: "B.",
    company: "HTL Biotech",
    sector: "chimie",
  },
  {
    to: "cedric.thomas@servier.com",
    firstName: "Cédric",
    company: "Servier",
    sector: "chimie",
  },
  {
    to: "r.clavieres@estouvrages.com",
    firstName: "R.",
    company: "ETS Ouvrages",
    sector: "btp",
  },
  {
    to: "koloinaramanarivo@ets-lecuyer.com",
    firstName: "Koloina",
    company: "ETS Lecuyer",
    sector: "btp",
  },
  {
    to: "charlotte.mas@tisseo.fr",
    firstName: "Charlotte",
    company: "Tisséo",
    sector: "transport",
  },
  {
    to: "sylvain.aulombard@etanco.fr",
    firstName: "Sylvain",
    company: "Etanco",
    sector: "industrie",
  },

  // Batch 4 - IT/Services + Retail
  {
    to: "lgueguen@expertime.com",
    firstName: "L.",
    company: "Expertime",
    sector: "it",
  },
  {
    to: "b.montagne@capteam.fr",
    firstName: "B.",
    company: "Capteam",
    sector: "it",
  },
  {
    to: "david.brunette@ekkeagle.com",
    firstName: "David",
    company: "EKK Eagle",
    sector: "industrie",
  },
  {
    to: "jf_pintus@colombo.fr",
    firstName: "Jean-François",
    company: "Colombo",
    sector: "industrie",
  },
  {
    to: "clement.stanek@kuhlmann-europe.com",
    firstName: "Clément",
    company: "Kuhlmann Europe",
    sector: "chimie",
  },
  {
    to: "anais.willaime@tricoflex.com",
    firstName: "Anaïs",
    company: "Tricoflex",
    sector: "industrie",
  },

  // Batch 5 - Retail/Conso + Autres
  {
    to: "mcrampon@supergabeauty.com",
    firstName: "M.",
    company: "Superga Beauty",
    sector: "retail",
  },
  {
    to: "fabien.fillastre@promod.fr",
    firstName: "Fabien",
    company: "Promod",
    sector: "retail",
  },
  {
    to: "rh.adc@atelierduchocolat.fr",
    firstName: "Bonjour",
    company: "L'Atelier du Chocolat",
    sector: "retail",
  },
  {
    to: "emilie.rollin@calisson.com",
    firstName: "Émilie",
    company: "Calisson",
    sector: "retail",
  },
  {
    to: "evita.rodriguez@parfumsberdoues.com",
    firstName: "Evita",
    company: "Parfums Berdoues",
    sector: "retail",
  },
  {
    to: "christophe.lopez@catanagroup.com",
    firstName: "Christophe",
    company: "Catana Group",
    sector: "industrie",
  },
  {
    to: "sabrina.bettazzi@tricobiotos.it",
    firstName: "Sabrina",
    company: "Trico Biotos",
    sector: "industrie",
  },
];

const BATCH_SIZE = 6;

async function main() {
  const batchNum = parseInt(process.argv[2] || "1");
  const start = (batchNum - 1) * BATCH_SIZE;
  const end = start + BATCH_SIZE;
  const batch = ALL_PROSPECTS.slice(start, end);
  const totalBatches = Math.ceil(ALL_PROSPECTS.length / BATCH_SIZE);

  if (batch.length === 0) {
    console.log(`❌ Batch ${batchNum} n'existe pas (max: ${totalBatches})`);
    return;
  }

  console.log(
    `\n📧 Batch ${batchNum}/${totalBatches} — ${batch.length} emails à envoyer\n`,
  );
  batch.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.firstName} — ${p.company} (${p.to})`);
  });

  const appUrl =
    process.env.APP_URL ||
    process.env.NEXTAUTH_URL ||
    "https://www.certpilot.eu";

  console.log(`\n🚀 Envoi via ${appUrl}/api/admin/prospection...\n`);

  try {
    const response = await fetch(`${appUrl}/api/admin/prospection`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `next-auth.session-token=${process.env.SESSION_TOKEN || ""}`,
      },
      body: JSON.stringify({ prospects: batch }),
    });

    const result = await response.json();
    console.log("\n📊 Résultat:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

main();
