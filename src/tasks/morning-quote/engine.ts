import dotenv from "dotenv/config";
import { generateQuoteImage } from "./generateQuoteImage.js";
import { QUOTE_DESCRIPTIONS } from "../../../lib/constants/morning-quote/index.js";
import { broadcastUpdate } from "../../core/social/facebook.js";
import { sendTelegramStockImage } from "../../core/notifier/telegram.js";

const runDailyQuoteEngine = async () => {
  try {
    const imageUrl = await generateQuoteImage();
    console.log(`🔗 Success! Image URL: ${imageUrl}`);
    // Usage in your script:
    const description = QUOTE_DESCRIPTIONS[
      Math.floor(Math.random() * QUOTE_DESCRIPTIONS.length)
    ] as any;
    await broadcastUpdate(
      imageUrl,
      { caption: description.instagramCaption },
      true,
    );
    // await sendTelegramStockImage(description, imageUrl, true);
  } catch (error) {
    console.error("runDailyQuoteEngine error:", (error as Error).message);
  }
};

runDailyQuoteEngine();
