import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

function escapeSql(str) {
  return str.replace(/'/g, "''");
}

function getJsonFile(relPath) {
  const p = path.join(rootDir, relPath);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch (e) {
    console.warn(`Could not parse ${relPath}:`, e.message);
    return null;
  }
}

const sqlStatements = [];

// 1. Site content
const siteContent = getJsonFile(".data/site-content.json");
if (siteContent) {
  const contentJson = JSON.stringify(siteContent);
  sqlStatements.push(
    `INSERT OR REPLACE INTO site_content (id, content, updated_at) VALUES (1, '${escapeSql(contentJson)}', CURRENT_TIMESTAMP);`
  );
  console.log(`[seed-d1] Added site_content with ${siteContent.projects?.length} projects, ${siteContent.skills?.length} skills, ${siteContent.services?.length} services.`);
}

// 2. App data entries
const appDataEntries = {
  "chatbot-settings": getJsonFile("data/chatbot-settings.json"),
  "knowledge-base": getJsonFile("data/knowledge-base.json"),
  "chat-analytics": getJsonFile("data/chat-analytics.json"),
  "admin-credentials": getJsonFile("data/admin-credentials.json"),
  "admin-2fa": getJsonFile(".data/admin-2fa.json") || getJsonFile("data/admin-2fa.json"),
  "email-settings": getJsonFile("data/email-settings.json")
};

for (const [key, value] of Object.entries(appDataEntries)) {
  if (value) {
    const valJson = JSON.stringify(value);
    sqlStatements.push(
      `INSERT OR REPLACE INTO app_data (data_key, value, updated_at) VALUES ('${escapeSql(key)}', '${escapeSql(valJson)}', CURRENT_TIMESTAMP);`
    );
    console.log(`[seed-d1] Added app_data: ${key}`);
  }
}

// 3. Visitor records
const visitors = getJsonFile(".data/visitors.json");
if (Array.isArray(visitors) && visitors.length > 0) {
  for (const v of visitors) {
    sqlStatements.push(`
      INSERT INTO visitor_analytics (
        visitor_id, session_id, ip, country, region, city, pathname, referrer,
        user_agent, browser_name, browser_version, os_name, os_version, device_type,
        screen_resolution, language, timezone, is_returning, visited_at
      ) VALUES (
        '${escapeSql(v.visitorId || "")}',
        '${escapeSql(v.sessionId || "")}',
        '${escapeSql(v.ip || "")}',
        '${escapeSql(v.country || "")}',
        '${escapeSql(v.region || "")}',
        '${escapeSql(v.city || "")}',
        '${escapeSql(v.pathname || "/")}',
        '${escapeSql(v.referrer || "")}',
        '${escapeSql(v.userAgent || "")}',
        '${escapeSql(v.browserName || "")}',
        '${escapeSql(v.browserVersion || "")}',
        '${escapeSql(v.osName || "")}',
        '${escapeSql(v.osVersion || "")}',
        '${escapeSql(v.deviceType || "")}',
        '${escapeSql(v.screenResolution || "")}',
        '${escapeSql(v.language || "")}',
        '${escapeSql(v.timezone || "")}',
        ${v.isReturning ? 1 : 0},
        '${escapeSql(v.visitedAt || new Date().toISOString())}'
      );
    `);
  }
  console.log(`[seed-d1] Added ${visitors.length} visitor analytics records.`);
}

const outputFile = path.join(rootDir, "scripts", "d1-seed.sql");
writeFileSync(outputFile, sqlStatements.join("\n\n"), "utf8");
console.log(`[seed-d1] Generated SQL seed file: ${outputFile} (${sqlStatements.length} statements).`);
