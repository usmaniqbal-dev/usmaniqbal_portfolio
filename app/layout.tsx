import type { Metadata } from "next";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";
import "./globals.css";

const deploymentUrl = process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(deploymentUrl),
  title: "Usman Iqbal | Salesforce Administrator & Developer",
  description:
    "Usman Iqbal is a Salesforce Administrator & Developer, CRM specialist, web developer, and AI bots developer at NURAXTECH.",
  keywords: [
    "Usman Iqbal",
    "NURAXTECH",
    "Salesforce Administrator",
    "Salesforce Developer",
    "CRM Specialist",
    "Web Developer",
    "AI Bots Developer"
  ],
  openGraph: {
    title: "Usman Iqbal | Salesforce Administrator & Developer",
    description:
      "Salesforce CRM, automation, web development, AI bots, and modern business solutions.",
    type: "website",
    images: ["/images/usman-profile.png"]
  }
};

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
