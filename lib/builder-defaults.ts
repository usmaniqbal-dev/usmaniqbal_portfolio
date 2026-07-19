import type { BuilderBlock, BuilderPage, BuilderSection, BuilderState, BuilderTheme, BuilderTemplate, ResponsiveStyles } from "@/types/site-content";

const now = "2026-06-11T00:00:00.000Z";

// Creates empty breakpoint buckets used by every block and section in the visual builder.
export function emptyResponsiveStyles(): ResponsiveStyles {
  return {
    desktop: {},
    tablet: {},
    mobile: {}
  };
}

// Creates a reusable builder block with safe defaults for canvas editing.
export function createDefaultBlock(id: string, type: BuilderBlock["type"], order: number, content: Record<string, unknown> = {}): BuilderBlock {
  return {
    id,
    type,
    content,
    styles: {},
    responsiveStyles: emptyResponsiveStyles(),
    order,
    isVisible: true,
    pageId: "home-page"
  };
}

// Creates a page section mapped to the current portfolio content areas.
export function createDefaultSection(id: string, name: string, type: string, order: number, blocks: BuilderBlock[]): BuilderSection {
  return {
    id,
    name,
    type,
    blocks,
    order,
    styles: {},
    responsiveStyles: emptyResponsiveStyles(),
    isVisible: true
  };
}

export const defaultThemes: BuilderTheme[] = [
  {
    id: "midnight-blue",
    name: "Midnight Blue",
    primaryColor: "#38bdf8",
    secondaryColor: "#16f2a4",
    accentColor: "#a7f3d0",
    backgroundColor: "#020617",
    textColor: "#f8fafc",
    textSecondaryColor: "#94a3b8",
    cardColor: "#0f172a",
    buttonColor: "#38bdf8",
    buttonTextColor: "#020617",
    navbarBackground: "#020617",
    navbarTextColor: "#f8fafc",
    footerBackground: "#020617",
    footerTextColor: "#94a3b8",
    gradientBackground: "linear-gradient(135deg,#020617,#0f172a)",
    gradientStart: "#020617",
    gradientEnd: "#0f172a",
    gradientDirection: "135deg",
    darkMode: true,
    createdAt: now,
    isActive: false
  },
  {
    id: "pure-white",
    name: "Pure White",
    primaryColor: "#111827",
    secondaryColor: "#2563eb",
    accentColor: "#14b8a6",
    backgroundColor: "#ffffff",
    textColor: "#111827",
    textSecondaryColor: "#4b5563",
    cardColor: "#f8fafc",
    buttonColor: "#111827",
    buttonTextColor: "#ffffff",
    navbarBackground: "#ffffff",
    navbarTextColor: "#111827",
    footerBackground: "#f8fafc",
    footerTextColor: "#4b5563",
    gradientBackground: "linear-gradient(135deg,#ffffff,#eef2ff)",
    gradientStart: "#ffffff",
    gradientEnd: "#eef2ff",
    gradientDirection: "135deg",
    darkMode: false,
    createdAt: now,
    isActive: false
  },
  {
    id: "forest-green",
    name: "Forest Green",
    primaryColor: "#22c55e",
    secondaryColor: "#84cc16",
    accentColor: "#facc15",
    backgroundColor: "#052e16",
    textColor: "#f0fdf4",
    textSecondaryColor: "#bbf7d0",
    cardColor: "#064e3b",
    buttonColor: "#22c55e",
    buttonTextColor: "#04130a",
    navbarBackground: "#052e16",
    navbarTextColor: "#f0fdf4",
    footerBackground: "#04130a",
    footerTextColor: "#bbf7d0",
    gradientBackground: "linear-gradient(135deg,#052e16,#14532d)",
    gradientStart: "#052e16",
    gradientEnd: "#14532d",
    gradientDirection: "135deg",
    darkMode: true,
    createdAt: now,
    isActive: false
  },
  {
    id: "sunset-orange",
    name: "Sunset Orange",
    primaryColor: "#f97316",
    secondaryColor: "#fb7185",
    accentColor: "#facc15",
    backgroundColor: "#1c1917",
    textColor: "#fff7ed",
    textSecondaryColor: "#fed7aa",
    cardColor: "#292524",
    buttonColor: "#f97316",
    buttonTextColor: "#1c1917",
    navbarBackground: "#1c1917",
    navbarTextColor: "#fff7ed",
    footerBackground: "#0c0a09",
    footerTextColor: "#fed7aa",
    gradientBackground: "linear-gradient(135deg,#1c1917,#7c2d12)",
    gradientStart: "#1c1917",
    gradientEnd: "#7c2d12",
    gradientDirection: "135deg",
    darkMode: true,
    createdAt: now,
    isActive: false
  },
  {
    id: "cyberpunk-neon",
    name: "Cyberpunk Neon",
    primaryColor: "#f0f",
    secondaryColor: "#00f5ff",
    accentColor: "#faff00",
    backgroundColor: "#090012",
    textColor: "#ffffff",
    textSecondaryColor: "#c4b5fd",
    cardColor: "#160022",
    buttonColor: "#00f5ff",
    buttonTextColor: "#090012",
    navbarBackground: "#090012",
    navbarTextColor: "#ffffff",
    footerBackground: "#090012",
    footerTextColor: "#c4b5fd",
    gradientBackground: "linear-gradient(135deg,#090012,#2e1065)",
    gradientStart: "#090012",
    gradientEnd: "#2e1065",
    gradientDirection: "135deg",
    darkMode: true,
    createdAt: now,
    isActive: false
  }
];

