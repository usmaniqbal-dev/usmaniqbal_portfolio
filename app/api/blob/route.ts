import "@/lib/polyfill-worker";
import { type NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-api";
import { extractBlobTarget, verifySignedBlobUrl } from "@/lib/blob-storage";

export const dynamic = "force-dynamic";

function getFallbackContentType(target: string): string {
  if (target.endsWith(".webp")) return "image/webp";
  if (target.endsWith(".png")) return "image/png";
  if (target.endsWith(".jpg") || target.endsWith(".jpeg")) return "image/jpeg";
  if (target.endsWith(".svg")) return "image/svg+xml";
  if (target.endsWith(".mp4")) return "video/mp4";
  if (target.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
}

export async function GET(request: NextRequest) {
  try {
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
    const isPublicAsset = target.startsWith("portfolio/") || target.startsWith("test/") || target.startsWith("uploads/");

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

    // 1. Try Cloudflare KV storage
    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      const ctx = await getCloudflareContext({ async: true });
      const env = ctx?.env as Record<string, unknown> | undefined;
      const kv = env?.PORTFOLIO_MEDIA as { get: (k: string, opt: { type: string }) => Promise<ArrayBuffer | null> } | undefined;
      if (kv) {
        const buffer = await kv.get(target, { type: "arrayBuffer" });
        if (buffer) {
          return new Response(buffer, {
            headers: {
              "Cache-Control": "public, max-age=31536000, immutable",
              "Content-Type": getFallbackContentType(target),
              "X-Content-Type-Options": "nosniff"
            }
          });
        }
      }

      // Try static assets binding (env.ASSETS)
      const assets = env?.ASSETS as { fetch: (req: Request) => Promise<Response> } | undefined;
      if (assets) {
        const cleanName = target.split("/").pop();
        const assetCandidates = [
          new URL(`/images/${target}`, request.url),
          new URL(`/images/portfolio/${cleanName}`, request.url),
          new URL(`/images/projects/${cleanName}`, request.url)
        ];
        for (const candidateUrl of assetCandidates) {
          const assetRes = await assets.fetch(new Request(candidateUrl));
          if (assetRes.status === 200) {
            return assetRes;
          }
        }
      }
    } catch {
      // Continue to next storage provider
    }

    // 2. Fallback to Vercel Blob if configured
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { get } = await import("@vercel/blob");
        const result = await get(target, { access: "private" });
        if (result && result.stream) {
          const contentType = result.blob.contentType || getFallbackContentType(target);
          return new Response(result.stream as unknown as BodyInit, {
            headers: {
              "Cache-Control": "public, max-age=31536000, immutable",
              "Content-Type": contentType,
              "X-Content-Type-Options": "nosniff"
            }
          });
        }
      } catch {
        // Ignore
      }
    }

    return new Response("Blob not found", { status: 404 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[blob-handler-error]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
