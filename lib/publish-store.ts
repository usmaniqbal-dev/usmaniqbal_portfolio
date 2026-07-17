import type { SiteContent, VersionHistory } from "@/types/site-content";

// Adds a capped version snapshot before major publish or restore operations.
export function addVersionSnapshot(content: SiteContent, label: string) {
  const snapshot: VersionHistory = {
    id: crypto.randomUUID(),
    snapshotData: content,
    savedAt: new Date().toISOString(),
    label,
    restoredAt: ""
  };

  return {
    ...content,
    builder: {
      ...content.builder,
      versionHistory: [snapshot, ...content.builder.versionHistory].slice(0, 10)
    }
  };
}

// Marks the current draft as published and mirrors active theme colors to the public portfolio theme.
export function publishContent(content: SiteContent) {
  const activeTheme = content.builder.themes.find((theme) => theme.isActive);
  const published = addVersionSnapshot(content, "Published version");

  return {
    ...published,
    theme: activeTheme
      ? {
          primary: activeTheme.primaryColor,
          secondary: activeTheme.secondaryColor,
          accent: activeTheme.accentColor,
          animations: content.theme.animations
        }
      : content.theme,
    builder: {
      ...published.builder,
      settings: {
        ...published.builder.settings,
        lastPublishedAt: new Date().toISOString()
      },
      pages: published.builder.pages.map((page) => ({ ...page, isPublished: true }))
    }
  };
}
