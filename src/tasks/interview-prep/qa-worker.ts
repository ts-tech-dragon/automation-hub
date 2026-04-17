import "dotenv/config";
import { ENV_VARS } from "../../../lib/constants/index.js";
import { MOCK_QA_RESPONSE } from "../../../lib/constants/interview-prep/mocks.js";
import { getRandomTech } from "../../../lib/helpers/interview-prep/index.js";
import { getTenQAPrompt } from "../../../lib/helpers/interview-prep/prompts.js";
import { askGemini } from "../../core/gemini.js";

export async function generateQA(tech?: string) {
  if (ENV_VARS.MOCK_GEMINI === "true") {
    return {
      ...MOCK_QA_RESPONSE,
      tech,
    };
  }
  try {
    tech = tech ?? getRandomTech();
    const prompt = getTenQAPrompt(tech);
    const qaData = await askGemini(prompt, true);
    console.log(`Generated Q&A 📃📃📃`);
    return qaData;
  } catch (error) {
    console.log("Error generating Q&A:", (error as Error).message);
    throw error;
  }
}
