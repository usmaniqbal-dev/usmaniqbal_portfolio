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
  const pathname = usePathname();
  const currentPath = activePath || pathname || "/";
  const [imgError, setImgError] = useState(false);
  const navLogoUrl = logoUrl || heroImageSrc || "/images/usman-hero.png";
  const brandName = siteName || "Usman Iqbal";

  function isItemActive(href: string) {
    const rawCurrent = (currentPath || "/").trim();
    const cleanCurrent = rawCurrent.replace(/#.*$/, "").replace(/\/$/, "") || "/";
    const cleanHref = href.replace(/#.*$/, "").replace(/\/$/, "") || "/";

    if (cleanHref === "/") {
      return (
        cleanCurrent === "/" ||
        rawCurrent === "/" ||
        rawCurrent === "/#home" ||
        rawCurrent === "#home" ||
        rawCurrent === ""
      );
    }

    if (cleanHref === "/about") {
      if (
        cleanCurrent === "/about" ||
        rawCurrent === "/about" ||
        rawCurrent === "#about" ||
        rawCurrent === "/#about" ||
        cleanCurrent === "/skills" ||
        cleanCurrent.startsWith("/skills/")
      ) {
        return true;
      }
    }

    return (
      cleanCurrent === cleanHref ||
      rawCurrent === href ||
      rawCurrent === `/${href.replace(/^\//, "")}` ||
      rawCurrent === `#${href.replace(/^\//, "")}` ||
      cleanCurrent.startsWith(cleanHref + "/")
    );
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 py-3 sm:px-6 transition-all duration-300">
      <nav
        className={`mx-auto flex max-w-[calc(100vw-2rem)] md:max-w-5xl items-center justify-between rounded-full px-3.5 py-1.5 sm:py-2 transition-all duration-300 ${
          darkMode ? "neu-navbar-dark text-white" : "neu-navbar-light text-[#333d4d]"
        }`}
      >
        {/* Brand Avatar & Name */}
        <Link
          href={logoLink || "/"}
          className="brand group flex items-center gap-2.5 font-black text-sm transition-transform duration-200 hover:scale-[1.02] shrink-0"
          style={{ color: darkMode ? "#f1f5f9" : "#333d4d" }}
        >
          <div
            className={`avatar relative grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center overflow-hidden rounded-full font-black text-white text-xs transition-transform duration-300 group-hover:scale-105 ${
              darkMode ? "neu-avatar-dark" : "neu-avatar-light"
            }`}
          >
            {!imgError && navLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={navLogoUrl}
                alt={brandName}
                onError={() => setImgError(true)}
                className="h-full w-full rounded-full object-cover object-top"
              />
            ) : (
              <span>UI</span>
            )}
          </div>
          <span className="truncate tracking-tight hidden sm:inline-block max-w-[170px] font-black">
            {brandName}
          </span>
        </Link>

        {/* Desktop Neumorphic Navigation Links */}
        <div className="links hidden items-center gap-1.5 md:flex">
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
                className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-tight whitespace-nowrap cursor-pointer rounded-full ${
                  darkMode ? "neu-link-dark" : "neu-link-light"
                } ${active ? "neu-active" : ""}`}
              >
                <Icon
                  size={14}
                  className={`transition-colors duration-200 ${
                    active
                      ? darkMode
                        ? "text-[#16f2a4]"
                        : "text-[#00aa83]"
                      : "opacity-80 group-hover:opacity-100"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Action Controls: Neumorphic Theme Toggle & Mobile Menu Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            aria-label={darkMode ? "Switch to light theme" : "Switch to dark theme"}
            title={darkMode ? "Switch to light theme" : "Switch to dark theme"}
            onClick={toggleColorMode}
            className={`grid h-9 w-9 sm:h-10 sm:w-10 rounded-full place-items-center cursor-pointer ${
              darkMode ? "neu-btn-dark" : "neu-btn-light"
            }`}
          >
            {darkMode ? (
              <Sun size={17} className="text-amber-400 transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Moon size={16} className="text-[#333d4d] transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>

          <button
            type="button"
            aria-label="Open navigation menu"
            className={`grid h-9 w-9 sm:h-10 sm:w-10 rounded-full place-items-center cursor-pointer md:hidden ${
              darkMode ? "neu-btn-dark" : "neu-btn-light"
            } ${menuOpen ? "neu-pressed" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X size={17} className={darkMode ? "text-[#16f2a4]" : "text-[#00aa83]"} />
            ) : (
              <Menu size={17} />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile / Tablet Neumorphic Dropdown Menu */}
      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`mx-auto mt-3.5 grid max-w-sm gap-2.5 p-4 lg:hidden ${
              darkMode ? "neu-navbar-dark text-white" : "neu-navbar-light text-[#333d4d]"
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
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold tracking-wide ${
                    darkMode ? "neu-link-dark" : "neu-link-light"
                  } ${active ? "neu-active" : ""}`}
                >
                  <Icon
                    size={18}
                    className={
                      active
                        ? darkMode
                          ? "text-[#16f2a4]"
                          : "text-[#00aa83]"
                        : "opacity-75"
                    }
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
