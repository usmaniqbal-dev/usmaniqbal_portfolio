import { NextResponse } from "next/server";
import { getKnowledgeBase, saveKnowledgeBase, type KnowledgeBase } from "@/lib/chatbot-store";
import { requireAdminMutation, requireAdminSession } from "@/lib/admin-api";

export const runtime = "nodejs";

// Returns the editable chatbot knowledge base for the admin panel.
export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getKnowledgeBase());
}

// Saves owner info, FAQs, and custom Q&A edits to /data/knowledge-base.json.
export async function PUT(request: Request) {
  const denied = await requireAdminMutation(request);
  if (denied) return denied;
  const knowledge = (await request.json()) as KnowledgeBase;
  return NextResponse.json(await saveKnowledgeBase(knowledge));
}
