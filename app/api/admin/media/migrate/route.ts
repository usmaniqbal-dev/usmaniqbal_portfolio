import { readFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { adminSetupErrorResponse, requireAdminMutation } from "@/lib/admin-api";
import { contentJsonHeaders, revalidatePortfolioContent } from "@/lib/content-cache";
import { getSiteContent, saveSiteContent } from "@/lib/content-store";
import {
  isBlobStorageConfigured,
  isVercelBlobUrl,
  optimizeImageBuffer,
  replaceUrlReferencesInContent
} from "@/lib/blob-storage";

export const runtime = "nodejs";

// POST: Migrates local image assets to permanent Vercel Blob Storage
export async function POST(request: Request) {
  const denied = await requireAdminMutation(request);
  if (denied) {
    return denied;
  }

  if (!isBlobStorageConfigured()) {
    return NextResponse.json(
      {
        message: "Vercel Blob is not configured. Connect a Blob store in your Vercel project at https://vercel.com/nuraxtech/usmaniqbal-portfolio/stores to obtain BLOB_READ_WRITE_TOKEN.",
        setupUrl: "https://vercel.com/nuraxtech/usmaniqbal-portfolio/stores"
      },
      { status: 503 }
    );
  }

  try {
    let content = await getSiteContent();
    const migratedList: { original: string; blobUrl: string }[] = [];
    const errors: { path: string; error: string }[] = [];

    // Collect all unique local image paths in projects and site sections
    const localUrls = new Set<string>();

    if (content.home?.heroImage && !isVercelBlobUrl(content.home.heroImage) && content.home.heroImage.startsWith("/")) {
      localUrls.add(content.home.heroImage);
    }
    if (content.about?.image && !isVercelBlobUrl(content.about.image) && content.about.image.startsWith("/")) {
      localUrls.add(content.about.image);
    }
    if (content.seo?.ogImage && !isVercelBlobUrl(content.seo.ogImage) && content.seo.ogImage.startsWith("/")) {
      localUrls.add(content.seo.ogImage);
    }

    if (Array.isArray(content.projects)) {
      for (const p of content.projects) {
        if (p.image && !isVercelBlobUrl(p.image) && p.image.startsWith("/")) {
          localUrls.add(p.image);
        }
      }
    }

    if (Array.isArray(content.services)) {
      for (const s of content.services) {
        if (s.image && !isVercelBlobUrl(s.image) && s.image.startsWith("/")) {
          localUrls.add(s.image);
        }
        if (s.icon && !isVercelBlobUrl(s.icon) && s.icon.startsWith("/")) {
          localUrls.add(s.icon);
        }
      }
    }

    // Process migration for each local URL
    for (const localUrl of localUrls) {
      try {
        const filePath = path.join(process.cwd(), "public", localUrl.replace(/^\//, ""));
        const rawBuffer = await readFile(filePath);
        const ext = path.extname(filePath).slice(1).toLowerCase() || "jpg";
        const mimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : ext === "svg" ? "image/svg+xml" : "image/jpeg";

        const optimized = await optimizeImageBuffer(rawBuffer, mimeType, {
          maxWidth: 2560,
          maxHeight: 2560,
          quality: 85
        });

        const safeBase = path.basename(filePath, path.extname(filePath)).replace(/[^a-zA-Z0-9_-]/g, "-");
        const blobName = `portfolio/migrated/${safeBase}-${crypto.randomUUID().slice(0, 8)}.${optimized.extension}`;

        const blob = await put(blobName, optimized.buffer, {
          access: "public",
          contentType: optimized.contentType,
          addRandomSuffix: true
        });

        // Replace across content
        content = replaceUrlReferencesInContent(content, localUrl, blob.url);

        // Add to media library if not present
        const alreadyInLibrary = content.builder.media.some((m) => m.url === blob.url);
        if (!alreadyInLibrary) {
          content = {
            ...content,
            builder: {
              ...content.builder,
              media: [
                {
                  id: crypto.randomUUID(),
                  filename: path.basename(filePath),
                  url: blob.url,
                  type: "image",
                  size: optimized.buffer.length,
                  uploadedAt: new Date().toISOString(),
                  usedIn: []
                },
                ...content.builder.media
              ]
            }
          };
        }

        migratedList.push({ original: localUrl, blobUrl: blob.url });
      } catch (fileErr) {
        errors.push({
          path: localUrl,
          error: fileErr instanceof Error ? fileErr.message : "File read or upload error"
        });
      }
    }

    await saveSiteContent(content);
    revalidatePortfolioContent();

    return NextResponse.json(
      {
        ok: true,
        migratedCount: migratedList.length,
        migrated: migratedList,
        errors,
        message: `Successfully migrated ${migratedList.length} local images to Vercel Cloud Blob Storage.`
      },
      { headers: contentJsonHeaders() }
    );
  } catch (error) {
    return adminSetupErrorResponse(error);
  }
}
