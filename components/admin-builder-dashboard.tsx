"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import EditWebsiteManager from "@/components/edit-website-manager";
import {
  Bot,
  BriefcaseBusiness,
  Check,
  Copy,
  Eye,
  FileText,
  ImagePlus,
  LayoutDashboard,
  Loader2,
  LogOut,
  Moon,
  PanelLeft,
  Save,
  Search,
  Shield,
  Sun,
  Trash2,
  Upload
} from "lucide-react";
import type { BuilderTemplate, MediaFile, SiteContent } from "@/types/site-content";

type SessionState = {
  authenticated: boolean;
  configured: boolean;
  csrfToken?: string;
  storageMode?: string;
  message?: string;
};

type AdminView =
  | "dashboard"
  | "pages"
  | "templates"
  | "content"
  | "media"
  | "seo"
  | "ai";

const menu: { id: AdminView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "content", label: "Content Manager", icon: BriefcaseBusiness },
  { id: "seo", label: "Brand & SEO", icon: Search },
  { id: "pages", label: "Page Manager", icon: FileText },
  { id: "templates", label: "Template Manager", icon: PanelLeft },
  { id: "media", label: "Media Manager", icon: ImagePlus },
  { id: "ai", label: "AI Tools", icon: Bot }
];

const uploadTimeoutMs = 60_000;

function uploadFailureMessage(error: unknown) {
  return error instanceof Error && error.name === "AbortError"
    ? "Upload timed out. Try a smaller file or check the connection."
    : "Upload failed. Please try again.";
}

