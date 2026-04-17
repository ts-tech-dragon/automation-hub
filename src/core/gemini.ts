import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODELS, ENV_VARS } from "../../lib/constants/index.js";
import { extractJson, repairJSON } from "../../lib/helpers/index.js";
import { MOCK_BROKEN_RESPONESE } from "../../lib/constants/interview-prep/mocks.js";

// Initialize the new unified client
const ai = new GoogleGenAI({ apiKey: ENV_VARS.GEMINI_API_KEY });

const FALLBACK_CHAIN = [
  GEMINI_MODELS.FLASH_3,
  GEMINI_MODELS.FLASH_2_5,
  GEMINI_MODELS.FLASH_LITE_3_1,
  GEMINI_MODELS.LITE_2_5,
];

export async function askGemini(prompt: string, isJson = true) {
  let lastError = null;

  for (const modelName of FALLBACK_CHAIN) {
    try {
      console.log(`🤖 Attempting with: ${modelName}...`);

      const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: "user", parts: [{ text: prompt }] }], // You can just pass the raw string here in the new SDK

        // 🚀 ALL settings MUST be inside this 'config' object
        config: {
          responseMimeType: isJson ? "application/json" : "text/plain",
          // maxOutputTokens: 8192, // 🚀 Bump this to 4k to allow full code solutions
          temperature: 0.1,
        },
      });

      // const response = MOCK_BROKEN_RESPONESE;

      const rawText = response.text || "";

      if (!rawText) throw new Error("EMPTY_RESPONSE");

      if (isJson) {
        try {
          // If it's already an object, just return it
          if (typeof rawText === "object") return rawText;

          return repairJSON(rawText);
        } catch (e) {
          console.error("❌ JSON Parse Failed. Check AI output above.");
          throw new Error(`INVALID_JSON: ${(e as Error).message}`);
        }
      }

      return rawText;
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

const IMAGE_FALLBACK_CHAIN = [
  GEMINI_MODELS.IMAGE_3_1,
  GEMINI_MODELS.FLASH_IMAGE_2_5,
];
export async function generateGemini(prompt: string) {
  let lastError = null;
  for (const modelName of IMAGE_FALLBACK_CHAIN) {
    try {
      console.log(`🤖 Attempting generation with: ${modelName}...`);
      // Ensure your wrapper 'generateGemini' is using the IMAGE_MODEL above
      const response: any = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        // 💡 Tip: You can specify aspect ratios here in the new SDK
        config: {
          aspectRatio: "4:5", // Perfect for Instagram Portrait
          outputMimeType: "image/png",
        } as any,
      });
      return response; // Adjust this based on how your wrapper processes image responses
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
  console.error("💀 All Gemini image models failed:", lastError);
  throw lastError;
}
