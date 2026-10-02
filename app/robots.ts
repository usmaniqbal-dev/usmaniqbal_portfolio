import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin1122", "/api", "/_next/"]
    },
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
