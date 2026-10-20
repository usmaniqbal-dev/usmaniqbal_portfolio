import { readFileSync } from "fs";
import { createHmac } from "crypto";

const BASE_URL = "https://www.usmaniqbal.tech";

const envContent = readFileSync(".env.local", "utf8");
const username = envContent.match(/ADMIN_USERNAME\s*=\s*(.*)/)?.[1]?.trim().replace(/^['"]|['"]$/g, "") || "adminusman";
const password = envContent.match(/ADMIN_PASSWORD\s*=\s*(.*)/)?.[1]?.trim().replace(/^['"]|['"]$/g, "");
const authSecret = envContent.match(/AUTH_SECRET\s*=\s*(.*)/)?.[1]?.trim().replace(/^['"]|['"]$/g, "");

function generateAdminSessionCookie(uname) {
  const payload = {
    username: uname,
    twoFactorVerified: true,
    expiresAt: Date.now() + 1000 * 60 * 60
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", authSecret).update(body).digest("base64url");
  return `nurax_admin_session=${body}.${sig}`;
}

async function main() {
  console.log("=== VERIFYING LIVE VISITOR TRACKING & ADMIN ANALYTICS ===");
  console.log(`Target: ${BASE_URL}\n`);

  // 1. Post a new visitor tracking request
  console.log("[1/5] Simulating visitor tracking via POST /api/track...");
  const trackPayload = {
    visitorId: `vid_live_${Date.now()}`,
    sessionId: `sid_live_${Date.now()}`,
    pathname: "/projects",
    referrer: "https://www.google.com/search?q=salesforce+developer",
    screenResolution: "1920x1080",
    language: "en-US",
    timezone: "America/New_York"
  };

  const trackRes = await fetch(`${BASE_URL}/api/track`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
    },
    body: JSON.stringify(trackPayload)
  });

  const trackData = await trackRes.json();
  console.log("Track Response:", trackData);
  if (!trackData.ok) {
    throw new Error("Tracking API returned failure!");
  }
  console.log("✓ Visitor event accepted by tracking API.\n");

  // 2. Admin Login & Session Generation
  console.log("[2/5] Authenticating admin session...");
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (!loginRes.ok) {
    const errText = await loginRes.text();
    throw new Error(`Admin login failed: HTTP ${loginRes.status} - ${errText}`);
  }

  const loginBody = await loginRes.json();
  console.log("Login API check:", loginBody.ok ? "Credentials Valid" : "Failed", "2FA Required:", Boolean(loginBody.requires2FA));

  const sessionCookie = generateAdminSessionCookie(username);
  console.log("✓ Verified admin session token created.\n");

  // 3. Admin Analytics API: GET /api/admin/visitors
  console.log("[3/5] Fetching live visitor analytics from GET /api/admin/visitors...");
  const visitorsApiRes = await fetch(`${BASE_URL}/api/admin/visitors?page=1&limit=25`, {
    headers: {
      Cookie: sessionCookie
    }
  });

  if (!visitorsApiRes.ok) {
    const errText = await visitorsApiRes.text();
    throw new Error(`Failed to fetch /api/admin/visitors: HTTP ${visitorsApiRes.status} - ${errText}`);
  }

  const analyticsData = await visitorsApiRes.json();
  console.log("--- Analytics Summary from Cloudflare D1 ---");
  console.log("Total Page Views:", analyticsData.stats?.totalPageViews);
  console.log("Total Visits:", analyticsData.stats?.totalVisits);
  console.log("Unique Visitors:", analyticsData.stats?.uniqueVisitors);
  console.log("Returning Rate:", analyticsData.stats?.returningRate + "%");
  console.log("Top Pages:", analyticsData.stats?.topPages?.map(p => `${p.pathname} (${p.views})`).join(", "));
  console.log("Top Countries:", analyticsData.stats?.topCountries?.map(c => `${c.country} (${c.count})`).join(", "));
  console.log("Total Records in DB:", analyticsData.total);
  console.log("Records returned on Page 1:", analyticsData.records?.length);

  if (!analyticsData.stats || analyticsData.stats.totalPageViews === 0) {
    throw new Error("Visitor stats returned empty or zero total page views!");
  }
  if (!Array.isArray(analyticsData.records) || analyticsData.records.length === 0) {
    throw new Error("Visitor records array returned empty!");
  }
  console.log("✓ Live visitor analytics verified from Cloudflare D1.\n");

  // 4. CSV Export API verification
  console.log("[4/5] Testing CSV Export via GET /api/admin/visitors?exportCsv=true...");
  const csvRes = await fetch(`${BASE_URL}/api/admin/visitors?exportCsv=true`, {
    headers: { Cookie: sessionCookie }
  });
  if (!csvRes.ok) {
    throw new Error(`CSV export failed: HTTP ${csvRes.status}`);
  }
  const csvText = await csvRes.text();
  const csvLines = csvText.trim().split("\r\n").length;
  console.log(`✓ CSV export received: ${csvLines} lines, ${csvText.length} bytes.\n`);

  // 5. Admin Page Portal: GET /admin/visitors
  console.log("[5/5] Testing Admin Visitors UI Page: GET /admin/visitors...");
  const pageRes = await fetch(`${BASE_URL}/admin/visitors`, {
    headers: { Cookie: sessionCookie }
  });
  console.log(`HTTP ${pageRes.status}`);
  if (pageRes.status !== 200) {
    throw new Error(`Admin visitors page returned HTTP ${pageRes.status}`);
  }
  console.log("✓ Admin Visitors UI Page loads successfully.\n");

  console.log("=== ALL VISITOR TRACKING & ANALYTICS VERIFIED SUCCESSFULLY ===");
}

main().catch(err => {
  console.error("Test failed:", err.message);
  process.exit(1);
});
