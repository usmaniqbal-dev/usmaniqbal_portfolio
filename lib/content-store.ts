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

type D1Like = {
  prepare: (query: string) => {
    bind: (...args: unknown[]) => {
      first: <T = Record<string, unknown>>() => Promise<T | null>;
      all: <T = Record<string, unknown>>() => Promise<{ results: T[] }>;
      run: () => Promise<{ success: boolean }>;
    };
    first: <T = Record<string, unknown>>() => Promise<T | null>;
    run: () => Promise<{ success: boolean }>;
  };
};

async function getD1Database(): Promise<D1Like | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx?.env as Record<string, unknown> | undefined;
    return (env?.portfolio_db as D1Like) || (env?.DB as D1Like) || null;
  } catch {
    return null;
  }
}

export function isDatabaseConfigured() {
  return true; // Cloudflare D1 or fallback is always configured
}

export function getContentStorageMode() {
  const config = getDatabaseConfig();
  if (config) {
    return config.source === "DATABASE_URL" ? "Neon PostgreSQL" : `Neon PostgreSQL via ${config.source}`;
  }

  return "Cloudflare D1 / Persistent Storage";
}

function createDatabaseSetupError(action: string) {
  return new Error(`${action} database error. Check Cloudflare D1 configuration.`);
}

export async function assertDatabaseReady(_action?: string) {
  const d1 = await getD1Database();
  if (d1) return;
  if (getDatabaseConfig()) {
    await ensurePostgresTables();
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
    projects: (() => {
      // Only use defaultContent.projects when there is NO saved content at all
      // (first-run scenario). If projects were explicitly saved (even as an
      // empty array after all have been deleted), trust what was persisted.
      if (!Array.isArray(content.projects)) {
        return defaultContent.projects;
      }

      // Content has been explicitly saved — honour it exactly.
      // Only merge project-level fields from defaults for projects that STILL
      // exist in the saved list (e.g. to back-fill new fields added later).
      if (content.projects.length === 0) {
        return [];
      }

      const defaultMap = new Map(defaultContent.projects.map((p) => [p.id, p]));

      return content.projects.map((savedProject) => {
        const defProject = defaultMap.get(savedProject.id);
        if (!defProject) {
          // Custom project added by admin — return as-is
          return savedProject;
        }
        // Back-fill any missing fields from defaults, but trust saved data first
        return {
          ...defProject,
          ...savedProject,
          image: savedProject.image || defProject.image,
          category: savedProject.category || defProject.category
        };
      });
    })(),
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
    return normalized;
  } catch {
    try {
      await mkdir(dataDirectory, { recursive: true });
      await writeFile(dataFile, JSON.stringify(defaultContent, null, 2), "utf8");
    } catch {
      // Running in environment without filesystem access (e.g. edge worker)
    }
    return defaultContent;
  }
}

async function saveLocalContent(content: SiteContent) {
  if (!canUseLocalFallback()) {
    throw createDatabaseSetupError("Persistent admin editing");
  }

  try {
    await mkdir(dataDirectory, { recursive: true });
    await writeFile(dataFile, JSON.stringify(content, null, 2), "utf8");
  } catch (error) {
    console.warn("[content-store] Filesystem fallback unavailable in this runtime:", error);
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  const d1 = await getD1Database();
  if (d1) {
    try {
      const row = await d1.prepare("SELECT content FROM site_content WHERE id = 1 LIMIT 1").first();
      if (row && row.content) {
        return normalizeContent(parseContentValue(row.content));
      }
      const local = await readLocalContent();
      await d1.prepare("INSERT OR REPLACE INTO site_content (id, content, updated_at) VALUES (1, ?, CURRENT_TIMESTAMP)").bind(JSON.stringify(local)).run();
      return local;
    } catch (error) {
      logDatabaseEvent("d1-read-content", error);
    }
  }

  if (!getDatabaseConfig()) {
    return readLocalContent();
  }

  const databaseReady = await withTimeout(ensurePostgresTables(), DATABASE_READ_TIMEOUT_MS);
  if (!databaseReady) {
    return readLocalContent();
  }

  try {
    const rows = await withTimeout(getSql()`SELECT content FROM site_content WHERE id = 1 LIMIT 1`, DATABASE_READ_TIMEOUT_MS);
    if (!rows || !rows[0]) {
      return readLocalContent();
    }

    return normalizeContent(parseContentValue(rows[0].content));
  } catch (error) {
    postgresReady = false;
    sqlClient = null;
    sqlClientUrl = null;
    logDatabaseEvent("read-content", error);
    return readLocalContent();
  }
}

export async function saveSiteContent(content: SiteContent) {
  const normalized = validateSiteContent(normalizeContent(content));

  const d1 = await getD1Database();
  if (d1) {
    try {
      await d1.prepare("INSERT OR REPLACE INTO site_content (id, content, updated_at) VALUES (1, ?, CURRENT_TIMESTAMP)").bind(JSON.stringify(normalized)).run();
      return normalized;
    } catch (error) {
      logDatabaseEvent("d1-save-content", error);
    }
  }

  if (!getDatabaseConfig()) {
    await saveLocalContent(normalized);
    return normalized;
  }

  if (!(await ensurePostgresTables())) {
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
    await saveLocalContent(normalized);
  }

  return normalized;
}

// Reads auxiliary JSON documents (chatbot settings, analytics, etc.) from the
// same managed database used by the admin builder.
export async function getStoredJson<T>(key: string): Promise<T | null> {
  const d1 = await getD1Database();
  if (d1) {
    try {
      const row = await d1.prepare("SELECT value FROM app_data WHERE data_key = ? LIMIT 1").bind(key).first();
      if (row && row.value) {
        return (typeof row.value === "string" ? JSON.parse(row.value) : row.value) as T;
      }
      return null;
    } catch (error) {
      logDatabaseEvent(`d1-read-json:${key}`, error);
    }
  }

  if (!getDatabaseConfig() || !(await ensurePostgresTables())) {
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
    return null;
  }
}

// Persists auxiliary JSON documents to database
export async function saveStoredJson(key: string, value: unknown): Promise<boolean> {
  const d1 = await getD1Database();
  if (d1) {
    try {
      await d1.prepare("INSERT OR REPLACE INTO app_data (data_key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)").bind(key, JSON.stringify(value)).run();
      return true;
    } catch (error) {
      logDatabaseEvent(`d1-save-json:${key}`, error);
    }
  }

  if (!getDatabaseConfig() || !(await ensurePostgresTables())) {
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
    return Boolean(saved);
  } catch (error) {
    postgresReady = false;
    sqlClient = null;
    sqlClientUrl = null;
    logDatabaseEvent(`save-json:${key}`, error);
    return false;
  }
}
