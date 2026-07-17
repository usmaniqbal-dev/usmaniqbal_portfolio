import type { BuilderBlock, BuilderTemplate, SiteContent } from "@/types/site-content";
import { defaultBuilder } from "@/lib/builder-defaults";
import { publishContent } from "@/lib/publish-store";
import { sanitizeText } from "@/lib/sanitize";

// Applies a template section order without deleting section content.
export function activateTemplate(content: SiteContent, templateId: string): SiteContent {
  return {
    ...content,
    builder: {
      ...content.builder,
      templates: content.builder.templates.map((template) => ({ ...template, isActive: template.id === templateId })),
      settings: { ...content.builder.settings, activeTemplate: templateId }
    }
  };
}

// Adds or updates a template in the content document.
export function upsertTemplate(content: SiteContent, template: BuilderTemplate): SiteContent {
  const exists = content.builder.templates.some((item) => item.id === template.id);
  const templates = exists ? content.builder.templates.map((item) => (item.id === template.id ? template : item)) : [template, ...content.builder.templates];
  return { ...content, builder: { ...content.builder, templates } };
}

// Reorders the current page sections from the visual builder.
export function reorderSections(content: SiteContent, sectionIds: string[]): SiteContent {
  const pages = content.builder.pages.map((page) => {
    if (page.id !== "home-page") {
      return page;
    }

    const ordered = sectionIds
      .map((id, order) => {
        const section = page.sections.find((item) => item.id === id);
        return section ? { ...section, order } : null;
      })
      .filter(Boolean) as typeof page.sections;

    const missing = page.sections.filter((section) => !sectionIds.includes(section.id));
    return { ...page, sections: [...ordered, ...missing].map((section, order) => ({ ...section, order })) };
  });

  return { ...content, builder: { ...content.builder, pages } };
}

// Adds a canvas block to the default home page.
export function addBlock(content: SiteContent, block: BuilderBlock): SiteContent {
  const pages = content.builder.pages.map((page) =>
    page.id === block.pageId ? { ...page, blocks: [...page.blocks, block] } : page
  );
  return { ...content, builder: { ...content.builder, pages } };
}

// Handles publish manager operations from one endpoint.
export function applyPublishAction(content: SiteContent, action: string): SiteContent {
  if (action === "publish") {
    return publishContent(content);
  }

  if (action === "reset-default") {
    return {
      ...content,
      builder: {
        ...defaultBuilder,
        settings: { ...defaultBuilder.settings, lastPublishedAt: content.builder.settings.lastPublishedAt }
      }
    };
  }

  return {
    ...content,
    builder: {
      ...content.builder,
      settings: { ...content.builder.settings, draftUpdatedAt: new Date().toISOString() }
    }
  };
}

// Creates deterministic local AI output when no provider key is configured.
export function createLocalAIResponse(type: string, prompt: string) {
  const cleanPrompt = sanitizeText(prompt);

  if (type === "theme") {
    return "Primary #16f2a4, Secondary #22d3ee, Background #020403, Text #f8fffb, Card #151918.";
  }

  if (type === "seo") {
    return `Meta title: ${cleanPrompt || "Professional Portfolio"} | CRM, Automation, and Web Solutions\nMeta description: A focused portfolio highlighting Salesforce CRM, automation, AI tools, and modern web projects.`;
  }

  if (type === "layout") {
    return "Recommended order: Hero, Featured Projects, Skills, Services, About, Testimonials, Contact. Use a strong CTA in the hero and proof-led project cards.";
  }

  return `Professional draft for ${type || "content"}:\n${cleanPrompt || "Share your core details, outcomes, tools, and audience."}\n\nRefined version: Clear, outcome-focused copy that explains the value you deliver, the systems you build, and why clients can trust your process.`;
}
