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

async function registerSubdomain(name) {
  console.log(`Trying to register subdomain: ${name}...`);
  const resp = await fetch("https://api.cloudflare.com/client/v4/accounts/20225cb5eefe5e4b3df40dd8023b83f3/workers/subdomain", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ subdomain: name })
  });

  const data = await resp.json();
  console.log("Response:", data);
  return data;
}

async function main() {
  const candidates = ["usmaniqbal-dev", "usmaniqbal", "usman-iqbal", "usman-portfolio"];
  for (const cand of candidates) {
    const res = await registerSubdomain(cand);
    if (res.success) {
      console.log(`Successfully registered: ${res.result?.subdomain}.workers.dev!`);
      break;
    }
  }
}

main().catch(console.error);
