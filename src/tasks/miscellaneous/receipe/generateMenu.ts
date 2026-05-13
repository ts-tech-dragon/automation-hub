import { askGemini } from "../../../core/gemini.js";

export async function generateDailyMenu(prompt: string) {
  const result = await askGemini(prompt, false);
  const tamilMessage = result;

  // Now pass 'tamilMessage' to your WhatsApp function
  return tamilMessage;
}
