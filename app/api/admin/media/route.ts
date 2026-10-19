import path from "path";
import { unlink } from "fs/promises";
import { del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { adminSetupErrorResponse, requireAdminMutation, requireAdminSession } from "@/lib/admin-api";
import { contentJsonHeaders, revalidatePortfolioContent } from "@/lib/content-cache";
import { getSiteContent, saveSiteContent } from "@/lib/content-store";
import {
  findUrlReferencesInContent,
  isBlobStorageConfigured,
  isVercelBlobUrl,
  removeUrlReferencesFromContent,
  replaceUrlReferencesInContent
} from "@/lib/blob-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET: Returns uploaded media library records and cloud storage configuration status
export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const content = await getSiteContent();
  const usesBlob = isBlobStorageConfigured();

  // Annotate each media file with its reference count
  const mediaWithUsage = (content.builder.media || []).map((item) => {
    const references = findUrlReferencesInContent(content, item.url);
    return {
      ...item,
      isBlob: isVercelBlobUrl(item.url),
      inUse: references.length > 0,
      references
    };
  });

  return NextResponse.json(
    {
      media: mediaWithUsage,
      storage: {
        provider: usesBlob ? "vercel-blob" : "local",
        connected: usesBlob,
        cloudStorageActive: usesBlob,
        storeUrl: "https://vercel.com/nuraxtech/usmaniqbal-portfolio/stores",
        totalFiles: mediaWithUsage.length,
        blobCount: mediaWithUsage.filter((m) => m.isBlob).length
      }
    },
    { headers: contentJsonHeaders() }
  );
}

// DELETE: Safely removes a media record from the library and deletes Blob from Vercel if unreferenced
export async function DELETE(request: Request) {
  const denied = await requireAdminMutation(request);
  if (denied) {
    return denied;
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const force = searchParams.get("force") === "true";

    if (!id) {
      return NextResponse.json({ message: "Missing media ID parameter." }, { status: 400 });
    }

    const content = await getSiteContent();
    const mediaItem = (content.builder.media || []).find((item) => item.id === id);

    if (!mediaItem) {
      return NextResponse.json({ message: "Media file not found in library." }, { status: 404 });
    }

    // Check if image is actively referenced across site content
    const references = findUrlReferencesInContent(content, mediaItem.url);

    if (references.length > 0 && !force) {
      return NextResponse.json(
        {
          message: `Cannot delete image because it is currently in use on your website: ${references.slice(0, 3).join(", ")}${references.length > 3 ? ` and ${references.length - 3} more` : ""}. Replace it in those sections first, or confirm forced deletion.`,
          inUse: true,
          references
        },
        { status: 409 }
      );
    }

    // Permanently delete from Vercel Blob if no other references exist (or if force=true)
    if (isVercelBlobUrl(mediaItem.url) && isBlobStorageConfigured()) {
      try {
        await del(mediaItem.url);
      } catch (delError) {
        console.warn("[vercel-blob-delete] Could not delete blob:", mediaItem.url, delError);
      }
    } else if (mediaItem.url.startsWith("/uploads/")) {
      try {
        const localPath = path.join(process.cwd(), "public", mediaItem.url);
        await unlink(localPath);
      } catch {
        // Ignore if file already missing
      }
    }

    let updatedContent = {
      ...content,
      builder: {
        ...content.builder,
        media: content.builder.media.filter((item) => item.id !== id)
      }
    };

    // If force-deleted, clear dangling references in content
    if (force && references.length > 0) {
      updatedContent = removeUrlReferencesFromContent(updatedContent, mediaItem.url);
    }

    const saved = await saveSiteContent(updatedContent);
    revalidatePortfolioContent();

    return NextResponse.json(
      {
        ok: true,
        media: saved.builder.media,
        message: "Image successfully deleted from cloud storage and media library."
      },
      { headers: contentJsonHeaders() }
    );
  } catch (error) {
    return adminSetupErrorResponse(error);
  }
}

// PUT: Replaces an existing media entry's target URL and updates all content references
export async function PUT(request: Request) {
  const denied = await requireAdminMutation(request);
  if (denied) {
    return denied;
  }

  try {
    const body = (await request.json()) as { id?: string; newUrl?: string; newFilename?: string };
    const { id, newUrl, newFilename } = body;

    if (!id || !newUrl) {
      return NextResponse.json({ message: "ID and newUrl are required." }, { status: 400 });
    }

    const content = await getSiteContent();
    const existing = (content.builder.media || []).find((m) => m.id === id);

    if (!existing) {
      return NextResponse.json({ message: "Media record not found." }, { status: 404 });
    }

    const oldUrl = existing.url;

    // Replace references across the site content
    let updatedContent = replaceUrlReferencesInContent(content, oldUrl, newUrl);

    // Update the media library entry
    updatedContent = {
      ...updatedContent,
      builder: {
        ...updatedContent.builder,
        media: updatedContent.builder.media.map((m) =>
          m.id === id
            ? {
                ...m,
                url: newUrl,
                filename: newFilename || m.filename,
                uploadedAt: new Date().toISOString()
              }
            : m
        )
      }
    };

    // If old URL was a Vercel Blob and is no longer used, clean it up
    if (oldUrl !== newUrl && isVercelBlobUrl(oldUrl) && isBlobStorageConfigured()) {
      const remainingRefs = findUrlReferencesInContent(updatedContent, oldUrl);
      if (remainingRefs.length === 0) {
        try {
          await del(oldUrl);
        } catch {
          // Ignore
        }
      }
    }

    const saved = await saveSiteContent(updatedContent);
    revalidatePortfolioContent();

    return NextResponse.json(
      {
        ok: true,
        media: saved.builder.media,
        message: "Image reference updated across the portfolio."
      },
      { headers: contentJsonHeaders() }
    );
  } catch (error) {
    return adminSetupErrorResponse(error);
  }
}
