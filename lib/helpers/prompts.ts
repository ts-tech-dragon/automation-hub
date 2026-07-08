import { getFormatedTodayDate } from "./index.js";

export const getDailyStockSummaryPrompt = (
  marketData: any,
  rawNews: string,
) => {
  const today = getFormatedTodayDate();

  return `
You are an expert Indian stock market analyst creating a professional Instagram "Market Wrap" infographic.

Today's Date: ${today}

Market Data:
- Nifty 50: ${marketData?.nifty}
- Sensex: ${marketData?.sensex}
- Brent Crude: ${marketData?.crudeOil}
- USD/INR: ${marketData?.inr}
- India VIX: ${marketData?.indiaVix}

News Feed:
${rawNews}

====================================================

OBJECTIVE

Create a concise, data-driven summary of EVERYTHING IMPORTANT that happened in today's Indian stock market.

This is NOT a prediction for tomorrow.

This is a MARKET WRAP summarizing today's session.

Use only real and verified information.

Do not invent any news or numbers.

====================================================

CONTENT GUIDELINES

• Use today's market closing data.
• Include the biggest Indian market news.
• Include major global cues that affected today's market.
• Mention important FII/DII activity if available.
• Mention the best and worst performing sectors.
• Mention important commodities or currency moves only if significant.
• Avoid paragraphs.
• Every sentence should be short and easy to read.
• Keep all text optimized for an Instagram infographic.

====================================================

RESPOND ONLY AS JSON

{
  "date": "${today}",

  "headline": "Powerful headline within 6-8 words summarizing today's market",

  "points": [
    "Biggest market-moving event today (max 12 words)",
    "Second biggest event today (max 12 words)",
    "Third biggest event today (max 12 words)",
    "Best performing sector or stock (max 8 words)",
    "Worst performing sector or stock (max 8 words)",
    "Important global cue today (max 10 words)"
  ],

  "indian_momentum": "One short sentence (maximum 18 words) describing today's Indian market close including Nifty, Sensex and overall sentiment.",

  "global_momentum": "One short sentence (maximum 18 words) summarizing today's global market, crude oil, USDINR and VIX.",

  "overall_impact": "One sentence (maximum 12 words) summarizing today's overall market mood using Bullish, Bearish or Neutral.",

  "caption": "Create an engaging X (Twitter) caption under 260 characters. Include Nifty, Sensex, Brent, USDINR and India VIX values with 🔼🔻 emojis. End with exactly three hashtags: #Nifty50 #Sensex #StockMarket"
}

IMPORTANT

- Return ONLY valid JSON.
- No markdown.
- No explanations.
- No extra keys.
- Never predict tomorrow.
- Never mention support/resistance.
- Never mention expected opening.
`;
};

export const generateStockInfographicPrompt = (
  marketData: any,
  rawNews: string,
) => {
  const today = getFormatedTodayDate();
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

Here is the data summary of the most important things that happened TODAY (${today}) in indian stock market (use the current date) including ${rawNews} and Nifty current price ${marketData?.nifty}, sensex current price ${marketData?.sensex}, brent crude oil current price ${marketData?.crudeOil}, inr current price ${marketData?.inr}, and india vix current price ${marketData?.indiaVix} that you should use to populate the infographic with the most recent market information.

Now generate the image.`;
};
