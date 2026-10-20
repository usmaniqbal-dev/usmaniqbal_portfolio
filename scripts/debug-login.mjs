import { readFileSync } from "fs";
const envContent = readFileSync(".env.local", "utf8");
const username = envContent.match(/ADMIN_USERNAME\s*=\s*(.*)/)?.[1]?.trim().replace(/^['"]|['"]$/g, "") || "adminusman";
const password = envContent.match(/ADMIN_PASSWORD\s*=\s*(.*)/)?.[1]?.trim().replace(/^['"]|['"]$/g, "");
const BASE_URL = "https://usmaniqbal-portfolio.usmaniqbal-dev.workers.dev";

const r = await fetch(BASE_URL + "/api/admin/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username, password })
});
console.log("Status:", r.status);
console.log("Cookies:", r.headers.get("set-cookie"));
console.log("Body:", await r.json());
