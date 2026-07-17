"use client";

import Image from "next/image";
import { RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import type { ChatMessageItem } from "@/hooks/useChatbot";

// Renders basic markdown safely for assistant messages without adding a dependency.
function renderMarkdown(text: string) {
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br />");
}

// Displays one chat bubble with avatar, hover timestamp, and retry support for failed bot messages.
export default function ChatMessage({ message, avatar, onRetry }: { message: ChatMessageItem; avatar: string; onRetry?: () => void }) {
  const isUser = message.role === "user";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`group flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser ? (
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/10 bg-black/40">
          <Image src={avatar} alt="Assistant" fill sizes="32px" className="object-cover object-top" />
        </div>
      ) : null}
      <div className={`max-w-[78%] rounded-[8px] px-4 py-3 text-sm leading-6 shadow-lg ${isUser ? "bg-[var(--chat-primary)] text-black" : "border border-white/10 bg-white/[0.07] text-white"}`}>
        <div className="prose-chat" dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content || "...") }} />
        <div className="mt-2 hidden items-center gap-2 text-xs opacity-55 group-hover:flex">
          <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          {message.error && onRetry ? (
            <button type="button" onClick={onRetry} className="inline-flex items-center gap-1 font-bold">
              <RotateCcw size={12} />
              Retry
            </button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
