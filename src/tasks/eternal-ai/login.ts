import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";
import {
  ETERNAL_SESSION_PATH,
  ensureAuthFile,
} from "../../core/auth-helper.js";
import readline from "node:readline";

chromium.use(stealth());

async function captureLogin() {
  ensureAuthFile();
  console.log("🚀 Launching browser...");

  const context = await chromium.launchPersistentContext("./temp_user_data", {
    headless: false,
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const page = context.pages()[0] || (await context.newPage());
  await page.goto("https://eternalai.org/");

  console.log("\n---------------------------------------------------");
  console.log("1. Log in manually in the browser window.");
  console.log("2. Once you are fully logged in and see the dashboard...");
  console.log("3. Come back here and PRESS ENTER to save the session.");
  console.log("---------------------------------------------------\n");

  // This waits for you to press Enter in the terminal
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  await new Promise((resolve) => rl.question("", resolve));
  rl.close();

  // Save the state now
  await context.storageState({ path: ETERNAL_SESSION_PATH });
  console.log(`✅ Session captured and saved to: ${ETERNAL_SESSION_PATH}`);

  await context.close();
  console.log("👋 Browser closed. You can now run the claim script.");
}

captureLogin();
