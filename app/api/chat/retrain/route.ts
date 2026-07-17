import { NextResponse } from "next/server";
import { requireAdminMutation } from "@/lib/admin-api";

export const runtime = "nodejs";

// Proxies retraining to the protected Python FastAPI endpoint.
export async function POST(request: Request) {
  const denied = await requireAdminMutation(request);
  if (denied) return denied;
  if (!process.env.CHATBOT_API_URL) {
    return NextResponse.json({ message: "CHATBOT_API_URL is not configured." }, { status: 503 });
  }
  try {
    const response = await fetch(`${process.env.CHATBOT_API_URL}/api/retrain`, {
      method: "POST",
      headers: { "x-admin-key": process.env.CHATBOT_ADMIN_KEY || "" }
    });

    if (!response.ok) {
      return NextResponse.json({ message: "Retraining failed. Check CHATBOT_ADMIN_KEY and the Python server." }, { status: response.status });
    }

    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json({ message: "Python chatbot server is not running." }, { status: 503 });
  }
}
