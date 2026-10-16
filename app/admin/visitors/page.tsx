"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Bot,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Eye,
  Globe,
  HardDrive,
  Laptop,
  Layers,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Monitor,
  RefreshCw,
  Search,
  Shield,
  Smartphone,
  Tablet,
  Trash2,
  UserCheck,
  Users,
  X
} from "lucide-react";

import type { VisitorRecord, VisitorStats } from "@/types/visitor";

type SessionState = {
  authenticated: boolean;
  configured: boolean;
  csrfToken?: string;
  storageMode?: string;
};

export default function VisitorsAdminPage() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [records, setRecords] = useState<VisitorRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [dateRange, setDateRange] = useState<"all" | "today" | "7d" | "30d">("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorRecord | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Embedded login states for unauthenticated visitors
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);


  useEffect(() => {
    if (session?.authenticated) {
      loadVisitors();
    }
  }, [session?.authenticated, page, limit, search, dateRange]);

  async function checkSession() {
    try {
      const res = await fetch("/api/admin/session", { cache: "no-store" });
      const state = (await res.json()) as SessionState;
      setSession(state);
    } catch {
      setSession({ authenticated: false, configured: false });
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser, password: loginPass })
      });
      const data = (await res.json()) as { message?: string; csrfToken?: string; ok?: boolean };

      if (!res.ok) {
        setLoginError(data.message || "Invalid credentials.");
        setLoginLoading(false);
        return;
      }

      setSession({
        authenticated: true,
        configured: true,
        csrfToken: data.csrfToken
      });
      setLoginLoading(false);
    } catch {
      setLoginError("Login failed. Check your network connection.");
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setSession({ authenticated: false, configured: true });
    setRecords([]);
    setStats(null);
  }

  function getDateRangeParams() {
    const now = new Date();
    if (dateRange === "today") {
      const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return { startDate: start.toISOString(), endDate: now.toISOString() };
    }
    if (dateRange === "7d") {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { startDate: start.toISOString(), endDate: now.toISOString() };
    }
    if (dateRange === "30d") {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { startDate: start.toISOString(), endDate: now.toISOString() };
    }
    return {};
  }

  async function loadVisitors() {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));

      if (search) params.set("search", search);

      const dateParams = getDateRangeParams();
      if (dateParams.startDate) params.set("startDate", dateParams.startDate);
      if (dateParams.endDate) params.set("endDate", dateParams.endDate);

      const res = await fetch(`/api/admin/visitors?${params.toString()}`, { cache: "no-store" });

      if (res.status === 401) {
        setSession({ authenticated: false, configured: true });
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error("Unable to fetch visitor records.");
      }

      const data = (await res.json()) as {
        ok: boolean;
        stats: VisitorStats;
        records: VisitorRecord[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };

      setStats(data.stats);
      setRecords(data.records);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load visitor records.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function handleClearSearch() {
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  async function handleExportCsv() {
    setBusyAction("export");
    try {
      const params = new URLSearchParams();
      params.set("exportCsv", "true");
      if (search) params.set("search", search);

      const dateParams = getDateRangeParams();
      if (dateParams.startDate) params.set("startDate", dateParams.startDate);
      if (dateParams.endDate) params.set("endDate", dateParams.endDate);

      const url = `/api/admin/visitors?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `portfolio-visitors-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setActionMessage("CSV export downloaded successfully.");
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Export failed.");
      setTimeout(() => setActionMessage(null), 4000);
    } finally {
      setBusyAction(null);
    }
  }

  async function handlePruneRecords() {
    const confirmed = window.confirm(
      "Are you sure you want to prune visitor records older than 90 days? This action permanently removes old records according to retention policy."
    );
    if (!confirmed) return;

    setBusyAction("prune");
    try {
      const res = await fetch("/api/admin/visitors/prune", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-csrf": session?.csrfToken || ""
        },
        body: JSON.stringify({ days: 90 })
      });

      const data = (await res.json()) as { ok?: boolean; message?: string; deletedCount?: number };
      if (!res.ok) throw new Error(data.message || "Prune failed");

      setActionMessage(data.message || "Prune completed.");
      setTimeout(() => setActionMessage(null), 4000);
      await loadVisitors();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Prune failed.");
      setTimeout(() => setActionMessage(null), 4000);
    } finally {
      setBusyAction(null);
    }
  }

  function copyToClipboard(text: string, fieldName: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  }

  // 1. Loading Initial Session
  if (!session) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#070b12] text-white">
        <Loader2 className="animate-spin text-[#16f2a4]" size={36} />
      </div>
    );
  }

  // 2. Unauthenticated Gate
  if (!session.authenticated) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#070b12] p-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#090d16] p-8 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#16f2a4]/15 text-[#16f2a4]">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black">Admin Access Required</h1>
              <p className="text-xs text-white/50">Visitor Analytics Dashboard</p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Please log in with your authorized admin credentials to inspect visitor analytics.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-white/60">Admin Username</label>
              <input
                type="text"
                required
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder="Username"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#16f2a4]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-white/60">Admin Password</label>
              <input
                type="password"
                required
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="Password"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#16f2a4]"
              />
            </div>

            {loginError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-200">
                <AlertCircle size={16} className="shrink-0 text-red-400" />
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#16f2a4] px-4 py-3 font-black text-black transition hover:bg-white"
            >
              {loginLoading ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
              Log In to Visitors
            </button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-4 text-center">
            <Link
              href="/admin1122"
              className="text-xs font-semibold text-[#16f2a4] underline underline-offset-4 hover:text-white"
            >
              Return to Portfolio Builder Admin
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 3. Authenticated Dashboard View
  return (
    <div className="min-h-screen bg-[#070b12] text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090d16]/90 px-4 py-3.5 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin1122"
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-[#16f2a4] hover:text-[#16f2a4]"
              title="Return to Builder"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[#16f2a4] animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-wider text-[#16f2a4]">Live Analytics</p>
              </div>
              <h1 className="text-xl font-black sm:text-2xl">Visitor Intelligence</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              href="/admin1122"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-bold text-white/80 transition hover:border-white/30 hover:text-white sm:text-sm"
            >
              <LayoutDashboard size={16} />
              Portfolio Builder
            </Link>

            <Link
              href="/admin/chatbot"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-bold text-white/80 transition hover:border-white/30 hover:text-white sm:text-sm"
            >
              <Bot size={16} />
              Chatbot
            </Link>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-bold text-white/80 transition hover:border-white/30 hover:text-white sm:text-sm"
            >
              <Eye size={16} />
              Live Site
            </a>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2 text-xs font-bold text-red-200 transition hover:bg-red-500/20 sm:text-sm"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        {actionMessage && (
          <div className="mx-auto mt-3 max-w-7xl">
            <div className="flex items-center justify-between rounded-xl border border-[#16f2a4]/30 bg-[#16f2a4]/10 px-4 py-2 text-xs font-semibold text-[#8affd7]">
              <span>{actionMessage}</span>
              <button type="button" onClick={() => setActionMessage(null)}>
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl p-4 sm:p-8 space-y-8">
        {/* Metric Cards Grid */}
        <section aria-label="Key Analytics">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total Page Views"
              value={stats ? stats.totalPageViews.toLocaleString() : "--"}
              subtext="Real pages served"
              icon={Eye}
            />
            <MetricCard
              label="Total Visits (Sessions)"
              value={stats ? stats.totalVisits.toLocaleString() : "--"}
              subtext="Distinct browsing sessions"
              icon={Users}
            />
            <MetricCard
              label="Unique Visitors"
              value={stats ? stats.uniqueVisitors.toLocaleString() : "--"}
              subtext="Privacy-safe first-party IDs"
              icon={HardDrive}
            />
            <MetricCard
              label="Returning Visitors"
              value={stats ? `${stats.returningVisitors.toLocaleString()} (${stats.returningRate}%)` : "--"}
              subtext="Repeat visitor estimate"
              icon={UserCheck}
            />
          </div>
        </section>

        {/* Breakdown Mini-Tables */}
        {stats && (
          <section aria-label="Audience Breakdowns" className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <BreakdownCard
              title="Top Visited Pages"
              items={stats.topPages.map((p) => ({ label: p.pathname, count: p.views }))}
              icon={Layers}
            />
            <BreakdownCard
              title="Top Countries"
              items={stats.topCountries.map((c) => ({ label: c.country, count: c.count }))}
              icon={Globe}
            />
            <BreakdownCard
              title="Browsers"
              items={stats.topBrowsers.map((b) => ({ label: b.browser, count: b.count }))}
              icon={Monitor}
            />
            <BreakdownCard
              title="Devices"
              items={stats.topDevices.map((d) => ({ label: d.device, count: d.count }))}
              icon={Laptop}
            />
          </section>
        )}

        {/* Filter & Control Bar */}
        <section className="rounded-2xl border border-white/10 bg-[#090d16] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[260px] max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search IP, country, city, path, browser, OS..."
                className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-9 py-2.5 text-xs text-white outline-none focus:border-[#16f2a4] sm:text-sm"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </form>

            {/* Date Filters & Controls */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center rounded-xl border border-white/10 bg-black/30 p-1 text-xs font-semibold">
                {(
                  [
                    ["all", "All Time"],
                    ["today", "24h"],
                    ["7d", "7 Days"],
                    ["30d", "30 Days"]
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setDateRange(key);
                      setPage(1);
                    }}
                    className={`rounded-lg px-3 py-1.5 transition ${
                      dateRange === key ? "bg-[#16f2a4] text-black font-black" : "text-white/60 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Refresh */}
              <button
                type="button"
                onClick={loadVisitors}
                disabled={loading}
                title="Refresh Records"
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-[#16f2a4] hover:text-[#16f2a4]"
              >
                <RefreshCw size={16} className={loading ? "animate-spin text-[#16f2a4]" : ""} />
              </button>

              {/* Export CSV */}
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={busyAction === "export"}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-bold text-white transition hover:border-[#16f2a4] hover:text-[#16f2a4]"
              >
                {busyAction === "export" ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
                Export CSV
              </button>

              {/* Retention Prune */}
              <button
                type="button"
                onClick={handlePruneRecords}
                disabled={busyAction === "prune"}
                title="Prune records older than 90 days according to retention policy"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-white/60 transition hover:border-red-400 hover:text-red-300"
              >
                {busyAction === "prune" ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                Prune &gt;90d
              </button>
            </div>
          </div>
        </section>

        {/* Visitors Table Section */}
        <section aria-label="Visitor Records List" className="rounded-2xl border border-white/10 bg-[#090d16] overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="text-base font-black">Logged Visits ({total.toLocaleString()})</h2>
              <p className="text-xs text-white/50">
                {search ? `Filtered by "${search}"` : "Real-time records stored in Neon PostgreSQL"}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/40">Rows:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-white outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Table Content States */}
          {loading ? (
            <div className="grid place-items-center py-20">
              <Loader2 className="animate-spin text-[#16f2a4]" size={36} />
              <p className="mt-3 text-xs text-white/50">Retrieving visitor records from database...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <AlertCircle size={36} className="mx-auto text-red-400" />
              <p className="mt-2 text-sm font-bold text-red-200">{error}</p>
              <button
                type="button"
                onClick={loadVisitors}
                className="mt-4 rounded-xl bg-[#16f2a4] px-4 py-2 text-xs font-black text-black"
              >
                Retry
              </button>
            </div>
          ) : records.length === 0 ? (
            <div className="py-20 text-center">
              <Users size={38} className="mx-auto text-white/20" />
              <p className="mt-3 text-base font-bold text-white">No visitor records found</p>
              <p className="mt-1 text-xs text-white/40">
                {search ? "Try adjusting your search keywords or date range." : "Visits will populate once traffic arrives on your live portfolio."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-black/30 uppercase text-white/40 font-bold tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Timestamp (UTC)</th>
                    <th className="px-5 py-3">Location &amp; IP</th>
                    <th className="px-5 py-3">Page Path</th>
                    <th className="px-5 py-3">Device &amp; OS</th>
                    <th className="px-5 py-3">Browser</th>
                    <th className="px-5 py-3">Referrer</th>
                    <th className="px-5 py-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {records.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedVisitor(r)}
                      className="cursor-pointer transition hover:bg-white/[0.03]"
                    >
                      {/* Timestamp */}
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="font-semibold text-white">
                          {new Date(r.visitedAt).toLocaleDateString()}
                        </div>
                        <div className="text-[11px] text-white/40">
                          {new Date(r.visitedAt).toLocaleTimeString()} UTC
                        </div>
                      </td>

                      {/* Location & IP */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">
                            {r.country || "Unknown Country"}
                          </span>
                          {r.city ? <span className="text-white/40">({r.city})</span> : null}
                          {r.isReturning && (
                            <span className="rounded-full bg-[#16f2a4]/15 px-2 py-0.5 text-[10px] font-bold text-[#16f2a4]">
                              Returning
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[11px] text-white/50">{r.ip}</div>
                      </td>

                      {/* Path */}
                      <td className="px-5 py-4">
                        <span className="rounded-md bg-white/[0.06] px-2 py-1 font-mono text-white/90">
                          {r.pathname}
                        </span>
                      </td>

                      {/* Device & OS */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <DeviceIcon type={r.deviceType} />
                          <span className="capitalize text-white/80">{r.osName || r.deviceType}</span>
                        </div>
                        {r.osVersion ? <div className="text-[11px] text-white/40">{r.osVersion}</div> : null}
                      </td>

                      {/* Browser */}
                      <td className="px-5 py-4">
                        <span className="text-white/80">{r.browserName || "Unknown"}</span>
                        {r.browserVersion ? (
                          <span className="ml-1 text-[11px] text-white/40">v{r.browserVersion}</span>
                        ) : null}
                      </td>

                      {/* Referrer */}
                      <td className="max-w-[180px] truncate px-5 py-4 text-white/50" title={r.referrer || "Direct"}>
                        {r.referrer ? (
                          <span className="underline decoration-white/20 underline-offset-2">{r.referrer}</span>
                        ) : (
                          <span className="italic text-white/30">Direct / None</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVisitor(r);
                          }}
                          className="rounded-lg border border-white/10 px-2.5 py-1 text-xs font-semibold text-white/70 transition hover:border-[#16f2a4] hover:text-[#16f2a4]"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {!loading && records.length > 0 && (
            <div className="flex flex-wrap items-center justify-between border-t border-white/10 px-5 py-3 text-xs">
              <span className="text-white/50">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total.toLocaleString()} visitors
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-white/60 transition disabled:opacity-30 hover:border-white/30 hover:text-white"
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="px-3 py-1 font-bold text-white">
                  Page {page} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-white/60 transition disabled:opacity-30 hover:border-white/30 hover:text-white"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Visitor Details Modal */}
      {selectedVisitor && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#090d16] p-6 text-white shadow-2xl sm:p-8">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase text-[#16f2a4]">Visitor Inspection</span>
                  {selectedVisitor.isReturning && (
                    <span className="rounded-full bg-[#16f2a4]/15 px-2 py-0.5 text-[10px] font-bold text-[#16f2a4]">
                      Returning Visitor
                    </span>
                  )}
                </div>
                <h3 className="mt-1 text-xl font-black">
                  {selectedVisitor.city ? `${selectedVisitor.city}, ` : ""}
                  {selectedVisitor.country || "Unknown Location"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedVisitor(null)}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/60 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid gap-4 text-xs sm:grid-cols-2">
              <DetailField
                label="IP Address"
                value={selectedVisitor.ip}
                onCopy={() => copyToClipboard(selectedVisitor.ip, "ip")}
                copied={copiedField === "ip"}
              />

              <DetailField
                label="Visit Timestamp (UTC)"
                value={selectedVisitor.visitedAt}
                subvalue={new Date(selectedVisitor.visitedAt).toLocaleString()}
              />

              <DetailField
                label="Visitor ID (1st-party token)"
                value={selectedVisitor.visitorId}
                onCopy={() => copyToClipboard(selectedVisitor.visitorId, "vid")}
                copied={copiedField === "vid"}
              />

              <DetailField
                label="Session ID"
                value={selectedVisitor.sessionId}
                onCopy={() => copyToClipboard(selectedVisitor.sessionId, "sid")}
                copied={copiedField === "sid"}
              />

              <DetailField label="Visited Path" value={selectedVisitor.pathname} />

              <DetailField
                label="Referral Source"
                value={selectedVisitor.referrer || "Direct (None)"}
              />

              <DetailField
                label="Location Coordinates / Region"
                value={
                  selectedVisitor.region
                    ? `${selectedVisitor.region}, ${selectedVisitor.country}`
                    : selectedVisitor.country || "Unknown"
                }
              />

              <DetailField
                label="Device Category"
                value={selectedVisitor.deviceType.toUpperCase()}
              />

              <DetailField
                label="Operating System"
                value={`${selectedVisitor.osName} ${selectedVisitor.osVersion}`.trim() || "Unknown"}
              />

              <DetailField
                label="Browser"
                value={`${selectedVisitor.browserName} ${selectedVisitor.browserVersion}`.trim() || "Unknown"}
              />

              <DetailField
                label="Screen Resolution"
                value={selectedVisitor.screenResolution || "Not reported"}
              />

              <DetailField
                label="Preferred Language"
                value={selectedVisitor.language || "Not reported"}
              />

              <DetailField
                label="Timezone"
                value={selectedVisitor.timezone || "Not reported"}
              />
            </div>

            {/* Raw User Agent */}
            <div className="mt-5 rounded-xl border border-white/10 bg-black/40 p-4">
              <p className="font-mono text-[11px] uppercase text-white/40">Raw User Agent</p>
              <p className="mt-1 break-all font-mono text-xs leading-relaxed text-white/70">
                {selectedVisitor.userAgent || "None reported"}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedVisitor(null)}
                className="rounded-full bg-[#16f2a4] px-6 py-2.5 text-xs font-bold text-black hover:bg-white"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  subtext,
  icon: Icon
}: {
  label: string;
  value: string;
  subtext: string;
  icon: typeof Eye;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#090d16] p-5 transition hover:border-white/20">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-white/40">{label}</p>
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#16f2a4]/10 text-[#16f2a4]">
          <Icon size={18} />
        </div>
      </div>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs text-white/40">{subtext}</p>
    </div>
  );
}

function BreakdownCard({
  title,
  items,
  icon: Icon
}: {
  title: string;
  items: Array<{ label: string; count: number }>;
  icon: typeof Globe;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#090d16] p-4">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <Icon size={16} className="text-[#16f2a4]" />
        <h4 className="text-xs font-black uppercase tracking-wider text-white/80">{title}</h4>
      </div>
      <div className="mt-3 space-y-2">
        {items.length === 0 ? (
          <p className="text-xs italic text-white/30">No data</p>
        ) : (
          items.map((it, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="truncate max-w-[150px] font-mono text-white/70" title={it.label}>
                {it.label}
              </span>
              <span className="rounded bg-white/[0.05] px-2 py-0.5 font-bold text-[#16f2a4]">
                {it.count.toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
  subvalue,
  onCopy,
  copied
}: {
  label: string;
  value: string;
  subvalue?: string;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3.5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-wider text-white/40">{label}</p>
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="text-white/40 hover:text-[#16f2a4]"
            title="Copy"
          >
            {copied ? <Check size={12} className="text-[#16f2a4]" /> : <Copy size={12} />}
          </button>
        )}
      </div>
      <p className="mt-1 break-all font-semibold text-white/90">{value || "None"}</p>
      {subvalue && <p className="mt-0.5 text-[11px] text-white/40">{subvalue}</p>}
    </div>
  );
}

function DeviceIcon({ type }: { type: string }) {
  if (type === "mobile") return <Smartphone size={14} className="text-[#16f2a4]" />;
  if (type === "tablet") return <Tablet size={14} className="text-[#16f2a4]" />;
  return <Laptop size={14} className="text-white/60" />;
}
