import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";

const stealthPlugin = stealth();
// Remove evasions that are currently flagged by modern security
stealthPlugin.enabledEvasions.delete("iframe.contentWindow");
stealthPlugin.enabledEvasions.delete("media.codecs");

chromium.use(stealthPlugin);

export const getBrowser = async (headless: boolean = true) => {
  const options: any = {
    headless,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--disable-dev-shm-usage",
    ],
  };

  // Only use the Windows path if we are actually on Windows
  if (process.platform === "win32") {
    options.executablePath =
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  }

  // On Linux (GitHub Actions), Playwright will use the bundled Chromium automatically
  return await chromium.launch(options);
};
