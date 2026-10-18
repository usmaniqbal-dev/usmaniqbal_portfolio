"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BriefcaseBusiness,
  Home,
  Mail,
  Menu,
  Moon,
  Settings2,
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
  { label: "Skills", href: "/skills", icon: Settings2 },
  { label: "Services", href: "/services", icon: Sparkles },
  { label: "Projects", href: "/projects", icon: BriefcaseBusiness },
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
  const navLogoUrl = logoUrl || heroImageSrc || "/images/usman-hero.png";
  const brandName = siteName || "Usman Iqbal";

  function isItemActive(href: string) {
    if (href === "/") {
      return currentPath === "/" || currentPath === "";
    }
    return currentPath === href || currentPath.startsWith(href + "/");
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 py-3 sm:px-6 transition-all duration-300">
      <nav
        className={`mx-auto flex max-w-[calc(100vw-2rem)] items-center justify-between rounded-full border px-3 py-2.5 transition md:max-w-5xl ${
          darkMode
            ? scrolled
              ? "border-white/15 bg-black/90 text-white backdrop-blur-2xl shadow-lg shadow-black/40"
              : "border-white/10 bg-black/75 text-white backdrop-blur-xl"
            : scrolled
              ? "border-black/10 bg-white/95 text-[#111111] backdrop-blur-2xl shadow-md shadow-black/5"
              : "border-black/8 bg-white/85 text-[#111111] backdrop-blur-xl"
        }`}
      >
        <Link
          href={logoLink || "/"}
          className={`flex min-w-0 items-center gap-2.5 font-black ${
            darkMode ? "text-white" : "text-[#111111]"
          }`}
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border border-black/10 bg-[var(--primary)] text-black">
            {!imgError && navLogoUrl ? (
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
          <span className="hidden max-w-[160px] truncate sm:block">{brandName}</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1.5 md:flex">
          {defaultNavItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  if (onNavigate) {
                    onNavigate(e, item.href);
                  }
                }}
                className={`group relative flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "text-[var(--primary)] font-bold bg-[var(--primary)]/10"
                    : darkMode
                      ? "text-white/70 hover:bg-white/[0.08] hover:text-white"
                      : "text-black/70 hover:bg-black/[0.05] hover:text-[#111111]"
                }`}
              >
                <Icon
                  size={17}
                  className={`transition ${active ? "text-[var(--primary)]" : "group-hover:text-[var(--primary)]"}`}
                />
                {item.label}
                <span
                  className={`absolute inset-x-3 bottom-1 h-0.5 origin-left bg-[var(--primary)] transition-transform duration-300 ${
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        {/* Action buttons (Theme Toggle & Mobile Menu Trigger) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={darkMode ? "Switch to light theme" : "Switch to dark theme"}
            title={darkMode ? "Switch to light theme" : "Switch to dark theme"}
            className={`grid h-10 w-10 place-items-center rounded-full border transition hover:border-[var(--primary)] hover:text-[var(--primary)] ${
              darkMode
                ? "border-white/10 bg-white/[0.05] text-white/80"
                : "border-black/10 bg-black/[0.04] text-black/80"
            }`}
            onClick={toggleColorMode}
          >
            {darkMode ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button
            type="button"
            aria-label="Open navigation"
            className={`grid h-11 w-11 place-items-center rounded-full border md:hidden ${
              darkMode
                ? "border-white/10 bg-white/[0.05] text-white"
                : "border-black/10 bg-black/[0.04] text-black"
            }`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mx-auto mt-3 grid max-w-sm gap-2 rounded-[8px] border p-3 backdrop-blur-2xl md:hidden ${
              darkMode
                ? "border-white/12 bg-black/95 text-white"
                : "border-black/10 bg-white/95 text-[#111111] shadow-lg"
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
                  className={`flex items-center gap-3 rounded-[8px] px-4 py-3 font-semibold transition ${
                    active
                      ? "bg-[var(--primary)]/15 text-[var(--primary)] font-bold"
                      : darkMode
                        ? "text-white/80 hover:bg-white/[0.08] hover:text-white"
                        : "text-black/80 hover:bg-black/[0.05] hover:text-black"
                  }`}
                >
                  <Icon size={20} className="text-[var(--primary)]" />
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
