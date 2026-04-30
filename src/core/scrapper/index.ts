import { chromium } from "playwright-extra";
import { getBrowser } from "../browser.js";
import stealth from "puppeteer-extra-plugin-stealth";

const stealthPlugin = stealth();
// Remove evasions that are currently flagged by modern security
stealthPlugin.enabledEvasions.delete("iframe.contentWindow");
stealthPlugin.enabledEvasions.delete("media.codecs");

chromium.use(stealthPlugin);

type ScrapperOptions = {
  storageFile?: string;
};

export const scrapperBrowser = async (options: ScrapperOptions = {}) => {
  const { storageFile } = options;

  let context;
  let browser;

  if (process.platform === "win32") {
    // ✅ Persistent context (local)
    context = await chromium.launchPersistentContext("C:/playwright-profile", {
      headless: false,
      channel: "chrome",
      // ✅ THIS REMOVES THE BANNER
      ignoreDefaultArgs: ["--enable-automation"],
      args: [
        "--disable-blink-features=AutomationControlled",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--start-maximized", // Forces Chromium to start maximized
      ],

      viewport: { width: 1366, height: 768 },
      screen: { width: 1366, height: 768 },

      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",

      locale: "en-IN",
      timezoneId: "Asia/Kolkata",
    });
  } else {
    // ✅ GitHub / CI
    browser = await getBrowser(true);

    context = await browser.newContext({
      viewport: { width: 1366, height: 768 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      locale: "en-IN",
      timezoneId: "Asia/Kolkata",
      extraHTTPHeaders: {
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
  }

  // ✅ stealth tweak
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => undefined,
    });
  });

  const page = await context.newPage();

  return { browser, context, page };
};
