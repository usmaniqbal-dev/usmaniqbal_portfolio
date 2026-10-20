import { readFileSync } from "fs";
import path from "path";

const tomlPath = path.join(process.env.APPDATA, "xdg.config", ".wrangler", "config", "default.toml");
const toml = readFileSync(tomlPath, "utf8");
const token = toml.match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const accountId = "20225cb5eefe5e4b3df40dd8023b83f3";

async function run() {
  const resp = await fetch("https://api.cloudflare.com/client/v4/zones", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      account: { id: accountId },
      name: "usmaniqbal.tech",
      type: "full"
    })
  });
  const data = await resp.json();
  console.log("Create zone response:", JSON.stringify(data, null, 2));
}

run().catch(console.error);
