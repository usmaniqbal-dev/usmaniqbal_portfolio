import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  hkdfSync,
  randomBytes,
  timingSafeEqual
} from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import QRCode from "qrcode";
import { generateSecret, generateURI, verifySync } from "otplib";
import { getStoredJson, saveStoredJson } from "@/lib/content-store";

export type BackupCodeEntry = {
  hash: string;
  used: boolean;
  usedAt?: string;
};

export type TwoFactorConfig = {
  enabled: boolean;
  encryptedSecret: string;
  iv: string;
  authTag: string;
  salt: string;
  backupCodes: BackupCodeEntry[];
  lastVerifiedStep?: number;
  updatedAt: string;
};

export type PendingSetup = {
  secret: string;
  backupCodes: string[];
  createdAt: number;
};

const twoFactorConfigKey = "admin-2fa";
const localConfigPath = path.join(process.cwd(), "data", "admin-2fa.json");
const localPendingPath = path.join(process.cwd(), "data", "admin-2fa-pending.json");

// In-memory fallback for pending enrollment session (expires after 10 mins)
const pendingSetups = new Map<string, PendingSetup>();

function getMasterKey(): Buffer {
  if (process.env.TWO_FACTOR_ENCRYPTION_KEY && process.env.TWO_FACTOR_ENCRYPTION_KEY.length >= 32) {
    return Buffer.from(
      createHmac("sha256", "nurax_master_key")
        .update(process.env.TWO_FACTOR_ENCRYPTION_KEY)
        .digest()
    );
  }

  const authSecret = process.env.AUTH_SECRET || "nuraxtech_default_portfolio_secret_32_chars";
  return Buffer.from(
    hkdfSync("sha256", authSecret, "nurax_2fa_salt", "nurax_2fa_vault_encryption", 32)
  );
}

// Encrypt TOTP secret at rest with AES-256-GCM
export function encryptSecret(plainSecret: string): { encryptedSecret: string; iv: string; authTag: string } {
  const key = getMasterKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plainSecret, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedSecret: encrypted.toString("hex"),
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex")
  };
}

// Decrypt TOTP secret from AES-256-GCM
export function decryptSecret(encryptedHex: string, ivHex: string, authTagHex: string): string {
  const key = getMasterKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
}

function hashBackupCode(code: string, salt: string): string {
  const clean = code.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return createHmac("sha256", salt).update(clean).digest("hex");
}

// Generate human-friendly backup codes: e.g. "ABCD-1234"
export function generateBackupCodes(count = 10): string[] {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude easily confused chars (0, O, 1, I)
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    const bytes = randomBytes(8);
    let code = "";
    for (let j = 0; j < 8; j++) {
      code += chars[bytes[j] % chars.length];
    }
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }

  return codes;
}

export async function getTwoFactorConfig(): Promise<TwoFactorConfig | null> {
  try {
    const dbConfig = await getStoredJson<TwoFactorConfig>(twoFactorConfigKey);
    if (dbConfig && typeof dbConfig.enabled === "boolean") {
      return dbConfig;
    }
  } catch {
    // Continue to local file
  }

  try {
    const raw = await readFile(localConfigPath, "utf8");
    const parsed = JSON.parse(raw) as TwoFactorConfig;
    if (parsed && typeof parsed.enabled === "boolean") {
      return parsed;
    }
  } catch {
    // Not found
  }

  return null;
}

export async function saveTwoFactorConfig(config: TwoFactorConfig): Promise<boolean> {
  const storedInDb = await saveStoredJson(twoFactorConfigKey, config);
  if (!storedInDb) {
    if (process.env.VERCEL) {
      throw new Error("2FA storage requires Neon PostgreSQL. Add DATABASE_URL to your Vercel deployment.");
    }
    await mkdir(path.dirname(localConfigPath), { recursive: true });
    await writeFile(localConfigPath, JSON.stringify(config, null, 2), "utf8");
  }

  return true;
}

export async function isTwoFactorEnabled(): Promise<boolean> {
  const config = await getTwoFactorConfig();
  return Boolean(config?.enabled && config.encryptedSecret);
}

// Initiates enrollment: returns secret, QR code, and backup codes (does not enable 2FA yet)
export async function startTwoFactorSetup(username: string): Promise<{
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}> {
  const secret = generateSecret();
  const backupCodes = generateBackupCodes(10);
  const otpAuthUri = generateURI({
    secret,
    label: username || "admin",
    issuer: "Usman Iqbal Portfolio"
  });

  const qrCodeUrl = await QRCode.toDataURL(otpAuthUri, {
    errorCorrectionLevel: "M",
    width: 256,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff"
    }
  });

  const pending: PendingSetup = {
    secret,
    backupCodes,
    createdAt: Date.now()
  };

  pendingSetups.set(username, pending);

  // Also persist pending setup to disk for multi-process dev if needed
  try {
    await mkdir(path.dirname(localPendingPath), { recursive: true });
    await writeFile(localPendingPath, JSON.stringify({ [username]: pending }), "utf8");
  } catch {
    // Ignore in read-only environments
  }

  return {
    secret,
    qrCodeUrl,
    backupCodes
  };
}

