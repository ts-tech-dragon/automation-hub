import "dotenv/config";
import { runDividendScrapper } from "./runDividendScrapper.js";
import { generateTop10DividendImage } from "./generateDividendPost.js";
import { DIVIDEND_POST_DESCRIPTION } from "../../../../lib/constants/nse-scrapper/index.js";
import { santizeDividendCaption } from "../../../../lib/helpers/index.js";
import { broadcastMultipleUpdates } from "../../../core/social/facebook.js";

const runDividendEngine = async () => {
  const dividendData = await runDividendScrapper();
  let diviendImgUrlArr = [];
  if (dividendData.length === 0) return;
  if (dividendData.length > 10) {
    const chunkSize = 10;
    for (let i = 0; i < dividendData.length; i += chunkSize) {
      const chunk = dividendData.slice(i, i + chunkSize);
      const earningsURL = await generateTop10DividendImage(chunk);
      diviendImgUrlArr.push(earningsURL);
    }
  } else {
    const diviendImageURL = await generateTop10DividendImage(dividendData);
    diviendImgUrlArr.push(diviendImageURL);
  }
  const description = DIVIDEND_POST_DESCRIPTION[
    Math.floor(Math.random() * DIVIDEND_POST_DESCRIPTION.length)
  ] as any;

  const fiveDividendData = dividendData.slice(0, 5);
  const { instagramCaption, xCaption, headline } = santizeDividendCaption(
    description,
    fiveDividendData,
  );
  await broadcastMultipleUpdates(diviendImgUrlArr, {
    caption: instagramCaption,
    xCaption: xCaption,
  });
};

runDividendEngine();
