import { getTimeInIST } from "../../helpers/index.js";
import { toBold } from "../../helpers/morning-quote/index.js";

const TODAY = getTimeInIST("DD MMMM YYYY");

export const MARKET_PULSE_CAPTIONS = [
  {
    headline: "🗞️ Market Pulse Update",
    caption:
      "The news that moves the needle. Here are the top corporate and economic shifts impacting the Indian markets today.",
    instagramCaption: `🗞️ ${toBold("MARKET PULSE UPDATE")} | ${TODAY}\n\n{{description}}\n\n👉 Swipe to stay ahead of the curve!\n\n#nifty50 #stockMarketIndia #businessNews #trending #dailynews`,
    xCaption: `🗞️ MARKET PULSE UPDATE\n\n{{description}}\n\n👉 @tsfinnews\n#StockMarketIndia #BusinessNews`,
  },
  {
    headline: "📊 Corporate Intelligence",
    caption:
      "Deep dive into today's major headlines. From fund-raising to earnings surges, stay informed on the stocks that matter.",
    instagramCaption: `📊 ${toBold("CORPORATE INTELLIGENCE")} | ${TODAY}\n\n{{description}}\n\n⚡ Follow @tsfinnews for real-time pulses!\n\n#nifty50 #stockMarketIndia #businessNews #trending #dailynews`,
    xCaption: `📊 CORPORATE INTELLIGENCE\n\n{{description}}\n\n⚡ @tsfinnews\n#Nifty50 #StockMarketNews`,
  },
  {
    headline: "🚀 Sector Movers & News",
    caption:
      "Tracking the momentum. We've curated the essential market updates to help you navigate today's trading session.",
    instagramCaption: `🚀 ${toBold("SECTOR MOVERS & NEWS")} | ${TODAY}\n\n{{description}}\n\n🔔 Turn on notifications for @tsfinnews!\n\n#nifty50 #stockMarketIndia #businessNews #trending #dailynews`,
    xCaption: `🚀 SECTOR MOVERS & NEWS\n\n{{description}}\n\n🔔 @tsfinnews\n#TradingIndia #BusinessNews`,
  },
  {
    headline: "💎 Daily Financial Digest",
    caption:
      "Your daily dose of market-moving data. Swipe through for a quick summary of the biggest stories in Indian finance.",
    instagramCaption: `💎 ${toBold("DAILY FINANCIAL DIGEST")} | ${TODAY}\n\n{{description}}\n\n👉 Follow @tsfinnews to grow your edge.\n\n#nifty50 #stockMarketIndia #businessNews #trending #dailynews`,
    xCaption: `💎 DAILY FINANCIAL DIGEST\n\n{{description}}\n\n👉 @tsfinnews\n#StockMarketIndia #FinanceNews`,
  },
  {
    headline: "🔥 High-Impact Headlines",
    caption:
      "Breaking down the complexity. Simple, clear, and actionable insights into the current market landscape.",
    instagramCaption: `🔥 ${toBold("HIGH-IMPACT HEADLINES")} | ${TODAY}\n\n{{description}}\n\n📈 Stay tuned to @tsfinnews for more!\n\n#nifty50 #stockMarketIndia #businessNews #trending #dailynews`,
    xCaption: `🔥 HIGH-IMPACT HEADLINES\n\n{{description}}\n\n📈 @tsfinnews\n#Nifty50 #StockMarketIndia`,
  },
];
