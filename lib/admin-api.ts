import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { cookieName, verifySessionToken } from "@/lib/auth";
import { isTwoFactorEnabled } from "@/lib/two-factor";

export const csrfCookieName = "nurax_admin_csrf";

// Checks the signed admin session cookie for protected API routes.
export async function requireAdminSession() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(cookieName)?.value);
  if (!session) return false;

  const twoFactorActive = await isTwoFactorEnabled();
  if (twoFactorActive && !session.twoFactorVerified) {
    return false;
  }

  return true;
}

// Checks session and CSRF token for state-changing requests.
export async function requireAdminMutation(request: Request) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(cookieName)?.value);
  const csrfCookie = cookieStore.get(csrfCookieName)?.value;
  const csrfHeader = request.headers.get("x-admin-csrf");

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const twoFactorActive = await isTwoFactorEnabled();
  if (twoFactorActive && !session.twoFactorVerified) {
    return NextResponse.json({ message: "Two-Factor Authentication required." }, { status: 401 });
  }

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return NextResponse.json({ message: "Security check failed. Refresh the admin panel and try again." }, { status: 403 });
  }

  return null;
}

// Generates a browser-readable token used by admin forms and uploads.
export function createCsrfToken() {
  return crypto.randomUUID();
}

export function adminSetupErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Admin storage setup failed.";
  const isSetupError =
    message.includes("Neon PostgreSQL") ||
    message.includes("DATABASE_URL") ||
    message.includes("Vercel Blob") ||
    message.includes("BLOB_READ_WRITE_TOKEN");

  if (isSetupError) {
    return NextResponse.json({ message }, { status: 503 });
  }

  console.error("Admin request failed.", error);
  return NextResponse.json({ message: "Admin request failed. Check the server logs and deployment configuration." }, { status: 500 });
}
