import { NextResponse } from "next/server";
import { requireAdminMutation, requireAdminSession } from "@/lib/admin-api";
import { getAdminCredentials, updateAdminCredentials, credentialsMatch } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns current admin username (never returns password or hash)
export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const creds = await getAdminCredentials();
    return NextResponse.json({
      username: creds.username
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load admin profile.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

// Updates admin username and/or password after verifying current password
export async function PUT(request: Request) {
  const denied = await requireAdminMutation(request);
  if (denied) return denied;

  try {
    const body = (await request.json()) as {
      currentPassword?: string;
      newUsername?: string;
      newPassword?: string;
    };

    const currentCreds = await getAdminCredentials();
    const currentPassword = (body.currentPassword || "").trim();
    const newUsername = (body.newUsername || currentCreds.username).trim();
    const newPassword = (body.newPassword || "").trim();

    if (!currentPassword) {
      return NextResponse.json({ message: "Current password is required to make changes." }, { status: 400 });
    }

    // Verify current password
    const matches = await credentialsMatch(currentCreds.username, currentPassword);
    if (!matches) {
      return NextResponse.json({ message: "Incorrect current password." }, { status: 401 });
    }

    if (!newUsername || newUsername.length < 3) {
      return NextResponse.json({ message: "Username must be at least 3 characters." }, { status: 400 });
    }

    // If newPassword is provided, enforce minimum length
    const finalPassword = newPassword ? newPassword : currentPassword;
    if (newPassword && newPassword.length < 8) {
      return NextResponse.json({ message: "New password must be at least 8 characters long." }, { status: 400 });
    }

    await updateAdminCredentials(newUsername, finalPassword);

    return NextResponse.json({
      ok: true,
      username: newUsername,
      message: "Admin credentials updated successfully! Use your new credentials on your next sign in."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update admin credentials.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
