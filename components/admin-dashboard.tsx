"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  ImagePlus,
  LayoutDashboard,
  Loader2,
  LogOut,
  Palette,
  Plus,
  Save,
  Settings2,
  Shield,
  Trash2,
  Upload,
  UserRound
} from "lucide-react";
import type { ProjectContent, ServiceContent, SiteContent, SkillContent, SocialContent } from "@/types/site-content";

type SessionState = {
  authenticated: boolean;
  configured: boolean;
  csrfToken?: string;
  message?: string;
};

type AdminTab = "home" | "about" | "skills" | "services" | "projects" | "contact" | "style";
const uploadTimeoutMs = 60_000;

const tabs: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "home", label: "Home", icon: LayoutDashboard },
  { id: "about", label: "About", icon: UserRound },
  { id: "skills", label: "Skills", icon: Settings2 },
  { id: "services", label: "Services", icon: BriefcaseBusiness },
  { id: "projects", label: "Projects", icon: ImagePlus },
  { id: "contact", label: "Contact", icon: Bot },
  { id: "style", label: "Style", icon: Palette }
];

export default function AdminDashboard() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("home");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const response = await fetch("/api/admin/session", { cache: "no-store" });
      const state = (await response.json()) as SessionState;
      setSession(state);

      if (state.authenticated) {
        await loadContent();
      }
    }

    checkSession();
  }, []);

  async function loadContent() {
    const response = await fetch("/api/admin/content", { cache: "no-store" });

    if (response.ok) {
      setContent((await response.json()) as SiteContent);
    }
  }

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const result = (await response.json()) as { message?: string };

    if (!response.ok) {
      setMessage(result.message || "Login failed.");
      setBusy(false);
      return;
    }

    setSession({ authenticated: true, configured: true, csrfToken: (result as { csrfToken?: string }).csrfToken });
    await loadContent();
    setBusy(false);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setSession({ authenticated: false, configured: true });
    setContent(null);
  }

  async function saveContent() {
    if (!content) {
      return;
    }

    setSaving(true);
    setMessage("");

    const response = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-csrf": session?.csrfToken || "" },
      body: JSON.stringify(content)
    });

    if (!response.ok) {
      const result = (await response.json()) as { message?: string };
      setMessage(result.message || "Unable to save content.");
      setSaving(false);
      return;
    }

    setContent((await response.json()) as SiteContent);
    setMessage("Website content saved successfully.");
    setSaving(false);
  }

  const previewImage = useMemo(() => content?.home.profileImage || content?.home.heroImage || "/images/usman-profile.png", [content]);

  if (!session) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#020403] px-5 text-white">
        <Loader2 className="animate-spin text-[var(--primary)]" size={36} />
      </main>
    );
  }

  if (!session.authenticated) {
    return (
      <main className="min-h-screen bg-[#020403] px-5 py-10 text-white">
        <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[8px] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm font-bold text-white/70">
              <Shield size={18} className="text-[#16f2a4]" />
              Secure Admin Area
            </div>
            <h1 className="text-4xl font-black leading-tight sm:text-6xl">NURAXTECH Portfolio Admin</h1>
            <p className="mt-5 max-w-xl leading-8 text-white/60">
              Manage portfolio content, project images, social links, colors, animations, and sliders from one private dashboard.
            </p>
            {session.configured ? null : (
              <div className="mt-6 rounded-[8px] border border-yellow-400/30 bg-yellow-400/10 p-4 text-sm leading-6 text-yellow-100">
                {session.message}
              </div>
            )}
          </section>

          <form onSubmit={login} className="rounded-[8px] border border-white/10 bg-black/55 p-6 shadow-glow backdrop-blur-xl sm:p-8">
            <div className="mb-7 flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-[8px] border border-white/10">
                <Image src="/images/usman-profile.png" alt="Usman Iqbal" fill sizes="64px" className="object-cover object-top" />
              </div>
              <div>
                <p className="font-black">Usman Iqbal</p>
                <p className="text-sm text-white/52">Salesforce Admin & Developer</p>
              </div>
            </div>
            <label className="grid gap-2 text-sm font-bold text-white/70">
              Username
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-[#16f2a4]"
                autoComplete="username"
                required
              />
            </label>
            <label className="mt-5 grid gap-2 text-sm font-bold text-white/70">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-[#16f2a4]"
                autoComplete="current-password"
                required
              />
            </label>
            {message ? <p className="mt-4 rounded-[8px] border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-100">{message}</p> : null}
            <button
              type="submit"
              disabled={busy || !session.configured}
              className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#16f2a4] px-6 py-4 font-black text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? <Loader2 className="animate-spin" size={19} /> : <Shield size={19} />}
              Login
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (!content) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#020403] px-5 text-white">
        <Loader2 className="animate-spin text-[#16f2a4]" size={36} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020403] text-white">
      <div className="border-b border-white/10 bg-black/60 px-5 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-[8px] border border-white/10">
              <Image src={previewImage} alt="Portfolio preview" fill sizes="48px" className="object-cover object-top" />
            </div>
            <div>
              <p className="text-xl font-black">Portfolio Admin</p>
              <p className="text-sm text-white/48">Update website content without touching code.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={saveContent}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-[#16f2a4] px-5 py-3 font-black text-black transition hover:bg-white disabled:opacity-60"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 font-bold text-white/70 transition hover:border-red-300/50 hover:text-red-100"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-[8px] border border-white/10 bg-white/[0.04] p-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`mb-2 flex w-full items-center gap-3 rounded-[8px] px-4 py-3 text-left font-bold transition last:mb-0 ${
                  activeTab === tab.id ? "bg-[#16f2a4] text-black" : "text-white/62 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Icon size={19} />
                {tab.label}
              </button>
            );
          })}
        </aside>

        <section className="rounded-[8px] border border-white/10 bg-white/[0.035] p-4 sm:p-6">
          {message ? (
            <div className="mb-5 flex items-center gap-3 rounded-[8px] border border-[#16f2a4]/30 bg-[#16f2a4]/10 p-4 text-sm font-semibold text-[#bfffe8]">
              <CheckCircle2 size={18} />
              {message}
            </div>
          ) : null}
          {activeTab === "home" ? <HomeEditor content={content} setContent={setContent} csrfToken={session.csrfToken || ""} /> : null}
          {activeTab === "about" ? <AboutEditor content={content} setContent={setContent} /> : null}
          {activeTab === "skills" ? <SkillsEditor content={content} setContent={setContent} /> : null}
          {activeTab === "services" ? <ServicesEditor content={content} setContent={setContent} /> : null}
          {activeTab === "projects" ? <ProjectsEditor content={content} setContent={setContent} csrfToken={session.csrfToken || ""} /> : null}
          {activeTab === "contact" ? <ContactEditor content={content} setContent={setContent} /> : null}
          {activeTab === "style" ? <StyleEditor content={content} setContent={setContent} /> : null}
        </section>
      </div>
    </main>
  );
}

