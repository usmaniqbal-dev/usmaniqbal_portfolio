import type { Metadata } from "next";
import AllProjectsClient from "@/components/all-projects-client";
import { getSiteContent } from "@/lib/content-store";
import { seoKeywords, seoTitle, siteUrl } from "@/lib/seo-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const pageTitle = `All Projects | ${seoTitle}`;
  const pageDescription = `Explore all ${content.projects?.length || 34}+ projects by Usman Iqbal, including Salesforce CRM solutions, Agentforce AI automation, Python speech pipelines, and full-stack web and mobile apps.`;
  const savedImage = content.seo.ogImage || content.builder.settings.logoUrl || content.home.profileImage;
  const image = !savedImage || savedImage.includes("usman-profile.png") ? "/images/usman-browser-icon.png" : savedImage;
  const absoluteImage = image.startsWith("http") ? image : `${siteUrl}${image.startsWith("/") ? image : `/${image}`}`;
  const pageUrl = `${siteUrl}/projects`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: [...seoKeywords, "all projects", "Salesforce projects", "AI projects", "Python projects", "CRM projects"],
    alternates: { canonical: pageUrl },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: "website",
      url: pageUrl,
      siteName: "Usman Iqbal Portfolio",
      images: [{ url: absoluteImage, width: 1200, height: 630, alt: "Usman Iqbal All Projects Showcase" }]
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [absoluteImage]
    }
  };
}

export default async function ProjectsPage() {
  const content = await getSiteContent();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Usman Iqbal Projects Showcase",
    description: "Complete directory of projects by Usman Iqbal spanning Salesforce CRM, AI, Python, and Full-Stack Engineering.",
    url: `${siteUrl}/projects`,
    isPartOf: {
      "@type": "WebSite",
      url: siteUrl,
      name: "Usman Iqbal Portfolio"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <AllProjectsClient content={content} />
    </>
  );
}
