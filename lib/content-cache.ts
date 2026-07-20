import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";

export const portfolioContentTag = "portfolio-content";

export function contentJsonHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    Pragma: "no-cache"
  };
}

export function revalidatePortfolioContent() {
  revalidateTag(portfolioContentTag);
  revalidatePath("/");
  revalidatePath("/api/content");
}
