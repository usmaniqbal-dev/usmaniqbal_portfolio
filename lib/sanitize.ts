// Removes scriptable markup and unsafe attributes before custom HTML is saved.
export function sanitizeHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

// Converts unknown input into safe display text.
export function sanitizeText(value: unknown) {
  return String(value ?? "").replace(/[<>]/g, "").trim();
}

// Keeps color inputs constrained to CSS hex colors.
export function sanitizeHex(value: unknown, fallback: string) {
  const candidate = sanitizeText(value);
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(candidate) ? candidate : fallback;
}

// Restricts editor links to safe relative paths, anchors, email/phone links, and HTTP(S) URLs.
export function sanitizeUrl(value: unknown) {
  const candidate = sanitizeText(value);

  if (!candidate) {
    return "";
  }

  if (candidate.startsWith("/") || candidate.startsWith("#") || candidate.startsWith("mailto:") || candidate.startsWith("tel:")) {
    return candidate;
  }

  try {
    const parsed = new URL(candidate);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? candidate : "";
  } catch {
    return "";
  }
}
