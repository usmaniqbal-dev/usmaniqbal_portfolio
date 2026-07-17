import { NextResponse } from "next/server";
import { requireAdminMutation, requireAdminSession } from "@/lib/admin-api";
import { getSiteContent, saveSiteContent } from "@/lib/content-store";
import type { BuilderPage } from "@/types/site-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns all pages managed by the builder.
export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const content = await getSiteContent();
  return NextResponse.json(content.builder.pages);
}

// Creates or updates a builder page.
export async function POST(request: Request) {
  const denied = await requireAdminMutation(request);

  if (denied) {
    return denied;
  }

  const page = (await request.json()) as BuilderPage;
  const content = await getSiteContent();
  const exists = content.builder.pages.some((item) => item.id === page.id);
  const pages = exists ? content.builder.pages.map((item) => (item.id === page.id ? page : item)) : [page, ...content.builder.pages];
  const saved = await saveSiteContent({ ...content, builder: { ...content.builder, pages } });

  return NextResponse.json(saved.builder.pages);
}
