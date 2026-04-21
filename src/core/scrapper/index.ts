import { chromium } from "playwright-extra";
import { getBrowser } from "../browser.js";

export const scrapperBrowser = async () => {
  let context;
  let browser;

  if (process.platform === "win32") {
    // ✅ Local → persistent session
    context = await chromium.launchPersistentContext("C:/playwright-profile", {
      headless: false,
      channel: "chrome",
      args: ["--disable-blink-features=AutomationControlled"],

      viewport: { width: 1366, height: 768 },
      screen: { width: 1366, height: 768 },

      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",

      locale: "en-IN",
      timezoneId: "Asia/Kolkata",
    });
  } else {
    // ✅ GitHub Actions → normal browser
    browser = await getBrowser(true);

    context = await browser.newContext({
      viewport: { width: 1366, height: 768 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      locale: "en-IN",
      timezoneId: "Asia/Kolkata",
    });
  }

  // ✅ Common init script
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => undefined,
    });
  });

  const page = await context.newPage();

  return { browser, context, page };
};
