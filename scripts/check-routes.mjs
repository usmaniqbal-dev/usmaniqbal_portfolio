import { readFileSync } from "fs";
import path from "path";

const tomlPath = path.join(process.env.APPDATA, "xdg.config", ".wrangler", "config", "default.toml");
const toml = readFileSync(tomlPath, "utf8");
const token = toml.match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const zoneId = "a95f2c307fad0680b5923879b5a60d15";

async function checkRoutes() {
  const resp = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/workers/routes`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await resp.json();
  console.log("Worker routes in zone:", JSON.stringify(data, null, 2));
}

checkRoutes().catch(console.error);
