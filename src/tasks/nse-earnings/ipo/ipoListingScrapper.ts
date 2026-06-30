import { getFormattedUpcomingDateInIST } from "../../../../lib/helpers/day.js";
import { delay } from "../../../../lib/helpers/index.js";
import { scrapperBrowser } from "../../../core/scrapper/index.js";

export const runIpoListingScrapper = async () => {
  const { page, context, browser } = await scrapperBrowser();
  try {
    // const date = "08-Jun-2026";
    const date = getFormattedUpcomingDateInIST("DD-MMM-YY").toUpperCase();
    console.log("Target Date for FII/DII Scrapper:", date);
    const url = `https://www.nseindia.com/api/new-listing-today-ipo?index=NewListing`;

    // 1. Visit the site first to get the session/cookies
    await page.goto(
      "https://www.nseindia.com/market-data/new-stock-exchange-listings-forthcoming",
      {
        // Use 'domcontentloaded' or 'load' instead of 'networkidle'
        waitUntil: "domcontentloaded",
        timeout: 60000, // Increase to 60s for GitHub's slower runners
      },
    );

    delay(2000, 5000);

    // 2. Fetch via the browser's context (automatically sends cookies/headers)
    const { data } = await page.evaluate(async (apiUrl: string) => {
      const response = await fetch(apiUrl);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    }, url);

    const series = ["EQ", "BE", "SM", "ST", "M"];

    const ipoListingResult = data.filter(
      (item: {
        symbol: string;
        companyName: string;
        effectiveDate: string;
        series: string;
      }) => {
        if (item.effectiveDate === date && series.includes(item.series))
          return item;
      },
    );

    if (ipoListingResult.length === 0) return [];

    console.log(
      "✅ Data received:",
      ipoListingResult.length,
      "announcements found.",
    );
    return ipoListingResult;
  } catch (error) {
    console.log("❌ NSE Scrapper Error:", (error as Error).message);
  } finally {
    await context?.close().catch(() => {});
    await browser?.close().catch(() => {});
  }
};
