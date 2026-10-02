import { NextResponse } from "next/server";
import { authConfigReady, cookieName, createSessionToken, credentialsMatch, getAuthSetupMessage } from "@/lib/auth";
import { createCsrfToken, csrfCookieName } from "@/lib/admin-api";

export const runtime = "nodejs";

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function withinLoginRateLimit(request: Request) {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const current = loginAttempts.get(key) || { count: 0, resetAt: Date.now() + 15 * 60_000 };

  if (Date.now() > current.resetAt) {
    current.count = 0;
    current.resetAt = Date.now() + 15 * 60_000;
  }

  if (current.count >= 10) {
    return false;
  }

  loginAttempts.set(key, { ...current, count: current.count + 1 });
  return true;
}

export async function POST(request: Request) {
  if (!withinLoginRateLimit(request)) {
    return NextResponse.json({ message: "Too many login attempts. Please try again later." }, { status: 429 });
  }

  if (!authConfigReady()) {
    return NextResponse.json({ message: getAuthSetupMessage() }, { status: 503 });
  }

  let body: { username?: unknown; password?: unknown };
  try {
    body = (await request.json()) as { username?: unknown; password?: unknown };
  } catch {
    return NextResponse.json({ message: "Invalid login request." }, { status: 400 });
  }

  if (typeof body.username !== "string" || typeof body.password !== "string" || body.username.length > 128 || body.password.length > 256) {
    return NextResponse.json({ message: "Invalid login request." }, { status: 400 });
  }

  if (!credentialsMatch(body.username, body.password)) {
    return NextResponse.json({ message: "Invalid admin credentials." }, { status: 401 });
  }

  const csrfToken = createCsrfToken();
  const response = NextResponse.json({ ok: true, csrfToken });
  response.cookies.set(cookieName, createSessionToken(body.username || ""), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/"
  });
  response.cookies.set(csrfCookieName, csrfToken, {
    httpOnly: false,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/"
  });

  return response;
}
