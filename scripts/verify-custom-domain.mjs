import { readFileSync } from "fs";

const BASE_URL = "https://www.usmaniqbal.tech";

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
  console.log(`Starting comprehensive verification on Custom Domain: ${BASE_URL}...`);

  // 1. Root redirect check (usmaniqbal.tech -> www.usmaniqbal.tech)
  await test("GET https://usmaniqbal.tech (Root Apex Redirect)", async () => {
    const res = await fetch("https://usmaniqbal.tech", { redirect: "manual" });
    const location = res.headers.get("location");
    return `HTTP ${res.status}, Location: ${location}`;
  });

  // 2. Homepage on www
  await test("GET / (Homepage)", async () => {
    const res = await fetch(`${BASE_URL}/`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    if (!html.includes("Usman") && !html.includes("portfolio")) throw new Error("Missing expected content in HTML");
    return `HTTP 200, HTML length: ${html.length}`;
  });

  // 3. Projects Page
  await test("GET /projects", async () => {
    const res = await fetch(`${BASE_URL}/projects`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    return `HTTP 200, HTML length: ${html.length}`;
  });

  // 4. About Page
  await test("GET /about", async () => {
    const res = await fetch(`${BASE_URL}/about`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    return `HTTP 200`;
  });

  // 5. Skills Page
  await test("GET /skills", async () => {
    const res = await fetch(`${BASE_URL}/skills`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    return `HTTP 200`;
  });

  // 6. Services Page
  await test("GET /services", async () => {
    const res = await fetch(`${BASE_URL}/services`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    return `HTTP 200`;
  });

  // 7. Contact Page
  await test("GET /contact", async () => {
    const res = await fetch(`${BASE_URL}/contact`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    return `HTTP 200`;
  });

  // 8. CV Page
  await test("GET /cv", async () => {
    const res = await fetch(`${BASE_URL}/cv`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    return `HTTP 200`;
  });

  // 9. Public Content API (D1 Database Read)
  await test("GET /api/content (D1 Database Read)", async () => {
    const res = await fetch(`${BASE_URL}/api/content`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const projects = data.projects?.length || 0;
    const skills = data.skills?.length || 0;
    const services = data.services?.length || 0;
    return `D1 Read OK: ${projects} projects, ${skills} skills, ${services} services`;
  });

  // 10. Media Blob Serving API
  await test("GET /api/blob (Media serving)", async () => {
    const sampleBlob = "portfolio/chatbot-image-6102b93f-p5cuOcJSFO5ZrqTFBfSL0ARPn9xmKp.webp";
    const res = await fetch(`${BASE_URL}/api/blob?pathname=${encodeURIComponent(sampleBlob)}`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type");
    return `HTTP 200, Content-Type: ${contentType}, Size: ${buffer.byteLength} bytes`;
  });

  // 11. Visitor Tracking API
  await test("POST /api/track (Visitor Analytics D1 Write)", async () => {
    const res = await fetch(`${BASE_URL}/api/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId: "domain-test-verifier",
        sessionId: "sess-domain-test",
        pathname: "/projects",
        referrer: "",
        browserName: "DomainVerifier",
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
    const data = await res.json();
    return `HTTP 200, Track response: ${JSON.stringify(data)}`;
  });

  // 12. Admin Portal Route
  await test("GET /admin1122 (Admin Panel Portal)", async () => {
    const res = await fetch(`${BASE_URL}/admin1122`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    if (!html.includes("Admin") && !html.includes("admin")) throw new Error("Admin login page missing expected elements");
    return `HTTP 200, Admin panel loaded`;
  });

  // 13. Admin Login API
  await test("POST /api/admin/login (Credentials Flow)", async () => {
    if (!password) {
      return "Skipped (no ADMIN_PASSWORD in .env.local)";
    }
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    if (res.status !== 200) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }
    const data = await res.json();
    return `Login Success, 2FA required: ${data.require2FA}`;
  });

  console.log("\n--- Verification Summary ---");
  const passed = results.filter(r => r.status === "PASS").length;
  console.log(`Passed: ${passed}/${results.length}`);
}

run().catch(console.error);
