import "dotenv/config"; // To load your GEMINI_API_KEY from .env
import { getDailyStockSummaryPrompt } from "../../../lib/helpers/prompts.js";
import type { marketData } from "../../../types/index.js";
import { askGemini } from "../../core/gemini.js";

export async function main(marketData: marketData, newsHeadlines: string) {
  try {
    console.log("📡 Connecting to Gemini 3 Flash...");
    const prompt = getDailyStockSummaryPrompt(marketData, newsHeadlines);
    const response = await askGemini(prompt, true);

    return response;
  } catch (error: unknown) {
    console.error("❌ Error connecting to Gemini:", (error as Error).message);
    throw error;
  }
}
