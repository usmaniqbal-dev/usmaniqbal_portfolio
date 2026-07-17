import "server-only";

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import mysql from "mysql2/promise";
import { defaultContent } from "@/lib/default-content";
import { defaultBuilder } from "@/lib/builder-defaults";
import { validateSiteContent } from "@/lib/validate";
import type { SiteContent } from "@/types/site-content";

const dataDirectory = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDirectory, "site-content.json");

let pool: mysql.Pool | null = null;
let mysqlReady = false;
let mysqlUnavailable = false;
let mysqlWarningShown = false;

function hasMysqlConfig() {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return false;
  }

  return Boolean(
    (process.env.DATABASE_URL || (process.env.MYSQL_HOST && process.env.MYSQL_USER && process.env.MYSQL_DATABASE)) &&
    !mysqlUnavailable
  );
}

function getPool() {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null;
    const urlSslMode = databaseUrl?.searchParams.get("ssl-mode")?.toLowerCase();
    const usesSsl = process.env.MYSQL_SSL === "true" || Boolean(urlSslMode && urlSslMode !== "disabled");

    pool = mysql.createPool({
      host: databaseUrl?.hostname || process.env.MYSQL_HOST,
      port: Number(databaseUrl?.port || process.env.MYSQL_PORT || 3306),
      user: databaseUrl ? decodeURIComponent(databaseUrl.username) : process.env.MYSQL_USER,
      password: databaseUrl ? decodeURIComponent(databaseUrl.password) : process.env.MYSQL_PASSWORD,
      database: databaseUrl ? decodeURIComponent(databaseUrl.pathname.replace(/^\//, "")) : process.env.MYSQL_DATABASE,
      ssl: usesSsl ? {} : undefined,
      waitForConnections: true,
      connectionLimit: 4,
      enableKeepAlive: true,
      namedPlaceholders: true
    });
  }

  return pool;
}

async function ensureMysqlTable() {
  if (mysqlReady) {
    return true;
  }

  try {
    await getPool().execute(`
      CREATE TABLE IF NOT EXISTS site_content (
        id INT PRIMARY KEY,
        content JSON NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await getPool().execute(`
      CREATE TABLE IF NOT EXISTS app_data (
        data_key VARCHAR(100) PRIMARY KEY,
        value JSON NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    mysqlReady = true;
    return true;
  } catch (error) {
    mysqlUnavailable = true;
    mysqlReady = false;
    pool = null;

    if (!mysqlWarningShown) {
      mysqlWarningShown = true;
      console.warn("MySQL is configured but unavailable. Falling back to local .data/site-content.json storage.", error);
    }

    return false;
  }
}

function parseContentValue(value: unknown): Partial<SiteContent> {
  if (!value) {
    return {};
  }

  if (typeof value === "string") {
    return JSON.parse(value) as Partial<SiteContent>;
  }

  return value as Partial<SiteContent>;
}

function normalizeContent(content: Partial<SiteContent>): SiteContent {
  const builder = content.builder || defaultBuilder;

  return {
    ...defaultContent,
    ...content,
    home: { ...defaultContent.home, ...content.home },
    about: { ...defaultContent.about, ...content.about },
    skills: Array.isArray(content.skills) ? content.skills : defaultContent.skills,
    services: Array.isArray(content.services) ? content.services : defaultContent.services,
    projects: Array.isArray(content.projects) ? content.projects : defaultContent.projects,
    contact: { ...defaultContent.contact, ...content.contact },
    socials: Array.isArray(content.socials) ? content.socials : defaultContent.socials,
    theme: { ...defaultContent.theme, ...content.theme },
    sliders: { ...defaultContent.sliders, ...content.sliders },
    builder: {
      ...defaultBuilder,
      ...builder,
      settings: { ...defaultBuilder.settings, ...builder.settings },
      themes: Array.isArray(builder.themes) && builder.themes.length ? builder.themes : defaultBuilder.themes,
      templates: Array.isArray(builder.templates) && builder.templates.length ? builder.templates : defaultBuilder.templates,
      pages: Array.isArray(builder.pages) && builder.pages.length ? builder.pages : defaultBuilder.pages,
      media: Array.isArray(builder.media) ? builder.media : defaultBuilder.media,
      aiContent: Array.isArray(builder.aiContent) ? builder.aiContent : defaultBuilder.aiContent,
      adminUsers: Array.isArray(builder.adminUsers) ? builder.adminUsers : defaultBuilder.adminUsers,
      versionHistory: Array.isArray(builder.versionHistory) ? builder.versionHistory : defaultBuilder.versionHistory
    }
  };
}

async function readLocalContent() {
  try {
    const raw = await readFile(dataFile, "utf8");
    return normalizeContent(JSON.parse(raw) as Partial<SiteContent>);
  } catch {
    // Vercel Functions have no persistent project filesystem. The checked-in
    // defaults keep the public site available until a production DB is linked.
    if (process.env.VERCEL || process.env.NEXT_PHASE === "phase-production-build") {
      return defaultContent;
    }

    await mkdir(dataDirectory, { recursive: true });
    await writeFile(dataFile, JSON.stringify(defaultContent, null, 2), "utf8");
    return defaultContent;
  }
}

async function saveLocalContent(content: SiteContent) {
  if (process.env.VERCEL) {
    throw new Error("Persistent admin editing requires DATABASE_URL or remote MYSQL_* variables on Vercel.");
  }

  await mkdir(dataDirectory, { recursive: true });
  await writeFile(dataFile, JSON.stringify(content, null, 2), "utf8");
}

export async function getSiteContent(): Promise<SiteContent> {
  if (!hasMysqlConfig()) {
    return readLocalContent();
  }

  if (!(await ensureMysqlTable())) {
    return readLocalContent();
  }

  try {
    const [rows] = await getPool().query<mysql.RowDataPacket[]>("SELECT content FROM site_content WHERE id = 1 LIMIT 1");
    const firstRow = rows[0];

    if (!firstRow) {
      await saveSiteContent(defaultContent);
      return defaultContent;
    }

    return normalizeContent(parseContentValue(firstRow.content));
  } catch (error) {
    mysqlUnavailable = true;
    mysqlReady = false;
    pool = null;

    if (!mysqlWarningShown) {
      mysqlWarningShown = true;
      console.warn("Could not read from MySQL. Falling back to local .data/site-content.json storage.", error);
    }

    return readLocalContent();
  }
}

export async function saveSiteContent(content: SiteContent) {
  const normalized = validateSiteContent(normalizeContent(content));

  if (!hasMysqlConfig()) {
    await saveLocalContent(normalized);
    return normalized;
  }

  if (!(await ensureMysqlTable())) {
    await saveLocalContent(normalized);
    return normalized;
  }

  try {
    await getPool().execute(
      `INSERT INTO site_content (id, content)
       VALUES (1, :content)
       ON DUPLICATE KEY UPDATE content = :content`,
      { content: JSON.stringify(normalized) }
    );
  } catch (error) {
    mysqlUnavailable = true;
    mysqlReady = false;
    pool = null;

    if (!mysqlWarningShown) {
      mysqlWarningShown = true;
      console.warn("Could not save to MySQL. Local development will use .data storage; Vercel requires a remote database.", error);
    }

    await saveLocalContent(normalized);
  }

  return normalized;
}

// Reads auxiliary JSON documents (chatbot settings, analytics, etc.) from the
// same managed database used by the admin builder.
export async function getStoredJson<T>(key: string): Promise<T | null> {
  if (!hasMysqlConfig() || !(await ensureMysqlTable())) {
    return null;
  }

  try {
    const [rows] = await getPool().query<mysql.RowDataPacket[]>("SELECT value FROM app_data WHERE data_key = ? LIMIT 1", [key]);
    const value = rows[0]?.value;
    if (!value) return null;
    return (typeof value === "string" ? JSON.parse(value) : value) as T;
  } catch (error) {
    console.warn(`Could not read ${key} from the production database.`, error);
    return null;
  }
}

// Returns false during local development without MySQL so callers can retain
// their checked-in JSON fallback. Vercel callers should treat false as a setup error.
export async function saveStoredJson(key: string, value: unknown): Promise<boolean> {
  if (!hasMysqlConfig() || !(await ensureMysqlTable())) {
    return false;
  }

  await getPool().execute(
    `INSERT INTO app_data (data_key, value)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE value = VALUES(value)`,
    [key, JSON.stringify(value)]
  );
  return true;
}
