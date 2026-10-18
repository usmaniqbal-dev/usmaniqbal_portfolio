import type { Metadata } from "next";
import PortfolioClient from "@/components/portfolio-client";
import { getSiteContent } from "@/lib/content-store";
import { professionalProfiles, seoDescription, seoKeywords, siteUrl } from "@/lib/seo-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const pageTitle = `About Usman Iqbal | Salesforce Administrator & Developer`;
  const pageDescription = content.about?.description || seoDescription;
  const pageUrl = `${siteUrl}/about`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: [...seoKeywords, "About Usman Iqbal", "Salesforce consultant", "NURAXTECH founder"],
    alternates: { canonical: pageUrl },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: "profile",
      url: pageUrl,
      siteName: "Usman Iqbal Portfolio",
      images: [{ url: `${siteUrl}/images/usman-hero.png`, width: 1200, height: 630, alt: "About Usman Iqbal" }]
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [`${siteUrl}/images/usman-hero.png`]
    }
  };
}

export default async function AboutPage() {
  const content = await getSiteContent();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: "About Usman Iqbal",
    description: content.about?.description || seoDescription,
    url: `${siteUrl}/about`,
    mainEntity: {
      "@type": "Person",
      name: "Usman Iqbal",
      jobTitle: "Salesforce Administrator & Developer",
      url: siteUrl,
      sameAs: professionalProfiles
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PortfolioClient content={content} initialSection="about" />
    </>
  );
}
