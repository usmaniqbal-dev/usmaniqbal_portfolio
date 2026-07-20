import { NextResponse } from "next/server";
import { adminSetupErrorResponse, requireAdminMutation, requireAdminSession } from "@/lib/admin-api";
import { addBlock, reorderSections } from "@/lib/builder-actions";
import { contentJsonHeaders, revalidatePortfolioContent } from "@/lib/content-cache";
import { getSiteContent, saveSiteContent } from "@/lib/content-store";
import type { BuilderBlock } from "@/types/site-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns blocks and sections for the default page builder canvas.
export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const content = await getSiteContent();
  const page = content.builder.pages.find((item) => item.id === "home-page");
  return NextResponse.json({ blocks: page?.blocks || [], sections: page?.sections || [] }, { headers: contentJsonHeaders() });
}

// Adds blocks or reorders sections from the drag and drop builder.
export async function POST(request: Request) {
  const denied = await requireAdminMutation(request);

  if (denied) {
    return denied;
  }

  try {
    const body = (await request.json()) as { action?: string; block?: BuilderBlock; sectionIds?: string[] };
    const content = await getSiteContent();

    if (body.action === "reorder-sections" && body.sectionIds) {
      const saved = await saveSiteContent(reorderSections(content, body.sectionIds));
      revalidatePortfolioContent();
      return NextResponse.json(saved, { headers: contentJsonHeaders() });
    }

    if (body.action === "add-block" && body.block) {
      const saved = await saveSiteContent(addBlock(content, body.block));
      revalidatePortfolioContent();
      return NextResponse.json(saved, { headers: contentJsonHeaders() });
    }

    return NextResponse.json({ message: "Unsupported block action." }, { status: 400 });
  } catch (error) {
    return adminSetupErrorResponse(error);
  }
}
