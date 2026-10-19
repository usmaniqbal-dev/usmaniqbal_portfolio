import { put, get, del } from "@vercel/blob";
import { createHmac, timingSafeEqual } from "crypto";
import { readFileSync, existsSync } from "fs";

// Load .env.local
if (existsSync(".env.local")) {
  const envContent = readFileSync(".env.local", "utf8");
  for (const line of envContent.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
    }
  }
}

console.log("=== Vercel Private Blob Storage Verification Suite ===\n");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

const token = process.env.BLOB_READ_WRITE_TOKEN;
const storeId = process.env.BLOB_STORE_ID;
const authSecret = process.env.AUTH_SECRET || "test-secret-key-at-least-32-chars-long";

assert(Boolean(token), "BLOB_READ_WRITE_TOKEN is configured in environment");
assert(Boolean(storeId), `BLOB_STORE_ID is configured (${storeId})`);

// -------------------------------------------------------------
// Test 1: Upload with access: "private"
// -------------------------------------------------------------
console.log("\n[1] Testing Private Blob Upload (access: 'private')");
const testFilename = `test-verification-${Date.now()}.txt`;
const testPayload = "Antigravity Private Blob Verification Payload";

let uploadedBlob = null;
try {
  uploadedBlob = await put(`portfolio/test/${testFilename}`, testPayload, {
    access: "private",
    token,
    contentType: "text/plain",
    addRandomSuffix: true
  });

  assert(Boolean(uploadedBlob?.url), `Upload succeeded: ${uploadedBlob.url}`);
  assert(uploadedBlob.url.includes(".private.blob.vercel-storage.com"), "Blob URL is on .private.blob.vercel-storage.com domain");
  assert(Boolean(uploadedBlob.pathname), `Pathname generated: ${uploadedBlob.pathname}`);
} catch (err) {
  assert(false, `Upload failed: ${err.message}`);
}

// -------------------------------------------------------------
// Test 2: Unauthenticated Direct Access is BLOCKED (403 Forbidden)
// -------------------------------------------------------------
console.log("\n[2] Testing Direct Unauthenticated Access (Must be 403 Forbidden)");
if (uploadedBlob) {
  try {
    const directRes = await fetch(uploadedBlob.url);
    assert(
      directRes.status === 403,
      `Direct public HTTP GET returned 403 Forbidden (status: ${directRes.status})`
    );
  } catch (err) {
    assert(false, `Direct request failed with unexpected error: ${err.message}`);
  }
}

// -------------------------------------------------------------
// Test 3: Authenticated Server-Side Retrieval via get({ access: "private" })
// -------------------------------------------------------------
console.log("\n[3] Testing Authenticated Server-Side Retrieval via get()");
if (uploadedBlob) {
  try {
    // By full URL
    const getByUrl = await get(uploadedBlob.url, { access: "private", token });
    assert(getByUrl !== null, "get(url, { access: 'private' }) returned successful response");
    assert(getByUrl.statusCode === 200, "Status code is 200");
    assert(getByUrl.blob.contentType === "text/plain", `Content-Type matches: ${getByUrl.blob.contentType}`);

    // Read stream content
    const chunks = [];
    for await (const chunk of getByUrl.stream) {
      chunks.push(chunk);
    }
    const retrievedText = Buffer.concat(chunks).toString("utf8");
    assert(retrievedText === testPayload, `Retrieved stream content matches original payload: "${retrievedText}"`);

    // By pathname
    const getByPath = await get(uploadedBlob.pathname, { access: "private", token });
    assert(getByPath !== null, "get(pathname, { access: 'private' }) returned successful response");
    assert(getByPath.blob.pathname === uploadedBlob.pathname, "Pathname matches in retrieved blob metadata");
  } catch (err) {
    assert(false, `Authenticated retrieval failed: ${err.message}`);
  }
}

// -------------------------------------------------------------
// Test 4: Short-Lived HMAC Signed URL Generation & Verification
// -------------------------------------------------------------
console.log("\n[4] Testing Short-Lived HMAC Signed URL System");

function createSignedBlobUrl(target, expiresInSeconds = 3600) {
  const expires = Date.now() + expiresInSeconds * 1000;
  const data = `${target}:${expires}`;
  const sig = createHmac("sha256", authSecret).update(data).digest("hex");
  return { target, expires: String(expires), sig, url: `/api/blob?url=${encodeURIComponent(target)}&expires=${expires}&sig=${sig}` };
}

function verifySignedBlobUrl(target, expiresStr, sig) {
  if (!target || !expiresStr || !sig) return false;
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;
  const data = `${target}:${expires}`;
  const expected = createHmac("sha256", authSecret).update(data).digest("hex");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return false;
  return timingSafeEqual(sigBuf, expBuf);
}

if (uploadedBlob) {
  // Test valid signed token
  const signed = createSignedBlobUrl(uploadedBlob.url, 60); // 60s
  assert(verifySignedBlobUrl(signed.target, signed.expires, signed.sig), "Valid short-lived signed URL is accepted");

  // Test expired signed token
  const expiredExpires = String(Date.now() - 5000);
  const expiredSig = createHmac("sha256", authSecret).update(`${uploadedBlob.url}:${expiredExpires}`).digest("hex");
  assert(!verifySignedBlobUrl(uploadedBlob.url, expiredExpires, expiredSig), "Expired signed URL is rejected");

  // Test tampered signature
  const tamperedSig = signed.sig.slice(0, -4) + "ffff";
  assert(!verifySignedBlobUrl(signed.target, signed.expires, tamperedSig), "Tampered signature is rejected");

  // Test tampered target URL with original signature
  assert(!verifySignedBlobUrl(signed.target + "-tampered", signed.expires, signed.sig), "Tampered target URL is rejected");
}

// -------------------------------------------------------------
// Test 5: Cleanup of Private Blob
// -------------------------------------------------------------
console.log("\n[5] Testing Cleanup & Deletion of Private Blob");
if (uploadedBlob) {
  try {
    await del(uploadedBlob.url, { token });
    assert(true, "Successfully deleted test private blob from storage");

    const afterDelete = await get(uploadedBlob.url, { access: "private", token });
    assert(afterDelete === null, "Verified blob no longer exists (get returned null / 404)");
  } catch (err) {
    assert(false, `Deletion or verification failed: ${err.message}`);
  }
}

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log("\n=== Private Blob Verification Results ===");
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
  console.error("\n[FAILED] Private Blob verification encountered failures.");
  process.exit(1);
} else {
  console.log("\n[SUCCESS] Private Blob Storage is FULLY ENABLED, TESTED, AND VERIFIED!");
}
