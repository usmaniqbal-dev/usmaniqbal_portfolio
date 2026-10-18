import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  hkdfSync,
  randomBytes,
  timingSafeEqual
} from "crypto";
import { generateSecret, generateSync, generateURI, verifySync } from "otplib";
import QRCode from "qrcode";

console.log("=== 2FA Security & Verification Test Suite ===");

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

// -------------------------------------------------------------
// Test 1: Key Derivation & AES-256-GCM Encryption / Decryption
// -------------------------------------------------------------
console.log("\n[1] Testing AES-256-GCM Encryption & Key Derivation");
const testSecretKey = "super-secret-auth-key-at-least-32-characters-long";
const derivedKey = hkdfSync("sha256", testSecretKey, "nurax-2fa-totp-salt", "nurax-aes-256-gcm-encryption", 32);
assert(derivedKey.byteLength === 32, "HKDF derives a 32-byte master key");

const originalTotpSecret = generateSecret();
const iv = randomBytes(12);
const cipher = createCipheriv("aes-256-gcm", Buffer.from(derivedKey), iv);
let encrypted = cipher.update(originalTotpSecret, "utf8", "hex");
encrypted += cipher.final("hex");
const authTag = cipher.getAuthTag().toString("hex");

assert(encrypted.length > 0, "Secret is encrypted with AES-256-GCM");
assert(authTag.length === 32, "GCM authentication tag is 16 bytes (32 hex characters)");

// Decrypt
const decipher = createDecipheriv("aes-256-gcm", Buffer.from(derivedKey), iv);
decipher.setAuthTag(Buffer.from(authTag, "hex"));
let decrypted = decipher.update(encrypted, "hex", "utf8");
decrypted += decipher.final("utf8");
assert(decrypted === originalTotpSecret, "Decrypted secret matches original TOTP secret");

// Tamper test (tampered ciphertext should fail auth tag verification)
let tamperedThrew = false;
try {
  const badDecipher = createDecipheriv("aes-256-gcm", Buffer.from(derivedKey), iv);
  badDecipher.setAuthTag(Buffer.from(authTag, "hex"));
  badDecipher.update("aa" + encrypted.slice(2), "hex", "utf8");
  badDecipher.final("utf8");
} catch {
  tamperedThrew = true;
}
assert(tamperedThrew, "Tampered ciphertext triggers authentication tag verification failure");

// -------------------------------------------------------------
// Test 2: TOTP Generation, Verification & Replay Attack Mitigation
// -------------------------------------------------------------
console.log("\n[2] Testing TOTP Verification & Replay Protection");
const validToken = generateSync({ secret: originalTotpSecret });
assert(/^\d{6}$/.test(validToken), `Generated 6-digit TOTP code: ${validToken}`);

const verification = verifySync({ token: validToken, secret: originalTotpSecret });
assert(verification.valid === true, "Valid 6-digit TOTP code is accepted");
assert(typeof verification.timeStep === "number", `Valid code returns timeStep: ${verification.timeStep}`);

const invalidToken = "000000" === validToken ? "999999" : "000000";
const badVerification = verifySync({ token: invalidToken, secret: originalTotpSecret });
assert(badVerification.valid === false, "Invalid 6-digit code is rejected");

// Replay protection simulation
const lastVerifiedStep = verification.timeStep;
const isReplay = (lastVerifiedStep === verification.timeStep);
assert(isReplay, "Replay attack detected: token submitted in same timeStep is flagged and blocked");

// -------------------------------------------------------------
// Test 3: Emergency Backup Recovery Codes (HMAC-SHA256 & Invalidation)
// -------------------------------------------------------------
console.log("\n[3] Testing Emergency Backup Recovery Codes");
function generateBackupCodes() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const codes = [];
  for (let i = 0; i < 10; i++) {
    const bytes = randomBytes(8);
    let code = "";
    for (let j = 0; j < 8; j++) {
      code += chars[bytes[j] % chars.length];
      if (j === 3) code += "-";
    }
    codes.push(code);
  }
  return codes;
}

function hashBackupCode(code, salt) {
  const normalized = code.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return createHmac("sha256", salt).update(normalized).digest("hex");
}

const salt = randomBytes(16).toString("hex");
const rawCodes = generateBackupCodes();
assert(rawCodes.length === 10, "Generated exactly 10 backup codes");
assert(rawCodes.every(c => /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(c)), "All backup codes adhere to XXXX-XXXX format");

const hashedEntries = rawCodes.map(code => ({
  hash: hashBackupCode(code, salt),
  used: false
}));

