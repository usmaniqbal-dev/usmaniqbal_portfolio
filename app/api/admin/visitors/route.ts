import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-api";
import { getAllVisitorsForExport, getVisitorRecords, getVisitorStats } from "@/lib/visitor-store";
import type { VisitorRecord } from "@/types/visitor";

export const runtime = "nodejs";

function escapeCsvField(field: unknown): string {
  if (field === null || field === undefined) return '""';
  const str = String(field);
  return `"${str.replace(/"/g, '""')}"`;
}

function recordsToCsv(records: VisitorRecord[]): string {
  const headers = [
    "ID",
    "Visited At (UTC)",
    "IP Address",
    "Country",
    "Region",
    "City",
    "Visited Path",
    "Referral Source",
    "Browser",
    "Browser Version",
    "Operating System",
    "OS Version",
    "Device Type",
    "Screen Resolution",
    "Language",
    "Timezone",
    "Is Returning",
    "Visitor ID",
    "Session ID"
  ];

  const rows = records.map((r) => [
    r.id,
    r.visitedAt,
    r.ip,
    r.country,
    r.region,
    r.city,
    r.pathname,
    r.referrer,
    r.browserName,
    r.browserVersion,
    r.osName,
    r.osVersion,
    r.deviceType,
    r.screenResolution,
    r.language,
    r.timezone,
    r.isReturning ? "Yes" : "No",
    r.visitorId,
    r.sessionId
  ].map(escapeCsvField).join(","));

  return [headers.map(escapeCsvField).join(","), ...rows].join("\r\n");
}

export async function GET(request: Request) {
  // 1. Verify admin session
  const authorized = await requireAdminSession();
  if (!authorized) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;
  const isExport = searchParams.get("exportCsv") === "true";

  const filter = { search, startDate, endDate };

  // 2. Handle CSV export
  if (isExport) {
    const allRecords = await getAllVisitorsForExport(filter);
    const csvData = recordsToCsv(allRecords);
    const filename = `visitors-export-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0"
      }
    });
  }

  // 3. Paginated view + Stats
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(5, parseInt(searchParams.get("limit") || "25", 10)));

  const [{ records, total }, stats] = await Promise.all([
    getVisitorRecords({ ...filter, page, limit }),
    getVisitorStats(filter)
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return NextResponse.json({
    ok: true,
    stats,
    records,
    total,
    page,
    limit,
    totalPages
  });
}
