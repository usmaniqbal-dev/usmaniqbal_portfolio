import { NextResponse } from "next/server";
import { getKnowledgeBase, type KnowledgeBase } from "@/lib/chatbot-store";

export const runtime = "nodejs";

// Proxies chatbot messages to the Python FastAPI server and streams text back.
export async function POST(request: Request) {
  const payload = await request.json();
  if (!process.env.CHATBOT_API_URL) {
    return localChatResponse(payload.message || "");
  }
  const controller = new AbortController();
  const timeout = windowlessTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(`${process.env.CHATBOT_API_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!response.ok || !response.body) {
      return localChatResponse(payload.message || "");
    }

    return new Response(response.body, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  } catch {
    return localChatResponse(payload.message || "");
  } finally {
    clearTimeout(timeout);
  }
}

// Keeps timeout usage server-safe without relying on browser globals.
function windowlessTimeout(callback: () => void, ms: number) {
  return setTimeout(callback, ms);
}

async function localChatResponse(message: string) {
  const knowledge = await getKnowledgeBase();
  return new Response(buildWebsiteAnswer(message, knowledge), {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function hasAny(query: string, keywords: string[]) {
  return keywords.some((keyword) => query.includes(keyword));
}

function languageMode(message: string) {
  if (/[\u0600-\u06ff]/.test(message)) return "roman-urdu";
  return hasAny(normalizeText(message), ["aap", "ap", "kya", "kia", "kon", "kaun", "hy", "hai", "batao", "btao", "rabta", "kaise", "men", "mein", "ati", "ata"]) ? "roman-urdu" : "english";
}

function introFor(message: string) {
  return languageMode(message) === "roman-urdu" ? "Website ke mutabiq:" : "";
}

function formatList(title: string, rows: Array<Record<string, unknown>>, nameKey: "name" | "title", descKey: "category" | "description") {
  const seen = new Set<string>();
  const lines = rows
    .map((row) => {
      const name = String(row[nameKey] || "").trim();
      const description = String(row[descKey] || "").trim();
      return description ? `${name}: ${description}` : name;
    })
    .filter((line) => {
      const key = normalizeText(line);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8);
  return `${title}:\n${lines.map((line) => `- ${line}`).join("\n")}`;
}

function formatContact(knowledge: KnowledgeBase) {
  const owner = knowledge.owner || {};
  const contact = knowledge.contact || {};
  const parts = [
    owner.email ? `Email: ${owner.email}` : contact.email ? `Email: ${contact.email}` : "",
    owner.phone ? `Phone: ${owner.phone}` : "",
    owner.location ? `Location: ${owner.location}` : "",
    contact.linkedin ? `LinkedIn: ${contact.linkedin}` : "",
    contact.github ? `GitHub: ${contact.github}` : ""
  ].filter(Boolean);
  return `Contact details:\n${parts.map((part) => `- ${part}`).join("\n")}`;
}

function buildWebsiteAnswer(message: string, knowledge: KnowledgeBase) {
  const query = normalizeText(message);
  const prefix = introFor(message);
  const scopedFallback = languageMode(message) === "roman-urdu"
    ? "Main sirf is portfolio website ke mutabiq jawab de sakta hun: Usman Iqbal ki skills, services, projects, availability, aur contact details."
    : "I can answer from Usman Iqbal's portfolio website only: skills, services, projects, availability, and contact details.";

  if (hasAny(query, ["hello", "hi", "hey", "salam", "assalam", "aoa", "سلام"])) {
    return languageMode(message) === "roman-urdu"
      ? "Assalam o Alaikum, main Usman Iqbal ka website assistant hun. Aap skills, services, projects, availability, ya contact details pooch sakte hain."
      : "Hi, I am Usman Iqbal's website assistant. You can ask me about skills, services, projects, availability, or contact details.";
  }

  const customMatch = [...knowledge.customQA, ...knowledge.faq].find((item) => {
    const question = normalizeText(item.question || "");
    return question && (query.includes(question) || question.includes(query));
  });
  if (customMatch?.answer) {
    return prefix ? `${prefix}\n${customMatch.answer}` : customMatch.answer;
  }

  const answer = (() => {
    if (hasAny(query, ["contact", "email", "phone", "call", "whatsapp", "linkedin", "github", "rabta", "raabta", "number", "rabta", "رابطہ"])) return formatContact(knowledge);
    if (hasAny(query, ["skill", "skills", "technology", "tech", "stack", "maharat", "hunr", "ata", "ati", "سکل", "مہارت"])) return formatList("Skills", knowledge.skills, "name", "category");
    if (hasAny(query, ["service", "services", "offer", "kaam", "kam", "work", "khidmat", "provide", "سروس", "کام"])) return formatList("Services", knowledge.services, "title", "description");
    if (hasAny(query, ["project", "projects", "portfolio", "case study", "پروجیکٹ"])) return formatList("Projects", knowledge.projects, "title", "description");
    if (hasAny(query, ["available", "availability", "hire", "freelance", "دستیاب"])) return `Availability: ${knowledge.owner.availability || "Available for new CRM and automation projects"}`;
    if (hasAny(query, ["about", "bio", "who", "usman", "owner", "kon", "kaun", "عثمان", "کون"])) return `About Usman:\n- Name: ${knowledge.owner.name}\n- Title: ${knowledge.owner.title}\n- Bio: ${knowledge.owner.bio}`;
    return "";
  })();

  return answer ? (prefix ? `${prefix}\n${answer}` : answer) : scopedFallback;
}
