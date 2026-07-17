import type { Metadata } from "next";
import CvViewer from "@/components/cv-viewer";

export const metadata: Metadata = {
  title: "View CV | Usman Iqbal",
  description: "View-only curriculum vitae of Usman Iqbal.",
  robots: { index: false, follow: false }
};

export default function CvPage() {
  return <CvViewer />;
}
