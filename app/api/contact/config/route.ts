import { NextResponse } from "next/server";
import { getPublicEmailConfig } from "@/lib/email-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns public EmailJS configuration so the contact form dynamically uses the saved settings.
export async function GET() {
  try {
    const config = await getPublicEmailConfig();
    return NextResponse.json(config, {
      headers: {
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load email configuration.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
