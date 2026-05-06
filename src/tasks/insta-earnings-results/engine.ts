import "dotenv/config";
import { EARNING_POST_DESCRIPTION } from "../../../lib/constants/insta-earning-results/index.js";
import { EARNINGS_MOCK_DATA } from "../../../lib/constants/insta-earning-results/mock.js";
import { sendTelegramStockImage } from "../../core/notifier/telegram.js";
import { concallEarningsFetcher } from "./concall-fetcher.js";
import { generateEarningsImage } from "./generateEarningImage.js";
import { isAfter6PMInIST } from "../../../lib/helpers/index.js";
import { broadcastUpdate } from "../../core/social/facebook.js";

async function runEarningsGenerator() {
  try {
    const isEPSRequired = isAfter6PMInIST();

    const earningResult: any = await concallEarningsFetcher();
    // const earningResult: any = EARNINGS_MOCK_DATA;

    const earningsURL = await generateEarningsImage(earningResult, false);

    if (earningsURL) {
      const description = `${EARNING_POST_DESCRIPTION.headline}\n${EARNING_POST_DESCRIPTION.caption}`;
      await broadcastUpdate(earningsURL, { caption: description });
      await sendTelegramStockImage(EARNING_POST_DESCRIPTION, earningsURL, true);
    }
  } catch (error) {
    console.log("runEarningsGenerator Error : ", (error as Error).message);
  }
}

runEarningsGenerator();
