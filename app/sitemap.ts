import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo-config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${siteUrl}/cv`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7
    }
  ];
}
