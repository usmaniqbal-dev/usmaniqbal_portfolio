import type { Metadata } from "next";
import CvViewer from "@/components/cv-viewer";
import { getSiteContent } from "@/lib/content-store";

export const metadata: Metadata = {
  title: "View CV | Usman Iqbal",
  description: "Curriculum vitae and professional background of Usman Iqbal.",
  alternates: { canonical: "https://www.usmaniqbal.tech/cv" },
  robots: { index: false, follow: false, noarchive: true, nosnippet: true }
};

export const dynamic = "force-dynamic";

export default async function CvPage() {
  const content = await getSiteContent();
  return <CvViewer cv={content.cv} />;
}
