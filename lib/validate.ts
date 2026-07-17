import type { BuilderBlock, BuilderTheme, BuilderTemplate, SiteContent } from "@/types/site-content";
import { sanitizeHex, sanitizeHtml, sanitizeText, sanitizeUrl } from "@/lib/sanitize";

// Validates and sanitizes the full content document before persistence.
export function validateSiteContent(content: SiteContent): SiteContent {
  return {
    ...content,
    home: {
      ...content.home,
      title: sanitizeText(content.home.title),
      subtitle: sanitizeText(content.home.subtitle),
      description: sanitizeText(content.home.description),
      heroImage: sanitizeUrl(content.home.heroImage),
      profileImage: sanitizeUrl(content.home.profileImage),
      heroTemplate: ["circle", "rounded", "glass", "floating", "layered"].includes(content.home.heroTemplate || "")
        ? content.home.heroTemplate
        : "layered",
      heroBackgroundType: ["color", "image", "video"].includes(content.home.heroBackgroundType || "")
        ? content.home.heroBackgroundType
        : undefined,
      heroBackgroundUrl: sanitizeUrl(content.home.heroBackgroundUrl || ""),
      heroBackgroundColor: sanitizeHex(content.home.heroBackgroundColor || "", "#020403"),
      primaryButton: {
        label: sanitizeText(content.home.primaryButton.label),
        href: sanitizeUrl(content.home.primaryButton.href)
      },
      secondaryButton: {
        label: sanitizeText(content.home.secondaryButton.label),
        href: sanitizeUrl(content.home.secondaryButton.href)
      }
    },
    about: {
      ...content.about,
      title: sanitizeText(content.about.title),
      description: sanitizeText(content.about.description),
      highlights: content.about.highlights.map(sanitizeText).filter(Boolean),
      image: sanitizeUrl(content.about.image || ""),
      experience: sanitizeText(content.about.experience || ""),
      statistics: (content.about.statistics || []).map((statistic) => ({
        ...statistic,
        id: sanitizeText(statistic.id),
        value: sanitizeText(statistic.value),
        label: sanitizeText(statistic.label)
      })),
      primaryButton: content.about.primaryButton
        ? { label: sanitizeText(content.about.primaryButton.label), href: sanitizeUrl(content.about.primaryButton.href) }
        : undefined,
      secondaryButton: content.about.secondaryButton
        ? { label: sanitizeText(content.about.secondaryButton.label), href: sanitizeUrl(content.about.secondaryButton.href) }
        : undefined
    },
    skills: content.skills.map((skill) => ({
      ...skill,
      name: sanitizeText(skill.name),
      category: sanitizeText(skill.category),
      level: Math.min(100, Math.max(0, Number(skill.level) || 0)),
      accent: sanitizeHex(skill.accent, "#16f2a4"),
      icon: sanitizeUrl(skill.icon || "")
    })),
    services: content.services.map((service) => ({
      ...service,
      title: sanitizeText(service.title),
      description: sanitizeText(service.description),
      icon: sanitizeUrl(service.icon || ""),
      image: sanitizeUrl(service.image || "")
    })),
    projects: content.projects.map((project) => ({
      ...project,
      title: sanitizeText(project.title),
      description: sanitizeText(project.description),
      tags: project.tags.map(sanitizeText).filter(Boolean),
      image: sanitizeUrl(project.image),
      url: sanitizeUrl(project.url),
      githubUrl: sanitizeUrl(project.githubUrl || "")
    })),
    contact: {
      ...content.contact,
      email: sanitizeText(content.contact.email),
      phone: sanitizeText(content.contact.phone),
      location: sanitizeText(content.contact.location),
      formHeadline: sanitizeText(content.contact.formHeadline),
      googleMapUrl: sanitizeUrl(content.contact.googleMapUrl || ""),
      formFields: (content.contact.formFields || []).map(sanitizeText).filter(Boolean)
    },
    socials: content.socials.map((social) => ({
      ...social,
      id: sanitizeText(social.id),
      platform: sanitizeText(social.platform),
      label: sanitizeText(social.label),
      url: sanitizeUrl(social.url)
    })),
    builder: {
      ...content.builder,
      themes: content.builder.themes.map(validateTheme),
      templates: content.builder.templates.map(validateTemplate),
      pages: content.builder.pages.map((page) => ({
        ...page,
        title: sanitizeText(page.title),
        slug: sanitizeText(page.slug) || "/",
        metaTitle: sanitizeText(page.metaTitle),
        metaDescription: sanitizeText(page.metaDescription),
        blocks: page.blocks.map(validateBlock),
        sections: page.sections.map((section) => ({
          ...section,
          name: sanitizeText(section.name),
          blocks: section.blocks.map(validateBlock)
        }))
      }))
    }
  };
}

// Validates theme color fields used by the global theme manager.
export function validateTheme(theme: BuilderTheme): BuilderTheme {
  return {
    ...theme,
    name: sanitizeText(theme.name) || "Untitled Theme",
    primaryColor: sanitizeHex(theme.primaryColor, "#16f2a4"),
    secondaryColor: sanitizeHex(theme.secondaryColor, "#22d3ee"),
    accentColor: sanitizeHex(theme.accentColor, "#a7f3d0"),
    backgroundColor: sanitizeHex(theme.backgroundColor, "#020403"),
    textColor: sanitizeHex(theme.textColor, "#f8fffb"),
    cardColor: sanitizeHex(theme.cardColor, "#151918"),
    buttonColor: sanitizeHex(theme.buttonColor, "#16f2a4")
  };
}

// Validates template metadata without changing stored section content.
export function validateTemplate(template: BuilderTemplate): BuilderTemplate {
  return {
    ...template,
    name: sanitizeText(template.name) || "Untitled Template",
    sectionsOrder: template.sectionsOrder.map(sanitizeText).filter(Boolean)
  };
}

// Validates block content and strips unsafe custom HTML.
export function validateBlock(block: BuilderBlock): BuilderBlock {
  return {
    ...block,
    content:
      block.type === "custom-html"
        ? { ...block.content, html: sanitizeHtml(String(block.content.html ?? "")) }
        : block.content
  };
}
