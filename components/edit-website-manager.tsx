"use client";

import { useState } from "react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  BriefcaseBusiness,
  CircleUserRound,
  ContactRound,
  GripVertical,
  ImagePlus,
  Layers3,
  Loader2,
  Plus,
  Save,
  Share2,
  Sparkles,
  Trash2,
  Upload,
  Wrench
} from "lucide-react";
import type { HeroTemplate, ProjectContent, ServiceContent, SiteContent, SkillContent, SocialContent, StatisticContent } from "@/types/site-content";

type EditWebsiteTab = "hero" | "projects" | "skills" | "about" | "services" | "contact" | "social";

type EditWebsiteManagerProps = {
  content: SiteContent;
  setContent: (content: SiteContent) => void;
  saveContent: (content: SiteContent) => Promise<void>;
  secureHeaders: (extra?: HeadersInit) => HeadersInit;
};

type IdentifiedItem = { id: string };

const heroTemplates: { id: HeroTemplate; name: string; description: string; previewClass: string }[] = [
  { id: "circle", name: "Circle Image", description: "A focused circular portrait treatment.", previewClass: "rounded-full" },
  { id: "rounded", name: "Rounded Rectangle", description: "A clean, framed professional photo.", previewClass: "rounded-[8px]" },
  { id: "glass", name: "Glass Card", description: "A portrait inside a soft glass treatment.", previewClass: "rounded-[8px] border-white/60 bg-white/20" },
  { id: "floating", name: "Floating Image", description: "A raised image with depth and space.", previewClass: "rounded-[8px] -rotate-3 shadow-xl" },
  { id: "layered", name: "Modern Layered Design", description: "The current NURAXTECH hero composition.", previewClass: "rounded-[8px] shadow-lg" }
];

const tabs: { id: EditWebsiteTab; label: string; icon: typeof Sparkles }[] = [
  { id: "hero", label: "Hero Section", icon: Sparkles },
  { id: "projects", label: "Projects", icon: BriefcaseBusiness },
  { id: "skills", label: "Technical Skills", icon: Wrench },
  { id: "about", label: "About Section", icon: CircleUserRound },
  { id: "services", label: "Services", icon: Layers3 },
  { id: "contact", label: "Contact Page", icon: ContactRound },
  { id: "social", label: "Social Media", icon: Share2 }
];

