import { NextResponse } from "next/server";
import { cookieName } from "@/lib/auth";
import { csrfCookieName } from "@/lib/admin-api";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(cookieName, "", { maxAge: 0, path: "/" });
  response.cookies.set(csrfCookieName, "", { maxAge: 0, path: "/" });

  return response;
}
