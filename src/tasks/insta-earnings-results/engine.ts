import "dotenv/config";
import { EARNING_POST_DESCRIPTION } from "../../../lib/constants/insta-earning-results/index.js";
import { EARNINGS_MOCK_DATA } from "../../../lib/constants/insta-earning-results/mock.js";
import { sendTelegramStockImage } from "../../core/notifier/telegram.js";
import { concallEarningsFetcher } from "./concall-fetcher.js";
import { generateEarningsImage } from "./generateEarningImage.js";

async function runEarningsGenerator() {
  try {
    const earningResult: any = await concallEarningsFetcher();
    // const earningResult = EARNINGsS_MOCK_DATA;
    const earningsURL = await generateEarningsImage(earningResult);
    if (earningsURL) {
      await sendTelegramStockImage(EARNING_POST_DESCRIPTION, earningsURL, true);
    }
  } catch (error) {}
}

runEarningsGenerator();
