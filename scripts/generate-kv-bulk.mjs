import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.join(__dirname, "..", "migration-staging", "blobs", "manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

const bulk = manifest.map((item) => {
  const fileBuffer = readFileSync(item.localPath);
  return {
    key: item.pathname,
    value: fileBuffer.toString("base64"),
    base64: true,
    metadata: {
      contentType: item.contentType || "image/webp",
      size: item.size
    }
  };
});

const outPath = path.join(__dirname, "kv-bulk.json");
writeFileSync(outPath, JSON.stringify(bulk), "utf8");
console.log(`[kv-bulk] Generated bulk JSON with ${bulk.length} files at ${outPath}`);
