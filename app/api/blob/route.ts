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

  if (!target) {
    return NextResponse.json({ error: "Invalid pathname or url parameter." }, { status: 400 });
  }

  // Security & Authorization:
  // Public portfolio media (stored under "portfolio/" or "test/") are public site assets so visitors and Next.js Image optimizer can view them.
  // Sensitive/non-portfolio files outside this scope require a valid HMAC signed URL or an active admin session.
  const isPublicAsset = target.startsWith("portfolio/") || target.startsWith("test/");

  if (!isPublicAsset) {
    const expires = searchParams.get("expires");
    const sig = searchParams.get("sig");
    const isSignedAuthorized = verifySignedBlobUrl(target, expires, sig);
    const isAdminAuthorized = await requireAdminSession();

    if (!isAdminAuthorized && !isSignedAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized. Accessing private files requires admin authentication or a valid signed URL." },
        { status: 401 }
      );
    }
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
      return new NextResponse("Blob not found", { status: 404 });
    }

    const contentType =
      result.blob.contentType ||
      (target.endsWith(".webp")
        ? "image/webp"
        : target.endsWith(".png")
          ? "image/png"
          : target.endsWith(".jpg") || target.endsWith(".jpeg")
            ? "image/jpeg"
            : target.endsWith(".svg")
              ? "image/svg+xml"
              : target.endsWith(".mp4")
                ? "video/mp4"
                : target.endsWith(".pdf")
                  ? "application/pdf"
                  : "application/octet-stream");

    return new NextResponse(result.stream, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (err) {
    console.error("[blob-get-error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to retrieve blob." },
      { status: 500 }
    );
  }
}
