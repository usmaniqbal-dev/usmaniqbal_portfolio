import PortfolioClient from "@/components/portfolio-client";
import { getSiteContent } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getSiteContent();

  return <PortfolioClient content={content} />;
}
