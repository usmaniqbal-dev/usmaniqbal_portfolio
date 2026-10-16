export type ParsedUserAgent = {
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  isBot: boolean;
  botName?: string;
};

const BOT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /yandexbot/i,
  /duckduckbot/i,
  /baiduspider/i,
  /petalbot/i,
  /slurp/i,
  /sogou/i,
  /exabot/i,
  /facebookexternalhit/i,
  /facebot/i,
  /ia_archiver/i,
  /linkedinbot/i,
  /twitterbot/i,
  /whatsapp/i,
  /telegrambot/i,
  /pinterest/i,
  /semrushbot/i,
  /ahrefsbot/i,
  /dotbot/i,
  /rogerbot/i,
  /screaming frog/i,
  /uptime/i,
  /pingdom/i,
  /headlesschrome/i,
  /phantomjs/i,
  /puppeteer/i,
  /playwright/i,
  /selenium/i,
  /python-requests/i,
  /python/i,
  /curl/i,
  /wget/i,
  /postman/i,
  /httpclient/i,
  /axios/i,
  /fetch/i,
  /bot\b/i,
  /spider\b/i,
  /crawler\b/i
];

export function parseUserAgent(uaString: string | null | undefined): ParsedUserAgent {
  if (!uaString) {
    return {
      browserName: "Unknown",
      browserVersion: "",
      osName: "Unknown",
      osVersion: "",
      deviceType: "unknown",
      isBot: false
    };
  }

  // 1. Check if bot
  for (const pattern of BOT_PATTERNS) {
    if (pattern.test(uaString)) {
      const match = uaString.match(pattern);
      return {
        browserName: "Bot",
        browserVersion: "",
        osName: "Bot",
        osVersion: "",
        deviceType: "unknown",
        isBot: true,
        botName: match ? match[0] : "Bot"
      };
    }
  }

  // 2. Detect Device Type
  let deviceType: "desktop" | "mobile" | "tablet" | "unknown" = "desktop";
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(uaString)) {
    deviceType = "tablet";
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(uaString)) {
    deviceType = "mobile";
  }

  // 3. Detect Operating System
  let osName = "Unknown";
  let osVersion = "";

  if (/Windows NT 10.0/i.test(uaString)) {
    osName = "Windows";
    osVersion = "10 / 11";
  } else if (/Windows NT 6.3/i.test(uaString)) {
    osName = "Windows";
    osVersion = "8.1";
  } else if (/Windows NT 6.2/i.test(uaString)) {
    osName = "Windows";
    osVersion = "8";
  } else if (/Windows NT 6.1/i.test(uaString)) {
    osName = "Windows";
    osVersion = "7";
  } else if (/Windows NT/i.test(uaString)) {
    osName = "Windows";
  } else if (/Macintosh|Mac OS X/i.test(uaString)) {
    osName = "macOS";
    const match = uaString.match(/Mac OS X (\d+[._]\d+(?:[._]\d+)?)/i);
    if (match) osVersion = match[1].replace(/_/g, ".");
  } else if (/iPhone|iPad|iPod/i.test(uaString)) {
    osName = "iOS";
    const match = uaString.match(/OS (\d+[._]\d+(?:[._]\d+)?)/i);
    if (match) osVersion = match[1].replace(/_/g, ".");
  } else if (/Android/i.test(uaString)) {
    osName = "Android";
    const match = uaString.match(/Android (\d+(?:\.\d+)?)/i);
    if (match) osVersion = match[1];
  } else if (/CrOS/i.test(uaString)) {
    osName = "Chrome OS";
  } else if (/Linux/i.test(uaString)) {
    osName = "Linux";
  }

  // 4. Detect Browser Name & Version
  let browserName = "Unknown";
  let browserVersion = "";

  if (/Edg(?:e|A|iOS)?\/(\d+(\.\d+)?)/i.test(uaString)) {
    browserName = "Edge";
    const match = uaString.match(/Edg(?:e|A|iOS)?\/(\d+(\.\d+)?)/i);
    if (match) browserVersion = match[1];
  } else if (/OPR\/(\d+(\.\d+)?)|Opera\/(\d+(\.\d+)?)/i.test(uaString)) {
    browserName = "Opera";
    const match = uaString.match(/(?:OPR|Opera)\/(\d+(\.\d+)?)/i);
    if (match) browserVersion = match[1];
  } else if (/SamsungBrowser\/(\d+(\.\d+)?)/i.test(uaString)) {
    browserName = "Samsung Internet";
    const match = uaString.match(/SamsungBrowser\/(\d+(\.\d+)?)/i);
    if (match) browserVersion = match[1];
  } else if (/Chrome\/(\d+(\.\d+)?)/i.test(uaString) && !/Chromium/i.test(uaString)) {
    browserName = "Chrome";
    const match = uaString.match(/Chrome\/(\d+(\.\d+)?)/i);
    if (match) browserVersion = match[1];
  } else if (/Firefox\/(\d+(\.\d+)?)/i.test(uaString)) {
    browserName = "Firefox";
    const match = uaString.match(/Firefox\/(\d+(\.\d+)?)/i);
    if (match) browserVersion = match[1];
  } else if (/Safari\/(\d+(\.\d+)?)/i.test(uaString) && /Version\/(\d+(\.\d+)?)/i.test(uaString)) {
    browserName = "Safari";
    const match = uaString.match(/Version\/(\d+(\.\d+)?)/i);
    if (match) browserVersion = match[1];
  }

  return {
    browserName,
    browserVersion,
    osName,
    osVersion,
    deviceType,
    isBot: false
  };
}
