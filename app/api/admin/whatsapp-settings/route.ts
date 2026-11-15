import { NextResponse } from "next/server";
import {
  getPublicWhatsAppSettings,
  saveWhatsAppSettings,
  type WhatsAppSettings
} from "@/lib/whatsapp-store";
import { adminSetupErrorResponse, requireAdminMutation, requireAdminSession } from "@/lib/admin-api";
import { revalidatePortfolioContent } from "@/lib/content-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns public masked WhatsApp settings (only accessible by authenticated admins)
export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await getPublicWhatsAppSettings();
    return NextResponse.json(settings, {
      headers: {
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (error) {
    return adminSetupErrorResponse(error);
  }
}

// Saves WhatsApp settings (only accessible by authenticated admins with CSRF token)
export async function PUT(request: Request) {
  const denied = await requireAdminMutation(request);
  if (denied) return denied;

  try {
    const body = (await request.json()) as Partial<WhatsAppSettings> & { clearApiKey?: boolean };
    const saved = await saveWhatsAppSettings(body);
    revalidatePortfolioContent();

    return NextResponse.json(saved);
  } catch (error) {
    return adminSetupErrorResponse(error);
  }
}
