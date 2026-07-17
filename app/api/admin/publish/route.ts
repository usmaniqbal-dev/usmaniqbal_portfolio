import { NextResponse } from "next/server";
import { requireAdminMutation, requireAdminSession } from "@/lib/admin-api";
import { applyPublishAction } from "@/lib/builder-actions";
import { getSiteContent, saveSiteContent } from "@/lib/content-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns current publish metadata for the dashboard.
export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const content = await getSiteContent();
  return NextResponse.json({
    lastPublishedAt: content.builder.settings.lastPublishedAt,
    draftUpdatedAt: content.builder.settings.draftUpdatedAt,
    versions: content.builder.versionHistory
  });
}

// Saves a draft, publishes the draft, or resets builder customizations to default.
export async function POST(request: Request) {
  const denied = await requireAdminMutation(request);

  if (denied) {
    return denied;
  }

  const body = (await request.json()) as { action?: string };
  const content = await getSiteContent();
  const saved = await saveSiteContent(applyPublishAction(content, body.action || "draft"));

  return NextResponse.json(saved);
}
