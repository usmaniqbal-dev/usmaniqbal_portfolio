import type { Metadata } from "next";
import PortfolioClient from "@/components/portfolio-client";
import { getSiteContent } from "@/lib/content-store";
import { seoKeywords, siteUrl } from "@/lib/seo-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const pageTitle = `Services | Usman Iqbal - Salesforce & CRM Consulting`;
  const servicesList = content.services.map((s) => s.title).join(", ");
  const pageDescription = `Professional CRM and automation services provided by Usman Iqbal: ${servicesList}. End-to-end Salesforce customization, business workflow automation, AI bot integrations, and web engineering.`;
  const pageUrl = `${siteUrl}/services`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: [...seoKeywords, "Salesforce consulting", "CRM automation services", "AI chatbot services", "web development services"],
    alternates: { canonical: pageUrl },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: "website",
      url: pageUrl,
      siteName: "Usman Iqbal Portfolio",
      images: [{ url: `${siteUrl}/images/usman-hero.png`, width: 1200, height: 630, alt: "Usman Iqbal Professional Services" }]
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [`${siteUrl}/images/usman-hero.png`]
    }
  };
}

export default async function ServicesPage() {
  const content = await getSiteContent();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Usman Iqbal Salesforce & CRM Consulting Services",
    description: "Professional Salesforce, CRM automation, web development, and AI engineering services.",
    url: `${siteUrl}/services`,
    provider: {
      "@type": "Person",
      name: "Usman Iqbal"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PortfolioClient content={content} initialSection="services" />
    </>
  );
}
