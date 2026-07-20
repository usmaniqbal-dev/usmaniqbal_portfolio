import { NextResponse } from "next/server";
import { contentJsonHeaders, revalidatePortfolioContent } from "@/lib/content-cache";
import { getKnowledgeBase, saveKnowledgeBase, type KnowledgeBase } from "@/lib/chatbot-store";
import { adminSetupErrorResponse, requireAdminMutation, requireAdminSession } from "@/lib/admin-api";

export const runtime = "nodejs";

// Returns the editable chatbot knowledge base for the admin panel.
export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json(await getKnowledgeBase(), { headers: contentJsonHeaders() });
  } catch (error) {
    return adminSetupErrorResponse(error);
  }
}

// Saves owner info, FAQs, and custom Q&A edits to managed storage.
export async function PUT(request: Request) {
  const denied = await requireAdminMutation(request);
  if (denied) return denied;
  try {
    const knowledge = (await request.json()) as KnowledgeBase;
    const saved = await saveKnowledgeBase(knowledge);
    revalidatePortfolioContent();
    return NextResponse.json(saved, { headers: contentJsonHeaders() });
  } catch (error) {
    return adminSetupErrorResponse(error);
  }
}
