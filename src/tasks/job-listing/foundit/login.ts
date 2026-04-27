// scripts/login.js
// Step 1: Login to foundit.in and save authentication state

import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORAGE_PATH = path.join(
  __dirname,
  "../../../auth/storage/foundin_auth.json",
);

async function foundItLogin() {
  console.log("\n🔐 Foundit.in Login\n");
  console.log("A browser window will open. Please:");
  console.log("  1. Log in to your foundit.in account manually");
  console.log("  2. Wait until you reach the dashboard");
  console.log("  3. Press ENTER in this terminal to save your session\n");

  // Ensure storage directory exists
  fs.mkdirSync(path.dirname(STORAGE_PATH), { recursive: true });

  const browser = await chromium.launch({
    headless: false,
    args: ["--start-maximized"],
  });

  const context = await browser.newContext({
    viewport: null,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  console.log("🌐 Opening foundit.in login page...");
  await page.goto("https://www.foundit.in/login", {
    waitUntil: "domcontentloaded",
  });

  console.log("\n⏳ Waiting for you to log in...");
  console.log(
    "   (Press ENTER in this terminal once you reach the dashboard)\n",
  );

  // Wait for user to press Enter
  await new Promise((resolve) => {
    process.stdin.setRawMode(false);
    process.stdin.resume();
    process.stdin.once("data", resolve);
  });

  // Verify login was successful by checking URL or page content
  const currentUrl = page.url();
  if (currentUrl.includes("/login") && !currentUrl.includes("dashboard")) {
    console.log("\n⚠️  Warning: You may not be fully logged in yet.");
    console.log("   Current URL:", currentUrl);
    console.log("   Saving session anyway...\n");
  } else {
    console.log("\n✅ Login detected! Current URL:", currentUrl);
  }

  // Save storage state (cookies + localStorage)
  await context.storageState({ path: STORAGE_PATH });
  console.log(`\n💾 Session saved to: ${STORAGE_PATH}`);
  console.log("✅ You can now run: npm run apply\n");

  await browser.close();
  process.exit(0);
}

foundItLogin().catch((err) => {
  console.error("\n❌ Login failed:", err.message);
  process.exit(1);
});
