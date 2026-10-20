import "server-only";

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import type { VisitorFilter, VisitorLogInput, VisitorRecord, VisitorStats } from "@/types/visitor";

const dataDirectory = path.join(process.cwd(), ".data");
const localVisitorsFile = path.join(dataDirectory, "visitors.json");

let sqlClient: NeonQueryFunction<false, false> | null = null;
let sqlClientUrl: string | null = null;
let visitorTableReady = false;

// Recent in-memory requests cache to prevent rapid duplicate inserts (e.g. React StrictMode)
const recentTrackCache = new Map<string, number>();

function isPostgresUrl(value: string | undefined): boolean {
  return Boolean(value && /^postgres(?:ql)?:\/\//i.test(value));
}

function getDatabaseUrl(): string | null {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return null;
  }
  if (isPostgresUrl(process.env.DATABASE_URL)) return process.env.DATABASE_URL as string;
  if (isPostgresUrl(process.env.POSTGRES_URL)) return process.env.POSTGRES_URL as string;
  if (isPostgresUrl(process.env.STORAGE_URL)) return process.env.STORAGE_URL as string;
  return null;
}

function getSql(): NeonQueryFunction<false, false> | null {
  const url = getDatabaseUrl();
  if (!url) return null;

  if (!sqlClient || sqlClientUrl !== url) {
    sqlClient = neon(url);
    sqlClientUrl = url;
    visitorTableReady = false;
  }

  return sqlClient;
}

