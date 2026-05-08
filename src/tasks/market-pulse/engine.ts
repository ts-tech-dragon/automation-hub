import "dotenv/config";
import { getMarketAuxData } from "./market-aux.js";
import { generateMarketPulseImage } from "./generateMarketPulseImage.js";
import { MARKET_PULSE_MOCK_DATA } from "../../../lib/constants/market-pulse/mock.js";
import { getTimeInIST } from "../../../lib/helpers/index.js";
import { MARKET_PULSE_CAPTIONS } from "../../../lib/constants/market-pulse/index.js";
import { sendTelegramStockGallery } from "../../core/notifier/telegram.js";
import { broadcastMultipleUpdates } from "../../core/social/facebook.js";

const runMarketPulseEngine = async () => {
  const TODAY = getTimeInIST("DD MMMM YYYY");
  const data = await getMarketAuxData();
  //   const data = MARKET_PULSE_MOCK_DATA as any;
  if (!data.data || data.data.length === 0) {
    console.log("No news data available for today.");
    return;
  }
  const imageURLArr = [];
  const description: any =
    MARKET_PULSE_CAPTIONS[
      Math.floor(Math.random() * MARKET_PULSE_CAPTIONS.length)
    ];

  for (const item of data.data) {
    const imageUrl = await generateMarketPulseImage(item, TODAY);
    console.log(`Generated Market Pulse image URL: ${imageUrl}`);
    imageURLArr.push(imageUrl);
  }
  await broadcastMultipleUpdates(imageURLArr, {
    caption: description?.instagramCaption,
  });
  //   await sendTelegramStockGallery(description, imageURLArr, true);
};

runMarketPulseEngine();
