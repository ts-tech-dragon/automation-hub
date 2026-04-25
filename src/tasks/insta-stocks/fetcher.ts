import YahooFinance from "yahoo-finance2";

export interface MarketSummary {
  nifty: string;
  sensex: string;
  topGainer: string;
  newsSummary: string; // We'll get this from a news API or scraping
}

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// Fetching NIFTY 50 (^NSEI) and SENSEX (^BSESN)
const symbols = [
  // 🇮🇳 India
  "^NSEI",
  "^BSESN",
  "^NSEBANK",

  // 🛢️ Commodities
  "BZ=F",

  // 💱 Currency
  "INR=X",

  // ⚠️ Indian Volatility
  "^INDIAVIX",
];

export async function getMarketData() {
  const results: any[] = await yahooFinance.quote(symbols);

  const nifty = results.find((r) => r.symbol === "^NSEI");
  const sensex = results.find((r) => r.symbol === "^BSESN");
  const crudeOil = results.find((r) => r.symbol === "BZ=F");
  const inr = results.find((r) => r.symbol === "INR=X");
  const indiaVix = results.find((r) => r.symbol === "^INDIAVIX");

  return {
    nifty: `${nifty?.regularMarketPrice} (${nifty?.regularMarketChangePercent?.toFixed(2)}%)`,
    sensex: `${sensex?.regularMarketPrice} (${sensex?.regularMarketChangePercent?.toFixed(2)}%)`,
    crudeOil: `${crudeOil?.regularMarketPrice} (${crudeOil?.regularMarketChangePercent?.toFixed(2)}%)`,
    inr: `${inr?.regularMarketPrice} (${inr?.regularMarketChangePercent?.toFixed(2)}%)`,
    indiaVix: `${indiaVix?.regularMarketPrice} (${indiaVix?.regularMarketChangePercent?.toFixed(2)}%)`,
    timestamp: new Date().toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
    }),
  };
}

export async function getWeeklyOHLC() {
  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 7);

  let result = "";

  for (let symbol of symbols) {
    const data = await yahooFinance.historical(symbol, {
      period1: lastWeek,
      period2: today,
      interval: "1d", // 👈 THIS gives daily OHLC
    });

    const weeklyData = data.map((d) => ({
      date: d.date,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    result += `Yahoo Code : ${symbol}
        Data : ${JSON.stringify(weeklyData)}
        -------------------------
    `;
  }
  console.log("Result : ", result);
}

async function getMetalsWeeklyData() {
  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 7);

  const gold = await yahooFinance.historical("GC=F", {
    period1: lastWeek,
    period2: today,
    interval: "1d",
  });

  const silver = await yahooFinance.historical("SI=F", {
    period1: lastWeek,
    period2: today,
    interval: "1d",
  });

  return {
    gold: gold.map((d) => ({
      date: d.date,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    })),
    silver: silver.map((d) => ({
      date: d.date,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    })),
  };
}
