import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { del } from "@vercel/blob";
import sharp from "sharp";
import type { SiteContent } from "@/types/site-content";

export const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "application/pdf"
]);

export const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_UPLOAD_BYTES = 30 * 1024 * 1024; // 30MB

export function isBlobStorageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

// Configured access mode for Vercel Blob store
export function getBlobAccessMode(): "private" {
  return "private";
}

// Extracts the actual private blob URL or relative pathname from an authenticated serving route URL
export function extractBlobTarget(urlOrPathname?: string | null): string {
  if (!urlOrPathname || typeof urlOrPathname !== "string") return "";
  const trimmed = urlOrPathname.trim();

  if (trimmed.startsWith("/api/blob")) {
    try {
      const parsed = new URL(trimmed, "https://dummy.local");
      const target = parsed.searchParams.get("url") || parsed.searchParams.get("pathname");
      if (target) return target.trim();
    } catch {
      // ignore
    }
  }

  return trimmed;
}

export function isVercelBlobUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  return (
    url.includes(".blob.vercel-storage.com") ||
    url.includes("vercel-storage.com") ||
    url.startsWith("/api/blob")
  );
}

// Generates a short-lived HMAC signed URL for secure time-limited viewing
export function createSignedBlobUrl(
  urlOrPathname: string,
  expiresInSeconds = 3600 // 1 hour default
): string {
  const secret = process.env.AUTH_SECRET || "nurax-blob-secret-signing-key-32chars";
  const expires = Date.now() + expiresInSeconds * 1000;
  const target = extractBlobTarget(urlOrPathname);
  const data = `${target}:${expires}`;
  const sig = createHmac("sha256", secret).update(data).digest("hex");

  const query = new URLSearchParams({
    url: target,
    expires: String(expires),
    sig
  });

  return `/api/blob?${query.toString()}`;
}

// Verifies the HMAC signature and expiration on a signed blob request
export function verifySignedBlobUrl(
  target: string,
  expiresStr: string | null,
  sig: string | null
): boolean {
  if (!target || !expiresStr || !sig) return false;
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || expires < Date.now()) {
    return false; // Expired
  }

  const secret = process.env.AUTH_SECRET || "nurax-blob-secret-signing-key-32chars";
  const data = `${target}:${expires}`;
  const expected = createHmac("sha256", secret).update(data).digest("hex");

  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return false;
  return timingSafeEqual(sigBuf, expBuf);
}

// Scans all public content fields to see if a URL is referenced
export function findUrlReferencesInContent(content: SiteContent, targetUrl: string): string[] {
  if (!targetUrl || typeof targetUrl !== "string") return [];
  const cleanTarget = targetUrl.trim();
  const rawTarget = extractBlobTarget(cleanTarget);
  const references: string[] = [];

  const matches = (candidate?: string) => {
    if (!candidate) return false;
    const cleanCand = candidate.trim();
    return cleanCand === cleanTarget || (rawTarget ? extractBlobTarget(cleanCand) === rawTarget : false);
  };

  // Home section
  if (matches(content.home?.heroImage) || matches(content.home?.profileImage)) {
    references.push("Homepage Hero Profile Photo");
  }
  if (matches(content.home?.heroBackgroundUrl)) {
    references.push("Homepage Hero Background Media");
  }

  // About section
  if (matches(content.about?.image)) {
    references.push("About Section Profile Image");
  }

  // SEO & Brand
  if (matches(content.seo?.ogImage)) {
    references.push("Brand SEO Share Image (OG Image)");
  }
  if (matches(content.builder?.settings?.logoUrl)) {
    references.push("Brand Header Logo");
  }

  // Projects
  if (Array.isArray(content.projects)) {
    for (const project of content.projects) {
      if (matches(project.image)) {
        references.push(`Project Card: "${project.title || project.id}"`);
      }
    }
  }

  // Services
  if (Array.isArray(content.services)) {
    for (const service of content.services) {
      if (matches(service.image)) {
        references.push(`Service Card Image: "${service.title || service.id}"`);
      }
      if (matches(service.icon)) {
        references.push(`Service Icon: "${service.title || service.id}"`);
      }
    }
  }

  // Skills
  if (Array.isArray(content.skills)) {
    for (const skill of content.skills) {
      if (matches(skill.icon)) {
        references.push(`Skill Icon: "${skill.name || skill.id}"`);
      }
    }
  }

  // Custom pages / templates
  if (Array.isArray(content.builder?.pages)) {
    for (const page of content.builder.pages) {
      const pageStr = JSON.stringify(page.blocks || []);
      if (pageStr.includes(cleanTarget) || (rawTarget && pageStr.includes(rawTarget))) {
        references.push(`Custom Page: "${page.title || page.slug}"`);
      }
    }
  }

  return references;
}

