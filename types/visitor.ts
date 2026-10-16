export type VisitorRecord = {
  id: number;
  visitorId: string;
  sessionId: string;
  ip: string;
  country: string;
  region: string;
  city: string;
  pathname: string;
  referrer: string;
  userAgent: string;
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  screenResolution: string;
  language: string;
  timezone: string;
  isReturning: boolean;
  visitedAt: string; // ISO 8601 UTC
};

export type VisitorLogInput = {
  visitorId: string;
  sessionId: string;
  ip: string;
  country?: string;
  region?: string;
  city?: string;
  pathname: string;
  referrer?: string;
  userAgent?: string;
  browserName?: string;
  browserVersion?: string;
  osName?: string;
  osVersion?: string;
  deviceType?: "desktop" | "mobile" | "tablet" | "unknown";
  screenResolution?: string;
  language?: string;
  timezone?: string;
};

export type VisitorStats = {
  totalPageViews: number;
  totalVisits: number;
  uniqueVisitors: number;
  returningVisitors: number;
  returningRate: number; // percentage 0-100
  topPages: Array<{ pathname: string; views: number }>;
  topCountries: Array<{ country: string; count: number }>;
  topBrowsers: Array<{ browser: string; count: number }>;
  topDevices: Array<{ device: string; count: number }>;
};

export type VisitorFilter = {
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};