export const defaultTemplates: BuilderTemplate[] = [
  {
    id: "classic-portfolio",
    name: "Classic Portfolio",
    thumbnail: "/images/usman-profile.png",
    sectionsOrder: ["home", "about", "skills", "services", "projects", "contact"],
    sectionSettings: {},
    isActive: true,
    isDefault: true,
    createdAt: now,
    createdBy: "system"
  },
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    thumbnail: "",
    sectionsOrder: ["home", "projects", "skills", "about", "services", "contact"],
    sectionSettings: {},
    isActive: false,
    isDefault: false,
    createdAt: now,
    createdBy: "system"
  },
  {
    id: "creative-dark",
    name: "Creative Dark",
    thumbnail: "",
    sectionsOrder: ["home", "services", "projects", "skills", "about", "contact"],
    sectionSettings: {},
    isActive: false,
    isDefault: false,
    createdAt: now,
    createdBy: "system"
  }
];

const defaultSections = [
  createDefaultSection("home", "Hero", "hero", 0, [createDefaultBlock("home-hero", "hero", 0)]),
  createDefaultSection("about", "About", "about", 1, [createDefaultBlock("about-text", "text", 0)]),
  createDefaultSection("skills", "Skills", "skills", 2, [createDefaultBlock("skills-grid", "skill-card", 0)]),
  createDefaultSection("services", "Services", "services", 3, [createDefaultBlock("services-grid", "service-card", 0)]),
  createDefaultSection("projects", "Projects", "projects", 4, [createDefaultBlock("projects-grid", "project-card", 0)]),
  createDefaultSection("contact", "Contact", "contact", 5, [createDefaultBlock("contact-form", "contact-form", 0)])
];

export const defaultPages: BuilderPage[] = [
  {
    id: "home-page",
    title: "Home",
    slug: "/",
    blocks: defaultSections.flatMap((section) => section.blocks),
    sections: defaultSections,
    isPublished: true,
    metaTitle: "Usman Iqbal | Salesforce Administrator & Developer",
    metaDescription: "Salesforce CRM, automation, web development, AI bots, and modern business solutions.",
    createdAt: now
  }
];

export const defaultBuilder: BuilderState = {
  settings: {
    siteName: "Usman Iqbal",
    logoUrl: "/images/usman-profile.png",
    logoLink: "/",
    globalFont: "Inter",
    primaryColor: "#16f2a4",
    secondaryColor: "#22d3ee",
    backgroundColor: "#020403",
    textColor: "#f8fffb",
    cardColor: "#151918",
    buttonColor: "#16f2a4",
    darkMode: true,
    navbarStyle: "floating",
    footerStyle: "minimal",
    heroStyle: "classic",
    activeTemplate: "classic-portfolio",
    activeTheme: "custom-current",
    lastPublishedAt: "",
    draftUpdatedAt: ""
  },
  themes: [
    {
      ...defaultThemes[0],
      id: "custom-current",
      name: "Current Portfolio",
      primaryColor: "#16f2a4",
      secondaryColor: "#22d3ee",
      accentColor: "#a7f3d0",
      isActive: true
    },
    ...defaultThemes
  ],
  templates: defaultTemplates,
  pages: defaultPages,
  media: [],
  aiContent: [],
  adminUsers: [],
  versionHistory: []
};
