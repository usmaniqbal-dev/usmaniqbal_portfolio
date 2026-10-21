"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  Filter,
  Github,
  Home,
  Search,
  Sparkles,
  X
} from "lucide-react";
import type { ProjectContent, SiteContent } from "@/types/site-content";
import FloatingNav from "@/components/floating-nav";

type AllProjectsClientProps = {
  content: SiteContent;
};

export default function AllProjectsClient({ content }: AllProjectsClientProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<ProjectContent | null>(null);

  // Synchronize color mode with site preference
  useEffect(() => {
    const savedMode = window.localStorage.getItem("nuraxtech-portfolio-theme");
    if (savedMode) {
      setDarkMode(savedMode === "dark");
    } else {
      setDarkMode(false);
    }
  }, []);

  function toggleColorMode() {
    setDarkMode((current) => {
      const next = !current;
      window.localStorage.setItem("nuraxtech-portfolio-theme", next ? "dark" : "light");
      return next;
    });
  }

  // Handle ESC key to dismiss modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSelectedProject(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const emeraldAccent = "#00DCA0";
  const style = {
    "--primary": emeraldAccent,
    "--secondary": emeraldAccent,
    "--accent": emeraldAccent,
    "--builder-bg": darkMode ? "#000000" : "#FFFFFF",
    "--builder-text": darkMode ? "#FFFFFF" : "#111111",
    "--builder-card": darkMode ? "#0A0A0A" : "#FFFFFF"
  } as React.CSSProperties;

  const allProjects = content.projects || [];

  // Memoized category counts — avoids re-computing on every render
  const categories = useMemo(() => [
    { id: "All", label: "All", count: allProjects.length },
    {
      id: "Salesforce & CRM Projects",
      label: "Salesforce & CRM",
      count: allProjects.filter(
        (p) =>
          p.category === "Salesforce & CRM Projects" ||
          p.category?.includes("Salesforce") ||
          p.category?.includes("CRM") ||
          p.tags.includes("Salesforce") ||
          p.tags.includes("CRM")
      ).length
    },
    {
      id: "AI, Machine Learning & Python Projects",
      label: "AI, ML & Python",
      count: allProjects.filter(
        (p) =>
          p.category === "AI, Machine Learning & Python Projects" ||
          p.category?.includes("AI") ||
          p.category?.includes("Machine Learning") ||
          p.category?.includes("Python") ||
          p.tags.includes("Python") ||
          p.tags.includes("AI")
      ).length
    },
    {
      id: "Web & Mobile Application Projects",
      label: "Web & Mobile",
      count: allProjects.filter(
        (p) =>
          p.category === "Web & Mobile Application Projects" ||
          p.category?.includes("Web") ||
          p.category?.includes("Mobile") ||
          p.tags.includes("Android") ||
          p.tags.includes("Next.js") ||
          p.tags.includes("PHP") ||
          p.tags.includes("React")
      ).length
    },
    {
      id: "Academic & Social Impact Projects",
      label: "Academic & Social",
      count: allProjects.filter(
        (p) =>
          p.category === "Academic & Social Impact Projects" ||
          p.category?.includes("Academic") ||
          p.category?.includes("Social") ||
          p.tags.includes("Academic") ||
          p.tags.includes("Social Impact") ||
          p.tags.includes("C++")
      ).length
    }
  ], [allProjects]);

  // Memoized filtered projects — avoids re-filtering on every render
  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      let matchesCategory = true;
      if (selectedCategory === "Salesforce & CRM Projects") {
        matchesCategory = Boolean(
          project.category === "Salesforce & CRM Projects" ||
            project.category?.includes("Salesforce") ||
            project.category?.includes("CRM") ||
            project.tags.includes("Salesforce") ||
            project.tags.includes("CRM")
        );
      } else if (selectedCategory === "AI, Machine Learning & Python Projects") {
        matchesCategory = Boolean(
          project.category === "AI, Machine Learning & Python Projects" ||
            project.category?.includes("AI") ||
            project.category?.includes("Machine Learning") ||
            project.category?.includes("Python") ||
            project.tags.includes("Python") ||
            project.tags.includes("AI")
        );
      } else if (selectedCategory === "Web & Mobile Application Projects") {
        matchesCategory = Boolean(
          project.category === "Web & Mobile Application Projects" ||
            project.category?.includes("Web") ||
            project.category?.includes("Mobile") ||
            project.tags.includes("Android") ||
            project.tags.includes("Next.js") ||
            project.tags.includes("PHP") ||
            project.tags.includes("React")
        );
      } else if (selectedCategory === "Academic & Social Impact Projects") {
        matchesCategory = Boolean(
          project.category === "Academic & Social Impact Projects" ||
            project.category?.includes("Academic") ||
            project.category?.includes("Social") ||
            project.tags.includes("Academic") ||
            project.tags.includes("Social Impact") ||
            project.tags.includes("C++")
        );
      }

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.tags.some((t) => t.toLowerCase().includes(query)) ||
        (project.category && project.category.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [allProjects, selectedCategory, searchQuery]);

  const heroImage =
    content.home.profileImage || content.home.heroImage || "/images/usman-hero.png";

  return (
    <div
      className={`min-h-screen flex flex-col ${
        darkMode ? "bg-black text-white" : "bg-white text-[#111111]"
      }`}
      style={style}
    >
      {/* Universal Floating Navigation */}
      <FloatingNav
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        darkMode={darkMode}
        toggleColorMode={toggleColorMode}
        siteName={content.builder.settings.siteName}
        logoUrl={content.builder.settings.logoUrl}
        heroImageSrc={heroImage}
        logoLink="/"
        activePath="/projects"
      />

      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header & Breadcrumb */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Breadcrumb Navigation */}
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold">
                <Link
                  href="/"
                  className={`inline-flex items-center gap-1.5 transition hover:text-[var(--primary)] ${
                    darkMode ? "text-white/60" : "text-black/60"
                  }`}
                >
                  <Home size={13} />
                  Home
                </Link>
                <span className={darkMode ? "text-white/30" : "text-black/30"}>/</span>
                <span className="text-[var(--primary)]">Projects</span>
              </nav>

              {/* Back to Home Button */}
              <Link
                href="/"
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition duration-200 hover:-translate-x-0.5 ${
                  darkMode
                    ? "border-white/10 bg-white/[0.04] text-white hover:border-[var(--primary)] hover:text-[var(--primary)]"
                    : "border-black/10 bg-black/[0.03] text-[#111111] hover:border-[var(--primary)] hover:text-[var(--primary)] shadow-sm"
                }`}
              >
                <ArrowLeft size={13} />
                Back
              </Link>
            </div>

            {/* Title Section */}
            <div className="mt-5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--primary)]">
                <Sparkles size={12} />
                Portfolio Directory
              </div>
              <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                All Projects
              </h1>
              <p
                className={`mt-2 text-sm leading-relaxed max-w-xl ${
                  darkMode ? "text-white/65" : "text-black/65"
                }`}
              >
                {allProjects.length} projects across Salesforce CRM, Agentforce AI, Python, and full-stack development.
              </p>
            </div>

            {/* Compact Metrics Bar */}
            <div className="mt-5 flex flex-wrap gap-3">
              {[
                { label: "Total", value: allProjects.length, color: "text-[var(--primary)]" },
                { label: "Salesforce", value: categories.find((c) => c.id.includes("Salesforce"))?.count ?? 0, color: "text-cyan-400" },
                { label: "AI & Python", value: categories.find((c) => c.id.includes("AI"))?.count ?? 0, color: "text-emerald-400" },
                { label: "Web & Mobile", value: categories.find((c) => c.id.includes("Web"))?.count ?? 0, color: "text-amber-400" }
              ].map((metric) => (
                <div
                  key={metric.label}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                    darkMode ? "border-white/10 bg-[#0E0E10]" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <span className={`text-lg font-black leading-none ${metric.color}`}>{metric.value}</span>
                  <span className={`text-xs font-semibold ${darkMode ? "text-white/55" : "text-black/55"}`}>{metric.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Filter & Search Toolbar — sticky but sized correctly to avoid nav overlap */}
          <div
            className={`sticky top-[68px] z-20 mb-6 rounded-xl border p-3 backdrop-blur-xl transition ${
              darkMode
                ? "border-white/10 bg-black/85 shadow-xl shadow-black/50"
                : "border-gray-200 bg-white/92 shadow-md shadow-black/5"
            }`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`hidden items-center gap-1 text-[11px] font-bold sm:inline-flex mr-1 ${
                  darkMode ? "text-white/45" : "text-black/45"
                }`}>
                  <Filter size={12} /> Filter:
                </span>
                {categories.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`rounded-full px-3 py-1 text-[11px] sm:text-xs font-semibold transition-all duration-150 active:scale-95 ${
                        active
                          ? "bg-[var(--primary)] text-black font-bold shadow-sm shadow-[var(--primary)]/20"
                          : darkMode
                            ? "border border-white/10 bg-white/[0.04] text-white/75 hover:bg-white/[0.08] hover:text-white"
                            : "border border-gray-200 bg-gray-100/70 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {cat.label} ({cat.count})
                    </button>
                  );
                })}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-48 lg:w-56 flex-shrink-0">
                <Search
                  size={14}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    darkMode ? "text-white/40" : "text-black/40"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full rounded-full border py-2 pl-8 pr-8 text-[11px] sm:text-xs outline-none transition ${
                    darkMode
                      ? "border-white/10 bg-white/[0.04] text-white placeholder-white/40 focus:border-[var(--primary)] focus:bg-white/[0.07]"
                      : "border-gray-200 bg-gray-100/80 text-black placeholder-gray-500 focus:border-[var(--primary)] focus:bg-white"
                  }`}
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={13} />
                  </button>
                ) : null}
              </div>
            </div>

            {/* Status counter */}
            <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500 border-t pt-2 dark:border-white/8 border-gray-100">
              <span>
                Showing <strong className="text-[var(--primary)]">{filteredProjects.length}</strong> of {allProjects.length}
                {selectedCategory !== "All" && ` · ${selectedCategory.replace(" Projects", "")}`}
                {searchQuery && ` · "${searchQuery}"`}
              </span>
              {(selectedCategory !== "All" || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                  }}
                  className="font-semibold text-[var(--primary)] hover:underline"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Projects Responsive Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, index) => (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
                className={`group flex h-full flex-col justify-between rounded-2xl border p-3.5 transition-all duration-300 ${
                  darkMode
                    ? "border-white/10 bg-[#141416] hover:border-white/20 hover:shadow-xl hover:shadow-cyan-950/20"
                    : "border-gray-100 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.1)]"
                }`}
              >
                <div>
                  {/* Thumbnail Image Container */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-zinc-800">
                    <Image
                      src={project.image || "/images/projects/salesforce-automation.jpg"}
                      alt={project.title}
                      fill
                      loading={index < 6 ? "eager" : "lazy"}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      placeholder="empty"
                    />
                    {project.category ? (
                      <span className="absolute top-2 left-2 rounded-full bg-black/70 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
                        {project.category.replace(" Projects", "")}
                      </span>
                    ) : null}
                  </div>

                  {/* Card Title */}
                  <h2
                    className={`mt-3 line-clamp-1 text-sm font-bold transition-colors group-hover:text-[var(--primary)] ${
                      darkMode ? "text-white" : "text-[#111111]"
                    }`}
                  >
                    {project.title}
                  </h2>

                  {/* Technology Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {project.tags.slice(0, 3).map((tag, tagIdx) => (
                        <span
                          key={`${tag}-${tagIdx}`}
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            darkMode
                              ? "bg-white/[0.06] text-white/65"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-gray-400">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  <p
                    className={`mt-2 line-clamp-2 text-xs leading-relaxed ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {project.description}
                  </p>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-3.5 flex items-center justify-between border-t pt-3 dark:border-white/8 border-gray-100">
                  <button
                    type="button"
                    onClick={() => setSelectedProject(project)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--primary)] transition-colors hover:underline"
                  >
                    <Eye size={13} />
                    Details
                  </button>

                  <div className="flex items-center gap-2">
                    {project.githubUrl ? (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`GitHub repository for ${project.title}`}
                        className="text-gray-400 hover:text-[var(--primary)] transition-colors"
                      >
                        <Github size={15} />
                      </a>
                    ) : null}
                    {project.url && project.url !== "#" ? (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open website for ${project.title}`}
                        className="text-gray-400 hover:text-[var(--primary)] transition-colors"
                      >
                        <ExternalLink size={15} />
                      </a>
                    ) : null}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Empty Search State */}
          {filteredProjects.length === 0 && (
            <div
              className={`rounded-2xl border py-12 px-6 text-center ${
                darkMode ? "border-white/10 bg-[#0E0E10]" : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                <Search size={22} />
              </div>
              <h3 className="text-lg font-bold">No projects found</h3>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                No projects matched your search. Try clearing your filters or searching another keyword.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-bold text-black transition hover:bg-white shadow-sm"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="mt-12 border-t pt-6 text-center dark:border-white/10 border-gray-200">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-7 py-3 text-sm font-black text-black transition duration-300 hover:bg-white shadow-md active:scale-95"
            >
              <ArrowLeft size={16} />
              Back to Portfolio
            </Link>
          </div>
        </div>
      </main>

      {/* Interactive Project Details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border shadow-2xl ${
                darkMode
                  ? "border-white/10 bg-[#161618] text-white"
                  : "border-gray-100 bg-white text-[#111111]"
              }`}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                aria-label="Close details"
                className="absolute right-3 top-3 z-20 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/85"
              >
                <X size={16} />
              </button>

              {/* Scrollable Modal Content */}
              <div className="overflow-y-auto">
                <div className="relative aspect-[16/9] w-full bg-gray-100 dark:bg-zinc-800">
                  <Image
                    src={selectedProject.image || "/images/projects/salesforce-automation.jpg"}
                    alt={selectedProject.title}
                    fill
                    loading="eager"
                    sizes="(max-width: 768px) 100vw, 560px"
                    className="object-cover"
                    placeholder="empty"
                  />
                  {selectedProject.category && (
                    <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md">
                      {selectedProject.category}
                    </span>
                  )}
                </div>

                <div className="p-5 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-black leading-snug">
                    {selectedProject.title}
                  </h3>

                  <p
                    className={`mt-3 text-sm leading-relaxed ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {selectedProject.description}
                  </p>

                  {/* Technology Tags */}
                  {selectedProject.tags && selectedProject.tags.length > 0 && (
                    <div className="mt-5">
                      <p
                        className={`text-[11px] font-bold uppercase tracking-wider ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Technologies
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {selectedProject.tags.map((tag, i) => (
                          <span
                            key={`${tag}-${i}`}
                            className="rounded-full bg-[var(--primary)]/10 px-2.5 py-0.5 text-[11px] font-bold text-[var(--primary)] border border-[var(--primary)]/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Modal Action Buttons */}
                  <div className="mt-6 flex flex-wrap items-center gap-2 border-t pt-4 dark:border-white/10 border-gray-100">
                    {selectedProject.url && selectedProject.url !== "#" ? (
                      <a
                        href={selectedProject.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-black text-black shadow-sm transition hover:bg-white"
                      >
                        Visit Project <ExternalLink size={13} />
                      </a>
                    ) : null}

                    {selectedProject.githubUrl ? (
                      <a
                        href={selectedProject.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-semibold transition ${
                          darkMode
                            ? "border-white/15 text-white hover:border-[var(--primary)] hover:text-[var(--primary)]"
                            : "border-gray-200 text-gray-800 hover:border-[var(--primary)] hover:text-[var(--primary)]"
                        }`}
                      >
                        <Github size={14} /> GitHub
                      </a>
                    ) : null}

                    <Link
                      href={`/contact?project=${encodeURIComponent(selectedProject.title)}`}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-semibold transition ${
                        darkMode
                          ? "border-white/15 text-white hover:border-[var(--primary)] hover:text-[var(--primary)]"
                          : "border-gray-200 text-gray-800 hover:border-[var(--primary)] hover:text-[var(--primary)]"
                      }`}
                    >
                      Inquire
                    </Link>

                    <button
                      type="button"
                      onClick={() => setSelectedProject(null)}
                      className={`ml-auto rounded-xl px-3 py-2 text-xs font-medium transition ${
                        darkMode
                          ? "text-gray-400 hover:text-white"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer
        className={`border-t px-5 py-6 text-center text-xs ${
          darkMode ? "border-white/10 bg-black text-white/45" : "border-black/8 bg-white text-black/45"
        }`}
      >
        <p>&copy; {new Date().getFullYear()} Usman Iqbal - NURAXTECH. All Projects Directory.</p>
      </footer>
    </div>
  );
}
