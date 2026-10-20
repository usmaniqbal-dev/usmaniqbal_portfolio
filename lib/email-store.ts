import "server-only";

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { getStoredJson, saveStoredJson } from "@/lib/content-store";

export type EmailSettings = {
  serviceId: string;
  templateId: string;
  publicKey: string;
  senderEmail: string;
  recipientEmail: string;
  updatedAt?: string;
};

export type PublicEmailConfig = {
  serviceId: string;
  templateId: string;
  publicKey: string;
};

const dataDirectory = path.join(process.cwd(), "data");
const emailSettingsPath = path.join(dataDirectory, "email-settings.json");

export const defaultEmailSettings: EmailSettings = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "",
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "",
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "",
  senderEmail: "",
  recipientEmail: "hello@nuraxtech.com",
  updatedAt: ""
};

// Reads email settings from database (app_data table) or local JSON file fallback.
export async function getEmailSettings(): Promise<EmailSettings> {
  const stored = await getStoredJson<Partial<EmailSettings>>("email-settings");
  if (stored) {
    return { ...defaultEmailSettings, ...stored };
  }

  if (process.env.VERCEL) {
    return defaultEmailSettings;
  }

  try {
    const raw = await readFile(emailSettingsPath, "utf8");
    return { ...defaultEmailSettings, ...(JSON.parse(raw) as Partial<EmailSettings>) };
  } catch {
    return defaultEmailSettings;
  }
}

// Persists email settings to database (app_data table) or local JSON file fallback.
export async function saveEmailSettings(settings: Partial<EmailSettings>): Promise<EmailSettings> {
  const current = await getEmailSettings();
  const nextSettings: EmailSettings = {
    ...current,
    serviceId: typeof settings.serviceId === "string" ? settings.serviceId.trim() : current.serviceId,
    templateId: typeof settings.templateId === "string" ? settings.templateId.trim() : current.templateId,
    publicKey: typeof settings.publicKey === "string" ? settings.publicKey.trim() : current.publicKey,
    senderEmail: typeof settings.senderEmail === "string" ? settings.senderEmail.trim() : current.senderEmail,
    recipientEmail: typeof settings.recipientEmail === "string" ? settings.recipientEmail.trim() : current.recipientEmail,
    updatedAt: new Date().toISOString()
  };

  const storedInDb = await saveStoredJson("email-settings", nextSettings);
  if (!storedInDb) {
    if (process.env.VERCEL) {
      throw new Error("Email configuration storage requires Neon PostgreSQL. Add DATABASE_URL from the Vercel Neon integration, then redeploy.");
    }
    try {
      await mkdir(dataDirectory, { recursive: true });
      await writeFile(emailSettingsPath, JSON.stringify(nextSettings, null, 2), "utf8");
    } catch {
      // Non-filesystem runtime
    }
  }

  return nextSettings;
}

// Returns only the safe public configuration fields needed by the frontend contact form.
export async function getPublicEmailConfig(): Promise<PublicEmailConfig> {
  const settings = await getEmailSettings();
  return {
    serviceId: settings.serviceId,
    templateId: settings.templateId,
    publicKey: settings.publicKey
  };
}
