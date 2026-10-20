import { readFileSync } from "fs";
import path from "path";

const tomlPath = path.join(process.env.APPDATA, "xdg.config", ".wrangler", "config", "default.toml");
const toml = readFileSync(tomlPath, "utf8");
const token = toml.match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const zoneId = "a95f2c307fad0680b5923879b5a60d15";

async function addRoute() {
  console.log("Adding worker route for apex domain usmaniqbal.tech/*...");
  const resp = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/workers/routes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      pattern: "usmaniqbal.tech/*",
      script: "usmaniqbal-portfolio"
    })
  });

  const data = await resp.json();
  console.log("Add route response:", JSON.stringify(data, null, 2));
}

addRoute().catch(console.error);
