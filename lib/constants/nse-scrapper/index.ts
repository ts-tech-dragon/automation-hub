import { getTimeInIST } from "../../helpers/index.js";
import { toBold } from "../../helpers/morning-quote/index.js";
const TODAY = getTimeInIST("DD MMMM YYYY");
export const PRE_MARKET_EARNINGS_POSTS = [
  {
    headline: "🌅 Morning Prep: The After-Hours Wrap",
    caption:
      "The big moves happen when the market is closed. Review these after-market results now to stay ahead of the opening bell volatility.",
    instagramCaption: `🌅 ${toBold("MORNING PREP: AFTER-HOURS WRAP")} | ${TODAY}\n\n{{description}}`,
    xCaption: `🌅 MORNING PREP: AFTER-HOURS WRAP\n\n{{description}}`,
  },
  {
    headline: "☕ Coffee & Catalysts",
    caption:
      "While you were sleeping, these companies dropped their numbers. These results are the primary catalysts for today's price action.",
    instagramCaption: `☕ ${toBold("COFFEE & CATALYSTS")} | ${TODAY}\n\n{{description}}`,
    xCaption: `☕ COFFEE & CATALYSTS\n\n{{description}}`,
  },
  {
    headline: "🎯 Eye on the Opening Bell",
    caption:
      "Success isn't about chasing the open; it's about being prepared before it. Analyze these EPS and Profit trends to identify your watch-list.",
    instagramCaption: `🎯 ${toBold("EYE ON THE OPENING BELL")} | ${TODAY}\n\n{{description}}`,
    xCaption: `🎯 EYE ON THE OPENING BELL\n\n{{description}}`,
  },
  {
    headline: "🔍 Filtering the Noise",
    caption:
      "The morning gap-ups and gap-downs are driven by these filings. Don't trade blindly—know the fundamentals behind the move.",
    instagramCaption: `🔍 ${toBold("FILTERING THE NOISE")} | ${TODAY}\n\n{{description}}`,
    xCaption: `🔍 FILTERING THE NOISE\n\n{{description}}`,
  },
  {
    headline: "📈 Overnight Insights",
    caption:
      "The results from yesterday's late session are in. Use this data to spot the 'Bull/Bear Traps' before the 9:15 AM rush.",
    instagramCaption: `📈 ${toBold("OVERNIGHT INSIGHTS")} | ${TODAY}\n\n{{description}}`,
    xCaption: `📈 OVERNIGHT INSIGHTS\n\n{{description}}`,
  },
];

export const DIVIDEND_POST_DESCRIPTION = [
  {
    headline: "💸 Cash Flow is King",
    caption:
      "Dividends turn your portfolio into a paycheck. Discover which companies are sharing their profits with investors today.",
    instagramCaption: `💸 ${toBold("CASH FLOW IS KING")} | ${TODAY}\n\n{{description}}`,
    xCaption: `💸 Dividend Alert | ${TODAY}\n\n{{description}}`,
  },
  {
    headline: "❄️ The Snowball Effect",
    caption:
      "Reinvesting dividends is the secret engine of wealth creation. Here are today's top dividend announcements to keep your snowball rolling.",
    instagramCaption: `❄️ ${toBold("THE SNOWBALL EFFECT")} | ${TODAY}\n\n{{description}}`,
    xCaption: `❄️ Dividend Alert | ${TODAY}\n\n{{description}}`,
  },
  {
    headline: "⏰ Mark Your Calendars",
    caption:
      "Don't miss the cutoff! Check today's upcoming ex-dividend dates to ensure you are on the roster for the next payout.",
    instagramCaption: `⏰ ${toBold("MARK YOUR CALENDARS")} | ${TODAY}\n\n{{description}}`,
    xCaption: `⏰ Dividend Alert | ${TODAY}\n\n{{description}}`,
  },
  {
    headline: "🎯 Yield with a Purpose",
    caption:
      "A high yield is great, but a sustainable yield is better. Review today's dividend declarations to find quality companies rewarding their shareholders.",
    instagramCaption: `🎯 ${toBold("YIELD WITH A PURPOSE")} | ${TODAY}\n\n{{description}}`,
    xCaption: `🎯 Dividend Alert | ${TODAY}\n\n{{description}}`,
  },
  {
    headline: "🏖️ The Freedom Fund",
    caption:
      "Every dividend payment is a step closer to financial independence. See which stocks are generating reliable passive income today.",
    instagramCaption: `🏖️ ${toBold("THE FREEDOM FUND")} | ${TODAY}\n\n{{description}}`,
    xCaption: `🏖️ Dividend Alert | ${TODAY}\n\n{{description}}`,
  },
];
