import { toBold } from "../../helpers/morning-quote/index.js";
import { getTimeInIST } from "../../helpers/index.js";

const TODAY = getTimeInIST("DD MMMM YYYY");

export const MARKET_HOLIDAYS = {
  marketHolidays: [
    "2026-01-15",
    "2026-01-26",
    "2026-03-03",
    "2026-03-26",
    "2026-03-31",
    "2026-04-03",
    "2026-04-14",
    "2026-05-01",
    "2026-05-28",
    "2026-06-26",
    "2026-09-14",
    "2026-10-02",
    "2026-10-20",
    "2026-11-10",
    "2026-11-24",
    "2026-12-25",
  ],
};

export const EARNING_POST_DESCRIPTION = [
  {
    headline: "📈 Data > Emotions",
    caption:
      "The numbers don't lie, but sentiments often do. Use these earning reports to anchor your strategy in hard data, not market noise.",
    instagramCaption: `📈 ${toBold("DATA OVER EMOTIONS")} | ${TODAY}\n\nThe numbers don't lie, but sentiments often do. Use these earning reports to anchor your strategy in hard data, not market noise.\n\n👉 Follow @tsfinnews for your daily market pulse! 🚀\n\n#StockMarketIndia #EarningsSeason #Nifty50 #TradingDiscipline #FundamentalAnalysis`,
  },
  {
    headline: "💎 The Value of Patience",
    caption:
      "Earnings season is where the patient are rewarded. Look for consistent profit growth and long-term stability in the results today.",
    instagramCaption: `💎 ${toBold("THE VALUE OF PATIENCE")} | ${TODAY}\n\nEarnings season is where the patient are rewarded. Look for consistent profit growth and long-term stability in the results today.\n\n👉 Follow @tsfinnews for your daily market pulse! 🚀\n\n#InvestingTips #LongTermWealth #StockMarketIndia #DividendInvesting #MarketPulse`,
  },
  {
    headline: "🚀 Spotting Momentum",
    caption:
      "A massive jump in YoY EPS can be the spark for the next big trend. Today’s results highlight where the real momentum is building.",
    instagramCaption: `🚀 ${toBold("SPOTTING MOMENTUM")} | ${TODAY}\n\nA massive jump in YoY EPS can be the spark for the next big trend. Today’s results highlight where the real momentum is building.\n\n👉 Follow @tsfinnews for your daily market pulse! 🚀\n\n#MomentumTrading #StockMarketNews #GrowthStocks #NSEIndia #MarketSetup`,
  },
  {
    headline: "🛡️ Managing the Risk",
    caption:
      "Trading isn't just about picking winners; it's about avoiding the traps. Use these profit-and-loss insights to filter out high-risk setups.",
    instagramCaption: `🛡️ ${toBold("MANAGING THE RISK")} | ${TODAY}\n\nTrading isn't just about picking winners; it's about avoiding the traps. Use these profit-and-loss insights to filter out high-risk setups.[cite: 1]\n\n👉 Follow @tsfinnews for your daily market pulse! 🚀\n\n#RiskManagement #SmartTrading #FinancialResults #TradingPsychology #TechnicalAnalysis`,
  },
  {
    headline: "💸 Passive Income Focus",
    caption:
      "Dividends are the 'thank you' notes from a profitable company. Check today's board recommendations to grow your passive income stream.",
    instagramCaption: `💸 ${toBold("PASSIVE INCOME FOCUS")} | ${TODAY}\n\nDividends are the 'thank you' notes from a profitable company. Check today's board recommendations to grow your passive income stream.[cite: 1]\n\n👉 Follow @tsfinnews for your daily market pulse! 🚀\n\n#PassiveIncome #DividendStocks #WealthBuilding #FinancialFreedom #StockMarketIndia`,
  },
];

