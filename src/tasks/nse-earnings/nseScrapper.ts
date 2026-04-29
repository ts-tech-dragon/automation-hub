import { delay, getTimeInIST } from "../../../lib/helpers/index.js";
import { scrapperBrowser } from "../../core/scrapper/index.js";

export const runNSEScrapper = async () => {
  const { page, context, browser } = await scrapperBrowser();
  try {
    const date = getTimeInIST(); // Ensure this returns DD-MM-YYYY
    const url = `https://www.nseindia.com/api/corporate-announcements?index=equities&from_date=${date}&to_date=${date}&reqXbrl=false`;

    // 1. Visit the site first to get the session/cookies
    await page.goto(
      "https://www.nseindia.com/companies-listing/corporate-filings-announcements",
      {
        // Use 'domcontentloaded' or 'load' instead of 'networkidle'
        waitUntil: "domcontentloaded",
        timeout: 60000, // Increase to 60s for GitHub's slower runners
      },
    );

    delay(2000, 5000);

    // 2. Fetch via the browser's context (automatically sends cookies/headers)
    const data = await page.evaluate(async (apiUrl: string) => {
      const response = await fetch(apiUrl);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    }, url);

    const financialResult = data.filter((item: { attchmntText: string }) => {
      if (item.attchmntText.includes("financial results")) return item;
    });

    console.log(
      "✅ Data received:",
      financialResult.length,
      "announcements found.",
    );
    return financialResult;
  } catch (error) {
    console.log("❌ NSE Scrapper Error:", (error as Error).message);
  } finally {
    await context?.close().catch(() => {});
    await browser?.close().catch(() => {});
  }
};
