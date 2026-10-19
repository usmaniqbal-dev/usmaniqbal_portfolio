"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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

  // Available categories based on real project data matching exact requirements
  const categories = [
    { id: "All", label: "All Projects", count: allProjects.length },
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
      label: "Web & Mobile Apps",
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
      label: "Academic & Social Impact",
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
  ];

  // Dynamic filter and search
  const filteredProjects = allProjects.filter((project) => {
    let matchesCategory = true;
    if (selectedCategory === "Salesforce & CRM Projects" || selectedCategory === "Salesforce & CRM") {
      matchesCategory = Boolean(
        project.category === "Salesforce & CRM Projects" ||
          project.category?.includes("Salesforce") ||
          project.category?.includes("CRM") ||
          project.tags.includes("Salesforce") ||
          project.tags.includes("CRM")
      );
    } else if (selectedCategory === "AI, Machine Learning & Python Projects" || selectedCategory === "AI, ML & Python") {
      matchesCategory = Boolean(
        project.category === "AI, Machine Learning & Python Projects" ||
          project.category?.includes("AI") ||
          project.category?.includes("Machine Learning") ||
          project.category?.includes("Python") ||
          project.tags.includes("Python") ||
          project.tags.includes("AI")
      );
    } else if (selectedCategory === "Web & Mobile Application Projects" || selectedCategory === "Web & Mobile") {
      matchesCategory = Boolean(
        project.category === "Web & Mobile Application Projects" ||
          project.category?.includes("Web") ||
          project.category?.includes("Mobile") ||
          project.tags.includes("Android") ||
          project.tags.includes("Next.js") ||
          project.tags.includes("PHP") ||
          project.tags.includes("React")
      );
    } else if (selectedCategory === "Academic & Social Impact Projects" || selectedCategory === "Academic & Social") {
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

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header & Breadcrumb */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Breadcrumb Navigation */}
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
                <Link
                  href="/"
                  className={`inline-flex items-center gap-1.5 transition hover:text-[var(--primary)] ${
                    darkMode ? "text-white/60" : "text-black/60"
                  }`}
                >
                  <Home size={15} />
                  Home
                </Link>
                <span className={darkMode ? "text-white/30" : "text-black/30"}>/</span>
                <span className="text-[var(--primary)]">Projects</span>
              </nav>

              {/* Back to Home Button */}
              <Link
                href="/"
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs sm:text-sm font-bold transition duration-200 hover:-translate-x-0.5 ${
                  darkMode
                    ? "border-white/10 bg-white/[0.04] text-white hover:border-[var(--primary)] hover:text-[var(--primary)]"
                    : "border-black/10 bg-black/[0.03] text-[#111111] hover:border-[var(--primary)] hover:text-[var(--primary)] shadow-sm"
                }`}
              >
                <ArrowLeft size={16} />
                Back to Home
              </Link>
            </div>

            {/* Title Section */}
            <div className="mt-8 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                <Sparkles size={14} />
                Portfolio Directory
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                All Projects
              </h1>
              <p
                className={`mt-4 text-base sm:text-lg leading-relaxed ${
                  darkMode ? "text-white/70" : "text-black/70"
                }`}
              >
                Explore the complete collection of {allProjects.length} projects across Salesforce CRM customization, Agentforce AI, Python speech and transcription pipelines, and full-stack web and mobile applications.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div
                className={`rounded-2xl border p-4 ${
                  darkMode ? "border-white/10 bg-[#0E0E10]" : "border-gray-200 bg-gray-50/80"
                }`}
              >
                <p className="text-2xl sm:text-3xl font-black text-[var(--primary)]">
                  {allProjects.length}
                </p>
                <p className={`mt-1 text-xs font-semibold ${darkMode ? "text-white/60" : "text-black/60"}`}>
                  Total Portfolio Projects
                </p>
              </div>
              <div
                className={`rounded-2xl border p-4 ${
                  darkMode ? "border-white/10 bg-[#0E0E10]" : "border-gray-200 bg-gray-50/80"
                }`}
              >
                <p className="text-2xl sm:text-3xl font-black text-cyan-400">
                  {categories.find((c) => c.id.includes("Salesforce"))?.count || 7}
                </p>
                <p className={`mt-1 text-xs font-semibold ${darkMode ? "text-white/60" : "text-black/60"}`}>
                  Salesforce & CRM
                </p>
              </div>
              <div
                className={`rounded-2xl border p-4 ${
                  darkMode ? "border-white/10 bg-[#0E0E10]" : "border-gray-200 bg-gray-50/80"
                }`}
              >
                <p className="text-2xl sm:text-3xl font-black text-emerald-400">
                  {categories.find((c) => c.id.includes("AI"))?.count || 8}
                </p>
                <p className={`mt-1 text-xs font-semibold ${darkMode ? "text-white/60" : "text-black/60"}`}>
                  AI, ML & Python
                </p>
              </div>
              <div
                className={`rounded-2xl border p-4 ${
                  darkMode ? "border-white/10 bg-[#0E0E10]" : "border-gray-200 bg-gray-50/80"
                }`}
              >
                <p className="text-2xl sm:text-3xl font-black text-amber-400">
                  {categories.find((c) => c.id.includes("Web"))?.count || 13}
                </p>
                <p className={`mt-1 text-xs font-semibold ${darkMode ? "text-white/60" : "text-black/60"}`}>
                  Web & Mobile Apps
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Filtering Toolbar */}
          <div
            className={`sticky top-20 z-30 mb-8 rounded-2xl border p-4 backdrop-blur-xl transition ${
              darkMode
                ? "border-white/10 bg-black/80 shadow-2xl shadow-black/60"
                : "border-gray-200 bg-white/90 shadow-lg shadow-black/5"
            }`}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`mr-1 hidden items-center gap-1.5 text-xs font-bold sm:inline-flex ${
                  darkMode ? "text-white/50" : "text-black/50"
                }`}>
                  <Filter size={14} /> Filter:
                </span>
                {categories.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 ${
                        active
                          ? "bg-[var(--primary)] text-black font-black shadow-md shadow-[var(--primary)]/20"
                          : darkMode
                            ? "border border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/[0.1] hover:text-white"
                            : "border border-gray-200 bg-gray-100/70 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {cat.label} ({cat.count})
                    </button>
                  );
                })}
              </div>

              {/* Real-time Search Box */}
              <div className="relative w-full lg:max-w-xs">
                <Search
                  size={17}
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    darkMode ? "text-white/40" : "text-black/40"
                  }`}
                />
                <input
                  type="text"
                  placeholder={`Search ${allProjects.length} projects...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full rounded-full border py-2.5 pl-10 pr-9 text-xs sm:text-sm outline-none transition ${
                    darkMode
                      ? "border-white/10 bg-white/[0.04] text-white placeholder-white/40 focus:border-[var(--primary)] focus:bg-white/[0.07]"
                      : "border-gray-200 bg-gray-100/80 text-black placeholder-gray-500 focus:border-[var(--primary)] focus:bg-white"
                  }`}
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                  >
                    <X size={15} />
                  </button>
                ) : null}
              </div>
            </div>

            {/* Status counter */}
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t pt-3 dark:border-white/10 border-gray-100">
              <span>
                Showing <strong className="text-[var(--primary)]">{filteredProjects.length}</strong> of {allProjects.length} projects
                {selectedCategory !== "All" && ` in ${selectedCategory}`}
                {searchQuery && ` matching "${searchQuery}"`}
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
                  Reset filters
                </button>
              )}
            </div>
          </div>

          {/* Projects Responsive Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, index) => (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
                className={`group flex h-full flex-col justify-between rounded-[24px] border p-4 sm:p-5 transition-all duration-300 ${
                  darkMode
                    ? "border-white/10 bg-[#141416] hover:border-white/20 hover:shadow-2xl hover:shadow-cyan-950/20"
                    : "border-gray-100 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.12)]"
                }`}
              >
                <div>
                  {/* Thumbnail Image Container */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[16px] bg-gray-100 dark:bg-zinc-800">
                    <Image
                      src={project.image || "/images/projects/salesforce-automation.jpg"}
                      alt={project.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {project.category ? (
                      <span className="absolute top-3 left-3 rounded-full bg-black/75 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                        {project.category.replace(" Projects", "")}
                      </span>
                    ) : null}
                  </div>

                  {/* Card Title */}
                  <h2
                    className={`mt-4 line-clamp-1 text-lg font-bold transition-colors group-hover:text-[var(--primary)] ${
                      darkMode ? "text-white" : "text-[#111111]"
                    }`}
                  >
                    {project.title}
                  </h2>

                  {/* Technology Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {project.tags.slice(0, 3).map((tag, tagIdx) => (
                        <span
                          key={`${tag}-${tagIdx}`}
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            darkMode
                              ? "bg-white/[0.06] text-white/70"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-gray-400">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  <p
                    className={`mt-3 line-clamp-3 text-xs sm:text-sm leading-relaxed ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {project.description}
                  </p>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-5 flex items-center justify-between border-t pt-3.5 dark:border-white/10 border-gray-100">
                  <button
                    type="button"
                    onClick={() => setSelectedProject(project)}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--primary)] transition-colors hover:underline"
                  >
                    <Eye size={15} />
                    View Details
                  </button>

                  <div className="flex items-center gap-2.5">
                    {project.githubUrl ? (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`GitHub repository for ${project.title}`}
                        className="text-gray-400 hover:text-[var(--primary)] transition-colors"
                      >
                        <Github size={17} />
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
                        <ExternalLink size={17} />
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
              className={`rounded-3xl border py-16 px-6 text-center ${
                darkMode ? "border-white/10 bg-[#0E0E10]" : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                <Search size={24} />
              </div>
              <h3 className="text-xl font-bold">No projects found</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                No projects matched your search query &ldquo;{searchQuery}&rdquo; in {selectedCategory}. Try clearing your filters or searching another keyword.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-2.5 text-sm font-black text-black transition hover:bg-white shadow-md"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Bottom Return to Home Navigation Bar */}
          <div className="mt-16 border-t pt-8 text-center dark:border-white/10 border-gray-200">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-8 py-3.5 text-sm font-black text-black transition duration-300 hover:bg-white shadow-md active:scale-95"
            >
              <ArrowLeft size={18} />
              Return to Portfolio Homepage
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
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border shadow-2xl ${
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
                className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/85"
              >
                <X size={18} />
              </button>

              {/* Scrollable Modal Content */}
              <div className="overflow-y-auto">
                <div className="relative aspect-[16/9] w-full bg-gray-100 dark:bg-zinc-800">
                  <Image
                    src={selectedProject.image || "/images/projects/salesforce-automation.jpg"}
                    alt={selectedProject.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 680px"
                    className="object-cover"
                  />
                  {selectedProject.category && (
                    <span className="absolute bottom-4 left-4 rounded-full bg-black/75 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                      {selectedProject.category}
                    </span>
                  )}
                </div>

                <div className="p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-black leading-snug">
                    {selectedProject.title}
                  </h3>

                  <p
                    className={`mt-4 text-sm sm:text-base leading-relaxed ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {selectedProject.description}
                  </p>

                  {/* Technology Tags */}
                  {selectedProject.tags && selectedProject.tags.length > 0 && (
                    <div className="mt-6">
                      <p
                        className={`text-xs font-bold uppercase tracking-wider ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Technologies &amp; Architecture
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {selectedProject.tags.map((tag, i) => (
                          <span
                            key={`${tag}-${i}`}
                            className="rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-bold text-[var(--primary)] border border-[var(--primary)]/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Modal Action Buttons */}
                  <div className="mt-8 flex flex-wrap items-center gap-3 border-t pt-6 dark:border-white/10 border-gray-100">
                    {selectedProject.url && selectedProject.url !== "#" ? (
                      <a
                        href={selectedProject.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-black text-black shadow-sm transition hover:bg-white"
                      >
                        Visit Project <ExternalLink size={15} />
                      </a>
                    ) : null}

                    {selectedProject.githubUrl ? (
                      <a
                        href={selectedProject.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${
                          darkMode
                            ? "border-white/15 text-white hover:border-[var(--primary)] hover:text-[var(--primary)]"
                            : "border-gray-200 text-gray-800 hover:border-[var(--primary)] hover:text-[var(--primary)]"
                        }`}
                      >
                        <Github size={16} /> GitHub Repo
                      </a>
                    ) : null}

                    <Link
                      href={`/contact?project=${encodeURIComponent(selectedProject.title)}`}
                      className={`inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${
                        darkMode
                          ? "border-white/15 text-white hover:border-[var(--primary)] hover:text-[var(--primary)]"
                          : "border-gray-200 text-gray-800 hover:border-[var(--primary)] hover:text-[var(--primary)]"
                      }`}
                    >
                      Inquire About This Project
                    </Link>

                    <button
                      type="button"
                      onClick={() => setSelectedProject(null)}
                      className={`ml-auto rounded-xl px-4 py-2.5 text-sm font-medium transition ${
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
        className={`border-t px-5 py-8 text-center text-sm ${
          darkMode ? "border-white/10 bg-black text-white/50" : "border-black/8 bg-white text-black/50"
        }`}
      >
        <p>&copy; {new Date().getFullYear()} Usman Iqbal - NURAXTECH. All Projects Directory.</p>
      </footer>
    </div>
  );
}
