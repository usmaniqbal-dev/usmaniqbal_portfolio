import { list, get } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, "..", "migration-staging", "blobs");

async function main() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error("BLOB_READ_WRITE_TOKEN is required in .env.local");
    process.exit(1);
  }

  await mkdir(outputDir, { recursive: true });

  console.log("[export-blobs] Listing all blobs in Vercel Blob store...");
  const { blobs } = await list({ token });
  console.log(`[export-blobs] Found ${blobs.length} blobs.`);

  const manifest = [];

  for (let i = 0; i < blobs.length; i++) {
    const b = blobs[i];
    console.log(`[export-blobs] [${i + 1}/${blobs.length}] Downloading: ${b.pathname} (${b.size} bytes)...`);

    try {
      const res = await get(b.pathname, { token, access: "private" });
      if (!res || !res.stream) {
        throw new Error("Could not retrieve stream");
      }

      // Read response stream to buffer
      const response = new Response(res.stream);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Create local file path preserving directory structure
      const localFilePath = path.join(outputDir, ...b.pathname.split("/"));
      await mkdir(path.dirname(localFilePath), { recursive: true });
      await writeFile(localFilePath, buffer);

      manifest.push({
        pathname: b.pathname,
        localPath: localFilePath,
        size: buffer.length,
        contentType: res.blob.contentType,
        uploadedAt: b.uploadedAt,
        url: b.url
      });
      console.log(`[export-blobs] Successfully saved: ${b.pathname} (${buffer.length} bytes)`);
    } catch (err) {
      console.error(`[export-blobs] Failed to download ${b.pathname}:`, err.message);
    }
  }

  const manifestPath = path.join(outputDir, "manifest.json");
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`[export-blobs] Staging complete! ${manifest.length}/${blobs.length} blobs exported.`);
  console.log(`[export-blobs] Manifest saved to: ${manifestPath}`);
}

main().catch((err) => {
  console.error("[export-blobs] Fatal error:", err);
  process.exit(1);
});
