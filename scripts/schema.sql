CREATE TABLE IF NOT EXISTS site_content (
  id INTEGER PRIMARY KEY,
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_data (
  data_key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visitor_analytics (
  id BIGSERIAL PRIMARY KEY,
  visitor_id VARCHAR(64) NOT NULL,
  session_id VARCHAR(64) NOT NULL,
  ip VARCHAR(64) NOT NULL,
  country VARCHAR(100),
  region VARCHAR(100),
  city VARCHAR(100),
  pathname VARCHAR(500) NOT NULL,
  referrer VARCHAR(1000),
  user_agent TEXT,
  browser_name VARCHAR(100),
  browser_version VARCHAR(50),
  os_name VARCHAR(100),
  os_version VARCHAR(50),
  device_type VARCHAR(50),
  screen_resolution VARCHAR(50),
  language VARCHAR(50),
  timezone VARCHAR(100),
  is_returning BOOLEAN DEFAULT FALSE,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_va_visited_at ON visitor_analytics (visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_va_visitor_id ON visitor_analytics (visitor_id);
CREATE INDEX IF NOT EXISTS idx_va_session_id ON visitor_analytics (session_id);
CREATE INDEX IF NOT EXISTS idx_va_pathname ON visitor_analytics (pathname);
CREATE INDEX IF NOT EXISTS idx_va_country ON visitor_analytics (country);
