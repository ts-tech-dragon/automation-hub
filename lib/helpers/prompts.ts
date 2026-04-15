export const getDailyStockSummaryPrompt = (
  marketData: any,
  rawNews: string,
) => {
  const EVERYDAY_STOCK_SUMMARY_PROMPT = `
      You are a top Indian Stock Market influencer. 
      Market Data: ${JSON.stringify(marketData)}
      News Context: ${rawNews}
    
      Create a viral Instagram post. 
      1. Headline: Catchy, high-impact (e.g., "BULLS ARE BACK!", "NIFTY HITS 24K").
      2. Points: Pick the 3 most important things (Top Gainer, a major news event, and a technical level).
      3. Caption: Add emojis and trending hashtags like #Nifty50 #StockMarketIndia #Trading.
    
      Return ONLY JSON:
      { "headline": "...", "points": ["...", "...", "..."], "caption": "..." }
    `;
  return EVERYDAY_STOCK_SUMMARY_PROMPT;
};