async function getPendingSetup(username: string): Promise<PendingSetup | null> {
  const mem = pendingSetups.get(username);
  if (mem && Date.now() - mem.createdAt < 1000 * 60 * 15) {
    return mem;
  }

  try {
    const raw = await readFile(localPendingPath, "utf8");
    const parsed = JSON.parse(raw) as Record<string, PendingSetup>;
    const filePending = parsed[username];
    if (filePending && Date.now() - filePending.createdAt < 1000 * 60 * 15) {
      return filePending;
    }
  } catch {
    // Not found
  }

  return null;
}

// Confirms setup using initial OTP before activating 2FA
export async function confirmTwoFactorSetup(
  username: string,
  verificationCode: string
): Promise<{ success: boolean; message?: string; backupCodes?: string[] }> {
  const pending = await getPendingSetup(username);

  if (!pending) {
    return {
      success: false,
      message: "Setup session expired. Please click 'Set up Two-Factor Authentication' again."
    };
  }

  const cleanToken = verificationCode.replace(/\s+/g, "").trim();
  const verifyResult = verifySync({
    token: cleanToken,
    secret: pending.secret
  }) as { valid: boolean; timeStep?: number };

  if (!verifyResult || !verifyResult.valid) {
    return {
      success: false,
      message: "Invalid authenticator code. Check your device time and enter the latest 6-digit code."
    };
  }

  // Encrypt secret and hash backup codes
  const { encryptedSecret, iv, authTag } = encryptSecret(pending.secret);
  const salt = randomBytes(16).toString("hex");
  const hashedBackupCodes: BackupCodeEntry[] = pending.backupCodes.map((code) => ({
    hash: hashBackupCode(code, salt),
    used: false
  }));

  const config: TwoFactorConfig = {
    enabled: true,
    encryptedSecret,
    iv,
    authTag,
    salt,
    backupCodes: hashedBackupCodes,
    lastVerifiedStep: verifyResult.timeStep,
    updatedAt: new Date().toISOString()
  };

  await saveTwoFactorConfig(config);

  // Clear pending state
  pendingSetups.delete(username);
  try {
    await writeFile(localPendingPath, JSON.stringify({}), "utf8");
  } catch {
    // ignore
  }

  return {
    success: true,
    backupCodes: pending.backupCodes
  };
}

// Disables 2FA completely
export async function disableTwoFactor(): Promise<boolean> {
  const config: TwoFactorConfig = {
    enabled: false,
    encryptedSecret: "",
    iv: "",
    authTag: "",
    salt: "",
    backupCodes: [],
    updatedAt: new Date().toISOString()
  };

  return saveTwoFactorConfig(config);
}

// Regenerates fresh backup codes (requires fresh re-verification)
export async function regenerateBackupCodes(): Promise<string[] | null> {
  const config = await getTwoFactorConfig();
  if (!config || !config.enabled) {
    return null;
  }

  const freshCodes = generateBackupCodes(10);
  const salt = randomBytes(16).toString("hex");
  const hashedBackupCodes: BackupCodeEntry[] = freshCodes.map((code) => ({
    hash: hashBackupCode(code, salt),
    used: false
  }));

  config.salt = salt;
  config.backupCodes = hashedBackupCodes;
  config.updatedAt = new Date().toISOString();

  await saveTwoFactorConfig(config);
  return freshCodes;
}

// Validates a 6-digit TOTP code OR a backup recovery code
export async function verifyTwoFactorAttempt(
  inputCode: string
): Promise<{ success: boolean; usedBackupCode?: boolean; message?: string }> {
  const config = await getTwoFactorConfig();

  if (!config || !config.enabled || !config.encryptedSecret) {
    return { success: false, message: "Two-factor authentication is not active." };
  }

  const clean = inputCode.replace(/[^A-Za-z0-9]/g, "").trim();

  // 1. If 6-digit number: verify as TOTP code
  if (/^\d{6}$/.test(clean)) {
    try {
      const secret = decryptSecret(config.encryptedSecret, config.iv, config.authTag);
      const result = verifySync({
        token: clean,
        secret
      }) as { valid: boolean; timeStep?: number };

      if (result && result.valid) {
        // Prevent replay attacks within the same 30-second window
        if (config.lastVerifiedStep && config.lastVerifiedStep === result.timeStep) {
          return {
            success: false,
            message: "Code was already used. Please wait for the next 6-digit code."
          };
        }

        // Update last verified step
        config.lastVerifiedStep = result.timeStep;
        await saveTwoFactorConfig(config);

        return { success: true, usedBackupCode: false };
      }
    } catch (err) {
      console.error("[2fa] Decryption / TOTP error:", err);
      return { success: false, message: "Authenticator verification failed." };
    }
  }

  // 2. Check if it matches an unused backup recovery code
  const candidateHash = hashBackupCode(clean, config.salt);
  let matchedIndex = -1;

  for (let i = 0; i < config.backupCodes.length; i++) {
    const entry = config.backupCodes[i];
    if (!entry.used) {
      const entryBuffer = Buffer.from(entry.hash);
      const candidateBuffer = Buffer.from(candidateHash);
      if (entryBuffer.length === candidateBuffer.length && timingSafeEqual(entryBuffer, candidateBuffer)) {
        matchedIndex = i;
        break;
      }
    }
  }

  if (matchedIndex !== -1) {
    config.backupCodes[matchedIndex].used = true;
    config.backupCodes[matchedIndex].usedAt = new Date().toISOString();
    await saveTwoFactorConfig(config);

    return { success: true, usedBackupCode: true };
  }

  return {
    success: false,
    message: "Invalid 6-digit code or backup recovery code."
  };
}
