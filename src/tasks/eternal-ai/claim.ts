import { getBrowser } from "../../core/browser.js";
import { SESSION_PATH, ensureAuthFile } from "../../core/auth-helper.js";

async function claimRewards() {
  ensureAuthFile();
  const browser = await getBrowser(true); // Set to false if you want to watch it work
  const context = await browser.newContext({ storageState: SESSION_PATH });
  const page = await context.newPage();

  try {
    console.log("🌐 Navigating to Eternal AI...");
    await page.goto("https://eternalai.org/", { waitUntil: "networkidle" });

    // 1. Locate and click the "Free daily" link in the sidebar
    // We use a regex to handle the emoji and the arrow safely
    const freeDailyLink = page.getByText(/Free .* daily/i);

    if (await freeDailyLink.isVisible()) {
      console.log('🖱️ Clicking "Free daily" link...');
      await freeDailyLink.click();
    } else {
      throw new Error('Could not find the "Free daily" sidebar link.');
    }

    // 2. Wait for the Daily Rewards popup to appear
    console.log("⏳ Waiting for rewards popup...");
    const popup = page
      .locator("div")
      .filter({ hasText: "Daily rewards" })
      .last();
    await popup.waitFor({ state: "visible", timeout: 5000 });

    // 3. Look for the Claim button inside that popup
    // If it's already claimed, the UI shows a timer (as seen in your 2nd image)
    const claimButton = page.getByRole("button", { name: /claim/i });
    const timerText = page.getByText(/Next in/i);

    if (await claimButton.isVisible()) {
      await claimButton.click();
      console.log("💎 SUCCESS: Diamonds claimed!");
      await page.waitForTimeout(2000); // Wait for animation
    } else if (await timerText.isVisible()) {
      const remaining = await timerText.innerText();
      console.log(`}️ ALREADY CLAIMED: ${remaining}`);
    } else {
      console.log("⚠️ Could not find a Claim button or a Timer in the popup.");
      await page.screenshot({ path: "debug-popup-failed.png" });
    }
  } catch (err) {
    console.error("❌ Task failed:", err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

claimRewards();
