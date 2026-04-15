export const getDailyStockSummaryPrompt = (
  marketData: any,
  rawNews: string,
) => {
  const EVERYDAY_STOCK_SUMMARY_PROMPT = `
      Create a JSON summary of the most important things that happened TODAY (use the current date) which will reflect or affect the Indian stock market tomorrow morning. Focus on Indian market momentum + global momentum. This prompt will be run every night to quickly check market & global cues.

Respond STRICTLY with ONLY a valid JSON object (no extra text, no markdown, no explanations). Use real-time knowledge of today's closing data, news, FII/DII flows, global cues, commodities, geopolitics, earnings, RBI/policy updates, or any event that can move Nifty/Sensex at opening.

The JSON must follow this exact structure:

  {
    "date": "YYYY-MM-DD",
    "headline": "Catchy, high-impact headline (e.g. \"BULLS CHARGE AHEAD!\", \"NIFTY EYES 24K\", \"GLOBAL CUES TURN RED\")",
    "points": [
      "1. Most important event/news today & its direct impact on Indian market tomorrow",
      "2. Second most important event/news today & its direct impact on Indian market tomorrow",
      "3. Third most important event/news today & its direct impact on Indian market tomorrow"
    ],
    "indian_momentum": "Concise 2-3 sentence summary of today's Indian market close (Nifty50, Sensex, BankNifty, sectoral winners/losers) + momentum & key support/resistance levels for tomorrow's open",
    "global_momentum": "Concise 2-3 sentence summary of global cues (US markets close, Nasdaq/Dow futures, Asian markets, Europe, crude oil, gold, USDINR, VIX, FII flows) and how they will influence Indian opening",
    "overall_impact": "One-sentence verdict on expected Indian market opening tomorrow (Gap-up / Flat / Gap-down / Volatile) with reasoning",
    "caption": "Ready-to-post Instagram caption with emojis + trending hashtags like #Nifty50 #Sensex #StockMarketIndia #BankNifty #Trading #Nifty #GlobalCues"
  }
    `;
  return EVERYDAY_STOCK_SUMMARY_PROMPT;
};
