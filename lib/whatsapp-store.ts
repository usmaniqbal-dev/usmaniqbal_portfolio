import "server-only";

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { getStoredJson, saveStoredJson } from "@/lib/content-store";

export type WhatsAppSettings = {
  enabled: boolean;
  apiKey: string; // Server-side secret; NEVER exposed to frontend in plaintext
  recipientPhoneNumber: string; // International format e.g. +923001234567
  phoneNumberId: string; // Required if using Meta WhatsApp Cloud API
  customEndpoint: string; // Optional custom bridge / webhook endpoint
  rateLimitMinutes: number; // Notification rate limit window per visitor/IP
  notifyOnEveryPage: boolean; // false = only first visit / session entry
  updatedAt?: string;
};

export type PublicWhatsAppSettings = {
  enabled: boolean;
  hasApiKey: boolean;
  apiKeyMasked: string;
  recipientPhoneNumber: string;
  phoneNumberId: string;
  customEndpoint: string;
  rateLimitMinutes: number;
  notifyOnEveryPage: boolean;
  updatedAt?: string;
};

export type WhatsAppVerificationResult = {
  verified: boolean;
  supportsOutbound: boolean;
  mode: "in_app_agent" | "meta_cloud_api" | "custom_bridge" | "unconfigured";
  summary: string;
  details: string;
  missingRequirements: string[];
  httpStatus?: number;
  rawResponse?: string;
};

const dataDirectory = path.join(process.cwd(), "data");
const localSettingsPath = path.join(dataDirectory, "whatsapp-settings.json");

export const defaultWhatsAppSettings: WhatsAppSettings = {
  enabled: false,
  apiKey: "",
  recipientPhoneNumber: "",
  phoneNumberId: "",
  customEndpoint: "",
  rateLimitMinutes: 15,
  notifyOnEveryPage: false,
  updatedAt: ""
};

// In-memory rate limiting map for visitor notifications to avoid duplicates and spam
// Key: visitorId or IP, Value: timestamp of last sent notification
const notificationDedupeMap = new Map<string, number>();

/**
 * Returns the masked representation of a secret API key.
 * Never leaks the actual characters except the last 4 digits.
 */
function maskApiKey(key: string): string {
  if (!key) return "";
  const trimmed = key.trim();
  if (trimmed.length <= 4) return "••••••••";
  return `••••••••${trimmed.slice(-4)}`;
}

/**
 * Loads WhatsApp configuration from database (app_data table) or local file fallback.
 */
export async function getWhatsAppSettings(): Promise<WhatsAppSettings> {
  const stored = await getStoredJson<Partial<WhatsAppSettings>>("whatsapp-settings");
  if (stored) {
    return { ...defaultWhatsAppSettings, ...stored };
  }

  try {
    const raw = await readFile(localSettingsPath, "utf8");
    return { ...defaultWhatsAppSettings, ...(JSON.parse(raw) as Partial<WhatsAppSettings>) };
  } catch {
    return defaultWhatsAppSettings;
  }
}

/**
 * Returns safe public WhatsApp settings for frontend admin UI (masking secrets).
 */
export async function getPublicWhatsAppSettings(): Promise<PublicWhatsAppSettings> {
  const settings = await getWhatsAppSettings();
  const hasKey = Boolean(settings.apiKey && settings.apiKey.trim().length > 0);
  return {
    enabled: Boolean(settings.enabled),
    hasApiKey: hasKey,
    apiKeyMasked: hasKey ? maskApiKey(settings.apiKey) : "",
    recipientPhoneNumber: settings.recipientPhoneNumber || "",
    phoneNumberId: settings.phoneNumberId || "",
    customEndpoint: settings.customEndpoint || "",
    rateLimitMinutes: settings.rateLimitMinutes || 15,
    notifyOnEveryPage: Boolean(settings.notifyOnEveryPage),
    updatedAt: settings.updatedAt || ""
  };
}

/**
 * Persists updated WhatsApp settings to database (app_data table) or local fallback.
 */
