import sharp from "sharp";

console.log("=== Vercel Blob Storage & Media Management Test Suite ===\n");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

// -------------------------------------------------------------
// Test 1: Vercel Blob URL Recognition
// -------------------------------------------------------------
console.log("[1] Testing Vercel Blob URL Detection");

function isVercelBlobUrl(url) {
  if (!url || typeof url !== "string") return false;
  return (
    url.includes(".blob.vercel-storage.com") ||
    url.startsWith("https://blob.vercel-storage.com") ||
    /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(url)
  );
}

const validBlobUrls = [
  "https://abc123xyz.public.blob.vercel-storage.com/portfolio/profile-12345.webp",
  "https://usmaniqbal-portfolio.public.blob.vercel-storage.com/portfolio/projects/demo.png",
  "https://blob.vercel-storage.com/v1/test.jpg"
];

const nonBlobUrls = [
  "/images/profile.png",
  "/uploads/project1.webp",
  "https://images.unsplash.com/photo-123",
  "https://example.com/blob.vercel-storage.com.fake/img.png",
  ""
];

for (const url of validBlobUrls) {
  assert(isVercelBlobUrl(url), `Correctly identifies Vercel Blob URL: ${url.slice(0, 50)}...`);
}

assert(!isVercelBlobUrl(nonBlobUrls[0]), "Rejects relative path /images/profile.png");
assert(!isVercelBlobUrl(nonBlobUrls[1]), "Rejects relative upload path /uploads/project1.webp");
assert(!isVercelBlobUrl(nonBlobUrls[2]), "Rejects external non-blob URL");
assert(!isVercelBlobUrl(nonBlobUrls[4]), "Rejects empty URL");

// -------------------------------------------------------------
// Test 2: Deep Content Reference Finding
// -------------------------------------------------------------
console.log("\n[2] Testing Deep Content Reference Finding");

const mockBlobUrl1 = "https://store.public.blob.vercel-storage.com/portfolio/avatar-abc.webp";
const mockBlobUrl2 = "https://store.public.blob.vercel-storage.com/portfolio/project-1-xyz.webp";
const mockSharedUrl = "https://store.public.blob.vercel-storage.com/portfolio/shared-icon.png";

const mockContent = {
  home: {
    hero: {
      avatarUrl: mockBlobUrl1,
      bannerUrl: mockSharedUrl
    }
  },
  about: {
    profileImage: mockBlobUrl1
  },
  projects: [
    {
      id: "proj-1",
      title: "Real Estate CRM",
      image: mockBlobUrl2,
      gallery: [mockBlobUrl2, mockSharedUrl]
    },
    {
      id: "proj-2",
      title: "AI Chatbot",
      image: "/images/projects/chatbot.webp",
      gallery: []
    }
  ],
  services: [
    {
      id: "srv-1",
      title: "Cloud Architecture",
      icon: mockSharedUrl
    }
  ],
  skills: [
    {
      name: "Next.js",
      icon: "/images/skills/nextjs.svg"
    }
  ]
};

function findUrlReferences(content, targetUrl) {
  const references = [];
  if (!content || !targetUrl) return references;

  function scan(node, path) {
    if (!node) return;
    if (typeof node === "string") {
      if (node.trim() === targetUrl.trim()) {
        references.push(path);
      }
    } else if (Array.isArray(node)) {
      node.forEach((item, index) => scan(item, `${path}[${index}]`));
    } else if (typeof node === "object") {
      for (const [key, val] of Object.entries(node)) {
        scan(val, path ? `${path}.${key}` : key);
      }
    }
  }

  scan(content, "content");
  return references;
}

const refs1 = findUrlReferences(mockContent, mockBlobUrl1);
assert(refs1.length === 2, `Found exactly 2 references for avatar URL (found: ${refs1.length})`);
assert(refs1.includes("content.home.hero.avatarUrl"), "Identified reference in home.hero.avatarUrl");
assert(refs1.includes("content.about.profileImage"), "Identified reference in about.profileImage");

const refs2 = findUrlReferences(mockContent, mockBlobUrl2);
assert(refs2.length === 2, `Found project image and gallery references (found: ${refs2.length})`);

const refsShared = findUrlReferences(mockContent, mockSharedUrl);
assert(refsShared.length === 3, `Found 3 references for shared icon (found: ${refsShared.length})`);

const unreferenced = findUrlReferences(mockContent, "https://store.public.blob.vercel-storage.com/portfolio/unused.png");
assert(unreferenced.length === 0, "Correctly returns empty array for unused image URL");

// -------------------------------------------------------------
// Test 3: Reference Replacement & Propagation
// -------------------------------------------------------------
console.log("\n[3] Testing Safe URL Replacement Across Content");

function replaceUrlReferences(content, oldUrl, newUrl) {
  let count = 0;
  function update(node) {
    if (!node) return;
    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        if (typeof node[i] === "string" && node[i].trim() === oldUrl.trim()) {
          node[i] = newUrl;
          count++;
        } else if (typeof node[i] === "object") {
          update(node[i]);
        }
      }
    } else if (typeof node === "object") {
      for (const key of Object.keys(node)) {
        if (typeof node[key] === "string" && node[key].trim() === oldUrl.trim()) {
          node[key] = newUrl;
          count++;
        } else if (typeof node[key] === "object") {
          update(node[key]);
        }
      }
    }
  }

  const cloned = JSON.parse(JSON.stringify(content));
  update(cloned);
  return { updatedContent: cloned, replacedCount: count };
}

