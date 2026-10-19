import { get } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-api";
import { extractBlobTarget, isBlobStorageConfigured, verifySignedBlobUrl } from "@/lib/blob-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawTarget = searchParams.get("pathname") || searchParams.get("url");

  if (!rawTarget) {
    return NextResponse.json({ error: "Missing pathname or url parameter." }, { status: 400 });
  }

  const target = extractBlobTarget(rawTarget);

  // 1. Authorization: check if request has a valid, non-expired short-lived HMAC signature
  const expires = searchParams.get("expires");
  const sig = searchParams.get("sig");
  const isSignedAuthorized = verifySignedBlobUrl(target, expires, sig);

  // 2. Authorization: check if user has an active authenticated admin session (with 2FA if active)
  const isAdminAuthorized = await requireAdminSession();

  if (!isAdminAuthorized && !isSignedAuthorized) {
    return NextResponse.json(
      { error: "Unauthorized. Accessing private files requires admin authentication or a valid signed URL." },
      { status: 401 }
    );
  }

  if (!isBlobStorageConfigured()) {
    return NextResponse.json(
      { error: "Vercel Blob storage is not configured." },
      { status: 503 }
    );
  }

  try {
    const result = await get(target, {
      access: "private"
    });

    if (result === null) {
      return new NextResponse("Private blob not found", { status: 404 });
    }

    return new NextResponse(result.stream, {
      headers: {
        "Cache-Control": "private, no-cache, no-transform",
        "Content-Type": result.blob.contentType || "application/octet-stream",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (err) {
    console.error("[private-blob-get-error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to retrieve private blob." },
      { status: 500 }
    );
  }
}
