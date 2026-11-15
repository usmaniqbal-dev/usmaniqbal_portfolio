"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Download, ExternalLink, Eye, FileText, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import type { CvContent } from "@/types/site-content";

export default function CvViewer({ cv }: { cv?: CvContent }) {
  const [protectedMode, setProtectedMode] = useState(false);
  const pdfUrl = cv?.url && cv.url !== "/cv" ? cv.url : null;
  const fileName = cv?.fileName || "Usman_Iqbal_CV.pdf";

  useEffect(() => {
    const blockShortcut = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && ["c", "p", "s", "u"].includes(key)) {
        // If it's a PDF, let the browser handle it if user wants, but keep watermark in image mode
        if (!pdfUrl) {
          event.preventDefault();
        }
      }
    };
    const updateVisibility = () => setProtectedMode(document.hidden);

    window.addEventListener("keydown", blockShortcut);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      window.removeEventListener("keydown", blockShortcut);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, [pdfUrl]);

  return (
    <main
      className="cv-viewer-shell min-h-screen bg-[#03071c] px-3 py-4 text-white sm:px-6 sm:py-6"
      onContextMenu={(event) => {
        if (!pdfUrl) event.preventDefault();
      }}
      onCopy={(event) => {
        if (!pdfUrl) event.preventDefault();
      }}
    >
      <header className="no-print mx-auto mb-4 flex max-w-5xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#071033]/90 px-4 py-3 backdrop-blur-xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-white/72 transition hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to Portfolio
        </Link>
        <div className="flex items-center gap-3">
          {pdfUrl && (
            <>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white transition hover:border-[#16f2a4] hover:text-[#16f2a4]"
              >
                <ExternalLink size={14} /> Open in New Tab
              </a>
              <a
                href={pdfUrl}
                download={fileName}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#16f2a4] px-3 py-1.5 text-xs font-black text-black transition hover:bg-white"
              >
                <Download size={14} /> Download PDF
              </a>
            </>
          )}
          <div className="flex items-center gap-2 text-sm font-semibold text-white/65">
            <ShieldCheck size={18} className="text-[#ff7417]" />
            Verified CV
          </div>
        </div>
      </header>

      <section className="cv-protected-document relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#091234] p-2 shadow-2xl sm:p-4">
        <div className="mb-3 flex items-center justify-between px-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
          <span className="flex items-center gap-2">
            <FileText size={15} /> {fileName}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={15} /> Live CV Document
          </span>
        </div>

        {pdfUrl ? (
          <div className="relative mx-auto w-full overflow-hidden rounded-lg bg-neutral-900">
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=0`}
              title="Usman Iqbal CV Document"
              className="h-[80vh] w-full rounded-lg border-0 bg-white"
            />
          </div>
        ) : (
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
        )}
      </section>

      <p className="print-message hidden">This CV is available in protected view only.</p>
    </main>
  );
}