// Provides the focused admin module for the editable public portfolio sections.
export default function EditWebsiteManager({ content, setContent, saveContent, secureHeaders }: EditWebsiteManagerProps) {
  const [activeTab, setActiveTab] = useState<EditWebsiteTab>("hero");

  // Stores an edited content document locally, then persists it through the protected API.
  async function commit(nextContent: SiteContent) {
    setContent(nextContent);
    await saveContent(nextContent);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[230px_minmax(0,1fr)]">
      <aside className="h-fit rounded-[8px] border border-white/10 bg-white/[0.04] p-3">
        <p className="px-3 py-2 text-sm font-black uppercase text-white/42">Content Manager</p>
        <div className="grid gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 rounded-[8px] px-3 py-3 text-left font-bold transition ${
                  active ? "bg-[#16f2a4] text-black" : "text-white/65 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </aside>

      <section className="min-w-0">
        {activeTab === "hero" ? <HeroEditor content={content} setContent={setContent} commit={commit} secureHeaders={secureHeaders} /> : null}
        {activeTab === "projects" ? <ProjectsEditor content={content} setContent={setContent} commit={commit} secureHeaders={secureHeaders} /> : null}
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

  // Saves a newly uploaded hero image immediately so the public profile updates without a second click.
  function saveHeroImage(value: string) {
    const nextContent = { ...content, home: { ...content.home, profileImage: value, heroImage: value } };
    setContent(nextContent);
    void commit(nextContent);
  }

  // Saves newly uploaded hero background media immediately after the server returns its public URL.
  function saveHeroBackground(value: string) {
    const nextContent = { ...content, home: { ...content.home, heroBackgroundUrl: value } };
    setContent(nextContent);
    void commit(nextContent);
  }

  return (
    <EditorPanel title="Hero Section" description="Update the first impression of your portfolio and choose how your image is presented.">
      <div className="grid gap-5 lg:grid-cols-2">
        <Field label="Heading" value={content.home.title} onChange={(value) => update({ ...content.home, title: value })} />
        <Field label="Sub Heading" value={content.home.subtitle} onChange={(value) => update({ ...content.home, subtitle: value })} />
      </div>
      <TextArea label="Description" value={content.home.description} onChange={(value) => update({ ...content.home, description: value })} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Field label="Primary Button Text" value={content.home.primaryButton.label} onChange={(value) => update({ ...content.home, primaryButton: { ...content.home.primaryButton, label: value } })} />
        <Field label="Primary Button Link" value={content.home.primaryButton.href} onChange={(value) => update({ ...content.home, primaryButton: { ...content.home.primaryButton, href: value } })} />
        <Field label="Secondary Button Text" value={content.home.secondaryButton.label} onChange={(value) => update({ ...content.home, secondaryButton: { ...content.home.secondaryButton, label: value } })} />
        <Field label="Secondary Button Link" value={content.home.secondaryButton.href} onChange={(value) => update({ ...content.home, secondaryButton: { ...content.home.secondaryButton, href: value } })} />
      </div>
      <ImageField label="Hero / Profile Image" value={content.home.profileImage} onChange={(value) => update({ ...content.home, profileImage: value, heroImage: value })} onUploaded={saveHeroImage} secureHeaders={secureHeaders} />
      <div className="grid gap-4 rounded-[8px] border border-white/10 bg-black/20 p-4">
        <div>
          <p className="font-black">Hero Background</p>
          <p className="mt-1 text-sm text-white/48">Use a color, a background image, or a muted looping video. The default background remains unchanged until you select an option.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["none", "color", "image", "video"].map((type) => (
            <button key={type} type="button" onClick={() => update({ ...content.home, heroBackgroundType: type === "none" ? undefined : type as "color" | "image" | "video", heroBackgroundUrl: type === "none" ? "" : content.home.heroBackgroundUrl })} className={`rounded-full border px-4 py-2 text-sm font-black transition ${backgroundType === type ? "border-[#16f2a4] bg-[#16f2a4] text-black" : "border-white/10 text-white/65 hover:border-[#16f2a4]"}`}>{type === "none" ? "Default" : `${type[0].toUpperCase()}${type.slice(1)}`}</button>
          ))}
        </div>
        {backgroundType === "color" ? <ColorField label="Background Color" value={content.home.heroBackgroundColor || "#020403"} onChange={(value) => update({ ...content.home, heroBackgroundColor: value })} /> : null}
        {backgroundType === "image" || backgroundType === "video" ? <ImageField label={backgroundType === "video" ? "Background Video" : "Background Image"} value={content.home.heroBackgroundUrl || ""} onChange={(value) => update({ ...content.home, heroBackgroundUrl: value })} onUploaded={saveHeroBackground} secureHeaders={secureHeaders} allowVideo={backgroundType === "video"} /> : null}
      </div>
      <div>
        <div className="mb-3">
          <p className="font-black">Hero Template</p>
          <p className="mt-1 text-sm text-white/48">Select a template, then save to apply it to the public portfolio.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {heroTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => update({ ...content.home, heroTemplate: template.id })}
              className={`rounded-[8px] border p-3 text-left transition ${
                heroTemplate === template.id ? "border-[#16f2a4] bg-[#16f2a4]/10" : "border-white/10 bg-black/25 hover:border-white/30"
              }`}
            >
              <span className={`mb-3 block aspect-[4/3] border border-white/15 bg-gradient-to-br from-[#16f2a4]/70 via-[#22d3ee]/45 to-black ${template.previewClass}`} />
              <span className="block font-black">{template.name}</span>
              <span className="mt-1 block text-xs leading-5 text-white/48">{template.description}</span>
            </button>
          ))}
        </div>
      </div>
      <SaveButton label="Save Hero Changes" onClick={() => commit(content)} />
    </EditorPanel>
  );
}

