import { getTimeInIST, isAfter330PMInIST } from "../../../lib/helpers/index.js";
import { runNSEScrapper } from "./nseScrapper.js";
import {
  NSE_MOCK_DATA,
  NSE_RESULT_GEMINI_MOCK,
} from "../../../lib/constants/nse-scrapper/mock.js";
import { processBatchNsePdfs } from "./processNsePdf.js";
import { formatNSEResultMessage } from "../../../lib/helpers/nse-results/index.js";
import { sendNSEResultTelegramNotification } from "../../core/notifier/telegram.js";
import {
  sendErrorToDiscord,
  sendNSEResultDiscordNotification,
} from "../../core/notifier/discord.js";
import { CONCALL_MOCK_RESPONSE } from "../../../lib/constants/insta-earning-results/mock.js";
import { saveDailyResults } from "../../db/services/index.js";
import { closeDB } from "../../db/index.js";

const sessionStocks = new Set<String>();

const runNSEEngine = async () => {
  const dataTime = getTimeInIST("DD-MMM-YYYY HH");
  //   const dataTime = "29-Apr-2026 22";

  try {
    const financialResult = await runNSEScrapper();
    // const financialResult = NSE_MOCK_DATA;

    const oneHourResult = financialResult.filter((result: any) => {
      const dateTimeMatch = result.an_dt.includes(dataTime);

      if (dateTimeMatch) return result;
    });

    // 2. Correctly extract ONLY new PDF URLs (removing undefineds)
    const newResults = oneHourResult.filter((item: any) => {
      if (!sessionStocks.has(item.symbol)) {
        sessionStocks.add(item.symbol);
        return item;
      }
    });

    if (newResults.length === 0) {
      return console.log("No New Results Found in this tick.");
    }

    const pdfURLs = newResults.map((item: any) => item.attchmntFile);

    const geminiResponse = await processBatchNsePdfs(pdfURLs);
    // const geminiResponse = NSE_RESULT_GEMINI_MOCK;

    await saveDailyResults(geminiResponse);
    pdfURLs.forEach(async (url: string, index: number) => {
      await sendNSEResultDiscordNotification(geminiResponse[index], url);
      const formatedMsg = formatNSEResultMessage(geminiResponse[index]);
      await sendNSEResultTelegramNotification(formatedMsg, url);
      console.log("Results Send Successfully!!!");
    });
  } catch (error) {
    console.log("RUN NSE Scrapper : ", (error as Error).message);
    sendErrorToDiscord(error, "NSE RESULT ERROR");
  }
};

const oneTimeRunner = async () => {
  try {
    await runNSEEngine();
    // 4. Close DB ONLY once the entire 1-hour session is finished
    await closeDB();
    console.log("🏁 Connection Closed.");
  } catch (error) {
    console.log("oneTimeRunner engine error : ", (error as Error).message);
  }
};

const RUN_DURATION = 60 * 60 * 1000; // 1 hour
const SLEEP_INTERVAL = 5 * 60 * 1000; // 5 minutes

async function monitorMarketEngine() {
  if (isAfter330PMInIST()) return await oneTimeRunner();
  const startTime = Date.now();
  console.log("🚀 Starting NSE Monitoring Session...");
  while (Date.now() - startTime < RUN_DURATION) {
    try {
      console.log(`\n🔍 Tick: ${new Date().toLocaleTimeString("en-IN")}`);
      await runNSEEngine();
      console.log(
        `😴 Sleeping for 5m. Total runtime: ${Math.round((Date.now() - startTime) / 60000)} mins`,
      );
      await new Promise((resolve) => setTimeout(resolve, SLEEP_INTERVAL));
    } catch (error) {
      console.log("monitorMarketEngine error : ", (error as Error).message);
    }
  }
  // 4. Close DB ONLY once the entire 1-hour session is finished
  await closeDB();
  console.log("🏁 1-hour session complete. Connection Closed.");
}

monitorMarketEngine();
