import type { MetadataRoute } from "next";
import { getSiteContent } from "@/lib/content-store";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const content = await getSiteContent();
  const deploymentUrl = process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
  const siteUrl = content.seo.canonicalUrl || deploymentUrl;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin1122", "/api/admin"]
    },
    sitemap: `${siteUrl.replace(/\/$/, "")}/sitemap.xml`
  };
}
