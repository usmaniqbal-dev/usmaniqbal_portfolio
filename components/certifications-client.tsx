"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Search,
  Sparkles,
  X
} from "lucide-react";
import FloatingNav from "@/components/floating-nav";
import type { CertificationContent, SiteContent } from "@/types/site-content";

type CertificationsClientProps = {
  content: SiteContent;
};

export default function CertificationsClient({ content }: CertificationsClientProps) {
  const [darkMode, setDarkMode] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIssuer, setSelectedIssuer] = useState<string>("all");
  const [selectedCert, setSelectedCert] = useState<CertificationContent | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const certifications: CertificationContent[] = useMemo(() => {
    const list = (content.certifications || []).filter((c) => c.isPublished !== false);
    return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [content.certifications]);

  const issuers = useMemo(() => {
    const set = new Set<string>();
    certifications.forEach((c) => {
      if (c.issuingOrganization) set.add(c.issuingOrganization.trim());
    });
    return Array.from(set);
  }, [certifications]);

  const filteredCertifications = useMemo(() => {
    return certifications.filter((cert) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        cert.name.toLowerCase().includes(q) ||
        cert.issuingOrganization.toLowerCase().includes(q) ||
        (cert.credentialId && cert.credentialId.toLowerCase().includes(q)) ||
        (cert.description && cert.description.toLowerCase().includes(q)) ||
        (cert.skills && cert.skills.some((s) => s.toLowerCase().includes(q)));

      const matchesIssuer =
        selectedIssuer === "all" || cert.issuingOrganization.toLowerCase() === selectedIssuer.toLowerCase();

      return matchesSearch && matchesIssuer;
    });
  }, [certifications, searchQuery, selectedIssuer]);

  const copyCredentialId = (id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-[#090A0B] text-white" : "bg-[#F8F9FA] text-[#111111]"}`}>
      <FloatingNav
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        darkMode={darkMode}
        toggleColorMode={() => setDarkMode(!darkMode)}
        siteName={content.builder?.settings?.siteName || "Usman Iqbal"}
        logoUrl={content.builder?.settings?.logoUrl}
        heroImageSrc={content.home?.heroImage}
        activePath="/certifications"
      />

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 pt-28 pb-20 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="mb-8">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold transition hover:-translate-x-0.5 ${
              darkMode ? "border-white/10 bg-white/5 text-white/70 hover:text-white" : "border-black/10 bg-black/5 text-black/70 hover:text-black"
            }`}
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>

          <div className="mt-5 flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#16f2a4]/15 text-[#16f2a4]">
                  <Award size={22} />
                </span>
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Licenses & Certifications</h1>
              </div>
              <p className={`mt-2 max-w-2xl text-sm sm:text-base ${darkMode ? "text-white/60" : "text-gray-600"}`}>
                Verified professional certifications, industry credentials, and specialized technical accreditations earned by Usman Iqbal.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16f2a4]/10 px-3.5 py-1 text-xs font-bold text-[#16f2a4]">
                <CheckCircle2 size={13} /> {certifications.length} Credential{certifications.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className={`mb-8 flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
          darkMode ? "border-white/10 bg-white/[0.03]" : "border-gray-200 bg-white shadow-sm"
        }`}>
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              type="text"
              placeholder="Search by certification name, skill, or organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-xl border pl-10 pr-4 py-2 text-sm outline-none transition focus:border-[#16f2a4] ${
                darkMode ? "border-white/10 bg-black/40 text-white placeholder-white/35" : "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400"
              }`}
            />
          </div>

          {/* Issuer Filters */}
          {issuers.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedIssuer("all")}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  selectedIssuer === "all"
                    ? "bg-[#16f2a4] text-black"
                    : darkMode
                    ? "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {issuers.map((issuer) => (
                <button
                  key={issuer}
                  type="button"
                  onClick={() => setSelectedIssuer(issuer)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    selectedIssuer.toLowerCase() === issuer.toLowerCase()
                      ? "bg-[#16f2a4] text-black"
                      : darkMode
                      ? "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {issuer}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Certifications List */}
        {filteredCertifications.length === 0 ? (
          <div className={`rounded-2xl border p-12 text-center ${darkMode ? "border-white/10 bg-white/[0.02]" : "border-gray-200 bg-white"}`}>
            <Award size={48} className="mx-auto mb-3 opacity-30 text-[#16f2a4]" />
            <h3 className="text-lg font-bold">No certifications found</h3>
            <p className={`mt-1 text-sm ${darkMode ? "text-white/50" : "text-gray-500"}`}>
              {searchQuery || selectedIssuer !== "all"
                ? "Try adjusting your search terms or filters."
                : "Certifications will appear here once published from the admin panel."}
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredCertifications.map((cert) => (
              <motion.article
                key={cert.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`group relative rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
                  darkMode
                    ? "border-white/10 bg-[#121316] hover:border-white/20 hover:bg-[#16171b]"
                    : "border-gray-200 bg-white shadow-sm hover:shadow-md"
                }`}
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  {/* Left: Organization Badge & Core Info */}
                  <div className="flex items-start gap-4">
                    {/* Organization Icon / Logo Avatar */}
                    <div className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#16f2a4]/20 via-[#00A3C4]/15 to-transparent shadow-inner">
                      {cert.mediaUrl && !cert.mediaUrl.endsWith(".pdf") ? (
                        <Image
                          src={cert.mediaUrl}
                          alt={cert.name}
                          fill
                          sizes="56px"
                          className="object-contain p-1"
                        />
                      ) : (
                        <Award size={26} className="text-[#16f2a4]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-lg font-black tracking-tight sm:text-xl">{cert.name}</h2>
                      <p className="mt-0.5 text-sm font-semibold text-[#16f2a4]">{cert.issuingOrganization}</p>
                      <p className={`mt-1 text-xs ${darkMode ? "text-white/50" : "text-gray-500"}`}>
                        Issued {cert.issueDate}
                        {cert.expirationDate ? ` · Expires ${cert.expirationDate}` : " · No Expiration"}
                      </p>

                      {/* Credential ID */}
                      {cert.credentialId && (
                        <div className="mt-2.5 flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono font-medium ${
                            darkMode ? "bg-white/5 text-white/70" : "bg-gray-100 text-gray-700"
                          }`}>
                            Credential ID: {cert.credentialId}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyCredentialId(cert.credentialId!)}
                            title="Copy Credential ID"
                            className={`rounded-md p-1 transition ${
                              copiedId === cert.credentialId
                                ? "text-[#16f2a4]"
                                : darkMode
                                ? "text-white/40 hover:text-white"
                                : "text-gray-400 hover:text-gray-700"
                            }`}
                          >
                            {copiedId === cert.credentialId ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      )}

                      {/* Description */}
                      {cert.description && (
                        <p className={`mt-3 text-xs sm:text-sm leading-relaxed ${darkMode ? "text-white/70" : "text-gray-600"}`}>
                          {cert.description}
                        </p>
                      )}

                      {/* Skills Tags */}
                      {cert.skills && cert.skills.length > 0 && (
                        <div className="mt-4 flex flex-wrap items-center gap-1.5">
                          <span className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? "text-white/40" : "text-gray-400"}`}>
                            Skills:
                          </span>
                          {cert.skills.map((skill, index) => (
                            <span
                              key={`${skill}-${index}`}
                              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                darkMode ? "bg-white/5 text-white/80" : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#16f2a4] px-4 py-2 text-xs font-black text-black transition hover:bg-white active:scale-95 shadow-sm"
                      >
                        Show credential <ExternalLink size={13} />
                      </a>
                    )}

                    {cert.mediaUrl && (
                      <button
                        type="button"
                        onClick={() => setSelectedCert(cert)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition ${
                          darkMode
                            ? "border-white/15 bg-white/5 text-white hover:border-[#16f2a4] hover:text-[#16f2a4]"
                            : "border-gray-300 bg-white text-gray-800 hover:border-[#16f2a4] hover:text-[#00A3C4]"
                        }`}
                      >
                        <Eye size={13} /> View Certificate
                      </button>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>

      {/* Full-Screen Certificate Modal (Never crops images) */}
      <AnimatePresence>
        {selectedCert && selectedCert.mediaUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedCert(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#121316] text-white shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <div>
                  <h3 className="text-base font-black text-white">{selectedCert.name}</h3>
                  <p className="text-xs text-[#16f2a4]">{selectedCert.issuingOrganization}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={selectedCert.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/10"
                  >
                    <ExternalLink size={13} /> Open
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedCert(null)}
                    aria-label="Close"
                    className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Modal Media Body: 100% Uncropped object-contain */}
              <div className="relative flex flex-1 items-center justify-center overflow-auto bg-black/95 p-4 min-h-[400px]">
                {selectedCert.mediaUrl.endsWith(".pdf") ? (
                  <iframe
                    src={`${selectedCert.mediaUrl}#toolbar=1`}
                    title={selectedCert.name}
                    className="h-[75vh] w-full rounded-lg border-0 bg-white"
                  />
                ) : (
                  <div className="relative flex max-h-[75vh] max-w-full items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedCert.mediaUrl}
                      alt={selectedCert.name}
                      className="max-h-[75vh] max-w-full object-contain object-center rounded-lg shadow-2xl"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
