import YahooFinance from "yahoo-finance2";
import {
  getDayOfWeek,
  getFormattedDateInIST,
  getFormattedUpcomingDateInIST,
} from "../../../../lib/helpers/day.js";
import { delay, getTimeInIST } from "../../../../lib/helpers/index.js";
import { getDividendAmount } from "../../../../lib/helpers/nse-results/index.js";
import { scrapperBrowser } from "../../../core/scrapper/index.js";

export const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});

export const runDividendScrapper = async () => {
  const { page, context, browser } = await scrapperBrowser();
  try {
    const dayCount = getDayOfWeek() === 5 ? 3 : 1;
    const date = getFormattedUpcomingDateInIST("DD-MM-YYYY", dayCount); // Ensure this returns DD-MM-YYYY
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

    // 1. Map creating an array of Promises
    const promiseArray = data.map(async (element: any) => {
      const obj: any = {};
      const dividendAmt = getDividendAmount(element.subject);
      const symbol = element.symbol;

      obj["dividend"] = dividendAmt;
      obj["dividendPercentage"] = await getDividedPercentageBySymbol(
        symbol,
        dividendAmt,
      );
      obj["exDate"] = element.exDate;
      obj["symbol"] = symbol;
      obj["name"] = element.comp;

      return obj;
    });

    // 2. Wait for all promises to resolve in parallel
    const resolvedData = await Promise.all(promiseArray);

    // 3. Sort the final resolved data (convert string percentage to number for accurate sorting)
    return resolvedData.sort(
      (a: any, b: any) =>
        Number(b.dividendPercentage) - Number(a.dividendPercentage),
    );
  } catch (error) {
    console.log("❌ NSE Scrapper Error:", (error as Error).message);
    return [];
  } finally {
    await context?.close().catch(() => {});
    await browser?.close().catch(() => {});
  }
};

async function getDividedPercentageBySymbol(symbol: string, dividend: number) {
  dividend = Number(dividend);
  // NSE symbols on Yahoo Finance need the ".NS" suffix
  const querySymbol = `${symbol}.NS`;
  const result = await yahooFinance.quote(querySymbol, {
    fields: ["regularMarketPrice"],
  });
  const price = result.regularMarketPrice;
  return ((dividend / price) * 100).toFixed(2);
}
