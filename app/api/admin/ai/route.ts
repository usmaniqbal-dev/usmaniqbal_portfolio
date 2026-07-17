import { NextResponse } from "next/server";
import { requireAdminMutation } from "@/lib/admin-api";
import { createLocalAIResponse } from "@/lib/builder-actions";
import { getSiteContent, saveSiteContent } from "@/lib/content-store";
import { sanitizeText } from "@/lib/sanitize";

export const runtime = "nodejs";

const calls = new Map<string, { count: number; resetAt: number }>();

// Generates local assistant text without using an external AI API key.
async function generateAIText(type: string, prompt: string) {
  return createLocalAIResponse(type, prompt);
}

// Generates AI-assisted content and stores the result in content history.
export async function POST(request: Request) {
  const denied = await requireAdminMutation(request);

  if (denied) {
    return denied;
  }

  const ip = request.headers.get("x-forwarded-for") || "local";
  const current = calls.get(ip) || { count: 0, resetAt: Date.now() + 60_000 };

  if (Date.now() > current.resetAt) {
    current.count = 0;
    current.resetAt = Date.now() + 60_000;
  }

  if (current.count >= 12) {
    return NextResponse.json({ message: "AI rate limit reached. Try again in a minute." }, { status: 429 });
  }

  calls.set(ip, { ...current, count: current.count + 1 });

  const body = (await request.json()) as { type?: string; prompt?: string; usedFor?: string };
  const type = sanitizeText(body.type || "content");
  const prompt = sanitizeText(body.prompt || "");
  const generatedText = await generateAIText(type, prompt);
  const content = await getSiteContent();
  const aiRecord = {
    id: crypto.randomUUID(),
    type,
    prompt,
    generatedText,
    usedFor: sanitizeText(body.usedFor || type),
    createdAt: new Date().toISOString()
  };

  await saveSiteContent({
    ...content,
    builder: {
      ...content.builder,
      aiContent: [aiRecord, ...content.builder.aiContent].slice(0, 50)
    }
  });

  return NextResponse.json(aiRecord);
}
