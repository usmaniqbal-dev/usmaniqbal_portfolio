"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChatbotSettings } from "@/lib/chatbot-store";

export type ChatRole = "user" | "assistant";

export type ChatMessageItem = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  error?: boolean;
};

const storageKey = "portfolio-chatbot-history";
const maxMessages = 50;

// Manages chatbot settings, message streaming, suggestions, and local persistence.
export function useChatbot() {
  const [settings, setSettings] = useState<ChatbotSettings | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      setMessages(JSON.parse(saved) as ChatMessageItem[]);
    }

    fetch("/api/chat/settings")
      .then((response) => response.json())
      .then((data: ChatbotSettings) => setSettings(data))
      .catch(() => setSettings(null));

    fetch("/api/chat/suggestions")
      .then((response) => response.json())
      .then((data: string[]) => setSuggestions(data.slice(0, 4)))
      .catch(() => setSuggestions(["What are your skills?", "Tell me about your projects", "How can I contact you?", "What services do you offer?"]));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(messages.slice(-maxMessages)));
  }, [messages]);

  const hasStarted = useMemo(() => messages.length > 0, [messages.length]);

  // Sends a message to the streaming Next.js proxy and appends streamed text live.
  async function sendMessage(text: string) {
    const trimmed = text.trim().slice(0, 500);
    if (!trimmed || isResponding) {
      return;
    }

    const userMessage: ChatMessageItem = { id: crypto.randomUUID(), role: "user", content: trimmed, createdAt: new Date().toISOString() };
    const assistantId = crypto.randomUUID();
    const assistantMessage: ChatMessageItem = { id: assistantId, role: "assistant", content: "", createdAt: new Date().toISOString() };
    setMessages((current) => [...current, userMessage, assistantMessage].slice(-maxMessages));
    setIsResponding(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages.map((message) => ({ role: message.role, content: message.content }))
        })
      });

      if (!response.ok || !response.body) {
        throw new Error("Chat request failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const result = await reader.read();
        done = result.done;
        const chunk = decoder.decode(result.value || new Uint8Array(), { stream: !done });
        if (chunk) {
          setMessages((current) => current.map((message) => (message.id === assistantId ? { ...message, content: message.content + chunk } : message)));
        }
      }
    } catch {
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? { ...message, content: "I could not reach the AI assistant right now. Please retry in a moment.", error: true }
            : message
        )
      );
    } finally {
      setIsResponding(false);
    }
  }

  // Clears persisted chat history.
  function clearMessages() {
    setMessages([]);
    window.localStorage.removeItem(storageKey);
  }

  return { settings, messages, suggestions, hasStarted, isResponding, sendMessage, clearMessages };
}
