"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import EditWebsiteManager from "@/components/edit-website-manager";
import {
  AlertCircle,
  ArrowLeft,
  Bot,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Cloud,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileText,
  ImagePlus,
  KeyRound,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Moon,
  PanelLeft,
  QrCode,
  RefreshCw,
  Save,
  Search,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sun,
  Trash2,
  Upload,
  Users,
  X
} from "lucide-react";
import { prepareFileForUpload } from "@/lib/client-compress";
import type { BuilderTemplate, MediaFile, SiteContent } from "@/types/site-content";

type SessionState = {
  authenticated: boolean;
  configured: boolean;
  csrfToken?: string;
  storageMode?: string;
  message?: string;
  requires2FA?: boolean;
};

type AdminView =
  | "dashboard"
  | "email"
  | "security"
  | "pages"
  | "templates"
  | "content"
  | "media"
  | "seo"
  | "ai";

type MenuItem = {
  id: AdminView | "visitors";
  label: string;
  icon: typeof LayoutDashboard;
  href?: string;
};

const menu: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "visitors", label: "Visitors", icon: Users, href: "/admin/visitors" },
  { id: "security", label: "Admin Credentials", icon: KeyRound },
  { id: "email", label: "Email Settings", icon: Mail },
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
  const [loginStep, setLoginStep] = useState<"credentials" | "totp">("credentials");
  const [totpCode, setTotpCode] = useState("");
  const [isBackupMode, setIsBackupMode] = useState(false);

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
    } else if (state.requires2FA) {
      setLoginStep("totp");
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
    const result = (await response.json()) as {
      message?: string;
      csrfToken?: string;
      requires2FA?: boolean;
    };

    if (!response.ok) {
      setMessage(result.message || "Login failed.");
      setBusy(false);
      return;
    }

    // If account has 2FA enabled, transition to Step 2 OTP verification
    if (result.requires2FA) {
      setLoginStep("totp");
      setBusy(false);
      setMessage("");
      return;
    }

    setSession({ authenticated: true, configured: true, csrfToken: result.csrfToken });
    await loadContent();
    setBusy(false);
  }

  // Completes Step 2 2FA verification using a 6-digit TOTP code or backup code
  async function verify2FA(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const response = await fetch("/api/admin/2fa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: totpCode })
    });
    const result = (await response.json()) as {
      message?: string;
      csrfToken?: string;
      ok?: boolean;
      usedBackupCode?: boolean;
    };

    if (!response.ok) {
      setMessage(result.message || "Verification failed.");
      setBusy(false);
      return;
    }

    setSession({ authenticated: true, configured: true, csrfToken: result.csrfToken });
    setLoginStep("credentials");
    setTotpCode("");
    await loadContent();
    setBusy(false);
  }

  // Clears the admin session cookie and local dashboard state.
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setSession({ authenticated: false, configured: true });
    setContent(null);
    setLoginStep("credentials");
    setTotpCode("");
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
    return (
      <LoginScreen
        session={session}
        username={username}
        password={password}
        setUsername={setUsername}
        setPassword={setPassword}
        login={login}
        loginStep={loginStep}
        setLoginStep={setLoginStep}
        totpCode={totpCode}
        setTotpCode={setTotpCode}
        verify2FA={verify2FA}
        isBackupMode={isBackupMode}
        setIsBackupMode={setIsBackupMode}
        busy={busy}
        message={message}
      />
    );
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
              if (item.href) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-center gap-3 rounded-[8px] px-3 py-3 text-left font-bold text-white/62 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              }
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setView(item.id as AdminView)}
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
                <Link
                  href="/admin/visitors"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-3 font-bold text-white/70 transition hover:border-[#16f2a4] hover:text-[#16f2a4]"
                >
                  <Users size={17} />
                  Visitors
                </Link>
                <button
                  type="button"
                  onClick={() => setView("security")}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-3 font-bold transition ${
                    view === "security" ? "border-[#16f2a4] bg-[#16f2a4]/15 text-[#16f2a4]" : "border-white/10 text-white/70 hover:text-white"
                  }`}
                >
                  <KeyRound size={17} />
                  Change Credentials
                </button>
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
            {view === "dashboard" ? <DashboardView templates={content.builder.templates.length} activeTheme={activeTheme?.name || "None"} lastPublished={content.builder.settings.lastPublishedAt} mediaCount={mediaCount} storageMode={session.storageMode || "Unknown"} onNavigateToSecurity={() => setView("security")} /> : null}
            {view === "security" ? <AdminSecurityView secureHeaders={secureHeaders} onUsernameUpdated={setUsername} /> : null}
            {view === "email" ? <EmailSettingsView secureHeaders={secureHeaders} /> : null}
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

function LoginScreen({
  session,
  username,
  password,
  setUsername,
  setPassword,
  login,
  loginStep,
  setLoginStep,
  totpCode,
  setTotpCode,
  verify2FA,
  isBackupMode,
  setIsBackupMode,
  busy,
  message
}: {
  session: SessionState;
  username: string;
  password: string;
  setUsername: (value: string) => void;
  setPassword: (value: string) => void;
  login: (event: React.FormEvent<HTMLFormElement>) => void;
  loginStep: "credentials" | "totp";
  setLoginStep: (step: "credentials" | "totp") => void;
  totpCode: string;
  setTotpCode: (code: string) => void;
  verify2FA: (event: React.FormEvent<HTMLFormElement>) => void;
  isBackupMode: boolean;
  setIsBackupMode: (mode: boolean) => void;
  busy: boolean;
  message: string;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#070b12] px-5 text-white">
      {loginStep === "credentials" ? (
        <form onSubmit={login} className="w-full max-w-md rounded-[16px] border border-white/10 bg-white/[0.04] p-6 sm:p-8 shadow-glow backdrop-blur-md">
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/70">
            <Shield size={16} className="text-[#16f2a4]" />
            Protected Admin Access
          </div>
          <h1 className="text-3xl font-black tracking-tight">Sign in to Builder</h1>
          <p className="mt-2 text-xs text-white/50">Enter your administrator credentials to proceed.</p>
          {session.configured ? null : (
            <p className="mt-4 rounded-[8px] border border-yellow-400/25 bg-yellow-400/10 p-3 text-sm text-yellow-100">
              {session.message}
            </p>
          )}
          <TextField label="Username" value={username} onChange={setUsername} />
          <TextField label="Password" value={password} onChange={setPassword} type="password" />
          {message ? (
            <div className="mt-4 flex items-center gap-2 rounded-[8px] border border-red-400/25 bg-red-400/10 p-3 text-sm text-red-100">
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <span>{message}</span>
            </div>
          ) : null}
          <button
            type="submit"
            disabled={busy || !session.configured}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#16f2a4] px-5 py-4 font-black text-black transition-all hover:bg-white disabled:opacity-50"
          >
            {busy ? <Loader2 className="animate-spin" size={18} /> : <Shield size={18} />}
            Continue
          </button>
        </form>
      ) : (
        <form onSubmit={verify2FA} className="w-full max-w-md rounded-[16px] border border-white/10 bg-white/[0.04] p-6 sm:p-8 shadow-glow backdrop-blur-md">
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#16f2a4]/25 bg-[#16f2a4]/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#16f2a4]">
            <ShieldCheck size={16} />
            Two-Factor Verification
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {isBackupMode ? "Enter Backup Code" : "Authenticator Code"}
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-white/60 leading-relaxed">
            {isBackupMode
              ? "Enter one of your 8-digit emergency backup recovery codes (e.g. ABCD-1234)."
              : "Open Google Authenticator, Microsoft Authenticator, or Authy on your phone and enter the 6-digit code."}
          </p>

          <div className="mt-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
              {isBackupMode ? "Recovery Code" : "6-Digit Security Code"}
            </label>
            <input
              type="text"
              autoFocus
              inputMode={isBackupMode ? "text" : "numeric"}
              pattern={isBackupMode ? undefined : "[0-9]*"}
              maxLength={isBackupMode ? 14 : 6}
              value={totpCode}
              onChange={(e) => {
                if (isBackupMode) {
                  setTotpCode(e.target.value.toUpperCase());
                } else {
                  setTotpCode(e.target.value.replace(/[^0-9]/g, ""));
                }
              }}
              placeholder={isBackupMode ? "ABCD-1234" : "000 000"}
              className="mt-2 w-full rounded-[10px] border border-white/15 bg-black/50 px-4 py-3.5 text-center font-mono text-2xl tracking-[0.25em] text-white outline-none transition focus:border-[#16f2a4]"
              required
            />
          </div>

          {message ? (
            <div className="mt-4 flex items-center gap-2 rounded-[8px] border border-red-400/25 bg-red-400/10 p-3 text-sm text-red-100">
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <span>{message}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={busy || !totpCode}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#16f2a4] px-5 py-4 font-black text-black transition-all hover:bg-white disabled:opacity-50"
          >
            {busy ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
            Verify &amp; Sign In
          </button>

          <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsBackupMode(!isBackupMode);
                setTotpCode("");
              }}
              className="text-xs text-white/60 transition hover:text-[#16f2a4] hover:underline"
            >
              {isBackupMode ? "Use 6-digit authenticator code instead" : "Lost phone? Use a backup recovery code"}
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginStep("credentials");
                setTotpCode("");
                setIsBackupMode(false);
              }}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white/50 transition hover:text-white"
            >
              <ArrowLeft size={14} /> Back to username &amp; password
            </button>
          </div>
        </form>
      )}
    </main>
  );
}

function DashboardView({ templates, activeTheme, lastPublished, mediaCount, storageMode, onNavigateToSecurity }: { templates: number; activeTheme: string; lastPublished: string; mediaCount: number; storageMode: string; onNavigateToSecurity?: () => void }) {
  const cards = [
    ["Total templates", String(templates)],
    ["Active theme", activeTheme],
    ["Last published", lastPublished ? new Date(lastPublished).toLocaleString() : "Not published yet"],
    ["Media files", String(mediaCount)],
    ["Content source", storageMode]
  ];

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm font-bold uppercase text-white/42">{label}</p>
            <p className="mt-3 text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>
      {onNavigateToSecurity ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[8px] border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[#16f2a4]/15 text-[#16f2a4]">
              <KeyRound size={22} />
            </div>
            <div>
              <p className="font-black text-white">Admin Credentials &amp; Security</p>
              <p className="text-xs text-white/50">Update your admin login username or password directly from this dashboard.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateToSecurity}
            className="inline-flex items-center gap-2 rounded-full border border-[#16f2a4] bg-[#16f2a4]/10 px-5 py-2.5 text-sm font-bold text-[#16f2a4] transition hover:bg-[#16f2a4] hover:text-black"
          >
            <KeyRound size={16} />
            Manage Login Credentials
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[8px] border border-white/10 bg-white/[0.035] p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-[#16f2a4]/15 text-[#16f2a4]">
            <Users size={22} />
          </div>
          <div>
            <p className="font-black text-white">Live Visitor Analytics</p>
            <p className="text-xs text-white/50">Track live visits, geographical regions, browsers, and traffic in Neon PostgreSQL.</p>
          </div>
        </div>
        <Link
          href="/admin/visitors"
          className="inline-flex items-center gap-2 rounded-full bg-[#16f2a4] px-5 py-2.5 text-sm font-black text-black transition hover:bg-white"
        >
          <Users size={16} />
          Open Visitors Dashboard
        </Link>
      </div>
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
      const fileToUpload = await prepareFileForUpload(file);
      const formData = new FormData();
      formData.append("file", fileToUpload);
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
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [previewMedia, setPreviewMedia] = useState<MediaFile | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [storageInfo, setStorageInfo] = useState<{ connected: boolean; provider: string; storeUrl: string; blobCount: number; totalFiles: number } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ file: MediaFile; inUseMessage?: string; force?: boolean } | null>(null);

  useEffect(() => {
    async function loadStorageStatus() {
      try {
        const res = await fetch("/api/admin/media", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.storage) {
            setStorageInfo(data.storage);
          }
        }
      } catch {
        // Fallback
      }
    }
    loadStorageStatus();
  }, [content.builder.media]);

  async function upload(file?: File, replaceFile?: MediaFile) {
    if (!file) return;
    if (replaceFile) {
      setReplacingId(replaceFile.id);
    } else {
      setUploading(true);
    }
    setError("");
    setSuccessMessage("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), uploadTimeoutMs);

    try {
      const fileToUpload = await prepareFileForUpload(file);
      const formData = new FormData();
      formData.append("file", fileToUpload);
      if (replaceFile) {
        formData.append("replacesId", replaceFile.id);
        formData.append("replacesUrl", replaceFile.url);
      }

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: secureHeaders(),
        body: formData,
        signal: controller.signal
      });
      const result = (await response.json().catch(() => ({
        message: "Upload failed. The server returned an invalid response."
      }))) as { media?: MediaFile; url?: string; message?: string; storage?: string };

      if (!response.ok || !result.media) {
        setError(result.message || "Upload failed.");
        return;
      }

      if (replaceFile) {
        setContent({
          ...content,
          builder: {
            ...content.builder,
            media: content.builder.media.map((m) => (m.id === replaceFile.id ? result.media! : m))
          }
        });
        setSuccessMessage(`Successfully replaced ${replaceFile.filename} with ${result.media.filename}.`);
      } else {
        setContent({
          ...content,
          builder: {
            ...content.builder,
            media: [result.media, ...content.builder.media]
          }
        });
        setSuccessMessage(result.message || "File uploaded successfully to cloud storage.");
      }
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (uploadError) {
      setError(uploadFailureMessage(uploadError));
    } finally {
      window.clearTimeout(timeout);
      setUploading(false);
      setReplacingId(null);
    }
  }

  async function handleDeleteConfirm(force = false) {
    if (!confirmDelete) return;
    const file = confirmDelete.file;
    setError("");

    try {
      const url = `/api/admin/media?id=${encodeURIComponent(file.id)}${force ? "&force=true" : ""}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: secureHeaders()
      });
      const result = await response.json();

      if (response.status === 409 && result.inUse) {
        // Show confirmation dialog with references
        setConfirmDelete({ file, inUseMessage: result.message, force: true });
        return;
      }

      if (!response.ok) {
        setError(result.message || "Failed to delete media.");
        setConfirmDelete(null);
        return;
      }

      const media = (result.media || content.builder.media.filter((m) => m.id !== file.id)) as MediaFile[];
      setContent({ ...content, builder: { ...content.builder, media } });
      setConfirmDelete(null);
      setSuccessMessage("Image deleted from cloud storage and library.");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch {
      setError("Error deleting media. Check network connection.");
      setConfirmDelete(null);
    }
  }

  async function handleMigrateAll() {
    if (!window.confirm("Migrate all local portfolio project and site images to Vercel Cloud Blob Storage? This will upload local images permanently and update all portfolio links.")) {
      return;
    }
    setMigrating(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/admin/media/migrate", {
        method: "POST",
        headers: secureHeaders({ "Content-Type": "application/json" })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Migration failed.");
      }

      // Reload fresh content
      const contentRes = await fetch("/api/admin/content", { cache: "no-store" });
      if (contentRes.ok) {
        setContent((await contentRes.json()) as SiteContent);
      }
      setSuccessMessage(data.message || "Migration complete! All images stored in Vercel Cloud Blob.");
      setTimeout(() => setSuccessMessage(""), 6000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Migration failed.");
    } finally {
      setMigrating(false);
    }
  }

  function handleCopy(url: string, id: string) {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const isBlob = (url?: string) => Boolean(url && (url.includes(".blob.vercel-storage.com") || url.includes("vercel-storage.com") || url.startsWith("/api/blob")));

  return (
    <div className="grid gap-6">
      {/* Cloud Storage Header & Configuration Banner */}
      <div className="rounded-[16px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className={`grid h-12 w-12 place-items-center rounded-xl ${storageInfo?.connected ? "bg-[#16f2a4]/15 text-[#16f2a4]" : "bg-amber-400/15 text-amber-400"}`}>
              <Cloud size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">Vercel Cloud Blob Storage (Private Access)</h3>
                {storageInfo?.connected ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#16f2a4]/30 bg-[#16f2a4]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#16f2a4]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#16f2a4] animate-pulse" />
                    Private Cloud Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    Local Fallback Active
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-white/50">
                {storageInfo?.connected
                  ? `Permanent private cloud storage enabled. Uploaded files are encrypted & restricted to authenticated administrators and short-lived signed sessions.`
                  : `Connect a Blob store in your Vercel project to automatically enable BLOB_READ_WRITE_TOKEN for permanent cloud storage.`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://vercel.com/nuraxtech/usmaniqbal-portfolio/stores"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-2 text-xs font-bold text-white/70 transition hover:border-[#16f2a4] hover:text-[#16f2a4]"
            >
              <ExternalLink size={13} />
              Vercel Stores Tab
            </a>

            {storageInfo?.connected && (
              <button
                type="button"
                onClick={handleMigrateAll}
                disabled={migrating}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#16f2a4]/30 bg-[#16f2a4]/10 px-3.5 py-2 text-xs font-bold text-[#16f2a4] transition hover:bg-[#16f2a4]/20 disabled:opacity-50"
              >
                {migrating ? <Loader2 className="animate-spin" size={13} /> : <RefreshCw size={13} />}
                Migrate Local Images to Cloud
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#16f2a4] px-5 py-3 font-black text-black shadow-lg shadow-[#16f2a4]/10 transition hover:bg-white">
          {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
          {uploading ? "Optimizing & Uploading..." : "Upload New Media"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,video/mp4,video/webm,.pdf"
            className="hidden"
            onChange={(event) => upload(event.target.files?.[0])}
          />
        </label>

        <span className="text-xs text-white/40">
          Showing {content.builder.media.length} media files ({content.builder.media.filter((m) => isBlob(m.url)).length} in Vercel Blob)
        </span>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 rounded-[10px] border border-red-400/30 bg-red-400/10 p-4 text-sm font-semibold text-red-100">
          <AlertCircle size={18} className="shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 rounded-[10px] border border-[#16f2a4]/30 bg-[#16f2a4]/10 p-4 text-sm font-semibold text-[#bfffe8]">
          <CheckCircle2 size={18} className="shrink-0 text-[#16f2a4]" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Media Gallery Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {content.builder.media.map((file) => {
          const isCloud = isBlob(file.url);
          const isImg = file.type === "image" || file.type === "icon";

          return (
            <div key={file.id} className="group flex flex-col justify-between rounded-[14px] border border-white/10 bg-white/[0.035] p-3.5 transition hover:border-white/20">
              <div>
                {/* Media Preview Box */}
                <div
                  className="relative aspect-video w-full overflow-hidden rounded-[10px] bg-black/60 cursor-pointer"
                  onClick={() => setPreviewMedia(file)}
                >
                  {isImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={file.url}
                      alt={file.filename}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : file.type === "video" ? (
                    <video src={file.url} className="h-full w-full object-cover" muted />
                  ) : (
                    <div className="grid h-full place-items-center text-xs font-bold uppercase text-white/50">
                      <FileText size={32} className="text-white/30 mb-1" />
                      {file.type}
                    </div>
                  )}

                  {/* Cloud Badge */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/75 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                    <Cloud size={10} className={isCloud ? "text-[#16f2a4]" : "text-white/40"} />
                    <span>{isCloud ? "Vercel Private Blob" : "Local File"}</span>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100 text-xs font-bold text-white">
                    <Eye size={15} /> Click to Preview
                  </div>
                </div>

                {/* Details */}
                <div className="mt-3">
                  <p className="truncate text-sm font-bold text-white" title={file.filename}>
                    {file.filename}
                  </p>
                  <p className="mt-0.5 text-xs text-white/45">
                    {Math.round(file.size / 1024)} KB &bull; {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center justify-between gap-1 border-t border-white/10 pt-3">
                <button
                  type="button"
                  onClick={() => handleCopy(file.url, file.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-white/70 transition hover:bg-white/5 hover:text-white"
                >
                  {copiedId === file.id ? <Check size={13} className="text-[#16f2a4]" /> : <Copy size={13} />}
                  {copiedId === file.id ? "Copied" : "Copy"}
                </button>

                <div className="flex items-center gap-1">
                  {/* Replace Button */}
                  <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-white/70 transition hover:bg-white/5 hover:text-[#16f2a4]">
                    {replacingId === file.id ? <Loader2 className="animate-spin" size={13} /> : <RefreshCw size={13} />}
                    <span>Replace</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,video/mp4,video/webm,.pdf"
                      className="hidden"
                      onChange={(e) => upload(e.target.files?.[0], file)}
                    />
                  </label>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => setConfirmDelete({ file })}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-400/20 px-2.5 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-400/10 hover:border-red-400/40"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* LIGHTBOX PREVIEW MODAL */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setPreviewMedia(null)}>
          <div className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl border border-white/15 bg-[#0b0f19] p-5 shadow-2xl text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h4 className="font-bold text-base truncate max-w-lg">{previewMedia.filename}</h4>
                <p className="text-xs text-white/50">{Math.round(previewMedia.size / 1024)} KB &bull; Uploaded {new Date(previewMedia.uploadedAt).toLocaleString()}</p>
              </div>
              <button type="button" onClick={() => setPreviewMedia(null)} className="rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="my-4 flex max-h-[60vh] items-center justify-center overflow-auto rounded-lg bg-black/50 p-2">
              {previewMedia.type === "image" || previewMedia.type === "icon" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewMedia.url} alt={previewMedia.filename} className="max-h-[58vh] max-w-full object-contain rounded" />
              ) : previewMedia.type === "video" ? (
                <video src={previewMedia.url} controls className="max-h-[58vh] max-w-full rounded" />
              ) : (
                <div className="p-8 text-center text-white/60">
                  <FileText size={48} className="mx-auto mb-2 text-white/30" />
                  <p>Document preview ({previewMedia.type})</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs">
              <span className="font-mono text-white/60 truncate max-w-md">{previewMedia.url}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(previewMedia.url, previewMedia.id)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#16f2a4] px-4 py-2 font-bold text-black hover:bg-white"
                >
                  {copiedId === previewMedia.id ? <Check size={14} /> : <Copy size={14} />}
                  {copiedId === previewMedia.id ? "Copied" : "Copy URL"}
                </button>
                <a
                  href={previewMedia.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 font-bold text-white/80 hover:bg-white/10"
                >
                  <ExternalLink size={14} /> Open Original
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0b0f19] p-6 text-white shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle size={24} />
              <h4 className="text-lg font-black">
                {confirmDelete.force ? "Image In Use — Confirm Deletion" : "Delete Media File?"}
              </h4>
            </div>

            <p className="mt-3 text-xs sm:text-sm text-white/70 leading-relaxed">
              {confirmDelete.inUseMessage || `Are you sure you want to permanently delete "${confirmDelete.file.filename}" from cloud storage?`}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white/70 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteConfirm(Boolean(confirmDelete.force))}
                className="rounded-full bg-red-500 px-5 py-2 text-xs font-black text-white hover:bg-red-400"
              >
                {confirmDelete.force ? "Yes, Force Delete" : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
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

function EmailSettingsView({ secureHeaders }: { secureHeaders: (extra?: HeadersInit) => HeadersInit }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [serviceId, setServiceId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [testMessage, setTestMessage] = useState("Hello from Usman Iqbal Portfolio! This is a test email sent from the Admin Panel.");
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    status?: number;
    message?: string;
    error?: string;
    details?: Record<string, unknown>;
  } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/admin/email-settings", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          setServiceId(data.serviceId || "");
          setTemplateId(data.templateId || "");
          setPublicKey(data.publicKey || "");
          setSenderEmail(data.senderEmail || "");
          setRecipientEmail(data.recipientEmail || "");
        }
      } catch {
        setSaveStatus({ type: "error", text: "Failed to load current email configuration." });
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaveStatus(null);

    try {
      const response = await fetch("/api/admin/email-settings", {
        method: "PUT",
        headers: secureHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          serviceId,
          templateId,
          publicKey,
          senderEmail,
          recipientEmail
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save configuration.");
      }

      setSaveStatus({
        type: "success",
        text: "EmailJS configuration saved successfully! The live contact form is now using these settings."
      });
    } catch (err) {
      setSaveStatus({
        type: "error",
        text: err instanceof Error ? err.message : "Error saving configuration."
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleTestEmail() {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/admin/email-settings/test", {
        method: "POST",
        headers: secureHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          serviceId,
          templateId,
          publicKey,
          senderEmail,
          recipientEmail,
          testMessage
        })
      });

      const data = await response.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({
        ok: false,
        error: err instanceof Error ? err.message : "Network error while triggering test email."
      });
    } finally {
      setTesting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-[#16f2a4]" size={32} />
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
      {/* Configuration Form Card */}
      <div className="rounded-[8px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2">
              <Mail className="text-[#16f2a4]" size={22} />
              EmailJS Service Configuration
            </h2>
            <p className="mt-1 text-sm text-white/50">
              Manage your EmailJS credentials. The live contact form will automatically use these settings.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <TextField
                label="EmailJS Service ID"
                value={serviceId}
                onChange={setServiceId}
              />
              <p className="mt-1 text-xs text-white/40">e.g. service_3yzs25n</p>
            </div>
            <div>
              <TextField
                label="EmailJS Template ID"
                value={templateId}
                onChange={setTemplateId}
              />
              <p className="mt-1 text-xs text-white/40">e.g. template_p2ef7xj</p>
            </div>
          </div>

          <div>
            <TextField
              label="EmailJS Public Key"
              value={publicKey}
              onChange={setPublicKey}
            />
            <p className="mt-1 text-xs text-white/40">e.g. VGz_prbYHcK7LyvAl (Public API Key)</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <TextField
                label="Sender / From Email (Optional)"
                value={senderEmail}
                onChange={setSenderEmail}
                type="email"
              />
              <p className="mt-1 text-xs text-white/40">Default sender address or reply-to placeholder</p>
            </div>
            <div>
              <TextField
                label="Recipient Email"
                value={recipientEmail}
                onChange={setRecipientEmail}
                type="email"
              />
              <p className="mt-1 text-xs text-white/40">Where messages will be forwarded</p>
            </div>
          </div>

          {saveStatus ? (
            <div
              className={`mt-2 flex items-center gap-2 rounded-[8px] p-3 text-sm font-semibold ${
                saveStatus.type === "success"
                  ? "border border-[#16f2a4]/30 bg-[#16f2a4]/10 text-[#bfffe8]"
                  : "border border-red-400/30 bg-red-400/10 text-red-200"
              }`}
            >
              {saveStatus.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {saveStatus.text}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-[#16f2a4] px-6 py-3 font-black text-black transition hover:bg-white disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Configuration
            </button>
          </div>
        </form>
      </div>

      {/* Test Email & Diagnostics Card */}
      <div className="grid gap-6">
        <div className="rounded-[8px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
          <div className="mb-4 border-b border-white/10 pb-3">
            <h3 className="text-lg font-black flex items-center gap-2">
              <Send className="text-[#16f2a4]" size={20} />
              Test Email Delivery
            </h3>
            <p className="mt-1 text-xs text-white/50">
              Dispatch a verified test email using the currently entered or saved credentials.
            </p>
          </div>

          <div className="grid gap-3">
            <TextArea
              label="Test Message Content"
              value={testMessage}
              onChange={setTestMessage}
            />

            <button
              type="button"
              onClick={handleTestEmail}
              disabled={testing || !serviceId || !templateId || !publicKey}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#16f2a4] bg-[#16f2a4]/10 px-5 py-3 font-bold text-[#16f2a4] transition hover:bg-[#16f2a4] hover:text-black disabled:opacity-40"
            >
              {testing ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
              {testing ? "Sending Test..." : "Send Test Email"}
            </button>
          </div>

          {testResult ? (
            <div className="mt-4">
              {testResult.ok ? (
                <div className="rounded-[8px] border border-[#16f2a4]/30 bg-[#16f2a4]/10 p-4 text-sm text-[#bfffe8]">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 size={18} className="text-[#16f2a4]" />
                    {testResult.message || "Test email sent successfully!"}
                  </div>
                  {testResult.details ? (
                    <div className="mt-3 rounded-[6px] bg-black/40 p-2 text-xs font-mono text-white/70">
                      <div>Status: 200 OK</div>
                      <div>Recipient: {String(testResult.details.recipientEmail || recipientEmail)}</div>
                      <div>Service: {String(testResult.details.serviceId || serviceId)}</div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-[8px] border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle size={18} className="text-red-400" />
                    Delivery Error {testResult.status ? `(HTTP ${testResult.status})` : ""}
                  </div>
                  <p className="mt-2 text-xs text-white/90 font-mono bg-black/40 p-2 rounded">
                    {testResult.error || "Unknown error"}
                  </p>
                  {testResult.status === 412 ? (
                    <div className="mt-3 rounded-[6px] border border-yellow-400/30 bg-yellow-400/10 p-3 text-xs text-yellow-200">
                      <strong>Troubleshooting Tip:</strong> Your EmailJS service connected to Gmail has an expired or revoked grant (&quot;Invalid grant&quot;). Go to your EmailJS Dashboard &gt; Email Services &gt; Reconnect Account.
                    </div>
                  ) : testResult.status === 403 ? (
                    <div className="mt-3 rounded-[6px] border border-yellow-400/30 bg-yellow-400/10 p-3 text-xs text-yellow-200">
                      <strong>Troubleshooting Tip:</strong> Check your EmailJS security settings at dashboard.emailjs.com/admin/account/security or verify the Public Key.
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Integration Instructions */}
        <div className="rounded-[8px] border border-white/10 bg-white/[0.02] p-5 text-xs text-white/60">
          <p className="font-bold uppercase tracking-wider text-[#16f2a4] mb-2">EmailJS Template Mapping Guide</p>
          <p className="mb-2">Your EmailJS template should include these variables:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><code className="text-white font-mono">&#123;&#123;name&#125;&#125;</code> or <code className="text-white font-mono">&#123;&#123;from_name&#125;&#125;</code> - Sender name</li>
            <li><code className="text-white font-mono">&#123;&#123;email&#125;&#125;</code> or <code className="text-white font-mono">&#123;&#123;from_email&#125;&#125;</code> - Sender email</li>
            <li><code className="text-white font-mono">&#123;&#123;project_type&#125;&#125;</code> or <code className="text-white font-mono">&#123;&#123;subject&#125;&#125;</code> - Project type</li>
            <li><code className="text-white font-mono">&#123;&#123;message&#125;&#125;</code> - Message content</li>
            <li><code className="text-white font-mono">&#123;&#123;time&#125;&#125;</code> - Submission timestamp</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function AdminSecurityView({
  secureHeaders,
  onUsernameUpdated
}: {
  secureHeaders: (extra?: HeadersInit) => HeadersInit;
  onUsernameUpdated?: (name: string) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 2FA Management State
  const [twoFactorLoading, setTwoFactorLoading] = useState(true);
  const [twoFactorStatus, setTwoFactorStatus] = useState<{
    enabled: boolean;
    backupCodesRemaining: number;
    updatedAt?: string | null;
  } | null>(null);

  // Setup Modal State
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupData, setSetupData] = useState<{
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
  } | null>(null);
  const [confirmCode, setConfirmCode] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Disable Modal State
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [disabling, setDisabling] = useState(false);
  const [disableError, setDisableError] = useState("");

  // Regenerate Backup Codes Modal State
  const [regenModalOpen, setRegenModalOpen] = useState(false);
  const [regenPassword, setRegenPassword] = useState("");
  const [regenCode, setRegenCode] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [regenError, setRegenError] = useState("");
  const [freshCodes, setFreshCodes] = useState<string[] | null>(null);

  useEffect(() => {
    async function fetchSecurityData() {
      try {
        const [credsRes, twoFactorRes] = await Promise.all([
          fetch("/api/admin/credentials", { cache: "no-store" }),
          fetch("/api/admin/2fa", { cache: "no-store" })
        ]);

        if (credsRes.ok) {
          const creds = (await credsRes.json()) as { username?: string };
          if (creds.username) setUsername(creds.username);
        }

        if (twoFactorRes.ok) {
          const tfa = (await twoFactorRes.json()) as {
            enabled: boolean;
            backupCodesRemaining: number;
            updatedAt?: string | null;
          };
          setTwoFactorStatus(tfa);
        }
      } catch {
        // Fallback default
      } finally {
        setLoading(false);
        setTwoFactorLoading(false);
      }
    }

    fetchSecurityData();
  }, []);

  async function handleUpdateCredentials(event: React.FormEvent) {
    event.preventDefault();
    setStatus(null);

    if (!currentPassword) {
      setStatus({ type: "error", text: "Please enter your current password to confirm changes." });
      return;
    }

    if (newPassword && newPassword.length < 8) {
      setStatus({ type: "error", text: "New password must be at least 8 characters long." });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setStatus({ type: "error", text: "New passwords do not match." });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/admin/credentials", {
        method: "PUT",
        headers: secureHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          currentPassword,
          newUsername: username,
          newPassword: newPassword || undefined
        })
      });

      const data = (await response.json()) as { message?: string; ok?: boolean; username?: string };

      if (!response.ok) {
        throw new Error(data.message || "Failed to update credentials.");
      }

      setStatus({
        type: "success",
        text: data.message || "Credentials updated successfully!"
      });

      if (data.username && onUsernameUpdated) {
        onUsernameUpdated(data.username);
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setStatus({
        type: "error",
        text: err instanceof Error ? err.message : "Error updating credentials."
      });
    } finally {
      setSaving(false);
    }
  }

  // Initiates 2FA setup flow
  async function handleStartSetup() {
    setSetupLoading(true);
    setConfirmStatus(null);
    setConfirmCode("");

    try {
      const res = await fetch("/api/admin/2fa", {
        method: "POST",
        headers: secureHeaders({ "Content-Type": "application/json" })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to initiate 2FA setup.");
      }

      setSetupData(data);
      setSetupModalOpen(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to initiate 2FA setup.");
    } finally {
      setSetupLoading(false);
    }
  }

  // Confirms 2FA setup with initial 6-digit code
  async function handleConfirmSetup(e: React.FormEvent) {
    e.preventDefault();
    setConfirming(true);
    setConfirmStatus(null);

    try {
      const res = await fetch("/api/admin/2fa", {
        method: "PUT",
        headers: secureHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ code: confirmCode })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Verification code failed.");
      }

      setConfirmStatus({
        type: "success",
        text: "Two-Factor Authentication is now enabled!"
      });

      setTwoFactorStatus({
        enabled: true,
        backupCodesRemaining: setupData?.backupCodes.length || 10,
        updatedAt: new Date().toISOString()
      });

      setTimeout(() => {
        setSetupModalOpen(false);
        setConfirmCode("");
        setSetupData(null);
      }, 1500);
    } catch (err) {
      setConfirmStatus({
        type: "error",
        text: err instanceof Error ? err.message : "Invalid verification code."
      });
    } finally {
      setConfirming(false);
    }
  }

  // Disables 2FA with password & code confirmation
  async function handleDisable2FA(e: React.FormEvent) {
    e.preventDefault();
    setDisabling(true);
    setDisableError("");

    try {
      const res = await fetch("/api/admin/2fa", {
        method: "DELETE",
        headers: secureHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          currentPassword: disablePassword,
          code: disableCode
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to disable 2FA.");
      }

      setTwoFactorStatus({
        enabled: false,
        backupCodesRemaining: 0,
        updatedAt: new Date().toISOString()
      });

      setDisableModalOpen(false);
      setDisablePassword("");
      setDisableCode("");
    } catch (err) {
      setDisableError(err instanceof Error ? err.message : "Failed to disable 2FA.");
    } finally {
      setDisabling(false);
    }
  }

  // Regenerates new backup codes
  async function handleRegenerateCodes(e: React.FormEvent) {
    e.preventDefault();
    setRegenerating(true);
    setRegenError("");

    try {
      const res = await fetch("/api/admin/2fa/backup-codes", {
        method: "POST",
        headers: secureHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          currentPassword: regenPassword,
          code: regenCode
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to regenerate backup codes.");
      }

      setFreshCodes(data.backupCodes);
      setTwoFactorStatus((prev) =>
        prev ? { ...prev, backupCodesRemaining: data.backupCodes.length } : null
      );
      setRegenPassword("");
      setRegenCode("");
    } catch (err) {
      setRegenError(err instanceof Error ? err.message : "Failed to regenerate backup codes.");
    } finally {
      setRegenerating(false);
    }
  }

  function downloadCodes(codes: string[]) {
    const text = `NURAXTECH / USMAN IQBAL PORTFOLIO\nTwo-Factor Authentication Emergency Backup Recovery Codes\nGenerated: ${new Date().toLocaleString()}\n\nEach backup code can be used ONCE to sign in if you lose access to your authenticator app:\n\n${codes
      .map((c, i) => `${i + 1}. ${c}`)
      .join("\n")}\n\nKeep these codes strictly confidential and stored securely.`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portfolio-2fa-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading || twoFactorLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-[#16f2a4]" size={32} />
      </div>
    );
  }

  return (
    <div className="grid max-w-4xl gap-6">
      {/* 1. ADMIN CREDENTIALS FORM */}
      <div className="rounded-[12px] border border-white/10 bg-white/[0.035] p-5 sm:p-7">
        <div className="mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="text-[#16f2a4]" size={22} />
            <h2 className="text-xl sm:text-2xl font-black text-white">Admin Credentials</h2>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-white/50">
            Change your admin dashboard username and password. Changes persist in the database and local backup.
          </p>
        </div>

        <form onSubmit={handleUpdateCredentials} className="grid gap-5">
          <div>
            <label className="block text-sm font-bold text-white/80">Admin Username</label>
            <p className="mt-0.5 text-xs text-white/40">The username you use to log in to /admin1122</p>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 w-full rounded-[8px] border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#16f2a4]"
              required
            />
          </div>

          <div className="rounded-[8px] border border-white/10 bg-black/20 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#16f2a4] mb-3">Password Change</p>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-bold text-white/80">New Password (Optional)</label>
                <p className="mt-0.5 text-xs text-white/40">Leave blank if you only want to change your username (min 8 characters)</p>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (at least 8 chars)"
                  className="mt-2 w-full rounded-[8px] border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#16f2a4]"
                />
              </div>

              {newPassword ? (
                <div>
                  <label className="block text-sm font-bold text-white/80">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="mt-2 w-full rounded-[8px] border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#16f2a4]"
                    required={Boolean(newPassword)}
                  />
                </div>
              ) : null}
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <label className="block text-sm font-bold text-white/80">Current Password (Required to Save)</label>
            <p className="mt-0.5 text-xs text-white/40">Confirm your current password to authorize credential changes</p>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              className="mt-2 w-full rounded-[8px] border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#16f2a4]"
              required
            />
          </div>

          {status ? (
            <div
              className={`flex items-center gap-2 rounded-[8px] p-3.5 text-sm font-semibold ${
                status.type === "success"
                  ? "border border-[#16f2a4]/30 bg-[#16f2a4]/10 text-[#bfffe8]"
                  : "border border-red-400/30 bg-red-400/10 text-red-200"
              }`}
            >
              {status.type === "success" ? <CheckCircle2 size={18} className="text-[#16f2a4]" /> : <AlertCircle size={18} />}
              {status.text}
            </div>
          ) : null}

          <div className="mt-2 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-[#16f2a4] px-6 py-3 font-black text-black transition hover:bg-white disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Update Credentials
            </button>
          </div>
        </form>
      </div>

      {/* 2. TWO-FACTOR AUTHENTICATION (2FA) SECTION */}
      <div className="rounded-[12px] border border-white/10 bg-white/[0.035] p-5 sm:p-7">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="text-[#16f2a4]" size={24} />
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Two-Factor Authentication (2FA)</h2>
              <p className="mt-1 text-xs sm:text-sm text-white/50">
                Secure your admin login using Google Authenticator, Microsoft Authenticator, or Authy.
              </p>
            </div>
          </div>

          {/* Status Badge */}
          {twoFactorStatus?.enabled ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-[#16f2a4]/30 bg-[#16f2a4]/15 px-3.5 py-1 text-xs font-bold text-[#16f2a4]">
              <span className="h-2 w-2 rounded-full bg-[#16f2a4] animate-pulse" />
              Active &amp; Protected
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-xs font-bold text-white/60">
              <span className="h-2 w-2 rounded-full bg-yellow-400" />
              Disabled
            </span>
          )}
        </div>

        {/* When 2FA is Disabled */}
        {!twoFactorStatus?.enabled ? (
          <div className="rounded-[10px] border border-white/10 bg-black/20 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-white">Protect your account with an Authenticator App</p>
                <p className="mt-1 max-w-lg text-xs sm:text-sm text-white/50 leading-relaxed">
                  Every time you sign in, you will be prompted for your username, password, and a 6-digit TOTP code generated on your phone.
                </p>
              </div>
              <button
                type="button"
                onClick={handleStartSetup}
                disabled={setupLoading}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#16f2a4] px-5 py-3 text-sm font-black text-black transition hover:bg-white disabled:opacity-50"
              >
                {setupLoading ? <Loader2 className="animate-spin" size={16} /> : <QrCode size={16} />}
                Set Up Authenticator
              </button>
            </div>
          </div>
        ) : (
          /* When 2FA is Active */
          <div className="grid gap-4">
            <div className="grid gap-3 rounded-[10px] border border-[#16f2a4]/20 bg-[#16f2a4]/5 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-[#bfffe8]">
                  <Smartphone size={18} className="text-[#16f2a4]" />
                  <span>Authenticator App (TOTP RFC 6238): Connected</span>
                </div>
                <span className="text-xs text-white/40">
                  Updated: {twoFactorStatus.updatedAt ? new Date(twoFactorStatus.updatedAt).toLocaleDateString() : "Active"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/60">
                You have <strong className="text-white">{twoFactorStatus.backupCodesRemaining}</strong> unused emergency recovery codes remaining.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRegenModalOpen(true);
                  setFreshCodes(null);
                  setRegenError("");
                }}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-xs sm:text-sm font-bold text-white/80 transition hover:border-[#16f2a4] hover:text-[#16f2a4]"
              >
                <RefreshCw size={15} />
                Regenerate Backup Codes
              </button>

              <button
                type="button"
                onClick={() => {
                  setDisableModalOpen(true);
                  setDisableError("");
                }}
                className="inline-flex items-center gap-2 rounded-full border border-red-500/25 px-4 py-2.5 text-xs sm:text-sm font-bold text-red-300 transition hover:bg-red-500/10 hover:border-red-500/50"
              >
                <ShieldAlert size={15} />
                Disable 2FA
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SETUP 2FA MODAL */}
      {setupModalOpen && setupData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[20px] border border-white/15 bg-[#0b0f19] p-6 sm:p-8 text-white shadow-2xl">
            <h3 className="text-xl sm:text-2xl font-black">Set Up Two-Factor Authentication</h3>
            <p className="mt-1 text-xs sm:text-sm text-white/60">
              Follow these three quick steps to pair your authenticator app.
            </p>

            {/* ACTION REQUIRED NOTICE */}
            <div className="mt-4 flex items-start gap-3 rounded-[12px] border border-amber-400/30 bg-amber-400/10 p-3.5 text-xs text-amber-200">
              <AlertCircle size={18} className="shrink-0 text-amber-400 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Action Required:</strong> Scanning the QR code is only Step 1. You <strong>MUST</strong> scroll to <strong>Step 3</strong> below, type the 6-digit code shown in your authenticator app, and click <strong>Activate Two-Factor Authentication</strong>. 2FA is NOT active until this confirmation step is completed.
              </p>
            </div>

            {/* STEP 1: SCAN QR CODE */}
            <div className="mt-5 rounded-[12px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#16f2a4]">Step 1: Scan QR Code</p>
              <p className="mt-1 text-xs text-white/50">
                Open Google Authenticator, Microsoft Authenticator, or Authy and scan the barcode below:
              </p>

              <div className="mt-4 flex flex-col items-center justify-center">
                <div className="relative h-56 w-56 overflow-hidden rounded-[12px] border-4 border-white bg-white p-2 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={setupData.qrCodeUrl} alt="2FA QR Code" className="h-full w-full object-contain" />
                </div>

                {/* Manual entry key */}
                <div className="mt-4 w-full">
                  <p className="text-center text-xs text-white/40 mb-1.5">Or enter this secret key manually:</p>
                  <div className="flex items-center justify-between rounded-[8px] border border-white/10 bg-black/50 px-3 py-2 font-mono text-xs sm:text-sm text-[#16f2a4]">
                    <span className="truncate tracking-wider">{setupData.secret}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(setupData.secret);
                        setCopiedSecret(true);
                        setTimeout(() => setCopiedSecret(false), 2000);
                      }}
                      className="ml-2 inline-flex items-center gap-1 text-xs text-white/60 hover:text-white"
                    >
                      {copiedSecret ? <Check size={14} className="text-[#16f2a4]" /> : <Copy size={14} />}
                      {copiedSecret ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: SAVE BACKUP RECOVERY CODES */}
            <div className="mt-4 rounded-[12px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#16f2a4]">Step 2: Emergency Recovery Codes</p>
                  <p className="mt-1 text-xs text-white/50">Save these one-time codes in a safe place. Each can be used once if you lose your phone.</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 rounded-[8px] border border-white/10 bg-black/50 p-3 font-mono text-xs text-white/90">
                {setupData.backupCodes.map((code, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-white/30 text-[10px] w-4">{idx + 1}.</span>
                    <span>{code}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(setupData.backupCodes.join("\n"));
                    setCopiedCodes(true);
                    setTimeout(() => setCopiedCodes(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-[6px] border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/5"
                >
                  {copiedCodes ? <Check size={13} className="text-[#16f2a4]" /> : <Copy size={13} />}
                  {copiedCodes ? "Codes Copied" : "Copy All Codes"}
                </button>

                <button
                  type="button"
                  onClick={() => downloadCodes(setupData.backupCodes)}
                  className="inline-flex items-center gap-1.5 rounded-[6px] border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/5"
                >
                  <Download size={13} />
                  Download (.txt)
                </button>
              </div>
            </div>

            {/* STEP 3: CONFIRMATION CODE */}
            <form onSubmit={handleConfirmSetup} className="mt-4 rounded-[12px] border-2 border-[#16f2a4]/40 bg-[#16f2a4]/[0.04] p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-[#16f2a4]">Step 3: Confirm Setup &amp; Activate</p>
                <span className="rounded-full bg-[#16f2a4] px-2.5 py-0.5 text-[10px] font-black uppercase text-black">Required</span>
              </div>
              <p className="mt-1 text-xs text-white/60">Enter the current 6-digit code from your authenticator app to activate 2FA:</p>

              <div className="mt-3">
                <input
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="000 000"
                  className="w-full rounded-[8px] border border-white/20 bg-black/60 px-4 py-3 text-center font-mono text-2xl tracking-[0.25em] text-white outline-none focus:border-[#16f2a4]"
                  required
                />
              </div>

              {confirmStatus ? (
                <div
                  className={`mt-3 flex items-center gap-2 rounded-[8px] p-3 text-xs font-semibold ${
                    confirmStatus.type === "success"
                      ? "border border-[#16f2a4]/30 bg-[#16f2a4]/10 text-[#bfffe8]"
                      : "border border-red-400/30 bg-red-400/10 text-red-200"
                  }`}
                >
                  {confirmStatus.type === "success" ? <CheckCircle2 size={16} className="text-[#16f2a4]" /> : <AlertCircle size={16} />}
                  {confirmStatus.text}
                </div>
              ) : null}

              <div className="mt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={confirming || confirmCode.length !== 6}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#16f2a4] px-5 py-3 text-sm font-black text-black transition hover:bg-white disabled:opacity-50"
                >
                  {confirming ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                  Activate Two-Factor Authentication
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSetupModalOpen(false);
                    setSetupData(null);
                    setConfirmCode("");
                  }}
                  className="rounded-full border border-white/15 px-4 py-3 text-sm font-semibold text-white/60 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGENERATE BACKUP CODES MODAL */}
      {regenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[20px] border border-white/15 bg-[#0b0f19] p-6 sm:p-7 text-white shadow-2xl">
            <h3 className="text-xl font-black">Regenerate Backup Codes</h3>
            <p className="mt-1 text-xs text-white/60 leading-relaxed">
              Generating new backup codes will immediately invalidate all existing backup codes. Confirm your password and current 6-digit code.
            </p>

            {!freshCodes ? (
              <form onSubmit={handleRegenerateCodes} className="mt-5 grid gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/70">Current Password</label>
                  <input
                    type="password"
                    value={regenPassword}
                    onChange={(e) => setRegenPassword(e.target.value)}
                    className="mt-1.5 w-full rounded-[8px] border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#16f2a4]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/70">6-Digit Code from Authenticator</label>
                  <input
                    type="text"
                    maxLength={6}
                    inputMode="numeric"
                    value={regenCode}
                    onChange={(e) => setRegenCode(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="000 000"
                    className="mt-1.5 w-full rounded-[8px] border border-white/10 bg-black/40 px-3.5 py-2.5 text-center font-mono text-lg tracking-widest text-white outline-none focus:border-[#16f2a4]"
                    required
                  />
                </div>

                {regenError ? (
                  <div className="flex items-center gap-2 rounded-[8px] border border-red-400/25 bg-red-400/10 p-2.5 text-xs text-red-200">
                    <AlertCircle size={15} className="shrink-0 text-red-400" />
                    <span>{regenError}</span>
                  </div>
                ) : null}

                <div className="mt-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={regenerating}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#16f2a4] px-4 py-2.5 text-xs font-bold text-black transition hover:bg-white disabled:opacity-50"
                  >
                    {regenerating ? <Loader2 className="animate-spin" size={15} /> : <RefreshCw size={15} />}
                    Generate New Codes
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegenModalOpen(false)}
                    className="rounded-full border border-white/10 px-4 py-2.5 text-xs font-semibold text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-5">
                <p className="text-xs font-bold text-[#16f2a4] mb-2">New Backup Codes Generated:</p>
                <div className="grid grid-cols-2 gap-2 rounded-[8px] border border-white/10 bg-black/50 p-3 font-mono text-xs text-white">
                  {freshCodes.map((code, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="text-white/30 text-[10px]">{idx + 1}.</span>
                      <span>{code}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => downloadCodes(freshCodes)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#16f2a4] px-4 py-2.5 text-xs font-bold text-black hover:bg-white"
                  >
                    <Download size={14} /> Download (.txt)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegenModalOpen(false)}
                    className="rounded-full border border-white/10 px-4 py-2.5 text-xs font-semibold text-white/60 hover:text-white"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DISABLE 2FA CONFIRMATION MODAL */}
      {disableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[20px] border border-white/15 bg-[#0b0f19] p-6 sm:p-7 text-white shadow-2xl">
            <div className="flex items-center gap-2 text-red-400">
              <ShieldAlert size={22} />
              <h3 className="text-xl font-black text-white">Disable Two-Factor Authentication</h3>
            </div>
            <p className="mt-2 text-xs text-white/60 leading-relaxed">
              Disabling 2FA reduces your account security. To proceed, please confirm your current administrator password and enter the current 6-digit code or a backup code.
            </p>

            <form onSubmit={handleDisable2FA} className="mt-5 grid gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70">Current Password</label>
                <input
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  className="mt-1.5 w-full rounded-[8px] border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-red-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70">6-Digit Code or Backup Code</label>
                <input
                  type="text"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value)}
                  placeholder="000000 or ABCD-1234"
                  className="mt-1.5 w-full rounded-[8px] border border-white/10 bg-black/40 px-3.5 py-2.5 text-center font-mono text-base tracking-wider text-white outline-none focus:border-red-400"
                  required
                />
              </div>

              {disableError ? (
                <div className="flex items-center gap-2 rounded-[8px] border border-red-400/25 bg-red-400/10 p-2.5 text-xs text-red-200">
                  <AlertCircle size={15} className="shrink-0 text-red-400" />
                  <span>{disableError}</span>
                </div>
              ) : null}

              <div className="mt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={disabling}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
                >
                  {disabling ? <Loader2 className="animate-spin" size={15} /> : <ShieldAlert size={15} />}
                  Confirm &amp; Disable 2FA
                </button>
                <button
                  type="button"
                  onClick={() => setDisableModalOpen(false)}
                  className="rounded-full border border-white/10 px-4 py-2.5 text-xs font-semibold text-white/60 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