function HomeEditor({ content, setContent, csrfToken }: EditorProps) {
  return (
    <Panel title="Home Section" description="Edit hero copy, buttons, and images.">
      <div className="grid gap-5 lg:grid-cols-2">
        <TextField label="Title" value={content.home.title} onChange={(value) => setContent({ ...content, home: { ...content.home, title: value } })} />
        <TextField label="Subtitle" value={content.home.subtitle} onChange={(value) => setContent({ ...content, home: { ...content.home, subtitle: value } })} />
      </div>
      <TextArea label="Description" value={content.home.description} onChange={(value) => setContent({ ...content, home: { ...content.home, description: value } })} />
      <div className="grid gap-5 lg:grid-cols-2">
        <TextField label="Primary Button Label" value={content.home.primaryButton.label} onChange={(value) => setContent({ ...content, home: { ...content.home, primaryButton: { ...content.home.primaryButton, label: value } } })} />
        <TextField label="Primary Button Link" value={content.home.primaryButton.href} onChange={(value) => setContent({ ...content, home: { ...content.home, primaryButton: { ...content.home.primaryButton, href: value } } })} />
        <TextField label="Secondary Button Label" value={content.home.secondaryButton.label} onChange={(value) => setContent({ ...content, home: { ...content.home, secondaryButton: { ...content.home.secondaryButton, label: value } } })} />
        <TextField label="Secondary Button Link" value={content.home.secondaryButton.href} onChange={(value) => setContent({ ...content, home: { ...content.home, secondaryButton: { ...content.home.secondaryButton, href: value } } })} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <ImageUpload label="Hero Image" value={content.home.heroImage} csrfToken={csrfToken} onUploaded={(value) => setContent({ ...content, home: { ...content.home, heroImage: value } })} />
        <ImageUpload label="Profile Image" value={content.home.profileImage} csrfToken={csrfToken} onUploaded={(value) => setContent({ ...content, home: { ...content.home, profileImage: value } })} />
      </div>
    </Panel>
  );
}

