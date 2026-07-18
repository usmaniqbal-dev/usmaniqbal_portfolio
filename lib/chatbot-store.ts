import "server-only";

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { getStoredJson, saveStoredJson } from "@/lib/content-store";

export type ChatbotSettings = {
  enabled: boolean;
  position: "bottom-right" | "bottom-left";
  bubbleColor: string;
  windowTitle: string;
  botName: string;
  botAvatar: string;
  welcomeMessage: string;
  placeholder: string;
  primaryColor: string;
  hiddenPages: string[];
  showSuggestions: boolean;
  suggestions: string[];
  lastTrainedAt: string;
};

export type KnowledgeBase = {
  owner: Record<string, string>;
  skills: Array<Record<string, unknown>>;
  projects: Array<Record<string, unknown>>;
  experience: Array<Record<string, unknown>>;
  education: Array<Record<string, unknown>>;
  services: Array<Record<string, unknown>>;
  testimonials: Array<Record<string, unknown>>;
  contact: Record<string, string>;
  faq: Array<{ question: string; answer: string }>;
  customQA: Array<{ question: string; answer: string }>;
};

const dataDirectory = path.join(process.cwd(), "data");
const settingsPath = path.join(dataDirectory, "chatbot-settings.json");
const knowledgePath = path.join(dataDirectory, "knowledge-base.json");
const analyticsPath = path.join(dataDirectory, "chat-analytics.json");

export const defaultChatbotSettings: ChatbotSettings = {
  enabled: true,
  position: "bottom-right",
  bubbleColor: "#16f2a4",
  windowTitle: "AI Assistant",
  botName: "Usman's AI Assistant",
  botAvatar: "/images/usman-profile.png",
  welcomeMessage: "Hi, I am Usman's AI assistant. Ask me about skills, projects, services, or availability.",
  placeholder: "Ask me about my work...",
  primaryColor: "#16f2a4",
  hiddenPages: [],
  showSuggestions: true,
  suggestions: ["What are your skills?", "Tell me about your projects", "What services do you offer?", "How can I contact you?"],
  lastTrainedAt: ""
};

export const defaultKnowledgeBase: KnowledgeBase = {
  owner: { name: "", title: "", bio: "", email: "", location: "", phone: "", availability: "" },
  skills: [],
  projects: [],
  experience: [],
  education: [],
  services: [],
  testimonials: [],
  contact: { email: "", github: "", linkedin: "", twitter: "", website: "" },
  faq: [],
  customQA: []
};

// Reads a JSON file from /data with a typed fallback.
async function readJson<T>(filePath: string, dataKey: string, fallback: T): Promise<T> {
  const stored = await getStoredJson<Partial<T>>(dataKey);
  if (stored) {
    return { ...fallback, ...stored } as T;
  }

  if (process.env.VERCEL) {
    return fallback;
  }

  try {
    return { ...fallback, ...(JSON.parse(await readFile(filePath, "utf8")) as Partial<T>) } as T;
  } catch {
    await writeJson(filePath, dataKey, fallback);
    return fallback;
  }
}

// Writes a JSON file with stable formatting.
async function writeJson(filePath: string, dataKey: string, payload: unknown) {
  if (await saveStoredJson(dataKey, payload)) {
    return;
  }
  if (process.env.VERCEL) {
    throw new Error("Chatbot storage requires Neon PostgreSQL. Add DATABASE_URL from the Vercel Neon integration, then redeploy.");
  }
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
}

// Loads chatbot appearance and behavior settings.
export async function getChatbotSettings() {
  return readJson<ChatbotSettings>(settingsPath, "chatbot-settings", defaultChatbotSettings);
}

// Saves chatbot appearance and behavior settings.
export async function saveChatbotSettings(settings: ChatbotSettings) {
  await writeJson(settingsPath, "chatbot-settings", settings);
  return settings;
}

// Loads the editable chatbot knowledge base.
export async function getKnowledgeBase() {
  return readJson<KnowledgeBase>(knowledgePath, "chatbot-knowledge", defaultKnowledgeBase);
}

// Saves the editable chatbot knowledge base.
export async function saveKnowledgeBase(knowledge: KnowledgeBase) {
  await writeJson(knowledgePath, "chatbot-knowledge", knowledge);
  return knowledge;
}

// Loads basic chatbot analytics.
export async function getChatbotAnalytics() {
  return readJson(analyticsPath, "chatbot-analytics", { totalConversationsToday: 0, mostAskedQuestions: [], averageResponseTimeMs: 0, events: [] });
}
