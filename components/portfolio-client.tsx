"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Database,
  ExternalLink,
  Eye,
  Github,
  Home,
  Instagram,
  Layers3,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Moon,
  Phone,
  Send,
  Settings2,
  Sparkles,
  Sun,
  UserRound,
  X,
  Zap
} from "lucide-react";
import type { ProjectContent, ServiceContent, SiteContent, SkillContent, SocialContent } from "@/types/site-content";
import { useCursorParallax } from "@/hooks/useCursorParallax";
import { useScrollDirection } from "@/hooks/useScrollDirection";

type PortfolioClientProps = {
  content: SiteContent;
};

type MotionOptions = {
  delay?: number;
  className?: string;
};

const navItems = [
  { label: "Home", href: "#home", icon: Home },
  { label: "About", href: "#about", icon: UserRound },
  { label: "Skills", href: "#skills", icon: Settings2 },
  { label: "Projects", href: "#projects", icon: BriefcaseBusiness },
  { label: "Contact", href: "#contact", icon: Mail }
];

const serviceIcons = [Database, Zap, Layers3, Settings2, Code2, BriefcaseBusiness, Bot, Sparkles];

const LOADER_MAX_MS = 1280;
const DEFER_3D_MS = 180;

const Global3DBackground = dynamic(() => import("@/components/animations/Global3DBackground"), {
  ssr: false,
  loading: () => <div className="pointer-events-none fixed inset-0 z-0 bg-animated-fallback" aria-hidden />
});

