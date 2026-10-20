import { readFileSync } from "fs";
import { createHmac } from "crypto";

const BASE_URL = "https://www.usmaniqbal.tech";
const envContent = readFileSync(".env.local", "utf8");
const username = envContent.match(/ADMIN_USERNAME\s*=\s*(.*)/)?.[1]?.trim().replace(/^['"]|['"]$/g, "") || "adminusman";
const authSecret = envContent.match(/AUTH_SECRET\s*=\s*(.*)/)?.[1]?.trim().replace(/^['"]|['"]$/g, "");

function makeCookie(uname) {
  const payload = { username: uname, twoFactorVerified: true, expiresAt: Date.now() + 3600000 };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", authSecret).update(body).digest("base64url");
  return `nurax_admin_session=${body}.${sig}; nurax_admin_csrf=test-csrf-token`;
}

async function testUpload() {
  console.log("Measuring upload performance on:", BASE_URL);
  const cookie = makeCookie(username);

  // 100KB test image buffer
  const testBuffer = Buffer.alloc(100 * 1024, 0x41); // 100KB
  const boundary = "----TestBoundary" + Date.now();
  const header = [
    "--" + boundary,
    'Content-Disposition: form-data; name="file"; filename="perf-test.jpg"',
    "Content-Type: image/jpeg",
    "",
    ""
  ].join("\r\n");
  const footer = "\r\n--" + boundary + "--\r\n";
  const body = Buffer.concat([Buffer.from(header, "utf8"), testBuffer, Buffer.from(footer, "utf8")]);

  const t0 = performance.now();
  const res = await fetch(`${BASE_URL}/api/admin/upload`, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "x-admin-csrf": "test-csrf-token",
      Cookie: cookie
    },
    body
  });
  const t1 = performance.now();
  const data = await res.json();
  console.log(`Upload status: ${res.status} in ${(t1 - t0).toFixed(0)} ms`);
  console.log("Upload result:", data);
}

testUpload().catch(console.error);
