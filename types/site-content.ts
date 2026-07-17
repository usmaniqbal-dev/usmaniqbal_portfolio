export type ButtonContent = {
  label: string;
  href: string;
};

export type HomeContent = {
  title: string;
  subtitle: string;
  description: string;
  primaryButton: ButtonContent;
  secondaryButton: ButtonContent;
  heroImage: string;
  profileImage: string;
  heroTemplate?: HeroTemplate;
  heroBackgroundType?: "color" | "image" | "video";
  heroBackgroundUrl?: string;
  heroBackgroundColor?: string;
};

export type HeroTemplate = "circle" | "rounded" | "glass" | "floating" | "layered";

export type StatisticContent = {
  id: string;
  value: string;
  label: string;
};

export type AboutContent = {
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  image?: string;
  experience?: string;
  statistics?: StatisticContent[];
  primaryButton?: ButtonContent;
  secondaryButton?: ButtonContent;
};

export type SkillContent = {
  id: string;
  name: string;
  category: string;
  level: number;
  accent: string;
  icon?: string;
};

export type ServiceContent = {
  id: string;
  title: string;
  description: string;
  icon?: string;
  image?: string;
};

export type ProjectContent = {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  url: string;
  githubUrl?: string;
};

export type SocialContent = {
  id: string;
  platform: string;
  label: string;
  url: string;
};

export type ContactContent = {
  email: string;
  phone: string;
  location: string;
  formHeadline: string;
  googleMapUrl?: string;
  formFields?: string[];
};

export type ThemeContent = {
  primary: string;
  secondary: string;
  accent: string;
  animations: boolean;
};

export type SliderContent = {
  heroSlides: string[];
  projectSlides: string[];
};

export type ResponsiveDevice = "desktop" | "tablet" | "mobile";

export type StyleValue = string | number | boolean | undefined;

export type BuilderStyles = Record<string, StyleValue>;

export type ResponsiveStyles = {
  desktop: BuilderStyles;
  tablet: BuilderStyles;
  mobile: BuilderStyles;
};

export type WebsiteSettings = {
  globalFont: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  cardColor: string;
  buttonColor: string;
  darkMode: boolean;
  navbarStyle: string;
  footerStyle: string;
  heroStyle: string;
  activeTemplate: string;
  activeTheme: string;
  lastPublishedAt: string;
  draftUpdatedAt: string;
};

export type BuilderTheme = {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  textSecondaryColor: string;
  cardColor: string;
  buttonColor: string;
  buttonTextColor: string;
  navbarBackground: string;
  navbarTextColor: string;
  footerBackground: string;
  footerTextColor: string;
  gradientBackground: string;
  gradientStart: string;
  gradientEnd: string;
  gradientDirection: string;
  darkMode: boolean;
  createdAt: string;
  isActive: boolean;
};

export type BuilderTemplate = {
  id: string;
  name: string;
  thumbnail: string;
  sectionsOrder: string[];
  sectionSettings: Record<string, BuilderStyles>;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  createdBy: string;
};

export type BlockType =
  | "hero"
  | "text"
  | "image"
  | "button"
  | "skill-card"
  | "project-card"
  | "service-card"
  | "contact-form"
  | "social-links"
  | "testimonial"
  | "timeline"
  | "experience-card"
  | "education-card"
  | "custom-html";

export type BuilderBlock = {
  id: string;
  type: BlockType;
  content: Record<string, unknown>;
  styles: BuilderStyles;
  responsiveStyles: ResponsiveStyles;
  order: number;
  isVisible: boolean;
  pageId: string;
};

export type BuilderSection = {
  id: string;
  name: string;
  type: string;
  blocks: BuilderBlock[];
  order: number;
  styles: BuilderStyles;
  responsiveStyles: ResponsiveStyles;
  isVisible: boolean;
};

export type BuilderPage = {
  id: string;
  title: string;
  slug: string;
  blocks: BuilderBlock[];
  sections: BuilderSection[];
  isPublished: boolean;
  metaTitle: string;
  metaDescription: string;
  createdAt: string;
};

export type MediaFile = {
  id: string;
  filename: string;
  url: string;
  type: "image" | "video" | "document" | "icon";
  size: number;
  uploadedAt: string;
  usedIn: string[];
};

export type AIContent = {
  id: string;
  type: string;
  prompt: string;
  generatedText: string;
  usedFor: string;
  createdAt: string;
};

export type AdminUser = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: "owner" | "admin" | "editor";
  lastLogin: string;
};

export type VersionHistory = {
  id: string;
  snapshotData: Partial<SiteContent>;
  savedAt: string;
  label: string;
  restoredAt: string;
};

export type BuilderState = {
  settings: WebsiteSettings;
  themes: BuilderTheme[];
  templates: BuilderTemplate[];
  pages: BuilderPage[];
  media: MediaFile[];
  aiContent: AIContent[];
  adminUsers: AdminUser[];
  versionHistory: VersionHistory[];
};

export type SiteContent = {
  home: HomeContent;
  about: AboutContent;
  skills: SkillContent[];
  services: ServiceContent[];
  projects: ProjectContent[];
  contact: ContactContent;
  socials: SocialContent[];
  theme: ThemeContent;
  sliders: SliderContent;
  builder: BuilderState;
};
