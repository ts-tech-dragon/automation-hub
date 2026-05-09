import "dotenv/config";
import { getTimeInIST } from "../../../../lib/helpers/index.js";
import { getAfterMarketHrsResults } from "../../../db/services/index.js";
import { generateAfterHrsImage } from "./generateAfterHrsImage.js";
import { broadcastMultipleUpdates } from "../../../core/social/facebook.js";
import { sendTelegramStockGallery } from "../../../core/notifier/telegram.js";
import { closeDB } from "../../../db/index.js";
import { PRE_MARKET_EARNINGS_POSTS } from "../../../../lib/constants/nse-scrapper/index.js";

const runAfterMarekerHoursEngine = async () => {
  const yesterday = getTimeInIST("DD MMMM YYYY", 1);

  try {
    const results = (await getAfterMarketHrsResults()) as any[];
    if (results.length === 0) {
      console.log("No stocks found for after market hours update.");
      await closeDB();
      return;
    }
    console.log("Running After Market Hours Engine...");
    const imageURLArr = [];

    for (let i = 0; i < results.length; i += 5) {
      const chunk = results.slice(i, i + 5);
      const imageURL = await generateAfterHrsImage(chunk, yesterday);
      imageURLArr.push(imageURL);
    }

    if (imageURLArr.length === 0) return null;
    console.log("Generated images for after market hours updated.");

    const description = PRE_MARKET_EARNINGS_POSTS[
      Math.floor(Math.random() * PRE_MARKET_EARNINGS_POSTS.length)
    ] as any;
    await broadcastMultipleUpdates(imageURLArr, {
      caption: description.instagramCaption,
    });
    await sendTelegramStockGallery(description, imageURLArr, true);
    await closeDB();
  } catch (error) {
    console.log(
      "runAfterMarekerHoursEngine Error : ",
      (error as Error).message,
    );
  }
};

runAfterMarekerHoursEngine();