export default function PortfolioClient({ content: initialContent }: PortfolioClientProps) {
  const [content, setContent] = useState(initialContent);
  const reducedMotion = useReducedMotion();
  const shouldAnimate = content.theme.animations && !reducedMotion;
  const heroSectionRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [effectsReady, setEffectsReady] = useState(false);

  useEffect(() => {
    const savedMode = window.localStorage.getItem("nuraxtech-portfolio-theme");
    setDarkMode(savedMode ? savedMode === "dark" : content.builder.settings.darkMode);
  }, [content.builder.settings.darkMode]);

  useEffect(() => {
    if (!shouldAnimate) {
      setLoading(false);
      return;
    }

    const timeout = window.setTimeout(() => setLoading(false), LOADER_MAX_MS);
    return () => window.clearTimeout(timeout);
  }, [shouldAnimate]);

  useEffect(() => {
    if (!shouldAnimate || loading) {
      setEffectsReady(false);
      return;
    }

    const timeout = window.setTimeout(() => setEffectsReady(true), DEFER_3D_MS);
    return () => window.clearTimeout(timeout);
  }, [loading, shouldAnimate]);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  useEffect(() => {
    let updating = false;

    // Fetches the saved portfolio document when an admin tab announces a change or the page regains focus.
    async function refreshLiveContent() {
      if (updating) {
        return;
      }

      updating = true;
      try {
        const response = await fetch("/api/content", { cache: "no-store" });
        if (response.ok) {
          setContent((await response.json()) as SiteContent);
        }
      } finally {
        updating = false;
      }
    }

    const channel = "BroadcastChannel" in window ? new BroadcastChannel("nuraxtech-portfolio-content") : null;
    if (channel) {
      channel.onmessage = refreshLiveContent;
    }

    const interval = window.setInterval(refreshLiveContent, 15000);
    window.addEventListener("focus", refreshLiveContent);

    return () => {
      channel?.close();
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshLiveContent);
    };
  }, []);

  // Persists the public color mode locally without overwriting the global admin-selected palette.
  function toggleColorMode() {
    setDarkMode((current) => {
      const next = !current;
      window.localStorage.setItem("nuraxtech-portfolio-theme", next ? "dark" : "light");
      return next;
    });
  }

  const activeBuilderTheme = content.builder.themes.find((theme) => theme.isActive);
  const themePrimary = content.theme.primary || activeBuilderTheme?.primaryColor || content.builder.settings.primaryColor;
  const themeSecondary = content.theme.secondary || activeBuilderTheme?.secondaryColor || content.builder.settings.secondaryColor;
  const style = {
    "--primary": themePrimary,
    "--secondary": themeSecondary,
    "--accent": content.theme.accent || activeBuilderTheme?.accentColor || "#a7f3d0",
    "--builder-bg": activeBuilderTheme?.backgroundColor || content.builder.settings.backgroundColor,
    "--builder-text": activeBuilderTheme?.textColor || content.builder.settings.textColor,
    "--builder-card": activeBuilderTheme?.cardColor || content.builder.settings.cardColor
  } as React.CSSProperties;

  const activeTemplate = content.builder.templates.find((template) => template.isActive);
  const sectionOrder = activeTemplate?.sectionsOrder || ["home", "about", "skills", "services", "projects", "contact"];
  const orderFor = (id: string) => ({ order: sectionOrder.indexOf(id) === -1 ? 99 : sectionOrder.indexOf(id) });
  const heroBackgroundType = content.home.heroBackgroundType;
  const heroBackgroundUrl = content.home.heroBackgroundUrl;
  const uploadedHeroImage = content.home.profileImage || content.home.heroImage || "/images/usman-profile.png";
  const heroImageSrc = uploadedHeroImage.includes("usman-profile.png") ? "/images/usman-hero.png" : uploadedHeroImage;
  const homeStyle = {
    ...orderFor("home"),
    ...(heroBackgroundType === "color" && content.home.heroBackgroundColor ? { backgroundColor: content.home.heroBackgroundColor } : {})
  };

  const reveal = ({ delay = 0, className = "" }: MotionOptions = {}) => ({
    className,
    initial: shouldAnimate ? { opacity: 0, y: 40, rotateX: 8 } : false,
    whileInView: shouldAnimate ? { opacity: 1, y: 0, rotateX: 0 } : undefined,
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.72, delay, ease: "easeOut" as const },
    style: { transformPerspective: 900 }
  });

  return (
    <main className={`site-shell flex min-h-screen flex-col overflow-hidden text-white ${darkMode ? "dark-mode" : "light-mode"}`} style={style}>
      <AnimatePresence>{loading ? <LoadingExperience /> : null}</AnimatePresence>
      {effectsReady ? (
        <Global3DBackground primary={themePrimary} secondary={themeSecondary} enabled={shouldAnimate} />
      ) : (
        <div className="pointer-events-none fixed inset-0 z-0 bg-animated-fallback" aria-hidden />
      )}
      <div className="site-grid pointer-events-none fixed inset-0 opacity-80" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-px glow-line opacity-70" />
      <FloatingNav menuOpen={menuOpen} setMenuOpen={setMenuOpen} darkMode={darkMode} toggleColorMode={toggleColorMode} siteName={content.builder.settings.siteName} logoUrl={content.builder.settings.logoUrl} logoLink={content.builder.settings.logoLink} />

      <section ref={heroSectionRef} id="home" className="hero-showcase relative min-h-[100svh] px-5 pb-8 pt-28 sm:px-8 lg:h-[100svh] lg:min-h-0 lg:overflow-hidden lg:px-12 lg:pb-4 lg:pt-28" style={homeStyle}>
        {heroBackgroundType === "image" && heroBackgroundUrl ? <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBackgroundUrl})` }} /> : null}
        {heroBackgroundType === "video" && heroBackgroundUrl ? <video src={heroBackgroundUrl} autoPlay muted loop playsInline className="absolute inset-0 z-0 h-full w-full object-cover" /> : null}
        {heroBackgroundType === "image" || heroBackgroundType === "video" ? <div className="absolute inset-0 z-[1] bg-black/55" /> : null}
        <div className="hero-showcase-bg pointer-events-none absolute inset-0 z-[1]" aria-hidden />
        <div className="hero-orb-field pointer-events-none absolute right-0 top-20 z-[2] hidden h-[72vh] w-[58vw] lg:block" aria-hidden>
          <span className="hero-orb-core" />
          <span className="hero-orb-ring hero-orb-ring-one" />
          <span className="hero-orb-ring hero-orb-ring-two" />
          <span className="hero-orb-dot hero-orb-dot-one" />
          <span className="hero-orb-dot hero-orb-dot-two" />
        </div>
        <div className="relative z-10 mx-auto grid min-h-[calc(100svh-9rem)] w-full max-w-7xl min-w-0 items-center gap-8 lg:h-[calc(100svh-8rem)] lg:min-h-0 lg:items-center lg:grid-cols-[0.92fr_0.78fr]">
          <motion.div initial={false} className="relative z-10 w-full min-w-0 max-w-[calc(100vw-4rem)] sm:max-w-3xl lg:overflow-hidden">
            <motion.div {...heroIn(shouldAnimate, loading, 0.2)} className="mb-8 inline-flex max-w-full items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/70 shadow-glow lg:py-2 lg:text-xs">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)] shadow-[0_0_18px_var(--primary)]" />
              <span className="truncate">Available for New CRM & Automation Projects</span>
            </motion.div>

            <motion.p {...heroIn(shouldAnimate, loading, 0.3)} className="mb-4 text-sm font-bold uppercase text-[var(--primary)]">NURAXTECH</motion.p>
            <motion.h1 {...heroIn(shouldAnimate, loading, 0.36, true)} className="text-balance break-words text-4xl font-black leading-[1.02] text-white sm:text-5xl lg:line-clamp-2 lg:text-5xl">
              {content.home.title}
            </motion.h1>
            <motion.h2 {...heroIn(shouldAnimate, loading, 0.46)} className="mt-3 max-w-[320px] text-balance text-2xl font-black leading-tight text-[var(--primary)] sm:max-w-none sm:text-3xl lg:line-clamp-2 lg:text-3xl">
              {content.home.subtitle}
            </motion.h2>
            <motion.p {...heroIn(shouldAnimate, loading, 0.52)} className="mt-5 max-w-[310px] text-base leading-7 text-white/62 sm:max-w-2xl lg:line-clamp-3">
              {content.home.description}
            </motion.p>

            <motion.div {...heroIn(shouldAnimate, loading, 0.64, false, "spring")} className="mt-5 flex w-full flex-col gap-2.5 sm:flex-row">
              <a
                href={content.home.primaryButton.href}
                className="group inline-flex w-full max-w-[260px] items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-black text-black shadow-glow transition duration-300 hover:-translate-y-0.5 hover:bg-white sm:w-auto sm:max-w-none"
              >
                <span className="truncate">{content.home.primaryButton.label}</span>
                <span className="grid h-7 w-7 place-items-center rounded-full bg-black/10 transition group-hover:translate-x-0.5">
                  <ArrowRight size={17} />
                </span>
              </a>
              <a
                href={content.home.secondaryButton.href}
                className="inline-flex w-full max-w-[260px] items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.04] px-5 py-2.5 text-sm font-black text-white transition duration-300 hover:-translate-y-0.5 hover:border-[var(--secondary)] hover:text-[var(--secondary)] sm:w-auto sm:max-w-none"
              >
                <MessageCircle size={17} />
                <span className="truncate">{content.home.secondaryButton.label}</span>
              </a>
              <a
                href="/cv"
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full max-w-[260px] items-center justify-center gap-2 rounded-full border border-[var(--secondary)]/45 bg-[var(--secondary)]/10 px-5 py-2.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:border-[var(--secondary)] hover:text-[var(--secondary)] sm:w-auto sm:max-w-none"
              >
                <Eye size={16} />
                View CV
              </a>
            </motion.div>

            <motion.div {...heroIn(shouldAnimate, loading, 0.72, false, "spring")}>
              <SocialLinks socials={content.socials} compact />
            </motion.div>
          </motion.div>

          <div className="h-full"><HeroVisual imageSrc={heroImageSrc} shouldAnimate={shouldAnimate && !loading} dragConstraints={heroSectionRef} /></div>
        </div>
      </section>

      <section id="about" className="relative px-4 py-12 sm:px-6 lg:px-8" style={orderFor("about")}>
        <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[0.98fr_0.9fr]">
          <motion.div {...reveal()} className="glass-panel rounded-[8px] p-4 sm:p-5">
            <SectionKicker number="01" label="About" />
            <h2 className="mt-5 text-balance text-2xl font-black leading-tight sm:text-3xl">{content.about.title}</h2>
            <p className="mt-4 text-sm leading-6 text-white/64 sm:text-base">{content.about.description}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {content.about.highlights.map((item, index) => (
                <div key={`highlight-${index}-${item}`} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-3">
                  <Sparkles className="mb-3 text-[var(--primary)]" size={18} />
                  <p className="text-sm font-semibold leading-6 text-white/82">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...reveal({ delay: 0.1 })} className="grid content-start gap-4">
            <div className="rounded-[8px] border border-[var(--primary)]/25 bg-[var(--primary)]/8 p-4 shadow-glow">
              <p className="text-sm font-bold uppercase text-[var(--primary)]">{content.about.eyebrow}</p>
              <h3 className="mt-2 text-lg font-black leading-snug">CRM systems, websites, AI bots, and business automation under one brand.</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {(content.about.statistics || [["16+", "Core Skills"], ["10+", "Services"], ["8", "Featured Projects"]].map(([value, label]) => ({ id: label, value, label }))).map((statistic) => (
                <div key={statistic.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-2xl font-black text-[var(--secondary)]">{statistic.value}</p>
                  <p className="mt-2 text-sm font-semibold uppercase text-white/52">{statistic.label}</p>
                </div>
              ))}
            </div>
            <div className="card-grid rounded-[8px] border border-white/10 bg-black/30 p-4">
              <div className="flex flex-wrap gap-2">
                {["Salesforce", "Litify", "HubSpot", "Zoho", "AI Bots", "Next.js", "Android", "Firebase"].map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-bold text-white/72">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            {content.about.experience || content.about.image || content.about.primaryButton?.label || content.about.secondaryButton?.label ? (
              <div className="grid gap-4 rounded-[8px] border border-white/10 bg-black/30 p-4 sm:grid-cols-[auto_1fr]">
                {content.about.image ? <Image src={content.about.image} alt="Usman Iqbal" width={80} height={80} className="h-20 w-20 rounded-[8px] object-cover" /> : null}
                <div>
                  {content.about.experience ? <p className="font-bold text-[var(--secondary)]">{content.about.experience}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {content.about.primaryButton?.label ? <a href={content.about.primaryButton.href} className="rounded-full bg-[var(--primary)] px-4 py-2 font-black text-black transition hover:bg-white">{content.about.primaryButton.label}</a> : null}
                    {content.about.secondaryButton?.label ? <a href={content.about.secondaryButton.href} className="rounded-full border border-white/15 px-4 py-2 font-black text-white/78 transition hover:border-[var(--primary)] hover:text-[var(--primary)]">{content.about.secondaryButton.label}</a> : null}
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>
        </div>
      </section>

      <section id="skills" className="relative px-4 py-12 sm:px-6 lg:px-8" style={orderFor("skills")}>
        <div className="mx-auto max-w-5xl">
          <motion.div {...reveal()} className="mb-6">
            <SectionKicker number="02" label="Technical Skills" />
          </motion.div>
          <div className="skills-list-grid grid gap-2 md:grid-cols-2">
            {content.skills.map((skill, index) => (
              <SkillCard key={skill.id} skill={skill} index={index} shouldAnimate={shouldAnimate} />
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="relative px-4 py-12 sm:px-6 lg:px-8" style={orderFor("services")}>
        <div className="mx-auto max-w-5xl">
          <motion.div {...reveal()} className="mb-6">
            <SectionKicker number="03" label="Services" />
            <h2 className="mt-4 max-w-3xl text-balance text-xl font-black leading-tight sm:text-2xl lg:text-3xl">
              Practical systems for businesses that need cleaner workflows and faster execution.
            </h2>
          </motion.div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {content.services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} shouldAnimate={shouldAnimate} />
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="relative px-4 py-12 sm:px-6 lg:px-8" style={orderFor("projects")}>
        <div className="mx-auto max-w-5xl">
          <motion.div {...reveal()} className="mb-6">
            <SectionKicker number="04" label="Projects" />
          </motion.div>
          <ProjectSlider projects={content.projects} slides={content.sliders.projectSlides} shouldAnimate={shouldAnimate} />
        </div>
      </section>

      <section id="contact" className="relative px-4 py-12 sm:px-6 lg:px-8" style={orderFor("contact")}>
        <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[0.85fr_1fr]">
          <motion.div {...reveal()}>
            <SectionKicker number="05" label="Contact" />
            <h2 className="mt-5 text-balance text-2xl font-black leading-tight sm:text-3xl">{content.contact.formHeadline}</h2>
            <div className="mt-7 grid gap-3">
              <ContactLine icon={Mail} label="Email" value={content.contact.email} href={`mailto:${content.contact.email}`} />
              <ContactLine icon={Phone} label="Phone" value={content.contact.phone} href={`tel:${content.contact.phone}`} />
              <ContactLine icon={MapPin} label="Location" value={content.contact.location} />
              {content.contact.googleMapUrl ? <ContactLine icon={MapPin} label="Google Map" value="Open location" href={content.contact.googleMapUrl} /> : null}
            </div>
            <SocialLinks socials={content.socials} compact />
          </motion.div>

          <ContactForm email={content.contact.email} fields={content.contact.formFields} shouldAnimate={shouldAnimate} />
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-white/45 sm:px-8" style={{ order: 100 }}>
        <p>© {new Date().getFullYear()} Usman Iqbal - NURAXTECH. Built for CRM, automation, web, and AI solutions.</p>
      </footer>
    </main>
  );
}

function FloatingNav({
  menuOpen,
  setMenuOpen,
  darkMode,
  toggleColorMode,
  siteName,
  logoUrl,
  logoLink
}: {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  darkMode: boolean;
  toggleColorMode: () => void;
  siteName: string;
  logoUrl: string;
  logoLink: string;
}) {
  const { hidden, scrolled } = useScrollDirection();
  const brandName = siteName || "Usman Iqbal";

  return (
    <motion.header animate={{ y: hidden ? -92 : 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="fixed left-0 right-0 top-4 z-50 px-5">
      <nav className={`mx-auto flex max-w-[calc(100vw-2.5rem)] items-center justify-between rounded-full border border-white/10 px-3 py-2.5 shadow-cyan transition md:max-w-5xl ${scrolled ? "bg-black/72 backdrop-blur-2xl" : "bg-black/48 backdrop-blur-xl"}`}>
        <a href={logoLink || "#home"} className="flex min-w-0 items-center gap-2.5 font-black text-white">
          <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--primary)] text-black">
            {logoUrl ? <img src={logoUrl} alt="" className="h-full w-full object-cover" /> : brandName.charAt(0)}
          </span>
          <span className="hidden max-w-[160px] truncate sm:block">{brandName}</span>
        </a>
        <div className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className="group relative flex items-center gap-2 rounded-full px-3 py-2 font-semibold text-white/62 transition hover:bg-white/[0.06] hover:text-white"
              >
                <Icon size={20} className="transition group-hover:text-[var(--primary)]" />
                {item.label}
                <span className="absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 bg-[var(--primary)] shadow-[0_0_12px_var(--primary)] transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"} title={darkMode ? "Light mode" : "Dark mode"} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/78 transition hover:border-[var(--primary)] hover:text-[var(--primary)]" onClick={toggleColorMode}>
            {darkMode ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button
            type="button"
            aria-label="Open navigation"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-auto mt-3 grid max-w-sm gap-2 rounded-[8px] border border-white/10 bg-black/88 p-3 backdrop-blur-2xl md:hidden"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-[8px] px-4 py-3 font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
                >
                  <Icon size={20} />
                  {item.label}
                </a>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}

function LoadingExperience() {
  const firstName = "USMAN".split("");
  const lastName = "IQBAL".split("");

  return (
    <motion.div
      initial={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.08, filter: "blur(10px)" }}
      transition={{ duration: 0.2, ease: [0.76, 0, 0.24, 1] }}
      className="portfolio-loader fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[#03071c] text-white"
      role="status"
      aria-label="Loading Usman Iqbal portfolio"
    >
      <div className="loader-grid pointer-events-none absolute inset-0" aria-hidden />
      <motion.div
        className="loader-aura pointer-events-none absolute h-[min(72vw,620px)] w-[min(72vw,620px)] rounded-full"
        initial={{ opacity: 0.55, scale: 0.8 }}
        animate={{ opacity: [0, 0.9, 0.65], scale: [0.45, 1.05, 1] }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        aria-hidden
      />
      <div className="loader-rings pointer-events-none absolute" aria-hidden>
        <span className="loader-ring loader-ring-one" />
        <span className="loader-ring loader-ring-two" />
        <span className="loader-ring loader-ring-three" />
      </div>

      <div className="relative z-10 flex w-full flex-col items-center px-5 text-center">
        <motion.p
          initial={{ opacity: 0.65, y: 0, letterSpacing: "0.3em" }}
          animate={{ opacity: 1, y: 0, letterSpacing: "0.48em" }}
          transition={{ duration: 0.32, ease: "easeOut" }}
          className="mb-5 pl-[0.48em] text-[10px] font-bold uppercase text-white/45 sm:text-xs"
        >
          Welcome to my portfolio
        </motion.p>

        <div className="loader-name-scene" aria-hidden>
          <div className="loader-name-line">
            {firstName.map((letter, index) => (
              <motion.span
                key={`first-${letter}-${index}`}
                className="loader-letter"
                initial={{ opacity: 0, y: 26, rotateX: -55, rotateY: -28, scale: 0.72, filter: "blur(7px)" }}
                animate={{ opacity: 1, y: 0, rotateX: 0, rotateY: 0, scale: 1, filter: "blur(0px)" }}
                transition={{ delay: 0.06 + index * 0.055, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                {letter}
              </motion.span>
            ))}
          </div>
          <div className="loader-name-line loader-name-last">
            {lastName.map((letter, index) => (
              <motion.span
                key={`last-${letter}-${index}`}
                className="loader-letter"
                initial={{ opacity: 0, y: 26, rotateX: -55, rotateY: -28, scale: 0.72, filter: "blur(7px)" }}
                animate={{ opacity: 1, y: 0, rotateX: 0, rotateY: 0, scale: 1, filter: "blur(0px)" }}
                transition={{ delay: 0.06 + (index + firstName.length) * 0.055, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                {letter}
              </motion.span>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ scaleX: 0.35, opacity: 0.65 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.68, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="loader-name-rule mt-5 h-px w-[min(72vw,420px)] origin-center"
        />
        <motion.p
          initial={{ opacity: 0.55, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.74, duration: 0.2 }}
          className="mt-4 text-[10px] font-semibold uppercase tracking-[0.42em] text-white/55 sm:text-xs"
        >
          CRM · Automation · Web · AI
        </motion.p>

        <div className="mt-9 h-[3px] w-44 overflow-hidden rounded-full bg-white/10 sm:w-52">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.05, ease: [0.65, 0, 0.35, 1] }}
            className="loader-progress h-full origin-left rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}

function heroIn(shouldAnimate: boolean, loading: boolean, delay: number, rotate = false, type: "tween" | "spring" = "tween") {
  return {
    initial: shouldAnimate ? { opacity: 0, y: 24, rotateX: rotate ? 10 : 0, scale: type === "spring" ? 0.96 : 1 } : false,
    animate: shouldAnimate && !loading ? { opacity: 1, y: 0, rotateX: 0, scale: 1 } : undefined,
    transition: type === "spring" ? { type: "spring" as const, stiffness: 260, damping: 18, delay } : { duration: 0.38, delay, ease: "easeOut" as const },
    style: { transformPerspective: 900 }
  };
}

function HeroVisual({
  imageSrc,
  shouldAnimate,
  dragConstraints
}: {
  imageSrc: string;
  shouldAnimate: boolean;
  dragConstraints: React.RefObject<HTMLElement | null>;
}) {
  const mobileInteraction = useMobileHeroInteraction();
  const cursor = useCursorParallax(shouldAnimate && !mobileInteraction);
  const parallaxX = useMotionValue(0);
  const parallaxY = useMotionValue(0);
  const [dragging, setDragging] = useState(false);
  const [floatPaused, setFloatPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = visualRef.current;
    if (!element || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { rootMargin: "120px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (mobileInteraction) {
      parallaxX.set(0);
      parallaxY.set(0);
      return;
    }

    if (!shouldAnimate || !isVisible) {
      return;
    }

    let frame = 0;
    const tick = () => {
      const targetX = dragging ? 0 : cursor.current.x * 18;
      const targetY = dragging ? 0 : cursor.current.y * 12;
      parallaxX.set(parallaxX.get() + (targetX - parallaxX.get()) * 0.07);
      parallaxY.set(parallaxY.get() + (targetY - parallaxY.get()) * 0.07);
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [cursor, dragging, isVisible, mobileInteraction, parallaxX, parallaxY, shouldAnimate]);

  return (
    <motion.div
      ref={visualRef}
      initial={shouldAnimate ? { opacity: 0, scale: 0.94, x: 18 } : false}
      animate={shouldAnimate ? { opacity: 1, scale: 1, x: 0 } : undefined}
      transition={{ duration: 0.75, ease: "easeOut" }}
      className="relative mx-auto h-[320px] w-full max-w-[480px] min-w-0 sm:h-[390px] lg:h-[min(460px,calc(100svh-10rem))]"
    >
      <div className="hero-figure-glow absolute inset-x-10 bottom-4 top-8" />
      <motion.div
        drag={mobileInteraction ? "x" : true}
        dragConstraints={dragConstraints}
        dragDirectionLock
        dragElastic={mobileInteraction ? 0.06 : 0.18}
        dragMomentum={!mobileInteraction}
        dragSnapToOrigin
        dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
        whileDrag={mobileInteraction ? { scale: 1.01 } : { scale: 1.05 }}
        onDragStart={() => {
          setDragging(true);
          setFloatPaused(true);
        }}
        onDragEnd={() => {
          setDragging(false);
          window.setTimeout(() => setFloatPaused(false), 1000);
        }}
        className={`hero-drag-figure absolute inset-x-0 bottom-0 mx-auto h-[92%] w-[82%] cursor-grab active:cursor-grabbing ${dragging ? "cursor-grabbing" : ""}`}
      >
        <motion.div style={{ x: parallaxX, y: parallaxY }} className="relative h-full w-full">
          <motion.div
            animate={shouldAnimate && isVisible && !floatPaused && !mobileInteraction ? { y: [0, -6, 0] } : { y: 0 }}
            transition={{ duration: 3.6, repeat: shouldAnimate && isVisible && !floatPaused && !mobileInteraction ? Infinity : 0, ease: "easeInOut" }}
            className="hero-profile-frame relative h-full w-full"
          >
            <Image
              src={imageSrc}
              alt="Usman Iqbal"
              fill
              priority
              draggable={false}
              sizes="(max-width: 1024px) 78vw, 380px"
              className="object-contain object-bottom select-none hero-profile-cutout"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function useMobileHeroInteraction() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px), (hover: none) and (pointer: coarse)");
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return mobile;
}

function SectionKicker({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-3xl font-black text-transparent [-webkit-text-stroke:1px_var(--primary)] sm:text-4xl">{number}</span>
      <span className="h-px flex-1 glow-line opacity-45" />
      <h2 className="text-2xl font-black text-white/90 sm:text-3xl">{label}</h2>
    </div>
  );
}

function SkillCard({ skill, index, shouldAnimate }: { skill: SkillContent; index: number; shouldAnimate: boolean }) {
  return (
    <motion.article
      initial={shouldAnimate ? { opacity: 0, x: index % 2 === 0 ? -18 : 18 } : false}
      whileInView={shouldAnimate ? { opacity: 1, x: 0 } : undefined}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ delay: Math.min((index % 8) * 0.035, 0.22), duration: 0.38, ease: "easeOut" }}
      className="group relative flex min-w-0 items-center gap-3 overflow-hidden rounded-[8px] border border-white/10 bg-[#151918]/80 p-2.5 transition duration-300 hover:border-[var(--primary)]/40 hover:bg-white/[0.055]"
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] border border-white/10 bg-black/35 text-xs font-bold" style={{ color: skill.accent }}>
        {skill.icon ? <img src={skill.icon} alt="" className="h-6 w-6 object-contain" /> : String(index + 1).padStart(2, "0")}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-baseline justify-between gap-3">
          <h3 className="truncate text-sm font-bold text-white/90 sm:text-[15px]">{skill.name}</h3>
          <span className="shrink-0 text-xs font-semibold" style={{ color: skill.accent }}>{skill.level}%</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="max-w-[42%] truncate text-[11px] font-medium text-white/48">{skill.category}</span>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/12">
            <div className="h-full rounded-full transition-all duration-500 group-hover:brightness-125" style={{ width: `${skill.level}%`, backgroundColor: skill.accent }} />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function FloatingSkillLogo({ skill, index, shouldAnimate }: { skill: SkillContent; index: number; shouldAnimate: boolean }) {
  return (
    <motion.div
      animate={shouldAnimate ? { y: [0, -4, 0] } : undefined}
      transition={{ y: { duration: 3.2 + (index % 3) * 0.3, repeat: Infinity, ease: "easeInOut" } }}
      whileHover={shouldAnimate ? { scale: 1.15, rotateY: 35 } : undefined}
      className="skill-logo-3d grid h-14 w-14 place-items-center rounded-[8px] border border-white/10 bg-black/35 text-lg font-black xl:h-10 xl:w-10 xl:text-sm"
      style={{ color: skill.accent, ["--skill-accent" as string]: skill.accent }}
    >
      {skill.icon ? <img src={skill.icon} alt="" className="h-9 w-9 object-contain xl:h-6 xl:w-6" /> : String(index + 1).padStart(2, "0")}
    </motion.div>
  );
}

function ServiceCard({ service, index, shouldAnimate }: { service: ServiceContent; index: number; shouldAnimate: boolean }) {
  const Icon = serviceIcons[index % serviceIcons.length];
  const tilt = useTiltMotion(shouldAnimate);

  return (
    <motion.article
      initial={shouldAnimate ? { opacity: 0, y: 40, rotateX: 8 } : false}
      whileInView={shouldAnimate ? { opacity: 1, y: 0, rotateX: 0 } : undefined}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.6 }}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={tilt.style}
      className="tilt-card group relative min-h-[154px] overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.045] p-3.5 transition-colors duration-300 hover:border-[var(--secondary)]/45"
    >
      <div className="relative z-10">
        {service.image ? <img src={service.image} alt="" className="mb-4 aspect-[16/7] w-full rounded-[8px] border border-white/10 object-cover" /> : null}
        <div className="mb-3 grid h-10 w-10 place-items-center overflow-hidden rounded-[8px] bg-[var(--primary)]/12 text-[var(--primary)] transition group-hover:bg-[var(--primary)] group-hover:text-black">
          {service.icon ? <img src={service.icon} alt="" className="h-6 w-6 object-contain" /> : <Icon size={21} />}
        </div>
        <h3 className="text-lg font-black leading-tight">{service.title}</h3>
        <p className="mt-2 max-h-11 overflow-hidden text-sm leading-5 text-white/58 transition-all duration-300 group-hover:max-h-48">
          {service.description}
        </p>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px glow-line opacity-0 transition group-hover:opacity-75" />
    </motion.article>
  );
}

function ProjectSlider({
  projects,
  slides,
  shouldAnimate
}: {
  projects: ProjectContent[];
  slides: string[];
  shouldAnimate: boolean;
}) {
  const [active, setActive] = useState(0);
  const activeProject = projects[active] || projects[0];

  useEffect(() => {
    if (!shouldAnimate || projects.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      setActive((current) => (current + 1) % projects.length);
    }, 4300);

    return () => window.clearInterval(interval);
  }, [projects.length, shouldAnimate]);

  const move = (direction: number) => {
    setActive((current) => (current + direction + projects.length) % projects.length);
  };

  const tilt = useTiltMotion(shouldAnimate);

  if (!activeProject) {
    return null;
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[0.95fr_0.72fr]">
      <motion.div onMouseMove={tilt.onMouseMove} onMouseLeave={tilt.onMouseLeave} style={tilt.style} className="tilt-card relative overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.045] p-3 sm:p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeProject.id}
            initial={shouldAnimate ? { opacity: 0, x: 24 } : false}
            animate={shouldAnimate ? { opacity: 1, x: 0 } : undefined}
            exit={shouldAnimate ? { opacity: 0, x: -24 } : undefined}
            transition={{ duration: 0.45 }}
          >
            <ProjectMockup project={activeProject} />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black">{activeProject.title}</h3>
                <p className="mt-2 max-w-2xl line-clamp-2 text-sm leading-6 text-white/62">{activeProject.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeProject.url ? <a href={activeProject.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-sm font-bold text-white/80 transition hover:border-[var(--primary)] hover:text-[var(--primary)]">View<ExternalLink size={16} /></a> : null}
                {activeProject.githubUrl ? <a href={activeProject.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-sm font-bold text-white/80 transition hover:border-[var(--secondary)] hover:text-[var(--secondary)]"><Github size={16} />GitHub</a> : null}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2">
            {projects.map((project, index) => (
              <button
                key={project.id}
                type="button"
                aria-label={`Show ${project.title}`}
                onClick={() => setActive(index)}
                className={`h-2 rounded-full transition-all ${index === active ? "w-10 bg-[var(--primary)]" : "w-2 bg-white/25"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous project"
              onClick={() => move(-1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              aria-label="Next project"
              onClick={() => move(1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4">
        <div className="rounded-[8px] border border-[var(--primary)]/20 bg-[var(--primary)]/8 p-4">
          <p className="text-sm font-bold uppercase text-[var(--primary)]">Slider Focus</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {slides.map((slide, index) => (
              <span key={`${slide}-${index}`} className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-semibold text-white/70">
                {slide}
              </span>
            ))}
          </div>
        </div>
        {projects.map((project, index) => (
          <button
            key={project.id}
            type="button"
            onClick={() => setActive(index)}
            className={`rounded-[8px] border p-3 text-left transition ${
              active === index
                ? "border-[var(--primary)]/45 bg-[var(--primary)]/10"
                : "border-white/10 bg-white/[0.035] hover:border-white/20"
            }`}
          >
            <p className="font-black leading-tight">{project.title}</p>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/52">{project.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProjectMockup({ project, compact = false }: { project: ProjectContent; compact?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-[8px] border border-white/10 bg-[#0a1010] ${compact ? "p-3" : "p-3 sm:p-4"}`}>
      {project.image ? (
        <div className="relative aspect-[16/8.5] overflow-hidden rounded-[8px]">
          <Image src={project.image} alt={project.title} fill sizes="(max-width: 1024px) 90vw, 48vw" className="object-cover" />
        </div>
      ) : (
        <div className={`card-grid relative overflow-hidden rounded-[8px] border border-white/10 bg-black/50 ${compact ? "p-3" : "p-5"}`}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-300/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]/90" />
            </div>
            <span className="text-xs font-bold uppercase text-white/40">NURAXTECH</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xs font-bold uppercase text-white/40">Project</p>
              <p className="mt-2 text-base font-black text-white">{project.title}</p>
              <div className="mt-4 grid gap-2">
                {project.tags.slice(0, 3).map((tag, index) => (
                  <span key={`${project.id}-${tag}-${index}`} className="rounded-full bg-[var(--primary)]/12 px-3 py-1 text-xs font-bold text-[var(--primary)]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid gap-3">
              <div className="grid grid-cols-3 gap-2">
                {[76, 92, 64].map((value, index) => (
                  <div key={index} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-base font-black text-[var(--secondary)]">{value}%</p>
                    <div className="mt-2 h-2 rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-[var(--secondary)]" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-3">
                <div className="flex h-20 items-end gap-2">
                  {[35, 58, 46, 76, 68, 88, 80].map((height, index) => (
                    <span key={index} className="flex-1 rounded-t bg-[var(--primary)]/80" style={{ height: `${height}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="soft-scan pointer-events-none absolute inset-0 overflow-hidden" />
    </div>
  );
}

function ContactLine({
  icon: Icon,
  label,
  value,
  href
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-3 rounded-[8px] border border-white/10 bg-white/[0.04] p-3 transition hover:border-[var(--primary)]/40">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-[var(--primary)]/12 text-[var(--primary)]">
        <Icon size={19} />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-bold uppercase text-white/42">{label}</span>
        <span className="block truncate text-sm font-bold text-white/82">{value}</span>
      </span>
    </div>
  );

  return href ? <a href={href}>{content}</a> : content;
}

function ContactForm({ email, fields, shouldAnimate }: { email: string; fields?: string[]; shouldAnimate: boolean }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const formFields = fields?.length ? fields : ["Name", "Email", "Project Type", "Message"];
  const emailJsServiceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const emailJsTemplateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const emailJsPublicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

  const emailJsFieldName = (field: string) => {
    const normalized = field.toLowerCase();
    if (normalized.includes("name")) return "name";
    if (normalized.includes("email")) return "email";
    if (normalized.includes("phone")) return "phone";
    if (normalized.includes("subject") || normalized.includes("project")) return "subject";
    if (normalized.includes("message")) return "message";
    return field.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  };
  const configuredEmailJsFields = new Set(formFields.map(emailJsFieldName));

  async function submitContactForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = formRef.current;

    if (!form || !form.checkValidity()) {
      form?.reportValidity();
      return;
    }

    setSending(true);
    setSent(false);
    setFormError("");
    if (timeInputRef.current) {
      timeInputRef.current.value = new Date().toLocaleString();
    }

    if (!emailJsServiceId || !emailJsTemplateId || !emailJsPublicKey) {
      setFormError("Contact form is not configured yet. Please email directly for now.");
      setSending(false);
      return;
    }

    try {
      await emailjs.sendForm(
        emailJsServiceId,
        emailJsTemplateId,
        form,
        { publicKey: emailJsPublicKey }
      );

      form.reset();
      setSent(true);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <motion.form
      initial={shouldAnimate ? { opacity: 0, y: 24 } : false}
      whileInView={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, amount: 0.25 }}
      ref={formRef}
      onSubmit={submitContactForm}
      className="glass-panel rounded-[8px] p-4 sm:p-6"
    >
      <input ref={timeInputRef} type="hidden" name="time" />
      {["name", "email", "phone", "subject", "message"].filter((field) => !configuredEmailJsFields.has(field)).map((field) => <input key={field} type="hidden" name={field} />)}
      <div className="grid gap-4 sm:grid-cols-2">
        {formFields.map((field, index) => {
          const isMessage = field.toLowerCase().includes("message");
          const isEmail = field.toLowerCase().includes("email");
          const fieldName = emailJsFieldName(field);
          const input = isMessage ? <textarea name={fieldName} className="peer min-h-32 resize-y rounded-[8px] border border-white/10 bg-black/35 px-4 pb-3 pt-6 text-sm text-white outline-none transition focus:border-[var(--primary)] focus:shadow-[0_0_24px_rgba(22,242,164,0.16)]" placeholder=" " required /> : <input name={fieldName} type={isEmail ? "email" : "text"} className="peer rounded-[8px] border border-white/10 bg-black/35 px-4 pb-3 pt-6 text-sm text-white outline-none transition focus:border-[var(--primary)] focus:shadow-[0_0_24px_rgba(22,242,164,0.16)]" placeholder=" " required={index < 2 || isEmail} />;

          return <label key={`${field}-${index}`} className={`floating-field relative grid text-sm font-bold text-white/70 ${isMessage ? "sm:col-span-2" : ""}`}>{input}<span>{field}</span></label>;
        })}
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/48">Messages are submitted securely. Direct email: {email}</p>
        <button type="submit" disabled={sending} className="inline-flex items-center justify-center gap-3 rounded-full bg-[var(--primary)] px-5 py-3 font-black text-black shadow-glow transition hover:scale-105 hover:bg-white hover:shadow-[0_0_34px_rgba(22,242,164,0.28)] disabled:cursor-wait disabled:opacity-60">
          <motion.span animate={sent ? { scale: [1, 1.2, 1] } : undefined}>{sent ? <CheckCircle2 size={19} /> : <Send size={19} />}</motion.span>
          {sending ? "Sending" : sent ? "Message Sent" : "Send Message"}
        </button>
      </div>
      {sent ? <p className="mt-4 rounded-[8px] border border-[var(--primary)]/30 bg-[var(--primary)]/10 p-3 text-sm font-semibold text-white">Thank you! Your message has been sent successfully.</p> : null}
      {formError ? <p className="mt-4 rounded-[8px] border border-red-300/30 bg-red-400/10 p-3 text-sm font-semibold text-red-100">{formError}</p> : null}
    </motion.form>
  );
}

function useTiltMotion(enabled: boolean) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [9, -9]), { stiffness: 220, damping: 22 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-9, 9]), { stiffness: 220, damping: 22 });
  const scale = useSpring(1, { stiffness: 220, damping: 18 });
  const shadowX = useTransform(x, [-0.5, 0.5], [22, -22]);
  const shadowY = useTransform(y, [-0.5, 0.5], [-18, 18]);
  const boxShadow = useTransform([shadowX, shadowY], ([sx, sy]) => `${sx}px ${sy}px 42px rgba(22,242,164,0.16)`);

  return {
    style: enabled ? { rotateX, rotateY, scale, boxShadow, transformPerspective: 900 } : undefined,
    onMouseMove: (event: React.MouseEvent<HTMLElement>) => {
      if (!enabled) {
        return;
      }
      const rect = event.currentTarget.getBoundingClientRect();
      x.set((event.clientX - rect.left) / rect.width - 0.5);
      y.set((event.clientY - rect.top) / rect.height - 0.5);
      scale.set(1.03);
    },
    onMouseLeave: () => {
      x.set(0);
      y.set(0);
      scale.set(1);
    }
  };
}

function SocialLinks({ socials, compact = false }: { socials: SocialContent[]; compact?: boolean }) {
  const visibleSocials = socials.filter((social) => social.url.trim());

  if (!visibleSocials.length) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-3 ${compact ? "mt-5 lg:flex-nowrap lg:overflow-x-auto" : "mt-10"}`}>
      {visibleSocials.map((social) => (
        <a
          key={social.id}
          href={social.url}
          target="_blank"
          rel="noreferrer"
          aria-label={social.label}
          className="group grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-white/62 transition hover:-translate-y-0.5 hover:border-[var(--primary)] hover:text-[var(--primary)]"
        >
          <SocialIcon social={social} />
        </a>
      ))}
    </div>
  );
}

function SocialIcon({ social }: { social: SocialContent }) {
  const platform = social.platform.toLowerCase();

  if (platform.includes("linkedin")) {
    return <Linkedin size={22} />;
  }

  if (platform.includes("github")) {
    return <Github size={22} />;
  }

  if (platform.includes("instagram")) {
    return <Instagram size={22} />;
  }

  if (platform.includes("youtube")) {
    return <span className="text-sm font-black">YT</span>;
  }

  if (platform.includes("facebook")) {
    return <span className="text-lg font-black">f</span>;
  }

  if (platform.includes("twitter") || platform === "x") {
    return <span className="text-lg font-black">X</span>;
  }

  if (platform.includes("whatsapp")) {
    return <MessageCircle size={22} />;
  }

  if (platform.includes("email")) {
    return <Mail size={22} />;
  }

  if (platform.includes("fiverr")) {
    return <span className="text-lg font-black">fi</span>;
  }

  return <ExternalLink size={21} />;
}
