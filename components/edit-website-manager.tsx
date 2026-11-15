"use client";

import React, { useEffect, useRef, useState } from "react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Award,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleUserRound,
  Cloud,
  ContactRound,
  Download,
  ExternalLink,
  Eye,
  FileText,
  GripVertical,
  ImagePlus,
  Layers3,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Share2,
  Sparkles,
  Trash2,
  Upload,
  Wrench,
  X
} from "lucide-react";
import { prepareFileForUpload } from "@/lib/client-compress";
import { SOCIAL_PLATFORMS, SocialBrandBadge, resolveSocialPlatform, type SocialPlatformConfig } from "@/lib/social-platforms";
import type {
  CertificationContent,
  CvContent,
  HeroTemplate,
  ProjectContent,
  ServiceContent,
  SiteContent,
  SkillContent,
  SocialContent,
  StatisticContent
} from "@/types/site-content";

type EditWebsiteTab =
  | "hero"
  | "projects"
  | "certifications"
  | "cv"
  | "skills"
  | "about"
  | "services"
  | "contact"
  | "social";

type EditWebsiteManagerProps = {
  content: SiteContent;
  setContent: (content: SiteContent) => void;
  saveContent: (content: SiteContent) => Promise<void>;
  secureHeaders: (extra?: HeadersInit) => HeadersInit;
};

type IdentifiedItem = { id: string };

const heroTemplates: { id: HeroTemplate; name: string; description: string; previewClass: string }[] = [
  { id: "circle", name: "Circle Image", description: "A focused circular portrait treatment.", previewClass: "rounded-full" },
  { id: "rounded", name: "Rounded Rectangle", description: "A clean, framed professional photo.", previewClass: "rounded-xl" },
  { id: "glass", name: "Glass Card", description: "A portrait inside a soft glass treatment.", previewClass: "rounded-xl border-white/60 bg-white/20" },
  { id: "floating", name: "Floating Image", description: "A raised image with depth and space.", previewClass: "rounded-xl -rotate-3 shadow-xl" },
  { id: "layered", name: "Modern Layered Design", description: "The current NURAXTECH hero composition.", previewClass: "rounded-xl shadow-lg" }
];

const uploadTimeoutMs = 60_000;

function uploadFailureMessage(error: unknown) {
  return error instanceof Error && error.name === "AbortError"
    ? "Upload timed out. Try a smaller file or check the connection."
    : "Media upload failed. Please try again.";
}

const tabs: { id: EditWebsiteTab; label: string; icon: typeof Sparkles; group?: string }[] = [
  { id: "hero", label: "Hero Section", icon: Sparkles, group: "Core Portfolio" },
  { id: "projects", label: "Projects", icon: BriefcaseBusiness, group: "Core Portfolio" },
  { id: "certifications", label: "Certifications", icon: Award, group: "Credentials & Media" },
  { id: "cv", label: "Change CV", icon: FileText, group: "Credentials & Media" },
  { id: "skills", label: "Technical Skills", icon: Wrench, group: "Core Portfolio" },
  { id: "about", label: "About Section", icon: CircleUserRound, group: "Core Portfolio" },
  { id: "services", label: "Services", icon: Layers3, group: "Core Portfolio" },
  { id: "contact", label: "Contact Page", icon: ContactRound, group: "Communication" },
  { id: "social", label: "Social Media", icon: Share2, group: "Communication" }
];