function AboutEditor({ content, setContent }: EditorProps) {
  return (
    <Panel title="About Section" description="Update your personal story and highlight points.">
      <TextField label="Eyebrow" value={content.about.eyebrow} onChange={(value) => setContent({ ...content, about: { ...content.about, eyebrow: value } })} />
      <TextArea label="Title" value={content.about.title} onChange={(value) => setContent({ ...content, about: { ...content.about, title: value } })} />
      <TextArea label="Description" value={content.about.description} onChange={(value) => setContent({ ...content, about: { ...content.about, description: value } })} />
      <TextArea
        label="Highlights"
        hint="One highlight per line"
        value={content.about.highlights.join("\n")}
        onChange={(value) => setContent({ ...content, about: { ...content.about, highlights: lines(value) } })}
      />
    </Panel>
  );
}

function SkillsEditor({ content, setContent }: EditorProps) {
  const update = (id: string, next: Partial<SkillContent>) => {
    setContent({ ...content, skills: content.skills.map((skill) => (skill.id === id ? { ...skill, ...next } : skill)) });
  };

  return (
    <Panel title="Skills" description="Add, edit, delete, and reorder by dragging later if needed.">
      <div className="grid gap-4">
        {content.skills.map((skill) => (
          <div key={skill.id} className="rounded-[8px] border border-white/10 bg-black/30 p-4">
            <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr_120px_70px_44px]">
              <TextField label="Skill" value={skill.name} onChange={(value) => update(skill.id, { name: value })} />
              <TextField label="Category" value={skill.category} onChange={(value) => update(skill.id, { category: value })} />
              <TextField label="Level" type="number" value={String(skill.level)} onChange={(value) => update(skill.id, { level: clamp(Number(value), 0, 100) })} />
              <ColorField label="Color" value={skill.accent} onChange={(value) => update(skill.id, { accent: value })} />
              <DeleteButton onClick={() => setContent({ ...content, skills: content.skills.filter((item) => item.id !== skill.id) })} />
            </div>
          </div>
        ))}
      </div>
      <AddButton
        label="Add Skill"
        onClick={() =>
          setContent({
            ...content,
            skills: [...content.skills, { id: createId("skill"), name: "New Skill", category: "Category", level: 80, accent: "#16f2a4" }]
          })
        }
      />
    </Panel>
  );
}

function ServicesEditor({ content, setContent }: EditorProps) {
  const update = (id: string, next: Partial<ServiceContent>) => {
    setContent({ ...content, services: content.services.map((service) => (service.id === id ? { ...service, ...next } : service)) });
  };

  return (
    <Panel title="Services" description="Manage service cards shown on the portfolio.">
      <div className="grid gap-4">
        {content.services.map((service) => (
          <div key={service.id} className="rounded-[8px] border border-white/10 bg-black/30 p-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr_44px]">
              <TextField label="Title" value={service.title} onChange={(value) => update(service.id, { title: value })} />
              <TextArea label="Description" value={service.description} onChange={(value) => update(service.id, { description: value })} compact />
              <DeleteButton onClick={() => setContent({ ...content, services: content.services.filter((item) => item.id !== service.id) })} />
            </div>
          </div>
        ))}
      </div>
      <AddButton
        label="Add Service"
        onClick={() =>
          setContent({
            ...content,
            services: [...content.services, { id: createId("service"), title: "New Service", description: "Describe this service." }]
          })
        }
      />
    </Panel>
  );
}

