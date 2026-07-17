import { NextResponse } from "next/server";
import { requireAdminMutation, requireAdminSession } from "@/lib/admin-api";
import { getSiteContent, saveSiteContent } from "@/lib/content-store";
import type { SiteContent } from "@/types/site-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns the last ten version snapshots.
export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const content = await getSiteContent();
  return NextResponse.json(content.builder.versionHistory);
}

// Restores a version snapshot by id.
export async function POST(request: Request) {
  const denied = await requireAdminMutation(request);

  if (denied) {
    return denied;
  }

  const body = (await request.json()) as { versionId?: string };
  const content = await getSiteContent();
  const version = content.builder.versionHistory.find((item) => item.id === body.versionId);

  if (!version) {
    return NextResponse.json({ message: "Version not found." }, { status: 404 });
  }

  const restored = version.snapshotData as SiteContent;
  const saved = await saveSiteContent({
    ...restored,
    builder: {
      ...restored.builder,
      versionHistory: content.builder.versionHistory.map((item) => (item.id === version.id ? { ...item, restoredAt: new Date().toISOString() } : item))
    }
  });

  return NextResponse.json(saved);
}
