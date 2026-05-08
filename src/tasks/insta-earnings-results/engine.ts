import "dotenv/config";
import { EARNING_POST_DESCRIPTION } from "../../../lib/constants/insta-earning-results/index.js";
import { EARNINGS_MOCK_DATA } from "../../../lib/constants/insta-earning-results/mock.js";
import { sendTelegramStockGallery } from "../../core/notifier/telegram.js";
import { concallEarningsFetcher } from "./concall-fetcher.js";
import { generateEarningsImage } from "./generateEarningImage.js";
import { isAfter6PMInIST } from "../../../lib/helpers/index.js";
import { broadcastMultipleUpdates } from "../../core/social/facebook.js";
import { syncConcallDataToDB } from "../../db/services/index.js";
import { closeDB } from "../../db/index.js";

async function runEarningsGenerator() {
  try {
    const isEPSRequired = isAfter6PMInIST();

    let earningResult: any = await concallEarningsFetcher();
    // let earningResult: any = EARNINGS_MOCK_DATA;

    if (isEPSRequired) {
      earningResult = earningResult.filter((item: { eps: string }) => {
        if (Boolean(item.eps)) return item;
      });
    }

    const earningsURLArr = [];

    if (earningResult.length > 10) {
      const chunkSize = 10;
      for (let i = 0; i < earningResult.length; i += chunkSize) {
        const chunk = earningResult.slice(i, i + chunkSize);
        const earningsURL = await generateEarningsImage(chunk, isEPSRequired);
        earningsURLArr.push(earningsURL);
      }
    } else {
      const earningsURL = await generateEarningsImage(
        earningResult,
        isEPSRequired,
      );
      earningsURLArr.push(earningsURL);
    }

    if (earningsURLArr.length === 0) return null;

    const description = `${EARNING_POST_DESCRIPTION.headline}\n${EARNING_POST_DESCRIPTION.caption}`;
    await broadcastMultipleUpdates(earningsURLArr, { caption: description });
    await sendTelegramStockGallery(
      EARNING_POST_DESCRIPTION,
      earningsURLArr,
      true,
    );
    await syncConcallDataToDB(earningResult);

    await closeDB();
  } catch (error) {
    console.log("runEarningsGenerator Error : ", (error as Error).message);
  }
}

runEarningsGenerator();