// Replaces every occurrence of an old image URL with a new URL across all content fields
export function replaceUrlReferencesInContent(
  content: SiteContent,
  oldUrl: string,
  newUrl: string
): SiteContent {
  if (!oldUrl || !newUrl || oldUrl === newUrl) return content;

  const next: SiteContent = JSON.parse(JSON.stringify(content));

  if (next.home?.heroImage === oldUrl) next.home.heroImage = newUrl;
  if (next.home?.profileImage === oldUrl) next.home.profileImage = newUrl;
  if (next.home?.heroBackgroundUrl === oldUrl) next.home.heroBackgroundUrl = newUrl;

  if (next.about?.image === oldUrl) next.about.image = newUrl;

  if (next.seo?.ogImage === oldUrl) next.seo.ogImage = newUrl;
  if (next.builder?.settings?.logoUrl === oldUrl) next.builder.settings.logoUrl = newUrl;

  if (Array.isArray(next.projects)) {
    for (const p of next.projects) {
      if (p.image === oldUrl) p.image = newUrl;
    }
  }

  if (Array.isArray(next.services)) {
    for (const s of next.services) {
      if (s.image === oldUrl) s.image = newUrl;
      if (s.icon === oldUrl) s.icon = newUrl;
    }
  }

  if (Array.isArray(next.skills)) {
    for (const sk of next.skills) {
      if (sk.icon === oldUrl) sk.icon = newUrl;
    }
  }

  return next;
}

// Clears occurrences of target URL when force-deleted
export function removeUrlReferencesFromContent(content: SiteContent, targetUrl: string): SiteContent {
  if (!targetUrl) return content;
  const next: SiteContent = JSON.parse(JSON.stringify(content));

  if (next.home?.heroImage === targetUrl) next.home.heroImage = "";
  if (next.home?.profileImage === targetUrl) next.home.profileImage = "";
  if (next.home?.heroBackgroundUrl === targetUrl) next.home.heroBackgroundUrl = "";

  if (next.about?.image === targetUrl) next.about.image = "";

  if (next.seo?.ogImage === targetUrl) next.seo.ogImage = "";
  if (next.builder?.settings?.logoUrl === targetUrl) next.builder.settings.logoUrl = "";

  if (Array.isArray(next.projects)) {
    for (const p of next.projects) {
      if (p.image === targetUrl) p.image = "";
    }
  }

  if (Array.isArray(next.services)) {
    for (const s of next.services) {
      if (s.image === targetUrl) s.image = "";
      if (s.icon === targetUrl) s.icon = "";
    }
  }

  if (Array.isArray(next.skills)) {
    for (const sk of next.skills) {
      if (sk.icon === targetUrl) sk.icon = "";
    }
  }

  return next;
}

// Safely deletes a Blob from Vercel Blob only if no other content references it
export async function deleteBlobIfUnreferenced(
  content: SiteContent,
  targetUrl: string
): Promise<{ deleted: boolean; reason?: string }> {
  if (!targetUrl || !isVercelBlobUrl(targetUrl)) {
    return { deleted: false, reason: "Not a Vercel Blob URL." };
  }

  const refs = findUrlReferencesInContent(content, targetUrl);
  if (refs.length > 0) {
    return { deleted: false, reason: `URL still in use: ${refs.join(", ")}` };
  }

  if (!isBlobStorageConfigured()) {
    return { deleted: false, reason: "BLOB_READ_WRITE_TOKEN is not configured." };
  }

  const cleanTarget = extractBlobTarget(targetUrl);

  try {
    await del(cleanTarget);
    return { deleted: true };
  } catch (err) {
    console.warn("[vercel-blob] Failed to delete blob:", cleanTarget, err);
    return { deleted: false, reason: err instanceof Error ? err.message : "Delete failed." };
  }
}

// Optimizes image buffer with sharp before uploading to Vercel Blob
export async function optimizeImageBuffer(
  buffer: Buffer,
  mimeType: string,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<{ buffer: Buffer; contentType: string; extension: string }> {
  // SVGs, animated GIFs, PDFs, and videos are passed through untouched
  if (
    mimeType === "image/svg+xml" ||
    mimeType === "image/gif" ||
    mimeType.startsWith("video/") ||
    mimeType === "application/pdf"
  ) {
    const ext =
      mimeType === "image/svg+xml"
        ? "svg"
        : mimeType === "image/gif"
          ? "gif"
          : mimeType === "application/pdf"
            ? "pdf"
            : "mp4";
    return { buffer, contentType: mimeType, extension: ext };
  }

  try {
    const { maxWidth = 2560, maxHeight = 2560, quality = 85 } = options;
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // If already webp and smaller than 1.5MB, preserve as is
    if (metadata.format === "webp" && buffer.length < 1.5 * 1024 * 1024) {
      return { buffer, contentType: "image/webp", extension: "webp" };
    }

    const processed = await image
      .rotate() // auto-orient EXIF
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: "inside",
        withoutEnlargement: true
      })
      .webp({ quality })
      .toBuffer();

    return {
      buffer: processed,
      contentType: "image/webp",
      extension: "webp"
    };
  } catch (error) {
    console.warn("[sharp-optimize] Fallback to original buffer:", error);
    const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
    return { buffer, contentType: mimeType, extension: ext };
  }
}
