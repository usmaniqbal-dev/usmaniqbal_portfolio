import type { Metadata } from "next";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";
import { getSiteContent } from "@/lib/content-store";
import { seoDescription, seoKeywords, seoTitle, siteUrl } from "@/lib/seo-config";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const title = seoTitle;
  const description = seoDescription;
  const savedImage = content.seo.ogImage || content.builder.settings.logoUrl || content.home.profileImage;
  const image = !savedImage || savedImage.includes("usman-profile.png") ? "/images/usman-browser-icon.png" : savedImage;
  const icon = "/images/usman-browser-icon.png";
  const absoluteImage = image.startsWith("http") ? image : `${siteUrl}${image.startsWith("/") ? image : `/${image}`}`;

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords: seoKeywords,
    authors: [{ name: "Usman Iqbal" }],
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
      siteName: "Usman Iqbal Portfolio",
      locale: "en_US",
      images: [{ url: absoluteImage, width: 1200, height: 630, alt: "Usman Iqbal - Salesforce Administrator and Developer" }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteImage]
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large"
      }
    },
    category: "technology",
    creator: "Usman Iqbal",
    publisher: "Usman Iqbal"
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
