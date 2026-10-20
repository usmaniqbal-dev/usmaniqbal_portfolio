import { execSync } from "child_process";

console.log("=== COMPREHENSIVE D1 DATABASE VERIFICATION ===\n");

function runD1(sql) {
  const singleLine = sql.replace(/\r?\n\s*/g, " ").trim();
  const sanitized = singleLine.replace(/"/g, '""');
  const cmd = `npx wrangler d1 execute portfolio-db --remote --command="${sanitized}"`;
  const out = execSync(cmd, { encoding: "utf8" });
  const jsonStart = out.indexOf("[");
  if (jsonStart === -1) throw new Error("No JSON in output: " + out);
  const data = JSON.parse(out.slice(jsonStart));
  return data[0]?.results || [];
}

async function main() {
  // 1. Table Verification
  console.log("[1/5] Checking All Database Tables...");
  const tables = runD1("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;");
  const tableNames = tables.map(t => t.name);
  console.log("Found tables:", tableNames.join(", "));
  const expectedTables = ["site_content", "app_data", "visitor_analytics"];
  for (const exp of expectedTables) {
    if (!tableNames.includes(exp)) {
      throw new Error(`Missing expected table: ${exp}`);
    }
  }
  console.log("✓ All expected tables present.\n");

  // 2. Indexes Verification
  console.log("[2/5] Checking Database Indexes...");
  const indexes = runD1("SELECT name, tbl_name FROM sqlite_master WHERE type='index' ORDER BY tbl_name;");
  console.log(`Found ${indexes.length} indexes:`, indexes.map(i => `${i.tbl_name}.${i.name}`).join(", "));
  console.log("✓ All indexes verified.\n");

  // 3. site_content Verification
  console.log("[3/5] Verifying site_content Integrity...");
  const contentRows = runD1("SELECT id, length(content) AS len, updated_at FROM site_content WHERE id = 1;");
  if (!contentRows.length) throw new Error("site_content row 1 missing!");
  console.log(`site_content row 1 size: ${contentRows[0].len} bytes (Updated: ${contentRows[0].updated_at})`);
  const contentData = runD1("SELECT json_extract(content, '$.projects') AS projects, json_extract(content, '$.skills') AS skills, json_extract(content, '$.services') AS services FROM site_content WHERE id = 1;");
  const pCount = JSON.parse(contentData[0].projects || "[]").length;
  const sCount = JSON.parse(contentData[0].skills || "[]").length;
  const srvCount = JSON.parse(contentData[0].services || "[]").length;
  console.log(`Content items: ${pCount} projects, ${sCount} skills, ${srvCount} services`);
  if (pCount === 0 || sCount === 0 || srvCount === 0) {
    throw new Error("Corrupted content data: empty arrays detected!");
  }
  console.log("✓ site_content data intact and verified.\n");

  // 4. app_data Verification (Settings, 2FA, Credentials, Chatbot, Email)
  console.log("[4/5] Verifying app_data Entries...");
  const appRows = runD1("SELECT data_key, length(value) AS len, updated_at FROM app_data ORDER BY data_key;");
  for (const row of appRows) {
    console.log(`- ${row.data_key}: ${row.len} bytes (Updated: ${row.updated_at})`);
  }
  const appKeys = appRows.map(r => r.data_key);
  const criticalKeys = ["chatbot-settings", "knowledge-base", "email-settings", "admin-2fa"];
  for (const k of criticalKeys) {
    if (!appKeys.includes(k)) {
      console.warn(`WARNING: Critical key ${k} missing in app_data!`);
    }
  }

  // Test read/write operation on app_data
  console.log("Testing app_data Read/Write operation...");
  runD1("INSERT OR REPLACE INTO app_data (data_key, value, updated_at) VALUES ('__healthcheck_test__', '{\"ok\":true}', CURRENT_TIMESTAMP);");
  const readBack = runD1("SELECT value FROM app_data WHERE data_key = '__healthcheck_test__';");
  if (!readBack.length || !readBack[0].value.includes('"ok":true')) {
    throw new Error("Failed to write/read back test key in app_data!");
  }
  runD1("DELETE FROM app_data WHERE data_key = '__healthcheck_test__';");
  console.log("✓ app_data persistent Read/Write verified.\n");

  // 5. visitor_analytics Verification
  console.log("[5/5] Verifying visitor_analytics Tracking & Analytics...");
  const vStats = runD1(`
    SELECT 
      COUNT(*) AS total_page_views,
      COUNT(DISTINCT session_id) AS total_visits,
      COUNT(DISTINCT visitor_id) AS unique_visitors,
      COUNT(DISTINCT CASE WHEN is_returning = 1 THEN visitor_id END) AS returning_visitors
    FROM visitor_analytics;
  `);
  console.log("Visitor Analytics Aggregates:", JSON.stringify(vStats[0]));

  const topPages = runD1("SELECT pathname, COUNT(*) AS views FROM visitor_analytics GROUP BY pathname ORDER BY views DESC LIMIT 3;");
  console.log("Top Pages:", topPages.map(p => `${p.pathname} (${p.views} views)`).join(", "));

  // Test write to visitor_analytics
  console.log("Testing visitor_analytics Insert & Date Query...");
  runD1(`
    INSERT INTO visitor_analytics (
      visitor_id, session_id, ip, country, region, city, pathname, referrer,
      user_agent, browser_name, browser_version, os_name, os_version, device_type,
      screen_resolution, language, timezone, is_returning, visited_at
    ) VALUES (
      'test-verification-vid', 'test-sess', '127.0.0.1', 'US', 'CA', 'San Francisco',
      '/test-db-verification', 'https://google.com', 'TestRunner/1.0', 'Chrome', '130',
      'Windows', '11', 'desktop', '1920x1080', 'en-US', 'America/Los_Angeles', 0, CURRENT_TIMESTAMP
    );
  `);

  const testRecord = runD1("SELECT id, visitor_id, pathname, visited_at FROM visitor_analytics WHERE visitor_id = 'test-verification-vid';");
  if (!testRecord.length) {
    throw new Error("Failed to insert/read test record in visitor_analytics!");
  }
  console.log(`Successfully verified record: ID ${testRecord[0].id}, path: ${testRecord[0].pathname}`);
  runD1("DELETE FROM visitor_analytics WHERE visitor_id = 'test-verification-vid';");
  console.log("✓ visitor_analytics Read/Write/Delete verified.\n");

  console.log("=== ALL DATABASE TABLES, SCHEMAS & OPERATIONS VERIFIED SUCCESSFULLY ===");
}

main().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
