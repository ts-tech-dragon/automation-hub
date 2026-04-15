import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODELS, ENV_VARS } from "../../lib/constants/index.js";
import { extractJson } from "../../lib/helpers/index.js";

// Initialize the new unified client
const ai = new GoogleGenAI({ apiKey: ENV_VARS.GEMINI_API_KEY });

const FALLBACK_CHAIN = [
  GEMINI_MODELS.FLASH_3,
  GEMINI_MODELS.FLASH_2_5,
  GEMINI_MODELS.FLASH_LITE_3_1,
];

export async function askGemini(prompt: string, isJson = true) {
  let lastError = null;

  for (const modelName of FALLBACK_CHAIN) {
    try {
      console.log(`🤖 Attempting with: ${modelName}...`);

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt, // You can just pass the raw string here in the new SDK

        // 🚀 ALL settings MUST be inside this 'config' object
        config: {
          responseMimeType: isJson ? "application/json" : "text/plain",
          maxOutputTokens: 1500,
          temperature: 0.1,
        },
      });

      const rawText = response.text || "";

      if (!rawText) throw new Error("EMPTY_RESPONSE");

      return isJson ? extractJson(rawText) : rawText;
    } catch (error: any) {
      // ... your existing error handling ...
      lastError = error;
      const status = error.status;

      if (
        status === 503 ||
        status === 429 ||
        error.message === "EMPTY_RESPONSE"
      ) {
        console.warn(
          `⚠️ ${modelName} failed (${status || "Empty"}). Trying fallback...`,
        );
        continue;
      }
      throw error;
    }
  }

  console.error("💀 All Gemini models are currently unavailable.");
  throw lastError;
}
