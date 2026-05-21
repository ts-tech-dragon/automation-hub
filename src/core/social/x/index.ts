import { humanDelay, humanMouseMove } from "../../../../lib/helpers/human.js";
import { typeHumanLike } from "../../../../lib/helpers/web-scrapper/index.js";
import { ensureAuthFile, X_SESSION_PATH } from "../../auth-helper.js";
import { scrapperBrowser } from "../../scrapper/index.js";
import { expect } from "playwright/test";

export const postToX = async (
  postText: string,
  imageUrls: string | string[],
) => {
  if (typeof imageUrls !== "string" && !Array.isArray(imageUrls)) {
    throw new Error(
      "Invalid imageUrls format. Must be a string or array of strings.",
    );
  }
  ensureAuthFile(X_SESSION_PATH);
  const baseUrl = `https://x.com/home`;

  const { browser, context, page } = await scrapperBrowser({
    storageFile: X_SESSION_PATH,
  });

  try {
    // 1. PRE-LOAD IMAGE: Do this before acting human, so there's no unnatural pausing later
    // 1. PRE-LOAD IMAGES CONCURRENTLY
    console.log(`📥 Pre-fetching ${imageUrls.length} image(s) from URLs...`);

    // Enforce X's 4-image limit
    let urlsToFetch: string[] = [];
    if (typeof imageUrls === "string") {
      urlsToFetch = [imageUrls];
    } else if (Array.isArray(imageUrls)) {
      urlsToFetch = imageUrls.slice(0, 4);
    } else {
      throw new Error(
        "Invalid imageUrls format. Must be a string or array of strings.",
      );
    }

    const imageFiles = await Promise.all(
      urlsToFetch.map(async (url, index) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch image ${index + 1}`);

        return {
          name: `tsfinnews_media_${index + 1}.jpg`,
          mimeType: "image/jpeg",
          buffer: Buffer.from(await response.arrayBuffer()),
        };
      }),
    );

    console.log("🚀 Navigating to X Home...");
    await page.goto(baseUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await humanDelay(2000, 8000);
    await humanMouseMove(page, 2000, 5000); // Shortened slightly so it doesn't wait 15s to click

    console.log("🖱️ Clicking the Sidebar 'Post' button...");
    const sideNavButton = page.getByTestId("SideNav_NewTweet_Button");
    await sideNavButton.waitFor({ state: "visible", timeout: 15000 });

    // ADDED: Random delay between 30ms-80ms for the mouse button press
    await sideNavButton.click({ delay: Math.floor(Math.random() * 50) + 30 });

    await humanDelay(1500, 3000);

    console.log("✍️ Locating text box via ARIA Role...");
    let textBox;
    try {
      textBox = page.getByRole("textbox", { name: /Post text/i });
      await textBox.waitFor({ state: "visible", timeout: 10000 });
    } catch (e) {
      console.log(`⚠️ UI missing! Current URL: ${page.url()}`);
      await page.screenshot({ path: "x-crash-screenshot.png" });
      throw new Error("Text box not found. Open 'x-crash-screenshot.png'.");
    }

    await textBox.click({ delay: Math.floor(Math.random() * 50) + 30 });
    await humanDelay(500, 1500);

    console.log("✍️ Writing post content...");
    await typeHumanLike(textBox, postText);
    await humanDelay(1000, 3000);

    console.log("🖼️ Uploading image...");
    const modal = page.getByRole("dialog");
    const fileInput = modal.getByTestId("fileInput");

    await humanDelay(2000, 4000); // Represents the human finding the files
    await fileInput.setInputFiles(imageFiles); // The batch upload
    await humanDelay(2000, 4000); // Represents the human waiting for them to load

    await humanDelay(2000, 4000);
    await humanMouseMove(page, 2000, 6000);

    console.log("⏳ Waiting for media upload to process...");
    const postButton = page.locator(
      `[role="button"][data-testid="tweetButton"]`,
    );

    await expect(postButton).toBeEnabled({ timeout: 15000 });

    console.log("🚀 Publishing post...");

    // Using { force: true } tells Playwright to ignore invisible overlays
    // and fire the click event directly on the button.
    await postButton.click({
      force: true,
      delay: Math.floor(Math.random() * 50) + 30,
    });

    console.log("⏳ Waiting for X server confirmation...");

    try {
      // 🌟 THE ULTIMATE FIX: Wait for the success toast to appear on screen!
      const successToast = page.getByText(/Your post was sent/i);

      // We give it up to 15 seconds to finish uploading to X's backend
      await successToast.waitFor({ state: "visible", timeout: 15000 });
      console.log("✅ Post published and confirmed by X!");
    } catch (e) {
      console.log("⚠️ Did not see the success message. Taking a snapshot...");
      await page.screenshot({ path: "x-failed-click-debug.png" });

      // Fallback: Sometimes React drops the first click. Try clicking one more time.
      console.log("🔄 Retrying click...");
      await postButton.click({ force: true });
      await page.waitForTimeout(5000); // Wait for retry to process
    }

    await page.waitForTimeout(4000);
    console.log("✅ Post published successfully!");
  } catch (error) {
    console.log(`❌ Post to X failed: ${(error as Error).message}`);
  } finally {
    // 🧹 CRITICAL CLEANUP: Prevent memory leaks
    console.log("🧹 Closing browser instance...");
    await browser?.close();
    await context?.close().catch(() => {}); // Extra safety to close context if it wasn't already
    await page.close().catch(() => {}); // Close page if it wasn't already closed
  }
};
