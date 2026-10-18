import type { Metadata } from "next";
import PortfolioClient from "@/components/portfolio-client";
import { getSiteContent } from "@/lib/content-store";
import { seoKeywords, siteUrl } from "@/lib/seo-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const pageTitle = `Contact Usman Iqbal | Hire Salesforce & Automation Expert`;
  const pageDescription = content.contact?.formHeadline || `Get in touch with Usman Iqbal for Salesforce CRM setup, custom business workflow automation, AI bot development, and full-stack software consulting.`;
  const pageUrl = `${siteUrl}/contact`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: [...seoKeywords, "contact Usman Iqbal", "hire Salesforce developer", "hire CRM consultant"],
    alternates: { canonical: pageUrl },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: "website",
      url: pageUrl,
      siteName: "Usman Iqbal Portfolio",
      images: [{ url: `${siteUrl}/images/usman-hero.png`, width: 1200, height: 630, alt: "Contact Usman Iqbal" }]
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [`${siteUrl}/images/usman-hero.png`]
    }
  };
}

export default async function ContactPage() {
  const content = await getSiteContent();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Usman Iqbal",
    description: "Contact details and message form for hiring or consulting with Usman Iqbal.",
    url: `${siteUrl}/contact`
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PortfolioClient content={content} initialSection="contact" />
    </>
  );
}
