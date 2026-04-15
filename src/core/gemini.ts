import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODELS, ENV_VARS } from "../../lib/constants/index.js";

const ai = new GoogleGenAI({ apiKey: ENV_VARS.GEMINI_API_KEY });

/**
 * Common Gemini Worker
 * @param prompt - The instruction for the AI
 * @param isJson - Whether to parse the output as JSON (default: true)
 * @param model - The specific model to use
 */

// The order of models to try if one fails
const FALLBACK_CHAIN = [
  GEMINI_MODELS.FLASH_3, // Try the latest first
  GEMINI_MODELS.FLASH_2_5, // Fallback to stable
  GEMINI_MODELS.FLASH_LITE_3_1, // Last resort (highest quota)
];

export async function askGemini(prompt: string, isJson = true) {
  let lastError = null;

  for (const model of FALLBACK_CHAIN) {
    try {
      console.log(`🤖 Attempting with: ${model}...`);

      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
      });

      const rawText = response.text as string;
      const cleanJson = rawText.replace(/```json|```/g, "").trim();

      return isJson ? JSON.parse(cleanJson) : rawText;
    } catch (error: any) {
      lastError = error;
      const status = error.status;

      // If it's a 503 (Busy) or 429 (Quota), try the next model in the chain
      if (status === 503 || status === 429) {
        console.warn(
          `⚠️ ${model} is ${status === 503 ? "busy" : "exhausted"}. Trying fallback...`,
        );
        continue;
      }

      // If it's a different error (like a syntax error in your prompt), stop immediately
      throw error;
    }
  }

  // If we get here, all models in the chain failed
  console.error("💀 All Gemini models are currently unavailable.");
  throw lastError;
}
