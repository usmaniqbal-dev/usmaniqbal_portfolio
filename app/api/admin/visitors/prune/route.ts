import { NextResponse } from "next/server";
import { requireAdminMutation } from "@/lib/admin-api";
import { pruneVisitorRecords } from "@/lib/visitor-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // 1. Verify mutation authority and CSRF token
  const authError = await requireAdminMutation(request);
  if (authError) {
    return authError;
  }

  try {
    let days = 90;
    try {
      const body = (await request.json()) as { days?: number };
      if (typeof body.days === "number" && body.days > 0) {
        days = body.days;
      }
    } catch {
      // Use default 90 days
    }

    const deletedCount = await pruneVisitorRecords(days);

    return NextResponse.json({
      ok: true,
      message: `Pruned visitor records older than ${days} days.`,
      deletedCount
    });
  } catch (error) {
    console.error("[prune-api] Pruning failed:", error);
    return NextResponse.json({ message: "Pruning failed" }, { status: 500 });
  }
}
