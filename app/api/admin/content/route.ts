import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { cookieName, verifySessionToken } from "@/lib/auth";
import { requireAdminMutation } from "@/lib/admin-api";
import { getSiteContent, saveSiteContent } from "@/lib/content-store";
import type { SiteContent } from "@/types/site-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorized() {
  const cookieStore = await cookies();
  return Boolean(verifySessionToken(cookieStore.get(cookieName)?.value));
}

export async function GET() {
  if (!(await authorized())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await getSiteContent());
}

export async function PUT(request: Request) {
  const denied = await requireAdminMutation(request);

  if (denied) {
    return denied;
  }

  const content = (await request.json()) as SiteContent;
  const saved = await saveSiteContent({
    ...content,
    builder: {
      ...content.builder,
      settings: {
        ...content.builder.settings,
        draftUpdatedAt: new Date().toISOString()
      }
    }
  });

  return NextResponse.json(saved);
}