function ProjectsEditor({ content, setContent, csrfToken }: EditorProps) {
  const update = (id: string, next: Partial<ProjectContent>) => {
    setContent({ ...content, projects: content.projects.map((project) => (project.id === id ? { ...project, ...next } : project)) });
  };

  return (
    <Panel title="Projects" description="Manage project cards, tags, links, and images.">
      <div className="grid gap-4">
        {content.projects.map((project) => (
          <div key={project.id} className="rounded-[8px] border border-white/10 bg-black/30 p-4">
            <div className="grid gap-4 xl:grid-cols-[1fr_1fr_0.9fr_44px]">
              <div className="grid gap-4">
                <TextField label="Title" value={project.title} onChange={(value) => update(project.id, { title: value })} />
                <TextField label="URL" value={project.url} onChange={(value) => update(project.id, { url: value })} />
              </div>
              <TextArea label="Description" value={project.description} onChange={(value) => update(project.id, { description: value })} compact />
              <div className="grid gap-4">
                <TextField label="Tags" hint="Comma separated" value={project.tags.join(", ")} onChange={(value) => update(project.id, { tags: csv(value) })} />
                <ImageUpload label="Project Image" value={project.image} csrfToken={csrfToken} onUploaded={(value) => update(project.id, { image: value })} />
              </div>
              <DeleteButton onClick={() => setContent({ ...content, projects: content.projects.filter((item) => item.id !== project.id) })} />
            </div>
          </div>
        ))}
      </div>
      <AddButton
        label="Add Project"
        onClick={() =>
          setContent({
            ...content,
            projects: [
              ...content.projects,
              { id: createId("project"), title: "New Project", description: "Describe this project.", image: "", tags: ["New"], url: "#" }
            ]
          })
        }
      />
    </Panel>
  );
}

function ContactEditor({ content, setContent }: EditorProps) {
  const updateSocial = (id: string, next: Partial<SocialContent>) => {
    setContent({ ...content, socials: content.socials.map((social) => (social.id === id ? { ...social, ...next } : social)) });
  };

  return (
    <Panel title="Contact & Social Links" description="Update contact details and social media links.">
      <div className="grid gap-5 lg:grid-cols-3">
        <TextField label="Email" value={content.contact.email} onChange={(value) => setContent({ ...content, contact: { ...content.contact, email: value } })} />
        <TextField label="Phone" value={content.contact.phone} onChange={(value) => setContent({ ...content, contact: { ...content.contact, phone: value } })} />
        <TextField label="Location" value={content.contact.location} onChange={(value) => setContent({ ...content, contact: { ...content.contact, location: value } })} />
      </div>
      <TextArea label="Contact Headline" value={content.contact.formHeadline} onChange={(value) => setContent({ ...content, contact: { ...content.contact, formHeadline: value } })} />
      <div className="mt-6 grid gap-4">
        {content.socials.map((social) => (
          <div key={social.id} className="grid gap-4 rounded-[8px] border border-white/10 bg-black/30 p-4 lg:grid-cols-[0.7fr_0.7fr_1.3fr_44px]">
            <TextField label="Platform" value={social.platform} onChange={(value) => updateSocial(social.id, { platform: value })} />
            <TextField label="Label" value={social.label} onChange={(value) => updateSocial(social.id, { label: value })} />
            <TextField label="URL" value={social.url} onChange={(value) => updateSocial(social.id, { url: value })} />
            <DeleteButton onClick={() => setContent({ ...content, socials: content.socials.filter((item) => item.id !== social.id) })} />
          </div>
        ))}
      </div>
      <AddButton
        label="Add Social Link"
        onClick={() =>
          setContent({
            ...content,
            socials: [...content.socials, { id: createId("social"), platform: "New", label: "New", url: "https://" }]
          })
        }
      />
    </Panel>
  );
}

