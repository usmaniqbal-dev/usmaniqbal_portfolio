import { readFileSync } from "fs";

const BASE_URL = "https://usmaniqbal-portfolio.usmaniqbal-dev.workers.dev";

// Read credentials from .env.local
const envContent = readFileSync(".env.local", "utf8");
const username = envContent.match(/ADMIN_USERNAME\s*=\s*(.*)/)?.[1]?.trim().replace(/^['"]|['"]$/g, "") || "adminusman";
const password = envContent.match(/ADMIN_PASSWORD\s*=\s*(.*)/)?.[1]?.trim().replace(/^['"]|['"]$/g, "");

const results = [];

async function test(name, fn) {
  try {
    const res = await fn();
    results.push({ name, status: "PASS", details: res });
    console.log(`[PASS] ${name}`, res || "");
  } catch (err) {
    results.push({ name, status: "FAIL", error: err.message });
    console.error(`[FAIL] ${name}:`, err.message);
  }
}

async function run() {
  console.log(`Starting comprehensive verification on ${BASE_URL}...`);

  // 1. Homepage
  await test("GET / (Homepage)", async () => {
    const res = await fetch(`${BASE_URL}/`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    if (!html.includes("Usman") && !html.includes("portfolio")) throw new Error("Missing expected content in HTML");
    return `HTTP 200, HTML length: ${html.length}`;
  });

  // 2. Projects Page
  await test("GET /projects", async () => {
    const res = await fetch(`${BASE_URL}/projects`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    return `HTTP 200, HTML length: ${html.length}`;
  });

  // 3. About Page
  await test("GET /about", async () => {
    const res = await fetch(`${BASE_URL}/about`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    return `HTTP 200`;
  });

  // 4. Skills Page
  await test("GET /skills", async () => {
    const res = await fetch(`${BASE_URL}/skills`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    return `HTTP 200`;
  });

  // 5. Services Page
  await test("GET /services", async () => {
    const res = await fetch(`${BASE_URL}/services`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    return `HTTP 200`;
  });

  // 6. Contact Page
  await test("GET /contact", async () => {
    const res = await fetch(`${BASE_URL}/contact`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    return `HTTP 200`;
  });

  // 7. CV Page
  await test("GET /cv", async () => {
    const res = await fetch(`${BASE_URL}/cv`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    return `HTTP 200`;
  });

  // 8. Public Content API (D1 Database Read)
  await test("GET /api/content (D1 Database Read)", async () => {
    const res = await fetch(`${BASE_URL}/api/content`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const projects = data.projects?.length || 0;
    const skills = data.skills?.length || 0;
    const services = data.services?.length || 0;
    if (projects === 0) throw new Error("No projects returned");
    return `D1 Read OK: ${projects} projects, ${skills} skills, ${services} services`;
  });

  // 9. Media Blob Serving API
  await test("GET /api/blob (Media serving from Cloudflare)", async () => {
    const sampleBlob = "portfolio/chatbot-image-6102b93f-p5cuOcJSFO5ZrqTFBfSL0ARPn9xmKp.webp";
    const res = await fetch(`${BASE_URL}/api/blob?pathname=${encodeURIComponent(sampleBlob)}`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type");
    if (buffer.byteLength === 0) throw new Error("Empty image body returned");
    return `HTTP 200, Content-Type: ${contentType}, Size: ${buffer.byteLength} bytes`;
  });

  // 10. Visitor Tracking API (D1 Database Write)
  await test("POST /api/track (Visitor Analytics D1 Write)", async () => {
    const res = await fetch(`${BASE_URL}/api/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId: "test-verifier-" + Date.now(),
        sessionId: "session-" + Date.now(),
        pathname: "/test-verification",
        referrer: "https://google.com",
        userAgent: "VerificationBot/1.0",
        browserName: "NodeFetch",
        browserVersion: "1.0",
        osName: "Windows",
        osVersion: "11",
        deviceType: "desktop",
        screenResolution: "1920x1080",
        language: "en-US",
        timezone: "UTC"
      })
    });
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return `HTTP 200, Track response: ${JSON.stringify(json)}`;
  });

  // 11. Admin Panel Route
  await test("GET /admin1122 (Admin Panel Portal)", async () => {
    const res = await fetch(`${BASE_URL}/admin1122`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    return `HTTP 200, Admin panel loaded`;
  });

  // 12. Admin Authentication Attempt
  await test("POST /api/admin/login (Credentials & 2FA Flow)", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const json = await res.json();
    if (res.status === 200) {
      return `Login Success, 2FA required: ${Boolean(json.requires2fa)}`;
    } else {
      return `HTTP ${res.status}: ${JSON.stringify(json)}`;
    }
  });

  console.log("\n--- Verification Summary ---");
  const passed = results.filter(r => r.status === "PASS").length;
  console.log(`Passed: ${passed}/${results.length}`);
}

run().catch(console.error);