export async function saveWhatsAppSettings(
  settings: Partial<WhatsAppSettings> & { clearApiKey?: boolean }
): Promise<PublicWhatsAppSettings> {
  const current = await getWhatsAppSettings();

  let nextApiKey = current.apiKey;
  if (settings.clearApiKey) {
    nextApiKey = "";
  } else if (typeof settings.apiKey === "string") {
    const candidate = settings.apiKey.trim();
    // Only update if not the masked placeholder
    if (candidate && !candidate.startsWith("••••••••")) {
      nextApiKey = candidate;
    }
  }

  const nextSettings: WhatsAppSettings = {
    ...current,
    enabled: typeof settings.enabled === "boolean" ? settings.enabled : current.enabled,
    apiKey: nextApiKey,
    recipientPhoneNumber:
      typeof settings.recipientPhoneNumber === "string"
        ? settings.recipientPhoneNumber.trim()
        : current.recipientPhoneNumber,
    phoneNumberId:
      typeof settings.phoneNumberId === "string"
        ? settings.phoneNumberId.trim()
        : current.phoneNumberId,
    customEndpoint:
      typeof settings.customEndpoint === "string"
        ? settings.customEndpoint.trim()
        : current.customEndpoint,
    rateLimitMinutes:
      typeof settings.rateLimitMinutes === "number" && settings.rateLimitMinutes > 0
        ? settings.rateLimitMinutes
        : current.rateLimitMinutes,
    notifyOnEveryPage:
      typeof settings.notifyOnEveryPage === "boolean"
        ? settings.notifyOnEveryPage
        : current.notifyOnEveryPage,
    updatedAt: new Date().toISOString()
  };

  const storedInDb = await saveStoredJson("whatsapp-settings", nextSettings);
  if (!storedInDb) {
    try {
      await mkdir(dataDirectory, { recursive: true });
      await writeFile(localSettingsPath, JSON.stringify(nextSettings, null, 2), "utf8");
    } catch {
      // Non-filesystem runtime fallback
    }
  }

  return getPublicWhatsAppSettings();
}

/**
 * Verifies whether the configured WhatsApp credentials support sending outbound notifications.
 * Inspects official Meta / WhatsApp architectural requirements:
 * 1. In-app WhatsApp Agent keys (from WhatsApp Settings > Agents) are designed for inbound/conversational
 *    agent linking inside WhatsApp and do not expose an outbound push REST API.
 * 2. Meta WhatsApp Cloud API requires a Phone Number ID, recipient phone number, and System User Token.
 * 3. Custom bridge endpoints are verified via direct ping/POST.
 */
