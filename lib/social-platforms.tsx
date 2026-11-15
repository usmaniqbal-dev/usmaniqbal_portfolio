import React from "react";

export type SocialPlatformId =
  | "medium"
  | "blogger"
  | "bluesky"
  | "instagram"
  | "twitter"
  | "contra"
  | "facebook"
  | "tiktok"
  | "fiverr"
  | "threads"
  | "linkedin"
  | "github"
  | "youtube"
  | "whatsapp"
  | "email"
  | "other";

export type SocialPlatformConfig = {
  id: SocialPlatformId;
  name: string;
  brandColor: string;
  gradient?: string;
  badgeBg: string;
  badgeText: string;
  domainMatch: string[];
  renderIcon: (props: { size?: number; className?: string }) => React.ReactElement;
};

// 1. Medium: Official Wordmark / 3-ellipses logo
function MediumIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
    </svg>
  );
}

// 2. Blogger: Official orange rounded mark with white stylized 'B'
function BloggerIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.5 3h-15A1.5 1.5 0 0 0 3 4.5v15A1.5 1.5 0 0 0 4.5 21h15a1.5 1.5 0 0 0 1.5-1.5v-15A1.5 1.5 0 0 0 19.5 3zM14.25 9c.69 0 1.25.56 1.25 1.25 0 .47-.26.88-.65 1.09.6.26 1.02.85 1.02 1.54 0 .9-.73 1.62-1.62 1.62H8.75V7.5h5.5c.83 0 1.5.67 1.5 1.5v.5h-1.5zm-4-1.5v2.25h3.75c.41 0 .75-.34.75-.75 0-.41-.34-.75-.75-.75H10.25zm0 3.75v2.25h4c.41 0 .75-.34.75-.75 0-.41-.34-.75-.75-.75h-4z" />
    </svg>
  );
}

// 3. Bluesky: Official blue butterfly logo
function BlueskyIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566 1.01 1.5 1.622 1.5 4.316c0 2.695 1.536 8.528 2.5 10.28 1.488 2.704 4.148 3.125 5.5.945 1.352 2.18 4.012 1.76 5.5-.945.964-1.752 2.5-7.585 2.5-10.28 0-2.694-1.066-3.306-3.702-1.51C16.046 4.747 13.087 8.686 12 10.8z" />
    </svg>
  );
}

// 4. Instagram: Authentic official gradient with camera glyph
function InstagramIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  const gradientId = "ig-grad-social";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={gradientId} cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill={`url(#${gradientId})`} />
      <path
        d="M12 7.1A4.9 4.9 0 1 0 16.9 12 4.91 4.91 0 0 0 12 7.1zm0 8.08A3.18 3.18 0 1 1 15.18 12 3.19 3.19 0 0 1 12 15.18zm5.27-8.49a1.15 1.15 0 1 1-1.15-1.15 1.15 1.15 0 0 1 1.15 1.15z"
        fill="#ffffff"
      />
      <path
        d="M17.3 3H6.7A3.7 3.7 0 0 0 3 6.7v10.6A3.7 3.7 0 0 0 6.7 21h10.6a3.7 3.7 0 0 0 3.7-3.7V6.7A3.7 3.7 0 0 0 17.3 3zm2 14.3a2 2 0 0 1-2 2H6.7a2 2 0 0 1-2-2V6.7a2 2 0 0 1 2-2h10.6a2 2 0 0 1 2 2z"
        fill="#ffffff"
      />
    </svg>
  );
}

// 5. Twitter / X: Official brand glyph
function TwitterXIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// 6. Contra: Official Contra stylized logo mark
function ContraIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.89 13.9a5.5 5.5 0 0 1-7.78 0 5.5 5.5 0 0 1 0-7.78 5.5 5.5 0 0 1 7.78 0l-1.42 1.42a3.5 3.5 0 0 0-4.94 0 3.5 3.5 0 0 0 0 4.94 3.5 3.5 0 0 0 4.94 0l1.42 1.42z" />
    </svg>
  );
}

