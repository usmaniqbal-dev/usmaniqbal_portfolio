import PortfolioClient from "@/components/portfolio-client";
import { getSiteContent } from "@/lib/content-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const content = await getSiteContent();
  const siteUrl = content.seo.canonicalUrl || process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "");
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Usman Iqbal",
    alternateName: ["Usman", content.builder.settings.siteName].filter(Boolean),
    url: siteUrl || undefined,
    image: content.home.profileImage || content.seo.ogImage,
    jobTitle: "Salesforce Administrator & Developer",
    brand: {
      "@type": "Brand",
      name: "NURAXTECH"
    },
    knowsAbout: content.seo.keywords,
    sameAs: content.socials.map((social) => social.url).filter(Boolean)
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <PortfolioClient content={content} />
    </>
  );
}
