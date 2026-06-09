import { getFormattedDateInIST } from "../../../../lib/helpers/day.js";
import { delay } from "../../../../lib/helpers/index.js";
import { scrapperBrowser } from "../../../core/scrapper/index.js";

export const runFiiDiiScrapper = async () => {
  const { page, context, browser } = await scrapperBrowser();
  try {
    // const date = "08-Jun-2026";
    const date = getFormattedDateInIST("DD-MMM-YYYY");
    console.log("Target Date for FII/DII Scrapper:", date);
    const url = `https://www.nseindia.com/api/fiidiiTradeNse`;

    // 1. Visit the site first to get the session/cookies
    await page.goto("https://www.nseindia.com/reports/fii-dii", {
      // Use 'domcontentloaded' or 'load' instead of 'networkidle'
      waitUntil: "domcontentloaded",
      timeout: 60000, // Increase to 60s for GitHub's slower runners
    });

    delay(2000, 5000);

    // 2. Fetch via the browser's context (automatically sends cookies/headers)
    const data = await page.evaluate(async (apiUrl: string) => {
      const response = await fetch(apiUrl);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    }, url);

    const fiiDiiResult = data.filter(
      (item: { date: string; netValue: string }) => {
        if (item.date === date) return item;
      },
    );

    console.log(
      "✅ Data received:",
      fiiDiiResult.length,
      "announcements found.",
    );
    return fiiDiiResult;
  } catch (error) {
    console.log("❌ NSE Scrapper Error:", (error as Error).message);
  } finally {
    await context?.close().catch(() => {});
    await browser?.close().catch(() => {});
  }
};
