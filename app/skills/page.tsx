import type { Metadata } from "next";
import PortfolioClient from "@/components/portfolio-client";
import { getSiteContent } from "@/lib/content-store";
import { seoKeywords, siteUrl } from "@/lib/seo-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const pageTitle = `Technical Skills | Usman Iqbal - Salesforce & Development`;
  const skillsList = content.skills.map((s) => s.name).join(", ");
  const pageDescription = `Technical competencies and skill proficiency of Usman Iqbal: ${skillsList}. Specializing in Salesforce administration, Apex development, CRM automation, and modern web applications.`;
  const pageUrl = `${siteUrl}/skills`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: [...seoKeywords, "Salesforce skills", "Apex", "Flows", "Litify", "Next.js", "CRM customization"],
    alternates: { canonical: pageUrl },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: "website",
      url: pageUrl,
      siteName: "Usman Iqbal Portfolio",
      images: [{ url: `${siteUrl}/images/usman-hero.png`, width: 1200, height: 630, alt: "Usman Iqbal Technical Skills" }]
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [`${siteUrl}/images/usman-hero.png`]
    }
  };
}

export default async function SkillsPage() {
  const content = await getSiteContent();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemPage",
    name: "Technical Skills - Usman Iqbal",
    description: "Core competencies and skill ratings for Usman Iqbal across Salesforce CRM and Full-Stack Engineering.",
    url: `${siteUrl}/skills`
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PortfolioClient content={content} initialSection="skills" />
    </>
  );
}
