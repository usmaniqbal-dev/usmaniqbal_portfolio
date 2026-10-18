const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outDir = path.join(process.cwd(), 'public', 'images', 'projects');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Load real assets if available
let usmanPhotoB64 = '';
const usmanHeroPath = path.join(process.cwd(), 'public', 'images', 'usman-hero.png');
if (fs.existsSync(usmanHeroPath)) {
  usmanPhotoB64 = fs.readFileSync(usmanHeroPath).toString('base64');
}

let companyLogoB64 = '';
const logoPath = path.join(process.cwd(), 'public', 'images', 'Company Logo.jpg');
if (fs.existsSync(logoPath)) {
  companyLogoB64 = fs.readFileSync(logoPath).toString('base64');
}

function escapeXml(unsafe) {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function windowWrapper({ title, badge, bgGradient, bodyContent }) {
  return `
<svg width="1200" height="750" viewBox="0 0 1200 750" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mainBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgGradient[0]}" />
      <stop offset="100%" stop-color="${bgGradient[1]}" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.45" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="750" fill="url(#mainBg)" />

  <!-- Background Grid Pattern -->
  <g opacity="0.08" stroke="#ffffff" stroke-width="1">
    ${Array.from({ length: 24 }).map((_, i) => `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="750" />`).join('')}
    ${Array.from({ length: 15 }).map((_, i) => `<line x1="0" y1="${i * 50}" x2="1200" y2="${i * 50}" />`).join('')}
  </g>

  <!-- Glass Card Window -->
  <g transform="translate(60, 45)" filter="url(#shadow)">
    <rect width="1080" height="660" rx="20" fill="#0f172a" fill-opacity="0.88" stroke="#334155" stroke-width="1.5" />

    <!-- Window Titlebar -->
    <rect width="1080" height="52" rx="20" fill="#1e293b" fill-opacity="0.95" />
    <rect y="32" width="1080" height="20" fill="#1e293b" fill-opacity="0.95" />
    <line x1="0" y1="52" x2="1080" y2="52" stroke="#334155" stroke-width="1" />

    <!-- Window Controls -->
    <circle cx="30" cy="26" r="6.5" fill="#ef4444" />
    <circle cx="50" cy="26" r="6.5" fill="#f59e0b" />
    <circle cx="70" cy="26" r="6.5" fill="#10b981" />

    <!-- Window Title -->
    <text x="540" y="32" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#94a3b8" text-anchor="middle">
      ${escapeXml(title)}
    </text>

    <!-- Badge -->
    <rect x="910" y="14" width="145" height="24" rx="12" fill="#0284c7" fill-opacity="0.25" stroke="#38bdf8" stroke-width="1" />
    <text x="982" y="30" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#38bdf8" text-anchor="middle">
      ${escapeXml(badge)}
    </text>

    <!-- Body Content -->
    <g transform="translate(30, 75)">
      ${bodyContent}
    </g>
  </g>
</svg>
`;
}

function phoneWrapper({ title, badge, bgGradient, phoneContent, sideContent }) {
  return `
<svg width="1200" height="750" viewBox="0 0 1200 750" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mainBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgGradient[0]}" />
      <stop offset="100%" stop-color="${bgGradient[1]}" />
    </linearGradient>
    <filter id="phoneShadow" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="25" stdDeviation="30" flood-color="#000000" flood-opacity="0.6" />
    </filter>
  </defs>

  <rect width="1200" height="750" fill="url(#mainBg)" />

  <!-- Background Grid -->
  <g opacity="0.08" stroke="#ffffff" stroke-width="1">
    ${Array.from({ length: 24 }).map((_, i) => `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="750" />`).join('')}
    ${Array.from({ length: 15 }).map((_, i) => `<line x1="0" y1="${i * 50}" x2="1200" y2="${i * 50}" />`).join('')}
  </g>

  <!-- Left Side Features / Architecture -->
  <g transform="translate(80, 80)">
    <rect width="600" height="590" rx="20" fill="#0f172a" fill-opacity="0.85" stroke="#334155" stroke-width="1.5" />
    <g transform="translate(35, 40)">
      <rect width="160" height="26" rx="13" fill="#00DCA0" fill-opacity="0.15" stroke="#00DCA0" stroke-width="1" />
      <text x="80" y="17" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#00DCA0" text-anchor="middle">${escapeXml(badge)}</text>
      <text x="0" y="65" font-family="system-ui, sans-serif" font-size="30" font-weight="800" fill="#ffffff">${escapeXml(title)}</text>
      <g transform="translate(0, 95)">
        ${sideContent}
      </g>
    </g>
  </g>

  <!-- Right Side Realistic Smartphone Frame -->
  <g transform="translate(740, 50)" filter="url(#phoneShadow)">
    <!-- Device Bezel -->
    <rect width="380" height="650" rx="48" fill="#18181b" stroke="#3f3f46" stroke-width="6" />
    <!-- Screen Glass -->
    <rect x="12" y="12" width="356" height="626" rx="38" fill="#09090b" />

    <!-- Speaker / Island Notch -->
    <rect x="140" y="22" width="100" height="22" rx="11" fill="#000000" />
    <circle cx="215" cy="33" r="5" fill="#1e293b" />

    <!-- Status Bar -->
    <text x="45" y="38" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#a1a1aa">9:41</text>
    <g transform="translate(285, 28)" fill="#a1a1aa">
      <path d="M1 9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V9zM7 6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V6zM13 3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V3z" />
      <rect x="25" y="2" width="18" height="10" rx="3" fill="none" stroke="#a1a1aa" stroke-width="1.5" />
      <rect x="27" y="4" width="11" height="6" rx="1.5" fill="#a1a1aa" />
    </g>

    <!-- Inside Phone Content -->
    <g transform="translate(18, 55)">
      ${phoneContent}
    </g>

    <!-- Bottom Home Indicator -->
    <rect x="130" y="622" width="120" height="4" rx="2" fill="#71717a" />
  </g>
</svg>
`;
}

module.exports = {
  windowWrapper,
  phoneWrapper,
  outDir,
  usmanPhotoB64,
  companyLogoB64,
  escapeXml
};