// 7. Facebook: Official Facebook blue roundel with white 'f'
function FacebookIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#1877F2" />
      <path
        d="M13.8 8h1.8V5.1c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5V12H6v3.2h2.6V23h3.5v-7.8h2.8l.4-3.2h-3.2V9.8c0-.9.2-1.8 1.7-1.8z"
        fill="#ffffff"
      />
    </svg>
  );
}

// 8. TikTok: Authentic official TikTok musical note with cyan and red accents
function TikTokIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.066-.098a2.896 2.896 0 0 1 2.37-4.541c.42 0 .822.09 1.187.251V9.52a6.34 6.34 0 0 0-1.187-.113 6.341 6.341 0 1 0 6.342 6.341V8.653a8.199 8.199 0 0 0 4.77 1.524v-3.49z"
        fill="#25F4EE"
        transform="translate(-0.8, -0.6)"
      />
      <path
        d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.066-.098a2.896 2.896 0 0 1 2.37-4.541c.42 0 .822.09 1.187.251V9.52a6.34 6.34 0 0 0-1.187-.113 6.341 6.341 0 1 0 6.342 6.341V8.653a8.199 8.199 0 0 0 4.77 1.524v-3.49z"
        fill="#FE2C55"
        transform="translate(0.8, 0.6)"
      />
      <path
        d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.066-.098a2.896 2.896 0 0 1 2.37-4.541c.42 0 .822.09 1.187.251V9.52a6.34 6.34 0 0 0-1.187-.113 6.341 6.341 0 1 0 6.342 6.341V8.653a8.199 8.199 0 0 0 4.77 1.524v-3.49z"
        fill="#ffffff"
      />
    </svg>
  );
}

// 9. Fiverr: Exact 3D user-provided icon with high-depth drop shadow
function FiverrIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/social/fiverr.png"
      alt="Fiverr"
      width={size}
      height={size}
      className={`rounded-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] transition-transform duration-300 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}

// 10. Threads: Exact 3D user-provided icon with high-depth drop shadow
function ThreadsIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/social/threads.png"
      alt="Threads"
      width={size}
      height={size}
      className={`rounded-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] transition-transform duration-300 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}

// 11. LinkedIn: Official professional brand logo
function LinkedInIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.778-.773 1.778-1.729V1.73C24 .774 23.205 0 22.225 0z" />
    </svg>
  );
}

// 12. GitHub: Official Octocat / Git brand glyph
function GitHubIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

// 13. YouTube: Official play button glyph
function YouTubeIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

// 14. WhatsApp: Official green bubble mark
function WhatsAppIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.476-.15-.676.15-.2.301-.776.978-.952 1.179-.175.2-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.493-.895-.799-1.5-1.786-1.676-2.087-.175-.301-.019-.464.132-.614.135-.135.301-.351.451-.527.151-.175.201-.301.301-.501.101-.2.05-.376-.025-.527-.075-.15-.677-1.631-.927-2.233-.244-.587-.492-.507-.677-.516l-.577-.01c-.2 0-.526.075-.802.376-.276.301-1.053 1.029-1.053 2.509 0 1.48 1.078 2.909 1.229 3.11.15.2 2.121 3.238 5.138 4.542.718.31 1.278.496 1.715.635.722.23 1.378.197 1.897.12.578-.087 1.78-.727 2.031-1.43.251-.702.251-1.304.175-1.43-.075-.125-.276-.201-.577-.351zM12.04 2C6.536 2 2.06 6.476 2.06 11.98c0 1.897.534 3.673 1.464 5.203L2.001 22.5l5.474-1.435a9.92 9.92 0 0 0 4.565 1.117h.004c5.503 0 9.98-4.477 9.98-9.982A9.94 9.94 0 0 0 12.04 2z" />
    </svg>
  );
}

// 15. Email: Official mail glyph
function EmailIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

// Generic link icon
function DefaultLinkIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

