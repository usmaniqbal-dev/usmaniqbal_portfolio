import sanitizeHtmlLibrary from "sanitize-html";

// Removes scriptable markup and unsafe attributes before custom HTML is saved.
export function sanitizeHtml(value: string) {
  return sanitizeHtmlLibrary(value, {
    allowedTags: [
      "a",
      "blockquote",
      "br",
      "code",
      "em",
      "h2",
      "h3",
      "li",
      "ol",
      "p",
      "pre",
      "strong",
      "ul"
    ],
    allowedAttributes: {
      a: ["href", "rel", "target"]
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    enforceHtmlBoundary: true
  });
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