type D1Like = {
  prepare: (query: string) => {
    bind: (...args: unknown[]) => {
      first: <T = Record<string, unknown>>() => Promise<T | null>;
      all: <T = Record<string, unknown>>() => Promise<{ results: T[] }>;
      run: () => Promise<{ success: boolean; meta?: { changes?: number } }>;
    };
    first: <T = Record<string, unknown>>() => Promise<T | null>;
    all: <T = Record<string, unknown>>() => Promise<{ results: T[] }>;
    run: () => Promise<{ success: boolean; meta?: { changes?: number } }>;
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

export async function ensureVisitorTables(): Promise<boolean> {
  if (visitorTableReady) return true;

  const d1 = await getD1Database();
  if (d1) {
    try {
      await d1.prepare(`
        CREATE TABLE IF NOT EXISTS visitor_analytics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          visitor_id TEXT NOT NULL,
          session_id TEXT NOT NULL,
          ip TEXT NOT NULL,
          country TEXT,
          region TEXT,
          city TEXT,
          pathname TEXT NOT NULL,
          referrer TEXT,
          user_agent TEXT,
          browser_name TEXT,
          browser_version TEXT,
          os_name TEXT,
          os_version TEXT,
          device_type TEXT,
          screen_resolution TEXT,
          language TEXT,
          timezone TEXT,
          is_returning INTEGER DEFAULT 0,
          visited_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
        )
      `).run();
      await d1.prepare("CREATE INDEX IF NOT EXISTS idx_va_visited_at ON visitor_analytics (visited_at DESC)").run();
      await d1.prepare("CREATE INDEX IF NOT EXISTS idx_va_visitor_id ON visitor_analytics (visitor_id)").run();
      await d1.prepare("CREATE INDEX IF NOT EXISTS idx_va_session_id ON visitor_analytics (session_id)").run();
      await d1.prepare("CREATE INDEX IF NOT EXISTS idx_va_pathname ON visitor_analytics (pathname)").run();
      await d1.prepare("CREATE INDEX IF NOT EXISTS idx_va_country ON visitor_analytics (country)").run();
      visitorTableReady = true;
      return true;
    } catch (d1Err) {
      console.warn("[visitor-store] D1 ensure tables error:", d1Err);
    }
  }

  const sql = getSql();
  if (!sql) return false;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS visitor_analytics (
        id BIGSERIAL PRIMARY KEY,
        visitor_id VARCHAR(64) NOT NULL,
        session_id VARCHAR(64) NOT NULL,
        ip VARCHAR(64) NOT NULL,
        country VARCHAR(100),
        region VARCHAR(100),
        city VARCHAR(100),
        pathname VARCHAR(500) NOT NULL,
        referrer VARCHAR(1000),
        user_agent TEXT,
        browser_name VARCHAR(100),
        browser_version VARCHAR(50),
        os_name VARCHAR(100),
        os_version VARCHAR(50),
        device_type VARCHAR(50),
        screen_resolution VARCHAR(50),
        language VARCHAR(50),
        timezone VARCHAR(100),
        is_returning BOOLEAN DEFAULT FALSE,
        visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_va_visited_at ON visitor_analytics (visited_at DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_va_visitor_id ON visitor_analytics (visitor_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_va_session_id ON visitor_analytics (session_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_va_pathname ON visitor_analytics (pathname);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_va_country ON visitor_analytics (country);`;

    visitorTableReady = true;
    return true;
  } catch (error) {
    console.error("[visitor-store] Failed to ensure tables in Neon:", error);
    visitorTableReady = false;
    return false;
  }
}

// Local file-based fallback for development without database credentials
async function getLocalRecords(): Promise<VisitorRecord[]> {
  try {
    const raw = await readFile(localVisitorsFile, "utf8");
    return JSON.parse(raw) as VisitorRecord[];
  } catch {
    return [];
  }
}

async function saveLocalRecords(records: VisitorRecord[]): Promise<void> {
  try {
    await mkdir(dataDirectory, { recursive: true });
    const trimmed = records.slice(0, 5000);
    await writeFile(localVisitorsFile, JSON.stringify(trimmed, null, 2), "utf8");
  } catch {
    // Filesystem may be unavailable in edge runtimes
  }
}

/**
 * Normalizes visited_at date strings to ISO 8601 UTC for client rendering.
 */
function normalizeDate(val: unknown): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Date) return val.toISOString();
  const str = String(val);
  if (str.includes("T")) return str;
  return str.replace(" ", "T") + "Z";
}

/**
 * Checks in-memory cache to prevent duplicate inserts within a 5-second window.
 */
function isDuplicateRequest(visitorId: string, pathname: string): boolean {
  const key = `${visitorId}:${pathname}`;
  const now = Date.now();
  const lastTime = recentTrackCache.get(key);

  if (lastTime && now - lastTime < 5000) {
    return true;
  }

  recentTrackCache.set(key, now);

  if (recentTrackCache.size > 2000) {
    for (const [k, timestamp] of recentTrackCache.entries()) {
      if (now - timestamp > 30000) {
        recentTrackCache.delete(k);
      }
    }
  }

  return false;
}

/**
 * Persists a new visitor pageview record.
 */
export async function recordVisitor(input: VisitorLogInput): Promise<boolean> {
  const visitorId = input.visitorId.slice(0, 64);
  const pathname = (input.pathname || "/").slice(0, 500);

  if (isDuplicateRequest(visitorId, pathname)) {
    return true;
  }

  const d1 = await getD1Database();
  if (d1) {
    try {
      const prior = await d1
        .prepare("SELECT id FROM visitor_analytics WHERE visitor_id = ? AND session_id != ? LIMIT 1")
        .bind(visitorId, input.sessionId || "")
        .first();
      const isReturning = Boolean(prior);

      await d1
        .prepare(`
          INSERT INTO visitor_analytics (
            visitor_id, session_id, ip, country, region, city, pathname, referrer,
            user_agent, browser_name, browser_version, os_name, os_version, device_type,
            screen_resolution, language, timezone, is_returning, visited_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `)
        .bind(
          visitorId,
          (input.sessionId || "").slice(0, 64),
          (input.ip || "unknown").slice(0, 64),
          (input.country || "").slice(0, 100),
          (input.region || "").slice(0, 100),
          (input.city || "").slice(0, 100),
          pathname,
          (input.referrer || "").slice(0, 1000),
          input.userAgent || "",
          (input.browserName || "").slice(0, 100),
          (input.browserVersion || "").slice(0, 50),
          (input.osName || "").slice(0, 100),
          (input.osVersion || "").slice(0, 50),
          (input.deviceType || "unknown").slice(0, 50),
          (input.screenResolution || "").slice(0, 50),
          (input.language || "").slice(0, 50),
          (input.timezone || "").slice(0, 100),
          isReturning ? 1 : 0
        )
        .run();

      return true;
    } catch (d1Err) {
      console.warn("[visitor-store] D1 insert error:", d1Err);
    }
  }

  const sql = getSql();
  const dbReady = sql ? await ensureVisitorTables() : false;

  let isReturning = false;

  if (dbReady && sql) {
    try {
      const prior = await sql`
        SELECT id FROM visitor_analytics
        WHERE visitor_id = ${visitorId} AND session_id != ${input.sessionId}
        LIMIT 1
      `;
      isReturning = prior.length > 0;

      await sql`
        INSERT INTO visitor_analytics (
          visitor_id, session_id, ip, country, region, city, pathname, referrer,
          user_agent, browser_name, browser_version, os_name, os_version, device_type,
          screen_resolution, language, timezone, is_returning, visited_at
        ) VALUES (
          ${visitorId},
          ${(input.sessionId || "").slice(0, 64)},
          ${(input.ip || "unknown").slice(0, 64)},
          ${(input.country || "").slice(0, 100)},
          ${(input.region || "").slice(0, 100)},
          ${(input.city || "").slice(0, 100)},
          ${pathname},
          ${(input.referrer || "").slice(0, 1000)},
          ${input.userAgent || ""},
          ${(input.browserName || "").slice(0, 100)},
          ${(input.browserVersion || "").slice(0, 50)},
          ${(input.osName || "").slice(0, 100)},
          ${(input.osVersion || "").slice(0, 50)},
          ${(input.deviceType || "unknown").slice(0, 50)},
          ${(input.screenResolution || "").slice(0, 50)},
          ${(input.language || "").slice(0, 50)},
          ${(input.timezone || "").slice(0, 100)},
          ${isReturning},
          NOW()
        )
      `;
      return true;
    } catch (error) {
      console.error("[visitor-store] Error inserting record to Neon:", error);
    }
  }

  // Local fallback
  try {
    const existing = await getLocalRecords();
    isReturning = existing.some((r) => r.visitorId === visitorId && r.sessionId !== input.sessionId);

    const record: VisitorRecord = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      visitorId,
      sessionId: input.sessionId || "",
      ip: input.ip || "unknown",
      country: input.country || "",
      region: input.region || "",
      city: input.city || "",
      pathname,
      referrer: input.referrer || "",
      userAgent: input.userAgent || "",
      browserName: input.browserName || "",
      browserVersion: input.browserVersion || "",
      osName: input.osName || "",
      osVersion: input.osVersion || "",
      deviceType: input.deviceType || "unknown",
      screenResolution: input.screenResolution || "",
      language: input.language || "",
      timezone: input.timezone || "",
      isReturning,
      visitedAt: new Date().toISOString()
    };

    existing.unshift(record);
    await saveLocalRecords(existing);
    return true;
  } catch (error) {
    console.error("[visitor-store] Local fallback recording failed:", error);
    return false;
  }
}

/**
 * Retrieves aggregate visitor statistics.
 */
export async function getVisitorStats(filter?: VisitorFilter): Promise<VisitorStats> {
  const d1 = await getD1Database();
  if (d1) {
    try {
      const startIso = filter?.startDate ? new Date(filter.startDate).toISOString() : null;
      const endIso = filter?.endDate ? new Date(filter.endDate).toISOString() : null;

      let whereClause = "";
      const params: unknown[] = [];
      if (startIso && endIso) {
        whereClause = "WHERE datetime(visited_at) >= datetime(?) AND datetime(visited_at) <= datetime(?)";
        params.push(startIso, endIso);
      } else if (startIso) {
        whereClause = "WHERE datetime(visited_at) >= datetime(?)";
        params.push(startIso);
      } else if (endIso) {
        whereClause = "WHERE datetime(visited_at) <= datetime(?)";
        params.push(endIso);
      }

      const overallQuery = `
        SELECT 
          COUNT(*) AS total_page_views,
          COUNT(DISTINCT session_id) AS total_visits,
          COUNT(DISTINCT visitor_id) AS unique_visitors,
          COUNT(DISTINCT CASE WHEN is_returning = 1 THEN visitor_id END) AS returning_visitors
        FROM visitor_analytics
        ${whereClause}
      `;
      const overallStmt = d1.prepare(overallQuery);
      const overallRow = await (params.length ? overallStmt.bind(...params) : overallStmt).first<{
        total_page_views: number;
        total_visits: number;
        unique_visitors: number;
        returning_visitors: number;
      }>();

      const totalPageViews = Number(overallRow?.total_page_views) || 0;
      const totalVisits = Number(overallRow?.total_visits) || 0;
      const uniqueVisitors = Number(overallRow?.unique_visitors) || 0;
      const returningVisitors = Number(overallRow?.returning_visitors) || 0;
      const returningRate = uniqueVisitors > 0 ? Math.round((returningVisitors / uniqueVisitors) * 100) : 0;

      const topPagesStmt = d1.prepare(`
        SELECT pathname, COUNT(*) AS views
        FROM visitor_analytics
        ${whereClause}
        GROUP BY pathname
        ORDER BY views DESC
        LIMIT 5
      `);
      const topPagesRes = await (params.length ? topPagesStmt.bind(...params) : topPagesStmt).all<{ pathname: string; views: number }>();

      const topCountriesStmt = d1.prepare(`
        SELECT COALESCE(NULLIF(country, ''), 'Unknown') AS country, COUNT(*) AS count
        FROM visitor_analytics
        ${whereClause}
        GROUP BY country
        ORDER BY count DESC
        LIMIT 5
      `);
      const topCountriesRes = await (params.length ? topCountriesStmt.bind(...params) : topCountriesStmt).all<{ country: string; count: number }>();

      const topBrowsersStmt = d1.prepare(`
        SELECT COALESCE(NULLIF(browser_name, ''), 'Unknown') AS browser, COUNT(*) AS count
        FROM visitor_analytics
        ${whereClause}
        GROUP BY browser_name
        ORDER BY count DESC
        LIMIT 5
      `);
      const topBrowsersRes = await (params.length ? topBrowsersStmt.bind(...params) : topBrowsersStmt).all<{ browser: string; count: number }>();

      const topDevicesStmt = d1.prepare(`
        SELECT COALESCE(NULLIF(device_type, ''), 'unknown') AS device, COUNT(*) AS count
        FROM visitor_analytics
        ${whereClause}
        GROUP BY device_type
        ORDER BY count DESC
        LIMIT 5
      `);
      const topDevicesRes = await (params.length ? topDevicesStmt.bind(...params) : topDevicesStmt).all<{ device: string; count: number }>();

      return {
        totalPageViews,
        totalVisits,
        uniqueVisitors,
        returningVisitors,
        returningRate,
        topPages: (topPagesRes?.results || []).map((r) => ({ pathname: String(r.pathname), views: Number(r.views) })),
        topCountries: (topCountriesRes?.results || []).map((r) => ({ country: String(r.country), count: Number(r.count) })),
        topBrowsers: (topBrowsersRes?.results || []).map((r) => ({ browser: String(r.browser), count: Number(r.count) })),
        topDevices: (topDevicesRes?.results || []).map((r) => ({ device: String(r.device), count: Number(r.count) }))
      };
    } catch (d1Err) {
      console.warn("[visitor-store] D1 getVisitorStats error:", d1Err);
    }
  }

  const sql = getSql();
  const dbReady = sql ? await ensureVisitorTables() : false;

  if (dbReady && sql) {
    try {
      const hasDateRange = Boolean(filter?.startDate || filter?.endDate);
      const start = filter?.startDate ? new Date(filter.startDate) : new Date(0);
      const end = filter?.endDate ? new Date(filter.endDate) : new Date("2100-01-01");

      const overall = hasDateRange
        ? await sql`
            SELECT 
              COUNT(*)::int AS total_page_views,
              COUNT(DISTINCT session_id)::int AS total_visits,
              COUNT(DISTINCT visitor_id)::int AS unique_visitors,
              COUNT(DISTINCT CASE WHEN is_returning THEN visitor_id END)::int AS returning_visitors
            FROM visitor_analytics
            WHERE visited_at >= ${start.toISOString()} AND visited_at <= ${end.toISOString()}
          `
        : await sql`
            SELECT 
              COUNT(*)::int AS total_page_views,
              COUNT(DISTINCT session_id)::int AS total_visits,
              COUNT(DISTINCT visitor_id)::int AS unique_visitors,
              COUNT(DISTINCT CASE WHEN is_returning THEN visitor_id END)::int AS returning_visitors
            FROM visitor_analytics
          `;

      const statsRow = overall[0] || {};
      const totalPageViews = Number(statsRow.total_page_views) || 0;
      const totalVisits = Number(statsRow.total_visits) || 0;
      const uniqueVisitors = Number(statsRow.unique_visitors) || 0;
      const returningVisitors = Number(statsRow.returning_visitors) || 0;
      const returningRate = uniqueVisitors > 0 ? Math.round((returningVisitors / uniqueVisitors) * 100) : 0;

      const topPagesRows = hasDateRange
        ? await sql`
            SELECT pathname, COUNT(*)::int AS views
            FROM visitor_analytics
            WHERE visited_at >= ${start.toISOString()} AND visited_at <= ${end.toISOString()}
            GROUP BY pathname
            ORDER BY views DESC
            LIMIT 5
          `
        : await sql`
            SELECT pathname, COUNT(*)::int AS views
            FROM visitor_analytics
            GROUP BY pathname
            ORDER BY views DESC
            LIMIT 5
          `;

      const topCountriesRows = hasDateRange
        ? await sql`
            SELECT COALESCE(NULLIF(country, ''), 'Unknown') AS country, COUNT(*)::int AS count
            FROM visitor_analytics
            WHERE visited_at >= ${start.toISOString()} AND visited_at <= ${end.toISOString()}
            GROUP BY country
            ORDER BY count DESC
            LIMIT 5
          `
        : await sql`
            SELECT COALESCE(NULLIF(country, ''), 'Unknown') AS country, COUNT(*)::int AS count
            FROM visitor_analytics
            GROUP BY country
            ORDER BY count DESC
            LIMIT 5
          `;

      const topBrowsersRows = hasDateRange
        ? await sql`
            SELECT COALESCE(NULLIF(browser_name, ''), 'Unknown') AS browser, COUNT(*)::int AS count
            FROM visitor_analytics
            WHERE visited_at >= ${start.toISOString()} AND visited_at <= ${end.toISOString()}
            GROUP BY browser_name
            ORDER BY count DESC
            LIMIT 5
          `
        : await sql`
            SELECT COALESCE(NULLIF(browser_name, ''), 'Unknown') AS browser, COUNT(*)::int AS count
            FROM visitor_analytics
            GROUP BY browser_name
            ORDER BY count DESC
            LIMIT 5
          `;

      const topDevicesRows = hasDateRange
        ? await sql`
            SELECT COALESCE(NULLIF(device_type, ''), 'unknown') AS device, COUNT(*)::int AS count
            FROM visitor_analytics
            WHERE visited_at >= ${start.toISOString()} AND visited_at <= ${end.toISOString()}
            GROUP BY device_type
            ORDER BY count DESC
            LIMIT 5
          `
        : await sql`
            SELECT COALESCE(NULLIF(device_type, ''), 'unknown') AS device, COUNT(*)::int AS count
            FROM visitor_analytics
            GROUP BY device_type
            ORDER BY count DESC
            LIMIT 5
          `;

      return {
        totalPageViews,
        totalVisits,
        uniqueVisitors,
        returningVisitors,
        returningRate,
        topPages: topPagesRows.map((r) => ({ pathname: String(r.pathname), views: Number(r.views) })),
        topCountries: topCountriesRows.map((r) => ({ country: String(r.country), count: Number(r.count) })),
        topBrowsers: topBrowsersRows.map((r) => ({ browser: String(r.browser), count: Number(r.count) })),
        topDevices: topDevicesRows.map((r) => ({ device: String(r.device), count: Number(r.count) }))
      };
    } catch (error) {
      console.error("[visitor-store] Error reading stats from Neon:", error);
    }
  }

  // Fallback to local storage calculation
  const records = await getLocalRecords();
  const filtered = filterRecordsInMemory(records, filter);

  const totalPageViews = filtered.length;
  const sessions = new Set(filtered.map((r) => r.sessionId).filter(Boolean));
  const totalVisits = sessions.size || totalPageViews;
  const uniqueVisitors = new Set(filtered.map((r) => r.visitorId)).size;
  const returningVisitors = new Set(filtered.filter((r) => r.isReturning).map((r) => r.visitorId)).size;
  const returningRate = uniqueVisitors > 0 ? Math.round((returningVisitors / uniqueVisitors) * 100) : 0;

  const pageCountMap = new Map<string, number>();
  const countryCountMap = new Map<string, number>();
  const browserCountMap = new Map<string, number>();
  const deviceCountMap = new Map<string, number>();

  for (const r of filtered) {
    pageCountMap.set(r.pathname, (pageCountMap.get(r.pathname) || 0) + 1);
    const country = r.country || "Unknown";
    countryCountMap.set(country, (countryCountMap.get(country) || 0) + 1);
    const browser = r.browserName || "Unknown";
    browserCountMap.set(browser, (browserCountMap.get(browser) || 0) + 1);
    const device = r.deviceType || "unknown";
    deviceCountMap.set(device, (deviceCountMap.get(device) || 0) + 1);
  }

  return {
    totalPageViews,
    totalVisits,
    uniqueVisitors,
    returningVisitors,
    returningRate,
    topPages: Array.from(pageCountMap.entries())
      .map(([pathname, views]) => ({ pathname, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5),
    topCountries: Array.from(countryCountMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    topBrowsers: Array.from(browserCountMap.entries())
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    topDevices: Array.from(deviceCountMap.entries())
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  };
}

/**
 * Filter helper for memory/fallback records.
 */
function filterRecordsInMemory(records: VisitorRecord[], filter?: VisitorFilter): VisitorRecord[] {
  let result = records;

  if (filter?.startDate) {
    const start = new Date(filter.startDate).getTime();
    result = result.filter((r) => new Date(r.visitedAt).getTime() >= start);
  }

  if (filter?.endDate) {
    const end = new Date(filter.endDate).getTime();
    result = result.filter((r) => new Date(r.visitedAt).getTime() <= end);
  }

  if (filter?.search) {
    const q = filter.search.toLowerCase().trim();
    result = result.filter(
      (r) =>
        r.ip.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.pathname.toLowerCase().includes(q) ||
        r.browserName.toLowerCase().includes(q) ||
        r.osName.toLowerCase().includes(q) ||
        r.deviceType.toLowerCase().includes(q) ||
        r.referrer.toLowerCase().includes(q)
    );
  }

  return result;
}

/**
 * Retrieves paginated visitor records.
 */
export async function getVisitorRecords(filter: VisitorFilter): Promise<{ records: VisitorRecord[]; total: number }> {
  const page = Math.max(1, Number(filter.page) || 1);
  const limit = Math.min(100, Math.max(5, Number(filter.limit) || 25));
  const offset = (page - 1) * limit;

  const d1 = await getD1Database();
  if (d1) {
    try {
      const search = filter.search?.trim();
      const startIso = filter.startDate ? new Date(filter.startDate).toISOString() : null;
      const endIso = filter.endDate ? new Date(filter.endDate).toISOString() : null;

      const whereClauses: string[] = [];
      const params: unknown[] = [];

      if (startIso) {
        whereClauses.push("datetime(visited_at) >= datetime(?)");
        params.push(startIso);
      }
      if (endIso) {
        whereClauses.push("datetime(visited_at) <= datetime(?)");
        params.push(endIso);
      }
      if (search) {
        const queryTerm = `%${search}%`;
        whereClauses.push(`(
          ip LIKE ? OR
          country LIKE ? OR
          city LIKE ? OR
          pathname LIKE ? OR
          browser_name LIKE ? OR
          os_name LIKE ? OR
          device_type LIKE ? OR
          referrer LIKE ?
        )`);
        for (let i = 0; i < 8; i++) {
          params.push(queryTerm);
        }
      }

      const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

      const countStmt = d1.prepare(`SELECT COUNT(*) AS count FROM visitor_analytics ${whereSql}`);
      const countRow = await (params.length ? countStmt.bind(...params) : countStmt).first<{ count: number }>();
      const total = Number(countRow?.count) || 0;

      const selectSql = `
        SELECT * FROM visitor_analytics
        ${whereSql}
        ORDER BY id DESC
        LIMIT ? OFFSET ?
      `;
      const selectStmt = d1.prepare(selectSql);
      const rowsRes = await selectStmt.bind(...params, limit, offset).all<Record<string, unknown>>();

      const records: VisitorRecord[] = (rowsRes?.results || []).map((r) => ({
        id: Number(r.id),
        visitorId: String(r.visitor_id || ""),
        sessionId: String(r.session_id || ""),
        ip: String(r.ip || ""),
        country: String(r.country || ""),
        region: String(r.region || ""),
        city: String(r.city || ""),
        pathname: String(r.pathname || ""),
        referrer: String(r.referrer || ""),
        userAgent: String(r.user_agent || ""),
        browserName: String(r.browser_name || ""),
        browserVersion: String(r.browser_version || ""),
        osName: String(r.os_name || ""),
        osVersion: String(r.os_version || ""),
        deviceType: (r.device_type as VisitorRecord["deviceType"]) || "unknown",
        screenResolution: String(r.screen_resolution || ""),
        language: String(r.language || ""),
        timezone: String(r.timezone || ""),
        isReturning: Boolean(r.is_returning),
        visitedAt: normalizeDate(r.visited_at)
      }));

      return { records, total };
    } catch (d1Err) {
      console.warn("[visitor-store] D1 getVisitorRecords error:", d1Err);
    }
  }

  const sql = getSql();
  const dbReady = sql ? await ensureVisitorTables() : false;

  if (dbReady && sql) {
    try {
      const search = filter.search?.trim();
      const hasDate = Boolean(filter.startDate || filter.endDate);
      const start = filter.startDate ? new Date(filter.startDate).toISOString() : "1970-01-01T00:00:00Z";
      const end = filter.endDate ? new Date(filter.endDate).toISOString() : "2100-01-01T00:00:00Z";

      let rows: Array<Record<string, unknown>>;
      let totalRows: Array<Record<string, unknown>>;

      if (search && hasDate) {
        const queryTerm = `%${search}%`;
        totalRows = await sql`
          SELECT COUNT(*)::int AS count FROM visitor_analytics
          WHERE visited_at >= ${start} AND visited_at <= ${end}
            AND (
              ip ILIKE ${queryTerm} OR
              country ILIKE ${queryTerm} OR
              city ILIKE ${queryTerm} OR
              pathname ILIKE ${queryTerm} OR
              browser_name ILIKE ${queryTerm} OR
              os_name ILIKE ${queryTerm} OR
              device_type ILIKE ${queryTerm} OR
              referrer ILIKE ${queryTerm}
            )
        `;
        rows = await sql`
          SELECT * FROM visitor_analytics
          WHERE visited_at >= ${start} AND visited_at <= ${end}
            AND (
              ip ILIKE ${queryTerm} OR
              country ILIKE ${queryTerm} OR
              city ILIKE ${queryTerm} OR
              pathname ILIKE ${queryTerm} OR
              browser_name ILIKE ${queryTerm} OR
              os_name ILIKE ${queryTerm} OR
              device_type ILIKE ${queryTerm} OR
              referrer ILIKE ${queryTerm}
            )
          ORDER BY visited_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      } else if (search) {
        const queryTerm = `%${search}%`;
        totalRows = await sql`
          SELECT COUNT(*)::int AS count FROM visitor_analytics
          WHERE (
            ip ILIKE ${queryTerm} OR
            country ILIKE ${queryTerm} OR
            city ILIKE ${queryTerm} OR
            pathname ILIKE ${queryTerm} OR
            browser_name ILIKE ${queryTerm} OR
            os_name ILIKE ${queryTerm} OR
            device_type ILIKE ${queryTerm} OR
            referrer ILIKE ${queryTerm}
          )
        `;
        rows = await sql`
          SELECT * FROM visitor_analytics
          WHERE (
            ip ILIKE ${queryTerm} OR
            country ILIKE ${queryTerm} OR
            city ILIKE ${queryTerm} OR
            pathname ILIKE ${queryTerm} OR
            browser_name ILIKE ${queryTerm} OR
            os_name ILIKE ${queryTerm} OR
            device_type ILIKE ${queryTerm} OR
            referrer ILIKE ${queryTerm}
          )
          ORDER BY visited_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      } else if (hasDate) {
        totalRows = await sql`
          SELECT COUNT(*)::int AS count FROM visitor_analytics
          WHERE visited_at >= ${start} AND visited_at <= ${end}
        `;
        rows = await sql`
          SELECT * FROM visitor_analytics
          WHERE visited_at >= ${start} AND visited_at <= ${end}
          ORDER BY visited_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      } else {
        totalRows = await sql`SELECT COUNT(*)::int AS count FROM visitor_analytics`;
        rows = await sql`
          SELECT * FROM visitor_analytics
          ORDER BY visited_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      }

      const total = Number(totalRows[0]?.count) || 0;
      const records: VisitorRecord[] = rows.map((r) => ({
        id: Number(r.id),
        visitorId: String(r.visitor_id || ""),
        sessionId: String(r.session_id || ""),
        ip: String(r.ip || ""),
        country: String(r.country || ""),
        region: String(r.region || ""),
        city: String(r.city || ""),
        pathname: String(r.pathname || ""),
        referrer: String(r.referrer || ""),
        userAgent: String(r.user_agent || ""),
        browserName: String(r.browser_name || ""),
        browserVersion: String(r.browser_version || ""),
        osName: String(r.os_name || ""),
        osVersion: String(r.os_version || ""),
        deviceType: (r.device_type as VisitorRecord["deviceType"]) || "unknown",
        screenResolution: String(r.screen_resolution || ""),
        language: String(r.language || ""),
        timezone: String(r.timezone || ""),
        isReturning: Boolean(r.is_returning),
        visitedAt: normalizeDate(r.visited_at)
      }));

      return { records, total };
    } catch (error) {
      console.error("[visitor-store] Error retrieving records from Neon:", error);
    }
  }

  // Fallback to local file records
  const all = await getLocalRecords();
  const filtered = filterRecordsInMemory(all, filter);
  const total = filtered.length;
  const records = filtered.slice(offset, offset + limit);

  return { records, total };
}

/**
 * Retrieves all matching records for CSV export.
 */
export async function getAllVisitorsForExport(filter: VisitorFilter): Promise<VisitorRecord[]> {
  const d1 = await getD1Database();
  if (d1) {
    try {
      const search = filter.search?.trim();
      const startIso = filter.startDate ? new Date(filter.startDate).toISOString() : null;
      const endIso = filter.endDate ? new Date(filter.endDate).toISOString() : null;

      const whereClauses: string[] = [];
      const params: unknown[] = [];

      if (startIso) {
        whereClauses.push("datetime(visited_at) >= datetime(?)");
        params.push(startIso);
      }
      if (endIso) {
        whereClauses.push("datetime(visited_at) <= datetime(?)");
        params.push(endIso);
      }
      if (search) {
        const queryTerm = `%${search}%`;
        whereClauses.push(`(
          ip LIKE ? OR
          country LIKE ? OR
          city LIKE ? OR
          pathname LIKE ? OR
          browser_name LIKE ? OR
          os_name LIKE ? OR
          device_type LIKE ? OR
          referrer LIKE ?
        )`);
        for (let i = 0; i < 8; i++) {
          params.push(queryTerm);
        }
      }

      const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
      const selectSql = `
        SELECT * FROM visitor_analytics
        ${whereSql}
        ORDER BY id DESC
        LIMIT 5000
      `;
      const selectStmt = d1.prepare(selectSql);
      const rowsRes = await (params.length ? selectStmt.bind(...params) : selectStmt).all<Record<string, unknown>>();

      return (rowsRes?.results || []).map((r) => ({
        id: Number(r.id),
        visitorId: String(r.visitor_id || ""),
        sessionId: String(r.session_id || ""),
        ip: String(r.ip || ""),
        country: String(r.country || ""),
        region: String(r.region || ""),
        city: String(r.city || ""),
        pathname: String(r.pathname || ""),
        referrer: String(r.referrer || ""),
        userAgent: String(r.user_agent || ""),
        browserName: String(r.browser_name || ""),
        browserVersion: String(r.browser_version || ""),
        osName: String(r.os_name || ""),
        osVersion: String(r.os_version || ""),
        deviceType: (r.device_type as VisitorRecord["deviceType"]) || "unknown",
        screenResolution: String(r.screen_resolution || ""),
        language: String(r.language || ""),
        timezone: String(r.timezone || ""),
        isReturning: Boolean(r.is_returning),
        visitedAt: normalizeDate(r.visited_at)
      }));
    } catch (d1Err) {
      console.warn("[visitor-store] D1 getAllVisitorsForExport error:", d1Err);
    }
  }

  const sql = getSql();
  const dbReady = sql ? await ensureVisitorTables() : false;

  if (dbReady && sql) {
    try {
      const search = filter.search?.trim();
      const hasDate = Boolean(filter.startDate || filter.endDate);
      const start = filter.startDate ? new Date(filter.startDate).toISOString() : "1970-01-01T00:00:00Z";
      const end = filter.endDate ? new Date(filter.endDate).toISOString() : "2100-01-01T00:00:00Z";

      let rows: Array<Record<string, unknown>>;

      if (search && hasDate) {
        const queryTerm = `%${search}%`;
        rows = await sql`
          SELECT * FROM visitor_analytics
          WHERE visited_at >= ${start} AND visited_at <= ${end}
            AND (
              ip ILIKE ${queryTerm} OR
              country ILIKE ${queryTerm} OR
              city ILIKE ${queryTerm} OR
              pathname ILIKE ${queryTerm} OR
              browser_name ILIKE ${queryTerm} OR
              os_name ILIKE ${queryTerm} OR
              device_type ILIKE ${queryTerm} OR
              referrer ILIKE ${queryTerm}
            )
          ORDER BY visited_at DESC
          LIMIT 5000
        `;
      } else if (search) {
        const queryTerm = `%${search}%`;
        rows = await sql`
          SELECT * FROM visitor_analytics
          WHERE (
            ip ILIKE ${queryTerm} OR
            country ILIKE ${queryTerm} OR
            city ILIKE ${queryTerm} OR
            pathname ILIKE ${queryTerm} OR
            browser_name ILIKE ${queryTerm} OR
            os_name ILIKE ${queryTerm} OR
            device_type ILIKE ${queryTerm} OR
            referrer ILIKE ${queryTerm}
          )
          ORDER BY visited_at DESC
          LIMIT 5000
        `;
      } else if (hasDate) {
        rows = await sql`
          SELECT * FROM visitor_analytics
          WHERE visited_at >= ${start} AND visited_at <= ${end}
          ORDER BY visited_at DESC
          LIMIT 5000
        `;
      } else {
        rows = await sql`
          SELECT * FROM visitor_analytics
          ORDER BY visited_at DESC
          LIMIT 5000
        `;
      }

      return rows.map((r) => ({
        id: Number(r.id),
        visitorId: String(r.visitor_id || ""),
        sessionId: String(r.session_id || ""),
        ip: String(r.ip || ""),
        country: String(r.country || ""),
        region: String(r.region || ""),
        city: String(r.city || ""),
        pathname: String(r.pathname || ""),
        referrer: String(r.referrer || ""),
        userAgent: String(r.user_agent || ""),
        browserName: String(r.browser_name || ""),
        browserVersion: String(r.browser_version || ""),
        osName: String(r.os_name || ""),
        osVersion: String(r.os_version || ""),
        deviceType: (r.device_type as VisitorRecord["deviceType"]) || "unknown",
        screenResolution: String(r.screen_resolution || ""),
        language: String(r.language || ""),
        timezone: String(r.timezone || ""),
        isReturning: Boolean(r.is_returning),
        visitedAt: normalizeDate(r.visited_at)
      }));
    } catch (error) {
      console.error("[visitor-store] Error exporting from Neon:", error);
    }
  }

  const all = await getLocalRecords();
  return filterRecordsInMemory(all, filter).slice(0, 5000);
}

/**
 * Prunes visitor records older than specified days for privacy and database retention.
 */
export async function pruneVisitorRecords(days = 90): Promise<number> {
  const safeDays = Math.max(1, Math.min(365, days));

  const d1 = await getD1Database();
  if (d1) {
    try {
      const result = await d1
        .prepare("DELETE FROM visitor_analytics WHERE datetime(visited_at) < datetime('now', '-' || ? || ' days')")
        .bind(safeDays)
        .run();
      const changes = (result as { meta?: { changes?: number } })?.meta?.changes ?? 0;
      return Number(changes);
    } catch (d1Err) {
      console.warn("[visitor-store] D1 prune error:", d1Err);
    }
  }

  const sql = getSql();
  const dbReady = sql ? await ensureVisitorTables() : false;

  if (dbReady && sql) {
    try {
      const result = await sql`
        DELETE FROM visitor_analytics
        WHERE visited_at < NOW() - (${safeDays} || ' days')::INTERVAL
      `;
      return result.length;
    } catch (error) {
      console.error("[visitor-store] Error pruning Neon records:", error);
      return 0;
    }
  }

  // Local fallback pruning
  try {
    const cutoff = Date.now() - safeDays * 86400000;
    const all = await getLocalRecords();
    const kept = all.filter((r) => new Date(r.visitedAt).getTime() >= cutoff);
    const deletedCount = all.length - kept.length;
    await saveLocalRecords(kept);
    return deletedCount;
  } catch {
    return 0;
  }
}
