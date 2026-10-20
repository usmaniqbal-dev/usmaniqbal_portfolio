import { readFileSync } from "fs";
import path from "path";

const tomlPath = path.join(process.env.APPDATA, "xdg.config", ".wrangler", "config", "default.toml");
const toml = readFileSync(tomlPath, "utf8");
const match = toml.match(/oauth_token\s*=\s*"([^"]+)"/);

if (!match) {
  console.log("No oauth token found.");
  process.exit(1);
}

const token = match[1];

async function check() {
  const resp = await fetch("https://api.cloudflare.com/client/v4/zones", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await resp.json();
  console.log("Zones count:", data.result?.length || 0);
  if (data.result) {
    for (const z of data.result) {
      console.log(`- ${z.name} (id: ${z.id}, status: ${z.status})`);
    }
  }

  // Also check workers subdomain
  const subResp = await fetch("https://api.cloudflare.com/client/v4/accounts/20225cb5eefe5e4b3df40dd8023b83f3/workers/subdomain", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const subData = await subResp.json();
  console.log("Workers subdomain check:", subData);
}

check().catch(console.error);
