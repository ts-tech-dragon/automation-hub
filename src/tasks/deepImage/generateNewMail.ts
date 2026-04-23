import { delay, moveMouseRandomly } from "../../../lib/helpers/index.js";

export const generateNewDeepMail = async (page: any) => {
  try {
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

    // 1. Wait for the email container to be visible
    const emailContainer = page.locator(".flex-row.items-baseline");
    await emailContainer.waitFor({ state: "visible" });

    // 2. Grab the text from the parent container
    // Playwright's innerText() will combine the text of all child spans
    let email = await emailContainer.innerText();

    // 3. Clean up any accidental whitespace/newlines
    email = email.replace(/\s+/g, "").trim();
    return email;
  } catch (error) {
    console.log("generate new mail error : ", (error as Error).message);
  }
};
