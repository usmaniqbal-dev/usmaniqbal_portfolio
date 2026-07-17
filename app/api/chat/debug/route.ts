import { NextResponse } from "next/server";
import { requireAdminMutation } from "@/lib/admin-api";

export const runtime = "nodejs";

// Returns retrieved context matches for the admin live test panel.
export async function POST(request: Request) {
  const denied = await requireAdminMutation(request);
  if (denied) return denied;
  if (!process.env.CHATBOT_API_URL) {
    return NextResponse.json({ context: "", matches: [] });
  }
  try {
    const response = await fetch(`${process.env.CHATBOT_API_URL}/api/chat/debug`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(await request.json())
    });

    if (!response.ok) {
      return NextResponse.json({ context: "", matches: [] });
    }

    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json({ context: "", matches: [] });
  }
}
