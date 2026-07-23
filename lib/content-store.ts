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
const DATABASE_READ_TIMEOUT_MS = 5000;
const DATABASE_WRITE_TIMEOUT_MS = 8000;

let sqlClient: NeonQueryFunction<false, false> | null = null;
let sqlClientUrl: string | null = null;
let postgresReady = false;
let lastDatabaseLogAt = 0;

type DatabaseConfig = {
  url: string;
  source: "DATABASE_URL" | "POSTGRES_URL" | "STORAGE_URL";
};

function isProductionBuild() {
  return process.env.NEXT_PHASE === "phase-production-build";
}

function requiresPersistentDatabase() {
  return Boolean(process.env.VERCEL && !isProductionBuild());
}

function canUseLocalFallback() {
  return !requiresPersistentDatabase();
}

function isPostgresUrl(value: string | undefined) {
  return Boolean(value && /^postgres(?:ql)?:\/\//i.test(value));
}

function getDatabaseConfig(): DatabaseConfig | null {
  if (isProductionBuild()) {
    return null;
  }

  if (isPostgresUrl(process.env.DATABASE_URL)) {
    return { url: process.env.DATABASE_URL as string, source: "DATABASE_URL" };
  }

  if (isPostgresUrl(process.env.POSTGRES_URL)) {
    return { url: process.env.POSTGRES_URL as string, source: "POSTGRES_URL" };
  }

  if (isPostgresUrl(process.env.STORAGE_URL)) {
    return { url: process.env.STORAGE_URL as string, source: "STORAGE_URL" };
  }

  return null;
}

function getDatabaseEnvSnapshot() {
  return {
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
    stage: process.env.NEXT_PHASE || "runtime",
    hasDatabaseUrl: isPostgresUrl(process.env.DATABASE_URL),
    hasPostgresUrl: isPostgresUrl(process.env.POSTGRES_URL),
    hasStorageUrl: isPostgresUrl(process.env.STORAGE_URL),
    selectedSource: getDatabaseConfig()?.source || null
  };
}

function sanitizeDatabaseError(error: unknown) {
  if (error instanceof Error) {
    const code = typeof (error as Error & { code?: unknown }).code === "string"
      ? (error as Error & { code: string }).code
      : undefined;
    return { name: error.name, message: error.message, code };
  }

  return { name: "UnknownDatabaseError", message: String(error) };
}

function logDatabaseEvent(stage: string, error?: unknown) {
  const now = Date.now();
  if (now - lastDatabaseLogAt < 30000) {
    return;
  }

  lastDatabaseLogAt = now;
  const payload = {
    databaseStage: stage,
    ...getDatabaseEnvSnapshot(),
    ...(error ? { error: sanitizeDatabaseError(error) } : {})
  };

  console.warn("[database]", payload);
}

function getSql() {
  const config = getDatabaseConfig();
  if (!config) {
    logDatabaseEvent("resolve-config");
    throw new Error("DATABASE_URL is missing. Connect Neon to this Vercel project so persistent admin storage can use PostgreSQL.");
  }

  if (!sqlClient || sqlClientUrl !== config.url) {
    sqlClient = neon(config.url);
    sqlClientUrl = config.url;
    postgresReady = false;
  }

  return sqlClient;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> {
  let timeout: NodeJS.Timeout | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<null>((resolve) => {
        timeout = setTimeout(() => resolve(null), timeoutMs);
      })
    ]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export function isDatabaseConfigured() {
  return Boolean(getDatabaseConfig());
}

export function getContentStorageMode() {
  const config = getDatabaseConfig();
  if (config) {
    return config.source === "DATABASE_URL" ? "Neon PostgreSQL" : `Neon PostgreSQL via ${config.source}`;
  }

  return requiresPersistentDatabase() ? "Neon PostgreSQL required" : "local .data JSON";
}

function createDatabaseSetupError(action: string) {
  return new Error(`${action} requires Neon PostgreSQL. Add DATABASE_URL from the Vercel Neon integration, then redeploy.`);
}

export async function assertDatabaseReady(action: string) {
  if (!getDatabaseConfig() || !(await ensurePostgresTables())) {
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
    postgresReady = false;
    sqlClient = null;
    sqlClientUrl = null;

    logDatabaseEvent("ensure-tables", error);

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
    seo: {
      ...defaultContent.seo,
      ...content.seo,
      keywords: Array.isArray(content.seo?.keywords) ? content.seo.keywords : defaultContent.seo.keywords
    },
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
  if (requiresPersistentDatabase()) {
    throw createDatabaseSetupError("Public content");
  }

  if (isProductionBuild()) {
    return defaultContent;
  }

  try {
    const raw = await readFile(dataFile, "utf8");
    const normalized = normalizeContent(JSON.parse(raw) as Partial<SiteContent>);
    if (JSON.stringify(normalized, null, 2) !== raw.trim()) {
      await writeFile(dataFile, JSON.stringify(normalized, null, 2), "utf8");
    }
    return normalized;
  } catch {
    await mkdir(dataDirectory, { recursive: true });
    await writeFile(dataFile, JSON.stringify(defaultContent, null, 2), "utf8");
    return defaultContent;
  }
}

async function saveLocalContent(content: SiteContent) {
  if (!canUseLocalFallback()) {
    throw createDatabaseSetupError("Persistent admin editing");
  }

  await mkdir(dataDirectory, { recursive: true });
  await writeFile(dataFile, JSON.stringify(content, null, 2), "utf8");
}

export async function getSiteContent(): Promise<SiteContent> {
  if (!getDatabaseConfig()) {
    if (!canUseLocalFallback()) {
      throw createDatabaseSetupError("Public content");
    }
    return readLocalContent();
  }

  const databaseReady = await withTimeout(ensurePostgresTables(), DATABASE_READ_TIMEOUT_MS);
  if (!databaseReady) {
    if (!canUseLocalFallback()) {
      logDatabaseEvent("read-timeout");
      throw createDatabaseSetupError("Public content");
    }
    return readLocalContent();
  }

  try {
    const rows = await withTimeout(getSql()`SELECT content FROM site_content WHERE id = 1 LIMIT 1`, DATABASE_READ_TIMEOUT_MS);
    if (!rows) {
      postgresReady = false;
      sqlClient = null;
      sqlClientUrl = null;
      if (!canUseLocalFallback()) {
        logDatabaseEvent("read-content-timeout");
        throw createDatabaseSetupError("Public content");
      }
      return readLocalContent();
    }

    const firstRow = rows[0];

    if (!firstRow) {
      await saveSiteContent(defaultContent);
      return defaultContent;
    }

    return normalizeContent(parseContentValue(firstRow.content));
  } catch (error) {
    postgresReady = false;
    sqlClient = null;
    sqlClientUrl = null;

    logDatabaseEvent("read-content", error);

    if (!canUseLocalFallback()) {
      throw createDatabaseSetupError("Public content");
    }

    return readLocalContent();
  }
}

export async function saveSiteContent(content: SiteContent) {
  const normalized = validateSiteContent(normalizeContent(content));

  if (!getDatabaseConfig()) {
    if (!canUseLocalFallback()) {
      throw createDatabaseSetupError("Persistent admin editing");
    }
    await saveLocalContent(normalized);
    return normalized;
  }

  if (!(await ensurePostgresTables())) {
    if (!canUseLocalFallback()) {
      throw createDatabaseSetupError("Persistent admin editing");
    }
    await saveLocalContent(normalized);
    return normalized;
  }

  try {
    const saved = await withTimeout(getSql()`
      INSERT INTO site_content (id, content, updated_at)
      VALUES (1, ${JSON.stringify(normalized)}::jsonb, NOW())
      ON CONFLICT (id) DO UPDATE
      SET content = EXCLUDED.content,
          updated_at = NOW()
    `, DATABASE_WRITE_TIMEOUT_MS);
    if (!saved) {
      throw new Error("Timed out while saving site content.");
    }
  } catch (error) {
    postgresReady = false;
    sqlClient = null;
    sqlClientUrl = null;

    logDatabaseEvent("save-content", error);

    if (!canUseLocalFallback()) {
      throw createDatabaseSetupError("Persistent admin editing");
    }

    await saveLocalContent(normalized);
  }

  return normalized;
}

// Reads auxiliary JSON documents (chatbot settings, analytics, etc.) from the
// same managed database used by the admin builder.
export async function getStoredJson<T>(key: string): Promise<T | null> {
  if (!getDatabaseConfig() || !(await ensurePostgresTables())) {
    if (!canUseLocalFallback()) {
      throw createDatabaseSetupError(`${key} storage`);
    }
    return null;
  }

  try {
    const rows = await getSql()`SELECT value FROM app_data WHERE data_key = ${key} LIMIT 1`;
    const value = rows[0]?.value;
    if (!value) return null;
    return (typeof value === "string" ? JSON.parse(value) : value) as T;
  } catch (error) {
    postgresReady = false;
    sqlClient = null;
    sqlClientUrl = null;
    logDatabaseEvent(`read-json:${key}`, error);
    if (!canUseLocalFallback()) {
      throw createDatabaseSetupError(`${key} storage`);
    }
    return null;
  }
}

// Returns false during local development without Neon so callers can retain
// their checked-in JSON fallback. Vercel callers should treat false as a setup error.
export async function saveStoredJson(key: string, value: unknown): Promise<boolean> {
  if (!getDatabaseConfig() || !(await ensurePostgresTables())) {
    if (!canUseLocalFallback()) {
      throw createDatabaseSetupError(`${key} storage`);
    }
    return false;
  }

  try {
    const saved = await withTimeout(getSql()`
      INSERT INTO app_data (data_key, value, updated_at)
      VALUES (${key}, ${JSON.stringify(value)}::jsonb, NOW())
      ON CONFLICT (data_key) DO UPDATE
      SET value = EXCLUDED.value,
          updated_at = NOW()
    `, DATABASE_WRITE_TIMEOUT_MS);
    if (!saved) {
      throw new Error(`Timed out while saving ${key}.`);
    }
    return true;
  } catch (error) {
    postgresReady = false;
    sqlClient = null;
    sqlClientUrl = null;
    logDatabaseEvent(`save-json:${key}`, error);
    if (!canUseLocalFallback()) {
      throw createDatabaseSetupError(`${key} storage`);
    }
    return false;
  }
}
