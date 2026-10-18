"use client";

import { useEffect, useState } from "react";
import { Shield, X, Eye, Lock, Clock } from "lucide-react";

export default function PrivacyNotice() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleOpenModal = () => setShowModal(true);
    window.addEventListener("open-privacy-modal", handleOpenModal);

    return () => {
      window.removeEventListener("open-privacy-modal", handleOpenModal);
    };
  }, []);

  return (
    <>
      {/* Detailed Privacy Policy Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#090d16] p-6 text-white shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#16f2a4]/15 text-[#16f2a4]">
                  <Shield size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-black">Visitor Analytics &amp; Privacy Policy</h2>
                  <p className="text-xs text-white/50">Usman Iqbal Portfolio (NURAXTECH)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/60 hover:border-white/30 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-6 text-sm text-white/75 leading-relaxed">
              <div>
                <h4 className="flex items-center gap-2 font-bold text-white text-base">
                  <Eye size={18} className="text-[#16f2a4]" />
                  What Information We Collect
                </h4>
                <p className="mt-2 text-xs sm:text-sm">
                  When you browse this portfolio website, we collect minimal, non-invasive technical metrics to understand website readership and optimize user experience:
                </p>
                <ul className="mt-2 list-disc pl-5 space-y-1 text-xs text-white/70">
                  <li><strong>Approximate Location:</strong> Country, region, and city derived from server headers (no precise GPS tracking).</li>
                  <li><strong>Technical Attributes:</strong> Browser family and version, operating system, device form factor (desktop, mobile, tablet), screen resolution, preferred language, and timezone.</li>
                  <li><strong>Usage Metrics:</strong> Visited page URL/path, referral source, and visit timestamp in UTC.</li>
                  <li><strong>Visitor Estimate:</strong> A randomly generated first-party identifier (<code className="text-[#16f2a4]">_va_vid</code>) stored locally in your browser to differentiate new visits from returning visits without identifying you.</li>
                </ul>
              </div>

              <div>
                <h4 className="flex items-center gap-2 font-bold text-white text-base">
                  <Lock size={18} className="text-[#16f2a4]" />
                  What We Never Collect
                </h4>
                <p className="mt-2 text-xs sm:text-sm">
                  We believe in zero surveillance. This website does <strong>NOT</strong> collect:
                </p>
                <ul className="mt-2 list-disc pl-5 space-y-1 text-xs text-white/70">
                  <li>No personal identities, real names, email addresses, phone numbers, or passwords.</li>
                  <li>No Google account details or social login data.</li>
                  <li>No invasive canvas, WebGL, audio, or battery fingerprinting.</li>
                  <li>No third-party advertising cookies, cross-site trackers, or trackers shared with advertising networks.</li>
                </ul>
              </div>

              <div>
                <h4 className="flex items-center gap-2 font-bold text-white text-base">
                  <Clock size={18} className="text-[#16f2a4]" />
                  Data Retention &amp; Security
                </h4>
                <p className="mt-2 text-xs sm:text-sm">
                  Visitor data is securely stored in our private Neon PostgreSQL database hosted with encrypted connections. Visitor records are automatically pruned after <strong>90 days</strong>. Anonymous users cannot read, export, or access database records.
                </p>
              </div>

              <div>
                <h4 className="flex items-center gap-2 font-bold text-white text-base">
                  <Shield size={18} className="text-[#16f2a4]" />
                  Your Choices &amp; Rights
                </h4>
                <p className="mt-2 text-xs sm:text-sm">
                  We respect the <strong>Do Not Track (DNT)</strong> and <strong>Global Privacy Control (GPC)</strong> browser signals. If enabled in your browser, visit recording is automatically skipped. You can also clear your browser storage or cookies anytime to reset your visitor ID.
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-end border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-full bg-[#16f2a4] px-6 py-2.5 text-sm font-black text-black transition hover:bg-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function openPrivacyModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-privacy-modal"));
  }
}
