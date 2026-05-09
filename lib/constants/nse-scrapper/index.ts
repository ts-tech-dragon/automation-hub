import { getTimeInIST } from "../../helpers/index.js";
import { toBold } from "../../helpers/morning-quote/index.js";
const TODAY = getTimeInIST("DD MMMM YYYY");
export const PRE_MARKET_EARNINGS_POSTS = [
  {
    headline: "🌅 Morning Prep: The After-Hours Wrap",
    caption:
      "The big moves happen when the market is closed. Review these after-market results now to stay ahead of the opening bell volatility.",
    instagramCaption: `🌅 ${toBold("MORNING PREP: AFTER-HOURS WRAP")} | ${TODAY}\n\nThe big moves happen when the market is closed. Review these after-market results now to stay ahead of the opening bell volatility.\n\n👉 Follow @tsfinnews for your daily market pulse! 🚀\n\n#PreMarket #StockMarketIndia #MorningTrade #NiftyPulse #TradingStrategy`,
  },
  {
    headline: "☕ Coffee & Catalysts",
    caption:
      "While you were sleeping, these companies dropped their numbers. These results are the primary catalysts for today's price action.",
    instagramCaption: `☕ ${toBold("COFFEE & CATALYSTS")} | ${TODAY}\n\nWhile you were sleeping, these companies dropped their numbers. These results are the primary catalysts for today's price action.\n\n👉 Follow @tsfinnews for your daily market pulse! 🚀\n\n#MarketCatalysts #DailyEarnings #MorningRoutine #NSEIndia #InvestSmart`,
  },
  {
    headline: "🎯 Eye on the Opening Bell",
    caption:
      "Success isn't about chasing the open; it's about being prepared before it. Analyze these EPS and Profit trends to identify your watch-list.",
    instagramCaption: `🎯 ${toBold("EYE ON THE OPENING BELL")} | ${TODAY}\n\nSuccess isn't about chasing the open; it's about being prepared before it. Analyze these EPS and Profit trends to identify your watch-list.\n\n👉 Follow @tsfinnews for your daily market pulse! 🚀\n\n#DayTradingIndia #Watchlist #FinancialIndependence #BSEIndia #MarketAnalysis`,
  },
  {
    headline: "🔍 Filtering the Noise",
    caption:
      "The morning gap-ups and gap-downs are driven by these filings. Don't trade blindly—know the fundamentals behind the move.",
    instagramCaption: `🔍 ${toBold("FILTERING THE NOISE")} | ${TODAY}\n\nThe morning gap-ups and gap-downs are driven by these filings. Don't trade blindly—know the fundamentals behind the move.[cite: 1]\n\n👉 Follow @tsfinnews for your daily market pulse! 🚀\n\n#GapTrading #MarketPsychology #StockAnalysis #IndianStockMarket #TraderMindset`,
  },
  {
    headline: "📈 Overnight Insights",
    caption:
      "The results from yesterday's late session are in. Use this data to spot the 'Bull/Bear Traps' before the 9:15 AM rush.",
    instagramCaption: `📈 ${toBold("OVERNIGHT INSIGHTS")} | ${TODAY}\n\nThe results from yesterday's late session are in. Use this data to spot the 'Bull/Bear Traps' before the 9:15 AM rush.[cite: 1]\n\n👉 Follow @tsfinnews for your daily market pulse! 🚀\n\n#StockMarketTrends #AfterMarket #EarningsUpdate #SmartMoney #PriceAction`,
  },
];
