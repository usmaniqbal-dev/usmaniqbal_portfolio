"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Minus, RotateCcw, Trash2, X } from "lucide-react";
import { useChatbot } from "@/hooks/useChatbot";
import ChatInput from "@/components/chatbot/ChatInput";
import ChatMessage from "@/components/chatbot/ChatMessage";
import TypingIndicator from "@/components/chatbot/TypingIndicator";

// Floating AI assistant widget rendered globally from the root layout.
export default function ChatbotWidget() {
  const pathname = usePathname();
  const { settings, messages, suggestions, hasStarted, isResponding, sendMessage, clearMessages } = useChatbot();
  const [open, setOpen] = useState(false);

  if (!settings || !settings.enabled || settings.hiddenPages.includes(pathname)) {
    return null;
  }

  const side = settings.position === "bottom-left" ? "left-4 sm:left-6" : "right-4 sm:right-6";
  const unread = open ? 0 : Math.min(messages.filter((message) => message.role === "assistant").length, 9);
  const style = { "--chat-primary": settings.primaryColor || settings.bubbleColor } as React.CSSProperties;

  return (
    <div className={`fixed bottom-4 z-[90] ${side}`} style={style}>
      <AnimatePresence>
        {open ? (
          <motion.section
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className={`fixed inset-0 flex flex-col border border-white/10 bg-[#07100d]/95 text-white shadow-glow backdrop-blur-md sm:inset-auto sm:bottom-24 ${settings.position === "bottom-left" ? "sm:left-6" : "sm:right-6"} sm:h-[440px] sm:w-[320px] sm:overflow-hidden sm:rounded-[8px]`}
          >
            <header className="flex items-center justify-between border-b border-white/10 bg-black/30 p-4">
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 overflow-hidden rounded-full border border-white/10">
                  <Image src={settings.botAvatar} alt={settings.botName} fill sizes="44px" className="object-cover object-top" />
                </div>
                <div>
                  <p className="font-black">{settings.botName || settings.windowTitle}</p>
                  <p className="flex items-center gap-2 text-xs text-white/55">
                    <span className="h-2 w-2 rounded-full bg-green-400" />
                    Online
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={clearMessages} aria-label="Clear chat" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/62 hover:text-white">
                  <Trash2 size={16} />
                </button>
                <button type="button" onClick={() => setOpen(false)} aria-label="Minimize chat" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/62 hover:text-white">
                  <Minus size={16} />
                </button>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/62 hover:text-white">
                  <X size={16} />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4">
              {!hasStarted ? (
                <div className="mb-4 rounded-[8px] border border-white/10 bg-white/[0.06] p-4 text-sm leading-6 text-white/72">
                  {settings.welcomeMessage}
                </div>
              ) : null}

              {!hasStarted && settings.showSuggestions ? (
                <div className="mb-4 flex flex-wrap gap-2">
                  {(settings.suggestions.length ? settings.suggestions : suggestions).slice(0, 4).map((suggestion) => (
                    <button key={suggestion} type="button" onClick={() => sendMessage(suggestion)} className="rounded-full border border-[var(--chat-primary)]/35 px-3 py-2 text-left text-xs font-bold text-[var(--chat-primary)] hover:bg-[var(--chat-primary)] hover:text-black">
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="grid gap-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} avatar={settings.botAvatar} onRetry={() => sendMessage(messages.find((item) => item.role === "user")?.content || "")} />
                ))}
                {isResponding ? <TypingIndicator avatar={settings.botAvatar} /> : null}
              </div>
            </div>

            <ChatInput placeholder={settings.placeholder} disabled={isResponding} onSend={sendMessage} />
          </motion.section>
        ) : null}
      </AnimatePresence>

      {!open ? (
        <div className="group relative">
          <span className="absolute inset-0 animate-ping rounded-full opacity-30" style={{ backgroundColor: settings.bubbleColor }} />
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Ask me anything"
            className="relative grid h-16 w-16 place-items-center rounded-full text-black shadow-glow transition hover:scale-105"
            style={{ backgroundColor: settings.bubbleColor }}
          >
            {settings.botAvatar ? (
              <span className="relative h-12 w-12 overflow-hidden rounded-full">
                <Image src={settings.botAvatar} alt="Assistant" fill sizes="48px" className="object-cover object-top" />
              </span>
            ) : (
              <Bot size={28} />
            )}
            {unread ? <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-red-500 text-xs font-black text-white">{unread}</span> : null}
          </button>
          <span className="pointer-events-none absolute bottom-full mb-3 hidden rounded-[8px] bg-black px-3 py-2 text-xs font-bold text-white shadow-lg group-hover:block">
            Ask me anything
          </span>
        </div>
      ) : null}
    </div>
  );
}
