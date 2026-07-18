import "server-only";

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { defaultContent } from "@/lib/default-content";
import { defaultBuilder } from "@/lib/builder-defaults";
import { validateSiteContent } from "@/lib/validate";
import type { SiteContent } from "@/types/site-content";

const dataDirectory = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDirectory, "site-content.json");

let sqlClient: NeonQueryFunction<false, false> | null = null;
let postgresReady = false;
let postgresUnavailable = false;
let postgresWarningShown = false;

function isProductionBuild() {
  return process.env.NEXT_PHASE === "phase-production-build";
}

function hasDatabaseConfig() {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return false;
  }

  return Boolean(process.env.DATABASE_URL && !postgresUnavailable);
}

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing. Connect Neon to this Vercel project so persistent admin storage can use PostgreSQL.");
  }

  if (!sqlClient) {
    sqlClient = neon(process.env.DATABASE_URL);
  }

  return sqlClient;
}

export function isDatabaseConfigured() {
  return hasDatabaseConfig();
}

function createDatabaseSetupError(action: string) {
  return new Error(`${action} requires Neon PostgreSQL. Add DATABASE_URL from the Vercel Neon integration, then redeploy.`);
}

export async function assertDatabaseReady(action: string) {
  if (!hasDatabaseConfig() || !(await ensurePostgresTables())) {
    throw createDatabaseSetupError(action);
  }
}

async function ensurePostgresTables() {
  if (postgresReady) {
    return true;
  }

  try {
    const sql = getSql();
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

    postgresReady = true;
    return true;
  } catch (error) {
    postgresUnavailable = true;
    postgresReady = false;
    sqlClient = null;

    if (!postgresWarningShown) {
      postgresWarningShown = true;
      console.warn("Neon PostgreSQL is configured but unavailable. Local development can fall back to .data; Vercel requires a working DATABASE_URL.", error);
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
  if (process.env.VERCEL || isProductionBuild()) {
    return defaultContent;
  }

  try {
    const raw = await readFile(dataFile, "utf8");
    return normalizeContent(JSON.parse(raw) as Partial<SiteContent>);
  } catch {
    await mkdir(dataDirectory, { recursive: true });
    await writeFile(dataFile, JSON.stringify(defaultContent, null, 2), "utf8");
    return defaultContent;
  }
}

async function saveLocalContent(content: SiteContent) {
  if (process.env.VERCEL) {
    throw createDatabaseSetupError("Persistent admin editing");
  }

  await mkdir(dataDirectory, { recursive: true });
  await writeFile(dataFile, JSON.stringify(content, null, 2), "utf8");
}

export async function getSiteContent(): Promise<SiteContent> {
  if (!hasDatabaseConfig()) {
    return readLocalContent();
  }

  if (!(await ensurePostgresTables())) {
    return readLocalContent();
  }

  try {
    const rows = await getSql()`SELECT content FROM site_content WHERE id = 1 LIMIT 1`;
    const firstRow = rows[0];

    if (!firstRow) {
      await saveSiteContent(defaultContent);
      return defaultContent;
    }

    return normalizeContent(parseContentValue(firstRow.content));
  } catch (error) {
    postgresUnavailable = true;
    postgresReady = false;
    sqlClient = null;

    if (!postgresWarningShown) {
      postgresWarningShown = true;
      console.warn("Could not read from Neon PostgreSQL. Local development can fall back to .data; Vercel requires a working DATABASE_URL.", error);
    }

    return readLocalContent();
  }
}

export async function saveSiteContent(content: SiteContent) {
  const normalized = validateSiteContent(normalizeContent(content));

  if (!hasDatabaseConfig()) {
    await saveLocalContent(normalized);
    return normalized;
  }

  if (!(await ensurePostgresTables())) {
    await saveLocalContent(normalized);
    return normalized;
  }

  try {
    await getSql()`
      INSERT INTO site_content (id, content, updated_at)
      VALUES (1, ${JSON.stringify(normalized)}::jsonb, NOW())
      ON CONFLICT (id) DO UPDATE
      SET content = EXCLUDED.content,
          updated_at = NOW()
    `;
  } catch (error) {
    postgresUnavailable = true;
    postgresReady = false;
    sqlClient = null;

    if (!postgresWarningShown) {
      postgresWarningShown = true;
      console.warn("Could not save to Neon PostgreSQL. Local development can use .data storage; Vercel requires Neon DATABASE_URL.", error);
    }

    await saveLocalContent(normalized);
  }

  return normalized;
}

// Reads auxiliary JSON documents (chatbot settings, analytics, etc.) from the
// same managed database used by the admin builder.
export async function getStoredJson<T>(key: string): Promise<T | null> {
  if (!hasDatabaseConfig() || !(await ensurePostgresTables())) {
    return null;
  }

  try {
    const rows = await getSql()`SELECT value FROM app_data WHERE data_key = ${key} LIMIT 1`;
    const value = rows[0]?.value;
    if (!value) return null;
    return (typeof value === "string" ? JSON.parse(value) : value) as T;
  } catch (error) {
    console.warn(`Could not read ${key} from the production database.`, error);
    return null;
  }
}

// Returns false during local development without Neon so callers can retain
// their checked-in JSON fallback. Vercel callers should treat false as a setup error.
export async function saveStoredJson(key: string, value: unknown): Promise<boolean> {
  if (!hasDatabaseConfig() || !(await ensurePostgresTables())) {
    return false;
  }

  await getSql()`
    INSERT INTO app_data (data_key, value, updated_at)
    VALUES (${key}, ${JSON.stringify(value)}::jsonb, NOW())
    ON CONFLICT (data_key) DO UPDATE
    SET value = EXCLUDED.value,
        updated_at = NOW()
  `;
  return true;
}
