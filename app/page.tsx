import PortfolioClient from "@/components/portfolio-client";
import { getSiteContent } from "@/lib/content-store";
import { professionalProfiles, siteUrl } from "@/lib/seo-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const content = await getSiteContent();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}/#usman-iqbal`,
    name: "Usman Iqbal",
    url: siteUrl,
    image: `${siteUrl}/images/usman-hero.png`,
    jobTitle: "Salesforce Administrator & Developer",
    description: "Professional portfolio of Usman Iqbal, a Salesforce Administrator and Salesforce Developer.",
    knowsAbout: ["Salesforce CRM", "Salesforce Automation", "Salesforce Administration", "Salesforce Development"],
    sameAs: professionalProfiles
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <PortfolioClient content={content} />
    </>
  );
}