// Manages project CRUD, media uploads, technology tags, and drag ordering.
function ProjectsEditor({ content, setContent, commit, secureHeaders }: EditorProps & UploadProps) {
  const updateProject = (id: string, patch: Partial<ProjectContent>) => {
    setContent({ ...content, projects: content.projects.map((project) => (project.id === id ? { ...project, ...patch } : project)) });
  };

  return (
    <EditorPanel title="Projects" description="Add, edit, remove, upload, and drag projects into the order you want visitors to see.">
      <ReorderableList
        items={content.projects}
        onReorder={(projects) => setContent({ ...content, projects })}
        renderItem={(project) => (
          <ProjectCard project={project} onChange={(patch) => updateProject(project.id, patch)} onDelete={() => removeItem("this project", () => setContent({ ...content, projects: content.projects.filter((item) => item.id !== project.id) }))} secureHeaders={secureHeaders} />
        )}
      />
      <div className="flex flex-wrap gap-3">
        <AddButton
          label="Add Project"
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

// Renders the editable fields for a single project record.
function ProjectCard({ project, onChange, onDelete, secureHeaders }: { project: ProjectContent; onChange: (patch: Partial<ProjectContent>) => void; onDelete: () => void } & UploadProps) {
  return (
    <div className="grid gap-4 rounded-[8px] border border-white/10 bg-black/25 p-4 xl:grid-cols-[1fr_1fr_300px]">
      <div className="grid gap-4">
        <Field label="Project Title" value={project.title} onChange={(value) => onChange({ title: value })} />
        <Field label="Live Link" value={project.url} onChange={(value) => onChange({ url: value })} />
        <Field label="GitHub Link" value={project.githubUrl || ""} onChange={(value) => onChange({ githubUrl: value })} />
      </div>
      <div className="grid gap-4">
        <TextArea label="Description" value={project.description} onChange={(value) => onChange({ description: value })} compact />
        <Field label="Technologies" hint="Comma separated" value={project.tags.join(", ")} onChange={(value) => onChange({ tags: splitCommaList(value) })} />
        <DeleteButton label="Delete Project" onClick={onDelete} />
      </div>
      <ImageField label="Project Image" value={project.image} onChange={(value) => onChange({ image: value })} secureHeaders={secureHeaders} />
    </div>
  );
}

// Manages skills with icon upload, percentage controls, and drag ordering.
function SkillsEditor({ content, setContent, commit, secureHeaders }: EditorProps & UploadProps) {
  const updateSkill = (id: string, patch: Partial<SkillContent>) => {
    setContent({ ...content, skills: content.skills.map((skill) => (skill.id === id ? { ...skill, ...patch } : skill)) });
  };

  return (
    <EditorPanel title="Technical Skills" description="Manage your skills, categories, icons, percentages, colors, and display order.">
      <ReorderableList
        items={content.skills}
        onReorder={(skills) => setContent({ ...content, skills })}
        renderItem={(skill) => (
          <div className="grid gap-4 rounded-[8px] border border-white/10 bg-black/25 p-4 xl:grid-cols-[1fr_1fr_160px_220px]">
            <Field label="Skill Name" value={skill.name} onChange={(value) => updateSkill(skill.id, { name: value })} />
            <Field label="Skill Category" value={skill.category} onChange={(value) => updateSkill(skill.id, { category: value })} />
            <NumberField label="Skill Percentage" value={skill.level} min={0} max={100} onChange={(value) => updateSkill(skill.id, { level: value })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField label="Accent Color" value={skill.accent} onChange={(value) => updateSkill(skill.id, { accent: value })} />
              <ImageField label="Skill Icon" value={skill.icon || ""} onChange={(value) => updateSkill(skill.id, { icon: value })} secureHeaders={secureHeaders} compact />
            </div>
            <DeleteButton label="Delete Skill" onClick={() => removeItem("this skill", () => setContent({ ...content, skills: content.skills.filter((item) => item.id !== skill.id) }))} />
          </div>
        )}
      />
      <div className="flex flex-wrap gap-3">
        <AddButton label="Add Skill" onClick={() => setContent({ ...content, skills: [...content.skills, { id: createId("skill"), name: "New Skill", category: "Category", level: 80, accent: "#16f2a4", icon: "" }] })} />
        <SaveButton label="Save Skills" onClick={() => commit(content)} />
      </div>
    </EditorPanel>
  );
}

// Edits the About text, image, experience, statistics, and section-specific buttons.
function AboutEditor({ content, setContent, commit, secureHeaders }: EditorProps & UploadProps) {
  const about = content.about;
  const update = (patch: Partial<SiteContent["about"]>) => setContent({ ...content, about: { ...about, ...patch } });
  const statistics = about.statistics || [];

  return (
    <EditorPanel title="About Section" description="Update your story, image, experience statement, proof statistics, and calls to action.">
      <Field label="Title" value={about.title} onChange={(value) => update({ title: value })} />
      <TextArea label="Description" value={about.description} onChange={(value) => update({ description: value })} />
      <Field label="Experience" value={about.experience || ""} onChange={(value) => update({ experience: value })} />
      <TextArea label="Highlights" hint="One item per line" value={about.highlights.join("\n")} onChange={(value) => update({ highlights: splitLines(value) })} />
      <ImageField label="About Image" value={about.image || ""} onChange={(value) => update({ image: value })} secureHeaders={secureHeaders} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Primary Button Text" value={about.primaryButton?.label || ""} onChange={(value) => update({ primaryButton: { label: value, href: about.primaryButton?.href || "#projects" } })} />
        <Field label="Primary Button Link" value={about.primaryButton?.href || "#projects"} onChange={(value) => update({ primaryButton: { label: about.primaryButton?.label || "View Projects", href: value } })} />
        <Field label="Secondary Button Text" value={about.secondaryButton?.label || ""} onChange={(value) => update({ secondaryButton: { label: value, href: about.secondaryButton?.href || "#contact" } })} />
        <Field label="Secondary Button Link" value={about.secondaryButton?.href || "#contact"} onChange={(value) => update({ secondaryButton: { label: about.secondaryButton?.label || "Contact Me", href: value } })} />
      </div>
      <div className="grid gap-3">
        <p className="font-black">Statistics</p>
        {statistics.map((statistic) => (
          <StatisticRow key={statistic.id} statistic={statistic} onChange={(patch) => update({ statistics: statistics.map((item) => (item.id === statistic.id ? { ...item, ...patch } : item)) })} onDelete={() => removeItem("this statistic", () => update({ statistics: statistics.filter((item) => item.id !== statistic.id) }))} />
        ))}
        <AddButton label="Add Statistic" onClick={() => update({ statistics: [...statistics, { id: createId("stat"), value: "0", label: "New Statistic" }] })} />
      </div>
      <SaveButton label="Save About Changes" onClick={() => commit(content)} />
    </EditorPanel>
  );
}

// Renders one editable About statistic record.
function StatisticRow({ statistic, onChange, onDelete }: { statistic: StatisticContent; onChange: (patch: Partial<StatisticContent>) => void; onDelete: () => void }) {
  return (
    <div className="grid gap-3 rounded-[8px] border border-white/10 bg-black/25 p-3 sm:grid-cols-[160px_1fr_auto]">
      <Field label="Value" value={statistic.value} onChange={(value) => onChange({ value })} />
      <Field label="Label" value={statistic.label} onChange={(value) => onChange({ label: value })} />
      <DeleteButton label="Delete Statistic" onClick={onDelete} />
    </div>
  );
}

// Manages service CRUD, media, and ordering without changing the existing public layout.
function ServicesEditor({ content, setContent, commit, secureHeaders }: EditorProps & UploadProps) {
  const updateService = (id: string, patch: Partial<ServiceContent>) => {
    setContent({ ...content, services: content.services.map((service) => (service.id === id ? { ...service, ...patch } : service)) });
  };

  return (
    <EditorPanel title="Services" description="Create, edit, remove, upload, and reorder service cards.">
      <ReorderableList
        items={content.services}
        onReorder={(services) => setContent({ ...content, services })}
        renderItem={(service) => (
          <div className="grid gap-4 rounded-[8px] border border-white/10 bg-black/25 p-4 xl:grid-cols-[1fr_1.35fr_360px]">
            <Field label="Service Title" value={service.title} onChange={(value) => updateService(service.id, { title: value })} />
            <TextArea label="Description" value={service.description} onChange={(value) => updateService(service.id, { description: value })} compact />
            <div className="grid gap-4 sm:grid-cols-2">
              <ImageField label="Service Icon" value={service.icon || ""} onChange={(value) => updateService(service.id, { icon: value })} secureHeaders={secureHeaders} compact />
              <ImageField label="Service Image" value={service.image || ""} onChange={(value) => updateService(service.id, { image: value })} secureHeaders={secureHeaders} compact />
            </div>
            <DeleteButton label="Delete Service" onClick={() => removeItem("this service", () => setContent({ ...content, services: content.services.filter((item) => item.id !== service.id) }))} />
          </div>
        )}
      />
      <div className="flex flex-wrap gap-3">
        <AddButton label="Add Service" onClick={() => setContent({ ...content, services: [...content.services, { id: createId("service"), title: "New Service", description: "Describe this service.", icon: "", image: "" }] })} />
        <SaveButton label="Save Services" onClick={() => commit(content)} />
      </div>
    </EditorPanel>
  );
}

// Edits contact details, map URL, heading, description, and configurable form fields.
function ContactEditor({ content, setContent, commit }: EditorProps) {
  const contact = content.contact;
  const fields = contact.formFields || ["Name", "Email", "Project Type", "Message"];
  const update = (patch: Partial<SiteContent["contact"]>) => setContent({ ...content, contact: { ...contact, ...patch } });

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
        <p className="font-black">Contact Form Fields</p>
        {fields.map((field, index) => (
          <div key={`${field}-${index}`} className="flex gap-3 rounded-[8px] border border-white/10 bg-black/25 p-3">
            <input value={field} onChange={(event) => update({ formFields: fields.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)) })} className="min-w-0 flex-1 rounded-[8px] border border-white/10 bg-black/35 px-4 py-3 text-white outline-none focus:border-[#16f2a4]" />
            <DeleteButton label="Remove Field" onClick={() => removeItem("this form field", () => update({ formFields: fields.filter((_, itemIndex) => itemIndex !== index) }))} />
          </div>
        ))}
        <AddButton label="Add Form Field" onClick={() => update({ formFields: [...fields, "New Field"] })} />
      </div>
      <SaveButton label="Save Contact Changes" onClick={() => commit(content)} />
    </EditorPanel>
  );
}

