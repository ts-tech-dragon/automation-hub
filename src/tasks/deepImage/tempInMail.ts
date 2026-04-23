import { delay, moveMouseRandomly } from "../../../lib/helpers/index.js";
import { scrapperBrowser } from "../../core/scrapper/index.js";

type ExtractEmailFromTemInEmailProps = {
  page: any;
};

export const extractEmailFromTemInEmail = async (
  props: ExtractEmailFromTemInEmailProps,
) => {
  const { page } = props;
  const actualURL = "https://tempinmail.unaux.com";

  try {
    console.log("🚀 Navigating...");
    await page.goto(actualURL);

    // 1. Await the delay
    await delay(3000, 5000);

    // 2. Check the URL directly inside the while condition
    // We loop as long as the URL DOES NOT include 'unaux.com'
    while (!page.url().includes("unaux.com")) {
      console.log(`🚩 Redirected to ${page.url()}. Forcing back to target...`);

      await page.goto(actualURL, { waitUntil: "domcontentloaded" });

      // 3. Await the delay inside the loop so the browser can breathe
      await delay(3000, 5000);
    }

    console.log("🎯 Successfully landed on the target page.");

    const activationEmail = page.getByText("Deep Image - Account Activation");

    if (activationEmail) {
      // 1. Locate the button by its role and name
      const newButton = page.getByRole("button", { name: /New/i });

      // 2. Wait for it to be visible (good practice for dynamic apps)
      await newButton.waitFor({ state: "visible" });

      // 3. Click it
      await newButton.click();

      console.log("➕ Clicked the 'New' button.");

      // 1. Define the locator for the modal
      const modal = page.locator('div[role="dialog"]');

      // 2. Wait for the modal to open
      await modal.waitFor({ state: "visible", timeout: 5000 });
      console.log("📦 Modal opened.");

      // 3. Click the 'Random' button
      await modal.getByRole("button", { name: /Random/i }).click();

      // 5. CONFIRMATION: Wait for the modal to be hidden/closed
      // This will wait up to 5 seconds (default) for the modal to disappear
      await modal.waitFor({ state: "hidden", timeout: 5000 });

      console.log("✅ Modal has closed successfully.");

      await delay(2000, 4000);
      await moveMouseRandomly(page);
    }

    // 1. Wait for the email container to be visible
    const emailContainer = page.locator(".flex-row.items-baseline");
    await emailContainer.waitFor({ state: "visible" });

    // 2. Grab the text from the parent container
    // Playwright's innerText() will combine the text of all child spans
    let email = await emailContainer.innerText();

    // 3. Clean up any accidental whitespace/newlines
    email = email.replace(/\s+/g, "").trim();
    console.log("✅ Extracted Email:", email);

    await delay(2000, 4000);
    await moveMouseRandomly(page);
    return email;
  } catch (error) {
    console.log("❌ Error:", (error as Error).message);
    return "";
  }
};
