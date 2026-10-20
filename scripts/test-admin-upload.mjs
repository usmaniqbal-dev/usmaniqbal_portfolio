import { readFileSync } from "fs";

const envContent = readFileSync(".env.local", "utf8");
const username = envContent.match(/ADMIN_USERNAME\s*=\s*(.*)/)?.[1]?.trim().replace(/^['"]|['"]$/g, "") || "adminusman";
const password = envContent.match(/ADMIN_PASSWORD\s*=\s*(.*)/)?.[1]?.trim().replace(/^['"]|['"]$/g, "");

const BASE_URL = "https://usmaniqbal-portfolio.usmaniqbal-dev.workers.dev";

async function run() {
  console.log("Logging into admin...");
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  console.log("Login status:", loginRes.status);
  const loginData = await loginRes.json();
  console.log("Login body:", loginData);

  // Extract cookies
  const rawSetCookie = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [loginRes.headers.get("set-cookie") || ""];
  const cookieMap = new Map();
  for (const str of rawSetCookie) {
    const parts = str.split(";");
    const [name, val] = parts[0].trim().split("=");
    if (name && val) {
      cookieMap.set(name, val);
    }
  }

  const cookieHeader = Array.from(cookieMap.entries()).map(([k, v]) => `${k}=${v}`).join("; ");
  console.log("Formed Cookie header:", cookieHeader);

  // Check Session
  const sessionRes = await fetch(`${BASE_URL}/api/admin/session`, {
    headers: { Cookie: cookieHeader }
  });
  const sessionData = await sessionRes.json();
  console.log("Session status:", sessionRes.status, sessionData);

  // 1x1 transparent PNG base64
  const pngBuffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
  const boundary = "----WebKitFormBoundaryTest123456";
  const headerPart = [
    "--" + boundary,
    'Content-Disposition: form-data; name="file"; filename="test-verification.png"',
    "Content-Type: image/png",
    "",
    ""
  ].join("\r\n");
  const footerPart = "\r\n--" + boundary + "--\r\n";
  const body = Buffer.concat([Buffer.from(headerPart, "utf8"), pngBuffer, Buffer.from(footerPart, "utf8")]);

  const uploadRes = await fetch(`${BASE_URL}/api/admin/upload`, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "x-admin-csrf": loginData.csrfToken,
      Cookie: cookieHeader
    },
    body
  });
  console.log("Upload status:", uploadRes.status);
  const uploadJson = await uploadRes.json();
  console.log("Upload response:", uploadJson);

  if (uploadJson.url) {
    const fullUrl = BASE_URL + uploadJson.url;
    console.log("Verifying uploaded asset retrieval at:", fullUrl);
    const fetchRes = await fetch(fullUrl);
    console.log("Retrieve uploaded asset status:", fetchRes.status);
    const buffer = await fetchRes.arrayBuffer();
    console.log("Retrieve byte length:", buffer.byteLength);
    if (buffer.byteLength === pngBuffer.byteLength) {
      console.log("✅ Upload and persistence to Cloudflare KV / Blob storage verified successfully!");
    } else {
      console.log("Retrieved size:", buffer.byteLength, "Original size:", pngBuffer.byteLength);
    }
  }
}

run().catch(console.error);