// Maintains all public social URLs, including common platforms and direct email links.
function SocialEditor({ content, setContent, commit }: EditorProps) {
  const updateSocial = (id: string, patch: Partial<SocialContent>) => {
    setContent({ ...content, socials: content.socials.map((social) => (social.id === id ? { ...social, ...patch } : social)) });
  };

  return (
    <EditorPanel title="Social Media" description="Set every public social URL in one place. The website icons use these saved links automatically.">
      <div className="grid gap-4">
        {content.socials.map((social) => (
          <div key={social.id} className="grid gap-4 rounded-[8px] border border-white/10 bg-black/25 p-4 lg:grid-cols-[0.75fr_0.75fr_1.5fr_auto]">
            <Field label="Platform" value={social.platform} onChange={(value) => updateSocial(social.id, { platform: value })} />
            <Field label="Label" value={social.label} onChange={(value) => updateSocial(social.id, { label: value })} />
            <Field label="URL" value={social.url} onChange={(value) => updateSocial(social.id, { url: value })} />
            <DeleteButton label="Delete Social Link" onClick={() => removeItem("this social link", () => setContent({ ...content, socials: content.socials.filter((item) => item.id !== social.id) }))} />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <AddButton label="Add Social Link" onClick={() => setContent({ ...content, socials: [...content.socials, { id: createId("social"), platform: "Facebook", label: "Facebook", url: "" }] })} />
        <SaveButton label="Save Social Links" onClick={() => commit(content)} />
      </div>
      <p className="text-sm text-white/48">Supported platforms include Facebook, Instagram, LinkedIn, GitHub, X (Twitter), YouTube, WhatsApp, Email, and any custom link.</p>
    </EditorPanel>
  );
}

type EditorProps = Pick<EditWebsiteManagerProps, "content" | "setContent"> & { commit: (content: SiteContent) => Promise<void> };
type UploadProps = Pick<EditWebsiteManagerProps, "secureHeaders">;

// Provides a reusable sortable list used for projects, skills, and services.
function ReorderableList<T extends IdentifiedItem>({ items, onReorder, renderItem }: { items: T[]; onReorder: (items: T[]) => void; renderItem: (item: T) => React.ReactNode }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 7 } }));

  // Persists the visual list order in local editor state after a successful drag.
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

