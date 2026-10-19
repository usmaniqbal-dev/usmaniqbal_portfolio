import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { contentJsonHeaders, revalidatePortfolioContent } from "@/lib/content-cache";
import { assertDatabaseReady, getSiteContent, isDatabaseConfigured, saveSiteContent } from "@/lib/content-store";
import { adminSetupErrorResponse, requireAdminMutation } from "@/lib/admin-api";
import {
  ALLOWED_MIME_TYPES,
  deleteBlobIfUnreferenced,
  isBlobStorageConfigured,
  MAX_IMAGE_UPLOAD_BYTES,
  MAX_VIDEO_UPLOAD_BYTES,
  optimizeImageBuffer,
  replaceUrlReferencesInContent
} from "@/lib/blob-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // 1. Strict authentication & 2FA enforcement
  const denied = await requireAdminMutation(request);
  if (denied) {
    return denied;
  }

  // 2. Parse multipart form data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { message: "Upload failed before reaching the server. Try a smaller file." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  const replacesUrl = typeof formData.get("replacesUrl") === "string" ? (formData.get("replacesUrl") as string).trim() : "";
  const replacesId = typeof formData.get("replacesId") === "string" ? (formData.get("replacesId") as string).trim() : "";

  if (!(file instanceof File) || !ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { message: "Invalid file type. Please upload a JPG, PNG, WebP, GIF, SVG, MP4, WebM, or PDF file." },
      { status: 400 }
    );
  }

  const usesBlobStorage = isBlobStorageConfigured();

  // Storage verification
  if (process.env.VERCEL && !isDatabaseConfigured()) {
    return NextResponse.json(
      { message: "Media metadata storage requires Neon PostgreSQL. Add DATABASE_URL from the Vercel Neon integration." },
      { status: 503 }
    );
  }

  if (process.env.VERCEL && !usesBlobStorage) {
    return NextResponse.json(
      {
        message: "Permanent media uploads require Vercel Blob Storage. Connect a Blob store in your Vercel project at https://vercel.com/nuraxtech/usmaniqbal-portfolio/stores to automatically configure BLOB_READ_WRITE_TOKEN.",
        setupUrl: "https://vercel.com/nuraxtech/usmaniqbal-portfolio/stores"
      },
      { status: 503 }
    );
  }

  if (process.env.VERCEL) {
    try {
      await assertDatabaseReady("Media metadata storage");
    } catch (error) {
      return adminSetupErrorResponse(error);
    }
  }

  // File size validation
  const maxAllowedSize = file.type.startsWith("video/") ? MAX_VIDEO_UPLOAD_BYTES : MAX_IMAGE_UPLOAD_BYTES;
  if (file.size > maxAllowedSize) {
    return NextResponse.json(
      { message: `File exceeds maximum allowed size of ${Math.floor(maxAllowedSize / 1024 / 1024)} MB.` },
      { status: 400 }
    );
  }

  // 3. Process & optimize buffer
  const rawArrayBuffer = await file.arrayBuffer();
  const rawBuffer = Buffer.from(rawArrayBuffer);

  const optimized = await optimizeImageBuffer(rawBuffer, file.type, {
    maxWidth: 2560,
    maxHeight: 2560,
    quality: 85
  });

  const safeBaseName = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .slice(0, 48)
    .toLowerCase();
  const safeFileName = `${safeBaseName || "asset"}-${crypto.randomUUID().slice(0, 8)}.${optimized.extension}`;

  let mediaUrl: string;

  try {
    if (usesBlobStorage) {
      // Upload permanently to Vercel Private Blob
      const blob = await put(`portfolio/${safeFileName}`, optimized.buffer, {
        access: "private",
        contentType: optimized.contentType,
        addRandomSuffix: true
      });
      mediaUrl = `/api/blob?pathname=${encodeURIComponent(blob.pathname)}`;
    } else {
      if (process.env.VERCEL) {
        return NextResponse.json(
          { message: "Production uploads require Vercel Blob. Connect a Blob store at https://vercel.com/nuraxtech/usmaniqbal-portfolio/stores." },
          { status: 503 }
        );
      }

      // Local fallback for local development without Vercel credentials
      const uploadDirectory = path.join(process.cwd(), "public", "uploads");
      const uploadPath = path.join(uploadDirectory, safeFileName);
      await mkdir(uploadDirectory, { recursive: true });
      await writeFile(uploadPath, optimized.buffer);
      mediaUrl = `/uploads/${safeFileName}`;
    }
  } catch (error) {
    return adminSetupErrorResponse(error);
  }

  // 4. Update SiteContent and handle replacement
  let content = await getSiteContent();

  const mediaType: "image" | "video" | "document" | "icon" =
    file.type === "application/pdf"
      ? "document"
      : file.type === "image/svg+xml"
        ? "icon"
        : file.type.startsWith("video/")
          ? "video"
          : "image";

  const newMediaRecord = {
    id: replacesId || crypto.randomUUID(),
    filename: file.name.replace(/[^\w.\- ]/g, ""),
    url: mediaUrl,
    type: mediaType,
    size: optimized.buffer.length,
    uploadedAt: new Date().toISOString(),
    usedIn: []
  };

  // If replacing an existing media record or URL
  if (replacesId) {
    content = {
      ...content,
      builder: {
        ...content.builder,
        media: content.builder.media.map((m) => (m.id === replacesId ? newMediaRecord : m))
      }
    };
  } else {
    content = {
      ...content,
      builder: {
        ...content.builder,
        media: [newMediaRecord, ...content.builder.media]
      }
    };
  }

  // If replacing an existing URL, update references in content and clean up unreferenced old Blob
  if (replacesUrl && replacesUrl !== mediaUrl) {
    content = replaceUrlReferencesInContent(content, replacesUrl, mediaUrl);

    // If the old URL was a Vercel Blob and is no longer used anywhere, clean it up
    await deleteBlobIfUnreferenced(content, replacesUrl);
  }

  try {
    await saveSiteContent(content);
    revalidatePortfolioContent();
  } catch (error) {
    return adminSetupErrorResponse(error);
  }

  return NextResponse.json(
    {
      ok: true,
      url: newMediaRecord.url,
      media: newMediaRecord,
      storage: usesBlobStorage ? "vercel-blob" : "local",
      message: usesBlobStorage
        ? "Image permanently stored in Vercel Cloud Blob Storage."
        : "Image saved to local storage (Connect Vercel Blob for permanent cloud storage)."
    },
    { headers: contentJsonHeaders() }
  );
}
