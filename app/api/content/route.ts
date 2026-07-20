import { NextResponse } from "next/server";
import { contentJsonHeaders } from "@/lib/content-cache";
import { getSiteContent } from "@/lib/content-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const content = await getSiteContent();

  return NextResponse.json(content, { headers: contentJsonHeaders() });
}
