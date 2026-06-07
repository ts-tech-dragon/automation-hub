import dotenv from "dotenv/config";
import axios from "axios";
import { generateQuoteImage } from "./generateQuoteImage.js";
import { QUOTE_DESCRIPTIONS } from "../../../lib/constants/morning-quote/index.js";
import { broadcastUpdate } from "../../core/social/facebook.js";
import { sendTelegramStockImage } from "../../core/notifier/telegram.js";
import { sanitizeSocialPostDescription } from "../../../lib/helpers/index.js";

const runDailyQuoteEngine = async () => {
  try {
    const response = await axios.get("https://zenquotes.io/api/random");
    const quote = response.data?.[0];
    const imageUrl = await generateQuoteImage(quote);
    console.log(`🔗 Success! Image URL: ${imageUrl}`);
    // Usage in your script:
    const description = QUOTE_DESCRIPTIONS[
      Math.floor(Math.random() * QUOTE_DESCRIPTIONS.length)
    ] as any;

    const { instagramCaption, xCaption, headline } =
      sanitizeSocialPostDescription(description, quote.q);

    await broadcastUpdate(
      imageUrl,
      { caption: instagramCaption, xCaption },
      true,
    );
    // await sendTelegramStockImage({ headline, xCaption }, imageUrl, true);
  } catch (error) {
    console.error("runDailyQuoteEngine error:", (error as Error).message);
  }
};

runDailyQuoteEngine();
