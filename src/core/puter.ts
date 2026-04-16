import "dotenv/config";
import fs from "node:fs";
import { init } from "@heyputer/puter.js/src/init.cjs";
import type { Puter } from "@heyputer/puter.js";
import { generateStockInfographicPrompt } from "../../lib/helpers/prompts.js";
import { ENV_VARS, PUTER_MODELS } from "../../lib/constants/index.js";

const puterAuthToken = ENV_VARS.PUTER_API_KEY || "";

export const puter = init(puterAuthToken) as Puter;

async function puterGenerateImage() {
  try {
    // This will open your browser for login (only once)
    // const models = await puter.ai.listModels();

    const prompt = generateStockInfographicPrompt("", "");
    const result: any = await puter.ai.txt2img(prompt, {
      model: PUTER_MODELS.GPT_1_5,
      quality: "high",
      response_format: "base64",
    });

    const buffer = Buffer.from(result, "base64");
    await fs.writeFileSync("market-infographic.png", buffer);

    console.log("✅ Image saved as market-infographic.png");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

puterGenerateImage();