// Complete Catalog of Supported Platforms with Authentic Brand Colors
export const SOCIAL_PLATFORMS: SocialPlatformConfig[] = [
  {
    id: "medium",
    name: "Medium",
    brandColor: "#000000",
    badgeBg: "#12100E",
    badgeText: "#FFFFFF",
    domainMatch: ["medium.com"],
    renderIcon: (props) => <MediumIcon {...props} />
  },
  {
    id: "blogger",
    name: "Blogger",
    brandColor: "#F57D00",
    badgeBg: "#F57D00",
    badgeText: "#FFFFFF",
    domainMatch: ["blogger.com", "blogspot.com"],
    renderIcon: (props) => <BloggerIcon {...props} />
  },
  {
    id: "bluesky",
    name: "Bluesky",
    brandColor: "#1185FE",
    badgeBg: "#1185FE",
    badgeText: "#FFFFFF",
    domainMatch: ["bsky.app", "bsky.social"],
    renderIcon: (props) => <BlueskyIcon {...props} />
  },
  {
    id: "instagram",
    name: "Instagram",
    brandColor: "#E4405F",
    gradient: "linear-gradient(45deg, #405DE6 0%, #833AB4 25%, #C13584 50%, #E1306C 75%, #FCAF45 100%)",
    badgeBg: "linear-gradient(45deg, #405DE6 0%, #833AB4 25%, #C13584 50%, #E1306C 75%, #FCAF45 100%)",
    badgeText: "#FFFFFF",
    domainMatch: ["instagram.com", "instagr.am"],
    renderIcon: (props) => <InstagramIcon {...props} />
  },
  {
    id: "twitter",
    name: "Twitter / X",
    brandColor: "#000000",
    badgeBg: "#000000",
    badgeText: "#FFFFFF",
    domainMatch: ["x.com", "twitter.com"],
    renderIcon: (props) => <TwitterXIcon {...props} />
  },
  {
    id: "contra",
    name: "Contra",
    brandColor: "#E5484D",
    badgeBg: "#E5484D",
    badgeText: "#FFFFFF",
    domainMatch: ["contra.com"],
    renderIcon: (props) => <ContraIcon {...props} />
  },
  {
    id: "facebook",
    name: "Facebook",
    brandColor: "#1877F2",
    badgeBg: "#1877F2",
    badgeText: "#FFFFFF",
    domainMatch: ["facebook.com", "fb.com", "fb.me"],
    renderIcon: (props) => <FacebookIcon {...props} />
  },
  {
    id: "tiktok",
    name: "TikTok",
    brandColor: "#010101",
    badgeBg: "#000000",
    badgeText: "#FFFFFF",
    domainMatch: ["tiktok.com"],
    renderIcon: (props) => <TikTokIcon {...props} />
  },
  {
    id: "fiverr",
    name: "Fiverr",
    brandColor: "#1DBF73",
    badgeBg: "#1DBF73",
    badgeText: "#FFFFFF",
    domainMatch: ["fiverr.com"],
    renderIcon: (props) => <FiverrIcon {...props} />
  },
  {
    id: "threads",
    name: "Threads",
    brandColor: "#000000",
    badgeBg: "#101010",
    badgeText: "#FFFFFF",
    domainMatch: ["threads.net"],
    renderIcon: (props) => <ThreadsIcon {...props} />
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    brandColor: "#0A66C2",
    badgeBg: "#0A66C2",
    badgeText: "#FFFFFF",
    domainMatch: ["linkedin.com"],
    renderIcon: (props) => <LinkedInIcon {...props} />
  },
  {
    id: "github",
    name: "GitHub",
    brandColor: "#24292F",
    badgeBg: "#181717",
    badgeText: "#FFFFFF",
    domainMatch: ["github.com"],
    renderIcon: (props) => <GitHubIcon {...props} />
  },
  {
    id: "youtube",
    name: "YouTube",
    brandColor: "#FF0000",
    badgeBg: "#FF0000",
    badgeText: "#FFFFFF",
    domainMatch: ["youtube.com", "youtu.be"],
    renderIcon: (props) => <YouTubeIcon {...props} />
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    brandColor: "#25D366",
    badgeBg: "#25D366",
    badgeText: "#FFFFFF",
    domainMatch: ["whatsapp.com", "wa.me"],
    renderIcon: (props) => <WhatsAppIcon {...props} />
  },
  {
    id: "email",
    name: "Email",
    brandColor: "#EA4335",
    badgeBg: "#EA4335",
    badgeText: "#FFFFFF",
    domainMatch: ["mailto:"],
    renderIcon: (props) => <EmailIcon {...props} />
  }
];

