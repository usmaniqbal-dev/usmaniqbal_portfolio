import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  authConfigReady,
  cookieName,
  getAuthSetupMessage,
  pending2faCookieName,
  verifyPending2faToken,
  verifySessionToken
} from "@/lib/auth";
import { csrfCookieName } from "@/lib/admin-api";
import { getContentStorageMode } from "@/lib/content-store";
import { isTwoFactorEnabled } from "@/lib/two-factor";

export const runtime = "nodejs";

export async function GET() {
  if (!authConfigReady()) {
    return NextResponse.json({ authenticated: false, configured: false, message: getAuthSetupMessage(), storageMode: getContentStorageMode() });
  }

  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(cookieName)?.value);
  const csrfToken = cookieStore.get(csrfCookieName)?.value || "";
  const twoFactorActive = await isTwoFactorEnabled();

  // If 2FA is enabled and session has not passed 2FA verification, deny session!
  if (session && twoFactorActive && !session.twoFactorVerified) {
    return NextResponse.json({
      authenticated: false,
      configured: true,
      requires2FA: true,
      csrfToken: "",
      storageMode: getContentStorageMode()
    });
  }

  // Also check if there's a valid pending 2FA authentication state
  const pending = verifyPending2faToken(cookieStore.get(pending2faCookieName)?.value);
  if (twoFactorActive && pending && !session) {
    return NextResponse.json({
      authenticated: false,
      configured: true,
      requires2FA: true,
      csrfToken: "",
      storageMode: getContentStorageMode()
    });
  }

  return NextResponse.json({
    authenticated: Boolean(session && (!twoFactorActive || session.twoFactorVerified)),
    configured: true,
    csrfToken: session && (!twoFactorActive || session.twoFactorVerified) ? csrfToken : "",
    storageMode: getContentStorageMode()
  });
}
