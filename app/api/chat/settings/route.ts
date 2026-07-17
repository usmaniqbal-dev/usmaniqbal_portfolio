import { NextResponse } from "next/server";
import { getChatbotSettings, saveChatbotSettings, type ChatbotSettings } from "@/lib/chatbot-store";
import { requireAdminMutation } from "@/lib/admin-api";

export const runtime = "nodejs";

// Returns chatbot settings used by the floating widget.
export async function GET() {
  return NextResponse.json(await getChatbotSettings());
}

// Saves chatbot settings from the admin chatbot page.
export async function PUT(request: Request) {
  const denied = await requireAdminMutation(request);
  if (denied) return denied;
  const settings = (await request.json()) as ChatbotSettings;
  return NextResponse.json(await saveChatbotSettings(settings));
}
