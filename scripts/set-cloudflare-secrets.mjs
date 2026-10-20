import { readFileSync, existsSync } from "fs";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");

if (!existsSync(envPath)) {
  console.log("No .env.local found.");
  process.exit(0);
}

const envContent = readFileSync(envPath, "utf8");
const secrets = {};

for (const line of envContent.split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
  if (match) {
    const key = match[1].trim();
    const val = match[2].trim().replace(/^['"]|['"]$/g, "");
    // Only upload private server secrets, not public NEXT_PUBLIC_* vars
    if (!key.startsWith("NEXT_PUBLIC_") && val) {
      secrets[key] = val;
    }
  }
}

async function putSecret(key, value) {
  return new Promise((resolve, reject) => {
    console.log(`[set-secret] Setting secret: ${key}...`);
    const child = spawn("npx", ["wrangler", "secret", "put", key], {
      shell: true,
      stdio: ["pipe", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (d) => { stdout += d.toString(); });
    child.stderr.on("data", (d) => { stderr += d.toString(); });

    child.stdin.write(value);
    child.stdin.end();

    child.on("close", (code) => {
      if (code === 0) {
        console.log(`[set-secret] Successfully configured secret: ${key}`);
        resolve();
      } else {
        console.error(`[set-secret] Failed for ${key}:`, stderr || stdout);
        reject(new Error(`Exit code ${code}`));
      }
    });
  });
}

async function main() {
  for (const [k, v] of Object.entries(secrets)) {
    try {
      await putSecret(k, v);
    } catch (e) {
      console.warn(`[set-secret] Skipping ${k} due to error:`, e.message);
    }
  }
  console.log("[set-secret] All secrets configured successfully.");
}

main();
