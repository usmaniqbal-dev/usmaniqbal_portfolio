"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  BriefcaseBusiness,
  Home,
  Mail,
  Menu,
  Moon,
  Sparkles,
  Sun,
  UserRound,
  X
} from "lucide-react";
import { useScrollDirection } from "@/hooks/useScrollDirection";

export type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

export const defaultNavItems: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "About", href: "/about", icon: UserRound },
  { label: "Services", href: "/services", icon: Sparkles },
  { label: "Projects", href: "/projects", icon: BriefcaseBusiness },
  { label: "Certifications", href: "/certifications", icon: Award },
  { label: "Contact", href: "/contact", icon: Mail }
];

export type FloatingNavProps = {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  darkMode: boolean;
  toggleColorMode: () => void;
  siteName?: string;
  logoUrl?: string;
  heroImageSrc?: string;
  logoLink?: string;
  activePath?: string;
  onNavigate?: (e: React.MouseEvent, href: string) => void;
};

export default function FloatingNav({
  menuOpen,
  setMenuOpen,
  darkMode,
  toggleColorMode,
  siteName = "Usman Iqbal",
  logoUrl,
  heroImageSrc,
  logoLink = "/",
  activePath,
  onNavigate
}: FloatingNavProps) {
  const { scrolled } = useScrollDirection();
  const pathname = usePathname();
  const currentPath = activePath || pathname || "/";
  const [imgError, setImgError] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const navLogoUrl = logoUrl || heroImageSrc || "/images/usman-hero.png";
  const brandName = siteName || "Usman Iqbal";

  function isItemActive(href: string) {
    if (href === "/") {
      return currentPath === "/" || currentPath === "";
    }
    if (href === "/about" && (currentPath === "/skills" || currentPath.startsWith("/skills/"))) {
      return true;
    }
    return currentPath === href || currentPath.startsWith(href + "/");
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 py-3 sm:px-6 transition-all duration-300">
      <nav
        className={`mx-auto flex max-w-[calc(100vw-2rem)] items-center justify-between rounded-full border px-3.5 py-2 transition-all duration-300 md:max-w-5xl ${
          darkMode
            ? scrolled
              ? "border-white/15 bg-black/90 text-white backdrop-blur-2xl shadow-xl shadow-black/50"
              : "border-white/10 bg-black/75 text-white backdrop-blur-xl"
            : scrolled
              ? "border-black/10 bg-white/95 text-[#111111] backdrop-blur-2xl shadow-xl shadow-black/10"
              : "border-black/8 bg-white/85 text-[#111111] backdrop-blur-xl"
        }`}
      >
        {/* Brand Logo & Name */}
        <Link
          href={logoLink || "/"}
          className={`group flex min-w-0 items-center gap-2.5 font-black transition-transform duration-200 hover:scale-[1.02] ${
            darkMode ? "text-white" : "text-[#111111]"
          }`}
        >
          <span className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full ring-2 ring-[var(--primary)]/30 transition-all duration-300 group-hover:ring-[var(--primary)] group-hover:scale-105 shadow-sm bg-[var(--primary)] text-black">
            {!imgError && navLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={navLogoUrl}
                alt={brandName}
                onError={() => setImgError(true)}
                className="h-full w-full rounded-full object-cover object-top"
              />
            ) : (
              <span className="text-xs font-black tracking-wider">UI</span>
            )}
          </span>
          <span className="hidden max-w-[170px] truncate text-sm font-black tracking-tight sm:block">{brandName}</span>
        </Link>

        {/* Desktop Modern Nav Links with sliding indicator */}
        <div
          className="hidden items-center gap-1 md:flex"
          onMouseLeave={() => setHoveredNav(null)}
        >
          {defaultNavItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHoveredNav(item.href)}
                onClick={(e) => {
                  if (onNavigate) {
                    onNavigate(e, item.href);
                  }
                }}
                className={`group relative flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                  active
                    ? "text-[#16f2a4] font-black"
                    : darkMode
                    ? "text-white/70 hover:text-white"
                    : "text-black/70 hover:text-black"
                }`}
              >
                {/* Active or Hover Background Pill */}
                {active && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 rounded-full bg-[#16f2a4]/15 border border-[#16f2a4]/25"
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  />
                )}
                {!active && hoveredNav === item.href && (
                  <motion.span
                    layoutId="hoverNavIndicator"
                    className={`absolute inset-0 rounded-full ${
                      darkMode ? "bg-white/[0.08]" : "bg-black/[0.05]"
                    }`}
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  />
                )}

                <Icon
                  size={15}
                  className={`relative z-10 transition-transform duration-200 group-hover:scale-110 ${
                    active ? "text-[#16f2a4]" : "text-current group-hover:text-[#16f2a4]"
                  }`}
                />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Action Controls (Theme Toggle & Mobile Trigger) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={darkMode ? "Switch to light theme" : "Switch to dark theme"}
            title={darkMode ? "Switch to light theme" : "Switch to dark theme"}
            onClick={toggleColorMode}
            className={`group grid h-9 w-9 place-items-center rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 ${
              darkMode
                ? "border-white/10 bg-white/[0.05] text-amber-300 hover:border-amber-300/40 hover:bg-amber-300/10"
                : "border-black/10 bg-black/[0.04] text-indigo-600 hover:border-indigo-600/40 hover:bg-indigo-600/10"
            }`}
          >
            {darkMode ? (
              <Sun size={17} className="transition-transform duration-300 group-hover:rotate-45" />
            ) : (
              <Moon size={17} className="transition-transform duration-300 group-hover:-rotate-12" />
            )}
          </button>

          <button
            type="button"
            aria-label="Open navigation menu"
            className={`grid h-9 w-9 place-items-center rounded-full border md:hidden transition-all active:scale-95 ${
              darkMode
                ? "border-white/10 bg-white/[0.05] text-white hover:bg-white/10"
                : "border-black/10 bg-black/[0.04] text-black hover:bg-black/10"
            }`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer with Glass Polish */}
      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={`mx-auto mt-3 grid max-w-sm gap-1.5 rounded-2xl border p-3 backdrop-blur-2xl md:hidden shadow-2xl ${
              darkMode
                ? "border-white/15 bg-black/95 text-white"
                : "border-black/10 bg-white/95 text-[#111111]"
            }`}
          >
            {defaultNavItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    setMenuOpen(false);
                    if (onNavigate) {
                      onNavigate(e, item.href);
                    }
                  }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                    active
                      ? "bg-[#16f2a4]/15 text-[#16f2a4]"
                      : darkMode
                      ? "text-white/80 hover:bg-white/[0.08] hover:text-white"
                      : "text-black/80 hover:bg-black/[0.05] hover:text-black"
                  }`}
                >
                  <Icon size={18} className={active ? "text-[#16f2a4]" : "opacity-60"} />
                  {item.label}
                </Link>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
