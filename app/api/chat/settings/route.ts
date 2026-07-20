import { NextResponse } from "next/server";
import { contentJsonHeaders, revalidatePortfolioContent } from "@/lib/content-cache";
import { getChatbotSettings, saveChatbotSettings, type ChatbotSettings } from "@/lib/chatbot-store";
import { adminSetupErrorResponse, requireAdminMutation } from "@/lib/admin-api";

export const runtime = "nodejs";

// Returns chatbot settings used by the floating widget.
export async function GET() {
  try {
    return NextResponse.json(await getChatbotSettings(), { headers: contentJsonHeaders() });
  } catch (error) {
    return adminSetupErrorResponse(error);
  }
}

// Saves chatbot settings from the admin chatbot page.
export async function PUT(request: Request) {
  const denied = await requireAdminMutation(request);
  if (denied) return denied;
  try {
    const settings = (await request.json()) as ChatbotSettings;
    const saved = await saveChatbotSettings(settings);
    revalidatePortfolioContent();
    return NextResponse.json(saved, { headers: contentJsonHeaders() });
  } catch (error) {
    return adminSetupErrorResponse(error);
  }
}