export const NIFTY_50_STOCKS = {
  index: "NIFTY 50",
  as_of_date: "2026-04-30",
  constituents: [
    {
      symbol: "ADANIENT",
      name: "Adani Enterprises Ltd.",
      sector: "Metals & Mining",
    },
    {
      symbol: "ADANIPORTS",
      name: "Adani Ports and Special Economic Zone Ltd.",
      sector: "Services",
    },
    {
      symbol: "APOLLOHOSP",
      name: "Apollo Hospitals Enterprise Ltd.",
      sector: "Healthcare",
    },
    {
      symbol: "ASIANPAINT",
      name: "Asian Paints Ltd.",
      sector: "Consumer Durables",
    },
    {
      symbol: "AXISBANK",
      name: "Axis Bank Ltd.",
      sector: "Financial Services",
    },
    {
      symbol: "BAJAJ-AUTO",
      name: "Bajaj Auto Ltd.",
      sector: "Automobile & Components",
    },
    {
      symbol: "BAJFINANCE",
      name: "Bajaj Finance Ltd.",
      sector: "Financial Services",
    },
    {
      symbol: "BAJAJFINSV",
      name: "Bajaj Finserv Ltd.",
      sector: "Financial Services",
    },
    { symbol: "BEL", name: "Bharat Electronics Ltd.", sector: "Capital Goods" },
    {
      symbol: "BHARTIARTL",
      name: "Bharti Airtel Ltd.",
      sector: "Telecommunication",
    },
    {
      symbol: "BPCL",
      name: "Bharat Petroleum Corporation Ltd.",
      sector: "Energy",
    },
    {
      symbol: "BRITANNIA",
      name: "Britannia Industries Ltd.",
      sector: "Fast Moving Consumer Goods",
    },
    { symbol: "CIPLA", name: "Cipla Ltd.", sector: "Healthcare" },
    { symbol: "COALINDIA", name: "Coal India Ltd.", sector: "Energy" },
    {
      symbol: "DRREDDY",
      name: "Dr. Reddy's Laboratories Ltd.",
      sector: "Healthcare",
    },
    {
      symbol: "EICHERMOT",
      name: "Eicher Motors Ltd.",
      sector: "Automobile & Components",
    },
    { symbol: "ETERNAL", name: "Eternal Ltd.", sector: "Consumer Services" },
    {
      symbol: "GRASIM",
      name: "Grasim Industries Ltd.",
      sector: "Construction Materials",
    },
    {
      symbol: "HCLTECH",
      name: "HCL Technologies Ltd.",
      sector: "Information Technology",
    },
    {
      symbol: "HDFCBANK",
      name: "HDFC Bank Ltd.",
      sector: "Financial Services",
    },
    {
      symbol: "HDFCLIFE",
      name: "HDFC Life Insurance Company Ltd.",
      sector: "Financial Services",
    },
    {
      symbol: "HEROMOTOCO",
      name: "Hero MotoCorp Ltd.",
      sector: "Automobile & Components",
    },
    {
      symbol: "HINDALCO",
      name: "Hindalco Industries Ltd.",
      sector: "Metals & Mining",
    },
    {
      symbol: "HINDUNILVR",
      name: "Hindustan Unilever Ltd.",
      sector: "Fast Moving Consumer Goods",
    },
    {
      symbol: "ICICIBANK",
      name: "ICICI Bank Ltd.",
      sector: "Financial Services",
    },
    {
      symbol: "INDUSINDBK",
      name: "IndusInd Bank Ltd.",
      sector: "Financial Services",
    },
    { symbol: "INFY", name: "Infosys Ltd.", sector: "Information Technology" },
    { symbol: "ITC", name: "ITC Ltd.", sector: "Fast Moving Consumer Goods" },
    { symbol: "JSWSTEEL", name: "JSW Steel Ltd.", sector: "Metals & Mining" },
    {
      symbol: "KOTAKBANK",
      name: "Kotak Mahindra Bank Ltd.",
      sector: "Financial Services",
    },
    { symbol: "LT", name: "Larsen & Toubro Ltd.", sector: "Construction" },
    {
      symbol: "M&M",
      name: "Mahindra & Mahindra Ltd.",
      sector: "Automobile & Components",
    },
    {
      symbol: "MARUTI",
      name: "Maruti Suzuki India Ltd.",
      sector: "Automobile & Components",
    },
    {
      symbol: "NESTLEIND",
      name: "Nestle India Ltd.",
      sector: "Fast Moving Consumer Goods",
    },
    { symbol: "NTPC", name: "NTPC Ltd.", sector: "Power" },
    {
      symbol: "ONGC",
      name: "Oil & Natural Gas Corporation Ltd.",
      sector: "Energy",
    },
    {
      symbol: "POWERGRID",
      name: "Power Grid Corporation of India Ltd.",
      sector: "Power",
    },
    { symbol: "RELIANCE", name: "Reliance Industries Ltd.", sector: "Energy" },
    {
      symbol: "SBILIFE",
      name: "SBI Life Insurance Company Ltd.",
      sector: "Financial Services",
    },
    {
      symbol: "SBIN",
      name: "State Bank of India",
      sector: "Financial Services",
    },
    {
      symbol: "SUNPHARMA",
      name: "Sun Pharmaceutical Industries Ltd.",
      sector: "Healthcare",
    },
    {
      symbol: "TATACONSUM",
      name: "Tata Consumer Products Ltd.",
      sector: "Fast Moving Consumer Goods",
    },
    {
      symbol: "TATAMOTORS",
      name: "Tata Motors Ltd.",
      sector: "Automobile & Components",
    },
    { symbol: "TATASTEEL", name: "Tata Steel Ltd.", sector: "Metals & Mining" },
    {
      symbol: "TCS",
      name: "Tata Consultancy Services Ltd.",
      sector: "Information Technology",
    },
    {
      symbol: "TECHM",
      name: "Tech Mahindra Ltd.",
      sector: "Information Technology",
    },
    {
      symbol: "TITAN",
      name: "Titan Company Ltd.",
      sector: "Consumer Durables",
    },
    {
      symbol: "ULTRACEMCO",
      name: "UltraTech Cement Ltd.",
      sector: "Construction Materials",
    },
    { symbol: "WIPRO", name: "Wipro Ltd.", sector: "Information Technology" },
    { symbol: "ZOMATO", name: "Zomato Ltd.", sector: "Consumer Services" },
  ],
};