export async function verifyWhatsAppCapabilities(
  candidate?: Partial<WhatsAppSettings>
): Promise<WhatsAppVerificationResult> {
  const current = await getWhatsAppSettings();
  const apiKey = (candidate?.apiKey && !candidate.apiKey.startsWith("••••••••")
    ? candidate.apiKey
    : current.apiKey
  ).trim();
  const recipient = (candidate?.recipientPhoneNumber ?? current.recipientPhoneNumber).trim();
  const phoneNumberId = (candidate?.phoneNumberId ?? current.phoneNumberId).trim();
  const customEndpoint = (candidate?.customEndpoint ?? current.customEndpoint).trim();

  if (!apiKey) {
    return {
      verified: false,
      supportsOutbound: false,
      mode: "unconfigured",
      summary: "No WhatsApp API Key Configured",
      details: "Enter and save your WhatsApp API key to enable verification and visitor notifications.",
      missingRequirements: ["WhatsApp API Key"]
    };
  }

  // Case 1: Custom webhook / bridge endpoint provided
  if (customEndpoint) {
    try {
      const parsedUrl = new URL(customEndpoint);
      if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
        throw new Error("Endpoint must use HTTP or HTTPS");
      }

      const res = await fetch(customEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "User-Agent": "UsmanIqbal-Portfolio-Notifier/1.0"
        },
        body: JSON.stringify({
          action: "ping",
          timestamp: new Date().toISOString(),
          test: true
        })
      });

      const responseText = await res.text().catch(() => "");
      const isSuccess = res.ok;

      return {
        verified: isSuccess,
        supportsOutbound: isSuccess,
        mode: "custom_bridge",
        summary: isSuccess
          ? "Custom Bridge Endpoint Verified"
          : `Custom Bridge Returned HTTP ${res.status}`,
        details: isSuccess
          ? "Successfully connected to your custom WhatsApp bridge endpoint."
          : `Bridge endpoint returned error: ${responseText.slice(0, 300) || res.statusText}`,
        missingRequirements: isSuccess ? [] : ["Valid Custom Bridge Response"],
        httpStatus: res.status,
        rawResponse: responseText.slice(0, 500)
      };
    } catch (err) {
      return {
        verified: false,
        supportsOutbound: false,
        mode: "custom_bridge",
        summary: "Custom Bridge Connection Failed",
        details: err instanceof Error ? err.message : "Failed to connect to custom bridge endpoint.",
        missingRequirements: ["Reachable Custom Bridge URL"]
      };
    }
  }

  // Case 2: Meta Cloud API Phone Number ID provided
  if (phoneNumberId) {
    if (!recipient) {
      return {
        verified: false,
        supportsOutbound: false,
        mode: "meta_cloud_api",
        summary: "Missing Recipient Phone Number",
        details:
          "A Meta Cloud API Phone Number ID was provided, but no recipient WhatsApp number is configured to receive the notification.",
        missingRequirements: ["Recipient Phone Number in international format (e.g. +923001234567)"]
      };
    }

    try {
      // Test sending an outbound test message via Meta WhatsApp Cloud API
      const cleanTo = recipient.replace(/[^\d]/g, "");
      const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: cleanTo,
          type: "text",
          text: {
            body: `🔔 Usman Iqbal Portfolio: WhatsApp notification configuration verified at ${new Date().toLocaleTimeString()} UTC.`
          }
        })
      });

      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      const isSuccess = res.ok;

      if (isSuccess) {
        return {
          verified: true,
          supportsOutbound: true,
          mode: "meta_cloud_api",
          summary: "Meta WhatsApp Cloud API Verified",
          details: "Outbound notifications are fully supported and verified via Meta Cloud API.",
          missingRequirements: [],
          httpStatus: res.status,
          rawResponse: JSON.stringify(data)
        };
      }

      const metaError = (data.error as Record<string, unknown>) || {};
      const errorMsg = String(metaError.message || res.statusText || "Meta API error");
      const errorCode = metaError.code ? ` (Code: ${metaError.code})` : "";

      const missing: string[] = [];
      if (res.status === 401 || metaError.code === 190) {
        missing.push("Valid Meta System User Access Token with whatsapp_business_messaging permission");
      } else if (metaError.code === 131030) {
        missing.push("Pre-approved Meta Message Template (required for outbound messages outside the 24-hr user window)");
      } else {
        missing.push(`Meta Cloud API Permission / Configuration issue: ${errorMsg}`);
      }

      return {
        verified: false,
        supportsOutbound: false,
        mode: "meta_cloud_api",
        summary: `Meta Cloud API Error${errorCode}`,
        details: errorMsg,
        missingRequirements: missing,
        httpStatus: res.status,
        rawResponse: JSON.stringify(data)
      };
    } catch (err) {
      return {
        verified: false,
        supportsOutbound: false,
        mode: "meta_cloud_api",
        summary: "Meta API Request Failed",
        details: err instanceof Error ? err.message : "Failed to reach Meta Graph API.",
        missingRequirements: ["Network connectivity to graph.facebook.com"]
      };
    }
  }

  // Case 3: In-App WhatsApp Agent Key (Created via WhatsApp App > Settings > Agents)
  // Per official WhatsApp architecture:
  // WhatsApp's native in-app "Agents" feature generates an API key designed specifically to bind
  // an external conversational AI bot (like a chatbot) to receive and respond to INBOUND user messages
  // sent inside WhatsApp. It does NOT provide a standalone public HTTP POST endpoint for outbound push notifications.
  return {
    verified: true,
    supportsOutbound: false,
    mode: "in_app_agent",
    summary: "In-App WhatsApp Agent Key Stored (Inbound / Conversational Only)",
    details:
      "Your API key was created inside WhatsApp under Settings > Agents. In official WhatsApp architecture, in-app agent keys are designed exclusively to link conversational AI handlers to incoming WhatsApp chats. WhatsApp does not provide an autonomous outbound push notification REST API for this key alone.",
    missingRequirements: [
      "Meta WhatsApp Cloud API Phone Number ID (or a webhook forwarder bridge)",
      "System User Token with 'whatsapp_business_messaging' scope if using Meta Cloud API",
      "Recipient WhatsApp phone number in international format"
    ]
  };
}

/**
 * Attempts to deliver an outbound WhatsApp notification.
 */
