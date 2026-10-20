import { readFileSync } from "fs";
import path from "path";

const tomlPath = path.join(process.env.APPDATA, "xdg.config", ".wrangler", "config", "default.toml");
const toml = readFileSync(tomlPath, "utf8");
const token = toml.match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const zoneId = "a95f2c307fad0680b5923879b5a60d15";

async function checkDNS() {
  const resp = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await resp.json();
  console.log("DNS records response:", JSON.stringify(data, null, 2));

  const zoneResp = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const zoneData = await zoneResp.json();
  console.log("\nZone Details response:", JSON.stringify(zoneData, null, 2));

  const accountId = "20225cb5eefe5e4b3df40dd8023b83f3";
  const domResp = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/domains`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const domData = await domResp.json();
  console.log("\nWorker Custom Domains response:", JSON.stringify(domData, null, 2));
}

checkDNS().catch(console.error);
