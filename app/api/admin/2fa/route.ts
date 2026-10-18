import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { cookieName, createSessionToken, credentialsMatch, getAdminCredentials, verifySessionToken } from "@/lib/auth";
import { requireAdminMutation, requireAdminSession } from "@/lib/admin-api";
import {
  confirmTwoFactorSetup,
  disableTwoFactor,
  getTwoFactorConfig,
  startTwoFactorSetup,
  verifyTwoFactorAttempt
} from "@/lib/two-factor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET: Returns current 2FA status and count of unused backup codes
export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const config = await getTwoFactorConfig();
    const enabled = Boolean(config?.enabled && config.encryptedSecret);
    const unusedCodes = config?.backupCodes?.filter((c) => !c.used).length || 0;

    return NextResponse.json({
      enabled,
      backupCodesRemaining: unusedCodes,
      updatedAt: config?.updatedAt || null
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load 2FA status.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

// POST: Initiates enrollment (generates secret, QR code, and backup recovery codes)
export async function POST(request: Request) {
  const denied = await requireAdminMutation(request);
  if (denied) return denied;

  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(cookieName)?.value);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const setupData = await startTwoFactorSetup(session.username);
    return NextResponse.json({
      ok: true,
      secret: setupData.secret,
      qrCodeUrl: setupData.qrCodeUrl,
      backupCodes: setupData.backupCodes,
      message: "Scan the QR code with Google Authenticator or Microsoft Authenticator, then enter the 6-digit confirmation code."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to initiate 2FA setup.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

// PUT: Confirms enrollment with an initial valid 6-digit OTP to officially activate 2FA
export async function PUT(request: Request) {
  const denied = await requireAdminMutation(request);
  if (denied) return denied;

  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(cookieName)?.value);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { code?: string };
    const code = (body.code || "").trim();

    if (!code) {
      return NextResponse.json(
        { message: "Please enter the 6-digit verification code from your authenticator app." },
        { status: 400 }
      );
    }

    const result = await confirmTwoFactorSetup(session.username, code);

    if (!result.success) {
      return NextResponse.json(
        { message: result.message || "Invalid authenticator code. Check device time and try again." },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      ok: true,
      backupCodes: result.backupCodes,
      message: "Two-Factor Authentication is now enabled on your account! Save your backup recovery codes securely."
    });

    // Upgrade session to twoFactorVerified: true
    response.cookies.set(cookieName, createSessionToken(session.username, true), {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8,
      path: "/"
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to confirm 2FA setup.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

// DELETE: Disables 2FA (requires current password and current OTP/backup code)
export async function DELETE(request: Request) {
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
        { message: "Current password is required to disable Two-Factor Authentication." },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { message: "A 6-digit authenticator code or backup recovery code is required to disable 2FA." },
        { status: 400 }
      );
    }

    // 1. Verify password
    const creds = await getAdminCredentials();
    const passwordValid = await credentialsMatch(creds.username, currentPassword);
    if (!passwordValid) {
      return NextResponse.json({ message: "Incorrect current password." }, { status: 401 });
    }

    // 2. Verify OTP or backup code
    const codeResult = await verifyTwoFactorAttempt(code);
    if (!codeResult.success) {
      return NextResponse.json(
        { message: "Invalid authenticator code or backup code." },
        { status: 401 }
      );
    }

    // 3. Disable 2FA
    await disableTwoFactor();

    const response = NextResponse.json({
      ok: true,
      message: "Two-Factor Authentication has been successfully disabled."
    });

    response.cookies.set(cookieName, createSessionToken(session.username, false), {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8,
      path: "/"
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to disable 2FA.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
