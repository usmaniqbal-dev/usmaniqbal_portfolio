import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authConfigReady, cookieName, getAuthSetupMessage, verifySessionToken } from "@/lib/auth";
import { csrfCookieName } from "@/lib/admin-api";

export const runtime = "nodejs";

export async function GET() {
  if (!authConfigReady()) {
    return NextResponse.json({ authenticated: false, configured: false, message: getAuthSetupMessage() });
  }

  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(cookieName)?.value);
  const csrfToken = cookieStore.get(csrfCookieName)?.value || "";

  return NextResponse.json({ authenticated: Boolean(session), configured: true, csrfToken });
}