// Resolves a platform configuration from saved platform name or URL
export function resolveSocialPlatform(platformOrUrl?: string): SocialPlatformConfig {
  if (!platformOrUrl || typeof platformOrUrl !== "string") {
    return {
      id: "other",
      name: "Website",
      brandColor: "#16f2a4",
      badgeBg: "#16f2a4",
      badgeText: "#000000",
      domainMatch: [],
      renderIcon: (props) => <DefaultLinkIcon {...props} />
    };
  }

  const query = platformOrUrl.trim().toLowerCase();

  // 1. Direct ID match
  const byId = SOCIAL_PLATFORMS.find((p) => p.id === query);
  if (byId) return byId;

  // 2. Name match (case-insensitive substring)
  const byName = SOCIAL_PLATFORMS.find(
    (p) =>
      query.includes(p.name.toLowerCase()) ||
      p.name.toLowerCase().includes(query) ||
      (query === "x" && p.id === "twitter") ||
      (query === "bsky" && p.id === "bluesky") ||
      (query.includes("thread") && p.id === "threads") ||
      (query.includes("fiverr") && p.id === "fiverr")
  );
  if (byName) return byName;

  // 3. URL Domain match
  const byDomain = SOCIAL_PLATFORMS.find((p) => p.domainMatch.some((domain) => query.includes(domain)));
  if (byDomain) return byDomain;

  return {
    id: "other",
    name: platformOrUrl,
    brandColor: "#16f2a4",
    badgeBg: "#16f2a4",
    badgeText: "#000000",
    domainMatch: [],
    renderIcon: (props) => <DefaultLinkIcon {...props} />
  };
}

/**
 * Renders an official 3D social icon badge.
 * Provides authentic brand colors, responsive sizing, radial gloss depth,
 * multi-level shadow elevation, and smooth spring hover pop.
 */
export function SocialBrandBadge({
  platform,
  url,
  label,
  size = "md",
  className = ""
}: {
  platform: string;
  url?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const config = resolveSocialPlatform(platform || url);
  const sizeClasses = {
    sm: "h-9 w-9 text-[16px]",
    md: "h-11 w-11 text-[20px]",
    lg: "h-13 w-13 text-[24px]"
  }[size];

  const iconSizes = { sm: 18, md: 22, lg: 26 }[size];

  const content = (
    <span
      className={`group relative grid ${sizeClasses} shrink-0 place-items-center rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-1.5 hover:scale-110 hover:shadow-[0_8px_20px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.6)] focus:outline-none focus:ring-2 focus:ring-[#16f2a4]/40 active:translate-y-0 active:scale-95 ${className}`}
      style={{
        background: config.badgeBg,
        color: config.badgeText
      }}
      title={label || config.name}
      aria-label={label || config.name}
    >
      {/* 3D ambient radial top-light gloss */}
      <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/30 via-transparent to-black/25 opacity-90 transition-opacity group-hover:opacity-100" />
      <span className="relative z-10 transition-transform duration-300 group-hover:scale-110 flex items-center justify-center drop-shadow-md">
        {config.renderIcon({ size: iconSizes })}
      </span>
    </span>
  );

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label || config.name}
        className="inline-block"
      >
        {content}
      </a>
    );
  }

  return content;
}
