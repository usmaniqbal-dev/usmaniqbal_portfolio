import type { Metadata } from "next";
import CertificationsClient from "@/components/certifications-client";
import { getSiteContent } from "@/lib/content-store";
import { seoKeywords, seoTitle, siteUrl } from "@/lib/seo-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const certCount = content.certifications?.length || 0;
  const pageTitle = `Licenses & Certifications | ${seoTitle}`;
  const pageDescription = `Explore ${certCount > 0 ? certCount + " " : ""}verified professional licenses and certifications earned by Usman Iqbal across Salesforce CRM, Cloud Architecture, AI Automation, and Full-Stack Engineering.`;
  const savedImage = content.seo.ogImage || content.builder.settings.logoUrl || content.home.profileImage;
  const image = !savedImage || savedImage.includes("usman-profile.png") ? "/images/usman-browser-icon.png" : savedImage;
  const absoluteImage = image.startsWith("http") ? image : `${siteUrl}${image.startsWith("/") ? image : `/${image}`}`;
  const pageUrl = `${siteUrl}/certifications`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: [
      ...seoKeywords,
      "certifications",
      "licenses",
      "Salesforce credentials",
      "verified certifications",
      "Usman Iqbal certifications"
    ],
    alternates: { canonical: pageUrl },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: "website",
      url: pageUrl,
      siteName: "Usman Iqbal Portfolio",
      images: [{ url: absoluteImage, width: 1200, height: 630, alt: "Usman Iqbal Licenses & Certifications" }]
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [absoluteImage]
    }
  };
}

export default async function CertificationsPage() {
  const content = await getSiteContent();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Usman Iqbal Licenses & Certifications",
    description: "Verified professional certifications and technical accreditations earned by Usman Iqbal.",
    url: `${siteUrl}/certifications`,
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
      <CertificationsClient content={content} />
    </>
  );
}
