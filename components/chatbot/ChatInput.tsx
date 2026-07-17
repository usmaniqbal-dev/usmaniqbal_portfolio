"use client";

import { useState } from "react";
import { Send } from "lucide-react";

// Text composer with Enter-to-send, Shift+Enter newline, and a 500-character limit.
export default function ChatInput({ placeholder, disabled, onSend }: { placeholder: string; disabled: boolean; onSend: (value: string) => void }) {
  const [value, setValue] = useState("");
  const remaining = 500 - value.length;

  function send() {
    const trimmed = value.trim();
    if (!trimmed || disabled) {
      return;
    }
    onSend(trimmed);
    setValue("");
  }

  return (
    <div className="border-t border-white/10 bg-black/20 p-3">
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          maxLength={500}
          rows={1}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
          className="max-h-28 min-h-11 flex-1 resize-none rounded-[8px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--chat-primary)] disabled:opacity-60"
        />
        <button
          type="button"
          disabled={disabled || !value.trim()}
          onClick={send}
          aria-label="Send message"
          className="grid h-11 w-11 place-items-center rounded-full bg-[var(--chat-primary)] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
      <p className={`mt-1 text-right text-xs ${remaining < 50 ? "text-yellow-200" : "text-white/35"}`}>{remaining}</p>
    </div>
  );
}
