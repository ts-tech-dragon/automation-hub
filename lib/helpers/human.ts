// scripts/human.js
// Utilities to simulate realistic human browser behavior

import { chromium } from "playwright";
import { resolveStorageState } from "./web-scrapper/index.js";

/**
 * Random integer between min and max (inclusive)
 */
export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Random float between min and max
 */
export function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Human-like delay: normally distributed around a mean, with occasional long pauses
 */
export async function humanDelay(minMs = 800, maxMs = 2500) {
  // Occasionally simulate a longer pause (reading, distraction)
  const longPause = Math.random() < 0.08; // 8% chance
  const delay = longPause ? randInt(3000, 7000) : randInt(minMs, maxMs);
  await sleep(delay);
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Move mouse along a bezier curve path to a target element
 * Mimics natural hand movement instead of teleporting
 */
export async function humanMouseMove(page, targetX, targetY) {
  const steps = randInt(15, 30);
  const currentPos = { x: randInt(200, 800), y: randInt(200, 600) };

  // Generate bezier control points for a natural curved path
  const cp1 = {
    x: currentPos.x + randInt(-100, 100),
    y: currentPos.y + randInt(-80, 80),
  };
  const cp2 = {
    x: targetX + randInt(-60, 60),
    y: targetY + randInt(-60, 60),
  };

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Cubic bezier formula
    const x = Math.round(
      Math.pow(1 - t, 3) * currentPos.x +
        3 * Math.pow(1 - t, 2) * t * cp1.x +
        3 * (1 - t) * Math.pow(t, 2) * cp2.x +
        Math.pow(t, 3) * targetX,
    );
    const y = Math.round(
      Math.pow(1 - t, 3) * currentPos.y +
        3 * Math.pow(1 - t, 2) * t * cp1.y +
        3 * (1 - t) * Math.pow(t, 2) * cp2.y +
        Math.pow(t, 3) * targetY,
    );
    await page.mouse.move(x, y);
    await sleep(randInt(8, 20)); // Variable speed
  }
}

/**
 * Human-like click: move mouse naturally, hover briefly, then click
 */
export async function humanClick(page: any, element: any) {
  const box = await element.boundingBox();
  if (!box) throw new Error("Element has no bounding box");

  // Click slightly off-center (humans rarely click exact center)
  const targetX = box.x + box.width * randFloat(0.3, 0.7);
  const targetY = box.y + box.height * randFloat(0.3, 0.7);

  await humanMouseMove(page, targetX, targetY);
  await sleep(randInt(80, 250)); // Brief hover before clicking
  await page.mouse.click(targetX, targetY);
}

/**
 * Scroll the page naturally, with variable speed and small pauses
 */
export async function humanScroll(
  page: any,
  direction = "down",
  amount = null,
) {
  const scrollAmount = amount || randInt(200, 600);
  const steps = randInt(4, 10);
  const stepSize = scrollAmount / steps;

  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, direction === "down" ? stepSize : -stepSize);
    await sleep(randInt(40, 120));
  }

  // Pause after scrolling like a human reading
  await sleep(randInt(500, 1500));
}

/**
 * Simulate reading time based on content length
 */
export async function simulateReading(textLength = 100) {
  // Average reading speed ~200 words/min, ~5 chars/word
  const wordsPerMin = randInt(150, 250);
  const words = textLength / 5;
  const readTimeMs = (words / wordsPerMin) * 60 * 1000;
  const clampedTime = Math.min(Math.max(readTimeMs, 800), 5000);
  await sleep(clampedTime + randInt(-200, 400));
}

/**
 * Occasionally move mouse aimlessly (idle behavior)
 */
export async function idleMouseMovement(page: any) {
  if (Math.random() < 0.3) {
    const x = randInt(100, 1200);
    const y = randInt(100, 700);
    await humanMouseMove(page, x, y);
    await sleep(randInt(200, 600));
  }
}

/**
 * Launch a browser that looks like a real user's Chrome
 */
export async function launchHumanBrowser(
  localStoragePath: string | null = null,
) {
  const isLocal = process.platform === "win32";

  const browser = await chromium.launch({
    headless: !isLocal,
    channel: "chrome",
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-infobars",
    ],
  });

  const contextOptions: any = {
    viewport: isLocal ? null : { width: 1366, height: 768 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    locale: "en-IN",
    timezoneId: "Asia/Kolkata",
    geolocation: { longitude: 80.2707, latitude: 13.0827 },
    permissions: ["geolocation"],
    extraHTTPHeaders: {
      "Accept-Language": "en-IN,en;q=0.9",
    },
  };

  const finalStoragePath = await resolveStorageState(
    localStoragePath as string,
    "FOUNDIT_STORAGE_JSON",
  );

  if (finalStoragePath) {
    contextOptions.storageState = finalStoragePath;
  }

  const context = await browser.newContext(contextOptions);

  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => undefined,
    });

    Object.defineProperty(navigator, "plugins", {
      get: () => [1, 2, 3, 4, 5],
    });

    Object.defineProperty(navigator, "languages", {
      get: () => ["en-IN", "en"],
    });

    Object.defineProperty(navigator, "platform", {
      get: () => "Win32",
    });

    // @ts-ignore
    window.chrome = { runtime: {} };
  });

  const page = await context.newPage();

  return { browser, context, page };
}

export function log(
  msg: string,
  type: "info" | "success" | "warn" | "error" = "info",
) {
  const icons = { info: "ℹ️", success: "✅", warn: "⚠️", error: "❌" };
  console.log(`${icons[type]} ${msg}`);
}
