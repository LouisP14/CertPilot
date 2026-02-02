import pg from "pg";
const { Client } = pg;

const client = new Client({
  host: "hopper.proxy.rlwy.net",
  port: 21710,
  user: "postgres",
  password: "LHESfmvQInTIpDtXIwzhjhQDYphPsGDc",
  database: "railway",
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();

  const users = await client.query(
    "select email, \"companyId\" from \"User\" where email in ('admin@certpilot.fr','demo@certpilot.fr')",
  );
  console.log("USERS", users.rows);

  const audit = await client.query(
    'select "companyId", count(*)::int as count from "AuditLog" group by "companyId" order by count desc',
  );
  console.log("AUDIT", audit.rows);

  const refs = await client.query(
    'select "companyId", count(*)::int as count from "ReferenceData" group by "companyId" order by count desc',
  );
  console.log("REFS", refs.rows);

  const recent = await client.query(
    'select id, action, "entityType", "entityName", "companyId", "userEmail" from "AuditLog" order by "createdAt" desc limit 5',
  );
  console.log("RECENT", recent.rows);

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