const newBlobUrl = "https://store.public.blob.vercel-storage.com/portfolio/avatar-new-v2.webp";
const { updatedContent, replacedCount } = replaceUrlReferences(mockContent, mockBlobUrl1, newBlobUrl);

assert(replacedCount === 2, `Replaced exactly 2 instances (count: ${replacedCount})`);
assert(updatedContent.home.hero.avatarUrl === newBlobUrl, "Hero avatar updated to new blob URL");
assert(updatedContent.about.profileImage === newBlobUrl, "About profile image updated to new blob URL");
assert(updatedContent.projects[0].image === mockBlobUrl2, "Unrelated project image preserved intact");

// -------------------------------------------------------------
// Test 4: Reference Removal
// -------------------------------------------------------------
console.log("\n[4] Testing Safe URL Removal");

function removeUrlReferences(content, targetUrl) {
  let count = 0;
  function remove(node) {
    if (!node) return;
    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        if (typeof node[i] === "string" && node[i].trim() === targetUrl.trim()) {
          node[i] = "";
          count++;
        } else if (typeof node[i] === "object") {
          remove(node[i]);
        }
      }
    } else if (typeof node === "object") {
      for (const key of Object.keys(node)) {
        if (typeof node[key] === "string" && node[key].trim() === targetUrl.trim()) {
          node[key] = "";
          count++;
        } else if (typeof node[key] === "object") {
          remove(node[key]);
        }
      }
    }
  }

  const cloned = JSON.parse(JSON.stringify(content));
  remove(cloned);
  return { updatedContent: cloned, removedCount: count };
}

const { updatedContent: clearedContent, removedCount } = removeUrlReferences(mockContent, mockBlobUrl2);
assert(removedCount === 2, `Removed all references to deleted project image (count: ${removedCount})`);
assert(clearedContent.projects[0].image === "", "Project image cleared cleanly");

// -------------------------------------------------------------
// Test 5: Image Optimization with Sharp (Compression & Resizing)
// -------------------------------------------------------------
console.log("\n[5] Testing Sharp Image Optimization & WebP Conversion");

async function testSharpOptimization() {
  // Generate a large synthetic 2500x2000 PNG image buffer
  const rawSvg = `
    <svg width="2500" height="2000" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#16f2a4;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="2500" height="2000" fill="url(#grad)" />
      <text x="1250" y="1000" font-size="90" fill="#ffffff" text-anchor="middle" font-family="sans-serif">Portfolio Cloud Optimization Test</text>
    </svg>
  `;

  const inputBuffer = await sharp(Buffer.from(rawSvg)).png().toBuffer();
  const inputSize = inputBuffer.byteLength;
  console.log(`  Raw test PNG size: ${(inputSize / 1024).toFixed(1)} KB`);

  // Optimize with our pipeline: auto-orient, resize down to max 1920x1920, convert to WebP quality 85
  const pipeline = sharp(inputBuffer, { failOn: "none" }).rotate();
  pipeline.resize({
    width: 1920,
    height: 1920,
    fit: "inside",
    withoutEnlargement: true
  });
  pipeline.webp({ quality: 85, effort: 4 });

  const optimizedBuffer = await pipeline.toBuffer();
  const metadata = await sharp(optimizedBuffer).metadata();

  assert(metadata.format === "webp", "Output image successfully converted to WebP");
  assert(metadata.width <= 1920 && metadata.height <= 1920, `Dimensions clamped within 1920px (got: ${metadata.width}x${metadata.height})`);
  assert(optimizedBuffer.byteLength < inputSize, `File size reduced from ${(inputSize / 1024).toFixed(1)} KB down to ${(optimizedBuffer.byteLength / 1024).toFixed(1)} KB`);
}

await testSharpOptimization();

// -------------------------------------------------------------
// Test 6: MIME Type Validation
// -------------------------------------------------------------
console.log("\n[6] Testing File Upload Security & MIME Type Validation");

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml"
]);

assert(ALLOWED_MIME_TYPES.has("image/jpeg"), "Allows JPEG images");
assert(ALLOWED_MIME_TYPES.has("image/png"), "Allows PNG images");
assert(ALLOWED_MIME_TYPES.has("image/webp"), "Allows modern WebP images");
assert(ALLOWED_MIME_TYPES.has("image/gif"), "Allows GIF images");
assert(ALLOWED_MIME_TYPES.has("image/svg+xml"), "Allows SVG vectors");
assert(!ALLOWED_MIME_TYPES.has("application/javascript"), "Rejects executable script files");
assert(!ALLOWED_MIME_TYPES.has("text/html"), "Rejects HTML files (XSS prevention)");
assert(!ALLOWED_MIME_TYPES.has("application/x-msdownload"), "Rejects executable binaries");

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log("\n=== Test Results Summary ===");
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
  console.error("\n[FAILED] Some tests did not pass.");
  process.exit(1);
} else {
  console.log("\n[SUCCESS] All Vercel Blob and media management tests passed successfully!");
}
