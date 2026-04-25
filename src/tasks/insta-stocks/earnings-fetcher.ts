import { chromium } from "playwright";
import yahooFinance from "yahoo-finance2";

async function getEarningsByDate(dateFrom, dateTo) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // 1. Go to Yahoo Earnings Calendar
  // Format: https://finance.yahoo.com/calendar/earnings?day=2026-04-24
  console.log(`Searching for results between ${dateFrom} and ${dateTo}...`);

  let discoveredTickers = [];

  // Loop through each day in your range
  let current = new Date(dateFrom);
  const end = new Date(dateTo);

  while (current <= end) {
    const dateStr = current.toISOString().split("T")[0];
    await page.goto(
      `https://finance.yahoo.com/calendar/earnings?day=${dateStr}`,
    );

    // 2. Extract tickers that end with '.NS' (Indian Stocks)
    const tickers = await page.$$eval('td[aria-label="Symbol"] a', (anchors) =>
      anchors.map((a) => a.innerText).filter((t) => t.endsWith(".NS")),
    );

    discoveredTickers.push(...tickers);
    current.setDate(current.getDate() + 1);
  }

  await browser.close();

  // Remove duplicates
  const uniqueTickers = [...new Set(discoveredTickers)];
  console.log(`Found ${uniqueTickers.length} Indian companies:`, uniqueTickers);

  // 3. Now use yahoo-finance2 to get the data for these discovered stocks
  for (const ticker of uniqueTickers) {
    const data = await yahooFinance.quoteSummary(ticker, {
      modules: ["earnings", "financialData"],
    });
    console.log(
      `${ticker}: Revenue: ${data.earnings?.financialsChart?.quarterly?.pop()?.revenue.fmt}`,
    );
  }
}
