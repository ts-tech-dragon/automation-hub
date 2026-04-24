import { getBrowser } from "../../core/browser.js";
import {
  ETERNAL_SESSION_PATH,
  ensureAuthFile,
} from "../../core/auth-helper.js";
import { delay, moveMouseRandomly } from "../../../lib/helpers/index.js";

async function claimRewards() {
  ensureAuthFile();
  const browser = await getBrowser(false);
  const context = await browser.newContext({
    storageState: ETERNAL_SESSION_PATH,
  });
  const page = await context.newPage();

  try {
    console.log("🌐 Navigating to Eternal AI...");
    await page.goto("https://eternalai.org/", {
      waitUntil: "networkidle",
      timeout: 60000,
    });

    // 1. Locate and click the "More" button to expand the menu
    // Added a check to see if "More" is even needed (sidebar might be open)
    // Or use a Case-Insensitive Regex if the spacing/capitalization is tricky
    const moreBtn = await page.getByRole("button", { name: "More" });
    if (await moreBtn.isVisible()) {
      console.log('🖱️ Clicking "More" menu...');
      // To click the 3rd character's "More" button:
      await moreBtn.click();
    }

    // CRITICAL: Await your delay helper!
    // Without 'await', the script tries to find the link before the menu opens.
    await delay(1000, 2000);

    // 1. Target the More button specifically within the bottom bar container
    const bottomMoreBtn = page
      .locator(".styles_bottomBar__tHJHn")
      .getByRole("button", { name: "More" });

    console.log("🔍 Looking for bottom bar 'More' button...");

    try {
      await bottomMoreBtn.waitFor({ state: "visible", timeout: 10000 });
      await bottomMoreBtn.click();
      console.log("🖱️ Bottom bar expanded.");
    } catch (e) {
      console.log(
        "⚠️ Bottom 'More' button not found, checking if menu is already open...",
      );
    }

    // 2. Locate the "Free daily" link
    // We use a more flexible selector that looks for a link containing 'Free' and 'daily'
    const freeDailyLink = page
      .locator("a, button")
      .filter({ hasText: /Free/i })
      .filter({ hasText: /daily/i });

    console.log('⏳ Waiting for "Free daily" link to appear...');
    try {
      await freeDailyLink.waitFor({ state: "visible", timeout: 10000 });
      console.log('🖱️ Clicking "Free daily"...');
      await freeDailyLink.click();
    } catch (e) {
      // If the link isn't found, the "More" button might be '... More' or an icon
      console.log("⚠️ Standard link not found, trying backup selector...");
      await page.locator('div:has-text("More")').click(); // Backup click
      await page.getByText(/Free.*daily/i).click();
    }

    // 3. Wait for the Daily Rewards popup
    console.log("⏳ Waiting for rewards popup...");

    // 1. Target the 'Daily rewards' header text specifically
    // Using getByText is much more reliable than filtering generic divs
    const rewardsHeader = page.getByText(/Daily rewards/i);

    try {
      // Wait for the header text to be visible
      await rewardsHeader.waitFor({ state: "visible", timeout: 10000 });
      console.log("✅ Popup header found.");

      // 2. Find the button that is NEAR the 'Daily rewards' text
      // We look for the button containing 'Claim' or just the first button after that text
      const claimBtn = page.getByRole("button", { name: /claim/i });
      const timerText = page.getByText(/Next in/i);

      // Small delay to ensure the Chakra UI state is updated
      await page.waitForTimeout(1000);

      if (await claimBtn.isVisible()) {
        console.log("🖱️ Claim button visible. Clicking...");

        // Using force: true helps if there's a transparent overlay or animation
        await claimBtn.click({ force: true });

        console.log("💎 SUCCESS: Diamonds claimed!");
        await page.waitForTimeout(2000);
      } else if (await timerText.isVisible()) {
        const time = await timerText.innerText();
        console.log(`🕒 ALREADY CLAIMED: ${time}`);
      } else {
        // If we see the header but no button/timer, the DOM might be nested deeply
        console.log(
          "⚠️ Header found but button/timer missing. Trying deep selector...",
        );
        await page.locator('button:has-text("Claim")').first().click();
      }
    } catch (e) {
      console.error(
        "❌ Popup detection failed. Taking screenshot for debug...",
      );
      await page.screenshot({ path: "error-eternal-popup.png" });
      throw e;
    }
  } catch (err) {
    console.error("❌ Task failed:", (err as Error).message);
    await page.screenshot({ path: "error-screenshot.png" });
  } finally {
    await browser.close();
  }
}

claimRewards();
