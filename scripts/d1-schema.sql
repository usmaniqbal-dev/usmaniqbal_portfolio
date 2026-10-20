-- D1 Database Schema for Usman Iqbal Portfolio
CREATE TABLE IF NOT EXISTS site_content (
  id INTEGER PRIMARY KEY,
  content TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS app_data (
  data_key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS visitor_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  ip TEXT NOT NULL,
  country TEXT,
  region TEXT,
  city TEXT,
  pathname TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  browser_name TEXT,
  browser_version TEXT,
  os_name TEXT,
  os_version TEXT,
  device_type TEXT,
  screen_resolution TEXT,
  language TEXT,
  timezone TEXT,
  is_returning INTEGER DEFAULT 0,
  visited_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_va_visited_at ON visitor_analytics (visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_va_visitor_id ON visitor_analytics (visitor_id);
CREATE INDEX IF NOT EXISTS idx_va_session_id ON visitor_analytics (session_id);
CREATE INDEX IF NOT EXISTS idx_va_pathname ON visitor_analytics (pathname);
CREATE INDEX IF NOT EXISTS idx_va_country ON visitor_analytics (country);
