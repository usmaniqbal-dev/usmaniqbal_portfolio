import { NextResponse } from "next/server";
import { recordVisitor } from "@/lib/visitor-store";
import { parseUserAgent } from "@/lib/user-agent";

export const runtime = "nodejs";

// In-memory rate limiting per IP (max 60 requests per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, resetAt: now + 60_000 };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + 60_000;
  }

  if (entry.count >= 60) {
    return false;
  }

  entry.count += 1;
  rateLimitMap.set(ip, entry);

  // Periodic cleanup
  if (rateLimitMap.size > 2000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (now > v.resetAt) rateLimitMap.delete(k);
    }
  }

  return true;
}

function sanitizeText(value: unknown, maxLength = 100): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export async function POST(request: Request) {
  try {
    // 1. Extract IP strictly from server headers
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = (forwarded ? forwarded.split(",")[0]?.trim() : realIp) || "127.0.0.1";

    if (!checkRateLimit(ip)) {
      return NextResponse.json({ ok: false, error: "Rate limit exceeded" }, { status: 429 });
    }

    // 2. Check Do Not Track (DNT) / Global Privacy Control (GPC)
    const dnt = request.headers.get("dnt") || request.headers.get("sec-gpc");
    if (dnt === "1") {
      // Respect visitor's privacy preference
      return NextResponse.json({ ok: true, skipped: "dnt" });
    }

    // 3. User-Agent & Bot Detection
    const userAgent = request.headers.get("user-agent") || "";
    const parsedUA = parseUserAgent(userAgent);
    if (parsedUA.isBot) {
      // Discard bot traffic from portfolio analytics
      return NextResponse.json({ ok: true, skipped: "bot" });
    }

    // 4. Extract trusted Vercel Geolocation headers
    const country = request.headers.get("x-vercel-ip-country") || "";
    const region = request.headers.get("x-vercel-ip-country-region") || "";
    const city = request.headers.get("x-vercel-ip-city") || "";
    const vercelTimezone = request.headers.get("x-vercel-ip-timezone") || "";

    // 5. Parse client JSON body
    let body: Record<string, unknown> = {};
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const pathname = sanitizeText(body.pathname, 500) || "/";

    // Never track admin pages or internal API routes
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/admin1122") ||
      pathname.startsWith("/api")
    ) {
      return NextResponse.json({ ok: true, skipped: "internal" });
    }

    const visitorId = sanitizeText(body.visitorId, 64);
    const sessionId = sanitizeText(body.sessionId, 64);

    if (!visitorId || !sessionId) {
      return NextResponse.json({ ok: false, error: "Missing identifier" }, { status: 400 });
    }

    const referrer = sanitizeText(body.referrer, 1000);
    const screenResolution = sanitizeText(body.screenResolution, 30);
    const language = sanitizeText(body.language, 30);
    const timezone = sanitizeText(body.timezone, 100) || vercelTimezone;

    // 6. Record visitor asynchronously in Neon database
    await recordVisitor({
      visitorId,
      sessionId,
      ip,
      country,
      region,
      city,
      pathname,
      referrer,
      userAgent,
      browserName: parsedUA.browserName,
      browserVersion: parsedUA.browserVersion,
      osName: parsedUA.osName,
      osVersion: parsedUA.osVersion,
      deviceType: parsedUA.deviceType,
      screenResolution,
      language,
      timezone
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    // Fail silently so visitor experience is never broken
    console.warn("[track-api] Tracking failed silently:", error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
