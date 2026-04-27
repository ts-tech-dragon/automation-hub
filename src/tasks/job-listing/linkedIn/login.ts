import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";
import readline from "node:readline";
import { LINKEDIN_SESSION_PATH as SESSION_PATH } from "../../../core/auth-helper.js";

chromium.use(stealth());

async function captureLogin() {
  console.log("🚀 Launching browser...");

  const context = await chromium.launchPersistentContext(
    "C:/playwright-profile", // ✅ FIXED
    {
      headless: false,
      channel: "chrome",
      args: ["--disable-blink-features=AutomationControlled"],
    },
  );

  const page = context.pages()[0] || (await context.newPage());
  await page.goto(
    "https://www.linkedin.com/login?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin",
  );

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
  await context.storageState({ path: SESSION_PATH });
  console.log(`✅ Session captured and saved to: ${SESSION_PATH}`);

  await context.close();
  console.log("👋 Browser closed. You can now run the claim script.");
}

captureLogin();
