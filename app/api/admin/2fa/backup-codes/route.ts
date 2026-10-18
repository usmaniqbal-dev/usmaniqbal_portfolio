import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { cookieName, credentialsMatch, getAdminCredentials, verifySessionToken } from "@/lib/auth";
import { requireAdminMutation } from "@/lib/admin-api";
import { regenerateBackupCodes, verifyTwoFactorAttempt } from "@/lib/two-factor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = await requireAdminMutation(request);
  if (denied) return denied;

  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(cookieName)?.value);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { currentPassword?: string; code?: string };
    const currentPassword = (body.currentPassword || "").trim();
    const code = (body.code || "").trim();

    if (!currentPassword) {
      return NextResponse.json(
        { message: "Current password is required to regenerate backup recovery codes." },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { message: "A 6-digit authenticator code or current backup code is required for security verification." },
        { status: 400 }
      );
    }

    // 1. Verify password
    const creds = await getAdminCredentials();
    const passwordValid = await credentialsMatch(creds.username, currentPassword);
    if (!passwordValid) {
      return NextResponse.json({ message: "Incorrect current password." }, { status: 401 });
    }

    // 2. Verify OTP or current backup code
    const codeResult = await verifyTwoFactorAttempt(code);
    if (!codeResult.success) {
      return NextResponse.json(
        { message: "Invalid authenticator code or backup code." },
        { status: 401 }
      );
    }

    // 3. Regenerate backup codes
    const newCodes = await regenerateBackupCodes();
    if (!newCodes) {
      return NextResponse.json(
        { message: "Two-Factor Authentication is not enabled on this account." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      backupCodes: newCodes,
      message: "New backup recovery codes have been generated. Previous backup codes are now permanently invalid."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to regenerate backup codes.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
