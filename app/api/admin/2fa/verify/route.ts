import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { cookieName, createSessionToken, pending2faCookieName, verifyPending2faToken } from "@/lib/auth";
import { createCsrfToken, csrfCookieName } from "@/lib/admin-api";
import { verifyTwoFactorAttempt } from "@/lib/two-factor";

export const runtime = "nodejs";

const verifyAttempts = new Map<string, { count: number; resetAt: number }>();

function withinVerifyRateLimit(request: Request, username: string) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `${ip}:${username}`;
  const current = verifyAttempts.get(key) || { count: 0, resetAt: Date.now() + 5 * 60_000 };

  if (Date.now() > current.resetAt) {
    current.count = 0;
    current.resetAt = Date.now() + 5 * 60_000;
  }

  if (current.count >= 5) {
    return false;
  }

  verifyAttempts.set(key, { ...current, count: current.count + 1 });
  return true;
}

function clearVerifyRateLimit(request: Request, username: string) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  verifyAttempts.delete(`${ip}:${username}`);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const pendingCookie = cookieStore.get(pending2faCookieName)?.value;
  const pendingSession = verifyPending2faToken(pendingCookie);

  if (!pendingSession) {
    return NextResponse.json(
      { message: "Authentication session expired or invalid. Please sign in again with your username and password." },
      { status: 401 }
    );
  }

  if (!withinVerifyRateLimit(request, pendingSession.username)) {
    return NextResponse.json(
      { message: "Too many failed attempts. Temporary lockout active. Please wait 5 minutes." },
      { status: 429 }
    );
  }

  let body: { code?: unknown };
  try {
    body = (await request.json()) as { code?: unknown };
  } catch {
    return NextResponse.json({ message: "Invalid request payload." }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!code || code.length < 6 || code.length > 20) {
    return NextResponse.json(
      { message: "Please provide a valid 6-digit code or backup recovery code." },
      { status: 400 }
    );
  }

  const verifyResult = await verifyTwoFactorAttempt(code);

  if (!verifyResult.success) {
    return NextResponse.json(
      { message: verifyResult.message || "Invalid authentication code. Please try again." },
      { status: 401 }
    );
  }

  // Clear rate-limiting on success
  clearVerifyRateLimit(request, pendingSession.username);

  // Generate full admin session and CSRF tokens
  const csrfToken = createCsrfToken();
  const response = NextResponse.json({
    ok: true,
    csrfToken,
    usedBackupCode: verifyResult.usedBackupCode || false,
    message: verifyResult.usedBackupCode
      ? "Logged in using a backup recovery code. This backup code has been consumed and cannot be reused."
      : "Two-Factor Authentication successful."
  });

  // Issue full session cookie
  response.cookies.set(cookieName, createSessionToken(pendingSession.username), {
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

  // Clear pending 2FA cookie
  response.cookies.delete(pending2faCookieName);

  return response;
}