// Provides the redesigned, clean admin module for the editable public portfolio sections.
export default function EditWebsiteManager({ content, setContent, saveContent, secureHeaders }: EditWebsiteManagerProps) {
  const [activeTab, setActiveTab] = useState<EditWebsiteTab>("hero");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Stores an edited content document locally, then persists it through the protected API.
  async function commit(nextContent: SiteContent) {
    setContent(nextContent);
    await saveContent(nextContent);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[250px_minmax(0,1fr)]">
      {/* Redesigned Sidebar Navigation with Group Headers */}
      <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-[#16f2a4]">Content Editor</p>
            <p className="text-[11px] text-white/50">Website sections & media</p>
          </div>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="xl:hidden rounded-lg border border-white/10 p-1.5 text-white/70 hover:text-white"
          >
            {mobileSidebarOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        <div className={`grid gap-1.5 ${mobileSidebarOpen ? "block" : "hidden xl:grid"}`}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileSidebarOpen(false);
                }}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-bold transition-all duration-200 ${
                  active
                    ? "bg-[#16f2a4] text-black shadow-lg shadow-[#16f2a4]/20 font-black"
                    : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Icon size={17} className={active ? "text-black" : "text-white/60"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Content Pane */}
      <section className="min-w-0">
        {activeTab === "hero" ? <HeroEditor content={content} setContent={setContent} commit={commit} secureHeaders={secureHeaders} /> : null}
        {activeTab === "projects" ? <ProjectsEditor content={content} setContent={setContent} commit={commit} secureHeaders={secureHeaders} /> : null}
        {activeTab === "certifications" ? <CertificationsEditor content={content} setContent={setContent} commit={commit} secureHeaders={secureHeaders} /> : null}
        {activeTab === "cv" ? <CvEditor content={content} setContent={setContent} commit={commit} secureHeaders={secureHeaders} /> : null}
        {activeTab === "skills" ? <SkillsEditor content={content} setContent={setContent} commit={commit} secureHeaders={secureHeaders} /> : null}
        {activeTab === "about" ? <AboutEditor content={content} setContent={setContent} commit={commit} secureHeaders={secureHeaders} /> : null}
        {activeTab === "services" ? <ServicesEditor content={content} setContent={setContent} commit={commit} secureHeaders={secureHeaders} /> : null}
        {activeTab === "contact" ? <ContactEditor content={content} setContent={setContent} commit={commit} /> : null}
        {activeTab === "social" ? <SocialEditor content={content} setContent={setContent} commit={commit} /> : null}
      </section>
    </div>
  );
}

// Renders the hero copy, calls to action, image, and selectable image templates.
function HeroEditor({ content, setContent, commit, secureHeaders }: EditorProps & UploadProps) {
  const heroTemplate = content.home.heroTemplate || "layered";
  const update = (nextHome: SiteContent["home"]) => setContent({ ...content, home: nextHome });
  const backgroundType = content.home.heroBackgroundType || "none";

  function saveHeroImage(value: string) {
    const nextContent = { ...content, home: { ...content.home, profileImage: value, heroImage: value } };
    setContent(nextContent);
    void commit(nextContent);
  }

  function saveHeroBackground(value: string) {
    const nextContent = { ...content, home: { ...content.home, heroBackgroundUrl: value } };
    setContent(nextContent);
    void commit(nextContent);
  }

  return (
    <EditorPanel
      title="Hero Section"
      description="Update the headline, introductory copy, calls to action, and visual presentation of your homepage hero."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <Field label="Heading" value={content.home.title} onChange={(value) => update({ ...content.home, title: value })} />
        <Field label="Sub Heading" value={content.home.subtitle} onChange={(value) => update({ ...content.home, subtitle: value })} />
      </div>
      <TextArea label="Description" value={content.home.description} onChange={(value) => update({ ...content.home, description: value })} />
      
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="grid gap-4 rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="font-black text-sm text-[#16f2a4]">Primary Call To Action</p>
          <Field label="Button Label" value={content.home.primaryButton.label} onChange={(value) => update({ ...content.home, primaryButton: { ...content.home.primaryButton, label: value } })} />
          <Field label="Button URL" value={content.home.primaryButton.href} onChange={(value) => update({ ...content.home, primaryButton: { ...content.home.primaryButton, href: value } })} />
        </div>
        <div className="grid gap-4 rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="font-black text-sm text-[#16f2a4]">Secondary Call To Action</p>
          <Field label="Button Label" value={content.home.secondaryButton.label} onChange={(value) => update({ ...content.home, secondaryButton: { ...content.home.secondaryButton, label: value } })} />
          <Field label="Button URL" value={content.home.secondaryButton.href} onChange={(value) => update({ ...content.home, secondaryButton: { ...content.home.secondaryButton, href: value } })} />
        </div>
      </div>

      <ImageField
        label="Hero Portrait / Graphic (Uncropped Display)"
        value={content.home.profileImage || content.home.heroImage}
        onChange={(value) => update({ ...content.home, profileImage: value, heroImage: value })}
        onUploaded={saveHeroImage}
        secureHeaders={secureHeaders}
      />

      <div className="grid gap-4 rounded-xl border border-white/10 bg-black/30 p-4">
        <div>
          <p className="font-black text-sm text-white">Hero Background</p>
          <p className="mt-1 text-xs text-white/50">Choose between solid dark tone, background image, or smooth video loop.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["none", "color", "image", "video"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => update({ ...content.home, heroBackgroundType: type === "none" ? undefined : type as "color" | "image" | "video", heroBackgroundUrl: type === "none" ? "" : content.home.heroBackgroundUrl })}
              className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${
                backgroundType === type ? "border-[#16f2a4] bg-[#16f2a4] text-black" : "border-white/10 text-white/70 hover:border-[#16f2a4]"
              }`}
            >
              {type === "none" ? "Default Clean" : `${type[0].toUpperCase()}${type.slice(1)}`}
            </button>
          ))}
        </div>
        {backgroundType === "color" ? <ColorField label="Background Color" value={content.home.heroBackgroundColor || "#020403"} onChange={(value) => update({ ...content.home, heroBackgroundColor: value })} /> : null}
        {backgroundType === "image" || backgroundType === "video" ? <ImageField label={backgroundType === "video" ? "Background Video" : "Background Image"} value={content.home.heroBackgroundUrl || ""} onChange={(value) => update({ ...content.home, heroBackgroundUrl: value })} onUploaded={saveHeroBackground} secureHeaders={secureHeaders} allowVideo={backgroundType === "video"} /> : null}
      </div>

      <div>
        <div className="mb-3">
          <p className="font-black text-sm text-white">Hero Presentation Layout</p>
          <p className="mt-1 text-xs text-white/50">Select how your hero photo is framed on the public homepage.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {heroTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => update({ ...content.home, heroTemplate: template.id })}
              className={`rounded-xl border p-3 text-left transition ${
                heroTemplate === template.id ? "border-[#16f2a4] bg-[#16f2a4]/10 shadow-md" : "border-white/10 bg-black/20 hover:border-white/30"
              }`}
            >
              <span className={`mb-2.5 block aspect-[4/3] border border-white/15 bg-gradient-to-br from-[#16f2a4]/60 via-[#22d3ee]/40 to-black ${template.previewClass}`} />
              <span className="block font-black text-sm text-white">{template.name}</span>
              <span className="mt-1 block text-[11px] leading-4 text-white/50">{template.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <SaveButton label="Save Hero Changes" onClick={() => commit(content)} />
      </div>
    </EditorPanel>
  );
}

// Manages project CRUD, media uploads, technology tags, and collapsible ordering.
function ProjectsEditor({ content, setContent, commit, secureHeaders }: EditorProps & UploadProps) {
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});
  const allCollapsed = content.projects.length > 0 && content.projects.every((p) => collapsedMap[p.id]);

  const toggleAll = () => {
    const nextState = !allCollapsed;
    const nextMap: Record<string, boolean> = {};
    content.projects.forEach((p) => {
      nextMap[p.id] = nextState;
    });
    setCollapsedMap(nextMap);
  };

  const updateProject = (id: string, patch: Partial<ProjectContent>) => {
    setContent({ ...content, projects: content.projects.map((project) => (project.id === id ? { ...project, ...patch } : project)) });
  };

  return (
    <EditorPanel
      title="Projects"
      description="Add, edit, remove, upload, and drag projects into the order you want visitors to see."
      badge={`${content.projects.length} Total`}
      onToggleCollapse={toggleAll}
      allCollapsed={allCollapsed}
    >
      <ReorderableList
        items={content.projects}
        onReorder={(projects) => setContent({ ...content, projects })}
        renderItem={(project) => (
          <ProjectCard
            project={project}
            isCollapsed={Boolean(collapsedMap[project.id])}
            onToggleCollapse={() => setCollapsedMap((prev) => ({ ...prev, [project.id]: !prev[project.id] }))}
            onChange={(patch) => updateProject(project.id, patch)}
            onDelete={() => removeItem("this project", () => setContent({ ...content, projects: content.projects.filter((item) => item.id !== project.id) }))}
            secureHeaders={secureHeaders}
          />
        )}
      />
      <div className="flex flex-wrap gap-3 pt-3">
        <AddButton
          label="Add New Project"
          onClick={() =>
            setContent({
              ...content,
              projects: [...content.projects, { id: createId("project"), title: "New Project", description: "Describe the result and value of this project.", image: "", tags: [], url: "", githubUrl: "" }]
            })
          }
        />
        <SaveButton label="Save Projects" onClick={() => commit(content)} />
      </div>
    </EditorPanel>
  );
}

// Renders an individual project card with collapsible body.
function ProjectCard({
  project,
  isCollapsed,
  onToggleCollapse,
  onChange,
  onDelete,
  secureHeaders
}: {
  project: ProjectContent;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onChange: (patch: Partial<ProjectContent>) => void;
  onDelete: () => void;
} & UploadProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden transition-all duration-200">
      {/* Collapsible Card Header */}
      <div className="flex items-center justify-between p-4 bg-white/[0.02] border-b border-white/5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono text-xs font-bold text-white/40">#{project.id.slice(0, 8)}</span>
          <p className="font-black text-sm text-white truncate">{project.title || "Untitled Project"}</p>
          {project.category && (
            <span className="hidden sm:inline-block rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold text-[#16f2a4]">
              {project.category}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1 text-xs font-bold text-white/70 hover:bg-white/5 hover:text-white"
          >
            {isCollapsed ? (
              <>
                <ChevronDown size={14} /> Expand
              </>
            ) : (
              <>
                <ChevronUp size={14} /> Collapse
              </>
            )}
          </button>
          <DeleteButton label="Delete Project" onClick={onDelete} />
        </div>
      </div>

      {/* Expanded Form Fields */}
      {!isCollapsed && (
        <div className="grid gap-4 p-5 xl:grid-cols-[1fr_1fr_300px]">
          <div className="grid gap-4">
            <Field label="Project Title" value={project.title} onChange={(value) => onChange({ title: value })} />
            <Field label="Category" value={project.category || ""} onChange={(value) => onChange({ category: value })} />
            <Field label="Live Link" value={project.url} onChange={(value) => onChange({ url: value })} />
            <Field label="GitHub Link" value={project.githubUrl || ""} onChange={(value) => onChange({ githubUrl: value })} />
          </div>
          <div className="grid gap-4">
            <TextArea label="Description" value={project.description} onChange={(value) => onChange({ description: value })} compact />
            <Field label="Technologies" hint="Comma separated" value={project.tags.join(", ")} onChange={(value) => onChange({ tags: splitCommaList(value) })} />
          </div>
          <ImageField label="Project Image (Uncropped Display)" value={project.image} onChange={(value) => onChange({ image: value })} secureHeaders={secureHeaders} />
        </div>
      )}
    </div>
  );
}

// Manages LinkedIn-style Licenses & Certifications with collapsible entries.
function CertificationsEditor({ content, setContent, commit, secureHeaders }: EditorProps & UploadProps) {
  const certifications = content.certifications || [];
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});
  const allCollapsed = certifications.length > 0 && certifications.every((c) => collapsedMap[c.id]);

  const toggleAll = () => {
    const nextState = !allCollapsed;
    const nextMap: Record<string, boolean> = {};
    certifications.forEach((c) => {
      nextMap[c.id] = nextState;
    });
    setCollapsedMap(nextMap);
  };

  const updateCertification = (id: string, patch: Partial<CertificationContent>) => {
    const updated = certifications.map((c) => (c.id === id ? { ...c, ...patch } : c));
    setContent({ ...content, certifications: updated });
  };

  const addCertification = () => {
    const newCert: CertificationContent = {
      id: createId("cert"),
      name: "New Certification",
      issuingOrganization: "Issuing Organization",
      issueDate: "2024",
      expirationDate: "Does not expire",
      credentialId: "",
      credentialUrl: "",
      skills: [],
      mediaUrl: "",
      mediaType: "image",
      description: "",
      isPublished: true,
      order: certifications.length
    };
    setContent({ ...content, certifications: [...certifications, newCert] });
  };

  return (
    <EditorPanel
      title="Licenses & Certifications"
      description="Manage your professional credentials in LinkedIn style. Display credential IDs, issuing bodies, verification links, and certificate media."
      badge={`${certifications.length} Credentials`}
      onToggleCollapse={toggleAll}
      allCollapsed={allCollapsed}
    >
      {certifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-white/50">
          <Award className="mx-auto mb-3 opacity-40 text-[#16f2a4]" size={40} />
          <p className="text-base font-bold text-white/80">No certifications added yet</p>
          <p className="mt-1 text-xs text-white/50">Click &ldquo;Add Certification&rdquo; below to showcase your professional credentials.</p>
        </div>
      ) : (
        <ReorderableList
          items={certifications}
          onReorder={(reordered) => setContent({ ...content, certifications: reordered })}
          renderItem={(cert) => (
            <CertificationCard
              key={cert.id}
              cert={cert}
              isCollapsed={Boolean(collapsedMap[cert.id])}
              onToggleCollapse={() => setCollapsedMap((prev) => ({ ...prev, [cert.id]: !prev[cert.id] }))}
              onChange={(patch) => updateCertification(cert.id, patch)}
              onDelete={() =>
                removeItem("this certification", () =>
                  setContent({
                    ...content,
                    certifications: certifications.filter((c) => c.id !== cert.id)
                  })
                )
              }
              secureHeaders={secureHeaders}
            />
          )}
        />
      )}

      <div className="flex flex-wrap gap-3 pt-3">
        <AddButton label="Add Certification" onClick={addCertification} />
        <SaveButton label="Save Certifications" onClick={() => commit(content)} />
      </div>
    </EditorPanel>
  );
}

// Editable card for an individual Certification entry.
function CertificationCard({
  cert,
  isCollapsed,
  onToggleCollapse,
  onChange,
  onDelete,
  secureHeaders
}: {
  cert: CertificationContent;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onChange: (patch: Partial<CertificationContent>) => void;
  onDelete: () => void;
} & UploadProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden transition-all duration-200">
      <div className="flex items-center justify-between p-4 bg-white/[0.02] border-b border-white/5">
        <div className="flex items-center gap-3 min-w-0">
          <Award size={18} className="text-[#16f2a4] shrink-0" />
          <div className="min-w-0">
            <p className="font-black text-sm text-white truncate">{cert.name}</p>
            <p className="text-xs text-white/50 truncate">{cert.issuingOrganization} · {cert.issueDate}</p>
          </div>
          {cert.isPublished !== false ? (
            <span className="hidden sm:inline-block rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              Published
            </span>
          ) : (
            <span className="hidden sm:inline-block rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-400">
              Hidden
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1 text-xs font-bold text-white/70 hover:bg-white/5 hover:text-white"
          >
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            <span>{isCollapsed ? "Expand" : "Collapse"}</span>
          </button>
          <DeleteButton label="Delete Certification" onClick={onDelete} />
        </div>
      </div>

      {!isCollapsed && (
        <div className="grid gap-4 p-5 xl:grid-cols-[1fr_1fr_300px]">
          <div className="grid gap-4">
            <Field label="Certification Name" value={cert.name} onChange={(value) => onChange({ name: value })} hint="e.g. Salesforce Certified Administrator" />
            <Field label="Issuing Organization" value={cert.issuingOrganization} onChange={(value) => onChange({ issuingOrganization: value })} hint="e.g. Salesforce, Google, Coursera" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Issue Date" value={cert.issueDate} onChange={(value) => onChange({ issueDate: value })} hint="e.g. May 2024" />
              <Field label="Expiration Date" value={cert.expirationDate || ""} onChange={(value) => onChange({ expirationDate: value })} hint="or 'Does not expire'" />
            </div>
            <Field label="Credential ID" value={cert.credentialId || ""} onChange={(value) => onChange({ credentialId: value })} hint="Optional ID" />
          </div>

          <div className="grid gap-4">
            <Field label="Credential URL" value={cert.credentialUrl || ""} onChange={(value) => onChange({ credentialUrl: value })} hint="Verification link" />
            <Field
              label="Associated Skills"
              hint="Comma separated"
              value={(cert.skills || []).join(", ")}
              onChange={(value) => onChange({ skills: splitCommaList(value) })}
            />
            <TextArea label="Description / Summary" value={cert.description || ""} onChange={(value) => onChange({ description: value })} compact />

            <div className="flex items-center justify-between pt-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-white/80">
                <input
                  type="checkbox"
                  checked={cert.isPublished !== false}
                  onChange={(e) => onChange({ isPublished: e.target.checked })}
                  className="h-4 w-4 rounded accent-[#16f2a4]"
                />
                <span>Show on public Certifications page</span>
              </label>
            </div>
          </div>

          <div className="grid gap-2">
            <ImageField
              label="Certificate Media (Uncropped Display)"
              value={cert.mediaUrl || ""}
              onChange={(value) => onChange({ mediaUrl: value })}
              secureHeaders={secureHeaders}
            />
            {cert.credentialUrl && (
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#16f2a4] hover:underline"
              >
                <ExternalLink size={12} /> Test Verification Link
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Dedicated Change CV Manager: upload, inspect, preview, replace, and reset CV PDF.
function CvEditor({ content, setContent, commit, secureHeaders }: EditorProps & UploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const activeCv = content.cv || { url: "/cv", fileName: "Usman_Iqbal_CV.pdf", uploadedAt: "" };

  async function handleCvUpload(file?: File) {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setError("Please select a valid PDF file.");
      return;
    }

    setUploading(true);
    setError("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), uploadTimeoutMs);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (activeCv.url && activeCv.url !== "/cv") {
        formData.append("replacesUrl", activeCv.url);
      }

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: secureHeaders(),
        body: formData,
        signal: controller.signal
      });

      const result = (await response.json().catch(() => ({ message: "Upload failed." }))) as { url?: string; message?: string };

      if (!response.ok || !result.url) {
        setError(result.message || "Failed to upload CV file.");
        return;
      }

      const updatedCv: CvContent = {
        url: result.url,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        fileSize: file.size
      };

      const nextContent = { ...content, cv: updatedCv };
      setContent(nextContent);
      await commit(nextContent);
    } catch (err) {
      setError(uploadFailureMessage(err));
    } finally {
      window.clearTimeout(timeout);
      setUploading(false);
    }
  }

  function handleResetDefault() {
    if (window.confirm("Reset active CV to default viewer (/cv)?")) {
      const nextContent = {
        ...content,
        cv: { url: "/cv", fileName: "Usman_Iqbal_CV.pdf", uploadedAt: "" }
      };
      setContent(nextContent);
      void commit(nextContent);
    }
  }

  return (
    <EditorPanel
      title="Change CV / Resume"
      description="Upload and manage your active CV (PDF). The 'View Usman Iqbal CV' buttons across the site and `/cv` link directly to this file."
    >
      {/* Current Active CV Status Card */}
      <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#16f2a4]/15 text-[#16f2a4]">
              <FileText size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-base font-black text-white">{activeCv.fileName || "Usman_Iqbal_CV.pdf"}</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                  <CheckCircle2 size={12} /> Live Active
                </span>
              </div>
              <p className="mt-1 text-xs text-white/50">
                {activeCv.uploadedAt
                  ? `Uploaded on ${new Date(activeCv.uploadedAt).toLocaleString()}`
                  : "Standard portfolio CV template"}
                {activeCv.fileSize ? ` · ${(activeCv.fileSize / 1024 / 1024).toFixed(2)} MB` : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={activeCv.url || "/cv"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-white transition hover:border-[#16f2a4] hover:text-[#16f2a4]"
            >
              <Eye size={14} /> Preview Active CV
            </a>
            {activeCv.url && activeCv.url !== "/cv" && (
              <button
                type="button"
                onClick={handleResetDefault}
                className="rounded-full border border-white/10 px-3 py-2 text-xs font-bold text-white/50 hover:border-red-400/40 hover:text-red-300"
              >
                Reset to Default
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Upload Box */}
      <div className="grid gap-3 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-6 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#16f2a4]/10 text-[#16f2a4]">
          {uploading ? <Loader2 className="animate-spin" size={26} /> : <Upload size={26} />}
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Upload New CV (PDF)</h3>
          <p className="mt-1 text-xs text-white/50">Select your updated CV PDF. It will be securely stored and linked instantly to all public buttons.</p>
        </div>

        <div className="mt-2 flex justify-center">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#16f2a4] px-6 py-3 font-black text-black transition hover:bg-white active:scale-95 shadow-md">
            {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
            {uploading ? "Uploading & Activating..." : "Select New PDF"}
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              disabled={uploading}
              onChange={(e) => handleCvUpload(e.target.files?.[0])}
            />
          </label>
        </div>

        {error && <p className="mt-2 text-sm font-semibold text-red-300">{error}</p>}
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-white/40">
          The public website dynamically routes &ldquo;View Usman Iqbal CV&rdquo; and <code className="text-white/60">/cv</code> to this active document.
        </p>
        <SaveButton label="Save Changes" onClick={() => commit(content)} />
      </div>
    </EditorPanel>
  );
}

// Manages skills with percentage controls and collapsible cards.
function SkillsEditor({ content, setContent, commit, secureHeaders }: EditorProps & UploadProps) {
  const updateSkill = (id: string, patch: Partial<SkillContent>) => {
    setContent({ ...content, skills: content.skills.map((skill) => (skill.id === id ? { ...skill, ...patch } : skill)) });
  };

  return (
    <EditorPanel
      title="Technical Skills"
      description="Manage your skills, categories, icons, percentages, colors, and display order."
      badge={`${content.skills.length} Skills`}
    >
      <ReorderableList
        items={content.skills}
        onReorder={(skills) => setContent({ ...content, skills })}
        renderItem={(skill) => (
          <div className="grid gap-4 rounded-xl border border-white/10 bg-black/30 p-4 xl:grid-cols-[1fr_1fr_160px_220px] items-center">
            <Field label="Skill Name" value={skill.name} onChange={(value) => updateSkill(skill.id, { name: value })} />
            <Field label="Skill Category" value={skill.category} onChange={(value) => updateSkill(skill.id, { category: value })} />
            <NumberField label="Proficiency (%)" value={skill.level} min={0} max={100} onChange={(value) => updateSkill(skill.id, { level: value })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <ColorField label="Accent" value={skill.accent} onChange={(value) => updateSkill(skill.id, { accent: value })} />
              <ImageField label="Icon" value={skill.icon || ""} onChange={(value) => updateSkill(skill.id, { icon: value })} secureHeaders={secureHeaders} compact />
            </div>
            <DeleteButton label="Delete Skill" onClick={() => removeItem("this skill", () => setContent({ ...content, skills: content.skills.filter((item) => item.id !== skill.id) }))} />
          </div>
        )}
      />
      <div className="flex flex-wrap gap-3 pt-3">
        <AddButton label="Add Skill" onClick={() => setContent({ ...content, skills: [...content.skills, { id: createId("skill"), name: "New Skill", category: "Category", level: 80, accent: "#16f2a4", icon: "" }] })} />
        <SaveButton label="Save Skills" onClick={() => commit(content)} />
      </div>
    </EditorPanel>
  );
}

// Manages about bio, highlights, stats, and impact numbers.
function AboutEditor({ content, setContent, commit, secureHeaders }: EditorProps & UploadProps) {
  const update = (patch: Partial<SiteContent["about"]>) => setContent({ ...content, about: { ...content.about, ...patch } });
  const stats = content.about.statistics || [];

  const updateStat = (id: string, patch: Partial<StatisticContent>) => {
    update({ statistics: stats.map((stat) => (stat.id === id ? { ...stat, ...patch } : stat)) });
  };

  return (
    <EditorPanel title="About Section" description="Update your professional background, career highlights, and impact statistics.">
      <div className="grid gap-5 lg:grid-cols-2">
        <Field label="Eyebrow" value={content.about.eyebrow} onChange={(value) => update({ eyebrow: value })} />
        <Field label="Headline" value={content.about.title} onChange={(value) => update({ title: value })} />
      </div>
      <TextArea label="Bio Description" value={content.about.description} onChange={(value) => update({ description: value })} />
      <TextArea label="Highlights" hint="One item per line" value={content.about.highlights.join("\n")} onChange={(value) => update({ highlights: splitLines(value) })} />
      <ImageField label="About Image (Uncropped Display)" value={content.about.image || ""} onChange={(value) => update({ image: value })} secureHeaders={secureHeaders} />
      
      <div className="grid gap-4 rounded-xl border border-white/10 bg-black/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-black text-sm text-white">Impact Statistics</p>
            <p className="text-xs text-white/50">Metrics displayed on your about card</p>
          </div>
          <AddButton label="Add Stat" onClick={() => update({ statistics: [...stats, { id: createId("stat"), value: "10+", label: "New Metric" }] })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.id} className="grid gap-3 rounded-xl border border-white/10 bg-black/40 p-3">
              <Field label="Value" value={stat.value} onChange={(value) => updateStat(stat.id, { value })} />
              <Field label="Label" value={stat.label} onChange={(value) => updateStat(stat.id, { label: value })} />
              <DeleteButton label="Delete Stat" onClick={() => removeItem("this statistic", () => update({ statistics: stats.filter((item) => item.id !== stat.id) }))} />
            </div>
          ))}
        </div>
      </div>
      
      <div className="pt-2">
        <SaveButton label="Save About Changes" onClick={() => commit(content)} />
      </div>
    </EditorPanel>
  );
}

// Manages services list, descriptions, and icon/image associations.
function ServicesEditor({ content, setContent, commit, secureHeaders }: EditorProps & UploadProps) {
  const updateService = (id: string, patch: Partial<ServiceContent>) => {
    setContent({ ...content, services: content.services.map((service) => (service.id === id ? { ...service, ...patch } : service)) });
  };

  return (
    <EditorPanel
      title="Services"
      description="Detail your consulting and development offerings with scope and deliverables."
      badge={`${content.services.length} Services`}
    >
      <ReorderableList
        items={content.services}
        onReorder={(services) => setContent({ ...content, services })}
        renderItem={(service) => (
          <div className="grid gap-4 rounded-xl border border-white/10 bg-black/30 p-4 xl:grid-cols-[1fr_1.5fr_220px]">
            <Field label="Service Title" value={service.title} onChange={(value) => updateService(service.id, { title: value })} />
            <TextArea label="Description" value={service.description} onChange={(value) => updateService(service.id, { description: value })} compact />
            <div className="grid gap-3">
              <ImageField label="Service Graphic" value={service.image || service.icon || ""} onChange={(value) => updateService(service.id, { image: value, icon: value })} secureHeaders={secureHeaders} compact />
              <DeleteButton label="Delete Service" onClick={() => removeItem("this service", () => setContent({ ...content, services: content.services.filter((item) => item.id !== service.id) }))} />
            </div>
          </div>
        )}
      />
      <div className="flex flex-wrap gap-3 pt-3">
        <AddButton label="Add Service" onClick={() => setContent({ ...content, services: [...content.services, { id: createId("service"), title: "New Service", description: "Describe the scope and deliverable of this service." }] })} />
        <SaveButton label="Save Services" onClick={() => commit(content)} />
      </div>
    </EditorPanel>
  );
}

// Manages contact details, contact form fields, and Google Map links.
function ContactEditor({ content, setContent, commit }: EditorProps) {
  const contact = content.contact;
  const update = (patch: Partial<SiteContent["contact"]>) => setContent({ ...content, contact: { ...content.contact, ...patch } });
  const fields = contact.formFields || [];

  return (
    <EditorPanel title="Contact Page" description="Update your contact details, Google Map URL, contact text, and form fields.">
      <div className="grid gap-5 lg:grid-cols-3">
        <Field label="Email" value={contact.email} onChange={(value) => update({ email: value })} />
        <Field label="Phone Number" value={contact.phone} onChange={(value) => update({ phone: value })} />
        <Field label="Address" value={contact.location} onChange={(value) => update({ location: value })} />
      </div>
      <Field label="Google Map URL" hint="Use an HTTPS Google Maps link or embed URL" value={contact.googleMapUrl || ""} onChange={(value) => update({ googleMapUrl: value })} />
      <TextArea label="Contact Heading" value={contact.formHeadline} onChange={(value) => update({ formHeadline: value })} />
      
      <div className="grid gap-3">
        <p className="font-black text-sm text-white">Contact Form Fields</p>
        {fields.map((field, index) => (
          <div key={`${field}-${index}`} className="flex gap-3 rounded-xl border border-white/10 bg-black/30 p-3">
            <input
              value={field}
              onChange={(event) => update({ formFields: fields.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)) })}
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-white text-sm outline-none focus:border-[#16f2a4]"
            />
            <DeleteButton label="Remove Field" onClick={() => removeItem("this form field", () => update({ formFields: fields.filter((_, itemIndex) => itemIndex !== index) }))} />
          </div>
        ))}
        <AddButton label="Add Form Field" onClick={() => update({ formFields: [...fields, "New Field"] })} />
      </div>
      
      <div className="pt-2">
        <SaveButton label="Save Contact Changes" onClick={() => commit(content)} />
      </div>
    </EditorPanel>
  );
}

/**
 * FIXED PLATFORM DROPDOWN COMPONENT (Solves Requirement 3)
 * Completely eliminates browser native select readability bugs.
 * High-contrast dark theme background (#181a20), bold white labels, official brand icons,
 * perfect alignment, responsive positioning, and smooth hover state.
 */
function PlatformDropdown({
  value,
  onChange
}: {
  value: string;
  onChange: (platformId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentConfig = resolveSocialPlatform(value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-xl border border-white/15 bg-[#16181D] px-3.5 py-3 text-left text-white shadow-sm transition-all duration-200 hover:border-[#16f2a4] focus:border-[#16f2a4] focus:outline-none"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
            style={{ background: currentConfig.badgeBg, color: currentConfig.badgeText }}
          >
            {currentConfig.renderIcon({ size: 14 })}
          </span>
          <span className="truncate font-bold text-sm text-white">{currentConfig.name}</span>
        </span>
        <ChevronDown size={16} className={`shrink-0 text-white/60 transition-transform duration-200 ${open ? "rotate-180 text-[#16f2a4]" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 max-h-80 w-full min-w-[240px] overflow-y-auto rounded-xl border border-white/20 bg-[#1a1d24] p-2 shadow-2xl backdrop-blur-2xl">
          <p className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#16f2a4]">
            Select Platform
          </p>
          <div className="grid gap-1">
            {SOCIAL_PLATFORMS.map((platform) => {
              const isSelected = platform.id === currentConfig.id;
              return (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => {
                    onChange(platform.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition ${
                    isSelected ? "bg-[#16f2a4]/20 text-[#16f2a4]" : "text-white hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                      style={{ background: platform.badgeBg, color: platform.badgeText }}
                    >
                      {platform.renderIcon({ size: 13 })}
                    </span>
                    <span className="truncate text-xs font-bold text-white">{platform.name}</span>
                  </div>
                  {isSelected && <Check size={14} className="text-[#16f2a4] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Maintains all public social URLs with official full-color brand icons and the fixed custom dropdown.
function SocialEditor({ content, setContent, commit }: EditorProps) {
  const updateSocial = (id: string, patch: Partial<SocialContent>) => {
    setContent({
      ...content,
      socials: content.socials.map((social) => (social.id === id ? { ...social, ...patch } : social))
    });
  };

  const handleSelectPlatform = (id: string, platformId: string) => {
    const config = SOCIAL_PLATFORMS.find((p) => p.id === platformId);
    if (!config) return;

    updateSocial(id, {
      platform: config.name,
      label: config.name
    });
  };

  const addPlatformPreset = (platformId: string) => {
    const config = SOCIAL_PLATFORMS.find((p) => p.id === platformId);
    if (!config) return;

    setContent({
      ...content,
      socials: [
        ...content.socials,
        {
          id: createId("social"),
          platform: config.name,
          label: config.name,
          url: ""
        }
      ]
    });
  };

  // Quick preset buttons for all 10 official platforms including Fiverr and Threads
  const primaryQuickPicks = [
    { id: "medium", name: "Medium" },
    { id: "blogger", name: "Blogger" },
    { id: "bluesky", name: "Bluesky" },
    { id: "instagram", name: "Instagram" },
    { id: "twitter", name: "Twitter / X" },
    { id: "contra", name: "Contra" },
    { id: "facebook", name: "Facebook" },
    { id: "tiktok", name: "TikTok" },
    { id: "fiverr", name: "Fiverr" },
    { id: "threads", name: "Threads" }
  ];

  return (
    <EditorPanel
      title="Official Social Media Links"
      description="Connect your official social media profiles. Each platform renders its authentic, official full-color brand icon automatically across the website."
      badge={`${content.socials.length} Connected`}
    >
      {/* Quick Add Platform Presets */}
      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-white/50">Quick-Add Supported Platforms</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {primaryQuickPicks.map((pick) => {
            const config = resolveSocialPlatform(pick.id);
            return (
              <button
                key={pick.id}
                type="button"
                onClick={() => addPlatformPreset(pick.id)}
                className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-bold text-white transition hover:border-[#16f2a4] hover:bg-white/10"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: config.badgeBg, color: config.badgeText }}>
                  {config.renderIcon({ size: 12 })}
                </span>
                <span>{pick.name}</span>
                <Plus size={12} className="opacity-50 group-hover:opacity-100" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Social Items List */}
      <div className="grid gap-3">
        {content.socials.map((social) => {
          const config = resolveSocialPlatform(social.platform || social.url);

          return (
            <div
              key={social.id}
              className="grid gap-4 rounded-xl border border-white/10 bg-black/30 p-4 lg:grid-cols-[auto_200px_1fr_1.5fr_auto] items-center"
            >
              {/* Live Official Brand Icon Preview */}
              <div className="flex flex-col items-center justify-center p-1">
                <SocialBrandBadge platform={social.platform} url={social.url} size="md" />
                <span className="mt-1 text-[10px] font-bold text-white/40">{config.name}</span>
              </div>

              {/* Fixed Platform Dropdown */}
              <div className="grid gap-1.5">
                <span className="text-xs font-bold text-white/70">Platform</span>
                <PlatformDropdown
                  value={social.platform || social.url}
                  onChange={(platformId) => handleSelectPlatform(social.id, platformId)}
                />
              </div>

              <Field label="Display Label" value={social.label} onChange={(value) => updateSocial(social.id, { label: value })} />
              <Field
                label="Profile URL"
                value={social.url}
                onChange={(value) => updateSocial(social.id, { url: value })}
                hint={config.domainMatch[0] ? `https://${config.domainMatch[0]}/...` : undefined}
              />
              <DeleteButton
                label="Delete Social Link"
                onClick={() =>
                  removeItem("this social link", () =>
                    setContent({
                      ...content,
                      socials: content.socials.filter((item) => item.id !== social.id)
                    })
                  )
                }
              />
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 pt-3">
        <AddButton
          label="Add Custom Link"
          onClick={() =>
            setContent({
              ...content,
              socials: [
                ...content.socials,
                { id: createId("social"), platform: "Fiverr", label: "Fiverr", url: "" }
              ]
            })
          }
        />
        <SaveButton label="Save Social Links" onClick={() => commit(content)} />
      </div>
    </EditorPanel>
  );
}

type EditorProps = Pick<EditWebsiteManagerProps, "content" | "setContent"> & { commit: (content: SiteContent) => Promise<void> };
type UploadProps = Pick<EditWebsiteManagerProps, "secureHeaders">;

// Provides a reusable sortable list used for projects, skills, services, and certifications.
function ReorderableList<T extends IdentifiedItem>({ items, onReorder, renderItem }: { items: T[]; onReorder: (items: T[]) => void; renderItem: (item: T) => React.ReactNode }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 7 } }));

  function handleDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : "";

    if (!overId || activeId === overId) {
      return;
    }

    const fromIndex = items.findIndex((item) => item.id === activeId);
    const toIndex = items.findIndex((item) => item.id === overId);

    if (fromIndex !== -1 && toIndex !== -1) {
      onReorder(arrayMove(items, fromIndex, toIndex));
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="grid gap-4">
          {items.map((item) => (
            <SortableRow key={item.id} id={item.id}>
              {renderItem(item)}
            </SortableRow>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({ id, children }: { id: string; children: React.ReactNode }) {
  const sortable = useSortable({ id });
  const style = { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition };

  return (
    <div ref={sortable.setNodeRef} style={style} className="relative pl-9">
      <button type="button" aria-label="Drag to reorder" className="absolute left-0 top-4 grid h-7 w-7 cursor-grab place-items-center rounded-xl border border-white/10 text-white/48 active:cursor-grabbing hover:bg-white/5" {...sortable.attributes} {...sortable.listeners}>
        <GripVertical size={16} />
      </button>
      {children}
    </div>
  );
}

// Uploads a safe image file through the existing protected media endpoint.
// Critical Image Display Fix: Uses object-contain with centered neutral letterboxing so images are NEVER cut off.
function ImageField({ label, value, onChange, onUploaded, secureHeaders, compact = false, allowVideo = false }: { label: string; value: string; onChange: (value: string) => void; onUploaded?: (value: string) => void; compact?: boolean; allowVideo?: boolean } & UploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const isBlobUrl = Boolean(value && (value.includes(".blob.vercel-storage.com") || value.includes("vercel-storage.com") || value.includes("/api/blob")));

  async function upload(file?: File) {
    if (!file) return;

    setUploading(true);
    setError("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), uploadTimeoutMs);

    try {
      const fileToUpload = await prepareFileForUpload(file);
      const formData = new FormData();
      formData.append("file", fileToUpload);
      if (value) {
        formData.append("replacesUrl", value);
      }

      const response = await fetch("/api/admin/upload", { method: "POST", headers: secureHeaders(), body: formData, signal: controller.signal });
      const result = (await response.json().catch(() => ({ message: "Upload failed. The server returned an invalid response." }))) as { url?: string; message?: string };

      if (!response.ok || !result.url) {
        setError(result.message || "Media upload failed.");
        return;
      }

      if (onUploaded) {
        onUploaded(result.url);
        return;
      }

      onChange(result.url);
    } catch (err) {
      setError(uploadFailureMessage(err));
    } finally {
      window.clearTimeout(timeout);
      setUploading(false);
    }
  }

  const videoPreview = allowVideo && /\.(mp4|webm)(\?.*)?$/i.test(value);

  return (
    <div className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-3.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-white/70">{label}</p>
        {value && isBlobUrl && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#16f2a4]/15 px-2 py-0.5 text-[10px] font-bold text-[#16f2a4]">
            <Cloud size={10} /> Cloudflare Storage
          </span>
        )}
      </div>

      {value ? (
        <div className="relative group overflow-hidden rounded-xl border border-white/10 bg-neutral-900/90 flex items-center justify-center p-2">
          {videoPreview ? (
            <video src={value} muted loop autoPlay playsInline className={`w-full object-contain ${compact ? "h-28" : "h-48"}`} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className={`max-h-full max-w-full object-contain object-center ${compact ? "h-28" : "h-48"}`} />
          )}

          <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-full bg-black/75 p-1.5 text-red-300 backdrop-blur-md hover:bg-red-500 hover:text-white"
              title="Remove image"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      ) : (
        <div className={`grid place-items-center rounded-xl border border-dashed border-white/15 text-sm text-white/35 ${compact ? "h-28" : "h-36"}`}>
          <ImagePlus size={20} />
        </div>
      )}

      <div className="flex items-center gap-2">
        <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-white/72 transition hover:border-[#16f2a4] hover:text-[#16f2a4]">
          {uploading ? <Loader2 className="animate-spin" size={15} /> : value ? <RefreshCw size={13} /> : <Upload size={14} />}
          {uploading ? "Uploading..." : value ? "Replace Media" : "Upload Media"}
          <input
            type="file"
            accept={allowVideo ? "video/mp4,video/webm" : "image/png,image/jpeg,image/webp,image/gif,image/svg+xml,application/pdf"}
            className="hidden"
            onChange={(event) => upload(event.target.files?.[0])}
          />
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-white/50 hover:border-red-400/40 hover:text-red-300"
          >
            Clear
          </button>
        )}
      </div>

      <Field label={allowVideo ? "Video URL" : "Media URL"} value={value} onChange={onChange} />
      {error ? <p className="text-xs font-semibold text-red-200">{error}</p> : null}
    </div>
  );
}

function EditorPanel({
  title,
  description,
  badge,
  onToggleCollapse,
  allCollapsed,
  children
}: {
  title: string;
  description: string;
  badge?: string;
  onToggleCollapse?: () => void;
  allCollapsed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black tracking-tight text-white">{title}</h2>
            {badge && (
              <span className="rounded-full bg-[#16f2a4]/15 px-3 py-0.5 text-xs font-bold text-[#16f2a4]">
                {badge}
              </span>
            )}
          </div>
          <p className="mt-1.5 max-w-3xl text-xs sm:text-sm text-white/50">{description}</p>
        </div>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/80 hover:bg-white/10 hover:text-white"
          >
            {allCollapsed ? "Expand All Cards" : "Collapse All Cards"}
          </button>
        )}
      </div>

      <div className="grid gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6 backdrop-blur-xl">
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, hint }: { label: string; value: string; onChange: (value: string) => void; hint?: string }) {
  return (
    <label className="grid gap-1.5 text-xs font-bold text-white/70">
      <span>{label} {hint ? <span className="font-medium text-white/35">({hint})</span> : null}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#16f2a4]"
      />
    </label>
  );
}

function NumberField({ label, value, onChange, min, max }: { label: string; value: number; onChange: (value: number) => void; min: number; max: number }) {
  return (
    <label className="grid gap-1.5 text-xs font-bold text-white/70">
      {label}
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Math.max(min, Math.min(max, Number(event.target.value) || min)))}
        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#16f2a4]"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, hint, compact = false }: { label: string; value: string; onChange: (value: string) => void; hint?: string; compact?: boolean }) {
  return (
    <label className="grid gap-1.5 text-xs font-bold text-white/70">
      <span>{label} {hint ? <span className="font-medium text-white/35">({hint})</span> : null}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full resize-y rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#16f2a4] ${compact ? "min-h-24" : "min-h-36"}`}
      />
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1.5 text-xs font-bold text-white/70">
      {label}
      <span className="flex overflow-hidden rounded-xl border border-white/10 bg-black/40">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-12 cursor-pointer border-0 bg-transparent p-1" />
        <input value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-xs text-white outline-none font-mono" />
      </span>
    </label>
  );
}

function SaveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-fit items-center gap-2 rounded-full bg-[#16f2a4] px-5 py-2.5 text-xs font-black text-black transition hover:bg-white active:scale-95 shadow-md shadow-[#16f2a4]/20"
    >
      <Save size={16} />
      {label}
    </button>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-fit items-center gap-2 rounded-full border border-[#16f2a4]/50 bg-[#16f2a4]/10 px-4 py-2 text-xs font-bold text-[#16f2a4] transition hover:bg-[#16f2a4] hover:text-black active:scale-95"
    >
      <Plus size={16} />
      {label}
    </button>
  );
}

function DeleteButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-400/25 text-red-200 transition hover:bg-red-400/15"
    >
      <Trash2 size={15} />
    </button>
  );
}

function removeItem(label: string, remove: () => void) {
  if (window.confirm(`Delete ${label}? Click Save Changes to apply.`)) {
    remove();
  }
}

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function splitCommaList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function splitLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}
