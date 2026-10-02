import type { Metadata } from "next";
import CvViewer from "@/components/cv-viewer";

export const metadata: Metadata = {
  title: "View CV | Usman Iqbal",
  description: "View-only curriculum vitae of Usman Iqbal.",
  alternates: { canonical: "https://www.usmaniqbal.tech/cv" },
  robots: { index: false, follow: false, noarchive: true, nosnippet: true }
};

export default function CvPage() {
  return <CvViewer />;
}
