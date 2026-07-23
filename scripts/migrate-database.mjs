import { neon } from "@neondatabase/serverless";
import { existsSync, readFileSync } from "fs";

function loadLocalEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]] !== undefined) {
      continue;
    }

    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}

loadLocalEnvFile(".env.local");
loadLocalEnvFile(".env");

function isPostgresUrl(value) {
  return Boolean(value && /^postgres(?:ql)?:\/\//i.test(value));
}

function resolveDatabaseUrl() {
  if (isPostgresUrl(process.env.DATABASE_URL)) {
    return { url: process.env.DATABASE_URL, source: "DATABASE_URL" };
  }

  if (isPostgresUrl(process.env.POSTGRES_URL)) {
    return { url: process.env.POSTGRES_URL, source: "POSTGRES_URL" };
  }

  if (isPostgresUrl(process.env.STORAGE_URL)) {
    return { url: process.env.STORAGE_URL, source: "STORAGE_URL" };
  }

  return null;
}

const config = resolveDatabaseUrl();

console.log("[database:migrate]", {
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "local",
  hasDatabaseUrl: isPostgresUrl(process.env.DATABASE_URL),
  hasPostgresUrl: isPostgresUrl(process.env.POSTGRES_URL),
  hasStorageUrl: isPostgresUrl(process.env.STORAGE_URL),
  selectedSource: config?.source || null
});

if (!config) {
  console.error("No PostgreSQL connection URL found. Set DATABASE_URL first, or POSTGRES_URL/STORAGE_URL as a fallback.");
  process.exit(1);
}

const sql = neon(config.url);

await sql`
  CREATE TABLE IF NOT EXISTS site_content (
    id INTEGER PRIMARY KEY,
    content JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS app_data (
    data_key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

const siteContentRows = await sql`SELECT COUNT(*)::int AS count FROM site_content`;
const appDataRows = await sql`SELECT COUNT(*)::int AS count FROM app_data`;

console.log("[database:migrate] verified", {
  siteContentRows: siteContentRows[0]?.count ?? 0,
  appDataRows: appDataRows[0]?.count ?? 0
});
