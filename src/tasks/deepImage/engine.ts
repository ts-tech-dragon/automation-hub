import "dotenv/config";
import { delay, moveMouseRandomly } from "../../../lib/helpers/index.js";
import { sendDeepImageData } from "../../core/notifier/discord.js";
import { scrapperBrowser } from "../../core/scrapper/index.js";
import { extractEmailFromTemInEmail } from "./tempInMail.js";
import {
  generateRandomPassword,
  typeHumanLike,
} from "../../../lib/helpers/web-scrapper/index.js";

const runDeepImageLogin = async () => {
  const { page, context, browser } = await scrapperBrowser();

  // 1. Clear Cookies
  await context.clearCookies();

  // 2. Clear LocalStorage and SessionStorage
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  try {
    const email = await extractEmailFromTemInEmail({ page });
    // const email = "abcasfldk@test.com";
    const passwordValue = generateRandomPassword(8); // Use a stronger pass than 123456!

    // 1. Open the signup page
    const serviceTab = await context.newPage();
    await serviceTab.goto("https://deep-image.ai/app/signin");

    const profileDropdown = serviceTab.locator(
      "#navbarDropdownMenuLinkProfile",
    );

    // 2. Use isVisible() to check if the user is currently logged in
    if (await profileDropdown.isVisible()) {
      console.log("👤 Session detected. Logging out first...");

      // Click to open the dropdown menu
      await profileDropdown.click();

      // 3. Locate the 'Log out' link inside the menu and click it
      // We use getByText to ensure we hit the right link
      const logoutBtn = serviceTab
        .locator(".dropdown-menu")
        .getByText("Log out");

      await logoutBtn.click();
      console.log("✅ Logged out successfully.");

      // Optional: Wait for the URL to change back to the sign-in page
      await delay(2000, 4000);
      await moveMouseRandomly(serviceTab);
    }

    // 1. Define the locator for the 'I accept' button
    const cookieAcceptBtn = serviceTab.locator("#coookies_confirm");

    // 2. Check if it exists and is visible
    // We use a small timeout so we don't wait forever if it doesn't show up
    try {
      if (await cookieAcceptBtn.isVisible({ timeout: 5000 })) {
        console.log("🍪 Cookie banner detected. Accepting...");
        await cookieAcceptBtn.click();

        // Optional: Wait for the wrapper to disappear so it doesn't block other clicks
        await serviceTab
          .locator(".cookies-wrapper")
          .waitFor({ state: "hidden" });
      }
    } catch (e) {
      console.log("ℹ️ No cookie banner appeared, proceeding...");
    }

    await delay(2000, 4000);
    await moveMouseRandomly(serviceTab);

    // 2. Click the Sign Up tab (using the ID from your HTML)
    // Playwright will automatically wait for this to be clickable
    await serviceTab.click("#nav-signup-tab");

    // 3. Wait for the Signup form to actually become visible
    await serviceTab.waitForSelector("#nav-signup.active", {
      state: "visible",
    });

    // 4. Fill the fields (Added await to your delay here)
    await delay(1000, 2000);

    // Fill the signup-specific fields
    const emailInput = await serviceTab.locator(
      '#nav-signup input[name="login"]',
    );

    await typeHumanLike(emailInput, email);
    await delay(2000, 4000);
    await moveMouseRandomly(serviceTab);

    // random delay between each character
    const passwordInput = await serviceTab.locator(
      '#nav-signup input[name="password"]',
    );

    await typeHumanLike(passwordInput, passwordValue);

    // random delay between each character
    await delay(2000, 4000);
    await moveMouseRandomly(serviceTab);

    const confirmPassword = await serviceTab.locator(
      '#nav-signup input[name="repassword"]',
    );
    await typeHumanLike(confirmPassword, passwordValue);

    // random delay between each character
    await delay(2000, 4000);
    await moveMouseRandomly(serviceTab);

    // 5. Handle Checkbox
    const checkbox = serviceTab.locator("#checkboxAgreementInModal");
    if (!(await checkbox.isChecked())) {
      await checkbox.check();
    }

    // 6. Human-like pause before submission
    await delay(2000, 4000);
    await moveMouseRandomly(serviceTab);

    // 7. Click "Sign up"
    await serviceTab.click("#nav-signup button.btn-cta");

    console.log("🚀 Signup form submitted!");

    await delay(2000, 6000);
    await moveMouseRandomly(serviceTab);

    // Switch back to email tab to wait for confirmation
    await page.bringToFront();

    await delay(2000, 4000);
    await moveMouseRandomly(serviceTab);

    // 1. Define the locator
    const activationEmail = page.getByText("Deep Image - Account Activation");

    // 2. Wait for it to appear (emails aren't instant!)
    await activationEmail.waitFor({ state: "visible", timeout: 30000 });

    // 3. Click the actual locator
    await activationEmail.click();

    await delay(2000, 4000);
    await moveMouseRandomly(page);

    await page.evaluate(async () => {
      const target = document.body.scrollHeight * 0.1; // 20% of the page
      let currentScroll = 0;
      const step = 80; // Smaller steps look more natural

      while (currentScroll < target) {
        window.scrollBy(0, step);
        currentScroll += step;
        // Tiny sleep to let the browser process the movement
        await new Promise((res) => setTimeout(res, 30));
      }
    });

    // Target the div wrapper that has the scrollbar
    // 1. Target the actual scrollable container (the parent div)
    // 1. Target the frame
    const emailFrame = page.frameLocator("iframe");

    // 1. Locate the link by its text
    // We use a Regex /.../i to make it case-insensitive just in case
    const activationLink = await emailFrame
      .getByRole("link", { name: /click to activate account/i })
      .first() // In case there are multiple, get the first one
      .getAttribute("href");

    // 2. Navigate the current tab to that URL
    if (activationLink) {
      await page.goto(activationLink);
      console.log("Navigated to activation link!");
    }

    await delay(2000, 4000);
    await moveMouseRandomly(serviceTab);

    await sendDeepImageData({ email, password: passwordValue });

    // --- THE BIG WIPE ---

    // 1. Clear Cookies for the entire context (Affects both tabs)
    await context.clearCookies();

    // 2. Clear Local/Session Storage for Tab 1 (Temp Mail)
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // 3. Clear Local/Session Storage for Tab 2 (Service Tab)
    await serviceTab.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    console.log("🧹 All cookies and site data have been purged.");
  } catch (error) {
    console.log("❌ Error:", (error as Error).message);
  } finally {
    await context?.close().catch(() => {});
    await browser?.close().catch(() => {});
  }
};

runDeepImageLogin();