// Adds a drag handle around an editor row without interfering with its form controls.
function SortableRow({ id, children }: { id: string; children: React.ReactNode }) {
  const sortable = useSortable({ id });
  const style = { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition };

  return (
    <div ref={sortable.setNodeRef} style={style} className="relative pl-9">
      <button type="button" aria-label="Drag to reorder" className="absolute left-0 top-4 grid h-7 w-7 cursor-grab place-items-center rounded-[8px] border border-white/10 text-white/48 active:cursor-grabbing" {...sortable.attributes} {...sortable.listeners}>
        <GripVertical size={17} />
      </button>
      {children}
    </div>
  );
}

// Uploads a safe image file through the existing protected media endpoint.
function ImageField({ label, value, onChange, onUploaded, secureHeaders, compact = false, allowVideo = false }: { label: string; value: string; onChange: (value: string) => void; onUploaded?: (value: string) => void; compact?: boolean; allowVideo?: boolean } & UploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Saves a selected local image and returns the resulting public URL to the parent editor.
  async function upload(file?: File) {
    if (!file) {
      return;
    }

    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", headers: secureHeaders(), body: formData });
    const result = (await response.json()) as { url?: string; message?: string };
    setUploading(false);

    if (!response.ok || !result.url) {
      setError(result.message || "Media upload failed.");
      return;
    }

    if (onUploaded) {
      onUploaded(result.url);
      return;
    }

    onChange(result.url);
  }

  const videoPreview = allowVideo && /\.(mp4|webm)(\?.*)?$/i.test(value);

  return (
    <div className="grid gap-3 rounded-[8px] border border-white/10 bg-black/20 p-3">
      <p className="text-sm font-bold text-white/70">{label}</p>
      {value ? videoPreview ? <video src={value} muted loop autoPlay playsInline className={`w-full rounded-[8px] border border-white/10 object-cover ${compact ? "aspect-square" : "aspect-[16/9]"}`} /> : <img src={value} alt="" className={`w-full rounded-[8px] border border-white/10 object-cover ${compact ? "aspect-square" : "aspect-[16/9]"}`} /> : <div className={`grid place-items-center rounded-[8px] border border-dashed border-white/15 text-sm text-white/35 ${compact ? "aspect-square" : "aspect-[16/9]"}`}><ImagePlus size={20} /></div>}
      <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-white/72 transition hover:border-[#16f2a4] hover:text-[#16f2a4]">
        {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
        Upload
        <input type="file" accept={allowVideo ? "video/mp4,video/webm" : "image/png,image/jpeg,image/webp,image/gif,image/svg+xml"} className="hidden" onChange={(event) => upload(event.target.files?.[0])} />
      </label>
      <Field label={allowVideo ? "Video URL" : "Image URL"} value={value} onChange={onChange} />
      {error ? <p className="text-xs font-semibold text-red-200">{error}</p> : null}
    </div>
  );
}

// Renders the standard content panel heading and body frame.
function EditorPanel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-3xl font-black">{title}</h2>
        <p className="mt-2 max-w-3xl text-white/52">{description}</p>
      </div>
      <div className="grid gap-5 rounded-[8px] border border-white/10 bg-white/[0.035] p-4 sm:p-6">{children}</div>
    </div>
  );
}