export default function AdminBuilderDashboard() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [view, setView] = useState<AdminView>("dashboard");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [adminDarkMode, setAdminDarkMode] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    const savedMode = window.localStorage.getItem("nuraxtech-admin-theme");
    setAdminDarkMode(savedMode ? savedMode === "dark" : content?.builder.settings.darkMode ?? true);
  }, [content?.builder.settings.darkMode]);

  // Persists the admin color-mode preference without changing the saved public palette.
  function toggleAdminColorMode() {
    setAdminDarkMode((current) => {
      const next = !current;
      window.localStorage.setItem("nuraxtech-admin-theme", next ? "dark" : "light");
      return next;
    });
  }

  // Loads the current admin session and content document.
  async function checkSession() {
    const response = await fetch("/api/admin/session", { cache: "no-store" });
    const state = (await response.json()) as SessionState;
    setSession(state);

    if (state.authenticated) {
      await loadContent();
    }
  }

  // Loads the editable portfolio and builder data.
  async function loadContent() {
    const response = await fetch("/api/admin/content", { cache: "no-store" });

    if (response.ok) {
      setContent((await response.json()) as SiteContent);
    }
  }

  // Sends the CSRF token required by state-changing admin APIs.
  function secureHeaders(extra: HeadersInit = {}) {
    return {
      ...extra,
      "x-admin-csrf": session?.csrfToken || ""
    };
  }

  // Authenticates the admin user with the existing credential environment variables.
  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const result = (await response.json()) as { message?: string; csrfToken?: string };

    if (!response.ok) {
      setMessage(result.message || "Login failed.");
      setBusy(false);
      return;
    }

    setSession({ authenticated: true, configured: true, csrfToken: result.csrfToken });
    await loadContent();
    setBusy(false);
  }

  // Clears the admin session cookie and local dashboard state.
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setSession({ authenticated: false, configured: true });
    setContent(null);
  }

  // Saves the entire content document as an unpublished draft.
  async function saveDraft(nextContent = content) {
    if (!nextContent) {
      return;
    }

    setBusy(true);
    const response = await fetch("/api/admin/content", {
      method: "PUT",
      headers: secureHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(nextContent)
    });

    if (response.ok) {
      setContent((await response.json()) as SiteContent);
      announcePortfolioUpdate();
      setMessage("Draft saved.");
    } else {
      setMessage("Unable to save draft.");
    }

    setBusy(false);
  }

  // Notifies any open public portfolio tab to fetch fresh saved content immediately.
  function announcePortfolioUpdate() {
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel("nuraxtech-portfolio-content");
      channel.postMessage({ type: "content-saved" });
      channel.close();
    }
  }

  // Publishes the active draft to the live portfolio.
  async function publish(action = "publish") {
    setBusy(true);
    const response = await fetch("/api/admin/publish", {
      method: "POST",
      headers: secureHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ action })
    });

    if (response.ok) {
      setContent((await response.json()) as SiteContent);
      announcePortfolioUpdate();
      setMessage(action === "publish" ? "Portfolio published." : "Draft saved.");
    } else {
      setMessage("Publish action failed.");
    }

    setBusy(false);
  }

  const activeTheme = useMemo(() => content?.builder.themes.find((theme) => theme.isActive), [content]);
  const activeTemplate = useMemo(() => content?.builder.templates.find((template) => template.isActive), [content]);
  const mediaCount = content?.builder.media.length || 0;

  if (!session) {
    return <LoadingScreen />;
  }

  if (!session.authenticated) {
    return <LoginScreen session={session} username={username} password={password} setUsername={setUsername} setPassword={setPassword} login={login} busy={busy} message={message} />;
  }

  if (!content) {
    return <LoadingScreen />;
  }

  return (
    <main className={`min-h-screen bg-[#070b12] text-white ${adminDarkMode ? "admin-dark-mode" : "admin-light-mode"}`}>
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-white/10 bg-[#090d16] p-4">
          <div className="mb-6 flex items-center gap-3 rounded-[8px] border border-white/10 bg-white/[0.04] p-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-[8px]">
              <Image src={content.home.profileImage || "/images/usman-profile.png"} alt="Portfolio" fill sizes="44px" className="object-cover object-top" />
            </div>
            <div>
              <p className="font-black">Portfolio Builder</p>
              <p className="text-xs text-white/48">WordPress / CRM style</p>
            </div>
          </div>
          <nav className="grid gap-1">
            {menu.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setView(item.id)}
                  className={`flex items-center gap-3 rounded-[8px] px-3 py-3 text-left font-bold transition ${
                    view === item.id ? "bg-[#16f2a4] text-black" : "text-white/62 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <button type="button" onClick={logout} className="mt-6 flex w-full items-center gap-3 rounded-[8px] border border-white/10 px-3 py-3 font-bold text-white/60 hover:text-red-100">
            <LogOut size={18} />
            Logout
          </button>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[#070b12]/90 px-4 py-3 backdrop-blur-xl sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase text-[#16f2a4]">{menu.find((item) => item.id === view)?.label}</p>
                <h1 className="text-2xl font-black">NURAXTECH Admin Panel</h1>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={toggleAdminColorMode} title={adminDarkMode ? "Light mode" : "Dark mode"} aria-label={adminDarkMode ? "Switch to light mode" : "Switch to dark mode"} className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-white/70 transition hover:border-[#16f2a4] hover:text-[#16f2a4]">
                  {adminDarkMode ? <Sun size={17} /> : <Moon size={17} />}
                </button>
                <a href="/" target="_blank" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-3 font-bold text-white/70 hover:text-white">
                  <Eye size={17} />
                  Live Preview
                </a>
                <button type="button" onClick={() => publish("draft")} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-3 font-bold text-white/70 hover:text-white">
                  <Save size={17} />
                  Save Draft
                </button>
                <button type="button" onClick={() => publish("publish")} className="inline-flex items-center gap-2 rounded-full bg-[#16f2a4] px-4 py-3 font-black text-black hover:bg-white">
                  {busy ? <Loader2 className="animate-spin" size={17} /> : <Check size={17} />}
                  Publish
                </button>
              </div>
            </div>
            {message ? <p className="mt-3 rounded-[8px] border border-[#16f2a4]/25 bg-[#16f2a4]/10 p-3 text-sm font-semibold text-[#bfffe8]">{message}</p> : null}
          </header>

          <div className="p-4 sm:p-6">
            {view === "dashboard" ? <DashboardView templates={content.builder.templates.length} activeTheme={activeTheme?.name || "None"} lastPublished={content.builder.settings.lastPublishedAt} mediaCount={mediaCount} storageMode={session.storageMode || "Unknown"} /> : null}
            {view === "content" ? (
              <EditWebsiteManager
                content={content}
                setContent={setContent}
                saveContent={(nextContent) => saveDraft(nextContent)}
                secureHeaders={secureHeaders}
              />
            ) : null}
            {view === "seo" ? <BrandSeoView content={content} setContent={setContent} saveDraft={saveDraft} secureHeaders={secureHeaders} /> : null}
            {view === "pages" ? <PagesView content={content} setContent={setContent} saveDraft={saveDraft} /> : null}
            {view === "templates" ? <TemplatesView content={content} activeTemplate={activeTemplate} setContent={setContent} secureHeaders={secureHeaders} /> : null}
            {view === "media" ? <MediaView content={content} setContent={setContent} secureHeaders={secureHeaders} /> : null}
            {view === "ai" ? <AIView secureHeaders={secureHeaders} content={content} setContent={setContent} /> : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function LoadingScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#070b12] text-white">
      <Loader2 className="animate-spin text-[#16f2a4]" size={34} />
    </main>
  );
}

function LoginScreen({ session, username, password, setUsername, setPassword, login, busy, message }: { session: SessionState; username: string; password: string; setUsername: (value: string) => void; setPassword: (value: string) => void; login: (event: React.FormEvent<HTMLFormElement>) => void; busy: boolean; message: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#070b12] px-5 text-white">
      <form onSubmit={login} className="w-full max-w-md rounded-[8px] border border-white/10 bg-white/[0.04] p-6 shadow-glow">
        <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-white/70">
          <Shield size={18} className="text-[#16f2a4]" />
          Protected Admin
        </div>
        <h1 className="text-3xl font-black">Sign in to Builder</h1>
        {session.configured ? null : <p className="mt-4 rounded-[8px] border border-yellow-400/25 bg-yellow-400/10 p-3 text-sm text-yellow-100">{session.message}</p>}
        <TextField label="Username" value={username} onChange={setUsername} />
        <TextField label="Password" value={password} onChange={setPassword} type="password" />
        {message ? <p className="mt-4 rounded-[8px] border border-red-400/25 bg-red-400/10 p-3 text-sm text-red-100">{message}</p> : null}
        <button type="submit" disabled={busy || !session.configured} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#16f2a4] px-5 py-4 font-black text-black disabled:opacity-50">
          {busy ? <Loader2 className="animate-spin" size={18} /> : <Shield size={18} />}
          Login
        </button>
      </form>
    </main>
  );
}

function DashboardView({ templates, activeTheme, lastPublished, mediaCount, storageMode }: { templates: number; activeTheme: string; lastPublished: string; mediaCount: number; storageMode: string }) {
  const cards = [
    ["Total templates", String(templates)],
    ["Active theme", activeTheme],
    ["Last published", lastPublished ? new Date(lastPublished).toLocaleString() : "Not published yet"],
    ["Media files", String(mediaCount)],
    ["Content source", storageMode]
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
      {cards.map(([label, value]) => (
        <div key={label} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm font-bold uppercase text-white/42">{label}</p>
          <p className="mt-3 text-2xl font-black">{value}</p>
        </div>
      ))}
    </div>
  );
}

function BrandSeoView({ content, setContent, saveDraft, secureHeaders }: { content: SiteContent; setContent: (content: SiteContent) => void; saveDraft: (content?: SiteContent | null) => void; secureHeaders: (extra?: HeadersInit) => HeadersInit }) {
  const [uploading, setUploading] = useState("");
  const [uploadError, setUploadError] = useState("");
  const seoKeywords = content.seo.keywords.join(", ");

  function update(next: SiteContent) {
    setContent(next);
  }

  async function uploadBrandFile(file: File | undefined, target: "logo" | "og") {
    if (!file) return;
    setUploading(target);
    setUploadError("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), uploadTimeoutMs);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", headers: secureHeaders(), body: formData, signal: controller.signal });
      const result = (await response.json().catch(() => ({ message: "Upload failed. The server returned an invalid response." }))) as { url?: string; message?: string };

      if (!response.ok || !result.url) {
        setUploadError(result.message || "Upload failed.");
        return;
      }

      if (target === "logo") {
        update({ ...content, builder: { ...content.builder, settings: { ...content.builder.settings, logoUrl: result.url } } });
        return;
      }

      update({ ...content, seo: { ...content.seo, ogImage: result.url } });
    } catch (error) {
      setUploadError(uploadFailureMessage(error));
    } finally {
      window.clearTimeout(timeout);
      setUploading("");
    }
  }

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-3xl font-black">Brand & SEO</h2>
        <p className="mt-2 max-w-3xl text-white/52">Manage the website logo, brand link, search title, meta description, keywords, and share image from one place.</p>
      </div>

      <section className="grid gap-5 rounded-[8px] border border-white/10 bg-white/[0.04] p-4 sm:p-6 xl:grid-cols-[320px_1fr]">
        <div className="grid gap-3">
          <p className="font-black">Logo</p>
          <div className="grid aspect-video place-items-center overflow-hidden rounded-[8px] border border-white/10 bg-black/35">
            {content.builder.settings.logoUrl ? <img src={content.builder.settings.logoUrl} alt="" className="h-full w-full object-contain p-4" /> : <span className="text-white/35">No logo selected</span>}
          </div>
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-3 font-bold text-white/70 hover:border-[#16f2a4] hover:text-[#16f2a4]">
            {uploading === "logo" ? <Loader2 className="animate-spin" size={17} /> : <Upload size={17} />}
            Upload Logo
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" className="hidden" onChange={(event) => uploadBrandFile(event.target.files?.[0], "logo")} />
          </label>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <TextField label="Website Name" value={content.builder.settings.siteName} onChange={(value) => update({ ...content, builder: { ...content.builder, settings: { ...content.builder.settings, siteName: value } } })} />
            <TextField label="Logo Link" value={content.builder.settings.logoLink} onChange={(value) => update({ ...content, builder: { ...content.builder, settings: { ...content.builder.settings, logoLink: value } } })} />
          </div>
          <TextField label="Logo URL" value={content.builder.settings.logoUrl} onChange={(value) => update({ ...content, builder: { ...content.builder, settings: { ...content.builder.settings, logoUrl: value } } })} />
        </div>
      </section>

      <section className="grid gap-4 rounded-[8px] border border-white/10 bg-white/[0.04] p-4 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <TextField label="SEO Title" value={content.seo.title} onChange={(value) => update({ ...content, seo: { ...content.seo, title: value } })} />
          <TextField label="Author" value={content.seo.author} onChange={(value) => update({ ...content, seo: { ...content.seo, author: value } })} />
        </div>
        <TextArea label="Meta Description" value={content.seo.description} onChange={(value) => update({ ...content, seo: { ...content.seo, description: value } })} />
        <TextArea label="Keywords" value={seoKeywords} onChange={(value) => update({ ...content, seo: { ...content.seo, keywords: value.split(",").map((item) => item.trim()).filter(Boolean) } })} />
        <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
          <TextField label="Canonical Website URL" value={content.seo.canonicalUrl} onChange={(value) => update({ ...content, seo: { ...content.seo, canonicalUrl: value } })} />
          <label className="mt-4 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-3 font-bold text-white/70 hover:border-[#16f2a4] hover:text-[#16f2a4]">
            {uploading === "og" ? <Loader2 className="animate-spin" size={17} /> : <Upload size={17} />}
            Upload Share Image
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(event) => uploadBrandFile(event.target.files?.[0], "og")} />
          </label>
        </div>
        {uploadError ? <p className="rounded-[8px] border border-red-300/30 bg-red-400/10 p-3 text-sm font-semibold text-red-100">{uploadError}</p> : null}
        <TextField label="Share Image URL" value={content.seo.ogImage} onChange={(value) => update({ ...content, seo: { ...content.seo, ogImage: value } })} />
        <button type="button" onClick={() => saveDraft(content)} className="inline-flex w-fit items-center gap-2 rounded-full bg-[#16f2a4] px-5 py-3 font-black text-black hover:bg-white">
          <Save size={17} />
          Save Brand & SEO
        </button>
      </section>

      <section className="grid gap-4 rounded-[8px] border border-white/10 bg-white/[0.04] p-4 sm:p-6">
        <div>
          <p className="font-black">Website Colors</p>
          <p className="mt-1 text-sm text-white/48">These colors are used on the public website after saving.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <ColorInput label="Primary" value={content.theme.primary} onChange={(value) => update({ ...content, theme: { ...content.theme, primary: value }, builder: { ...content.builder, settings: { ...content.builder.settings, primaryColor: value, buttonColor: value } } })} />
          <ColorInput label="Secondary" value={content.theme.secondary} onChange={(value) => update({ ...content, theme: { ...content.theme, secondary: value }, builder: { ...content.builder, settings: { ...content.builder.settings, secondaryColor: value } } })} />
          <ColorInput label="Accent" value={content.theme.accent} onChange={(value) => update({ ...content, theme: { ...content.theme, accent: value } })} />
        </div>
        <label className="flex items-center gap-3 rounded-[8px] border border-white/10 bg-black/25 p-4 font-bold text-white/72">
          <input type="checkbox" checked={content.theme.animations} onChange={(event) => update({ ...content, theme: { ...content.theme, animations: event.target.checked } })} className="h-5 w-5 accent-[#16f2a4]" />
          Enable website animations
        </label>
      </section>
    </div>
  );
}

function PagesView({ content, setContent, saveDraft }: { content: SiteContent; setContent: (content: SiteContent) => void; saveDraft: (content?: SiteContent | null) => void }) {
  return (
    <div className="grid gap-4">
      {content.builder.pages.map((page) => (
        <div key={page.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5">
          <div className="grid gap-4 lg:grid-cols-3">
            <TextField label="Page title" value={page.title} onChange={(value) => setContent({ ...content, builder: { ...content.builder, pages: content.builder.pages.map((item) => (item.id === page.id ? { ...item, title: value } : item)) } })} />
            <TextField label="Slug" value={page.slug} onChange={(value) => setContent({ ...content, builder: { ...content.builder, pages: content.builder.pages.map((item) => (item.id === page.id ? { ...item, slug: value } : item)) } })} />
            <TextField label="Meta title" value={page.metaTitle} onChange={(value) => setContent({ ...content, builder: { ...content.builder, pages: content.builder.pages.map((item) => (item.id === page.id ? { ...item, metaTitle: value } : item)) } })} />
          </div>
          <TextArea label="Meta description" value={page.metaDescription} onChange={(value) => setContent({ ...content, builder: { ...content.builder, pages: content.builder.pages.map((item) => (item.id === page.id ? { ...item, metaDescription: value } : item)) } })} />
        </div>
      ))}
      <button type="button" onClick={() => saveDraft(content)} className="w-fit rounded-full bg-[#16f2a4] px-5 py-3 font-black text-black">Save Pages</button>
    </div>
  );
}

function TemplatesView({ content, activeTemplate, setContent, secureHeaders }: { content: SiteContent; activeTemplate?: BuilderTemplate; setContent: (content: SiteContent) => void; secureHeaders: (extra?: HeadersInit) => HeadersInit }) {
  async function templateAction(action: string, template?: BuilderTemplate) {
    const response = await fetch("/api/admin/templates", {
      method: "POST",
      headers: secureHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ action, template, templateId: template?.id, name: "Saved Template" })
    });
    if (response.ok) setContent((await response.json()) as SiteContent);
  }

  return (
    <div>
      <button type="button" onClick={() => templateAction("save-current", activeTemplate)} className="mb-5 rounded-full bg-[#16f2a4] px-5 py-3 font-black text-black">Save Current Design</button>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {content.builder.templates.map((template) => (
          <div key={template.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5">
            <div className="grid aspect-video place-items-center rounded-[8px] border border-white/10 bg-black/35 text-white/35">{template.name}</div>
            <p className="mt-4 text-xl font-black">{template.name}</p>
            <p className="mt-2 text-sm text-white/48">{template.sectionsOrder.join(" -> ")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => templateAction("activate", template)} className="rounded-full bg-[#16f2a4] px-4 py-2 font-black text-black">Activate</button>
              <button type="button" onClick={() => templateAction("duplicate", template)} className="rounded-full border border-white/10 px-4 py-2 font-bold text-white/70">Duplicate</button>
              <button type="button" onClick={() => templateAction("delete", template)} className="rounded-full border border-red-300/30 px-4 py-2 font-bold text-red-100">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MediaView({ content, setContent, secureHeaders }: { content: SiteContent; setContent: (content: SiteContent) => void; secureHeaders: (extra?: HeadersInit) => HeadersInit }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    setError("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), uploadTimeoutMs);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", headers: secureHeaders(), body: formData, signal: controller.signal });
      const result = (await response.json().catch(() => ({ message: "Upload failed. The server returned an invalid response." }))) as { media?: MediaFile; message?: string };

      if (!response.ok || !result.media) {
        setError(result.message || "Upload failed.");
        return;
      }

      setContent({ ...content, builder: { ...content.builder, media: [result.media, ...content.builder.media] } });
    } catch (uploadError) {
      setError(uploadFailureMessage(uploadError));
    } finally {
      window.clearTimeout(timeout);
      setUploading(false);
    }
  }

  async function deleteMedia(file: MediaFile) {
    if (!window.confirm(`Remove ${file.filename} from the media library? Existing pages using this URL will keep the URL.`)) {
      return;
    }

    const response = await fetch(`/api/admin/media?id=${encodeURIComponent(file.id)}`, {
      method: "DELETE",
      headers: secureHeaders()
    });

    if (response.ok) {
      const media = (await response.json()) as MediaFile[];
      setContent({ ...content, builder: { ...content.builder, media } });
    }
  }

  return (
    <div>
      <label className="mb-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#16f2a4] px-5 py-3 font-black text-black">
        {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
        {uploading ? "Uploading" : "Upload Media"}
        <input type="file" accept="image/*,.pdf" className="hidden" onChange={(event) => upload(event.target.files?.[0])} />
      </label>
      {error ? <p className="mb-5 rounded-[8px] border border-red-300/30 bg-red-400/10 p-3 text-sm font-semibold text-red-100">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {content.builder.media.map((file) => (
          <div key={file.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
            <div className="grid aspect-video place-items-center rounded-[8px] bg-black/35 text-white/40">{file.type}</div>
            <p className="mt-3 truncate font-black">{file.filename}</p>
            <p className="text-sm text-white/45">{Math.round(file.size / 1024)} KB</p>
            <button type="button" onClick={() => navigator.clipboard.writeText(file.url)} className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm font-bold text-white/70">
              <Copy size={15} />
              Copy URL
            </button>
            <button type="button" onClick={() => deleteMedia(file)} className="ml-2 mt-3 inline-flex items-center gap-2 rounded-full border border-red-300/30 px-3 py-2 text-sm font-bold text-red-100">
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIView({ secureHeaders, content, setContent }: { secureHeaders: (extra?: HeadersInit) => HeadersInit; content: SiteContent; setContent: (content: SiteContent) => void }) {
  const tools = ["content", "project", "skill", "theme", "layout", "seo", "button", "rewrite", "improvement"];
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState("");

  async function run(type: string) {
    setLoading(type);
    const response = await fetch("/api/admin/ai", {
      method: "POST",
      headers: secureHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ type, prompt, usedFor: type })
    });
    const result = (await response.json()) as { generatedText?: string };
    setOutput(result.generatedText || "Unable to generate content.");
    setLoading("");
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <div className="grid gap-4 md:grid-cols-2">
        {tools.map((tool) => (
          <div key={tool} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xl font-black capitalize">{tool} generator</p>
            <TextArea label="Input" value={prompt} onChange={setPrompt} />
            <button type="button" onClick={() => run(tool)} className="inline-flex items-center gap-2 rounded-full bg-[#16f2a4] px-4 py-2 font-black text-black">
              {loading === tool ? <Loader2 className="animate-spin" size={16} /> : <Bot size={16} />}
              Generate
            </button>
          </div>
        ))}
      </div>
      <aside className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5">
        <p className="font-black">Output</p>
        <pre className="mt-4 whitespace-pre-wrap rounded-[8px] bg-black/35 p-4 text-sm text-white/72">{output || "Generated text appears here."}</pre>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => navigator.clipboard.writeText(output)} className="rounded-full border border-white/10 px-4 py-2 font-bold text-white/70">Copy</button>
          <button type="button" onClick={() => setContent({ ...content, about: { ...content.about, description: output || content.about.description } })} className="rounded-full bg-[#16f2a4] px-4 py-2 font-black text-black">Insert into About</button>
        </div>
      </aside>
    </div>
  );
}

function TextField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="mt-4 grid gap-2 text-sm font-bold text-white/70">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-[8px] border border-white/10 bg-black/35 px-4 py-3 text-white outline-none focus:border-[#16f2a4]" />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="mt-4 grid gap-2 text-sm font-bold text-white/70">
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-28 w-full resize-y rounded-[8px] border border-white/10 bg-black/35 px-4 py-3 text-white outline-none focus:border-[#16f2a4]" />
    </label>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-white/70">
      {label}
      <span className="flex overflow-hidden rounded-[8px] border border-white/10 bg-black/35">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-14 cursor-pointer border-0 bg-transparent p-1" />
        <input value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-white outline-none" />
      </span>
    </label>
  );
}
