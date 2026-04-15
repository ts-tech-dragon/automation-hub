import YahooFinance from "yahoo-finance2";

export interface MarketSummary {
  nifty: string;
  sensex: string;
  topGainer: string;
  newsSummary: string; // We'll get this from a news API or scraping
}

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export async function getMarketData() {
  // Fetching NIFTY 50 (^NSEI) and SENSEX (^BSESN)
  const symbols = ["^NSEI", "^BSESN"];
  const results: any[] = await yahooFinance.quote(symbols);

  const nifty = results.find((r) => r.symbol === "^NSEI");
  const sensex = results.find((r) => r.symbol === "^BSESN");

  return {
    nifty: `${nifty?.regularMarketPrice} (${nifty?.regularMarketChangePercent?.toFixed(2)}%)`,
    sensex: `${sensex?.regularMarketPrice} (${sensex?.regularMarketChangePercent?.toFixed(2)}%)`,
    timestamp: new Date().toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
    }),
  };
}
