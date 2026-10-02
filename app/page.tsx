import PortfolioClient from "@/components/portfolio-client";
import { getSiteContent } from "@/lib/content-store";
import { professionalProfiles, seoDescription, seoTitle, siteUrl } from "@/lib/seo-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const content = await getSiteContent();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${siteUrl}/#profile`,
        url: siteUrl,
        name: seoTitle,
        description: seoDescription,
        isPartOf: { "@id": `${siteUrl}/#website` },
        mainEntity: { "@id": `${siteUrl}/#usman-iqbal` },
        about: { "@id": `${siteUrl}/#usman-iqbal` },
        breadcrumb: { "@id": `${siteUrl}/#breadcrumb` }
      },
      {
        "@type": "Person",
        "@id": `${siteUrl}/#usman-iqbal`,
        name: "Usman Iqbal",
        url: siteUrl,
        image: `${siteUrl}/images/usman-hero.png`,
        jobTitle: "Salesforce Administrator & Developer",
        description: seoDescription,
        knowsAbout: [
          "Salesforce CRM",
          "Salesforce Administration",
          "Salesforce Development",
          "Salesforce Automation",
          "CRM consulting",
          "Web development",
          "AI bots",
          "Business automation"
        ],
        email: "hello@nuraxtech.com",
        address: { "@type": "PostalAddress", addressCountry: "Pakistan" },
        sameAs: professionalProfiles
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Usman Iqbal Portfolio",
        publisher: { "@id": `${siteUrl}/#usman-iqbal` },
        inLanguage: "en"
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteUrl}/#breadcrumb`,
        itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: siteUrl }]
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <PortfolioClient content={content} />
    </>
  );
}
