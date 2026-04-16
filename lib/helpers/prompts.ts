import { getFormatedTodayDate } from "./index.js";

export const getDailyStockSummaryPrompt = (
  marketData: any,
  rawNews: string,
) => {
  const today = getFormatedTodayDate();
  const EVERYDAY_STOCK_SUMMARY_PROMPT = `
      Create a JSON summary of the most important things that happened TODAY (${today}) in indian stock market (use the current date) including ${rawNews} and Nifty current price ${marketData?.nifty} and sensex current price ${marketData?.sensex} which will reflect or affect the Indian stock market tomorrow morning. Focus on Indian market momentum + global momentum. This prompt will be run every night to quickly check market & global cues.
NOTE: Do your reearch and use your real-time knowledge of today's closing data, news, FII/DII flows, global cues, commodities, geopolitics, earnings, RBI/policy updates, or any event that can move Nifty/Sensex at opening and incorporate that into the summary. Do NOT make up any news or data. Use only real, accurate information that you have access to right now.
Respond STRICTLY with ONLY a valid JSON object (no extra text, no markdown, no explanations). Use real-time knowledge of today's closing data, news, FII/DII flows, global cues, commodities, geopolitics, earnings, RBI/policy updates, or any event that can move Nifty/Sensex at opening.

The JSON must follow this exact structure:

  {
    "date": ${today},
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

export const generateStockInfographicPrompt = (
  marketData: any,
  rawNews: string,
  content: string,
) => {
  return `Create a high-resolution, clean, professional infographic image in Instagram portrait format (1080 × 1350 pixels, 4:5 ratio) for the data added at the last that looks EXACTLY like the reference image provided (same white background, same teal color accents, same box layout with two columns and three rows, same font style, same spacing, same thin connecting lines, same modern business infographic style).

Do NOT change the layout, colors, or structure. Only update the content inside.

Top centered title in large bold black font:  
"Daily Market Pulse: Indian Stocks & Global Cues"

Far left side (clearly visible, teal accent, top-left area):  
"Date: [Today’s current date in DD Month YYYY format]"

Right side middle (bold teal font, clearly visible):  
"@tsfinnews"

IMPORTANT INSTRUCTIONS:  
You have up-to-date knowledge of financial markets. Use the latest real-time data available to you right now (today’s Indian market close + global cues). Automatically fill every section with accurate, concise, real information. Do NOT ask me for any data. Do NOT use placeholders. Populate every box yourself with the most recent facts.

Fill the six boxes as follows:

1. Situation  
   Icon: teal rising stock chart / Nifty graph (simple flat icon)  
   Body text (large, clear, readable): Latest Indian market snapshot today — include Nifty 50 closing value + % change, Sensex closing value + % change, Bank Nifty performance, and one-line momentum summary.

2. Complication  
   Icon: teal newspaper / breaking news icon (simple flat icon)  
   Body text: The 3 most important Indian market news/events from today and their expected impact on tomorrow’s opening (use bullet points, keep very short and clear).

3. Stakeholders  
   Icon: teal rupee symbol with investors / money flow icon (simple flat icon)  
   Body text: Key flows and sectoral action today — FII & DII net buying/selling, top sectoral gainers and losers, or major corporate/news highlights (bullet points, concise).

4. Scope  
   Icon: teal globe / world market icon (simple flat icon)  
   Body text: Global market overview — US markets close (Dow, Nasdaq), Asian markets, Europe futures, Crude oil, Gold, USD/INR, and any other key global indices (concise summary).

5. Problem Statement  
   Icon: teal green upward arrow / bull icon (simple flat icon)  
   Body text: Positive global factors (UPSIDE) that can lift the Indian market tomorrow — list 2–4 key bullish cues in bullet points.

6. Hypotheses  
   Icon: teal red downward arrow / bear icon (simple flat icon)  
   Body text: Negative global factors (DOWNSIDE) that can pressure the Indian market tomorrow — list 2–4 key bearish cues in bullet points.

Rules:  
- All text must be crisp, large, highly legible, and well-balanced inside each box.  
- Use bullet points for readability.  
- Keep every box clean — no overcrowding.  
- Use real, accurate numbers and news only.  
- Generate the complete image directly with all sections filled. Do not output any extra text, explanations, or questions.

Here is the data ${marketData} and ${rawNews} and ${content} that you should use to populate the infographic with the most recent market information.

Now generate the image.`;
};