// Renders a validated text input with an optional explanatory hint.
function Field({ label, value, onChange, hint }: { label: string; value: string; onChange: (value: string) => void; hint?: string }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-white/70">
      <span>{label} {hint ? <span className="font-medium text-white/38">{hint}</span> : null}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-[8px] border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-[#16f2a4]" />
    </label>
  );
}

// Renders a numeric input constrained to the supplied min/max range.
function NumberField({ label, value, onChange, min, max }: { label: string; value: number; onChange: (value: number) => void; min: number; max: number }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-white/70">
      {label}
      <input type="number" min={min} max={max} value={value} onChange={(event) => onChange(Math.max(min, Math.min(max, Number(event.target.value) || min)))} className="w-full rounded-[8px] border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-[#16f2a4]" />
    </label>
  );
}

// Renders a multiline field for long-form content and item lists.
function TextArea({ label, value, onChange, hint, compact = false }: { label: string; value: string; onChange: (value: string) => void; hint?: string; compact?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-white/70">
      <span>{label} {hint ? <span className="font-medium text-white/38">{hint}</span> : null}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className={`w-full resize-y rounded-[8px] border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-[#16f2a4] ${compact ? "min-h-24" : "min-h-36"}`} />
    </label>
  );
}

// Renders a color swatch and matching editable hexadecimal input.
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

// Renders a positive save action for an editor section.
function SaveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="inline-flex w-fit items-center gap-2 rounded-full bg-[#16f2a4] px-5 py-3 font-black text-black transition hover:bg-white"><Save size={18} />{label}</button>;
}

// Renders a standardized add action.
function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="inline-flex w-fit items-center gap-2 rounded-full border border-[#16f2a4]/45 px-5 py-3 font-black text-[#16f2a4] transition hover:bg-[#16f2a4] hover:text-black"><Plus size={18} />{label}</button>;
}

// Renders a destructive action that is paired with a browser confirmation step.
function DeleteButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" aria-label={label} title={label} onClick={onClick} className="inline-flex h-11 w-11 items-center justify-center self-end rounded-full border border-red-300/30 text-red-100 transition hover:bg-red-400/10"><Trash2 size={17} /></button>;
}

// Confirms list removals before altering the current local content document.
function removeItem(label: string, remove: () => void) {
  if (window.confirm(`Delete ${label}? This change is saved when you click the section save button.`)) {
    remove();
  }
}

// Produces a client-side unique ID for newly created editable records.
function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

// Parses a comma-separated technologies list into clean tags.
function splitCommaList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

// Parses line-based content such as highlights into non-empty values.
function splitLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}