export async function sendWhatsAppNotification(text: string): Promise<{
  success: boolean;
  mode: string;
  message: string;
  details?: unknown;
}> {
  const settings = await getWhatsAppSettings();

  if (!settings.enabled) {
    return { success: false, mode: "disabled", message: "WhatsApp notifications are currently disabled in admin settings." };
  }

  if (!settings.apiKey) {
    return { success: false, mode: "unconfigured", message: "No WhatsApp API key is configured." };
  }

  // 1. Custom bridge endpoint
  if (settings.customEndpoint) {
    try {
      const res = await fetch(settings.customEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.apiKey}`,
          "User-Agent": "UsmanIqbal-Portfolio-Notifier/1.0"
        },
        body: JSON.stringify({
          recipient: settings.recipientPhoneNumber,
          message: text,
          timestamp: new Date().toISOString()
        })
      });

      const bodyText = await res.text().catch(() => "");
      return {
        success: res.ok,
        mode: "custom_bridge",
        message: res.ok ? "Delivered to custom bridge" : `Custom bridge returned HTTP ${res.status}`,
        details: bodyText
      };
    } catch (err) {
      return {
        success: false,
        mode: "custom_bridge",
        message: err instanceof Error ? err.message : "Failed to deliver to custom bridge"
      };
    }
  }

  // 2. Meta WhatsApp Cloud API
  if (settings.phoneNumberId && settings.recipientPhoneNumber) {
    try {
      const cleanTo = settings.recipientPhoneNumber.replace(/[^\d]/g, "");
      const res = await fetch(`https://graph.facebook.com/v20.0/${settings.phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: cleanTo,
          type: "text",
          text: { body: text }
        })
      });

      const data = await res.json().catch(() => ({}));
      return {
        success: res.ok,
        mode: "meta_cloud_api",
        message: res.ok ? "Delivered via Meta Cloud API" : "Meta Cloud API returned an error",
        details: data
      };
    } catch (err) {
      return {
        success: false,
        mode: "meta_cloud_api",
        message: err instanceof Error ? err.message : "Meta Cloud API network failure"
      };
    }
  }

  // 3. In-App WhatsApp Agent Key (Does not support direct outbound REST push)
  return {
    success: false,
    mode: "in_app_agent",
    message:
      "In-App WhatsApp Agent API keys support inbound conversational chats within WhatsApp, but cannot autonomously push outbound visitor alerts without Meta Cloud API credentials (Phone Number ID & Recipient Number) or a webhook bridge endpoint."
  };
}

/**
 * Dispatches a visitor notification if notifications are enabled and rate-limiting passes.
 * Uses only legitimately available visitor metadata:
 * - Visited path
 * - Timestamp
 * - Referrer source
 * - Device type, browser name, OS name
 * - Geolocation country (from trusted Cloudflare headers)
 * Never hallucinates or claims to identify phone numbers, personal names, or exact GPS.
 */
export async function dispatchVisitorNotification(visitor: {
  pathname: string;
  referrer?: string;
  deviceType?: string;
  browserName?: string;
  osName?: string;
  country?: string;
  ip?: string;
  visitorId: string;
  sessionId?: string;
}): Promise<void> {
  try {
    const settings = await getWhatsAppSettings();
    if (!settings.enabled || !settings.apiKey) {
      return;
    }

    // Rate limiting & deduplication
    const rateLimitMs = (settings.rateLimitMinutes || 15) * 60 * 1000;
    const now = Date.now();
    const dedupeKey = visitor.sessionId || visitor.visitorId || visitor.ip || "unknown";

    const lastSent = notificationDedupeMap.get(dedupeKey);
    if (lastSent && now - lastSent < rateLimitMs) {
      // Deduplicated within rate limit window
      return;
    }

    // Clean up memory cache periodically
    if (notificationDedupeMap.size > 2000) {
      for (const [k, timestamp] of notificationDedupeMap.entries()) {
        if (now - timestamp > rateLimitMs * 2) {
          notificationDedupeMap.delete(k);
        }
      }
    }

    notificationDedupeMap.set(dedupeKey, now);

    // Format clean, privacy-respecting alert
    const timestampStr = new Date().toUTCString();
    const referrerStr = visitor.referrer ? visitor.referrer.slice(0, 150) : "Direct Visit";
    const deviceStr = `${visitor.deviceType || "Device"} (${visitor.browserName || "Browser"} on ${visitor.osName || "OS"})`;
    const countryStr = visitor.country ? visitor.country.slice(0, 50) : "Location not provided";

    const message = [
      `🔔 *New Portfolio Visitor Alert*`,
      ``,
      `• *Page:* ${visitor.pathname}`,
      `• *Time:* ${timestampStr}`,
      `• *Source:* ${referrerStr}`,
      `• *Device:* ${deviceStr}`,
      `• *Country:* ${countryStr}`
    ].join("\n");

    await sendWhatsAppNotification(message);
  } catch (err) {
    // Analytics & notifications should fail safely without breaking the user request
    console.warn("[whatsapp-store] Visitor notification dispatch skipped:", err);
  }
}
