import { delay, moveMouseRandomly } from "../../../lib/helpers/index.js";
import { scrapperBrowser } from "../../core/scrapper/index.js";
import { generateNewDeepMail } from "./generateNewMail.js";

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

    let email = "";

    // 2. Check the URL directly inside the while condition
    // We loop as long as the URL DOES NOT include 'unaux.com'
    while (!page.url().includes("unaux.com")) {
      console.log(`🚩 Redirected to ${page.url()}. Forcing back to target...`);

      await page.goto(actualURL, { waitUntil: "domcontentloaded" });

      // 3. Await the delay inside the loop so the browser can breathe
      await delay(3000, 5000);
    }

    console.log("🎯 Successfully landed on the target page.");

    email = await generateNewDeepMail(page);

    while (!email.includes("ozvmail")) {
      email = await generateNewDeepMail(page);
    }

    console.log("✅ Extracted Email:", email);

    await delay(2000, 4000);
    await moveMouseRandomly(page);
    return email;
  } catch (error) {
    console.log("❌ Error:", (error as Error).message);
    return "";
  }
};
