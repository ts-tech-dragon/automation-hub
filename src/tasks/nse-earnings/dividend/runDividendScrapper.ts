import {
  getFormattedDateInIST,
  getFormattedUpcomingDateInIST,
} from "../../../../lib/helpers/day.js";
import { delay, getTimeInIST } from "../../../../lib/helpers/index.js";
import { getDividendAmount } from "../../../../lib/helpers/nse-results/index.js";
import { scrapperBrowser } from "../../../core/scrapper/index.js";

export const runDividendScrapper = async () => {
  const { page, context, browser } = await scrapperBrowser();
  try {
    const date = getFormattedUpcomingDateInIST("DD-MM-YYYY", 1); // Ensure this returns DD-MM-YYYY
    const url = `https://www.nseindia.com/api/corporates-corporateActions?index=equities&from_date=${date}&to_date=${date}&subject=Dividend`;

    // 1. Visit the site first to get the session/cookies
    await page.goto(
      "https://www.nseindia.com/companies-listing/corporate-filings-actions",
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

    console.log("✅ Data received:", data.length, "announcements found.");
    const updatedData = data
      .map((element: any) => {
        const obj: any = {};
        obj["dividend"] = getDividendAmount(element.subject);
        obj["exDate"] = element.recDate;
        obj["symbol"] = element.symbol;
        obj["name"] = element.comp;
        return obj;
      })
      .sort((a: any, b: any) => b.dividend - a.dividend); // This sorts in descending order
    return updatedData;
  } catch (error) {
    console.log("❌ NSE Scrapper Error:", (error as Error).message);
  } finally {
    await context?.close().catch(() => {});
    await browser?.close().catch(() => {});
  }
};
