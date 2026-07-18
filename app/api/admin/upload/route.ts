import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { assertDatabaseReady, getSiteContent, isDatabaseConfigured, saveSiteContent } from "@/lib/content-store";
import { adminSetupErrorResponse, requireAdminMutation } from "@/lib/admin-api";

export const runtime = "nodejs";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "video/mp4", "video/webm", "application/pdf"]);
const maxImageUploadSize = 8 * 1024 * 1024;
const maxVideoUploadSize = 25 * 1024 * 1024;
const maxVercelServerUploadSize = 4 * 1024 * 1024;

export async function POST(request: Request) {
  const denied = await requireAdminMutation(request);

  if (denied) {
    return denied;
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || !allowedTypes.has(file.type)) {
    return NextResponse.json({ message: "Upload a JPG, PNG, WebP, GIF, SVG, MP4, WebM, or PDF file." }, { status: 400 });
  }

  const usesBlobStorage = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  if (process.env.VERCEL && !isDatabaseConfigured()) {
    return NextResponse.json({ message: "Media metadata storage requires Neon PostgreSQL. Add DATABASE_URL from the Vercel Neon integration." }, { status: 503 });
  }
  if (process.env.VERCEL && !usesBlobStorage) {
    return NextResponse.json({ message: "Media uploads require Vercel Blob. Connect a Blob store to add BLOB_READ_WRITE_TOKEN." }, { status: 503 });
  }
  if (process.env.VERCEL) {
    try {
      await assertDatabaseReady("Media metadata storage");
    } catch (error) {
      return adminSetupErrorResponse(error);
    }
  }

  const maxUploadSize = usesBlobStorage || process.env.VERCEL
    ? maxVercelServerUploadSize
    : file.type.startsWith("video/")
      ? maxVideoUploadSize
      : maxImageUploadSize;
  if (file.size > maxUploadSize) {
    return NextResponse.json({ message: `File is too large. Maximum upload size is ${Math.floor(maxUploadSize / 1024 / 1024)} MB.` }, { status: 400 });
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "png";
  const safeName = `${crypto.randomUUID()}.${extension}`;
  let mediaUrl: string;

  if (usesBlobStorage) {
    const blob = await put(`portfolio/${safeName}`, file, { access: "public" });
    mediaUrl = blob.url;
  } else {
    const uploadDirectory = path.join(process.cwd(), "public", "uploads");
    const uploadPath = path.join(uploadDirectory, safeName);
    const arrayBuffer = await file.arrayBuffer();
    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(uploadPath, Buffer.from(arrayBuffer));
    mediaUrl = `/uploads/${safeName}`;
  }

  const content = await getSiteContent();
  const mediaType: "image" | "video" | "document" | "icon" =
    file.type === "application/pdf" ? "document" : file.type === "image/svg+xml" ? "icon" : file.type.startsWith("video/") ? "video" : "image";
  const media = {
    id: crypto.randomUUID(),
    filename: file.name.replace(/[^\w.\- ]/g, ""),
    url: mediaUrl,
    type: mediaType,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    usedIn: []
  };

  try {
    await saveSiteContent({
      ...content,
      builder: {
        ...content.builder,
        media: [media, ...content.builder.media]
      }
    });
  } catch (error) {
    return adminSetupErrorResponse(error);
  }

  return NextResponse.json({ url: media.url, media });
}
