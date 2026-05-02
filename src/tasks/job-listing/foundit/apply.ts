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
import { acceptFounditCookie } from "./acceptCookie.js";
import { delay } from "../../../../lib/helpers/index.js";
import { ENV_VARS } from "../../../../lib/constants/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const STORAGE_PATH = path.resolve("src/auth/storage/foundin_auth.json");
const LOG_PATH = path.resolve("lib/logs/foundin_applied_logs.json");
const DASHBOARD_URL =
  "https://www.foundit.in/search/react-js-jobs-in-chennai?start=1&limit=20&query=react+js%2Cfrontend+developer%2Cnext+js%2Cjavascript%2Ctypescript&location=Chennai&experienceRanges=2%7E3&queryDerived=true&jobFreshness=7&quickApplyJob=Show+Quick+Apply+Job";

const CONFIG = {
  maxJobsPerRun: 40,
  screenshotOnError: true,
};

type HistoryEntry = {
  title: string;
  time: string;
};

type ErrorEntry = {
  index: number;
  error: string;
  time: string;
};

type ApplyHistory = {
  applied: HistoryEntry[];
  skipped: HistoryEntry[];
  errors: ErrorEntry[];
  lastRun: string | null;
};

function loadHistory(): ApplyHistory {
  try {
    if (fs.existsSync(LOG_PATH)) {
      return JSON.parse(fs.readFileSync(LOG_PATH, "utf-8"));
    }
  } catch {}

  return {
    applied: [],
    skipped: [],
    errors: [],
    lastRun: null,
  };
}

function saveHistory(data: ApplyHistory) {
  data.lastRun = new Date().toISOString();
  fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
  fs.writeFileSync(LOG_PATH, JSON.stringify(data, null, 2));
}

export async function applyToFoundItJobs(foundItURL: string): Promise<void> {
  const history = loadHistory();
  log(`History Loaded: ${history.applied.length} applied jobs already.`);

  const { browser, context, page } = (await launchHumanBrowser(
    STORAGE_PATH,
    ENV_VARS.FOUNDIT_STORAGE_JSON,
  )) as {
    browser: Browser;
    context: BrowserContext;
    page: Page;
  };

  const pageURL = foundItURL || DASHBOARD_URL;

  try {
    log("Navigating to Foundit dashboard...");
    await page.goto(pageURL, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // ✅ Handle cookie banner if present
    await acceptFounditCookie(page);

    await humanDelay(2000, 4000);
    await humanScroll(page, "down", randInt(100, 300));
    await humanDelay(1000, 2000);

    if (page.url().includes("login") || page.url().includes("signin")) {
      log("Session expired. Please login again.", "error");
      process.exit(1);
    }

    log("Dashboard loaded successfully", "success");

    let totalApplied = 0;

    log(`--- Processing Page  ---`);

    try {
      await page.waitForSelector(
        '[class*="job"], [class*="Job"], [data-qa*="job"]',
        {
          timeout: 12000,
        },
      );
    } catch {
      log("No jobs found on this page.", "warn");
    }

    await humanDelay(1500, 2500);
    await idleMouseMovement(page);
    await humanScroll(page, "down", randInt(200, 400));

    const batchCount = await tryBatchApply(page, history);

    if (batchCount > 0) {
      totalApplied += batchCount;
    } else {
      const singleCount = await tryIndividualApply(page, history);
      totalApplied += singleCount;
    }

    await humanDelay(3000, 6000);

    log(`Run completed. Applied this run: ${totalApplied}`, "success");
    delay(2000, 10000);
  } catch (err) {
    log(`Fatal Error: ${(err as Error).message}`, "error");

    if (CONFIG.screenshotOnError) {
      const p = path.resolve(`src/lib/logs/error_${Date.now()}.png`);
      await page.screenshot({ path: p, fullPage: true });
      log(`Screenshot saved: ${p}`, "warn");
    }
  } finally {
    await browser.close();
  }
}

async function tryBatchApply(
  page: Page,
  history: ApplyHistory,
): Promise<number> {
  let applied = 0;

  try {
    const selectAllLabel = page
      .locator('label[for="quick-apply-check"]')
      .first();

    const isCheckBoxVisible = await selectAllLabel
      .isVisible()
      .catch(() => false);

    if (isCheckBoxVisible) {
      await humanDelay(800, 1500);

      const labelHandle = await selectAllLabel.elementHandle();
      if (labelHandle) {
        await humanClick(page, labelHandle);
        log("Clicked Select All quick apply checkbox", "success");
        await humanDelay(1000, 1800);
      }
    }

    // ✅ Handle cookie banner if present
    await acceptFounditCookie(page);

    // ✅ wait for sticky footer bulk apply panel
    const quickApplyBtn = page
      .locator('#bulk_apply_buttons button:has-text("Quick Apply")')
      .first();

    const visible = await quickApplyBtn.isVisible().catch(() => false);

    if (!visible) {
      log("Bulk Quick Apply button not visible after selection", "warn");
      return 0;
    }

    await humanDelay(1000, 1800);
    await idleMouseMovement(page);

    await quickApplyBtn.click();
    log("Clicked bottom sticky Quick Apply", "success");
    await humanDelay(1500, 2500);

    applied += await handleModal(page, history);
  } catch (err) {
    log(`Batch apply failed: ${(err as Error).message}`, "warn");
  }

  return applied;
}

async function tryIndividualApply(
  page: Page,
  history: ApplyHistory,
): Promise<number> {
  let applied = 0;

  // ✅ Handle cookie banner if present
  await acceptFounditCookie(page);

  let buttons = await page
    .locator('button:has-text("Quick Apply"), a:has-text("Quick Apply")')
    .elementHandles();

  if (buttons.length === 0) {
    log("No Quick Apply buttons found", "warn");
    return 0;
  }

  for (let i = 0; i < buttons.length; i++) {
    const btn = buttons[i];

    try {
      await btn?.scrollIntoViewIfNeeded();
      await humanDelay(500, 1200);

      const btnText = ((await btn?.textContent()) || "").toLowerCase();
      if (btnText.includes("applied")) continue;

      await idleMouseMovement(page);
      await humanClick(page, btn);
      await humanDelay(1200, 2200);

      const confirmed = await handleModal(page, history);

      if (confirmed > 0) {
        applied++;
        history.applied.push({
          title: `Job-${i + 1}`,
          time: new Date().toISOString(),
        });
      }

      await humanDelay(2000, 5000);
    } catch (err) {
      history.errors.push({
        index: i,
        error: (err as Error).message,
        time: new Date().toISOString(),
      });
    }
  }

  return applied;
}

async function handleModal(page: Page, history: ApplyHistory): Promise<number> {
  const confirmBtn = page
    .locator(
      'button:has-text("Confirm"), button:has-text("Submit"), button:has-text("Apply Now")',
    )
    .first();

  if (await confirmBtn.isVisible().catch(() => false)) {
    await humanDelay(800, 1500);
    await humanClick(page, (await confirmBtn.elementHandle()) as ElementHandle);
    await humanDelay(1200, 2000);
    await page.keyboard.press("Escape").catch(() => {});
    return 1;
  }

  return 1;
}
