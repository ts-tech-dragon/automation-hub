import fs from "node:fs";
import path from "node:path";
import { generateGemini } from "../../core/gemini.js";
import { generateStockInfographicPrompt } from "../../../lib/helpers/prompts.js";

export const generateStockSummaryImage = async (
  marketData: any,
  rawNews: string,
  content: string,
) => {
  try {
    // 1. Generate the infographic using Gemini's image generation capabilities
    const prompt = generateStockInfographicPrompt(marketData, rawNews, content);
    const imageResponse: any = await generateGemini(prompt);
    const candidate = imageResponse.candidates?.[0];
    if (!candidate) throw new Error("NO_CANDIDATE_RETURNED");

    // 🔍 In 2026, Gemini returns images as 'inlineData' parts
    for (const part of candidate.content.parts) {
      if (part.text) {
        console.log("📝 Model Note:", part.text);
      } else if (part.inlineData) {
        const b64Data = part.inlineData.data;
        const buffer = Buffer.from(b64Data, "base64");

        const fileName = `market-summary-${Date.now()}.png`;
        fs.writeFileSync(fileName, buffer);
        const outputPath = path.resolve(fileName);

        console.log(`✅ Image successfully saved as: ${fileName}`);
        return outputPath;
      }
    }
  } catch (error) {
    console.error(
      "generateStockSummaryImage:Error generating stock summary image:",
      error,
    );
    throw error;
  }
};
