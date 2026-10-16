"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const VISITOR_ID_KEY = "_va_vid";
const SESSION_ID_KEY = "_va_sid";

function getOrCreateVisitorId(): string {
  try {
    let vid = window.localStorage.getItem(VISITOR_ID_KEY);
    if (!vid) {
      vid = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `v_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      window.localStorage.setItem(VISITOR_ID_KEY, vid);
    }
    return vid;
  } catch {
    return `v_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

function getOrCreateSessionId(): string {
  try {
    let sid = window.sessionStorage.getItem(SESSION_ID_KEY);
    if (!sid) {
      sid = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `s_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      window.sessionStorage.setItem(SESSION_ID_KEY, sid);
    }
    return sid;
  } catch {
    return `s_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

export default function VisitorTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<{ path: string; time: number }>({ path: "", time: 0 });

  useEffect(() => {
    // 1. Skip admin routes and API routes
    if (
      !pathname ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/admin1122") ||
      pathname.startsWith("/api")
    ) {
      return;
    }

    // 2. StrictMode / rapid navigation deduplication
    const now = Date.now();
    if (lastTracked.current.path === pathname && now - lastTracked.current.time < 3000) {
      return;
    }
    lastTracked.current = { path: pathname, time: now };

    // 3. Check browser Do Not Track preference
    if (typeof navigator !== "undefined" && (navigator.doNotTrack === "1" || (window as unknown as { doNotTrack?: string }).doNotTrack === "1")) {
      return;
    }

    // 4. Gather client attributes
    const visitorId = getOrCreateVisitorId();
    const sessionId = getOrCreateSessionId();
    const referrer = typeof document !== "undefined" ? document.referrer : "";
    const screenResolution = typeof window !== "undefined" && window.screen ? `${window.screen.width}x${window.screen.height}` : "";
    const language = typeof navigator !== "undefined" ? navigator.language : "";
    let timezone = "";
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      timezone = "";
    }

    // 5. Send tracking request (non-blocking)
    try {
      const payload = {
        pathname,
        visitorId,
        sessionId,
        referrer,
        screenResolution,
        language,
        timezone
      };

      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {
        // Silently swallow analytics network errors
      });
    } catch {
      // Fail safely
    }
  }, [pathname]);

  return null;
}