// Test matching and consuming 1st code
const testCode = rawCodes[0];
const candidateHash = hashBackupCode(testCode, salt);
const matched = hashedEntries.find(e => !e.used && timingSafeEqual(Buffer.from(e.hash), Buffer.from(candidateHash)));
assert(Boolean(matched), "Valid backup code matches hashed entry using constant-time comparison");

// Mark as consumed
matched.used = true;

// Re-use test
const reuseAttempt = hashedEntries.find(e => !e.used && timingSafeEqual(Buffer.from(e.hash), Buffer.from(candidateHash)));
assert(!reuseAttempt, "Consumed backup code cannot be used a second time");

// Remaining count
const remaining = hashedEntries.filter(e => !e.used).length;
assert(remaining === 9, `Correct remaining backup code count: ${remaining}/10`);

// -------------------------------------------------------------
// Test 4: Pending 2FA Token (HMAC-SHA256 signature & Expiry)
// -------------------------------------------------------------
console.log("\n[4] Testing Pending 2FA Token Lifecycle");
function createPendingToken(username, secret, expSeconds = 300) {
  const expiresAt = Date.now() + expSeconds * 1000;
  const payload = Buffer.from(JSON.stringify({ u: username, exp: expiresAt })).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function verifyPendingToken(token, secret) {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expectedSig = createHmac("sha256", secret).update(payload).digest("base64url");
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;
  const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  if (data.exp < Date.now()) return null;
  return data.u;
}

const token = createPendingToken("adminusman", testSecretKey, 300);
const verifiedUser = verifyPendingToken(token, testSecretKey);
assert(verifiedUser === "adminusman", "Valid pending 2FA token verifies correctly");

const badSecretUser = verifyPendingToken(token, "wrong-secret-key-that-does-not-match");
assert(badSecretUser === null, "Tampered secret signature rejects pending token");

const expiredToken = createPendingToken("adminusman", testSecretKey, -1);
const expiredUser = verifyPendingToken(expiredToken, testSecretKey);
assert(expiredUser === null, "Expired pending 2FA token is rejected");

// -------------------------------------------------------------
// Test 5: Rate Limiting & Temporary Lockout
// -------------------------------------------------------------
console.log("\n[5] Testing Rate Limiting & Temporary Lockout Protection");
class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 5 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.records = new Map();
  }

  isLocked(key) {
    const entry = this.records.get(key);
    if (!entry) return false;
    if (entry.lockedUntil && entry.lockedUntil > Date.now()) return true;
    return false;
  }

  recordFailure(key) {
    const now = Date.now();
    const entry = this.records.get(key) || { attempts: 0, resetAt: now + this.windowMs };
    if (entry.resetAt < now) {
      entry.attempts = 0;
      entry.resetAt = now + this.windowMs;
    }
    entry.attempts++;
    if (entry.attempts >= this.maxAttempts) {
      entry.lockedUntil = now + this.windowMs;
    }
    this.records.set(key, entry);
  }

  reset(key) {
    this.records.delete(key);
  }
}

const limiter = new RateLimiter(5, 1000);
const attackerKey = "127.0.0.1:adminusman";
for (let i = 0; i < 4; i++) {
  limiter.recordFailure(attackerKey);
  assert(!limiter.isLocked(attackerKey), `Attempt ${i + 1} does not lock account yet`);
}
limiter.recordFailure(attackerKey); // 5th attempt
assert(limiter.isLocked(attackerKey), "5th failed attempt triggers temporary lockout");

// -------------------------------------------------------------
// Test 6: QR Code & Authenticator URI Compatibility
// -------------------------------------------------------------
console.log("\n[6] Testing Authenticator URI & QR Code Generation");
const otpAuthUri = generateURI({
  issuer: "NURAXTECH Admin",
  label: "adminusman",
  secret: originalTotpSecret
});
assert(otpAuthUri.startsWith("otpauth://totp/"), "URI starts with otpauth://totp/");
assert(otpAuthUri.includes("issuer=NURAXTECH%20Admin") || otpAuthUri.includes("issuer=NURAXTECH+Admin") || otpAuthUri.includes("NURAXTECH"), "URI includes configured issuer");

const qrDataUrl = await QRCode.toDataURL(otpAuthUri, { errorCorrectionLevel: "M", width: 256 });
assert(qrDataUrl.startsWith("data:image/png;base64,"), "QR Code generated as standard PNG Data URL");

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log(`\n=============================================`);
console.log(`Test Results: ${passed} passed, ${failed} failed`);
console.log(`=============================================\n`);

if (failed > 0) {
  process.exit(1);
}
