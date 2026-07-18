import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { sanitizeText } from "@/lib/sanitize";
import { getStoredJson, saveStoredJson } from "@/lib/content-store";

export const runtime = "nodejs";

const submissionsFile = path.join(process.cwd(), ".data", "contact-submissions.json");
const requestLimits = new Map<string, { count: number; resetAt: number }>();

// Returns whether the current visitor remains inside the public form rate limit.
function withinRateLimit(request: Request) {
  const key = request.headers.get("x-forwarded-for") || "local";
  const current = requestLimits.get(key) || { count: 0, resetAt: Date.now() + 60_000 };

  if (Date.now() > current.resetAt) {
    current.count = 0;
    current.resetAt = Date.now() + 60_000;
  }

  if (current.count >= 5) {
    return false;
  }

  requestLimits.set(key, { ...current, count: current.count + 1 });
  return true;
}

// Reads prior form submissions without failing when the local store has not been created yet.
async function readSubmissions() {
  const stored = await getStoredJson<unknown[]>("contact-submissions");
  if (stored) return stored;

  if (process.env.VERCEL) {
    return [];
  }

  try {
    const raw = await readFile(submissionsFile, "utf8");
    return JSON.parse(raw) as unknown[];
  } catch {
    return [];
  }
}

// Validates, stores, and acknowledges a public contact-form submission.
export async function POST(request: Request) {
  if (!withinRateLimit(request)) {
    return NextResponse.json({ message: "Please wait a minute before sending another message." }, { status: 429 });
  }

  const body = (await request.json()) as { fields?: Record<string, unknown> };
  const fields = Object.entries(body.fields || {})
    .map(([label, value]) => [sanitizeText(label).slice(0, 80), sanitizeText(value).slice(0, 4000)] as const)
    .filter(([label, value]) => label && value);

  if (!fields.length) {
    return NextResponse.json({ message: "Please complete the contact form before sending." }, { status: 400 });
  }

  const submissions = await readSubmissions();
  const record = {
    id: crypto.randomUUID(),
    fields: Object.fromEntries(fields),
    submittedAt: new Date().toISOString()
  };

  const nextSubmissions = [record, ...submissions].slice(0, 250);
  if (await saveStoredJson("contact-submissions", nextSubmissions)) {
    return NextResponse.json({ ok: true });
  }
  if (process.env.VERCEL) {
    return NextResponse.json({ message: "Contact storage requires Neon PostgreSQL. Add DATABASE_URL from the Vercel Neon integration." }, { status: 503 });
  }

  await mkdir(path.dirname(submissionsFile), { recursive: true });
  await writeFile(submissionsFile, JSON.stringify(nextSubmissions, null, 2), "utf8");

  return NextResponse.json({ ok: true });
}
