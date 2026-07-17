"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Eye, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

export default function CvViewer() {
  const [protectedMode, setProtectedMode] = useState(false);

  useEffect(() => {
    const blockShortcut = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && ["c", "p", "s", "u"].includes(key)) {
        event.preventDefault();
      }
    };
    const updateVisibility = () => setProtectedMode(document.hidden);

    window.addEventListener("keydown", blockShortcut);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      window.removeEventListener("keydown", blockShortcut);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  return (
    <main
      className="cv-viewer-shell min-h-screen bg-[#03071c] px-3 py-4 text-white sm:px-6 sm:py-6"
      onContextMenu={(event) => event.preventDefault()}
      onCopy={(event) => event.preventDefault()}
      onCut={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
    >
      <header className="no-print mx-auto mb-4 flex max-w-5xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#071033]/90 px-4 py-3 backdrop-blur-xl">
        <Link href="/#home" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-white/72 transition hover:bg-white/5 hover:text-white">
          <ArrowLeft size={18} />
          Back to Portfolio
        </Link>
        <div className="flex items-center gap-2 text-sm font-semibold text-white/65">
          <ShieldCheck size={18} className="text-[#ff7417]" />
          Protected view
        </div>
      </header>

      <section className="cv-protected-document relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#091234] p-2 shadow-2xl sm:p-4">
        <div className="mb-3 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
          <Eye size={15} /> View only
        </div>
        <div className={`relative mx-auto max-w-[900px] overflow-hidden rounded-lg bg-white transition duration-200 ${protectedMode ? "blur-2xl" : ""}`}>
          <Image
            src="/images/usman-cv-preview.png"
            alt="Usman Iqbal CV"
            width={1240}
            height={1754}
            priority
            draggable={false}
            className="pointer-events-none h-auto w-full select-none"
            sizes="(max-width: 960px) 96vw, 900px"
          />
          <div className="pointer-events-none absolute inset-0 select-none" aria-hidden>
            {[18, 48, 78].map((top) => (
              <span
                key={top}
                className="absolute left-1/2 whitespace-nowrap text-lg font-bold uppercase tracking-[0.32em] text-[#10286b]/[0.08] sm:text-2xl"
                style={{ top: `${top}%`, transform: "translate(-50%, -50%) rotate(-24deg)" }}
              >
                View only - Usman Iqbal
              </span>
            ))}
          </div>
          <div className="absolute inset-0 z-10" aria-hidden />
        </div>
      </section>

      <p className="print-message hidden">This CV is available in protected view only.</p>
    </main>
  );
}
