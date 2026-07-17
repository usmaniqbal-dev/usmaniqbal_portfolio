import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Proxies chatbot messages to the Python FastAPI server and streams text back.
export async function POST(request: Request) {
  if (!process.env.CHATBOT_API_URL) {
    return NextResponse.json({ message: "The AI assistant is not configured." }, { status: 503 });
  }
  const controller = new AbortController();
  const timeout = windowlessTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(`${process.env.CHATBOT_API_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(await request.json()),
      signal: controller.signal
    });

    if (!response.ok || !response.body) {
      return NextResponse.json({ message: "The AI assistant is unavailable right now." }, { status: 503 });
    }

    return new Response(response.body, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  } catch {
    return NextResponse.json({ message: "The AI assistant is offline. Start the Python chatbot server and try again." }, { status: 503 });
  } finally {
    clearTimeout(timeout);
  }
}

// Keeps timeout usage server-safe without relying on browser globals.
function windowlessTimeout(callback: () => void, ms: number) {
  return setTimeout(callback, ms);
}
