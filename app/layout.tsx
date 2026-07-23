import type { Metadata } from "next";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";
import { getSiteContent } from "@/lib/content-store";
import "./globals.css";

const deploymentUrl = process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const siteUrl = content.seo.canonicalUrl || deploymentUrl;
  const savedTitle = content.seo.title || content.builder.pages[0]?.metaTitle;
  const title = !savedTitle || savedTitle === "Usman Iqbal | Salesforce Administrator & Developer" ? "Usman Iqbal Portfolio" : savedTitle;
  const description = content.seo.description || content.builder.pages[0]?.metaDescription || content.about.description;
  const savedImage = content.seo.ogImage || content.builder.settings.logoUrl || content.home.profileImage;
  const image = !savedImage || savedImage.includes("usman-profile.png") ? "/images/usman-browser-icon.png" : savedImage;
  const icon = "/images/usman-browser-icon.png";

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords: content.seo.keywords,
    authors: [{ name: content.seo.author || "Usman Iqbal" }],
    alternates: { canonical: siteUrl },
    icons: {
      icon,
      shortcut: icon,
      apple: icon
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: siteUrl,
      siteName: content.builder.settings.siteName || "Usman Iqbal Portfolio",
      images: [image]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large"
      }
    }
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <ChatbotWidget />
      </body>
    </html>
  );
}
