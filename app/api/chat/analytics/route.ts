import { NextResponse } from "next/server";
import { getChatbotAnalytics } from "@/lib/chatbot-store";
import { requireAdminSession } from "@/lib/admin-api";

export const runtime = "nodejs";

// Returns basic chatbot analytics for the admin page.
export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    if (!process.env.CHATBOT_API_URL) throw new Error("Chatbot API is not configured");
    const response = await fetch(`${process.env.CHATBOT_API_URL}/api/analytics`, {
      cache: "no-store"
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }
  } catch {
    // Fall through to local analytics when the Python server is offline.
  }

  return NextResponse.json(await getChatbotAnalytics());
}