function StyleEditor({ content, setContent }: EditorProps) {
  return (
    <Panel title="Colors, Animations & Sliders" description="Control the look, motion, and rotating slider text.">
      <div className="grid gap-5 lg:grid-cols-3">
        <ColorField label="Primary Color" value={content.theme.primary} onChange={(value) => setContent({ ...content, theme: { ...content.theme, primary: value } })} />
        <ColorField label="Secondary Color" value={content.theme.secondary} onChange={(value) => setContent({ ...content, theme: { ...content.theme, secondary: value } })} />
        <ColorField label="Accent Color" value={content.theme.accent} onChange={(value) => setContent({ ...content, theme: { ...content.theme, accent: value } })} />
      </div>
      <label className="mt-6 flex items-center gap-3 rounded-[8px] border border-white/10 bg-black/30 p-4 font-bold text-white/74">
        <input
          type="checkbox"
          checked={content.theme.animations}
          onChange={(event) => setContent({ ...content, theme: { ...content.theme, animations: event.target.checked } })}
          className="h-5 w-5 accent-[#16f2a4]"
        />
        Enable smooth animations
      </label>
      <TextArea
        label="Hero Slider Text"
        hint="One slide per line"
        value={content.sliders.heroSlides.join("\n")}
        onChange={(value) => setContent({ ...content, sliders: { ...content.sliders, heroSlides: lines(value) } })}
      />
      <TextArea
        label="Project Slider Tags"
        hint="One slider item per line"
        value={content.sliders.projectSlides.join("\n")}
        onChange={(value) => setContent({ ...content, sliders: { ...content.sliders, projectSlides: lines(value) } })}
      />
    </Panel>
  );
}

type EditorProps = {
  content: SiteContent;
  setContent: (content: SiteContent) => void;
  csrfToken?: string;
};

function Panel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-black">{title}</h2>
        <p className="mt-2 text-white/52">{description}</p>
      </div>
      <div className="grid gap-5">{children}</div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  hint,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-white/70">
      <span className="flex flex-wrap items-center gap-2">
        {label}
        {hint ? <span className="text-xs font-medium text-white/38">{hint}</span> : null}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[8px] border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-[#16f2a4]"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  hint,
  compact = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  compact?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-white/70">
      <span className="flex flex-wrap items-center gap-2">
        {label}
        {hint ? <span className="text-xs font-medium text-white/38">{hint}</span> : null}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full resize-y rounded-[8px] border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-[#16f2a4] ${
          compact ? "min-h-24" : "min-h-36"
        }`}
      />
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
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

function ImageUpload({ label, value, onUploaded, csrfToken = "" }: { label: string; value: string; onUploaded: (value: string) => void; csrfToken?: string }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file?: File) {
    if (!file) {
      return;
    }

    setUploading(true);
    setError("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), uploadTimeoutMs);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "x-admin-csrf": csrfToken },
        body: formData,
        signal: controller.signal
      });

      const result = (await response.json().catch(() => ({ message: "Upload failed. The server returned an invalid response." }))) as { url?: string; message?: string };

      if (!response.ok || !result.url) {
        setError(result.message || "Upload failed.");
        return;
      }

      onUploaded(result.url);
    } catch (error) {
      setError(error instanceof Error && error.name === "AbortError" ? "Upload timed out. Try a smaller file." : "Upload failed. Please try again.");
    } finally {
      window.clearTimeout(timeout);
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-3 rounded-[8px] border border-white/10 bg-black/30 p-4">
      <p className="text-sm font-bold text-white/70">{label}</p>
      {value ? (
        <div className="relative aspect-[16/10] overflow-hidden rounded-[8px] border border-white/10 bg-black">
          <Image src={value} alt={label} fill sizes="(max-width: 1024px) 80vw, 360px" className="object-cover object-top" />
        </div>
      ) : (
        <div className="grid aspect-[16/10] place-items-center rounded-[8px] border border-dashed border-white/15 bg-white/[0.03] text-white/35">
          No image selected
        </div>
      )}
      <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-3 font-bold text-white/70 transition hover:border-[#16f2a4] hover:text-[#16f2a4]">
        {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
        Upload Image
        <input type="file" accept="image/*" className="hidden" onChange={(event) => upload(event.target.files?.[0])} />
      </label>
      <TextField label="Image URL" value={value} onChange={onUploaded} />
      {error ? <p className="text-sm text-red-200">{error}</p> : null}
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-fit items-center gap-2 rounded-full border border-[#16f2a4]/40 px-5 py-3 font-black text-[#16f2a4] transition hover:bg-[#16f2a4] hover:text-black"
    >
      <Plus size={18} />
      {label}
    </button>
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Delete item"
      onClick={onClick}
      className="mt-7 grid h-11 w-11 place-items-center rounded-full border border-white/10 text-white/48 transition hover:border-red-300/50 hover:bg-red-400/10 hover:text-red-100 lg:mt-auto"
    >
      <Trash2 size={18} />
    </button>
  );
}

function lines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function csv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
