"use client";

import Image from "next/image";

// Shows the assistant avatar and animated typing dots while a response streams.
export default function TypingIndicator({ avatar }: { avatar: string }) {
  return (
    <div className="flex items-end gap-2">
      <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/10 bg-black/40">
        <Image src={avatar} alt="Assistant" fill sizes="32px" className="object-cover object-top" />
      </div>
      <div className="flex gap-1 rounded-[8px] border border-white/10 bg-white/[0.06] px-4 py-3">
        {[0, 1, 2].map((dot) => (
          <span key={dot} className="h-2 w-2 animate-bounce rounded-full bg-[var(--chat-primary)]" style={{ animationDelay: `${dot * 110}ms` }} />
        ))}
      </div>
    </div>
  );
}
