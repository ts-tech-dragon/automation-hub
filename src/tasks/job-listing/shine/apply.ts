import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import type { Page, Browser, BrowserContext, ElementHandle } from "playwright";
import {
  launchHumanBrowser,
  humanClick,
  humanScroll,
  humanDelay,
  simulateReading,
  idleMouseMovement,
  randInt,
  log,
} from "../../../../lib/helpers/human.js";
import { delay } from "../../../../lib/helpers/index.js";
import { ENV_VARS } from "../../../../lib/constants/index.js";
import { extractQuestionnaireModal } from "./questionModel.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const STORAGE_PATH = path.resolve("src/auth/storage/shine_auth.json");

const DASHBOARD_URL =
  "https://www.shine.com/job-search/react-dot-js-html5-jobs-in-chennai?q=reactjs-html5&qActual=React.js%20Html5%2C%20&loc=Chennai&minexp=5&suid=1d8e570e-5b25-4948-9cc1-548e1f0567d6&sort=1";

const runApplyShine = async (shineURL: string) => {
  const pageURL = shineURL || DASHBOARD_URL;
  const { browser, context, page } = (await launchHumanBrowser(
    STORAGE_PATH,
    ENV_VARS.SHINE_STORAGE_JSON,
  )) as {
    browser: Browser;
    context: BrowserContext;
    page: Page;
  };
  try {
    log("Navigating to Shine dashboard...");
    await page.goto(pageURL, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await humanDelay(2000, 4000);
    await humanScroll(page, "down", randInt(100, 300));
    await humanDelay(1000, 2000);

    if (page.url().includes("login") || page.url().includes("signin")) {
      log("Session expired. Please login again.", "error");
      process.exit(1);
    }

    let totalApplied = 0;

    for (let i = 0; i < 20; i++) {
      await humanScroll(page, "down", randInt(100, 300));
      const applyCards = page.locator(`[data-card-index='${i}']`);
      await applyCards.waitFor({ state: "visible" });
      if (!applyCards) continue;
      const applyButton = applyCards
        .locator("button")
        .filter({ hasText: "Apply" });
      await applyButton.waitFor({ state: "visible" });
      await applyButton.click();
      log("Clicked Apply. Monitoring for questionnaire...");

      const questionnaire = page.locator(".questionnaireWrap");
      // 2. Conditional Check
      // We use isVisible() after a short delay to see if it's actually there
      await humanDelay(2000, 3000);
      if (await questionnaire.isVisible()) {
        await extractQuestionnaireModal(page);
      }
      await humanDelay(2000, 4000);
      await humanScroll(page, "down", randInt(100, 300));
      await humanDelay(1000, 2000);
      totalApplied++;
    }
    console.log(`Applied for ${totalApplied} Jobs 💌💥`);
  } catch (error) {
    console.log("runApplyShine error : ", (error as Error).message);
    // --- SCREENSHOT LOGIC START ---
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const screenshotPath = path.join(`shine_load_${timestamp}.png`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });
    log(`📸 Screenshot captured at: ${screenshotPath}`);
  } finally {
    await browser.close();
    await context.close();
  }
};

export default runApplyShine;
