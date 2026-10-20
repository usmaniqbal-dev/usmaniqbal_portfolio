import { readFileSync } from "fs";
import path from "path";

const tomlPath = path.join(process.env.APPDATA, "xdg.config", ".wrangler", "config", "default.toml");
const toml = readFileSync(tomlPath, "utf8");
const token = toml.match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const accountId = "20225cb5eefe5e4b3df40dd8023b83f3";

async function run() {
  // Check existing domains on the account
  const listResp = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/domains`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log("List worker domains:", await listResp.json());

  // Check adding www.usmaniqbal.tech as a custom domain
  const putWwwResp = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/domains`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      hostname: "www.usmaniqbal.tech",
      service: "usmaniqbal-portfolio",
      environment: "production"
    })
  });
  console.log("Put worker domain (www.usmaniqbal.tech):", await putWwwResp.json());
}

run().catch(console.error);
