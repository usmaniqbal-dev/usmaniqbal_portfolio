import { NextResponse } from "next/server";
import { authConfigReady, cookieName, createSessionToken, credentialsMatch, getAuthSetupMessage } from "@/lib/auth";
import { createCsrfToken, csrfCookieName } from "@/lib/admin-api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!authConfigReady()) {
    return NextResponse.json({ message: getAuthSetupMessage() }, { status: 503 });
  }

  const body = (await request.json()) as { username?: string; password?: string };

  if (!credentialsMatch(body.username || "", body.password || "")) {
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
