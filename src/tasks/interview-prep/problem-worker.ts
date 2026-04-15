import { MOCK_PROBLEM_RESPONSE } from "../../../lib/constants/interview-prep/mocks.js";
import { getRandomTech } from "../../../lib/helpers/interview-prep/index.js";
import { getInterviewProblemPrompt } from "../../../lib/helpers/interview-prep/prompts.js";
import { askGemini } from "../../core/gemini.js";

export async function generateProblemWorker(tech?: string) {
  if (process.env.MOCK_GEMINI === "true") return MOCK_PROBLEM_RESPONSE;
  try {
    tech = tech ?? getRandomTech();
    const prompt = getInterviewProblemPrompt(tech);
    const problemData = await askGemini(prompt, true);
    console.log(`Generated problem 🧠🧠🧠`);
    return problemData;
  } catch (error) {
    console.log("Error generating problem : ", (error as Error).message);
    throw error;
  }
}

generateProblemWorker();
