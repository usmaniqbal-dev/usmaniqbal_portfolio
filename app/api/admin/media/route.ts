import { NextResponse } from "next/server";
import { adminSetupErrorResponse, requireAdminMutation, requireAdminSession } from "@/lib/admin-api";
import { contentJsonHeaders, revalidatePortfolioContent } from "@/lib/content-cache";
import { getSiteContent, saveSiteContent } from "@/lib/content-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns uploaded media metadata for the Media Manager.
export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const content = await getSiteContent();
  return NextResponse.json(content.builder.media, { headers: contentJsonHeaders() });
}

// Removes a media record from the builder library.
export async function DELETE(request: Request) {
  const denied = await requireAdminMutation(request);

  if (denied) {
    return denied;
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const content = await getSiteContent();
    const saved = await saveSiteContent({ ...content, builder: { ...content.builder, media: content.builder.media.filter((item) => item.id !== id) } });
    revalidatePortfolioContent();

    return NextResponse.json(saved.builder.media, { headers: contentJsonHeaders() });
  } catch (error) {
    return adminSetupErrorResponse(error);
  }
}
