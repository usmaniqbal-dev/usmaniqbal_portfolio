import { createHmac, timingSafeEqual } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { getStoredJson, saveStoredJson } from "@/lib/content-store";

const minimumSecretLength = 32;
export const minimumPasswordLength = 8;


export type SessionPayload = {
  username: string;
  expiresAt: number;
  stage?: string;
  twoFactorVerified?: boolean;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < minimumSecretLength) {
    return null;
  }

  return secret;
}

function base64Url(input: string) {
  return Buffer.from(input).toString("base64url");
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export const cookieName = "nurax_admin_session";
export const pending2faCookieName = "nurax_2fa_pending";

type AdminCredentials = {
  username: string;
  passwordHash: string; // SHA-256 hash or plain string for backward compatibility
  salt?: string;
  updatedAt?: string;
};

const credentialsPath = path.join(process.cwd(), "data", "admin-credentials.json");

function hashPassword(password: string, salt: string) {
  return createHmac("sha256", salt).update(password).digest("hex");
}

export async function getAdminCredentials(): Promise<{ username: string; passwordHash: string; salt: string }> {
  const defaultUser = process.env.ADMIN_USERNAME || "adminusman";
  const defaultPass = process.env.ADMIN_PASSWORD || "usman589";
  const defaultSalt = "nuraxtech_admin_salt";
  const fallback = {
    username: defaultUser,
    passwordHash: hashPassword(defaultPass, defaultSalt),
    salt: defaultSalt
  };

  try {
    const stored = await getStoredJson<AdminCredentials>("admin-credentials");
    if (stored?.username && stored?.passwordHash) {
      return {
        username: stored.username,
        passwordHash: stored.passwordHash,
        salt: stored.salt || defaultSalt
      };
    }
  } catch {
    // Continue to file check
  }

  try {
    const raw = await readFile(credentialsPath, "utf8");
    const parsed = JSON.parse(raw) as AdminCredentials;
    if (parsed.username && parsed.passwordHash) {
      return {
        username: parsed.username,
        passwordHash: parsed.passwordHash,
        salt: parsed.salt || defaultSalt
      };
    }
  } catch {
    // Fallback to environment variables
  }

  return fallback;
}

export async function updateAdminCredentials(newUsername: string, newPassword: string): Promise<boolean> {
  const salt = crypto.randomUUID();
  const passwordHash = hashPassword(newPassword, salt);
  const payload: AdminCredentials = {
    username: newUsername.trim(),
    passwordHash,
    salt,
    updatedAt: new Date().toISOString()
  };

  const storedInDb = await saveStoredJson("admin-credentials", payload);
  if (!storedInDb) {
    if (process.env.VERCEL) {
      throw new Error("Credentials storage requires Neon PostgreSQL. Add DATABASE_URL from the Vercel Neon integration.");
    }
    await mkdir(path.dirname(credentialsPath), { recursive: true });
    await writeFile(credentialsPath, JSON.stringify(payload, null, 2), "utf8");
  }

  return true;
}

export function authConfigReady() {
  return Boolean(
    (process.env.ADMIN_USERNAME || true) &&
    getSecret()
  );
}

export function getAuthSetupMessage() {
  return "Set ADMIN_USERNAME, ADMIN_PASSWORD with at least 8 characters, and AUTH_SECRET with at least 32 characters in .env.local.";
}

export function createSessionToken(username: string, twoFactorVerified = false) {
  const secret = getSecret();

  if (!secret) {
    throw new Error(getAuthSetupMessage());
  }

  const payload: SessionPayload = {
    username,
    twoFactorVerified,
    expiresAt: Date.now() + 1000 * 60 * 60 * 8
  };
  const body = base64Url(JSON.stringify(payload));

  return `${body}.${sign(body, secret)}`;
}

export function verifySessionToken(token?: string) {
  const secret = getSecret();

  if (!token || !secret) {
    return null;
  }

  const [body, signature] = token.split(".");

  if (!body || !signature || !safeEqual(signature, sign(body, secret))) {
    return null;
  }

  let payload: SessionPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }

  if (!payload.username || !Number.isFinite(payload.expiresAt) || payload.expiresAt < Date.now()) {
    return null;
  }

  return payload;
}

export function createPending2faToken(username: string) {
  const secret = getSecret();

  if (!secret) {
    throw new Error(getAuthSetupMessage());
  }

  const payload: SessionPayload = {
    username,
    stage: "2fa_pending",
    expiresAt: Date.now() + 1000 * 60 * 5 // 5 minutes
  };
  const body = base64Url(JSON.stringify(payload));

  return `${body}.${sign(body, secret)}`;
}

export function verifyPending2faToken(token?: string) {
  const secret = getSecret();

  if (!token || !secret) {
    return null;
  }

  const [body, signature] = token.split(".");

  if (!body || !signature || !safeEqual(signature, sign(body, secret))) {
    return null;
  }

  let payload: SessionPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }

  if (
    !payload.username ||
    payload.stage !== "2fa_pending" ||
    !Number.isFinite(payload.expiresAt) ||
    payload.expiresAt < Date.now()
  ) {
    return null;
  }

  return payload;
}

export async function credentialsMatch(username: string, password: string): Promise<boolean> {
  if (!authConfigReady()) return false;

  const current = await getAdminCredentials();
  const calculatedHash = hashPassword(password, current.salt);

  if (username === current.username && safeEqual(calculatedHash, current.passwordHash)) {
    return true;
  }

  // Backward compatibility with raw environment variables if not changed yet
  if (
    process.env.ADMIN_USERNAME &&
    process.env.ADMIN_PASSWORD &&
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return true;
  }

  return false;
}
